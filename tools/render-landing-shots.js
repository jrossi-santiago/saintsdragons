#!/usr/bin/env node
/* Re-renders the product screenshots the landing page shows in its
   "What you get" section, from the real /account pages, so the pitch shows
   the product as it actually is rather than a drawing of it.

   The screenshots bake in whatever data/content.js serves today, so re-run
   this when the day on #home or the featured tale changes:

     npm run dev &
     SESSION=<a sd_session cookie> node tools/render-landing-shots.js

   /account needs a session now, and the shots should show the paid product,
   which is what the landing page is selling. Get the cookie by logging in
   locally as a reader who has a subscription row, then read it out of the
   browser's dev tools. Without SESSION the pages redirect to /login and the
   shots come out wrong — the script says so rather than writing them.

   Needs Playwright (preinstalled in the web sandbox; locally
   `npm i -g playwright`). Nothing on the site loads it — this is a tool,
   not a dependency. Writes assets/landing/*-{dark,light}.jpg. */

const path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) {
  const { execSync } = require("child_process");
  ({ chromium } = require(path.join(execSync("npm root -g").toString().trim(), "playwright")));
}

const BASE = process.env.BASE || "http://localhost:8000";
const SESSION = process.env.SESSION || "";
const OUT = path.join(__dirname, "..", "assets", "landing");

/* [file stem, route, viewport] */
const SHOTS = [
  ["app-desktop", "/account/#home", { width: 1280, height: 800 }],
  ["tale-phone", "/account/#tale/lion-and-the-mouse", { width: 390, height: 780 }],
];

(async () => {
  require("fs").mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const theme of ["dark", "light"]) {
    for (const [stem, route, viewport] of SHOTS) {
      const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
      await ctx.addInitScript(t => { try { localStorage.setItem("sd-theme", t); } catch (e) {} }, theme);
      if (SESSION) {
        await ctx.addCookies([{ name: "sd_session", value: SESSION,
                                domain: new URL(BASE).hostname, path: "/" }]);
      }
      const page = await ctx.newPage();
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      if (page.url().includes("/login")) {
        throw new Error("that session is not valid — /account sent us to /login. " +
                        "Set SESSION to a logged-in reader's sd_session cookie.");
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const file = path.join(OUT, `${stem}-${theme}.jpg`);
      await page.screenshot({ path: file, type: "jpeg", quality: 82 });
      console.log("wrote", path.relative(process.cwd(), file));
      await ctx.close();
    }
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
