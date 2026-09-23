/* GET /api/auth/verify?token=… — the other end of the magic link.
 *
 * Spends the token, starts a session, and sends the reader where they were
 * going. Never renders anything itself: a failure goes back to /login with a
 * reason, so there is one page that explains itself and one place to style.
 */

const { sql } = require("../_lib/db");
const { consumeLoginToken, startSession } = require("../_lib/session");
const { redirect, methodNotAllowed } = require("../_lib/http");

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
