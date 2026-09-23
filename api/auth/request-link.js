/* POST /api/auth/request-link — the whole of signup and the whole of login.
 *
 * There is no separate "register" path on purpose, and the reader is never
 * asked which of the two they are, or for a password.
 *
 *   - A new address is signed in on the spot. It gets an account and a
 *     session, and no email: there is nothing in a brand-new account for a
 *     stranger to take, so making somebody go to their inbox first buys
 *     nothing. verify.js closes the one gap this leaves — see there.
 *   - An address we already know gets a link, as it always has. Signing in
 *     whoever typed a known address would hand them that reader's account.
 *
 * Accepts JSON (from the scripts on /, /7stories and /login) and
 * form-encoded (from the same forms when the script did not run). It answers
 * in kind: JSON to JSON, a redirect for a real form post.
 */

const { userForEmail } = require("../_lib/users");
const { sql } = require("../_lib/db");
const { issueLoginToken, startSession, LINK_MINUTES, sweep } = require("../_lib/session");
const { sendLoginLink } = require("../_lib/email");
const {
  SITE_URL, json, methodNotAllowed, readBody, wantsHTML, redirect,
  clientIP, normaliseEmail, sameOrigin
} = require("../_lib/http");

/* Only ever a path on this site, never an absolute URL a stranger supplied —
   an open redirect on the end of a login link is how accounts get taken. */
function safeNext(value) {
  const next = String(value || "");
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function ages(value) {
  const list = [].concat(value == null ? [] : value)
    .map(v => String(v).trim())
    .filter(Boolean)
    .slice(0, 8);
  return list;
}

/* Signing a new address straight in is only safe because verify.js signs
   out everybody else the first time the owner uses a link, and that needs
   users.email_verified_at. Until schema.sql has been re-run on a database,
   new addresses get a link like everybody else: the old behaviour, never a
   broken one. */
async function canProveLater(userId) {
  try {
    await sql`select email_verified_at from users where id = ${userId}`;
    return true;
  } catch (e) {
    if (e.code !== "42703") throw e;
    console.error("request-link: users.email_verified_at is missing — re-run db/schema.sql");
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  const body = await readBody(req);
  const html = wantsHTML(req);
  const email = normaliseEmail(body.email);
  const firstName = String(body.firstName || "").trim().slice(0, 80) || null;
  const childAges = ages(body.childAges);
  const source = String(body.source || "").slice(0, 120) || null;
  const next = safeNext(body.next);

  if (!email) {
    if (html) return redirect(res, "/login?error=email");
    return json(res, 400, { error: "invalid_email", message: "That email address does not look right." });
  }

  const user = await userForEmail(email, { firstName, childAges, source });

  /* New here: straight in. Only from a page on this site, so another site's
     form cannot sign a visitor into an account it made; anything else falls
     through to the link, which is always safe. */
  if (user.is_new && sameOrigin(req) && await canProveLater(user.id)) {
    await startSession(res, user.id, req.headers["user-agent"]);
    await sql`update users set last_seen_at = now() where id = ${user.id}`;
    const to = next || "/account#welcome";
    if (html) return redirect(res, to);
    return json(res, 200, { ok: true, email, signedIn: true, next: to, isNew: true });
  }

  const token = await issueLoginToken(user.id, { redirectTo: next, ip: clientIP(req) });
  if (!token) {
    const message = "We have already sent several links to that address. " +
      "Check your inbox, including spam, before asking for another.";
    if (html) return redirect(res, "/login?error=toomany");
    return json(res, 429, { error: "too_many_requests", message });
  }

  const url = `${SITE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
  let delivered = true;
  try {
    const result = await sendLoginLink({
      to: email, url, firstName: user.first_name,
      minutes: LINK_MINUTES, isNew: user.is_new
    });
    delivered = result.delivered;
  } catch (e) {
    /* The account exists either way, so say so rather than pretending. */
    console.error("login link failed to send:", e.message);
    if (html) return redirect(res, "/login?error=send");
    return json(res, 502, {
      error: "send_failed",
      message: "We could not send the email just now. Try again in a moment."
    });
  }

  sweep().catch(() => {});   /* housekeeping, never the reader's problem */

  if (html) return redirect(res, `/login?sent=${encodeURIComponent(email)}`);
  return json(res, 200, { ok: true, email, delivered, isNew: user.is_new });
};
