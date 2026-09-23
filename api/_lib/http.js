/* http.js — the small things every endpoint needs, in one place.
 *
 * Vercel's Node runtime hands a handler the Node req/res pair, so these are
 * deliberately plain: no framework, nothing to learn. */

/* The origin every login link and Stripe return URL is built from, in the
   order it should be trusted:

     SITE_URL      what you set. On production this is the domain readers
                   actually type, and it is the only one that is right.
     VERCEL_URL    the URL of *this* deployment, which Vercel sets itself.
                   It is the fallback so preview deployments work on their
                   own terms: without it, a login link generated on a
                   preview would point at production and log you into the
                   live site while you were testing a branch. So set
                   SITE_URL on Production only, and leave Preview to this.
     localhost     development.

   Note VERCEL_URL carries no scheme, and preview deployments are https. */
const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "") ||
  "http://localhost:8000"
).replace(/\/+$/, "");

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  json(res, 405, { error: "method_not_allowed" });
}

/* Raw bytes, untouched. The Stripe webhook needs these to check a
   signature — a parsed-and-restringified body does not verify. */
function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/* Accepts JSON and form-encoded, because the signup forms ship as real
   markup with a real action and must still work when the script does not
   run (see rule 2 in LESSONS-LEARNED.md). Vercel may have parsed the body
   already; honour that when it has. */
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const raw = (await rawBody(req)).toString("utf8");
  if (!raw) return {};
  const type = String(req.headers["content-type"] || "");
  if (type.includes("application/json")) {
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }
  const out = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    if (k in out) out[k] = [].concat(out[k], v);
    else out[k] = v;
  }
  return out;
}

/* A browser posting a real <form> wants a page back, not JSON. */
function wantsHTML(req) {
  const type = String(req.headers["content-type"] || "");
  if (type.includes("application/json")) return false;
  return String(req.headers.accept || "").includes("text/html");
}

function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function setCookie(res, name, value, { maxAge, expires } = {}) {
  const bits = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];
  /* Secure would make the cookie invisible over plain http, which is how
     the site is served locally. */
  if (SITE_URL.startsWith("https://")) bits.push("Secure");
  if (maxAge != null) bits.push(`Max-Age=${maxAge}`);
  if (expires) bits.push(`Expires=${expires.toUTCString()}`);
  const existing = res.getHeader("Set-Cookie");
  const all = existing ? [].concat(existing, bits.join("; ")) : [bits.join("; ")];
  res.setHeader("Set-Cookie", all);
}

function redirect(res, to, status = 303) {
  res.statusCode = status;
  res.setHeader("Location", to);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function clientIP(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "");
  return fwd.split(",")[0].trim() || req.socket?.remoteAddress || "";
}

/* Did this request come from a page on this site? Browsers send Origin on
   every POST (Referer as the fallback), and another site cannot forge
   either. Used before anything that signs a reader in without a link: a
   form on somebody else's page must not be able to drop a visitor into an
   account the other site controls. No header at all means "not proven". */
function sameOrigin(req) {
  const from = req.headers.origin || req.headers.referer;
  if (!from) return false;
  let host;
  try { host = new URL(from).host; } catch (e) { return false; }
  const own = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  return !!own && host === own;
}

/* Email is the account key, so it is normalised in exactly one place. */
function normaliseEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return email;
}

module.exports = {
  SITE_URL, json, methodNotAllowed, rawBody, readBody, wantsHTML,
  cookies, setCookie, redirect, clientIP, normaliseEmail, sameOrigin
};
