/* POST /api/auth/request-link — the whole of signup and the whole of login.
 *
 * There is no separate "register" path on purpose. A first-time address gets
 * an account and a link; a returning one gets a link. The reader is never
 * asked which of the two they are, and never asked for a password.
 *
 * Accepts JSON (from the scripts on /, /7stories and /login) and
 * form-encoded (from the same forms when the script did not run). It answers
 * in kind: JSON to JSON, a redirect back to the page for a real form post.
 */

const { sql } = require("../_lib/db");
const { issueLoginToken, LINK_MINUTES, sweep } = require("../_lib/session");
const { sendLoginLink } = require("../_lib/email");
const {
  SITE_URL, json, methodNotAllowed, readBody, wantsHTML, redirect,
  clientIP, normaliseEmail
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

  /* One statement so a double submit cannot make two accounts. A name or an
     age range already on file is never overwritten by a blank one. */
  const user = await sql.one`
    insert into users (email, first_name, child_ages, source)
    values (${email}, ${firstName}, ${childAges}, ${source})
    on conflict (email) do update
      set first_name = coalesce(users.first_name, excluded.first_name),
          child_ages = case when cardinality(users.child_ages) = 0
                            then excluded.child_ages else users.child_ages end
    returning id, first_name, (xmax = 0) as is_new`;

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
