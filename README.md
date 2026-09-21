# Saints & Dragons

History for dads. Tales for bedtime. **The Nightly Receipt** is the product:
today in history, a piece of history for you, and a tale to read aloud,
printed like a till receipt. `/` sells it; `/account` is it.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

- `index.html` — the public marketing home at `/`. Self-contained (its own
  inlined `<style>`), but reads the shared design tokens from `styles.css` so
  it stays on-brand. No login exists, so every CTA on it just links to
  `/account` — there's nothing to gate yet.
- `account/` — the actual app, for people who've "signed up":
  - `index.html` — page shell: sidebar (profile, bio, socials, theme toggle,
    search, page nav) and main content area. Loads `/content.js` and
    `/app.js` by absolute path, same reasoning as `7stories/` below — it
    lives in a subdirectory and must not depend on a relative path to assets
    one level up.
- `styles.css` — design tokens for dark/light themes, layout, and components
  — shared by `account/index.html`, `7stories/index.html`, and read (for
  tokens only) by the root `index.html`.
- `app.js` — hash routing, all page renderers, search, theme persistence,
  mobile sidebar. Only loaded by `account/index.html`.
- `content.js` — the nightly content: `CARDS`, `BRIEFS`, `TALES`, `TODAY`.
  Loaded before `app.js`. This is the only file you edit to add a night.
- `stories/` — standalone full-story pages the receipt's "Read the rest"
  links point to (e.g. `stories/the-lion-and-the-mouse.html`). Each one is a
  single self-contained file, not a subdirectory `index.html`, so there's no
  bare-path/trailing-slash ambiguity to worry about.
- `7stories/` — the email-gated campaign page served at `/7stories`:
  - `index.html` — self-contained: same sidebar shell, email gate, download panel, with its CSS and JS inlined. Inlined on purpose — the page is reachable both as `/7stories` and `/7stories/`, and at the bare path a relative `<script src="stories.js">` would resolve against the site root and 404, leaving a blank page. Its nav links to the app use the absolute `/account#...` form for the same reason.
  - `7-bedtime-stories.pdf` — placeholder PDF. Overwrite this file with the real one; no code change needed.

See `LESSONS-LEARNED.md` before changing how pages or assets are linked.

## Running locally

The root `index.html` (the marketing page) can be opened directly as a file.
`account/index.html` cannot — it loads `/content.js`, `/app.js` and
`/styles.css` by absolute path, which only resolves against a served site
root, not `file://`. Serve the whole thing instead:

```sh
python3 -m http.server 8000
```

Note: `http.server` redirects `/7stories` and `/account` to their
trailing-slash form, which most production hosts do not do. To test a page
the way it will actually be served, request the bare path against a server
that serves the directory index without redirecting — see `LESSONS-LEARNED.md`.

## Customizing

- **Profile photo** — currently a blank placeholder (`.avatar` in `styles.css`). Replace with an `<img>` inside `.avatar` in `account/index.html`.
- **Pages** — the `About` and `Contact` pages are the only ones left in the `PAGES` object in `app.js`; nav links live in `account/index.html`. Everything else on the site is nightly content — see below.
- **Social links** — the three `<a href="#">` entries in `.socials`.
- **The marketing home (`index.html`)** — headline, pricing, and the "product shot" receipt preview in the hero are all hand-written copy, not pulled from `content.js`. Update them by hand when the pitch or price changes.
- **Campaign page** — all visible copy in `7stories/index.html` is sample text. The form fields are first name, children's age ranges (multi-select: 0–2, 3–5, 6–9, 10+) and email; all are required.
- **Signup collection** — the form posts to Formspree (`https://formspree.io/f/xqpaqzne`, set as the form's `action`) as JSON: `firstName`, `email`, `childAges`, `source`. Submissions are collected there; no email is sent to the reader. To change endpoints, edit the `action` attribute — `stories.js` reads it from the form. If the POST fails, the download is still unlocked so a network error never blocks a reader.

## The pages

`/` is a static pitch for the product; it never touches `content.js` or
`app.js`. Everything below lives at `/account`, one hash route on that page,
so nothing here depends on a relative path to its own assets.

| Route | Page |
| --- | --- |
| `#home` | **Tonight's receipt** — the actual product: today in history, a brief for you, and a tale, pulled live from `CARDS`/`BRIEFS`/`TALES`/`TODAY` and printed in the receipt format. Below it, "Earlier nights" (the archive strip) and quick links out to the three shelves. `#tonight` is kept as a redirect for old links, but is not a real page. |
| `#history` | History for dads — the brief shelf, filtered by era and kind |
| `#today` | Today in history — opens on today's date. `#today/MM-DD` opens a specific one |
| `#bedtime` | Bedtime stories — the tale shelf, filtered by age and theme |

Two more routes are reachable but deliberately not in the nav: `#brief/<slug>`
and `#tale/<slug>`, the detail pages.

The sidebar search box searches across `BRIEFS` and `TALES` (title, hook,
era/kind, theme) and swaps the receipt view for a results shelf while
there's a query; clearing it goes back to tonight's receipt.

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
and are swapped on each route change; `account/index.html`'s own `<title>` and
`<meta name="description">` are the fallback for any page without an entry
(currently About and Contact), and match the Home copy.
