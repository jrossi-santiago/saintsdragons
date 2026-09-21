/* Saints & Dragons — content, routing, search, theme */

const POSTS = [
  {
    title: "Become Someone You Respect",
    date: "Apr 25, 2026",
    tags: ["Growth", "Discipline"],
    image: "assets/post-1.jpg",
    alt: "Waves washing onto a beach at sunrise",
    body: [
      "It is easy to measure success through external standards like recognition, status, or comparison. But those measures are unstable and temporary.",
      "A steadier question is quieter: would the person you are becoming earn your respect? Respect is not won in a single decision — it accumulates in the small, unwitnessed ones.",
      "Discipline is simply the habit of keeping promises to yourself. Keep enough of them and self-trust stops being an idea you argue for and becomes something you can feel."
    ]
  },
  {
    title: "The Quiet Work of Consistency",
    date: "Apr 11, 2026",
    tags: ["Habits", "Focus"],
    image: "assets/post-2.jpg",
    alt: "Mountain ridge at sunrise",
    body: [
      "Motivation gets the credit, but consistency does the work. The days that shape a life are rarely the dramatic ones.",
      "Build a floor, not a ceiling. Decide the smallest version of the practice you will not skip, and let the good days take care of themselves."
    ]
  },
  {
    title: "Clarity Before Speed",
    date: "Mar 28, 2026",
    tags: ["Clarity", "Intention"],
    image: "assets/post-3.jpg",
    alt: "Lake and mountains at dusk",
    body: [
      "Most people are not short on effort. They are short on direction, and effort without direction feels like progress while quietly costing years.",
      "Before asking how to move faster, ask what you would regret arriving at sooner."
    ]
  }
];

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
  now: {
    title: "Now",
    sub: "What I'm focused on at the moment.",
    html: `
      <div class="prose">
        <p>Updated September 2026.</p>
        <ul>
          <li><strong>Writing</strong> — a new collection of essays on self-respect.</li>
          <li><strong>Reading</strong> — slowly, and only one book at a time.</li>
          <li><strong>Training</strong> — five mornings a week, no exceptions.</li>
          <li><strong>Coaching</strong> — a small number of one-to-one clients.</li>
        </ul>
      </div>`
  },
  books: {
    title: "Books",
    sub: "Longer work, in print and progress.",
    html: `
      <div class="card-grid">
        <div class="card"><h3>The Quiet Standard</h3><p>On building self-trust through small, kept promises. Available now.</p></div>
        <div class="card"><h3>Slow Mornings</h3><p>A short book about attention and the first hour of the day.</p></div>
        <div class="card"><h3>Untitled</h3><p>In progress — essays on discipline without self-punishment.</p></div>
      </div>`
  },
  services: {
    title: "Services",
    sub: "Ways we can work together.",
    html: `
      <div class="card-grid">
        <div class="card"><h3>1:1 Coaching</h3><p>Twelve weeks of focused work on direction, habits, and follow-through.</p></div>
        <div class="card"><h3>Intensive Session</h3><p>A single 90-minute session to untangle one decision you keep circling.</p></div>
        <div class="card"><h3>Speaking</h3><p>Talks and workshops on clarity, discipline, and intentional living.</p></div>
      </div>`
  },
  resources: {
    title: "Resources",
    sub: "Free things worth your time.",
    html: `
      <div class="card-grid">
        <div class="card"><h3>The Weekly Review</h3><p>A one-page template for closing the week honestly.</p></div>
        <div class="card"><h3>Habit Floor Worksheet</h3><p>Define the smallest version you will not skip.</p></div>
        <div class="card"><h3>Reading List</h3><p>Books that changed how I work, updated twice a year.</p></div>
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

function postHTML(p) {
  return `
    <article class="post">
      <h2 class="post-title">${p.title}</h2>
      <div class="post-meta">
        <span>${p.date}</span>
        <span class="tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</span>
      </div>
      <div class="post-image"><img src="${p.image}" alt="${p.alt}" loading="lazy" /></div>
      <div class="post-body">${p.body.map(t => `<p>${t}</p>`).join("")}</div>
      <a class="read-more" href="#home">Continue reading <svg class="ic"><use href="#i-arrow"/></svg></a>
    </article>`;
}

function renderHome(query = "") {
  const q = query.trim().toLowerCase();
  const list = q
    ? POSTS.filter(p =>
        (p.title + " " + p.tags.join(" ") + " " + p.body.join(" ")).toLowerCase().includes(q))
    : POSTS;

  main.innerHTML = `<div class="content">${
    list.length
      ? list.map(postHTML).join("")
      : `<p class="empty">No entries match “${query}”.</p>`
  }</div>`;
}

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

/* ------------------------------------------------------------- Tonight */

function renderTonight() {
  const card = tonightCard();
  const brief = card.brief ? BRIEFS[card.brief] : null;
  const tale = TALES[card.tale];
  const earlier = CARDS.filter(c => c.date < card.date).slice(-5).reverse();

  main.innerHTML = `
    <div class="content">
      <header class="page-head">
        <h2>History for you at lunch. A tale for them at bedtime.</h2>
        <p>One true story from history for you, one tale to read aloud to them, written to go together. Twenty minutes. No homework.</p>
        <a class="btn" href="#${brief ? "brief/" + card.brief : "tale/" + card.tale}">Open tonight's card</a>
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

      <p class="night-foot">Our tradition is not a worship of ashes but a preservation of fire. New cards twice a week.</p>
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

      ${list.length ? `<div class="shelf">${list.map(([slug, b]) => {
        const tale = TALES[b.tale];
        return `<article class="shelf-item">
          <h3>${esc(b.title)}</h3>
          <p class="shelf-meta">${esc(b.era)} · ${esc(b.kind)} · ${b.minutes} min</p>
          <p class="shelf-hook">${esc(b.hook)}</p>
          ${b.stillWithUs ? `<p class="shelf-line"><strong>Still with us:</strong> ${esc(b.stillWithUs)}</p>` : ""}
          ${tale ? `<p class="shelf-line"><strong>Read it to them:</strong> <a href="#tale/${b.tale}">${esc(tale.title)}</a></p>` : ""}
          <a class="btn btn-quiet" href="#brief/${slug}">Read the brief</a>
        </article>`;
      }).join("")}</div>` : `<p class="empty">Nothing on this shelf yet. Clear a filter, or come back — new briefs go up twice a week.</p>`}
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

      ${list.length ? `<div class="shelf">${list.map(([slug, t]) => {
        const brief = t.brief ? BRIEFS[t.brief] : null;
        return `<article class="shelf-item">
          <h3>${esc(t.title)}</h3>
          <p class="shelf-meta">Age ${t.age} · ${esc(t.minutes)} min read-aloud · ${esc(t.theme)}</p>
          <p class="shelf-tag">${esc(t.origin)}</p>
          ${t.night ? `<p class="shelf-line"><strong>Night ${t.night.n} of ${t.night.of}.</strong></p>` : ""}
          ${brief ? `<p class="shelf-line"><strong>Goes with:</strong> <a href="#brief/${t.brief}">${esc(brief.title)}</a></p>` : ""}
          <a class="btn btn-quiet" href="#tale/${slug}">Read it aloud</a>
        </article>`;
      }).join("")}</div>` : `<p class="empty">Nothing on this shelf yet. Clear a filter, or come back — new tales go up twice a week.</p>`}
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
  tonight: ["Saints & Dragons | History for dads, tales for bedtime",
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
  const [key, param] = [raw.split("/")[0], raw.split("/").slice(1).join("/")];
  const owner = NAV_OWNER[key] || "#" + key;

  document.querySelectorAll(".nav-item").forEach(a =>
    a.classList.toggle("is-active", a.getAttribute("href") === owner));
  setMeta(key, param);

  if (key === "tonight") renderTonight();
  else if (key === "history") renderHistory();
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
