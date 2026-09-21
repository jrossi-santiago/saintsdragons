# Saints & Dragons

Personal site for **Saints & Dragons** — *Author & Life Coach*.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

- `index.html` — page shell: sidebar (profile, bio, socials, theme toggle, search, page nav) and main content area.
- `styles.css` — design tokens for dark/light themes, layout, and components.
- `app.js` — post data, page content, hash routing, search filtering, theme persistence, mobile sidebar.
- `assets/` — post images (free photos from Unsplash).
- `7stories/` — the email-gated campaign page served at `/7stories`:
  - `index.html` — same sidebar shell; email gate on the right, download panel after submit.
  - `stories.css` — gate, multi-select, download panel, print rules.
  - `stories.js` — form validation, the Formspree POST, and the reveal.
  - `7-bedtime-stories.pdf` — placeholder PDF. Overwrite this file with the real one; no code change needed.

## Running locally

Open `index.html` directly, or serve it:

```sh
python3 -m http.server 8000
```

## Customizing

- **Profile photo** — currently a blank placeholder (`.avatar` in `styles.css`). Replace with an `<img>` inside `.avatar` in `index.html`.
- **Posts** — edit the `POSTS` array in `app.js`.
- **Pages** — edit the `PAGES` object in `app.js`; nav links live in `index.html`.
- **Social links** — the three `<a href="#">` entries in `.socials`.
- **Campaign page** — all visible copy in `7stories/index.html` is sample text. The form fields are first name, children's age ranges (multi-select: 0–2, 3–5, 6–9, 10+) and email; all are required.
- **Signup collection** — the form posts to Formspree (`https://formspree.io/f/xqpaqzne`, set as the form's `action`) as JSON: `firstName`, `email`, `childAges`, `source`. Submissions are collected there; no email is sent to the reader. To change endpoints, edit the `action` attribute — `stories.js` reads it from the form. If the POST fails, the download is still unlocked so a network error never blocks a reader.
