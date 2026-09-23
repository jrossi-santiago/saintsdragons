/* session.js — magic-link tokens and login sessions.
 *
 * The shape of both is the same and is worth stating once: the secret is 32
 * random bytes, the reader gets it, and the database only ever stores its
 * SHA-256. A dump of the tables therefore cannot be replayed as a login.
 * A lookup is an indexed match on that hash rather than a comparison here.
 */

const crypto = require("crypto");
const { sql } = require("./db");
const { cookies, setCookie } = require("./http");

const SESSION_COOKIE = "sd_session";
const SESSION_DAYS = 90;
const LINK_MINUTES = 20;        /* long enough to walk to another device */
const LINK_MAX_PER_HOUR = 5;    /* per email address */

function secret() {
  return crypto.randomBytes(32).toString("base64url");
}

function hash(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

/* ------------------------------------------------------------ magic links */

/* Returns the token to email, or null when the address has asked too often.
   Rate limiting is per address rather than per IP: a shared office IP is
   common and a shared mailbox is not.

   newEmail makes it a link that moves the account to that address when it
   is opened (see api/account/email.js). It shares the same limit, so the
   change form cannot be used to mail somebody over and over. */
async function issueLoginToken(userId, { redirectTo = null, ip = null, newEmail = null } = {}) {
  const [{ count }] = await sql`
    select count(*)::int as count from login_tokens
     where user_id = ${userId} and created_at > now() - interval '1 hour'`;
  if (count >= LINK_MAX_PER_HOUR) return null;

  const token = secret();
  if (newEmail) {
    await sql`
      insert into login_tokens (user_id, token_hash, redirect_to, expires_at, requested_ip, new_email)
      values (${userId}, ${hash(token)}, ${redirectTo},
              now() + (${LINK_MINUTES} || ' minutes')::interval, ${ip}, ${newEmail})`;
  } else {
    await sql`
      insert into login_tokens (user_id, token_hash, redirect_to, expires_at, requested_ip)
      values (${userId}, ${hash(token)}, ${redirectTo},
              now() + (${LINK_MINUTES} || ' minutes')::interval, ${ip})`;
  }
  return token;
}

/* Single use: the update only matches a row that is unused and unexpired, so
   two clicks on the same link race in the database rather than in node.

   new_email is asked for too, and left off when the column is not there
   yet (schema.sql not re-run): then no link carries one anyway, and a login
   must never fail over a migration. A failed statement changes nothing, so
   asking again is safe. */
async function consumeLoginToken(token) {
  if (!token) return null;
  try {
    const row = await sql.one`
      update login_tokens
         set used_at = now()
       where token_hash = ${hash(token)}
         and used_at is null
         and expires_at > now()
      returning user_id, redirect_to, new_email`;
    return row || null;
  } catch (e) {
    if (e.code !== "42703") throw e;
  }
  const row = await sql.one`
    update login_tokens
       set used_at = now()
     where token_hash = ${hash(token)}
       and used_at is null
       and expires_at > now()
    returning user_id, redirect_to`;
  return row || null;
}

/* ---------------------------------------------------------------- sessions */

async function startSession(res, userId, userAgent) {
  const token = secret();
  await sql`
    insert into sessions (user_id, token_hash, expires_at, user_agent)
    values (${userId}, ${hash(token)},
            now() + (${SESSION_DAYS} || ' days')::interval, ${userAgent || null})`;
  setCookie(res, SESSION_COOKIE, token, { maxAge: SESSION_DAYS * 24 * 60 * 60 });
  return token;
}

/* The logged-in user with their entitlement, or null. One query: every
   endpoint calls this, so it should not cost two round trips.

   A subscription counts as paying while Stripe still calls it active,
   trialing or past_due. past_due is deliberate — Stripe is still retrying
   the card, and locking a father out of tonight's story over a retry that
   may succeed in an hour is the wrong trade. When it gives up, the status
   becomes canceled or unpaid and access ends with it. */
async function currentUser(req) {
  const token = cookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const row = await sql.one`
    select u.id, u.email, u.first_name, u.child_ages, u.onboarded_at,
           u.created_at, u.stripe_customer_id,
           s.id as session_id,
           sub.status as sub_status,
           sub.current_period_end,
           sub.cancel_at_period_end,
           exists (select 1 from subscriptions where user_id = u.id) as has_billing
      from sessions s
      join users u on u.id = s.user_id
      left join lateral (
        select status, current_period_end, cancel_at_period_end
          from subscriptions
         where user_id = u.id
           and status in ('active', 'trialing', 'past_due')
         order by current_period_end desc nulls last
         limit 1
      ) sub on true
     where s.token_hash = ${hash(token)}
       and s.expires_at > now()`;
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    childAges: row.child_ages || [],
    onboarded: !!row.onboarded_at,
    createdAt: row.created_at,
    stripeCustomerId: row.stripe_customer_id,
    plan: row.sub_status ? "paid" : "free",
    /* Any subscription, live or ended: somebody who has left still has
       invoices and a card on file with Stripe, and should be able to reach
       them from #account without paying again. */
    hasBilling: !!row.has_billing,
    subscription: row.sub_status
      ? {
          status: row.sub_status,
          currentPeriodEnd: row.current_period_end,
          cancelAtPeriodEnd: !!row.cancel_at_period_end
        }
      : null,
    sessionId: row.session_id
  };
}

async function endSession(req, res) {
  const token = cookies(req)[SESSION_COOKIE];
  if (token) await sql`delete from sessions where token_hash = ${hash(token)}`;
  setCookie(res, SESSION_COOKIE, "", { maxAge: 0, expires: new Date(0) });
}

/* Housekeeping, cheap enough to ride along on a login rather than needing a
   cron: expired sessions and spent links are of no use to anyone. */
async function sweep() {
  await sql`delete from sessions where expires_at < now()`;
  await sql`delete from login_tokens where expires_at < now() - interval '1 day'`;
}

module.exports = {
  SESSION_COOKIE, LINK_MINUTES,
  issueLoginToken, consumeLoginToken,
  startSession, currentUser, endSession, sweep
};
