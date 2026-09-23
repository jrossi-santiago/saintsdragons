/* GET /api/auth/verify?token=… — the other end of the magic link.
 *
 * Spends the token, starts a session, and sends the reader where they were
 * going. Never renders anything itself: a failure goes back to /login with a
 * reason, so there is one page that explains itself and one place to style.
 */

const { sql } = require("../_lib/db");
const { consumeLoginToken, startSession } = require("../_lib/session");
const { stripe } = require("../_lib/stripe");
const { redirect, methodNotAllowed } = require("../_lib/http");

/* A link from "Change it" (api/account/email.js): opening it proves the new
   address, so the account moves there and counts as proved. It proves
   nothing about the old address, so the first-proof sign-out below is not
   for this; the reader who asked is the one signed in, and stays so.
   False when somebody else has taken the address since the link was sent. */
async function moveTo(userId, email) {
  let moved;
  try {
    moved = await sql.one`
      update users set email = ${email}, email_verified_at = now()
       where id = ${userId}
      returning stripe_customer_id`;
  } catch (e) {
    if (e.code === "23505") return false;   /* unique: that address is an account now */
    throw e;
  }
  /* Receipts come from Stripe, from the address on the customer. The
     account has moved either way; a failure here is logged, not shown. */
  if (moved && moved.stripe_customer_id) {
    await stripe().customers.update(moved.stripe_customer_id, { email })
      .catch(e => console.error(`verify: Stripe customer email not updated for ${userId}:`, e.message));
  }
  return true;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const url = new URL(req.url, "http://localhost");
  const token = url.searchParams.get("token");

  const row = await consumeLoginToken(token);
  if (!row) {
    /* Expired, already used, or never real — all the same to the reader,
       and all fixed the same way: ask for another. */
    return redirect(res, "/login?error=expired", 302);
  }

  if (row.new_email) {
    if (!(await moveTo(row.user_id, row.new_email))) return redirect(res, "/login?error=taken", 302);
    await startSession(res, row.user_id, req.headers["user-agent"]);
    return redirect(res, row.redirect_to || "/account#account", 302);
  }

  /* The first link this address has ever used is the first proof that the
     person holding it owns it. A new address is signed in without that proof
     (see request-link), so somebody else may have made this account first
     and still hold a session on it. End every one of them before starting
     the owner's. Only the first time: after that, a link is an ordinary
     login and the reader's other devices stay signed in. */
  let proving = null;
  try {
    proving = await sql.one`
      update users set email_verified_at = now()
       where id = ${row.user_id} and email_verified_at is null
      returning id`;
  } catch (e) {
    /* 42703: the column is not there yet — schema.sql has not been re-run
       on this database. A login must never fail over that; request-link
       does not sign anybody in without a link until it has, so there is
       nothing to sign out. /api/health names the missing column. */
    if (e.code !== "42703") throw e;
    console.error("verify: users.email_verified_at is missing — re-run db/schema.sql");
  }
  if (proving) await sql`delete from sessions where user_id = ${row.user_id}`;

  await startSession(res, row.user_id, req.headers["user-agent"]);
  await sql`update users set last_seen_at = now() where id = ${row.user_id}`;

  const user = await sql.one`
    select onboarded_at, first_name from users where id = ${row.user_id}`;

  /* Where they were headed wins; otherwise a first visit goes to the two
     questions and everybody else goes straight to tonight. */
  const to = row.redirect_to
    || (user && user.onboarded_at ? "/account#home" : "/account#welcome");

  return redirect(res, to, 302);
};
