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

function route() {
  const key = (location.hash || "#home").slice(1);
  document.querySelectorAll(".nav-item").forEach(a =>
    a.classList.toggle("is-active", a.getAttribute("href") === "#" + key));

  if (key === "home" || !PAGES[key]) renderHome(searchInput.value);
  else renderPage(key);

  main.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  closeSidebar();
}

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
