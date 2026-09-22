#!/usr/bin/env node
/*
 * check-content.js — the only test this site has.
 *
 *   node tools/check-content.js            # checks ./content.js
 *   node tools/check-content.js FILE       # checks another copy of it
 *
 * Adding a night means hand-editing four structures that point at each other:
 * a brief, its tale, a CARDS entry naming both, and optionally a TODAY entry.
 * There is no build step and no test suite, so a slug typed one character
 * wrong ships silently and a reader gets a card with half of it missing.
 * This reads content.js and says so instead.
 *
 * No dependencies, and none are wanted — it uses `vm` from the standard
 * library to evaluate content.js exactly as a browser would (the file is a
 * plain script full of `const`s, not a module), then walks what it defined.
 *
 * Exit code 0 means every error check passed. Exit code 1 means at least one
 * error. Warnings never fail the run: they are things worth a look that are
 * not broken, and the count is printed either way.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

/* Ages the bedtime shelf actually offers chips for. They are written out in
   app.js rather than living in content.js, so they are repeated here; if a
   third age is ever added, both places need it and this check will say so. */
const AGES = [1, 3];

const root = path.resolve(__dirname, "..");
/* An explicit path is only for testing the checker itself against a
   deliberately broken copy. Normal runs take no arguments. */
const contentPath = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(root, "content.js");

const errors = [];
const warnings = [];

function err(where, msg) { errors.push({ where, msg }); }
function warn(where, msg) { warnings.push({ where, msg }); }

/* ------------------------------------------------------------------ load */

let data;
try {
  const src = fs.readFileSync(contentPath, "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    src + ";globalThis.__content = { ERAS, KINDS, THEMES, VIRTUES, BRIEFS, TALES, CARDS, TODAY };",
    sandbox,
    { filename: "content.js" }
  );
  data = sandbox.__content;
} catch (e) {
  const rel = path.relative(root, contentPath);
  console.error((rel.startsWith("..") ? contentPath : rel) + " did not load at all:\n  " + e.message);
  process.exit(1);
}

const { ERAS, KINDS, THEMES, VIRTUES, BRIEFS, TALES, CARDS, TODAY } = data;

for (const [name, value] of Object.entries(data)) {
  if (value === undefined) err("content.js", `${name} is not defined`);
}
if (errors.length) { report(); process.exit(1); }

/* --------------------------------------------------------------- helpers */

const isText = v => typeof v === "string" && v.trim() !== "";
const isBody = v => Array.isArray(v) && v.length > 0 && v.every(isText);
const minutes = v => {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) && n > 0;
};
const list = a => a.map(x => (typeof x === "string" ? `"${x}"` : String(x))).join(", ");

function requireText(where, obj, field) {
  if (!isText(obj[field])) err(where, `${field} is missing or empty`);
}

/* ---------------------------------------------------------------- briefs */

for (const [slug, b] of Object.entries(BRIEFS)) {
  const where = `BRIEFS["${slug}"]`;
  requireText(where, b, "title");
  requireText(where, b, "hook");
  if (!isBody(b.body)) err(where, "body must be a non-empty array of strings");
  if (!minutes(b.minutes)) err(where, `minutes is not a positive number (${JSON.stringify(b.minutes)})`);
  if (!ERAS.includes(b.era)) err(where, `era ${JSON.stringify(b.era)} is not in ERAS — ${list(ERAS)}`);
  if (!KINDS.includes(b.kind)) err(where, `kind ${JSON.stringify(b.kind)} is not in KINDS — ${list(KINDS)}`);

  if (b.tale !== undefined) {
    if (!TALES[b.tale]) {
      err(where, `tale "${b.tale}" is not in TALES`);
    } else if (TALES[b.tale].brief !== slug) {
      err(where, `tale "${b.tale}" does not point back — TALES["${b.tale}"].brief is ${JSON.stringify(TALES[b.tale].brief)}`);
    }
  }
}

/* ----------------------------------------------------------------- tales */

const series = {};

for (const [slug, t] of Object.entries(TALES)) {
  const where = `TALES["${slug}"]`;
  requireText(where, t, "title");
  requireText(where, t, "origin");
  if (!isBody(t.body)) err(where, "body must be a non-empty array of strings");
  if (!minutes(t.minutes)) err(where, `minutes is not a positive number (${JSON.stringify(t.minutes)})`);
  if (!AGES.includes(t.age)) err(where, `age ${JSON.stringify(t.age)} is not one the shelf has a chip for — ${list(AGES)}`);

  /* theme is optional on purpose: a couple of tales are history-shaped and
     have no fantasy furniture in them. virtue is not optional. */
  if (t.theme !== undefined && !THEMES.includes(t.theme)) {
    err(where, `theme ${JSON.stringify(t.theme)} is not in THEMES — ${list(THEMES)}`);
  }
  if (!VIRTUES.includes(t.virtue)) {
    err(where, `virtue ${JSON.stringify(t.virtue)} is not in VIRTUES — ${list(VIRTUES)}`);
  }
  if (t.source !== undefined && !isText(t.source)) err(where, "source is present but empty");
  if (t.ageLabel !== undefined && !isText(t.ageLabel)) err(where, "ageLabel is present but empty");

  if (t.brief !== undefined) {
    if (!BRIEFS[t.brief]) {
      err(where, `brief "${t.brief}" is not in BRIEFS`);
    } else if (BRIEFS[t.brief].tale !== slug) {
      err(where, `brief "${t.brief}" does not point back — BRIEFS["${t.brief}"].tale is ${JSON.stringify(BRIEFS[t.brief].tale)}`);
    }
  }

  if (t.night !== undefined) {
    const n = t.night;
    if (!n || !Number.isInteger(n.n) || !Number.isInteger(n.of)) {
      err(where, "night must be { n: <integer>, of: <integer> }");
    } else {
      if (n.n < 1 || n.n > n.of) err(where, `night ${n.n} of ${n.of} is out of range`);
      if (!isText(t.series)) err(where, "a tale with night must also carry a series key");
      else (series[t.series] = series[t.series] || []).push([slug, n]);
    }
  } else if (t.series !== undefined) {
    err(where, "series is set but night is not — a series member needs { n, of }");
  }
}

/* series arithmetic: the nights must actually make up the run they claim */
for (const [key, members] of Object.entries(series)) {
  const where = `series "${key}"`;
  const ofs = [...new Set(members.map(([, n]) => n.of))];
  if (ofs.length > 1) err(where, `members disagree on the total — ${list(ofs)}`);
  const total = ofs[0];
  const ns = members.map(([, n]) => n.n).sort((a, b) => a - b);
  if (new Set(ns).size !== ns.length) err(where, `two members claim the same night — ${list(ns)}`);
  if (members.length !== total) {
    err(where, `claims ${total} night${total === 1 ? "" : "s"} but ${members.length} exist — nights present: ${list(ns)}`);
  }
}

/* ----------------------------------------------------------------- cards */

const seenDates = new Set();
const briefUse = {};
const taleUse = {};
let lastDate = "";

CARDS.forEach((c, i) => {
  const where = `CARDS[${i}]${c && c.date ? ` (${c.date})` : ""}`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date || "")) {
    err(where, `date ${JSON.stringify(c.date)} is not YYYY-MM-DD`);
  } else {
    const d = new Date(c.date + "T00:00:00Z");
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== c.date) {
      err(where, `date "${c.date}" is not a real date`);
    }
    if (seenDates.has(c.date)) err(where, `two cards share the date "${c.date}"`);
    seenDates.add(c.date);
    /* Home shows the most recent card that is not in the future, so the order
       in the file is how a reader meets them. Newest last. */
    if (c.date < lastDate) err(where, `is out of order — comes after "${lastDate}". Cards are newest last.`);
    lastDate = c.date;
  }

  requireText(where, c, "title");

  /* The three that make a card a card rather than two links. */
  requireText(where, c, "question");
  requireText(where, c, "whyOurs");
  requireText(where, c, "prayer");

  /* A card should always carry both halves. */
  if (!isText(c.brief)) err(where, "brief slug is missing");
  else if (!BRIEFS[c.brief]) err(where, `brief "${c.brief}" is not in BRIEFS`);
  else (briefUse[c.brief] = briefUse[c.brief] || []).push(c.date);

  if (!isText(c.tale)) err(where, "tale slug is missing");
  else if (!TALES[c.tale]) err(where, `tale "${c.tale}" is not in TALES`);
  else (taleUse[c.tale] = taleUse[c.tale] || []).push(c.date);

  /* The pairing the card asserts must be the pairing the data agrees to. */
  if (BRIEFS[c.brief] && TALES[c.tale]) {
    if (BRIEFS[c.brief].tale !== c.tale) {
      err(where, `pairs "${c.brief}" with "${c.tale}", but BRIEFS["${c.brief}"].tale is ${JSON.stringify(BRIEFS[c.brief].tale)}`);
    }
    if (TALES[c.tale].brief !== c.brief) {
      err(where, `pairs "${c.tale}" with "${c.brief}", but TALES["${c.tale}"].brief is ${JSON.stringify(TALES[c.tale].brief)}`);
    }
  }
});

for (const [slug, dates] of Object.entries(briefUse)) {
  if (dates.length > 1) warn(`BRIEFS["${slug}"]`, `sent on more than one night — ${list(dates)}`);
}
for (const [slug, dates] of Object.entries(taleUse)) {
  if (dates.length > 1) warn(`TALES["${slug}"]`, `sent on more than one night — ${list(dates)}`);
}

/* ----------------------------------------------------------------- today */

for (const [key, entries] of Object.entries(TODAY)) {
  const where = `TODAY["${key}"]`;

  if (!/^\d{2}-\d{2}$/.test(key)) { err(where, "key is not MM-DD"); continue; }
  const mm = Number(key.slice(0, 2)), dd = Number(key.slice(3));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) err(where, "key is not a real month and day");

  if (!Array.isArray(entries) || entries.length === 0) {
    err(where, "must be a non-empty array of entries");
    continue;
  }

  entries.forEach((e, i) => {
    const at = `${where}[${i}]`;
    requireText(at, e, "year");
    requireText(at, e, "text");

    /* README: 100 to 150 words. Worth a look rather than a failure — a long
       one still renders, it just stops being a one-minute read. */
    if (isText(e.text)) {
      const words = e.text.trim().split(/\s+/).length;
      if (words < 100 || words > 150) warn(at, `${words} words — the house length is 100 to 150`);
    }

    /* null is a deliberate "there isn't one"; a slug has to be real. */
    if (e.brief != null && !BRIEFS[e.brief]) err(at, `brief "${e.brief}" is not in BRIEFS`);
    if (e.tale != null && !TALES[e.tale]) err(at, `tale "${e.tale}" is not in TALES`);
  });
}

/* ------------------------------------------------------- unused and empty */

for (const slug of Object.keys(BRIEFS)) {
  if (!briefUse[slug]) warn(`BRIEFS["${slug}"]`, "no card sends it — it is on the shelf but was never a night");
}
for (const slug of Object.keys(TALES)) {
  if (!taleUse[slug] && !TALES[slug].night) {
    warn(`TALES["${slug}"]`, "no card sends it — it is on the shelf but was never a night");
  }
}

/* The shelves only draw a chip once something is filed under it, so an empty
   entry no longer shows a reader an empty shelf. It is still worth naming on
   every run: it is the roadmap, and this is the list of what is not written
   yet. */
const usedThemes = new Set(Object.values(TALES).map(t => t.theme).filter(Boolean));
for (const t of THEMES) if (!usedThemes.has(t)) warn("THEMES", `"${t}" has no tale — nothing is written there yet, so no chip is drawn`);
const usedVirtues = new Set(Object.values(TALES).map(t => t.virtue));
for (const v of VIRTUES) if (!usedVirtues.has(v)) warn("VIRTUES", `"${v}" has no tale — nothing is written there yet, so no chip is drawn`);
const usedEras = new Set(Object.values(BRIEFS).map(b => b.era));
for (const e of ERAS) if (!usedEras.has(e)) warn("ERAS", `"${e}" has no brief — nothing is written there yet, so no chip is drawn`);
const usedKinds = new Set(Object.values(BRIEFS).map(b => b.kind));
for (const k of KINDS) if (!usedKinds.has(k)) warn("KINDS", `"${k}" has no brief — nothing is written there yet, so no chip is drawn`);

/* ---------------------------------------------------------------- report */

function report() {
  const group = rows => {
    const by = new Map();
    for (const r of rows) {
      if (!by.has(r.where)) by.set(r.where, []);
      by.get(r.where).push(r.msg);
    }
    for (const [where, msgs] of by) {
      console.log("  " + where);
      for (const m of msgs) console.log("      " + m);
    }
  };

  if (errors.length) { console.log("\nErrors\n"); group(errors); }
  if (warnings.length) { console.log("\nWarnings\n"); group(warnings); }

  const counts =
    `${Object.keys(BRIEFS).length} briefs, ${Object.keys(TALES).length} tales, ` +
    `${CARDS.length} cards, ${Object.keys(TODAY).length} dates in TODAY`;

  console.log("");
  if (errors.length) {
    console.log(`${errors.length} error${errors.length === 1 ? "" : "s"}, ` +
                `${warnings.length} warning${warnings.length === 1 ? "" : "s"}. Checked ${counts}.`);
  } else {
    console.log(`content.js is sound — ${counts}. ` +
                `${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`);
  }
}

report();
process.exit(errors.length ? 1 : 0);
