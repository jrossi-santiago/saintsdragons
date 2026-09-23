/* POST /api/account/email — move the account to another address.
 *
 * For the typo made at signup. A new address is signed straight in without
 * proving it (see api/auth/request-link.js), so "you@gmial.com" can pay and
 * only find out when the receipt never comes. This is the way out.
 *
 * Nothing changes here. A link goes to the new address, and the account
 * moves to it only when that link is opened (api/auth/verify.js), at which
 * point the address is proved. Changing it on the spot would let whoever is
 * signed in put any address they like on an account, and have Stripe mail
 * receipts to it, with nobody showing it is theirs.
 *
 * An address that already has its own account is refused rather than
 * merged: two readers' histories and payments do not become one because
 * somebody typed the other's address.
 */

const { sql } = require("../_lib/db");
const { currentUser, issueLoginToken, LINK_MINUTES } = require("../_lib/session");
const { sendChangeEmailLink } = require("../_lib/email");
const { SITE_URL, json, methodNotAllowed, readBody, clientIP, normaliseEmail, sameOrigin } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!sameOrigin(req)) return json(res, 403, { error: "wrong_origin" });

  const user = await currentUser(req);
  if (!user) return json(res, 401, { error: "not_signed_in" });

  const body = await readBody(req);
  const email = normaliseEmail(body.email);
  if (!email) {
    return json(res, 400, { error: "invalid_email", message: "That email address does not look right." });
  }
  if (email === user.email) {
    return json(res, 400, { error: "same_email", message: "That is already the address on your account." });
  }
  const taken = await sql.one`select 1 as yes from users where email = ${email}`;
  if (taken) {
    return json(res, 409, { error: "email_taken",
      message: "That address already has its own account here, so it cannot be moved onto this one." });
  }

  /* One pending change at a time: an older link to a different new address
     stops working once a newer one is asked for. */
  let token;
  try {
    await sql`
      update login_tokens set used_at = now()
       where user_id = ${user.id} and new_email is not null and used_at is null`;
    token = await issueLoginToken(user.id, { redirectTo: "/account?email=changed#account", ip: clientIP(req), newEmail: email });
  } catch (e) {
    if (e.code !== "42703") throw e;
    console.error("account/email: login_tokens.new_email is missing — re-run db/schema.sql");
    return json(res, 503, { error: "not_ready",
      message: "Changing your address is not switched on yet. Reply to any of our emails and we will change it for you." });
  }
  if (!token) {
    return json(res, 429, { error: "too_many_requests",
      message: "We have sent several links in the last hour. Check that inbox, including spam, before asking for another." });
  }

  const url = `${SITE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;
  let delivered;
  try {
    ({ delivered } = await sendChangeEmailLink({ to: email, url, firstName: user.firstName, minutes: LINK_MINUTES }));
  } catch (e) {
    console.error("change-email link failed to send:", e.message);
    return json(res, 502, { error: "send_failed", message: "We could not send the email just now. Try again in a moment." });
  }

  return json(res, 200, { ok: true, email, delivered });
};
