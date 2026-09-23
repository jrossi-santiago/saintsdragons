/* Saints & Dragons — content, routing, search, theme */

/* The contact form posts to the same Formspree endpoint as /7stories.
   Unlike that one, a failed POST here has nothing to fall back on — there is
   no download to unlock — so this one tells the reader it failed instead of
   swallowing the error and thanking them for a message that went nowhere. */
const FORM_ENDPOINT = "https://formspree.io/f/xqpaqzne";

/* ------------------------------------------------------ what we are given

   These were consts in content.js, loaded by a <script> tag before this
   file. They are `let` and start empty because what a reader gets now
   depends on who the reader is: /api/session answers with the free week or
   with the whole archive, and boot() at the foot of this file fills them in
   before the first frame is drawn. Nothing above that point may read them.

   A locked brief or tale arrives with everything except its `body`, and a
   locked card without its question, why-ours line and prayer. So the test
   for "may I print this" is the presence of the words, never a flag: see
   `isOpen` below, and api/_lib/content.js for the other half of the deal. */
let CARDS = [], BRIEFS = {}, TALES = {}, TODAY = {};
let ERAS = [], KINDS = [], THEMES = [], VIRTUES = [], AGE_BANDS = {};

/* The signed-in reader. Null only before boot() has answered. */
let ME = null;

const isPaid = () => !!ME && ME.plan === "paid";
const isOpen = item => !!item && !item.locked;

const PAGES = {
  about: {
    title: "About",
    sub: "What this is, and who it's for.",
    html: `
      <div class="prose">
        <p>You stopped learning things for fun at about the same time you stopped being graded on it. Not on purpose. School ended, work started, and everything you have read since has been read for a reason — a decision at work, a thing that needed fixing, the news. Nobody has handed you anything in years that was simply worth knowing.</p>
        <p>Then you had kids, and the reading became somebody else's twelve-page book about a truck, for the fourth night running.</p>
        <p>Saints &amp; Dragons puts both back. Every day, one true piece of history for you, written for a grown adult, to read whenever you get a few minutes. And one bedtime story to read out loud to them that night, on the same idea.</p>

        <h3>How it works</h3>
        <p>You read how Patrick, a man with no family on the island and so no legal protection at all, had to pay for the right not to be killed — and went back anyway to the country that had enslaved him. That night you sit on the edge of a bed and read them a story about a boy on a cold hill who walks all the way home, and then turns around. They get what you got, shaped for a five-year-old.</p>
        <p>You learn something real, they hear a story worth hearing, and the two of you have something to talk about that isn't school or a screen. Under 10 minutes of reading for you, and none of it to plan.</p>

        <h3>What this is not</h3>
        <ul>
          <li><strong>Not fun facts.</strong> Every piece is about how a thing actually worked, why it came out the way it did, and what it cost somebody.</li>
          <li><strong>Not a course.</strong> Nobody is testing you. You get to learn things because they are good.</li>
          <li><strong>Not a sermon.</strong> The history is history: named sources, dates, and an honest line about what the evidence can carry. Where a story has a virtue in it, the story carries it. We don't stop to explain the lesson, and neither should you.</li>
          <li><strong>Not a feed.</strong> Nothing to scroll. Read today's and you're done.</li>
        </ul>

        <h3>Why the name</h3>
        <p>Dragons are the furniture of a child's imagination, and it is good furniture — knights, castles, forests, something to be brave about. Children have always been given this and they should go on being given it.</p>
        <p>Saints are the other half: real people, in real centuries, who are interesting long before they are edifying. We write them the way we write a battle or a builder — how it worked, and what it cost.</p>

        <h3>Where this goes</h3>
        <p>The daily history and bedtime story are the start. Next come books a child can read on his own, and shows a dad is glad to put on rather than ones he puts up with. None of that exists yet; we're telling you so you know what you're joining.</p>
      </div>`
  },
  contact: {
    title: "Contact",
    sub: "Say hello — we read everything.",
    html: `
      <form class="prose" id="contactForm" method="POST" action="${FORM_ENDPOINT}">
        <label class="field"><span>Name</span><input type="text" name="name" required /></label>
        <label class="field"><span>Email</span><input type="email" name="email" required /></label>
        <label class="field"><span>Message</span><textarea name="message" required></textarea></label>
        <button class="btn" type="submit">Send message</button>
        <p class="filter-note" id="contactStatus" role="status" aria-live="polite"></p>
      </form>`,
    init() {
      const form = document.getElementById("contactForm");
      const status = document.getElementById("contactStatus");
      const btn = form.querySelector("button[type=submit]");
      form.addEventListener("submit", async ev => {
        ev.preventDefault();
        const body = {
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          message: form.message.value.trim(),
          source: "/account#contact"
        };
        if (!body.name || !body.message || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) {
          status.textContent = "Please fill in your name, a valid email, and a message.";
          return;
        }
        btn.disabled = true;
        const label = btn.textContent;
        btn.textContent = "Sending…";
        status.textContent = "";
        try {
          const res = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
          form.reset();
          status.textContent = "Thanks — that came through. We read everything, and we'll reply.";
        } catch (err) {
          console.warn("contact message did not reach Formspree", err);
          status.textContent = "That did not send. Your message is still in the box — please try again in a moment.";
        }
        btn.disabled = false;
        btn.textContent = label;
      });
    }
  }
};

const main = document.getElementById("main");
const searchInput = document.getElementById("search");

function renderPage(key) {
  const page = PAGES[key];
  main.innerHTML = `
    <div class="content">
      <header class="page-head"><h2>${page.title}</h2><p>${page.sub}</p></header>
      ${page.html}
    </div>`;
  page.init?.();
}

/* ---------------------------------------------------------------- helpers */

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
}

/* "2026-09-21" -> "Monday, 21 September"
   Removed once as dead code and brought back when the account page and the
   held-back banner on #home needed a date in words. */
function longDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()];
  return `${day}, ${d} ${MONTHS[m - 1]}`;
}

/* "2026-09-21" -> "Monday \u00b7 September 21, 2026" (the receipt dateline) */
function receiptDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dt.getDay()];
  return `${day} \u00b7 ${MONTHS[m - 1]} ${d}, ${y}`;
}

/* Today-in-History entries are written long for their own page. The receipt
   only prints the opening sentence and sends you to the full one. A full stop
   only ends a sentence if a new one starts after it, and not when it belongs
   to an initial or an abbreviation ("J.R.R. Tolkien", "St. Albans"). */
const ABBREV = /(?:^|[\s(.“"'])(?:[A-Za-z]|Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|etc|No|Rev|Gen|Col|Capt)$/;

function firstSentence(text) {
  const s = String(text).trim();
  const stops = /[.!?](?=\s+[“"'(]?[A-Z0-9])/g;
  let m;
  while ((m = stops.exec(s)) !== null) {
    if (ABBREV.test(s.slice(0, m.index))) continue;
    return s.slice(0, m.index + 1);
  }
  return s;
}

/* "2026-09-17" -> "Thu \u00b7 September 17" (the mini receipts' dateline) */
function miniDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
  return `${day} \u00b7 ${MONTHS[m - 1]} ${d}`;
}

/* "09-21" -> "September 21" */
function dayLabel(md) {
  const [m, d] = md.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

function todayKey() {
  const n = new Date();
  return String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
}

function shiftKey(md, days) {
  const [m, d] = md.split("-").map(Number);
  const dt = new Date(2001, m - 1, d + days);
  return String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
}

/* days apart on a circular calendar, so 31 Dec and 1 Jan are one day apart */
function keyDistance(a, b) {
  const toDay = k => {
    const [m, d] = k.split("-").map(Number);
    return Math.round((new Date(2001, m - 1, d) - new Date(2001, 0, 1)) / 86400000);
  };
  const raw = Math.abs(toDay(a) - toDay(b));
  return Math.min(raw, 365 - raw);
}

function nearestKey(md) {
  const keys = Object.keys(TODAY);
  if (!keys.length) return null;
  return keys.slice(1).reduce((best, k) =>
    keyDistance(k, md) < keyDistance(best, md) ? k : best, keys[0]);
}

/* today in the form CARDS uses. Built from todayKey() rather than
   re-deriving the month and day, so there is one place that pads them. */
function todayISO() {
  return new Date().getFullYear() + "-" + todayKey();
}

/* the card for tonight: the most recent one not in the future */
function tonightCard() {
  const key = todayISO();
  const past = CARDS.filter(c => c.date <= key);
  return past.length ? past[past.length - 1] : CARDS[CARDS.length - 1];
}

/* What #home actually draws for this reader. A free reader is shown the most
   recent day they have rather than a wall where the product should be —
   meeting the thing is the whole argument for paying for it. `held` is the
   real tonight when it is not theirs, and renderHome says so above the
   receipt. */
function homeCard() {
  const tonight = tonightCard();
  if (!tonight || !tonight.locked) return { card: tonight, held: null };
  const key = todayISO();
  const open = CARDS.filter(c => c.date <= key && !c.locked);
  return { card: open.length ? open[open.length - 1] : tonight, held: tonight };
}

/* A locked card keeps its title; fall back to its tale if it ever does not. */
function heldTitle(card) {
  const tale = TALES[card.tale];
  return card.title || (tale && tale.title) || "Tonight\u2019s";
}

/* ------------------------------------------------------------- the lock */

/* One panel, used everywhere something is held back, so the ask is worded
   the same on the receipt, on a shelf and on a story's own page. It names
   what is behind it rather than saying "upgrade to continue" — a reader
   deciding whether to pay should be able to see what they are deciding
   about. The button posts to /api/billing/checkout; the handler is
   delegated, at the foot of this file. */
function lockPanel(heading, line, { small = false } = {}) {
  return `<aside class="lock${small ? " is-small" : ""}">
    <p class="lock-kicker">Every day &middot; $6 a month</p>
    <h3>${esc(heading)}</h3>
    <p>${esc(line)}</p>
    <button class="btn" type="button" data-upgrade>Get every day</button>
    <p class="lock-note">Cancel any time. Your free story every week stays free.</p>
  </aside>`;
}

const LOCK_TAG = `<span class="lock-tag">Every day</span>`;

function backLink(hash, label) {
  return `<a class="back-link" href="#${hash}"><svg class="ic ic-back"><use href="#i-arrow"/></svg>${esc(label)}</a>`;
}

/* ------------------------------------------------------------- filters */

const filters = {
  history: { era: null, kind: null },
  bedtime: { age: null, theme: null, virtue: null }
};

/* The one place a tale's age becomes words. `age` is a bucket id and is never
   printed; AGE_BANDS turns it into a label, and a tale's own `ageLabel` wins
   where it has one. Every surface goes through here so the receipt and the
   shelf cannot say different things about the same story. */
function ageText(t) {
  return t.ageLabel || AGE_BANDS[t.age] || `Ages ${t.age}`;
}

/* A chip with nothing behind it filters to an empty shelf, which reads as
   broken rather than as "coming soon". So ERAS, KINDS, THEMES and VIRTUES stay
   whole in content.js — they are the plan — and only the entries something is
   actually filed under get drawn. A chip appears by itself the night the first
   brief or tale lands in it. Counted across all the data, never the filtered
   list, so the row does not shift under the reader as they click. */
function withContent(values, items, field) {
  const used = new Set(Object.values(items).map(x => x[field]).filter(Boolean));
  return values.filter(v => used.has(v));
}

function chip(group, field, value, label) {
  const on = filters[group][field] === value;
  return `<button class="chip${on ? " is-on" : ""}" data-group="${group}" data-field="${field}" data-value="${esc(value)}">${esc(label)}</button>`;
}

/* -------------------------------------------------------------- shelves */
/* card-builders shared by History for dads, Bedtime stories and Search */

/* A locked item keeps its place on the shelf with everything a reader needs
   to want it — title, hook, era, how long it takes — and loses the article.
   Hiding it instead would make the shelves look thin and the offer
   invisible, which serves nobody. */
function briefCardHTML(slug, b) {
  const tale = TALES[b.tale];
  return `<article class="shelf-item${b.locked ? " is-locked" : ""}">
    <h3>${esc(b.title)}${b.locked ? LOCK_TAG : ""}</h3>
    <p class="shelf-meta">${esc(b.era)} · ${esc(b.kind)} · ${b.minutes} min</p>
    <p class="shelf-hook">${esc(b.hook)}</p>
    ${b.stillWithUs ? `<p class="shelf-line"><strong>Still around today:</strong> ${esc(b.stillWithUs)}</p>` : ""}
    ${tale ? `<p class="shelf-line"><strong>Bedtime story:</strong> <a href="#tale/${b.tale}">${esc(tale.title)}</a></p>` : ""}
    <a class="btn btn-quiet" href="#brief/${slug}">${b.locked ? "See what's in it" : `Read it (${b.minutes} min)`}</a>
  </article>`;
}

function taleCardHTML(slug, t) {
  const brief = t.brief ? BRIEFS[t.brief] : null;
  return `<article class="shelf-item${t.locked ? " is-locked" : ""}">
    <h3>${esc(t.title)}${t.locked ? LOCK_TAG : ""}</h3>
    <p class="shelf-meta">${esc(ageText(t))} · ${esc(t.minutes)} min read-aloud${t.theme ? ` · ${esc(t.theme)}` : ""} · ${esc(t.virtue)}</p>
    <p class="shelf-tag">${esc(t.origin)}</p>
    ${t.night ? `<p class="shelf-line"><strong>${t.night.n === 1 ? `A ${t.night.of}-part story.` : `Part ${t.night.n} of ${t.night.of}.`}</strong></p>` : ""}
    ${brief ? `<p class="shelf-line"><strong>Goes with:</strong> <a href="#brief/${t.brief}">${esc(brief.title)}</a></p>` : ""}
    <a class="btn btn-quiet" href="#tale/${slug}">${t.locked ? "See what's in it" : "Read it aloud"}</a>
  </article>`;
}

/* ------------------------------------------------------------- Home */
/* Home is Tonight: the card is not behind a click. */

function renderHome(query = "") {
  const q = query.trim();
  if (q) return renderSearch(q);

  const { card, held } = homeCard();
  const brief = card.brief ? BRIEFS[card.brief] : null;
  const tale = TALES[card.tale];
  const earlier = CARDS.filter(c => c.date < card.date).slice(-5).reverse();

  /* Today in history follows the receipt's own date, not the clock, so the
     dateline and the entry under it can never be two different days. */
  const askedKey = card.date.slice(5);
  const shownKey = TODAY[askedKey] ? askedKey : nearestKey(askedKey);
  const todayList = shownKey ? TODAY[shownKey] : null;
  /* A free reader gets today's date and not the rest of the calendar, so an
     entry can be present but held back. The tally must count what is
     actually printed, or the receipt adds up to minutes nobody can read. */
  const todayOpen = !!(todayList && todayList.length && todayList[0].text);

  const totalMin = (todayOpen ? 1 : 0) + (brief && brief.body ? Number(brief.minutes) || 0 : 0) + (tale.body ? Number(tale.minutes) || 0 : 0);

  main.innerHTML = `
    <div class="content">
      ${held ? `<aside class="held">
        <p><strong>Tonight&rsquo;s is for Every day members.</strong>
        ${esc(heldTitle(held))} went out on ${esc(longDate(held.date))}.
        Here is your free one for this week.</p>
        <button class="btn btn-quiet" type="button" data-upgrade>Get every day &mdash; $6/month</button>
      </aside>` : ""}
      <div class="receipt-wrap">
        <div class="rcpt-controls">
          <button id="rcptSmaller" aria-label="Smaller text" title="Smaller text">A-</button>
          <button id="rcptBigger" aria-label="Bigger text" title="Bigger text">A+</button>
        </div>
        <div class="rcpt-tear"></div>
        <div class="receipt">
          <div class="rcpt-brand">
            <div class="rcpt-wordmark">SAINTS <span class="amp">&amp;</span> DRAGONS</div>
            <div class="rcpt-tagline">History for dads &middot; Tales for bedtime</div>
            <div class="rcpt-dateline">${esc(receiptDate(card.date))}</div>
          </div>

          <div class="rcpt-dots">&middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot;</div>

          <section class="rcpt-slot">
            <div class="rcpt-slot-label"><span class="no">01</span> Today in History</div>
            ${todayOpen ? `
            ${todayList.map(e => `
            <div class="rcpt-hist-item">
              <p><span class="yr">${esc(e.year)}</span>${esc(firstSentence(e.text))}</p>
            </div>`).join("")}
            <a class="rcpt-more" href="#today/${shownKey}">Read the full entry &rarr;</a>` :
            todayList && todayList.length ? `<p>Kept for Every day members.</p>
            <a class="rcpt-more" href="#today/${shownKey}">See what is there &rarr;</a>` :
            `<p>Still being written for this date.</p>
            <a class="rcpt-more" href="#today">Browse today in history &rarr;</a>`}
          </section>

          <div class="rcpt-dots">&middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot;</div>

          <section class="rcpt-slot">
            <div class="rcpt-slot-label"><span class="no">02</span> History for You</div>
            ${brief ? `
            <h3 class="rcpt-story-title">${esc(brief.title)}</h3>
            <p>${esc(brief.hook)}</p>
            ${brief.stillWithUs ? `<p>${esc(brief.stillWithUs)}</p>` : ""}
            <a class="rcpt-more" href="#brief/${card.brief}">Read the full article &rarr;</a>` :
            `<p>No history today.</p>`}
          </section>

          <div class="rcpt-dots">&middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot;</div>

          <section class="rcpt-slot">
            <div class="rcpt-slot-label"><span class="no">03</span> Bedtime Story</div>
            <h3 class="rcpt-story-title">${esc(tale.title)}</h3>
            <p class="rcpt-dek">About ${esc(tale.minutes)} minutes &middot; ${esc(ageText(tale))}${tale.night ? ` &middot; part ${tale.night.n} of ${tale.night.of}` : ""}</p>
            ${tale.origin ? `<p class="rcpt-origin">${esc(tale.origin)}</p>` : ""}
            ${tale.body ? `<p class="rcpt-excerpt">&ldquo;${esc(tale.body[0])}&rdquo;</p>` : ""}
            <a class="rcpt-more" href="#tale/${card.tale}">Read the rest &rarr;</a>
          </section>

          <div class="rcpt-tally">
            ${todayOpen ? `<div class="row"><span>Today in history</span><span>1 min</span></div>` : ""}
            ${brief && brief.body ? `<div class="row"><span>History for you</span><span>${brief.minutes} min</span></div>` : ""}
            ${tale.body ? `<div class="row"><span>Bedtime story</span><span>${esc(tale.minutes)} min</span></div>` : ""}
            <div class="row grand"><span>Total</span><span>~${totalMin} min</span></div>
          </div>

          <div class="rcpt-foot">
            <p>One for you. One for them.</p>
          </div>
        </div>
        <div class="rcpt-tear is-bottom"></div>
      </div>

      <section class="rcpt-archive">
        <h3>Past days</h3>
        <p class="rcpt-archive-note">Missed one? It&rsquo;s all still here.</p>

        <div class="mini-strip">
          ${earlier.map(c => {
            const b = c.brief ? BRIEFS[c.brief] : null;
            const t = TALES[c.tale];
            const md = c.date.slice(5);
            const day = TODAY[md];
            return `<a class="mini" href="#${c.brief ? "brief/" + c.brief : "tale/" + c.tale}">
              <span class="mini-tear"></span>
              <span class="mini-paper">
                <span class="mini-wordmark">SAINTS <i class="amp">&amp;</i> DRAGONS</span>
                <span class="mini-date">${esc(miniDate(c.date))}</span>
                <span class="mini-dots">&middot; &middot; &middot; &middot; &middot; &middot;</span>
                ${day && day.length && day[0].text ? `<span class="mini-slot"><i class="no">01</i> Today in history</span>
                <span class="mini-title">${esc(day[0].year)} &mdash; ${esc(firstSentence(day[0].text))}</span>` : ""}
                <span class="mini-slot"><i class="no">02</i> History for you</span>
                <span class="mini-title">${esc(b ? b.title : "\u2014")}</span>
                ${b ? `<span class="mini-text">${esc(b.hook)}</span>` : ""}
                <span class="mini-slot"><i class="no">03</i> Bedtime story</span>
                <span class="mini-title">${esc(t.title)}</span>
                ${t.body ? `<span class="mini-text is-excerpt">&ldquo;${esc(t.body[0])}&rdquo;</span>`
                         : `<span class="mini-text is-excerpt">${esc(t.origin || "")}</span>`}
              </span>
              <span class="mini-fade"></span>
            </a>`;
          }).join("")}
        </div>

        <a class="rcpt-archive-link" href="#history">Browse all the history &rarr;</a>
      </section>
    </div>`;

  let scale = 1;
  try {
    const saved = parseFloat(localStorage.getItem("receipt-scale"));
    if (saved >= 0.8 && saved <= 1.4) scale = saved;
  } catch (e) {}
  const wrap = document.querySelector(".receipt-wrap");
  wrap.style.setProperty("--rcpt-scale", scale);
  function setScale(v) {
    scale = Math.min(1.4, Math.max(0.8, Math.round(v * 100) / 100));
    wrap.style.setProperty("--rcpt-scale", scale);
    try { localStorage.setItem("receipt-scale", String(scale)); } catch (e) {}
  }
  document.getElementById("rcptBigger").addEventListener("click", () => setScale(scale + 0.1));
  document.getElementById("rcptSmaller").addEventListener("click", () => setScale(scale - 0.1));
}

function renderSearch(query) {
  const q = query.toLowerCase();
  const briefHits = Object.entries(BRIEFS).filter(([, b]) =>
    (b.title + " " + b.hook + " " + b.era + " " + b.kind).toLowerCase().includes(q));
  const taleHits = Object.entries(TALES).filter(([, t]) =>
    (t.title + " " + (t.theme || "") + " " + t.virtue + " " + t.origin + " " + (t.source || "")).toLowerCase().includes(q));
  const hits = briefHits.length + taleHits.length;

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Search</h2>
        <p>${hits} match${hits === 1 ? "" : "es"} for “${esc(query)}” across History for dads and Bedtime stories.</p>
      </header>
      ${hits ? `<div class="shelf">
        ${briefHits.map(([slug, b]) => briefCardHTML(slug, b)).join("")}
        ${taleHits.map(([slug, t]) => taleCardHTML(slug, t)).join("")}
      </div>` : `<p class="empty">No entries match “${esc(query)}”. Try a name, an era, or a theme.</p>`}
    </div>`;
}

/* ----------------------------------------------------- History for dads */

function renderHistory() {
  const f = filters.history;
  const list = Object.entries(BRIEFS).filter(([, b]) =>
    (!f.era || b.era === f.era) && (!f.kind || b.kind === f.kind));

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>The history you were never given.</h2>
        <p>How it actually happened, and why. One person, battle or builder at a time.</p>
      </header>

      <div class="filter-row">
        <p class="filter-label">By era</p>
        <div class="chips">${withContent(ERAS, BRIEFS, "era").map(e => chip("history", "era", e, e)).join("")}</div>
      </div>
      <div class="filter-row">
        <p class="filter-label">By subject</p>
        <div class="chips">${withContent(KINDS, BRIEFS, "kind").map(k => chip("history", "kind", k, k)).join("")}</div>
      </div>

      ${list.length ? `<div class="shelf">${list.map(([slug, b]) => briefCardHTML(slug, b)).join("")}</div>`
        : `<p class="empty">Nothing here yet. Clear a filter, or check back — new history goes up every day.</p>`}
    </div>`;
}

/* ------------------------------------------------------ Today in history */

function renderToday(md) {
  const asked = md || todayKey();
  const entry = TODAY[asked];
  const shown = entry ? asked : nearestKey(asked);
  const list = shown ? TODAY[shown] : null;
  const prev = shiftKey(asked, -1);
  const next = shiftKey(asked, 1);
  const marked = Object.keys(TODAY).sort();

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Today in history</h2>
        <p>One true thing that happened on this date.</p>
      </header>

      <p class="date-line">${esc(dayLabel(asked))}</p>

      ${entry ? "" : `<p class="empty-note">Nothing for this date yet. Here&rsquo;s the closest one: ${esc(dayLabel(shown))}.</p>`}

      ${list && list.length ? list.map(e => `
      <article class="entry${e.text ? "" : " is-locked"}">
        <p class="entry-year">${esc(e.year)}</p>
        ${e.text ? `<p class="entry-text">${esc(e.text)}</p>`
                 : `<p class="entry-text is-held">Kept for Every day members.</p>`}
        ${e.brief || e.tale ? `<p class="entry-links">
          ${e.brief ? `<a href="#brief/${e.brief}">Read the full history</a>` : ""}
          ${e.tale ? `<a href="#tale/${e.tale}">Read the bedtime story that goes with it</a>` : ""}
        </p>` : ""}
      </article>`).join("") : `<p class="empty">Nothing here yet.</p>`}

      ${list && list.length && !list[0].text
        ? lockPanel("Today in history, every day of the year.",
            "Today's date is always free. The rest of the calendar comes with Every day.")
        : ""}

      <nav class="date-nav">
        <a href="#today/${prev}">Yesterday</a>
        <a href="#today/${next}">Tomorrow</a>
        <label class="date-pick"><span>Pick a date</span><input type="date" id="datePick" /></label>
      </nav>

      <p class="filter-label">Dates with an entry</p>
      <div class="chips">${marked.map(k =>
        `<a class="chip${k === shown ? " is-on" : ""}" href="#today/${k}">${esc(dayLabel(k))}</a>`).join("")}</div>
    </div>`;

  const pick = document.getElementById("datePick");
  pick.addEventListener("change", () => {
    if (pick.value) location.hash = "#today/" + pick.value.slice(5);
  });
}

/* -------------------------------------------------------- Bedtime stories */

function renderBedtime() {
  const f = filters.bedtime;
  /* a multi-part story is one card on the shelf, opened at part 1; the tale
     page links the other parts */
  const list = Object.entries(TALES).filter(([, t]) =>
    (!t.night || t.night.n === 1) &&
    (!f.age || t.age === f.age) &&
    (!f.theme || t.theme === f.theme) &&
    (!f.virtue || t.virtue === f.virtue));

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Bedtime stories to read aloud.</h2>
        <p>Fairy tales, legends and true stories, retold for ages 4&ndash;9.</p>
      </header>

      <div class="filter-row">
        <p class="filter-label">Who's listening?</p>
        <div class="chips">
          ${Object.entries(AGE_BANDS).map(([id, label]) =>
            chip("bedtime", "age", Number(id), label)).join("")}
        </div>
      </div>

      <div class="filter-row">
        <p class="filter-label">What&rsquo;s in it?</p>
        <div class="chips">${withContent(THEMES, TALES, "theme").map(t => chip("bedtime", "theme", t, t)).join("")}</div>
      </div>

      <div class="filter-row">
        <p class="filter-label">What&rsquo;s it about?</p>
        <div class="chips">${withContent(VIRTUES, TALES, "virtue").map(v => chip("bedtime", "virtue", v, v)).join("")}</div>
        <p class="filter-note">Pick one for something that happened today.</p>
      </div>

      ${list.length ? `<div class="shelf">${list.map(([slug, t]) => taleCardHTML(slug, t)).join("")}</div>`
        : `<p class="empty">Nothing here yet. Clear a filter, or check back — new stories go up every day.</p>`}
    </div>`;
}

/* --------------------------------------------------------- detail pages */

function renderBrief(slug) {
  const b = BRIEFS[slug];
  if (!b) return renderMissing("That page isn't here.", "history", "History for dads");
  const tale = TALES[b.tale];

  main.innerHTML = `
    <div class="content">
      ${backLink("history", "History for dads")}
      <header class="page-head">
        <h2>${esc(b.title)}</h2>
        <p>${esc(b.era)} · ${esc(b.kind)} · ${b.minutes} min</p>
      </header>
      <p class="lede">${esc(b.hook)}</p>
      ${b.body
        ? `<div class="post-body">${b.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>`
        : lockPanel("This one is in the archive.",
            `${b.minutes} minutes, and it is one of every history written so far \u2014 all of them yours on Every day, with a new one each morning.`)}
      ${b.stillWithUs ? `<p class="callout"><strong>Still around today.</strong> ${esc(b.stillWithUs)}</p>` : ""}
      ${tale ? `<p class="callout"><strong>Bedtime story.</strong> <a href="#tale/${b.tale}">${esc(tale.title)}</a> · ${esc(tale.minutes)} min read-aloud</p>` : ""}
    </div>`;
}

function renderTale(slug) {
  const t = TALES[slug];
  if (!t) return renderMissing("That story isn't here.", "bedtime", "Bedtime stories");
  const brief = t.brief ? BRIEFS[t.brief] : null;
  const siblings = t.series
    ? Object.entries(TALES).filter(([, x]) => x.series === t.series)
        .sort((a, b) => a[1].night.n - b[1].night.n)
    : [];

  main.innerHTML = `
    <div class="content">
      ${backLink("bedtime", "Bedtime stories")}
      <header class="page-head">
        <h2>${esc(t.title)}</h2>
        <p>${esc(ageText(t))} · ${esc(t.minutes)} min read-aloud${t.theme ? ` · ${esc(t.theme)}` : ""} · ${esc(t.virtue)} · ${esc(t.origin)}${t.night ? ` · part ${t.night.n} of ${t.night.of}` : ""}</p>
      </header>
      ${t.source ? `<p class="tale-source"><strong>Where it comes from.</strong> ${esc(t.source)}</p>` : ""}
      ${t.body
        ? `<div class="tale-body">${t.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>`
        : lockPanel("This story is in the archive.",
            `${ageText(t)}, about ${t.minutes} minutes out loud. Every story so far is yours on Every day, and a new one lands each night.`)}
      ${siblings.length ? `<p class="callout"><strong>All parts.</strong> ${siblings.map(([s, x]) =>
        s === slug ? `<span class="is-here">Part ${x.night.n}</span>` : `<a href="#tale/${s}">Part ${x.night.n}</a>`).join(" · ")}</p>` : ""}
      ${brief ? `<p class="callout"><strong>Goes with.</strong> <a href="#brief/${t.brief}">${esc(brief.title)}</a> · ${brief.minutes} min read for you</p>` : ""}
    </div>`;
}

/* ------------------------------------------------- the reader's own pages */

const AGE_CHOICES = [
  ["0-2", "0\u20132"], ["3-5", "3\u20135"], ["6-9", "6\u20139"], ["10+", "10+"]
];

/* Two questions, asked once, and both of them do work: the name is how the
   emails say hello, and the age ranges set the starting filter on the
   bedtime shelf so a father of a five-year-old is not shown stories for a
   nine-year-old first. Anything we would not use, we do not ask for. */
function renderWelcome() {
  const name = ME && ME.firstName ? ME.firstName : "";
  const chosen = new Set((ME && ME.childAges) || []);

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>${name ? `Hello, ${esc(name)}.` : "You're in."}</h2>
        <p>Two questions, then tonight's story.</p>
      </header>
      <form class="prose" id="welcomeForm">
        <label class="field"><span>What should we call you?</span>
          <input type="text" name="firstName" value="${esc(name)}" autocomplete="given-name" placeholder="Tom" /></label>

        <fieldset class="field">
          <span>How old are they?</span>
          <div class="chips">${AGE_CHOICES.map(([id, label]) => `
            <label class="chip chip-check${chosen.has(id) ? " is-on" : ""}">
              <input type="checkbox" name="childAges" value="${id}"${chosen.has(id) ? " checked" : ""} />
              ${esc(label)}
            </label>`).join("")}</div>
          <p class="filter-note">Pick as many as you have. It sets which bedtime stories we put in front of you first.</p>
        </fieldset>

        <button class="btn" type="submit">Take me to tonight's</button>
        <p class="filter-note" id="welcomeStatus" role="status" aria-live="polite"></p>
      </form>
    </div>`;

  const form = document.getElementById("welcomeForm");
  const status = document.getElementById("welcomeStatus");
  form.addEventListener("change", ev => {
    const box = ev.target.closest("input[type=checkbox]");
    if (box) box.closest(".chip").classList.toggle("is-on", box.checked);
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "";
    const body = {
      firstName: form.firstName.value.trim(),
      childAges: [...form.querySelectorAll("input[name=childAges]:checked")].map(b => b.value)
    };
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const saved = await res.json();
      ME.firstName = saved.firstName;
      ME.childAges = saved.childAges;
      ME.onboarded = true;
      /* Their answer is worth something immediately, not on some later
         visit: the shelf opens on the youngest band they told us about. */
      applyAgePreference();
      location.hash = "#home";
    } catch (err) {
      console.warn("profile did not save", err);
      status.textContent = "That did not save. Try again in a moment \u2014 you can also skip it and read tonight's.";
      btn.disabled = false;
    }
  });
}

/* The bands a child's age range can land in, youngest first. Keyed off
   AGE_BANDS so adding a band in data/content.js reaches here too. */
function bandForAges(ranges) {
  if (!ranges || !ranges.length) return null;
  const ids = Object.keys(AGE_BANDS).map(Number).sort((a, b) => a - b);
  if (!ids.length) return null;
  /* '0-2' and '3-5' want the youngest band; '6-9' and '10+' the next one up. */
  const young = ranges.some(r => r === "0-2" || r === "3-5");
  return young ? ids[0] : ids[ids.length - 1];
}

function applyAgePreference() {
  if (filters.bedtime.age != null) return;      /* never override a click */
  const band = bandForAges(ME && ME.childAges);
  if (band != null) filters.bedtime.age = band;
}

/* The stored value is an id ('3-5'); the reader is shown the label ('3\u20135'),
   the same one the chips use. Same reasoning as ageText for a tale. */
function ageRangeLabels(ids) {
  const labels = new Map(AGE_CHOICES);
  return ids.map(id => labels.get(id) || id).join(" \u00b7 ");
}

function planLine() {
  if (!ME) return "";
  if (ME.plan !== "paid") return "Free \u2014 one history and one bedtime story a week.";
  const sub = ME.subscription || {};
  const ends = sub.currentPeriodEnd ? longDate(String(sub.currentPeriodEnd).slice(0, 10)) : null;
  if (sub.cancelAtPeriodEnd) return `Every day, ending${ends ? ` on ${ends}` : ""}.`;
  if (sub.status === "past_due") return "Every day \u2014 your last payment did not go through. Stripe will try again; update your card to be sure.";
  return `Every day${ends ? `, renewing on ${ends}` : ""}.`;
}

function renderAccount() {
  const paid = isPaid();
  const ages = (ME && ME.childAges) || [];

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Your account</h2>
        <p>Who you are, what you are on, and how to leave.</p>
      </header>

      <dl class="account-facts">
        <div><dt>Email</dt><dd>${esc(ME.email)}</dd></div>
        <div><dt>Name</dt><dd>${esc(ME.firstName || "\u2014")}</dd></div>
        <div><dt>Children</dt><dd>${ages.length ? esc(ageRangeLabels(ages)) : "\u2014"}</dd></div>
        <div><dt>Member since</dt><dd>${esc(longDate(String(ME.memberSince).slice(0, 10)))}</dd></div>
        <div><dt>Plan</dt><dd>${esc(planLine())}</dd></div>
      </dl>

      ${paid
        ? `<p class="callout"><strong>Billing.</strong> Cards, invoices and cancelling all live with Stripe.
             <button class="btn btn-quiet" type="button" id="portalBtn">Manage billing</button></p>`
        : lockPanel("Every day, instead of once a week.",
            "A new history and a new bedtime story every day, and every past one to keep.")}

      <p class="filter-note" id="accountStatus" role="status" aria-live="polite"></p>

      <p class="callout"><a href="#welcome">Change your name or your children's ages</a></p>

      <form method="POST" action="/api/auth/logout" id="logoutForm">
        <button class="btn btn-quiet" type="submit">Log out</button>
      </form>
    </div>`;

  const status = document.getElementById("accountStatus");

  document.getElementById("portalBtn")?.addEventListener("click", async ev => {
    ev.target.disabled = true;
    status.textContent = "Opening Stripe\u2026";
    try {
      await goToStripe("/api/billing/portal");
    } catch (err) {
      status.textContent = "Stripe did not open. Try again in a moment.";
      ev.target.disabled = false;
    }
  });

  document.getElementById("logoutForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    location.href = "/";
  });
}

/* Both billing buttons do the same thing: ask our side for a Stripe URL and
   hand the reader over. Nothing about a card is ever typed on this site. */
async function goToStripe(endpoint) {
  const res = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const { url } = await res.json();
  if (!url) throw new Error("no url");
  location.href = url;
}

function renderMissing(msg, hash, label) {
  main.innerHTML = `<div class="content"><p class="empty">${esc(msg)}</p>${backLink(hash, label)}</div>`;
}

/* ------------------------------------------------------------- routing */

/* per-page title and meta description, from the copy doc */
const META = {
  home:    ["Saints & Dragons | History for dads, tales for bedtime",
            "Dads learning things worth knowing & passing them on to their kids. History, faith and virtue, handed down rather than explained."],
  history: ["History for Dads | Saints & Dragons",
            "Short history on how things actually worked \u2014 battles, builders, saints and Romans, each with a bedtime story on the same idea."],
  today:   ["Today in History | Saints & Dragons",
            "One short, true story for each date on the calendar."],
  bedtime: ["Bedtime Stories for Ages 4 to 9 | Saints & Dragons",
            "Fairy tales, legends and true stories retold for reading aloud, for ages 4 to 9. Knights, dragons, castles and the sea."],
  welcome: ["Welcome | Saints & Dragons", "Two questions, then tonight's story."],
  account: ["Your account | Saints & Dragons", "Your plan, your details, and how to leave."]
};

const DEFAULT_META = [document.title,
  document.querySelector('meta[name="description"]').getAttribute("content")];

function setMeta(key, param) {
  let [title, desc] = META[key] || DEFAULT_META;
  if (key === "brief" && BRIEFS[param]) {
    title = `${BRIEFS[param].title} | Saints & Dragons`;
    desc = BRIEFS[param].hook;
  } else if (key === "tale" && TALES[param]) {
    title = `${TALES[param].title} | Saints & Dragons`;
    desc = `A bedtime story to read aloud. ${ageText(TALES[param])}, about ${TALES[param].minutes} minutes.`;
  }
  document.title = title;
  document.querySelector('meta[name="description"]').setAttribute("content", desc);
}

/* which sidebar link lights up for a given route */
const NAV_OWNER = { brief: "#history", tale: "#bedtime", today: "#today",
                    welcome: "#account" };

/* routes printed on receipt paper, so they match the card on #home */
const PAPER_ROUTES = new Set(["history", "today", "bedtime", "brief", "tale"]);

function route() {
  const raw = (location.hash || "#home").slice(1);

  /* Home is Tonight. #tonight is an old link, not a page — send it home. */
  if (raw === "tonight") { location.hash = "#home"; return; }

  const [key, param] = [raw.split("/")[0], raw.split("/").slice(1).join("/")];
  const owner = NAV_OWNER[key] || "#" + key;

  document.querySelectorAll(".nav-item").forEach(a =>
    a.classList.toggle("is-active", a.getAttribute("href") === owner));
  main.classList.toggle("is-paper", PAPER_ROUTES.has(key));
  setMeta(key, param);

  if (key === "history") renderHistory();
  else if (key === "today") renderToday(param);
  else if (key === "bedtime") renderBedtime();
  else if (key === "brief") renderBrief(param);
  else if (key === "tale") renderTale(param);
  else if (key === "welcome") renderWelcome();
  else if (key === "account") renderAccount();
  else if (key === "home" || !PAGES[key]) renderHome(searchInput.value);
  else renderPage(key);

  main.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  closeSidebar();
}

/* filter chips, delegated so re-renders keep working */
main.addEventListener("click", ev => {
  const btn = ev.target.closest("button.chip");
  if (!btn) return;
  const { group, field } = btn.dataset;
  let value = btn.dataset.value;
  if (field === "age") value = Number(value);
  filters[group][field] = filters[group][field] === value ? null : value;
  route();
});

/* search */
searchInput.addEventListener("input", () => {
  if ((location.hash || "#home") !== "#home") location.hash = "#home";
  else renderHome(searchInput.value);
});

/* theme */
const root = document.documentElement;
const stored = localStorage.getItem("sd-theme");
if (stored) root.setAttribute("data-theme", stored);
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("sd-theme", next);
});

/* mobile sidebar */
const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");
const toggle = document.getElementById("mobileToggle");

function closeSidebar() {
  sidebar.classList.remove("is-open");
  scrim.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}
toggle.addEventListener("click", () => {
  const open = sidebar.classList.toggle("is-open");
  scrim.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});
scrim.addEventListener("click", closeSidebar);

/* every "get every day" button on every page, delegated for the same reason
   the chips are: these panels are re-rendered on each route */
main.addEventListener("click", async ev => {
  const btn = ev.target.closest("[data-upgrade]");
  if (!btn) return;
  btn.disabled = true;
  const label = btn.textContent;
  btn.textContent = "Opening Stripe\u2026";
  try {
    await goToStripe("/api/billing/checkout");
  } catch (err) {
    console.warn("checkout did not open", err);
    btn.textContent = label;
    btn.disabled = false;
    btn.insertAdjacentHTML("afterend",
      `<p class="filter-note">Stripe did not open. Try again in a moment.</p>`);
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ------------------------------------------------------------------ boot

   Nothing above here may run before this has answered: every renderer reads
   CARDS, BRIEFS, TALES and TODAY, and those are empty until /api/session
   fills them. A 401 is not an error — it is a reader who is not logged in,
   and they go to /login carrying where they were headed so the link in
   their inbox lands them back on it. */
async function boot() {
  let data;
  try {
    const res = await fetch("/api/session", { headers: { Accept: "application/json" } });
    if (res.status === 401) {
      const next = location.pathname + location.search + location.hash;
      location.replace("/login/?next=" + encodeURIComponent(next));
      return;
    }
    if (!res.ok) throw new Error("HTTP " + res.status);
    data = await res.json();
  } catch (err) {
    console.error("could not load your account", err);
    main.innerHTML = `<div class="content"><header class="page-head">
        <h2>We could not reach the site.</h2>
        <p>Tonight's story is still there. Reload the page, and if it keeps
           happening it is us, not you.</p>
      </header>
      <p><button class="btn" type="button" onclick="location.reload()">Try again</button></p>
    </div>`;
    return;
  }

  ME = data.user;
  ({ CARDS, BRIEFS, TALES, TODAY, ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS } = data.content);
  applyAgePreference();

  /* Coming back from Stripe. The webhook is what actually grants the plan,
     and it can land a moment after the reader does, so say what is true
     rather than guessing. */
  const params = new URLSearchParams(location.search);
  const checkout = params.get("checkout");
  if (checkout) {
    history.replaceState(null, "", location.pathname + location.hash);
    if (checkout === "done" && !isPaid()) {
      /* Give the webhook a beat and ask once more. A reload is the honest
         way to pick up the answer: the whole payload changes when the plan
         does, and patching half of it into a drawn page is how two surfaces
         end up disagreeing. */
      setTimeout(async () => {
        const again = await fetch("/api/session")
          .then(r => (r.ok ? r.json() : null)).catch(() => null);
        if (again && again.user.plan === "paid") location.reload();
      }, 2500);
    }
  }

  /* Arriving from the paid plan on the landing page, by way of the login
     link: they already chose to pay, so open Stripe rather than making them
     find the button again. A reader who is already paying just lands. */
  if (params.get("upgrade")) {
    history.replaceState(null, "", location.pathname + location.hash);
    if (!isPaid()) {
      try {
        await goToStripe("/api/billing/checkout");
        return;
      } catch (err) {
        console.warn("checkout did not open", err);
      }
    }
  }

  if (!ME.onboarded && !location.hash) location.hash = "#welcome";

  window.addEventListener("hashchange", route);
  route();
}

boot();
