/* Saints & Dragons — content, routing, search, theme */

const PAGES = {
  about: {
    title: "About",
    sub: "A short introduction.",
    html: `
      <div class="prose">
        <p>Saints &amp; Dragons is a writing practice about clarity, discipline, and intentional living — the ordinary work of building a life you would choose again.</p>
        <h3>What this space is</h3>
        <p>A quiet log of growth, one entry at a time. No hustle theatre, no shortcuts — just notes from the work as it happens.</p>
        <h3>What I do</h3>
        <ul>
          <li>Write essays on habits, attention, and self-trust.</li>
          <li>Coach individuals through periods of transition.</li>
          <li>Publish books and long-form guides.</li>
        </ul>
      </div>`
  },
  contact: {
    title: "Contact",
    sub: "Say hello — I read everything.",
    html: `
      <form class="prose" onsubmit="event.preventDefault(); this.reset(); alert('Thanks — your message has been noted.');">
        <label class="field"><span>Name</span><input type="text" required /></label>
        <label class="field"><span>Email</span><input type="email" required /></label>
        <label class="field"><span>Message</span><textarea required></textarea></label>
        <button class="btn" type="submit">Send message</button>
      </form>`
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
  bedtime: { age: null, theme: null }
};

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
    ${b.stillWithUs ? `<p class="shelf-line"><strong>Still with us:</strong> ${esc(b.stillWithUs)}</p>` : ""}
    ${tale ? `<p class="shelf-line"><strong>Read it to them:</strong> <a href="#tale/${b.tale}">${esc(tale.title)}</a></p>` : ""}
    <a class="btn btn-quiet" href="#brief/${slug}">Read the brief</a>
  </article>`;
}

function taleCardHTML(slug, t) {
  const brief = t.brief ? BRIEFS[t.brief] : null;
  return `<article class="shelf-item">
    <h3>${esc(t.title)}</h3>
    <p class="shelf-meta">Age ${t.age} · ${esc(t.minutes)} min read-aloud · ${esc(t.theme)}</p>
    <p class="shelf-tag">${esc(t.origin)}</p>
    ${t.night ? `<p class="shelf-line"><strong>Night ${t.night.n} of ${t.night.of}.</strong></p>` : ""}
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

  const askedKey = todayKey();
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
            <a class="rcpt-more" href="#today/${shownKey}">Go deeper on today &rarr;</a>` :
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
            `<p>No brief attached to tonight's card.</p>`}
          </section>

          <div class="rcpt-dots">&middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot; &middot;</div>

          <section class="rcpt-slot">
            <div class="rcpt-slot-label"><span class="no">03</span> Tonight&rsquo;s Tale</div>
            <h3 class="rcpt-story-title">${esc(tale.title)}</h3>
            <p class="rcpt-dek">About ${esc(tale.minutes)} minutes &middot; ${esc(tale.ageLabel || `Ages ${tale.age}`)}${tale.night ? ` &middot; night ${tale.night.n} of ${tale.night.of}` : ""}</p>
            <p class="rcpt-excerpt">&ldquo;${esc(tale.body[0])}&rdquo;</p>
            <a class="rcpt-more" href="#tale/${card.tale}">Read the rest &rarr;</a>
          </section>

          <div class="rcpt-tally">
            ${todayList && todayList.length ? `<div class="row"><span>Today in history</span><span>1 min</span></div>` : ""}
            ${brief ? `<div class="row"><span>History for you</span><span>${brief.minutes} min</span></div>` : ""}
            <div class="row"><span>Tonight&rsquo;s tale</span><span>${esc(tale.minutes)} min</span></div>
            <div class="row grand"><span>Total tonight</span><span>~${totalMin} min</span></div>
          </div>

          <div class="rcpt-foot">
            <p>One true story. One tale.<br><a href="/">saintsdragons</a></p>
          </div>
        </div>
        <div class="rcpt-tear is-bottom"></div>
      </div>

      <section class="rcpt-archive">
        <h3>Earlier nights</h3>
        <p class="rcpt-archive-note">Miss a night? Nothing breaks. Every card stays here.</p>

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
                <span class="mini-slot"><i class="no">03</i> Tonight&rsquo;s tale</span>
                <span class="mini-title">${esc(t.title)}</span>
                <span class="mini-text is-excerpt">&ldquo;${esc(t.body[0])}&rdquo;</span>
              </span>
              <span class="mini-fade"></span>
            </a>`;
          }).join("")}
        </div>

        <a class="rcpt-archive-link" href="#history">See the full archive &rarr;</a>
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
    (t.title + " " + t.theme + " " + t.origin).toLowerCase().includes(q));
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
        <p>One person, one battle, one council at a time. Three to five minutes each.</p>
      </header>

      <p class="lede">Not a story and not a textbook: how the thing actually worked, what the sources argue about, and why it came out the way it did.</p>

      <div class="filter-row">
        <p class="filter-label">Browse by era</p>
        <div class="chips">${ERAS.map(e => chip("history", "era", e, e)).join("")}</div>
      </div>
      <div class="filter-row">
        <p class="filter-label">Browse by kind</p>
        <div class="chips">${KINDS.map(k => chip("history", "kind", k, k)).join("")}</div>
      </div>

      ${list.length ? `<div class="shelf">${list.map(([slug, b]) => briefCardHTML(slug, b)).join("")}</div>`
        : `<p class="empty">Nothing on this shelf yet. Clear a filter, or come back — new briefs go up twice a week.</p>`}
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
        <p>One true thing that happened on this date. Under a minute.</p>
      </header>

      <p class="date-line">${esc(dayLabel(asked))}</p>

      ${entry ? "" : `<p class="empty-note">This date is still being written. Here's the closest one we have: ${esc(dayLabel(shown))}.</p>`}

      ${list && list.length ? list.map(e => `
      <article class="entry">
        <p class="entry-year">${esc(e.year)}</p>
        <p class="entry-text">${esc(e.text)}</p>
        ${e.brief || e.tale ? `<p class="entry-links">
          ${e.brief ? `<a href="#brief/${e.brief}">Go deeper: read the full brief</a>` : ""}
          ${e.tale ? `<a href="#tale/${e.tale}">Read the tale that goes with it</a>` : ""}
        </p>` : ""}
      </article>`).join("") : `<p class="empty">Nothing here yet.</p>`}

      <nav class="date-nav">
        <a href="#today/${prev}">Yesterday</a>
        <a href="#today/${next}">Tomorrow</a>
        <label class="date-pick"><span>Pick a date</span><input type="date" id="datePick" /></label>
      </nav>

      <p class="filter-label">Marked dates have an entry.</p>
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
  const list = Object.entries(TALES).filter(([, t]) =>
    (!f.age || t.age === f.age) && (!f.theme || t.theme === f.theme));

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>Knights, dragons, forests. Lights out in ten minutes.</h2>
        <p>Fairy tales, legends, and real stories retold for reading aloud. Written for ages 1 and 3.</p>
      </header>

      <div class="filter-row">
        <p class="filter-label">Who's listening?</p>
        <div class="chips">
          ${chip("bedtime", "age", 1, "Ages 1")}
          ${chip("bedtime", "age", 3, "Ages 3")}
        </div>
        <p class="filter-note">Older ages are coming. Each story will be adapted to reading level and attention span, so you never read the wrong one.</p>
      </div>

      <div class="filter-row">
        <div class="chips">${THEMES.map(t => chip("bedtime", "theme", t, t)).join("")}</div>
      </div>

      ${list.length ? `<div class="shelf">${list.map(([slug, t]) => taleCardHTML(slug, t)).join("")}</div>`
        : `<p class="empty">Nothing on this shelf yet. Clear a filter, or come back — new tales go up twice a week.</p>`}
    </div>`;
}

/* --------------------------------------------------------- detail pages */

function renderBrief(slug) {
  const b = BRIEFS[slug];
  if (!b) return renderMissing("That brief isn't here.", "history", "History for dads");
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
      ${b.stillWithUs ? `<p class="callout"><strong>Still with us.</strong> ${esc(b.stillWithUs)}</p>` : ""}
      ${tale ? `<p class="callout"><strong>Read it to them.</strong> <a href="#tale/${b.tale}">${esc(tale.title)}</a> · ${esc(tale.minutes)} min read-aloud</p>` : ""}
    </div>`;
}

function renderTale(slug) {
  const t = TALES[slug];
  if (!t) return renderMissing("That tale isn't here.", "bedtime", "Bedtime stories");
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
        <p>Age ${t.age} · ${esc(t.minutes)} min read-aloud · ${esc(t.theme)} · ${esc(t.origin)}${t.night ? ` · night ${t.night.n} of ${t.night.of}` : ""}</p>
      </header>
      <div class="tale-body">${t.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      ${siblings.length ? `<p class="callout"><strong>The rest of it.</strong> ${siblings.map(([s, x]) =>
        s === slug ? `<span class="is-here">Night ${x.night.n}</span>` : `<a href="#tale/${s}">Night ${x.night.n}</a>`).join(" · ")}</p>` : ""}
      ${brief ? `<p class="callout"><strong>Goes with.</strong> <a href="#brief/${t.brief}">${esc(brief.title)}</a> · ${brief.minutes} min for you</p>` : ""}
    </div>`;
}

function renderMissing(msg, hash, label) {
  main.innerHTML = `<div class="content"><p class="empty">${esc(msg)}</p>${backLink(hash, label)}</div>`;
}

/* ------------------------------------------------------------- routing */

/* per-page title and meta description, from the copy doc */
const META = {
  home:    ["Saints & Dragons | History for dads, tales for bedtime",
            "One true story from history for dads, one tale to read aloud to the kids. Written to go together. About twenty minutes."],
  history: ["History for Dads | Saints & Dragons",
            "Short history notes on how things actually worked. Battles, builders, knights and Romans, each paired with a bedtime tale."],
  today:   ["Today in History | Saints & Dragons",
            "One short, true story for each date, filled in week by week. Under a minute to read."],
  bedtime: ["Bedtime Stories for Ages 1 and 3 | Saints & Dragons",
            "Fairy tales, legends, and real stories retold for reading aloud. Knights, dragons and forests, 8 to 12 minutes each."]
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
    desc = `A tale to read aloud, written for ages ${TALES[param].age}. About ${TALES[param].minutes} minutes.`;
  }
  document.title = title;
  document.querySelector('meta[name="description"]').setAttribute("content", desc);
}

/* which sidebar link lights up for a given route */
const NAV_OWNER = { brief: "#history", tale: "#bedtime", today: "#today" };

function route() {
  const raw = (location.hash || "#home").slice(1);

  /* Home is Tonight. #tonight is an old link, not a page — send it home. */
  if (raw === "tonight") { location.hash = "#home"; return; }

  const [key, param] = [raw.split("/")[0], raw.split("/").slice(1).join("/")];
  const owner = NAV_OWNER[key] || "#" + key;

  document.querySelectorAll(".nav-item").forEach(a =>
    a.classList.toggle("is-active", a.getAttribute("href") === owner));
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
