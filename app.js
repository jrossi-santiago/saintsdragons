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

   A locked brief or tale arrives with everything except its text, and a
   locked card without its question, why-ours line and prayer. So the test
   for "may I print this" is the presence of the words, never a flag: see
   `briefHasText` below, and api/_lib/content.js for the other half of the
   deal. A brief's words are a flat `body` in the older shape and `opening`
   plus `sections` in the one written to docs/history-for-dads.md. */
let CARDS = [], BRIEFS = {}, TALES = {}, TODAY = {};
let ERAS = [], KINDS = [], THEMES = [], VIRTUES = [], AGE_BANDS = {};
let SEVEN = [];
/* The day the server says it is, in the release clock's zone (12:01am
   Eastern; see api/_lib/content.js). Null only before boot(). */
let RELEASE_DAY = null;

/* The signed-in reader. Null only before boot() has answered. */
let ME = null;

const isPaid = () => !!ME && ME.plan === "paid";
const isOpen = item => !!item && !item.locked;
const briefHasText = b => !!b && !!(b.body || b.opening || b.sections);

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
          <li><strong>Not trivia.</strong> Every piece is about how a thing actually worked, why it came out the way it did, and what it cost somebody. The odd details go in side notes at the end, for when you have a minute more.</li>
          <li><strong>Not a course.</strong> Nobody is testing you. You get to learn things because they are good.</li>
          <li><strong>Not a sermon.</strong> The history is history: named sources, dates, and an honest line about what the evidence can carry. Where a story has a virtue in it, the story carries it. We don't stop to explain the lesson. You get one question to ask them at dinner, and it comes out of the story, not out of a moral.</li>
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

/* "2026-09-17" -> "Thu \u00b7 Sep 17" (the pager's dates under the receipt,
   short enough that both fit side by side on a phone) */
function pagerDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
  return `${day} \u00b7 ${MONTHS[m - 1].slice(0, 3)} ${d}`;
}

/* "09-21" -> "September 21" */
function dayLabel(md) {
  const [m, d] = md.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/* "Today" is the server's release day, not the reader's clock, so the
   receipt, the free Today-in-history date and the default #today all turn
   over when the night is released. The clock is only a fallback. */
function todayKey() {
  if (RELEASE_DAY) return RELEASE_DAY.slice(5);
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
  return RELEASE_DAY || new Date().getFullYear() + "-" + todayKey();
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
   about. The button opens #checkout; the handler is delegated, at the
   foot of this file. */
function lockPanel(heading, line, { small = false } = {}) {
  return `<aside class="lock${small ? " is-small" : ""}">
    <p class="lock-kicker">Every day &middot; $6 a month</p>
    <h3>${esc(heading)}</h3>
    <p>${esc(line)}</p>
    <button class="btn" type="button" data-upgrade>Start full access</button>
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
/* Home is Tonight: the card is not behind a click. Every earlier night is
   the same receipt, one turn back: ‹ and ›, a swipe, or the arrow keys.
   Each has its own address, #home/YYYY-MM-DD, so Back works and a night
   can be shared. Plain #home is tonight. */

/* One receipt, for any night. Tonight and every earlier night are drawn by
   this and nothing else, so they cannot drift apart the way the live card
   once drifted from its mockup (see CLAUDE.md, Design references). */
function receiptHTML(card) {
  const brief = card.brief ? BRIEFS[card.brief] : null;
  const tale = TALES[card.tale];

  /* Today in history follows the receipt's own date, not the clock, so the
     dateline and the entry under it can never be two different days. */
  const askedKey = card.date.slice(5);
  const shownKey = TODAY[askedKey] ? askedKey : nearestKey(askedKey);
  const todayList = shownKey ? TODAY[shownKey] : null;
  /* A free reader gets today's date and not the rest of the calendar, so an
     entry can be present but held back. The tally must count what is
     actually printed, or the receipt adds up to minutes nobody can read. */
  const todayOpen = !!(todayList && todayList.length && todayList[0].text);

  const totalMin = (todayOpen ? 1 : 0) + (briefHasText(brief) ? Number(brief.minutes) || 0 : 0) + (tale.body ? Number(tale.minutes) || 0 : 0);

  return `
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
            <a class="rcpt-more" href="#brief/${card.brief}">${briefHasText(brief) ? "Read the full article" : "See what&rsquo;s in it"} &rarr;</a>` :
            `<p>No history today.</p>`}
          </section>

          <div class="rcpt-dots">&middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot;</div>

          <section class="rcpt-slot">
            <div class="rcpt-slot-label"><span class="no">03</span> Bedtime Story</div>
            <h3 class="rcpt-story-title">${esc(tale.title)}</h3>
            <p class="rcpt-dek">About ${esc(tale.minutes)} minutes &middot; ${esc(ageText(tale))}${tale.night ? ` &middot; part ${tale.night.n} of ${tale.night.of}` : ""}</p>
            ${tale.origin ? `<p class="rcpt-origin">${esc(tale.origin)}</p>` : ""}
            ${tale.body ? `<p class="rcpt-excerpt">&ldquo;${esc(tale.body[0])}&rdquo;</p>` : ""}
            <a class="rcpt-more" href="#tale/${card.tale}">${tale.body ? "Read the rest" : "See what&rsquo;s in it"} &rarr;</a>
          </section>

          ${totalMin ? `<div class="rcpt-tally">
            ${todayOpen ? `<div class="row"><span>Today in history</span><span>1 min</span></div>` : ""}
            ${briefHasText(brief) ? `<div class="row"><span>History for you</span><span>${brief.minutes} min</span></div>` : ""}
            ${tale.body ? `<div class="row"><span>Bedtime story</span><span>${esc(tale.minutes)} min</span></div>` : ""}
            <div class="row grand"><span>Total</span><span>~${totalMin} min</span></div>
          </div>` : ""}

          <div class="rcpt-foot">
            <p>One for you. One for them.</p>
          </div>
        </div>
        <div class="rcpt-tear is-bottom"></div>`;
}

/* Which way the last turn went, so the next receipt slides in from the
   side the reader pushed it. Reset after each draw; a plain visit to #home
   just appears. */
let rcptTurn = "";

function renderHome(query = "", date = "") {
  const q = query.trim();
  if (q) return renderSearch(q);

  const { card: home, held } = homeCard();
  /* An address for a night that is not out (or not a night) is just #home. */
  const card = (date && CARDS.find(c => c.date === date)) || home;
  const at = CARDS.indexOf(card);
  const older = CARDS[at - 1];
  const newer = CARDS[at + 1];
  const isHome = card === home;

  /* For a free reader tonight is often held back and #home opens on their
     free night instead, so "tonight" is not always the newest receipt: the
     held one is one turn to the right, drawn locked. */
  const hrefFor = c => c === home ? "#home" : "#home/" + c.date;
  const turn = rcptTurn;
  rcptTurn = "";

  main.innerHTML = `
    <div class="content">
      ${held && isHome ? `<aside class="held">
        <p><strong>Tonight&rsquo;s is for Every day members.</strong>
        ${esc(heldTitle(held))} went out on ${esc(longDate(held.date))}.
        Here is your free one for this week.</p>
        <button class="btn btn-quiet" type="button" data-upgrade>Start full access &mdash; $6/month</button>
      </aside>` : ""}
      <div class="receipt-wrap${turn ? " is-turning-" + turn : ""}">
        <div class="rcpt-controls">
          <button id="rcptSmaller" aria-label="Smaller text" title="Smaller text">A-</button>
          <button id="rcptBigger" aria-label="Bigger text" title="Bigger text">A+</button>
        </div>
        ${receiptHTML(card)}
      </div>

      ${card.locked ? `<div class="rcpt-lock">${lockPanel(
        `${heldTitle(card)} is for Every day members.`,
        "Every night's history and bedtime story, in full, and every night before it.",
        { small: true })}</div>` : ""}

      <nav class="rcpt-pager" aria-label="Earlier and later nights">
        ${older ? `<a class="rcpt-turn is-older" href="${hrefFor(older)}" data-turn="older" rel="prev">
          <span class="rcpt-turn-arrow" aria-hidden="true">&lsaquo;</span>
          <span><span class="rcpt-turn-label">Earlier</span>${esc(pagerDate(older.date))}</span>
        </a>` : `<span class="rcpt-turn is-older is-end">The first night</span>`}
        ${newer ? `<a class="rcpt-turn is-newer" href="${hrefFor(newer)}" data-turn="newer" rel="next">
          <span><span class="rcpt-turn-label">Later</span>${esc(pagerDate(newer.date))}</span>
          <span class="rcpt-turn-arrow" aria-hidden="true">&rsaquo;</span>
        </a>` : `<span class="rcpt-turn is-newer is-end">The newest night</span>`}
      </nav>

      <p class="rcpt-pager-hint">${isHome
        ? "Missed one? Turn back through every night with &lsaquo; and &rsaquo;, or swipe."
        : `<a class="rcpt-pager-now" href="#home">Back to tonight</a>`}</p>
      <p class="rcpt-archive"><a class="rcpt-archive-link" href="#history">Browse all the history &rarr;</a></p>
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

  /* A swipe across the paper turns it. Earlier nights sit to the left, so
     dragging the paper right brings the night before, and left the night
     after. Only a clearly sideways swipe counts, so scrolling down a long
     receipt never turns it by accident. */
  let x0 = null, y0 = null;
  wrap.addEventListener("touchstart", ev => {
    const t = ev.touches[0];
    x0 = t.clientX; y0 = t.clientY;
  }, { passive: true });
  wrap.addEventListener("touchend", ev => {
    if (x0 === null) return;
    const t = ev.changedTouches[0];
    const dx = t.clientX - x0, dy = t.clientY - y0;
    x0 = y0 = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    turnReceipt(dx > 0 ? "older" : "newer");
  }, { passive: true });
}

/* Follows the pager's own link, so a swipe, a key and a click all land on
   the same address. Does nothing at either end. */
function turnReceipt(dir) {
  const link = main.querySelector(`.rcpt-turn[data-turn="${dir}"]`);
  if (!link) return;
  rcptTurn = dir;
  location.hash = link.getAttribute("href");
}

main.addEventListener("click", ev => {
  const link = ev.target.closest(".rcpt-turn[data-turn]");
  if (link) rcptTurn = link.dataset.turn;
});

document.addEventListener("keydown", ev => {
  if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
  if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
  if (ev.target.closest && ev.target.closest("input, textarea, select, [contenteditable]")) return;
  if (!main.querySelector(".rcpt-pager")) return;
  turnReceipt(ev.key === "ArrowLeft" ? "older" : "newer");
});

function renderSearch(query) {
  const q = query.toLowerCase();
  const briefHits = Object.entries(BRIEFS).filter(([, b]) =>
    (b.title + " " + b.hook + " " + b.era + " " + b.kind + " " + (b.dek || "") + " " + briefSearchText(b))
      .toLowerCase().includes(q));
  const taleHits = Object.entries(TALES).filter(([, t]) =>
    (t.title + " " + (t.theme || "") + " " + t.virtue + " " + t.origin + " " + (t.source || "")).toLowerCase().includes(q));
  const hits = briefHits.length + taleHits.length;

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Search</h2>
        <p>${hits} match${hits === 1 ? "" : "es"} for “${esc(query)}” across History for Dads and Bedtime stories.</p>
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

/* The words of a new-format brief (see the note above BRIEFS in
   data/content.js), for search. Only an open brief has them; a locked one
   arrives without, so this is empty and search sees what it always saw. The
   older briefs' flat body is not searched, as before. */
function briefSearchText(b) {
  if (!b.sections) return "";
  return [b.opening, b.kidsQuestion,
    ...b.sections.flatMap(s => [s.heading, ...s.body]),
    ...(b.sideNotes || []).flatMap(n => [n.lead, n.text])].join(" ");
}

/* Escaped text with *ship names* in italics — the one bit of markup the
   history standard uses. New-format briefs only; the older ones never had it. */
function inline(text) {
  return esc(text).replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
}

/* The shape written to docs/history-for-dads.md: an opening with no header,
   headed sections, the question for the kids closing the last one, then
   the side notes as optional reading. */
function briefSectionsHTML(b) {
  const last = b.sections.length - 1;
  return `<div class="post-body brief-body">
      <p>${inline(b.opening)}</p>
      ${b.sections.map((s, i) => `
      <section class="brief-section">
        <h3>${inline(s.heading)}</h3>
        ${s.body.map(p => `<p>${inline(p)}</p>`).join("")}
        ${i === last && b.kidsQuestion ? `<p class="kids-q"><strong>A question for the kids:</strong> ${inline(b.kidsQuestion)}</p>` : ""}
      </section>`).join("")}
    </div>
    ${b.sideNotes && b.sideNotes.length ? `<aside class="side-notes" aria-labelledby="sideNotesHead">
      <h3 id="sideNotesHead">Side notes</h3>
      <ul>${b.sideNotes.map(n => `<li><strong>${inline(n.lead)}</strong> ${inline(n.text)}</li>`).join("")}</ul>
    </aside>` : ""}`;
}

function renderBrief(slug) {
  const b = BRIEFS[slug];
  if (!b) return renderMissing("That page isn't here.", "history", "History for Dads");
  const tale = TALES[b.tale];

  /* An open new-format brief starts on its own opening, which does the hook's
     job; printing both would say the same thing twice. Locked, the hook is
     all there is, so it stays. */
  const opened = !!b.sections;

  main.innerHTML = `
    <div class="content">
      ${backLink("history", "History for Dads")}
      <header class="page-head">
        <h2>${esc(b.title)}</h2>
        ${b.dek ? `<p class="brief-dek">${esc(b.dek).replace(/(\d)\u2013(\d)/g, "$1\u2060\u2013\u2060$2")}</p>` : ""}
        <p>${esc(b.era)} · ${esc(b.kind)} · ${b.minutes} min</p>
      </header>
      ${opened ? "" : `<p class="lede">${esc(b.hook)}</p>`}
      ${opened ? briefSectionsHTML(b)
        : b.body
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

/* ----------------------------------------------------- the seven stories */

/* The seven free stories, all of them, in full, for every reader: this is
   what the free sign-up promises, so nothing here is ever locked. Printing
   is the browser's own print of this page; the print rules in styles.css
   drop the chrome and start each story on a fresh sheet. */
function renderSeven() {
  const stories = SEVEN.filter(s => s && s.title);
  main.innerHTML = `
    <div class="content seven">
      <header class="page-head">
        <h2>7 Bedtime Stories</h2>
        <p>Seven stories to read out loud &mdash; one for every night of the week. Free, and yours to keep.</p>
      </header>
      <div class="seven-actions">
        <button class="btn" type="button" id="sevenPrint"><svg class="ic"><use href="#i-print"/></svg> Print all seven</button>
      </div>
      ${stories.length ? `<ol class="seven-contents">${stories.map((s, i) =>
        `<li><a href="#seven" data-seven="${i + 1}">${esc(s.title)}</a></li>`).join("")}</ol>` : ""}
      ${stories.map((s, i) => `
        <article class="seven-story" id="seven-${i + 1}">
          <p class="seven-night">Night ${i + 1}</p>
          <h3>${esc(s.title)}</h3>
          <div class="tale-body">${(s.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join("")}</div>
        </article>`).join("")}
    </div>`;

  document.getElementById("sevenPrint").addEventListener("click", () => window.print());
  /* The contents jump without touching the hash, which is the route. */
  main.querySelectorAll("[data-seven]").forEach(a => a.addEventListener("click", ev => {
    ev.preventDefault();
    document.getElementById("seven-" + a.dataset.seven).scrollIntoView({ behavior: "smooth" });
  }));
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
  /* A first answer leads on to the seven free stories the sign-up promised;
     coming back to change an answer ("Change your name…" on #account)
     leads home, as it always has. */
  const firstTime = !(ME && ME.onboarded);

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>${name ? `Hello, ${esc(name)}.` : "You're in."}</h2>
        <p>${firstTime ? "Two questions, then your seven free bedtime stories." : "Two questions, then tonight's story."}</p>
      </header>
      <form class="prose" id="welcomeForm">
        <label class="field"><span>What should we call you?</span>
          <input type="text" name="firstName" value="${esc(name)}" autocomplete="given-name" placeholder="Tom" /></label>

        <fieldset class="field">
          <span>Age range of story listeners?</span>
          <div class="chips">${AGE_CHOICES.map(([id, label]) => `
            <label class="chip chip-check${chosen.has(id) ? " is-on" : ""}">
              <input type="checkbox" name="childAges" value="${id}"${chosen.has(id) ? " checked" : ""} />
              ${esc(label)}
            </label>`).join("")}</div>
          <p class="filter-note">Pick as many as fits. It tailors the stories you will see.</p>
        </fieldset>

        <button class="btn" type="submit">${firstTime ? "Take me to the stories" : "Take me to tonight's"}</button>
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
      location.hash = firstTime ? "#seven" : "#home";
    } catch (err) {
      console.warn("profile did not save", err);
      status.textContent = firstTime
        ? "That did not save. Try again in a moment \u2014 or skip it: your seven stories are in the menu."
        : "That did not save. Try again in a moment \u2014 you can also skip it and read tonight's.";
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
  const pastBilling = !paid && !!(ME && ME.hasBilling);   /* left, but has invoices */
  const ages = (ME && ME.childAges) || [];

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Your account</h2>
        <p>Who you are, what you are on, and how to leave.</p>
      </header>

      <dl class="account-facts">
        <div><dt>Email</dt><dd>${esc(ME.email)}<button class="co-linkish" type="button" id="accountEmailChange">Change</button></dd><div id="accountEmailSlot" class="email-slot"></div></div>
        <div><dt>Name</dt><dd>${esc(ME.firstName || "\u2014")}</dd></div>
        <div><dt>Children</dt><dd>${ages.length ? esc(ageRangeLabels(ages)) : "\u2014"}</dd></div>
        <div><dt>Member since</dt><dd>${esc(longDate(String(ME.memberSince).slice(0, 10)))}</dd></div>
        <div><dt>Plan</dt><dd>${esc(planLine())}${pastBilling
          ? `<button class="co-linkish" type="button" id="portalBtn">Invoices and billing</button>` : ""}</dd></div>
      </dl>

      ${paid
        ? `<p class="callout"><strong>Billing.</strong> Cancelling, cards and invoices all live with Stripe.
             <button class="btn btn-quiet" type="button" id="portalBtn">Manage subscription</button></p>`
        : lockPanel("Every day, instead of once a week.",
            "A new history and a new bedtime story every day, and every past one to keep.")}

      <p class="filter-note" id="accountStatus" role="status" aria-live="polite"></p>

      <p class="callout"><a href="#welcome">Change your name or your children's ages</a></p>

      <form method="POST" action="/api/auth/logout" id="logoutForm">
        <button class="btn btn-quiet" type="submit">Log out</button>
      </form>
    </div>`;

  const status = document.getElementById("accountStatus");
  wireEmailChange(document.getElementById("accountEmailChange"), document.getElementById("accountEmailSlot"));
  if (emailJustChanged) {
    emailJustChanged = false;
    document.getElementById("accountEmailSlot").innerHTML =
      `<p class="co-msg" role="status">Done. Your address is now ${esc(ME.email)}, and receipts go there too.</p>`;
  }

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

/* Manage subscription: ask our side for a Billing Portal URL and hand the reader
   over to Stripe. (Paying is on our own page now — see #checkout — but
   cancelling, cards and invoices still live in Stripe's portal.) */
async function goToStripe(endpoint) {
  const res = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const { url } = await res.json();
  if (!url) throw new Error("no url");
  location.href = url;
}

/* ------------------------------------------------------------ #checkout

   The on-site checkout, drawn from mockups/checkout.html (the design
   reference — hold changes against it). Stripe's Checkout Sessions API in
   its custom UI mode: our server makes the session and hands back its client
   secret (api/billing/checkout.js), and Stripe.js mounts the card form and
   the Apple Pay / Google Pay buttons as iframes on this page. Card details
   are typed into those iframes and go straight to Stripe; nothing here ever
   sees them.

   Paying does not grant anything. Stripe sends the reader back to
   return_url, and the plan changes only when the webhook says so —
   drawCheckoutWaiting below asks until it has.

   Pinned to Stripe.js "basil" to match the API version in
   api/_lib/stripe.js. On basil, initCheckout is async and takes
   fetchClientSecret; from clover on it is synchronous and takes
   clientSecret, and dahlia renames it again. Move both pins together. */

const STRIPE_JS = "https://js.stripe.com/basil/stripe.js";
const PLAN_PRICE = "$6";                  /* matches lockPanel and index.html */

let stripeJs = null;                      /* the one <script> load */
let checkoutRun = 0;                      /* bumped per render; a stale start stops */
let liveCheckout = null;                  /* for re-theming while the page is open */
let checkoutReturned = false;             /* set by boot() on the way back from Stripe */
let checkoutSessionId = null;
let emailJustChanged = false;             /* set by boot(); #account says so once */             /* the cs_… Stripe put on the way back, if any */
let STRIPE_KEY = null;                    /* publishable, from /api/session */

/* Loaded only when a reader opens #checkout, never on every page: nobody
   reading tonight's story needs Stripe on the page. From js.stripe.com
   itself, as PCI requires — never bundled or self-hosted. */
function loadStripeJs() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (!stripeJs) {
    stripeJs = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = STRIPE_JS;
      s.onload = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error("Stripe.js loaded empty")));
      s.onerror = () => { stripeJs = null; reject(new Error("Stripe.js did not load")); };
      document.head.appendChild(s);
    });
  }
  return stripeJs;
}

/* The Appearance API cannot read our CSS (the form is an iframe), so hand
   it the live values of the same tokens the rest of the page is drawn in.
   Read at the moment of asking, so it follows the theme toggle. */
function stripeAppearance() {
  const cs = getComputedStyle(document.documentElement);
  const v = name => cs.getPropertyValue(name).trim();
  return {
    theme: "flat",
    labels: "above",
    variables: {
      fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSizeBase: "15px",
      colorPrimary: v("--accent"),
      colorBackground: v("--bg"),
      colorText: v("--text"),
      colorTextSecondary: v("--text-dim"),
      colorTextPlaceholder: v("--text-faint"),
      colorDanger: v("--accent"),
      borderRadius: v("--radius") || "12px",
      spacingUnit: "4px",
      gridRowSpacing: "14px",
      gridColumnSpacing: "12px"
    },
    rules: {
      ".Input": {
        backgroundColor: v("--surface"),
        border: `1px solid ${v("--line")}`,
        boxShadow: "none",
        padding: "12px 14px"
      },
      ".Input:focus": { border: `1px solid ${v("--text-faint")}`, boxShadow: "none", outline: "none" },
      ".Input--invalid": { border: `1px solid ${v("--accent")}`, boxShadow: "none" },
      ".Label": { fontSize: "14px", fontWeight: "400", color: v("--text-dim"), marginBottom: "6px" },
      ".Error": { fontSize: "13px", color: v("--accent") }
    }
  };
}

/* A basil result is { type: "success", session } or { type: "error", error }. */
const failed = r => !r || r.type === "error";

/* Stripe's amounts arrive formatted ("$6.00") inside an object; take the
   words as Stripe wrote them rather than doing currency sums here. */
function money(x) {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x.amount === "string") return x.amount;
  return "";
}

/* Declines and bad cards, said the way the rest of the site talks. Anything
   not listed falls back to Stripe's own sentence, which is always true even
   when it is not ours. */
function checkoutErrorText(error) {
  const code = error && (error.code || error.decline_code || (error.error && error.error.code));
  const declined = ["card_declined", "generic_decline", "insufficient_funds", "do_not_honor",
                    "lost_card", "stolen_card", "fraudulent", "transaction_not_allowed"];
  if (declined.includes(code) || /declin/i.test(error && error.message || "")) {
    return "<strong>Your bank said no to that card.</strong> Nothing was taken. " +
      "Try another card, or ring the number on the back of this one and try again.";
  }
  if (code === "expired_card") return "<strong>That card has expired.</strong> Nothing was taken. Try another one.";
  if (code === "incorrect_cvc") return "<strong>The security code did not match.</strong> It is the three digits on the back. Nothing was taken.";
  if (code === "incorrect_number" || code === "invalid_number") return "<strong>That card number is not right.</strong> Check it against the card and try again.";
  if (code === "processing_error") return "<strong>Something went wrong between us and your bank.</strong> Nothing was taken. Try again in a moment.";
  if (code === "authentication_required" || code === "payment_intent_authentication_failure") {
    return "<strong>Your bank wanted to check it was you, and that did not go through.</strong> Nothing was taken. Try again, or use another card.";
  }
  return esc(error && error.message || "That did not go through. Nothing was taken. Try again in a moment.");
}

function renderCheckout() {
  const run = ++checkoutRun;
  liveCheckout = null;

  if (isPaid()) return drawCheckoutDone({ justPaid: false });
  if (checkoutReturned) return drawCheckoutWaiting(run);

  main.innerHTML = `
    <div class="content">
      <section class="co">
        ${backLink("home", "Back")}

        <header class="co-head">
          <p class="co-kicker">Every day &middot; ${PLAN_PRICE} a month</p>
          <h2>Every day, instead of once a week.</h2>
          <p>A new history for you and a new bedtime story for them, every day, and every past one to keep.</p>
        </header>

        <div class="co-plan">
          <div class="co-plan-top">
            <p class="co-plan-name">Every day</p>
            <p class="co-price">${PLAN_PRICE} <small>/ month</small></p>
          </div>
          <ul class="co-includes">
            <li><svg class="ic"><use href="#i-check"/></svg><span><strong>A history for you, every day.</strong> Under 10 minutes, on your own time.</span></li>
            <li><svg class="ic"><use href="#i-check"/></svg><span><strong>A bedtime story for them</strong> on the same idea, to read aloud that night.</span></li>
            <li><svg class="ic"><use href="#i-check"/></svg><span><strong>The whole archive,</strong> and every day of Today in history.</span></li>
          </ul>
          <dl class="co-tally" id="coTally">
            <div><dt>Every day, monthly</dt><dd id="coSubtotal">${PLAN_PRICE}.00</dd></div>
            <div class="is-total"><dt>Due today</dt><dd id="coTotal">${PLAN_PRICE}.00</dd></div>
          </dl>
          <p class="co-cancel">Cancel any time from Your account. Your free story every week stays free.</p>
        </div>

        <div class="co-promo" id="coPromo">
          <button class="co-linkish" type="button" id="coPromoOpen">Have a code?</button>
          <form id="coPromoForm" hidden>
            <div class="co-promo-row">
              <input type="text" id="coPromoInput" aria-label="Code" placeholder="Your code" autocomplete="off" autocapitalize="characters" spellcheck="false" />
              <button class="btn btn-quiet" type="submit">Apply</button>
            </div>
          </form>
          <div id="coPromoApplied" hidden></div>
          <p class="co-msg" id="coPromoMsg" role="status" aria-live="polite" hidden></p>
        </div>

        <div class="co-pay">
          <h3 class="co-section">Pay</h3>
          <div id="coExpressWrap" hidden>
            <div class="co-express" id="coExpress"></div>
            <p class="co-or">or pay by card</p>
          </div>
          <div class="co-card" id="coCard"><p class="co-loading">Loading the card form&hellip;</p></div>

          <div class="co-error" id="coError" role="alert" hidden></div>

          <button class="btn co-submit" type="button" id="coPay" disabled>Start every day &mdash; <span id="coPayAmount">${PLAN_PRICE}.00</span></button>

          <p class="co-fine"><svg class="ic"><use href="#i-padlock"/></svg>Your card goes straight to Stripe. We never see it.<br>
            <span id="coFineAmount">${PLAN_PRICE}.00</span> today, then ${PLAN_PRICE} on this date each month until you cancel.</p>
        </div>
      </section>
    </div>`;

  /* Back goes wherever they came from — a locked story, the receipt, their
     account — and home only when there is nowhere to go back to. */
  main.querySelector(".back-link").addEventListener("click", ev => {
    if (history.length > 1) { ev.preventDefault(); history.back(); }
  });

  startCheckout(run).catch(err => {
    if (run !== checkoutRun || (err && err.leaving)) return;
    console.error("checkout did not start", err);
    offerHostedCheckout(err && err.readerMessage);
    /* Nothing below the plan can work without the form, so take it all
       away rather than leave a pay button that cannot pay. */
    ["coPromo", "coCard", "coPay"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    main.querySelectorAll(".co-pay .co-section, .co-pay .co-fine").forEach(el => { el.hidden = true; });
  });
}

/* When our card form cannot run here (no publishable key on this
   deployment, Stripe.js blocked or failing), Stripe's own hosted page still
   can. Say so plainly and offer it, rather than leave a dead end: paying
   must never be more broken than it was before this page existed. */
function offerHostedCheckout(readerMessage) {
  showCheckoutError(readerMessage ||
    "<strong>The card form did not load here.</strong> Nothing has been taken. " +
    "You can pay on Stripe&rsquo;s own secure page instead.");
  const box = document.getElementById("coError");
  if (!box) return;
  const btn = document.createElement("button");
  btn.className = "btn co-submit";
  btn.type = "button";
  btn.textContent = "Pay on Stripe\u2019s secure page";
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Opening Stripe\u2026";
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ hosted: true })
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409 && body.error === "payment_processing") return showCheckoutWaiting(body.sessionId);
      if (res.status === 409) return location.reload();
      if (!res.ok || !body.url) throw new Error(body.message || "HTTP " + res.status);
      location.href = body.url;
    } catch (e) {
      console.error("hosted checkout did not open", e);
      btn.disabled = false;
      btn.textContent = "Pay on Stripe\u2019s secure page";
      showCheckoutError("<strong>Stripe did not open either.</strong> Nothing has been taken. " +
        "Try again in a few minutes, and if it keeps happening it is us, not you.");
      box.after(btn);
    }
  });
  box.after(btn);
}

function showCheckoutError(html) {
  const box = document.getElementById("coError");
  if (!box) return;
  box.innerHTML = html;
  box.hidden = !html;
}

async function startCheckout(run) {
  const key = STRIPE_KEY;
  if (!key) {
    const e = new Error("no publishable key");
    e.readerMessage = "<strong>Payment opens on Stripe&rsquo;s own secure page.</strong> " +
      "Your card goes straight to Stripe; we never see it.";
    throw e;
  }

  const Stripe = await loadStripeJs();
  if (run !== checkoutRun) return;
  const stripe = Stripe(key);

  const checkout = await stripe.initCheckout({
    fetchClientSecret: async () => {
      const res = await fetch("/api/billing/checkout", { method: "POST", headers: { Accept: "application/json" } });
      const body = await res.json().catch(() => ({}));
      /* Already paying: the server refuses a second subscription, and a
         reload shows them what they already have. */
      const leave = (why, go) => { go(); const e = new Error(why); e.leaving = true; throw e; };
      if (res.status === 409 && body.error === "payment_processing") {
        leave("already paid, waiting", () => showCheckoutWaiting(body.sessionId));
      }
      if (res.status === 409) leave("already subscribed", () => location.reload());
      /* The server fell back to Stripe's hosted page (see checkout.js). */
      if (res.ok && body.url) leave("sent to the hosted page", () => { location.href = body.url; });
      if (!res.ok || !body.clientSecret) {
        const e = new Error(body.message || "HTTP " + res.status);
        e.readerMessage = esc(body.message || "The card form did not load. Nothing has been taken. Reload the page to try again.");
        throw e;
      }
      return body.clientSecret;
    },
    elementsOptions: {
      appearance: stripeAppearance(),
      fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&display=swap" }]
    }
  });
  if (run !== checkoutRun) return;
  liveCheckout = checkout;

  const pay = document.getElementById("coPay");
  const payLabel = pay.innerHTML;

  /* Every price on the page comes from the session, so a code or a change
     of plan in Stripe shows up here without a line of arithmetic of ours. */
  function drawTotals(session) {
    if (!session || run !== checkoutRun) return;
    const total = money(session.total && session.total.total);
    const subtotal = money(session.total && session.total.subtotal);
    if (subtotal) document.getElementById("coSubtotal").textContent = subtotal;
    if (total) {
      ["coTotal", "coPayAmount", "coFineAmount"].forEach(id => {
        document.getElementById(id).textContent = total;
      });
    }
    const tally = document.getElementById("coTally");
    tally.querySelectorAll(".is-off").forEach(el => el.remove());
    (session.discountAmounts || []).forEach(d => {
      const row = document.createElement("div");
      row.className = "is-off";
      row.innerHTML = `<dt>${esc(d.promotionCode ? "Code " + d.promotionCode : d.displayName || "Discount")}</dt><dd>&minus;${esc(money(d.amount) || String(d.amount || ""))}</dd>`;
      tally.insertBefore(row, tally.querySelector(".is-total"));
    });
    drawPromo(session);
  }

  /* ------------------------------------------------ the code, if any */
  const promoOpen = document.getElementById("coPromoOpen");
  const promoForm = document.getElementById("coPromoForm");
  const promoInput = document.getElementById("coPromoInput");
  const promoApplied = document.getElementById("coPromoApplied");
  const promoMsg = document.getElementById("coPromoMsg");

  function promoSay(text, bad) {
    promoMsg.textContent = text;
    promoMsg.hidden = !text;
    promoMsg.classList.toggle("is-bad", !!bad);
    promoInput.classList.toggle("is-bad", !!bad);
  }

  function drawPromo(session) {
    const d = (session.discountAmounts || []).find(x => x.promotionCode);
    if (d) {
      promoOpen.hidden = true;
      promoForm.hidden = true;
      promoApplied.hidden = false;
      promoApplied.innerHTML = `<span class="co-applied">${esc(d.promotionCode)} &middot; &minus;${esc(money(d.amount))}
        <button class="co-linkish" type="button" id="coPromoRemove">Remove</button></span>`;
      promoSay(`Then ${PLAN_PRICE} a month after that.`);
      document.getElementById("coPromoRemove").addEventListener("click", async () => {
        const r = await checkout.removePromotionCode();
        if (failed(r)) return promoSay("That code would not come off. Reload the page and it will be gone.", true);
        promoApplied.hidden = true;
        promoOpen.hidden = false;
        promoSay("");
        drawTotals(r.session);
      });
    } else if (!promoApplied.hidden) {
      promoApplied.hidden = true;
      promoOpen.hidden = false;
    }
  }

  promoOpen.addEventListener("click", () => {
    promoOpen.hidden = true;
    promoForm.hidden = false;
    promoInput.focus();
  });

  promoForm.addEventListener("submit", async ev => {
    ev.preventDefault();
    const code = promoInput.value.trim();
    if (!code) return promoInput.focus();
    const btn = promoForm.querySelector("button");
    btn.disabled = true;
    promoSay("");
    const r = await checkout.applyPromotionCode(code);
    btn.disabled = false;
    if (failed(r)) return promoSay("That code didn’t take. Check the spelling — or it may have run its course.", true);
    promoInput.value = "";
    drawTotals(r.session);
  });

  /* --------------------------------------------------- paying */
  async function confirmPayment(options) {
    showCheckoutError("");
    pay.disabled = true;
    pay.innerHTML = `<span class="co-spin" aria-hidden="true"></span>Paying&hellip;`;
    const r = await checkout.confirm(options);
    /* On success Stripe takes the reader to return_url, so nothing after
       this line runs. Only a failure comes back here. */
    if (run !== checkoutRun) return;
    pay.disabled = false;
    pay.innerHTML = payLabel;
    if (failed(r)) {
      const error = r && r.error;
      /* A card box left half-filled is shown in the form itself, in red,
         by Stripe. Only say something here for what the form cannot. */
      if (error && error.type === "validation_error") return;
      showCheckoutError(checkoutErrorText(error));
    }
  }

  const paymentElement = checkout.createPaymentElement({ layout: "tabs" });
  document.getElementById("coCard").innerHTML = "";
  paymentElement.mount("#coCard");
  paymentElement.on("ready", () => { if (run === checkoutRun) pay.disabled = false; });
  pay.addEventListener("click", () => confirmPayment());

  /* Apple Pay and Google Pay, only where this device and browser can
     actually use one. Otherwise the block stays hidden rather than showing
     a button that does nothing. */
  const express = checkout.createExpressCheckoutElement({ buttonHeight: 46 });
  express.mount("#coExpress");
  express.on("ready", ev => {
    const methods = ev && ev.availablePaymentMethods;
    const any = methods && Object.values(methods).some(Boolean);
    const wrap = document.getElementById("coExpressWrap");
    if (wrap) wrap.hidden = !any;
  });
  express.on("confirm", ev => confirmPayment({ expressCheckoutConfirmEvent: ev }));

  checkout.on("change", drawTotals);
  drawTotals(checkout.session());
}

/* A checkout already paid that the webhook has not caught up with (the
   server said so with a 409 rather than start a second one). */
function showCheckoutWaiting(sessionId) {
  checkoutReturned = true;
  checkoutSessionId = sessionId || checkoutSessionId;
  renderCheckout();
}

/* Back from Stripe, and waiting on the webhook to open the plan. Two
   questions every two seconds: Stripe, through our checkout-status, about
   how the payment went (so the page does not say "paid" before it is, and
   can say so when it did not finish), and /api/session about the plan,
   which only the webhook changes. The page redraws as "you're in" the
   moment the plan does, from the same payload every other page uses. */
function drawCheckoutWaiting(run) {
  main.innerHTML = `
    <div class="content">
      <section class="co co-done co-wait" role="status" aria-live="polite">
        <div class="co-spin" aria-hidden="true"></div>
        <h2 id="coWaitHead">One moment&hellip;</h2>
        <p id="coWaitText">Checking with Stripe that your payment went through.</p>
        <p class="co-fine" id="coWaitNote">You can leave this page. It will be open when you come back.</p>
      </section>
    </div>`;

  const sid = checkoutSessionId;
  let known = sid ? null : "complete";     /* no id: nothing to ask, so just wait */
  let tries = 0;

  const say = (head, text) => {
    document.getElementById("coWaitHead").innerHTML = head;
    document.getElementById("coWaitText").innerHTML = text;
  };

  /* Stripe has the session open again or let it lapse: the payment did not
     finish (a bank's check abandoned, a redirect closed). Nothing to wait
     for, so say so and go back to the same session's form. */
  const unfinished = () => {
    main.innerHTML = `
      <div class="content">
        <section class="co co-done" role="status" aria-live="polite">
          <p class="co-kicker">Every day</p>
          <h2>That payment did not finish.</h2>
          <p>Nothing was taken. Your card form is where you left it.</p>
          <button class="btn co-submit co-submit-inline" type="button" id="coAgain">Back to the card form</button>
        </section>
      </div>`;
    document.getElementById("coAgain").addEventListener("click", () => {
      checkoutReturned = false;
      checkoutSessionId = null;
      renderCheckout();
    });
  };

  const tick = async () => {
    if (run !== checkoutRun) return;
    const [data, status] = await Promise.all([
      fetch("/api/session", { headers: { Accept: "application/json" } })
        .then(r => (r.ok ? r.json() : null)).catch(() => null),
      known === "complete" ? null
        : fetch("/api/billing/checkout-status?session_id=" + encodeURIComponent(sid), { headers: { Accept: "application/json" } })
            .then(r => (r.ok ? r.json() : null)).catch(() => null)
    ]);
    if (run !== checkoutRun) return;
    if (data && data.user.plan === "paid") {
      /* The whole payload changes with the plan, so take all of it. */
      ME = data.user;
      ({ CARDS, BRIEFS, TALES, TODAY, ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, SEVEN = [], today: RELEASE_DAY = null } = data.content);
      applyAgePreference();
      checkoutReturned = false;
      checkoutSessionId = null;
      return drawCheckoutDone({ justPaid: true });
    }
    if (status && status.status === "complete" && known !== "complete") {
      known = "complete";
      say("Paid. Opening the door&hellip;",
        "Stripe has your payment. We&rsquo;re just waiting for it to tell us so &mdash; usually a few seconds.");
    } else if (status && (status.status === "open" || status.status === "expired")) {
      checkoutReturned = false;
      return unfinished();
    }
    if (++tries === 15) {
      const note = document.getElementById("coWaitNote");
      if (note) note.textContent = "This is taking longer than it should. Your payment is safe with Stripe — " +
        "leave this open, or come back in a few minutes and it will be done.";
    }
    setTimeout(tick, tries < 30 ? 2000 : 10000);
  };
  tick();
}

/* "You're in", or, for a reader who was already paying and followed a
   "Start full access" link anyway, the same page saying so — never a second
   card form. The server refuses a second subscription too (409). */
function drawCheckoutDone({ justPaid }) {
  main.innerHTML = `
    <div class="content">
      <section class="co co-done" role="status" aria-live="polite">
        <div class="co-mark" aria-hidden="true"></div>
        <p class="co-kicker">Every day</p>
        <h2>${justPaid ? "You&rsquo;re in." : "You&rsquo;re already in."}</h2>
        <p>${justPaid
          ? "Tonight&rsquo;s history and bedtime story are open, and so is every one before them."
          : "You&rsquo;re on Every day, so there is nothing to pay. Tonight&rsquo;s is waiting."}</p>
        <a class="btn co-submit co-submit-inline" href="#home">Read tonight&rsquo;s</a>
        <p class="co-fine">${justPaid ? `Receipts go to ${esc(ME.email)}. Not right? <button class="co-linkish" type="button" id="coChangeEmail">Change it.</button><br>` : ""}
          Cards, invoices and cancelling live under <a href="#account">Your account</a>.</p>
        <div id="coChangeSlot"></div>
      </section>
    </div>`;
  wireEmailChange(document.getElementById("coChangeEmail"), document.getElementById("coChangeSlot"));
}

/* "Not right? Change it." New readers are signed straight in without
   proving their address, so a typo can pay and never see a receipt. The
   address only changes when the link sent to the new one is opened (see
   api/account/email.js): until then the account, and Stripe, keep the old. */
function wireEmailChange(button, slot) {
  if (!button || !slot) return;
  button.addEventListener("click", () => {
    button.disabled = true;
    slot.innerHTML = `
      <form class="email-change" novalidate>
        <div class="co-promo-row">
          <input type="email" name="email" aria-label="New email address" placeholder="Your right address" autocomplete="email" required />
          <button class="btn btn-quiet" type="submit">Send a link</button>
        </div>
        <p class="co-msg" role="status" aria-live="polite" hidden></p>
      </form>`;
    const form = slot.querySelector("form");
    const input = form.querySelector("input");
    const msg = form.querySelector(".co-msg");
    const send = form.querySelector("button");
    input.focus();

    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const email = input.value.trim();
      if (!email) return input.focus();
      send.disabled = true;
      msg.hidden = true;
      let body = {};
      let ok = false;
      try {
        const res = await fetch("/api/account/email", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email })
        });
        body = await res.json().catch(() => ({}));
        ok = res.ok;
      } catch (e) { /* said below */ }
      send.disabled = false;
      if (!ok) {
        msg.textContent = body.message || "That did not go through. Try again in a moment.";
        msg.classList.add("is-bad");
        input.classList.add("is-bad");
        msg.hidden = false;
        return;
      }
      slot.innerHTML = `<p class="co-msg">We&rsquo;ve sent a link to <strong>${esc(body.email)}</strong>.
        Open it and your account moves there. Until then, everything still goes to ${esc(ME.email)}.</p>`;
    });
  });
}

function renderMissing(msg, hash, label) {
  main.innerHTML = `<div class="content"><p class="empty">${esc(msg)}</p>${backLink(hash, label)}</div>`;
}

/* ------------------------------------------------------------- routing */

/* per-page title and meta description, from the copy doc */
const META = {
  home:    ["Saints & Dragons | History for Dads, tales for bedtime",
            "Dads learning things worth knowing & passing them on to their kids. History, faith and virtue, handed down rather than explained."],
  history: ["History for Dads | Saints & Dragons",
            "Short history on how things actually worked \u2014 battles, builders, saints and Romans, each with a bedtime story on the same idea."],
  today:   ["Today in History | Saints & Dragons",
            "One short, true story for each date on the calendar."],
  bedtime: ["Bedtime Stories for Ages 4 to 9 | Saints & Dragons",
            "Fairy tales, legends and true stories retold for reading aloud, for ages 4 to 9. Knights, dragons, castles and the sea."],
  welcome: ["Welcome | Saints & Dragons", "Two questions, then tonight's story."],
  account: ["Your account | Saints & Dragons", "Your plan, your details, and how to leave."],
  checkout: ["Every day | Saints & Dragons", "A new history and a new bedtime story every day, for $6 a month."],
  seven:   ["7 Bedtime Stories | Saints & Dragons", "Seven bedtime stories to read aloud or print, free."]
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
                    welcome: "#account", checkout: "#account" };

/* routes printed on receipt paper, so they match the card on #home */
const PAPER_ROUTES = new Set(["history", "today", "bedtime", "brief", "tale", "seven"]);

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
  else if (key === "checkout") renderCheckout();
  else if (key === "seven") renderSeven();
  else if (key === "home" || !PAGES[key]) renderHome(searchInput.value, key === "home" ? param : "");
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
  /* Stripe's card form is an iframe and cannot see the theme change;
     tell it. */
  if (liveCheckout && typeof liveCheckout.changeAppearance === "function") {
    liveCheckout.changeAppearance(stripeAppearance());
  }
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

/* every "start full access" button on every page, delegated for the same reason
   the chips are: these panels are re-rendered on each route. They open the
   checkout page; nothing is asked of Stripe until it draws. */
main.addEventListener("click", ev => {
  if (!ev.target.closest("[data-upgrade]")) return;
  location.hash = "#checkout";
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
  ({ CARDS, BRIEFS, TALES, TODAY, ERAS, KINDS, THEMES, VIRTUES, AGE_BANDS, SEVEN = [], today: RELEASE_DAY = null } = data.content);
  STRIPE_KEY = data.stripe && data.stripe.publishableKey || null;
  applyAgePreference();

  /* Coming back from Stripe. The webhook is what actually grants the plan,
     and it can land a moment after the reader does, so #checkout shows
     "opening the door" and keeps asking until it has (drawCheckoutWaiting),
     rather than guessing either way. It takes the whole new payload when the
     plan changes: patching half of it into a drawn page is how two surfaces
     end up disagreeing. */
  const params = new URLSearchParams(location.search);
  const checkout = params.get("checkout");
  if (checkout) {
    history.replaceState(null, "", location.pathname + location.hash);
    if (checkout === "done" && !isPaid()) {
      checkoutReturned = true;
      checkoutSessionId = params.get("session_id");
    }
  }

  /* Back from the link that moved the account to another address. */
  if (params.get("email") === "changed") {
    history.replaceState(null, "", location.pathname + location.hash);
    emailJustChanged = true;
  }

  /* ?upgrade=1 is the old way in from the paid plan on the landing page,
     and it still sits in login links already in people's inboxes. They
     chose to pay, so take them to the checkout rather than making them find
     the button again. (The landing page links straight to #checkout now.)
     #checkout itself tells a reader who is already paying so. */
  if (params.get("upgrade")) {
    history.replaceState(null, "", location.pathname + "#checkout");
  }

  /* The two questions come first. A new reader sent straight to #seven
     (the old /7stories links do that) is asked them on the way, and
     renderWelcome then takes a first-timer on to the seven stories. */
  if (!ME.onboarded && (!location.hash || location.hash === "#seven")) location.hash = "#welcome";

  window.addEventListener("hashchange", route);
  route();
}

boot();
