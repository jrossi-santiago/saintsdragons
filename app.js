/* Saints & Dragons — content, routing, search, theme */

/* The contact form posts to the same Formspree endpoint as /7stories.
   Unlike that one, a failed POST here has nothing to fall back on — there is
   no download to unlock — so this one tells the reader it failed instead of
   swallowing the error and thanking them for a message that went nowhere. */
const FORM_ENDPOINT = "https://formspree.io/f/xqpaqzne";

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

/* "2026-09-21" -> "Monday, 21 September" */
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

/* "2026-09-21" -> "21 Sep" */
function shortDate(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
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

/* the card for tonight: the most recent one not in the future */
function tonightCard() {
  const now = new Date();
  const key = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
  const past = CARDS.filter(c => c.date <= key);
  return past.length ? past[past.length - 1] : CARDS[CARDS.length - 1];
}

function readTime(tale) {
  return tale ? `${tale.minutes} min` : "";
}

function backLink(hash, label) {
  return `<a class="back-link" href="#${hash}"><svg class="ic ic-back"><use href="#i-arrow"/></svg>${esc(label)}</a>`;
}

/* ------------------------------------------------------------- filters */

const filters = {
  history: { era: null, kind: null },
  bedtime: { age: null, theme: null, virtue: null }
};

/* A chip with nothing behind it filters to an empty shelf, which reads as
   broken rather than as "coming soon". So ERAS, KINDS, THEMES and VIRTUES stay
   whole in content.js — they are the plan — and only the entries something is
   actually filed under get drawn. A chip appears by itself the night the first
   brief or tale lands in it. Counted across all the data, never the filtered
   list, so the row does not shift under the reader as they click. */
/* The one place a tale's age becomes words. `age` is a bucket id and is never
   printed; AGE_BANDS turns it into a label, and a tale's own `ageLabel` wins
   where it has one. Every surface goes through here so the receipt and the
   shelf cannot say different things about the same story. */
function ageText(t) {
  return t.ageLabel || AGE_BANDS[t.age] || `Ages ${t.age}`;
}

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

function briefCardHTML(slug, b) {
  const tale = TALES[b.tale];
  return `<article class="shelf-item">
    <h3>${esc(b.title)}</h3>
    <p class="shelf-meta">${esc(b.era)} · ${esc(b.kind)} · ${b.minutes} min</p>
    <p class="shelf-hook">${esc(b.hook)}</p>
    ${b.stillWithUs ? `<p class="shelf-line"><strong>Still around today:</strong> ${esc(b.stillWithUs)}</p>` : ""}
    ${tale ? `<p class="shelf-line"><strong>Bedtime story:</strong> <a href="#tale/${b.tale}">${esc(tale.title)}</a></p>` : ""}
    <a class="btn btn-quiet" href="#brief/${slug}">Read it (${b.minutes} min)</a>
  </article>`;
}

function taleCardHTML(slug, t) {
  const brief = t.brief ? BRIEFS[t.brief] : null;
  return `<article class="shelf-item">
    <h3>${esc(t.title)}</h3>
    <p class="shelf-meta">${esc(ageText(t))} · ${esc(t.minutes)} min read-aloud${t.theme ? ` · ${esc(t.theme)}` : ""} · ${esc(t.virtue)}</p>
    <p class="shelf-tag">${esc(t.origin)}</p>
    ${t.night ? `<p class="shelf-line"><strong>${t.night.n === 1 ? `A ${t.night.of}-part story.` : `Part ${t.night.n} of ${t.night.of}.`}</strong></p>` : ""}
    ${brief ? `<p class="shelf-line"><strong>Goes with:</strong> <a href="#brief/${t.brief}">${esc(brief.title)}</a></p>` : ""}
    <a class="btn btn-quiet" href="#tale/${slug}">Read it aloud</a>
  </article>`;
}

/* ------------------------------------------------------------- Home */
/* Home is Tonight: the card is not behind a click. */

function renderHome(query = "") {
  const q = query.trim();
  if (q) return renderSearch(q);

  const card = tonightCard();
  const brief = card.brief ? BRIEFS[card.brief] : null;
  const tale = TALES[card.tale];
  const earlier = CARDS.filter(c => c.date < card.date).slice(-5).reverse();

  /* Today in history follows the receipt's own date, not the clock, so the
     dateline and the entry under it can never be two different days. */
  const askedKey = card.date.slice(5);
  const shownKey = TODAY[askedKey] ? askedKey : nearestKey(askedKey);
  const todayList = shownKey ? TODAY[shownKey] : null;

  const totalMin = (todayList && todayList.length ? 1 : 0) + (brief ? Number(brief.minutes) || 0 : 0) + (Number(tale.minutes) || 0);

  main.innerHTML = `
    <div class="content">
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
            ${todayList && todayList.length ? `
            ${todayList.map(e => `
            <div class="rcpt-hist-item">
              <p><span class="yr">${esc(e.year)}</span>${esc(firstSentence(e.text))}</p>
            </div>`).join("")}
            <a class="rcpt-more" href="#today/${shownKey}">Read the full entry &rarr;</a>` :
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
            <p class="rcpt-excerpt">&ldquo;${esc(tale.body[0])}&rdquo;</p>
            <a class="rcpt-more" href="#tale/${card.tale}">Read the rest &rarr;</a>
          </section>

          <div class="rcpt-tally">
            ${todayList && todayList.length ? `<div class="row"><span>Today in history</span><span>1 min</span></div>` : ""}
            ${brief ? `<div class="row"><span>History for you</span><span>${brief.minutes} min</span></div>` : ""}
            <div class="row"><span>Bedtime story</span><span>${esc(tale.minutes)} min</span></div>
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
                ${day && day.length ? `<span class="mini-slot"><i class="no">01</i> Today in history</span>
                <span class="mini-title">${esc(day[0].year)} &mdash; ${esc(firstSentence(day[0].text))}</span>` : ""}
                <span class="mini-slot"><i class="no">02</i> History for you</span>
                <span class="mini-title">${esc(b ? b.title : "\u2014")}</span>
                ${b ? `<span class="mini-text">${esc(b.hook)}</span>` : ""}
                <span class="mini-slot"><i class="no">03</i> Bedtime story</span>
                <span class="mini-title">${esc(t.title)}</span>
                <span class="mini-text is-excerpt">&ldquo;${esc(t.body[0])}&rdquo;</span>
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
      <article class="entry">
        <p class="entry-year">${esc(e.year)}</p>
        <p class="entry-text">${esc(e.text)}</p>
        ${e.brief || e.tale ? `<p class="entry-links">
          ${e.brief ? `<a href="#brief/${e.brief}">Read the full history</a>` : ""}
          ${e.tale ? `<a href="#tale/${e.tale}">Read the bedtime story that goes with it</a>` : ""}
        </p>` : ""}
      </article>`).join("") : `<p class="empty">Nothing here yet.</p>`}

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
      <div class="post-body">${b.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
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
      <div class="tale-body">${t.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      ${siblings.length ? `<p class="callout"><strong>All parts.</strong> ${siblings.map(([s, x]) =>
        s === slug ? `<span class="is-here">Part ${x.night.n}</span>` : `<a href="#tale/${s}">Part ${x.night.n}</a>`).join(" · ")}</p>` : ""}
      ${brief ? `<p class="callout"><strong>Goes with.</strong> <a href="#brief/${t.brief}">${esc(brief.title)}</a> · ${brief.minutes} min read for you</p>` : ""}
    </div>`;
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
            "Fairy tales, legends and true stories retold for reading aloud, for ages 4 to 9. Knights, dragons, castles and the sea."]
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
const NAV_OWNER = { brief: "#history", tale: "#bedtime", today: "#today" };

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

document.getElementById("year").textContent = new Date().getFullYear();
window.addEventListener("hashchange", route);
route();
