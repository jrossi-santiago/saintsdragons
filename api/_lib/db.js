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
 * Two drivers, chosen from DATABASE_URL:
 *
 *   *.neon.tech        @neondatabase/serverless over HTTP. One request per
 *                      query, no connection to keep warm, which is what a
 *                      serverless function wants.
 *   anything else      node-postgres, so a plain local Postgres works for
 *                      `npm run dev` and for the checks before a merge.
 *
 * Both return plain row objects, so nothing above this file knows which one
 * it got.
 */

let driver = null;

function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — see .env.example");
  return url;
}

function isNeon(url) {
  return /\.neon\.tech(?::|\/|$)/.test(url);
}

function getDriver() {
  if (driver) return driver;
  const url = connectionString();

  if (isNeon(url)) {
    const { neon } = require("@neondatabase/serverless");
    const client = neon(url);
    driver = (text, values) => client.query(text, values);
  } else {
    /* pg is a devDependency: it is only ever reached by a non-Neon
       DATABASE_URL, which in practice means a developer's own machine. */
    const { Pool } = require("pg");
    const pool = new Pool({ connectionString: url, max: 3 });
    driver = (text, values) => pool.query(text, values).then(r => r.rows);
  }
  return driver;
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
  return getDriver()(text, params);
}

/* One row or undefined, for the many lookups that expect at most one. */
sql.one = async function one(strings, ...values) {
  const rows = await sql(strings, ...values);
  return rows[0];
};

module.exports = { sql };
