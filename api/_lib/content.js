/* content.js (server side) — reads data/content.js and decides what a given
 * reader is allowed to have.
 *
 * data/content.js is still the single source of nightly content and is still
 * edited exactly as README describes. It moved out of the site root for one
 * reason: a file the browser can fetch is a file every reader has, paid or
 * not, so a real gate cannot leave it there. It is loaded here the same way
 * tools/check-content.js loads it — with `vm`, as a browser would — so the
 * file itself stays a plain script with no module wrapper to keep in sync.
 *
 * ------------------------------------------------------------- what is free
 *
 * The landing page promises free readers "one history and one bedtime story
 * every week", so: the first card of each ISO week is free. Two properties
 * are the reason it is that and not "the newest card of each week", which
 * was the first attempt:
 *
 *   - it never takes anything back. The first card of a week is the first
 *     card of that week forever, so a story a free reader opened on Monday
 *     is still theirs on Friday. Keying on the newest card of the week
 *     re-locked Monday's story the moment Wednesday's arrived, which is a
 *     worse thing to do to somebody than never giving it to them.
 *   - it is a function of the dates alone, so nothing in data/content.js
 *     has to carry a "free" flag that could drift.
 *
 * It does mean tonight's card is usually locked for a free reader. #home
 * answers that by showing them the newest card they *do* have rather than a
 * wall — see renderHome in app.js.
 *
 * Today in history follows the same spirit: today's entry is free, the rest
 * of the calendar is not.
 *
 * ------------------------------------------------------------ how it locks
 *
 * A locked brief or tale keeps its title, hook, era, age, virtue and
 * provenance and loses its `body`. That is on purpose. The shelves stay
 * full, search keeps working, and the thing a reader is being asked to pay
 * for is visible rather than hidden — the lock is an invitation, not a
 * blank wall. The `body` array is the only thing withheld, along with a
 * locked card's question, why-ours line and prayer.
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SOURCE = path.join(__dirname, "..", "..", "data", "content.js");

let cache = null;

function load() {
  /* A warm function reuses this; a cold one pays for it once. The file is
     only rebuilt by a deploy, so there is nothing to invalidate. */
  if (cache) return cache;
  const src = fs.readFileSync(SOURCE, "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(
    src + ";globalThis.__content = " +
      "{ ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, BRIEFS, TALES, CARDS, TODAY };",
    sandbox,
    { filename: "data/content.js" }
  );
  cache = sandbox.__content;
  return cache;
}

/* ISO week key, so a Sunday and the Monday after it are different weeks. */
function isoWeek(iso) {
  const d = new Date(iso + "T00:00:00Z");
  const day = (d.getUTCDay() + 6) % 7;            /* Monday = 0 */
  d.setUTCDate(d.getUTCDate() - day + 3);         /* the Thursday of that week */
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}

function todayISO(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/* The dates a free reader gets: the first card of each ISO week. Future
   weeks are included — a card dated next Monday simply is not drawn by the
   app until it arrives, and leaving it out here would make the set depend
   on what day the request landed on, which is the drift this avoids. */
function freeCardDates(cards) {
  const first = new Map();
  for (const card of cards) {
    const key = isoWeek(card.date);
    const held = first.get(key);
    if (!held || card.date < held) first.set(key, card.date);
  }
  return new Set(first.values());
}

function omit(obj, keys) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (!keys.includes(k)) out[k] = v;
  return out;
}

/* Builds the payload the app boots from. `paid` short-circuits every rule
   below, so a paying reader's payload is the file itself. */
function payloadFor({ paid, now = new Date() } = {}) {
  const { ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, BRIEFS, TALES, CARDS, TODAY } = load();
  const taxonomy = { ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS };
  const today = todayISO(now);

  if (paid) {
    return { ...taxonomy, BRIEFS, TALES, CARDS, TODAY, locked: false };
  }

  const free = freeCardDates(CARDS);
  const openBriefs = new Set();
  const openTales = new Set();

  const cards = CARDS.map(card => {
    if (free.has(card.date)) {
      openBriefs.add(card.brief);
      openTales.add(card.tale);
      return card;
    }
    return { ...omit(card, ["question", "whyOurs", "prayer"]), locked: true };
  });

  const briefs = {};
  for (const [slug, brief] of Object.entries(BRIEFS)) {
    briefs[slug] = openBriefs.has(slug)
      ? brief
      : { ...omit(brief, ["body"]), locked: true };
  }

  const tales = {};
  for (const [slug, tale] of Object.entries(TALES)) {
    tales[slug] = openTales.has(slug)
      ? tale
      : { ...omit(tale, ["body"]), locked: true };
  }

  /* Today in history: today's date is free, the rest of the calendar is the
     archive a paid reader is buying. An entry is a list, so each one is
     stubbed rather than dropped — the date picker still shows every day
     that has been written, which is the shape of the offer. */
  const todayKey = today.slice(5);
  const today_ = {};
  for (const [key, entries] of Object.entries(TODAY)) {
    today_[key] = key === todayKey
      ? entries
      : entries.map(e => ({ ...omit(e, ["text"]), locked: true }));
  }

  return { ...taxonomy, BRIEFS: briefs, TALES: tales, CARDS: cards, TODAY: today_, locked: true };
}

module.exports = { payloadFor, load, isoWeek, freeCardDates, todayISO };
