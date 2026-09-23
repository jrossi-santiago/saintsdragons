/* GET /api/health — is everything the site needs actually reachable?
 *
 * For the owner, in a browser, when something fails with no reason given:
 * Vercel answers a crashed function with a bare 500, and the pages can only
 * say "that did not work". This names the broken piece instead.
 *
 * It reports whether each key is set, never its value, and a database
 * failure as an error code plus a hint, never the message — a connection
 * error's message can carry the host and user from DATABASE_URL.
 */

const { sql } = require("./_lib/db");
const { json, methodNotAllowed } = require("./_lib/http");

const TABLES = ["users", "login_tokens", "sessions", "subscriptions", "stripe_events"];

const KEYS = [
  "DATABASE_URL", "RESEND_API_KEY", "EMAIL_FROM",
  "STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "STRIPE_WEBHOOK_SECRET", "SITE_URL"
];

/* The codes a misconfigured DATABASE_URL actually produces, in words. */
const HINTS = {
  ENOTFOUND: "the host in DATABASE_URL does not exist — check it was copied whole",
  ECONNREFUSED: "nothing is listening at that host and port",
  ETIMEDOUT: "the host did not answer — the direct db.<ref>.supabase.co host is IPv6-only; use the transaction pooler on port 6543",
  ENETUNREACH: "the host is not reachable over IPv4 — use Supabase's transaction pooler, not the direct connection",
  "28P01": "the password in DATABASE_URL is wrong (it is the database password, not the Supabase account one)",
  "28000": "that user is not allowed in — the pooler user looks like postgres.<project-ref>",
  "3D000": "the database name at the end of DATABASE_URL does not exist — it should be /postgres",
  XX000: "Supabase refused the connection — often a pooler user without the .<project-ref> suffix"
};

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const env = Object.fromEntries(KEYS.map(k => [k, !!process.env[k]]));
  const database = { connected: false };

  try {
    const rows = await sql`select ${TABLES}::text[] as wanted,
      array(select t from unnest(${TABLES}::text[]) t where to_regclass('public.' || t) is null) as missing`;
    database.connected = true;
    database.missingTables = rows[0].missing;
    if (database.missingTables.length) {
      database.hint = "run db/schema.sql against this database (Supabase: SQL Editor)";
    }
  } catch (e) {
    database.error = e.code || "unknown";
    database.hint = HINTS[e.code] || "see the function log for this request in Vercel";
    console.error("health: database check failed:", e.message);
  }

  const ok = database.connected && !database.missingTables.length &&
    KEYS.filter(k => k !== "SITE_URL").every(k => env[k]);

  return json(res, ok ? 200 : 503, { ok, database, env });
};
