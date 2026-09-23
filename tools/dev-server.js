#!/usr/bin/env node
/* dev-server.js — the site and its API on one port, for local work.
 *
 *     npm run dev            # http://localhost:8000
 *
 * `python3 -m http.server` is no longer enough: /account boots from
 * /api/session, and data/content.js is deliberately not servable. This is
 * the local stand-in for Vercel and it is a tool, not a dependency — nothing
 * the site ships loads it.
 *
 * It matches production in the two ways that have bitten this repo before
 * (see LESSONS-LEARNED.md): a bare path like /7stories serves that
 * directory's index.html without redirecting to a trailing slash, and every
 * asset resolves from the site root.
 *
 * Reads .env if there is one. Without DATABASE_URL the static site still
 * serves and /api/* answers 500 with the reason, which is the honest
 * failure — it does not pretend to have a database.
 */

const fs = require("fs");
const path = require("path");
const http = require("http");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 8000);

/* --------------------------------------------------------------- env file */

const envFile = path.join(root, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}
process.env.SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

/* ---------------------------------------------------------------- statics */

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8"
};

/* Never served, whatever a URL asks for: the content source is the thing the
   paid plan is selling, and the rest is plumbing. */
const HIDDEN = [/^\/?data\//, /^\/?api\//, /^\/?db\//, /^\/?node_modules\//,
                /^\/?tools\//, /^\/?\.git/, /^\/?\.env/, /^\/?package(-lock)?\.json$/];

function staticFile(pathname) {
  const clean = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  if (HIDDEN.some(re => re.test(clean))) return null;

  const target = path.join(root, clean);
  if (!target.startsWith(root)) return null;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const index = path.join(target, "index.html");
    return fs.existsSync(index) ? index : null;     /* no redirect: see above */
  }
  return fs.existsSync(target) && fs.statSync(target).isFile() ? target : null;
}

/* -------------------------------------------------------------------- api */

/* Required fresh each request so an edit to an endpoint shows up without a
   restart — the one way this is nicer than the real thing. */
function apiHandler(pathname) {
  const rel = pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
  if (!rel || rel.includes("..") || rel.startsWith("_")) return null;
  for (const candidate of [`${rel}.js`, path.join(rel, "index.js")]) {
    const file = path.join(root, "api", candidate);
    if (!fs.existsSync(file)) continue;
    for (const key of Object.keys(require.cache)) {
      if (key.startsWith(path.join(root, "api"))) delete require.cache[key];
    }
    return require(file);
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname.startsWith("/api/")) {
    const handler = apiHandler(url.pathname);
    if (!handler) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "no_such_endpoint", path: url.pathname }));
    }
    try {
      await handler(req, res);
    } catch (e) {
      console.error(`${req.method} ${url.pathname} failed:`, e);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "server_error", message: e.message }));
      }
    }
    console.log(`${req.method} ${url.pathname} → ${res.statusCode}`);
    return;
  }

  const file = staticFile(url.pathname);
  if (!file) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.end("<h1>404</h1>");
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  fs.createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Saints & Dragons on http://localhost:${PORT}`);
  if (!process.env.DATABASE_URL) console.log("  (no DATABASE_URL — /api/* will fail; see .env.example)");
  if (!process.env.RESEND_API_KEY) console.log("  (no RESEND_API_KEY — login links print here instead of being emailed)");
});
