#!/usr/bin/env node
/* Re-renders the product screenshots the landing page shows in its
   "What you get" section, from the real /account pages, so the pitch shows
   the product as it actually is rather than a drawing of it.

   The screenshots bake in whatever content.js serves today, so re-run this
   when the day on #home or the featured tale changes:

     python3 -m http.server 8000 &
     node tools/render-landing-shots.js

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
const OUT = path.join(__dirname, "..", "assets", "landing");

/* [file stem, route, viewport, scroll-to selector or null] */
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
      const page = await ctx.newPage();
      await page.goto(BASE + route, { waitUntil: "networkidle" });
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
