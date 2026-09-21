# Saints & Dragons

History for dads. Tales for bedtime. Home *is* tonight's card — one true story
from history for you, one tale to read aloud to them, written to go together.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

- `index.html` — page shell: sidebar (profile, bio, socials, theme toggle, search, page nav) and main content area.
- `styles.css` — design tokens for dark/light themes, layout, and components.
- `app.js` — hash routing, all page renderers, search, theme persistence, mobile sidebar.
- `content.js` — the nightly content: `CARDS`, `BRIEFS`, `TALES`, `TODAY`. Loaded before `app.js`. This is the only file you edit to add a night.
- `7stories/` — the email-gated campaign page served at `/7stories`:
  - `index.html` — self-contained: same sidebar shell, email gate, download panel, with its CSS and JS inlined. Inlined on purpose — the page is reachable both as `/7stories` and `/7stories/`, and at the bare path a relative `<script src="stories.js">` would resolve against the site root and 404, leaving a blank page.
  - `7-bedtime-stories.pdf` — placeholder PDF. Overwrite this file with the real one; no code change needed.

See `LESSONS-LEARNED.md` before changing how pages or assets are linked.

## Running locally

Open `index.html` directly, or serve it:

```sh
python3 -m http.server 8000
```

Note: `http.server` redirects `/7stories` to `/7stories/`, which most production
hosts do not do. To test a page the way it will actually be served, request the
bare path against a server that serves the directory index without redirecting —
see `LESSONS-LEARNED.md`.

## Customizing

- **Profile photo** — currently a blank placeholder (`.avatar` in `styles.css`). Replace with an `<img>` inside `.avatar` in `index.html`.
- **Pages** — the `About` and `Contact` pages are the only ones left in the `PAGES` object in `app.js`; nav links live in `index.html`. Everything else on the site is nightly content — see below.
- **Social links** — the three `<a href="#">` entries in `.socials`.
- **Campaign page** — all visible copy in `7stories/index.html` is sample text. The form fields are first name, children's age ranges (multi-select: 0–2, 3–5, 6–9, 10+) and email; all are required.
- **Signup collection** — the form posts to Formspree (`https://formspree.io/f/xqpaqzne`, set as the form's `action`) as JSON: `firstName`, `email`, `childAges`, `source`. Submissions are collected there; no email is sent to the reader. To change endpoints, edit the `action` attribute — `stories.js` reads it from the form. If the POST fails, the download is still unlocked so a network error never blocks a reader.

## The pages

Home is Tonight — there is no separate blog or landing page in front of it.
Everything else is a hash route on the same root page, so nothing here depends
on a relative path to its own assets.

| Route | Page |
| --- | --- |
| `#home` | Tonight's card in full: dad brief, tale, a question, why-ours, a prayer or verse, "Earlier nights," the thesis, the email signup, and the shelf links out. `#tonight` is kept as a redirect for old links, but is not a real page — Home is the whole thing now. |
| `#history` | History for dads — the brief shelf, filtered by era and kind |
| `#today` | Today in history — opens on today's date. `#today/MM-DD` opens a specific one |
| `#bedtime` | Bedtime stories — the tale shelf, filtered by age and theme |

Two more routes are reachable but deliberately not in the nav: `#brief/<slug>`
and `#tale/<slug>`, the detail pages.

The sidebar search box searches across `BRIEFS` and `TALES` (title, hook,
era/kind, theme) and swaps Home's tonight's-card view for a results shelf
while there's a query; clearing it goes back to tonight's card.

**Home's email signup** posts `{ email, source: "home" }` to the same
Formspree endpoint the `/7stories` gate uses (`SIGNUP_ENDPOINT` in `app.js`),
so both forms land in one place for now. Give it its own endpoint later by
changing that constant. Like the `/7stories` gate, the confirmation shows
regardless of whether the POST succeeds — a network error never blocks it.

To add a night, edit `content.js`:

1. Add the brief to `BRIEFS` and its paired tale to `TALES` (a tale names its
   brief with `brief:`, and a brief names its tale with `tale:`).
2. Add a `CARDS` entry with the date, both slugs, the question, the why-ours
   line and the prayer. Cards are newest last, and the page shows the most
   recent one that is not in the future.
3. Optionally add a `TODAY` entry keyed `"MM-DD"`, 100 to 150 words. A date with
   no entry shows the nearest one that has been written.

Tales without a brief are fine — they show on the bedtime shelf and simply have
no "Goes with" line. Cards, however, should always carry both halves. A
multi-night tale sets `night: { n, of }` and a shared `series` key.

Per-page SEO titles and meta descriptions live in the `META` object in `app.js`
and are swapped on each route change; `index.html`'s own `<title>` and
`<meta name="description">` are the fallback for any page without an entry
(currently About and Contact), and match the Home copy.
