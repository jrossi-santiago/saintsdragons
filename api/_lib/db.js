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
    connectionString,
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ...sslFor(connectionString)
  });

  /* A pooled connection can die between requests — a deploy, an idle
     timeout, Supabase restarting. Without a handler that arrives as an
     unhandled 'error' event and takes the whole function down. */
  pool.on("error", err => console.error("postgres pool error:", err.message));

  return pool;
}

/* TLS, decided from the host rather than left to whoever pasted the URL.
   Supabase's certificates chain to a public CA, so verification stays on —
   this never disables it, it only decides whether to ask for it. A URL that
   already says `sslmode=` is left alone, because then somebody has said
   what they want. */
function sslFor(connectionString) {
  if (/[?&]sslmode=/.test(connectionString)) return {};
  let host = "";
  try { host = new URL(connectionString).hostname; } catch (e) {}
  const local = host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "";
  return { ssl: local ? false : true };
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
