/* Saints & Dragons — /7stories: email gate + PDF delivery */

const gate = document.getElementById("gate");
const delivery = document.getElementById("delivery");
const form = document.getElementById("gateForm");

/* ---------- multi-select (ages) ---------- */
const multi = document.getElementById("ageSelect");
const trigger = document.getElementById("ageTrigger");
const menu = document.getElementById("ageMenu");
const ageLabel = document.getElementById("ageLabel");
const ageBoxes = () => Array.from(menu.querySelectorAll("input[name='ages']"));
const LABELS = { "0-2": "0–2", "3-5": "3–5", "6-9": "6–9", "10+": "10+" };

function selectedAges() {
  return ageBoxes().filter(b => b.checked).map(b => b.value);
}

function setMenu(open) {
  multi.classList.toggle("is-open", open);
  menu.hidden = !open;
  trigger.setAttribute("aria-expanded", String(open));
}

function syncAgeLabel() {
  const picked = selectedAges();
  ageLabel.textContent = picked.length
    ? picked.map(v => LABELS[v]).join(", ") + " years"
    : "Select all that apply";
  trigger.classList.toggle("is-placeholder", picked.length === 0);
}

trigger.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("change", () => {
  syncAgeLabel();
  if (selectedAges().length) clearError("ages");
});
document.addEventListener("click", e => { if (!multi.contains(e.target)) setMenu(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ---------- validation ---------- */
function fieldOf(name) {
  const err = form.querySelector(`[data-err="${name}"]`);
  return err ? err.closest(".field") : null;
}
function setError(name, message) {
  const field = fieldOf(name);
  if (!field) return;
  field.classList.add("is-invalid");
  field.querySelector(`[data-err="${name}"]`).textContent = message;
}
function clearError(name) {
  const field = fieldOf(name);
  if (field) field.classList.remove("is-invalid");
}

form.addEventListener("input", e => { if (e.target.name) clearError(e.target.name); });

form.addEventListener("submit", e => {
  e.preventDefault();

  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const email = form.email.value.trim();
  const ages = selectedAges();
  let ok = true;

  if (!firstName) { setError("firstName", "Please enter your first name."); ok = false; }
  if (!lastName) { setError("lastName", "Please enter your last name."); ok = false; }
  if (!ages.length) { setError("ages", "Please choose at least one age range."); ok = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    setError("email", email ? "Please enter a valid email address." : "Please enter your email address.");
    ok = false;
  }

  if (!ok) {
    form.querySelector(".field.is-invalid input, .field.is-invalid .multi-trigger")?.focus();
    return;
  }

  const signup = { firstName, lastName, email, ages, submittedAt: new Date().toISOString() };

  /* Hook up your email platform here — e.g. POST `signup` to your list
     provider or form endpoint. Access is granted either way so the reader
     is never left waiting on a network call. */
  console.log("7stories signup", signup);

  document.getElementById("welcome").textContent =
    `Thanks, ${firstName} — sample subheading goes here. One story for each night of the week, ready to read or print.`;
  gate.hidden = true;
  delivery.hidden = false;
  window.scrollTo(0, 0);
});

/* ---------- theme + mobile sidebar (shared behaviour) ---------- */
const root = document.documentElement;
const storedTheme = localStorage.getItem("sd-theme");
if (storedTheme) root.setAttribute("data-theme", storedTheme);
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("sd-theme", next);
});

const sidebar = document.getElementById("sidebar");
const scrim = document.getElementById("scrim");
const mobileToggle = document.getElementById("mobileToggle");
function closeSidebar() {
  sidebar.classList.remove("is-open");
  scrim.classList.remove("is-open");
  mobileToggle.setAttribute("aria-expanded", "false");
}
mobileToggle.addEventListener("click", () => {
  const open = sidebar.classList.toggle("is-open");
  scrim.classList.toggle("is-open", open);
  mobileToggle.setAttribute("aria-expanded", String(open));
});
scrim.addEventListener("click", closeSidebar);

/* sidebar search belongs to the blog — send it home */
const searchInput = document.getElementById("search");
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    location.href = "../index.html#home";
  }
});

/* ---------- boot ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
syncAgeLabel();
gate.hidden = false;
