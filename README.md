# Saints & Dragons

Personal site for **Saints & Dragons** — *Author & Life Coach*.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

- `index.html` — page shell: sidebar (profile, bio, socials, theme toggle, search, page nav) and main content area.
- `styles.css` — design tokens for dark/light themes, layout, and components.
- `app.js` — post data, page content, hash routing, search filtering, theme persistence, mobile sidebar.
- `assets/` — post images (free photos from Unsplash).

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
