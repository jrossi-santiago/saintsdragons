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
 * provenance and loses its text. That is on purpose. The shelves stay
 * full, search keeps working, and the thing a reader is being asked to pay
 * for is visible rather than hidden — the lock is an invitation, not a
 * blank wall. The text is the only thing withheld, along with a locked
 * card's question, why-ours line and prayer.
 *
 * A brief's text is `body` in the older shape and, in the shape written to
 * docs/history-for-dads.md, `opening`, `sections`, `kidsQuestion` and
 * `sideNotes`. BRIEF_TEXT names all of them; a new field that carries paid
 * words has to be added there, or it ships to every free reader. The dek
 * stays, like the title: it is the who, what and when, not the piece.
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
      "{ ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, BRIEFS, TALES, CARDS, TODAY, SEVEN };",
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

/* ---------------------------------------------------------- what is out

   Nights are written in batches and dated ahead. A card goes live at 12:01am
   US Eastern on its date, for every reader at once, wherever they are: a
   reader in California gets it at 9:01pm the night before, which is still
   bedtime. Until then the card is not in anybody's payload, and neither is
   the brief or tale that only it sends, nor the Today-in-history entry
   written for its date. Not locked but absent: a locked item keeps its title
   and hook on the shelf, and a night that has not happened yet should not be
   on the shelf at all, or in search, or in the page source.

   Nothing runs at midnight. Each request works out what day it is and
   filters, so a batch goes out in one deploy and releases itself.

   PREVIEW_DATE (YYYY-MM-DD) pretends it is that day, so a queued batch can
   be looked at locally before it ships. It is ignored on Vercel, where a
   stray value would publish the whole queue. */
const RELEASE = { timeZone: "America/New_York", minutesPastMidnight: 1 };

const DAY_IN_ZONE = new Intl.DateTimeFormat("en-CA", {
  timeZone: RELEASE.timeZone, year: "numeric", month: "2-digit", day: "2-digit"
});

function todayISO(now = new Date()) {
  const preview = process.env.PREVIEW_DATE;
  if (preview && !process.env.VERCEL && /^\d{4}-\d{2}-\d{2}$/.test(preview)) return preview;
  /* The day it was a minute ago is the day that has been released: at
     12:00:30 it is still yesterday's card, at 12:01 it is today's. */
  return DAY_IN_ZONE.format(new Date(now.getTime() - RELEASE.minutesPastMidnight * 60000));
}

/* The content as it stands on `day`. Briefs and tales that no card sends
   (the Drake piece, the second night of a story told on one card) are not
   scheduled and stay. A released item that points at a held one loses the
   pointer rather than linking to a page that is not there yet. */
function released({ BRIEFS, TALES, CARDS, TODAY }, day) {
  const cards = CARDS.filter(c => c.date <= day);
  const queued = CARDS.filter(c => c.date > day);
  if (!queued.length) return { BRIEFS, TALES, CARDS, TODAY };

  const liveBriefs = new Set(cards.map(c => c.brief));
  const liveTales = new Set(cards.map(c => c.tale));
  const heldBriefs = new Set(queued.map(c => c.brief).filter(s => s && !liveBriefs.has(s)));
  const heldTales = new Set(queued.map(c => c.tale).filter(s => s && !liveTales.has(s)));
  const heldDays = new Set(queued.map(c => c.date.slice(5)));
  for (const c of cards) heldDays.delete(c.date.slice(5));

  const unlink = (item, key, held) =>
    item && held.has(item[key]) ? omit(item, [key]) : item;

  const briefs = {};
  for (const [slug, b] of Object.entries(BRIEFS)) {
    if (!heldBriefs.has(slug)) briefs[slug] = unlink(b, "tale", heldTales);
  }
  const tales = {};
  for (const [slug, t] of Object.entries(TALES)) {
    if (!heldTales.has(slug)) tales[slug] = unlink(t, "brief", heldBriefs);
  }
  const today = {};
  for (const [key, entries] of Object.entries(TODAY)) {
    if (heldDays.has(key)) continue;
    today[key] = entries.map(e => unlink(unlink(e, "brief", heldBriefs), "tale", heldTales));
  }
  return { BRIEFS: briefs, TALES: tales, CARDS: cards, TODAY: today };
}

/* The dates a free reader gets: the first card of each ISO week. Future
   weeks are included, although a card dated next Monday is not sent to
   anyone until it is released (see `released`): leaving it out here would
   make the set depend on what day the request landed on, which is the
   drift this avoids. */
function freeCardDates(cards) {
  const first = new Map();
  for (const card of cards) {
    const key = isoWeek(card.date);
    const held = first.get(key);
    if (!held || card.date < held) first.set(key, card.date);
  }
  return new Set(first.values());
}

const BRIEF_TEXT = ["body", "opening", "sections", "kidsQuestion", "sideNotes"];

function omit(obj, keys) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (!keys.includes(k)) out[k] = v;
  return out;
}

/* Builds the payload the app boots from. `paid` short-circuits every rule
   below, so a paying reader's payload is everything released so far. */
function payloadFor({ paid, now = new Date() } = {}) {
  const all = load();
  const { ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, SEVEN } = all;
  /* SEVEN rides with the taxonomy because it is the same for every reader:
     the seven free stories are what the free sign-up promises, in full. */
  const taxonomy = { ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, SEVEN };
  const today = todayISO(now);
  const { BRIEFS, TALES, CARDS, TODAY } = released(all, today);

  /* `today` goes to the app too, so #home and the free Today-in-history
     date turn over on this clock and not on the reader's. */
  if (paid) {
    return { ...taxonomy, BRIEFS, TALES, CARDS, TODAY, today, locked: false };
  }

  /* Worked out on every card, queued ones included, so a week's free card
     does not depend on what has been released yet. */
  const free = freeCardDates(all.CARDS);
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
      : { ...omit(brief, BRIEF_TEXT), locked: true };
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

  return { ...taxonomy, BRIEFS: briefs, TALES: tales, CARDS: cards, TODAY: today_, today, locked: true };
}

module.exports = { payloadFor, load, released, isoWeek, freeCardDates, todayISO, RELEASE };
