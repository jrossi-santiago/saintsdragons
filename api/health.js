/* GET /api/health — is everything the site needs actually reachable?
 *
 * For the owner, in a browser, when something fails with no reason given:
 * Vercel answers a crashed function with a bare 500, and the pages can only
 * say "that did not work". This names the broken piece instead.
 *
 * Email is checked by reading the Resend account's domains, never by
 * sending, so opening this page costs nothing.
 *
 * It reports whether each key is set, never its value, and a database
 * failure as an error code plus a hint, never the message — a connection
 * error's message can carry the host and user from DATABASE_URL.
 */

const { sql } = require("./_lib/db");
const { json, methodNotAllowed } = require("./_lib/http");
const { checkSending } = require("./_lib/email");

const TABLES = ["users", "login_tokens", "sessions", "subscriptions", "stripe_events"];

const KEYS = [
  "DATABASE_URL", "RESEND_API_KEY", "EMAIL_FROM",
  "STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "STRIPE_WEBHOOK_SECRET", "SITE_URL",
  "DATABASE_CA_CERT"
];
/* EMAIL_FROM has a default in api/_lib/email.js; the email check below
   reports the address actually in use either way. */
const OPTIONAL = ["SITE_URL", "DATABASE_CA_CERT", "EMAIL_FROM"];

const SUPABASE_CA = "Supabase signs its database certificate with its own CA: download it " +
  "(Database settings -> SSL Configuration -> Download certificate) and paste the whole " +
  "file into DATABASE_CA_CERT in Vercel, then redeploy";

/* The codes a misconfigured DATABASE_URL actually produces, in words. */
const HINTS = {
  ENOTFOUND: "the host in DATABASE_URL does not exist — check it was copied whole",
  ECONNREFUSED: "nothing is listening at that host and port",
  ETIMEDOUT: "the host did not answer — the direct db.<ref>.supabase.co host is IPv6-only; use the transaction pooler on port 6543",
  ENETUNREACH: "the host is not reachable over IPv4 — use Supabase's transaction pooler, not the direct connection",
  "28P01": "the password in DATABASE_URL is wrong (it is the database password, not the Supabase account one)",
  "28000": "that user is not allowed in — the pooler user looks like postgres.<project-ref>",
  "3D000": "the database name at the end of DATABASE_URL does not exist — it should be /postgres",
  SELF_SIGNED_CERT_IN_CHAIN: SUPABASE_CA,
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: SUPABASE_CA,
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: SUPABASE_CA,
  BAD_CA_CERT: "DATABASE_CA_CERT is not a certificate — paste the whole .crt file, BEGIN and END lines included",
  ERR_TLS_CERT_ALTNAME_INVALID: "the certificate does not match the host — use the host exactly as Supabase shows it",
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

  let email;
  try {
    email = await checkSending();
  } catch (e) {
    email = { ok: false, hint: "could not reach Resend to check — see the function log" };
    console.error("health: email check failed:", e.message);
  }

  /* email.ok is null when the key cannot say; that is not counted a failure. */
  const ok = database.connected && !database.missingTables.length && email.ok !== false &&
    KEYS.filter(k => !OPTIONAL.includes(k)).every(k => env[k]);

  return json(res, ok ? 200 : 503, { ok, database, email, env });
};
