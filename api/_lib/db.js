/* db.js — the one place a SQL query leaves this codebase.
 *
 * Call sites use a tagged template and never build SQL by concatenation:
 *
 *     const [user] = await sql`select * from users where email = ${email}`;
 *
 * The template turns interpolations into $1, $2 … placeholders, so a value
 * can never become syntax. There is no escaping helper here on purpose —
 * if you find yourself wanting one, you are building a query the wrong way.
 *
 * ------------------------------------------------------- connecting to it
 *
 * Supabase is plain Postgres, so this is plain node-postgres: the same file
 * talks to Supabase in production and to a Postgres on your own machine for
 * development, and nothing above it knows the difference.
 *
 * Two things about DATABASE_URL matter enough to state here, because both
 * fail in ways that look like something else:
 *
 *   - **Use Supabase's connection pooler, not the direct connection.** The
 *     pooler host looks like `aws-0-<region>.pooler.supabase.com` and the
 *     user like `postgres.<project-ref>`. The direct host
 *     (`db.<ref>.supabase.co`) is IPv6-only on new projects, and Vercel's
 *     functions are IPv4, so it fails to connect at all rather than
 *     failing slowly.
 *   - **Port 6543, transaction mode.** A function that runs for 300ms
 *     should not hold a Postgres connection open; session mode (5432)
 *     exhausts the pool under any real traffic. Transaction mode forbids
 *     named prepared statements, which is fine — everything here goes
 *     through the unnamed extended-protocol path that `pool.query(text,
 *     values)` uses.
 *   - **Supabase's certificate is signed by Supabase's own CA**, not a
 *     public one, so Node refuses it out of the box with
 *     SELF_SIGNED_CERT_IN_CHAIN. Download the CA from the dashboard
 *     (Database settings -> SSL Configuration -> Download certificate)
 *     and put the file's contents in DATABASE_CA_CERT. Verification stays
 *     on; it just knows which CA to trust.
 *
 * The pool is deliberately tiny. Each warm function instance keeps its own,
 * so a large `max` here multiplies by however many instances Vercel has
 * running.
 */

let pool = null;

function getPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set — see .env.example");

  const { Pool } = require("pg");
  pool = new Pool({
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ...tlsFor(connectionString)
  });

  /* A pooled connection can die between requests — a deploy, an idle
     timeout, Supabase restarting. Without a handler that arrives as an
     unhandled 'error' event and takes the whole function down. */
  pool.on("error", err => console.error("postgres pool error:", err.message));

  return pool;
}

/* TLS, decided here rather than left to whoever pasted the URL. It never
   turns verification off; it only decides what to verify against.

   With DATABASE_CA_CERT set, that CA is the one trusted, and any ssl*
   parameters are taken off the URL first — node-postgres lets the URL
   override the options object, and its sslmode=require now means full
   verification against the public CAs, which would put the failure straight
   back. Without it, a URL that already says `sslmode=` is left alone, and
   otherwise a remote host gets TLS and a local one does not. */
const SSL_PARAMS = ["sslmode", "sslrootcert", "sslcert", "sslkey"];

function tlsFor(connectionString) {
  const ca = caCert();
  if (ca) {
    const url = new URL(connectionString);
    SSL_PARAMS.forEach(p => url.searchParams.delete(p));
    return { connectionString: url.toString(), ssl: { ca } };
  }

  if (/[?&]sslmode=/.test(connectionString)) return { connectionString };
  let host = "";
  try { host = new URL(connectionString).hostname; } catch (e) {}
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
  return { connectionString, ssl: local ? false : true };
}

/* The PEM as pasted. Some dashboards flatten a multi-line value into one
   line with literal \n in it, so those are turned back into newlines. */
function caCert() {
  const raw = process.env.DATABASE_CA_CERT;
  if (!raw || !raw.trim()) return null;
  const pem = raw.replace(/\\n/g, "\n").trim();
  if (!pem.includes("-----BEGIN CERTIFICATE-----")) {
    const e = new Error("DATABASE_CA_CERT is set but is not a PEM certificate — paste the whole .crt file, BEGIN and END lines included");
    e.code = "BAD_CA_CERT";
    throw e;
  }
  return pem;
}

/* Tagged template → { text, values }. `sql.raw` is deliberately absent. */
function build(strings, values) {
  let text = "";
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) text += "$" + (i + 1);
  }
  return { text, values };
}

async function sql(strings, ...values) {
  const { text, values: params } = build(strings, values);
  const result = await getPool().query(text, params);
  return result.rows;
}

/* One row or undefined, for the many lookups that expect at most one. */
sql.one = async function one(strings, ...values) {
  const rows = await sql(strings, ...values);
  return rows[0];
};

module.exports = { sql };
