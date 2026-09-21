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
const SIGNUP_ENDPOINT = "https://formspree.io/f/xqpaqzne";

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

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>History for you at lunch. A tale for them at bedtime.</h2>
        <p>One true story from history for you, one tale to read aloud to them, written to go together. Twenty minutes. No homework.</p>
      </header>

      <section class="tonight">
        <p class="tonight-date">${esc(longDate(card.date))}</p>
        <h3 class="tonight-title">${esc(card.title)}</h3>

        ${brief ? `
        <div class="slot">
          <p class="slot-head">For you <span>· ${brief.minutes} minutes</span></p>
          <p class="slot-note">Something true from history. Read it at lunch, in the car, or on the couch.</p>
          <a class="slot-link" href="#brief/${card.brief}">${esc(brief.title)} <svg class="ic"><use href="#i-arrow"/></svg></a>
        </div>` : ""}

        <div class="slot">
          <p class="slot-head">For them <span>· ${esc(tale.minutes)} minutes</span></p>
          <p class="slot-note">A tale to read aloud. Do the voices.</p>
          <a class="slot-link" href="#tale/${card.tale}">${esc(tale.title)}${tale.night ? ` · night ${tale.night.n} of ${tale.night.of}` : ""} <svg class="ic"><use href="#i-arrow"/></svg></a>
        </div>

        <div class="slot">
          <p class="slot-head">Ask them</p>
          <p class="slot-note">One question, after the last page.</p>
          <p class="slot-body">${esc(card.question)}</p>
        </div>

        <div class="slot">
          <p class="slot-head">Why this is ours</p>
          <p class="slot-body">${esc(card.whyOurs)}</p>
        </div>

        <div class="slot slot-last">
          <p class="slot-head">Before lights out</p>
          <p class="slot-body slot-prayer">${esc(card.prayer)}</p>
        </div>
      </section>

      <section class="earlier">
        <h3>Miss a night? Nothing breaks.</h3>
        <p class="earlier-note">Start wherever you are. Every card stays here.</p>
        <div class="earlier-strip">
          ${earlier.map(c => {
            const b = c.brief ? BRIEFS[c.brief] : null;
            const t = TALES[c.tale];
            return `<a class="earlier-card" href="#${c.brief ? "brief/" + c.brief : "tale/" + c.tale}">
              <span class="earlier-date">${esc(shortDate(c.date))}</span>
              <span class="earlier-title">${esc(c.title)}</span>
              <span class="earlier-times">${b ? b.minutes + " min · " : ""}${esc(t.minutes)} min</span>
            </a>`;
          }).join("")}
        </div>
      </section>

      <section class="thesis">
        <h3>You can't hand on what you don't have.</h3>
        <p>Most of us were educated but never formed. We know about things. We don't know the stories. That is why every tale comes with a brief. Read it at lunch, and at bedtime you are not performing — you know the thing you are telling.</p>
      </section>

      <section class="signup">
        <h3>New cards twice a week.</h3>
        <p>Put your email in and they come to you.</p>
        <form class="signup-form" novalidate>
          <input type="email" name="email" placeholder="you@example.com" autocomplete="email" required aria-label="Email address" />
          <button class="btn" type="submit">Send them to me</button>
        </form>
        <p class="signup-said" hidden>That's in. The next card comes to you.</p>
      </section>

      <section class="shelves">
        <h3>More to read</h3>
        <div class="shelf-list">
          <a class="shelf-link" href="#history">
            <span class="shelf-link-text"><strong>History for dads</strong><span>Every brief, by era or kind.</span></span>
            <svg class="ic"><use href="#i-arrow"/></svg>
          </a>
          <a class="shelf-link" href="#today">
            <span class="shelf-link-text"><strong>Today in history</strong><span>One short true thing, for any date.</span></span>
            <svg class="ic"><use href="#i-arrow"/></svg>
          </a>
          <a class="shelf-link" href="#bedtime">
            <span class="shelf-link-text"><strong>Bedtime stories</strong><span>Every tale, by age and theme.</span></span>
            <svg class="ic"><use href="#i-arrow"/></svg>
          </a>
        </div>
      </section>

      <p class="night-foot">Our tradition is not a worship of ashes but a preservation of fire. New cards twice a week.</p>
    </div>`;
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
        <p>One person. One battle. One council. Four minutes, and you'll finish it.</p>
      </header>

      <p class="lede">Written like a story, not a textbook. When you're done, you know something worth telling.</p>

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
  const e = TODAY[shown];
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

      ${e ? `
      <article class="entry">
        <p class="entry-year">${esc(e.year)}</p>
        <p class="entry-text">${esc(e.text)}</p>
        ${e.brief || e.tale ? `<p class="entry-links">
          ${e.brief ? `<a href="#brief/${e.brief}">Go deeper: read the full brief</a>` : ""}
          ${e.tale ? `<a href="#tale/${e.tale}">Read the tale that goes with it</a>` : ""}
        </p>` : ""}
      </article>` : `<p class="empty">Nothing here yet.</p>`}

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
            "Four-minute history notes a dad can actually finish. Battles, builders, knights and Romans, each paired with a bedtime tale."],
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

/* Home's email signup, delegated since the form is rebuilt on every render */
main.addEventListener("submit", ev => {
  const form = ev.target.closest(".signup-form");
  if (!form) return;
  ev.preventDefault();

  const email = form.email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { form.email.focus(); return; }

  const btn = form.querySelector("button");
  btn.disabled = true;

  fetch(SIGNUP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, source: "home" })
  }).catch(err => {
    /* Never hold the confirmation hostage to a failed network call. */
    console.warn("home signup did not reach Formspree", err);
  }).finally(() => {
    form.hidden = true;
    form.nextElementSibling.hidden = false;
  });
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
