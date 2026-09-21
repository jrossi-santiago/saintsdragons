# Saints & Dragons

Personal site for **Saints & Dragons** — *Author & Life Coach*.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

- `index.html` — page shell: sidebar (profile, bio, socials, theme toggle, search, page nav) and main content area.
- `styles.css` — design tokens for dark/light themes, layout, and components.
- `app.js` — post data, page content, hash routing, search filtering, theme persistence, mobile sidebar, and the renderers for the nightly pages.
- `content.js` — the nightly content: `CARDS`, `BRIEFS`, `TALES`, `TODAY`. Loaded before `app.js`. This is the only file you edit to add a night.
- `assets/` — post images (free photos from Unsplash).
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
- **Posts** — edit the `POSTS` array in `app.js`.
- **Pages** — edit the `PAGES` object in `app.js`; nav links live in `index.html`.

### The nightly pages

Four routes, built from the copy doc. All four are hash routes on the root page,
so nothing here depends on a relative path to its own assets.

| Route | Page |
| --- | --- |
| `#tonight` | Tonight's card: dad brief, tale, a question, why-ours, a prayer or verse, plus the "Earlier nights" strip |
| `#history` | History for dads — the brief shelf, filtered by era and kind |
| `#today` | Today in history — opens on today's date. `#today/MM-DD` opens a specific one |
| `#bedtime` | Bedtime stories — the tale shelf, filtered by age and theme |

Two more routes are reachable but deliberately not in the nav: `#brief/<slug>`
and `#tale/<slug>`, the detail pages.

The copy doc calls for Tonight to *be* Home. It is a separate page for now, and
the existing Home feed is untouched, so the swap is one line in `index.html`
whenever you want it.

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
and are swapped on each route change.
- **Social links** — the three `<a href="#">` entries in `.socials`.
- **Campaign page** — all visible copy in `7stories/index.html` is sample text. The form fields are first name, children's age ranges (multi-select: 0–2, 3–5, 6–9, 10+) and email; all are required.
- **Signup collection** — the form posts to Formspree (`https://formspree.io/f/xqpaqzne`, set as the form's `action`) as JSON: `firstName`, `email`, `childAges`, `source`. Submissions are collected there; no email is sent to the reader. To change endpoints, edit the `action` attribute — `stories.js` reads it from the form. If the POST fails, the download is still unlocked so a network error never blocks a reader.
