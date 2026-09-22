# Saints & Dragons

> Dads learning things worth knowing & passing them on to their kids.
> History, faith and virtue, handed down rather than explained.

That line is the positioning. It is the meta description on `/` and
`/account`, the `home` entry in `META` in `app.js`, and the bio on every
external profile. **If you change it, change it in all of those places at
once** — it is the one sentence that has to match everywhere.

Two things it commits us to, both easy to break by accident:

- **The subject is the dad, not the product.** It opens with what he does,
  not with what arrives. Copy that starts "The Nightly Receipt is…" has
  quietly changed the subject.
- **"Handed down rather than explained" is a refusal.** No moralising, no
  lesson spelled out after the story, no fun facts. The About page says the
  same thing at length under *What this is not*; that section and this line
  have to keep agreeing.

**The Nightly Receipt** is the product: today in history, a piece of history
for you, and a tale to read aloud, printed like a till receipt. `/` sells it;
`/account` is it.

`History for dads · Tales for bedtime` stays as the short lockup — the
sidebar, the receipt header, the banners. It is a subset of the line above,
not a competing claim, and it is baked into rendered PNGs, so changing it
means re-rendering `assets/social/`.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Structure

- `index.html` — the public marketing home at `/`. Self-contained (its own
  inlined `<style>`), but reads the shared design tokens from `styles.css` so
  it stays on-brand. No login exists. Every CTA on it points at the `#start`
  signup form near the foot of the page; only the footer's "Already a member?"
  link goes to `/account`.
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
- `assets/` — the brand mark. See "The logo" below.
- `stories/` — standalone full-story pages the receipt's "Read the rest"
  links point to (e.g. `stories/the-lion-and-the-mouse.html`). Each one is a
  single self-contained file, not a subdirectory `index.html`, so there's no
  bare-path/trailing-slash ambiguity to worry about.
- `7stories/` — the email-gated campaign page served at `/7stories`:
  - `index.html` — self-contained: same sidebar shell, email gate, download panel, with its CSS and JS inlined. Inlined on purpose — the page is reachable both as `/7stories` and `/7stories/`, and at the bare path a relative `<script src="stories.js">` would resolve against the site root and 404, leaving a blank page. Its nav links to the app use the absolute `/account#...` form for the same reason.
  - `7-bedtime-stories.pdf` — placeholder PDF. Overwrite this file with the real one; no code change needed.

See `CLAUDE.md` for how changes get to `main` and what to check before
merging, and `LESSONS-LEARNED.md` before changing how pages or assets are
linked.

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

- **Profile photo** — `.avatar` in `styles.css` currently shows the dragon mark. Replace the `background` with an `<img>` inside `.avatar` in `account/index.html` when there's a real photo.
- **Pages** — the `About` and `Contact` pages are the only ones left in the `PAGES` object in `app.js`; nav links live in `account/index.html`. Everything else on the site is nightly content — see below.
- **Social links** — the three `<a href="#">` entries in `.socials`.
- **The marketing home (`index.html`)** — headline, pricing, and the "product shot" receipt preview in the hero are all hand-written copy, not pulled from `content.js`. Update them by hand when the pitch or price changes.
- **The "bigger thing" section (`#work`)** — two hand-maintained columns. The
  left one uses a tick and may only list things that actually exist; the right
  one uses a hollow dot (`#i-dot`) and is explicitly unshipped, which the note
  underneath says out loud. When something ships, move it across and change its
  icon — never tick an item in the right-hand column in place.
- **Campaign page** — all visible copy in `7stories/index.html` is sample text. The form fields are first name, children's age ranges (multi-select: 0–2, 3–5, 6–9, 10+) and email; all are required.
- **Landing-page signup (`#start`)** — the only thing on `/` that collects
  anything. First name and email, posting to the same Formspree endpoint as JSON
  with `source: "/#start"`. The endpoint is the form's `action` attribute and the
  inline script reads it from there, same as `/7stories`, so there is one place
  to change it. The form ships as real markup with a real `action`, so it still
  posts if the script never runs (see rule 2 in `LESSONS-LEARNED.md`). A failed
  POST is reported to the reader rather than swallowed — same reasoning as the
  Contact form: there is no download to fall back on. **Nothing sends an email.**
  Addresses land in the Formspree inbox and the first receipt goes out by
  whatever means you send it.
- **Signup collection** — the form posts to Formspree (`https://formspree.io/f/xqpaqzne`, set as the form's `action`) as JSON: `firstName`, `email`, `childAges`, `source`. Submissions are collected there; no email is sent to the reader. To change endpoints, edit the `action` attribute — `stories.js` reads it from the form. If the POST fails, the download is still unlocked so a network error never blocks a reader.
- **Contact form** — posts to the same Formspree endpoint as the campaign page,
  as JSON: `name`, `email`, `message`, `source`. The endpoint is `FORM_ENDPOINT`
  at the top of `app.js`; change it in that one place. Unlike `/7stories`, a
  failed POST here is reported to the reader rather than swallowed — there is no
  download to fall back on, so silently thanking someone for a message that went
  nowhere would be a lie. Both surfaces send a `source` field, so submissions are
  distinguishable in one Formspree inbox.

## The pages

`/` is a static pitch for the product; it never touches `content.js` or
`app.js`. Everything below lives at `/account`, one hash route on that page,
so nothing here depends on a relative path to its own assets.

| Route | Page |
| --- | --- |
| `#home` | **Tonight's receipt** — the actual product: today in history, a brief for you, and a tale, pulled live from `CARDS`/`BRIEFS`/`TALES`/`TODAY` and printed in the receipt format. Below it, "Earlier nights": the five previous cards as miniature torn-off receipts, cut off with a fade, scrolling horizontally, with a link to the full archive. `#tonight` is kept as a redirect for old links, but is not a real page. |
| `#history` | History for dads — the brief shelf, filtered by era and kind |
| `#today` | Today in history — opens on today's date. `#today/MM-DD` opens a specific one |
| `#bedtime` | Bedtime stories — the tale shelf, filtered by age band, by theme and by virtue |

Two more routes are reachable but deliberately not in the nav: `#brief/<slug>`
and `#tale/<slug>`, the detail pages.

The sidebar search box searches across `BRIEFS` and `TALES` (title, hook,
era/kind, theme, virtue, provenance) and swaps the receipt view for a results shelf while
there's a query; clearing it goes back to tonight's receipt.

To add a night, edit `content.js`:

1. Add the brief to `BRIEFS` and its paired tale to `TALES` (a tale names its
   brief with `brief:`, and a brief names its tale with `tale:`).
2. Add a `CARDS` entry with the date, both slugs, the question, the why-ours
   line and the prayer. Cards are newest last, and the page shows the most
   recent one that is not in the future.
3. Optionally add a `TODAY` entry keyed `"MM-DD"`, 100 to 150 words. A date with
   no entry shows the nearest one that has been written.

### Check it before you ship it

```sh
node tools/check-content.js
```

The only test this site has. It reads `content.js` and verifies the things
that break silently: every card points at a brief and a tale that exist, every
pairing reciprocates (the brief names the tale *and* the tale names the brief),
every era, kind, theme, virtue and age band is in its taxonomy, no card is missing its
question, why-ours line or prayer, dates are real and in order, a series adds
up to the number of nights it claims, and every slug in `TODAY` resolves.

No dependencies, and none are wanted — it uses `vm` from the standard library
to evaluate `content.js` the way a browser does, then walks what it defined.

**Errors fail the run (exit 1). Warnings never do.** Warnings are things worth
a look that are not broken: a brief on the shelf that no card ever sent, a
`TODAY` entry outside the 100-to-150-word house length, and any chip in `ERAS`,
`KINDS`, `THEMES` or `VIRTUES` with nothing behind it. That last one is not a
fault — the shelves only draw a chip once something is filed under it — it is
the roadmap, and the warning list is what has not been written yet.

Run it after editing `content.js` and before merging, alongside the
`node --check` step in `CLAUDE.md`.

Tales without a brief are fine — they show on the bedtime shelf and simply have
no "Goes with" line. Cards, however, should always carry both halves. A
multi-night tale sets `night: { n, of }` and a shared `series` key.

### Age on a tale

A tale's `age` is a **bucket id, not a number of years**, and it is never
printed. `AGE_BANDS` in `content.js` turns it into the label every surface
shows:

```js
const AGE_BANDS = { 1: "Ages 4–6", 3: "Ages 7–9" };
```

This used to be broken in a way that was easy to miss: two tales carried an
`ageLabel` of "Ages 4–6" while their `age` was `1`, so the receipt said
"Ages 4–6" and the shelf said "Age 1" about the same story, and the chips said
"Ages 1" and "Ages 3" as if they were toddler ages. One helper, `ageText()` in
`app.js`, is now the only place an age becomes words — receipt, shelf, tale
page, filter chips, shelf copy and the SEO title all go through it, so they
cannot drift apart again.

A tale's own `ageLabel` still overrides the band, for the story that does not
sit squarely in its bucket. That is the `ageLabel` pattern `CLAUDE.md`
describes, working as intended.

The ids are sparse on purpose — bands for older readers slot in between and
above without renumbering anything already filed. Adding one is a single edit
to `AGE_BANDS`: the chips, the shelf copy and the validator all read from it.

### Era and kind on a brief

`ERAS` is chronological and the shelf draws it in order:

    Greece and Rome · After Rome · Knights and lords · Kings and gunpowder ·
    The 1700s · The 1800s · 1900 to 1950 · And everything else

"After Rome" covers late antiquity, roughly 300 to 600 — Patrick lives there,
and Benedict, Columba and the fall of Rome belong there when they are written.
"Kings and gunpowder" covers the early modern centuries, and holds Lepanto and
Vienna. Both were added after an audit found briefs parked in "And everything
else" for want of a bucket; that catch-all now holds nothing, which is the
point of it.

Brunelleschi's dome (1420) is filed under "Knights and lords", which is a
stretch for Renaissance Florence. It is left there on purpose rather than moved
without a decision — if enough Renaissance material arrives, that is when the
list wants another entry.

### Theme and virtue on a tale

Two separate axes, because a reader asks two different questions:

- **`theme`** — what is *in* the story. "One with knights in it." The list is
  `THEMES`: Knights, Dragons, Forests, Castles, Princes and princesses, The sea.
  (Princes and princesses has no tale yet, so no chip is drawn for it.)
  **Optional.** A couple of tales (the dome, Cincinnatus) are history-shaped and
  have no fantasy furniture in them; filing them under a theme they do not have
  to make a chip row look tidy would be a lie. They are still reachable by
  virtue, by age and by search.
- **`virtue`** — what the story is *about*. "One about telling the truth
  tonight." The list is `VIRTUES`: Courage, Obedience, Mercy, Honesty, Humility,
  Perseverance, Forgiveness, Faithfulness. **Required on every tale.**

These were one mixed list until they were split, which made both axes weaker —
"Knights" and "Mercy" were offered as if they were the same kind of choice. Both
now get their own labelled row of chips on the bedtime shelf.

Add to `VIRTUES` when a tale genuinely needs a word that is not there. Adding
speculatively is safe: an entry nothing is filed under simply is not drawn (see
"Chips draw themselves" below). `Princes and princesses` is carried for exactly
that reason — the brand names it, no tale has one yet, so it sits in the list
as a note to self and appears on the shelf the night the first one lands.

### Chips draw themselves

`ERAS`, `KINDS`, `THEMES` and `VIRTUES` stay whole in `content.js` — they are
the plan. The shelves draw a chip only for the entries something is actually
filed under, so a reader never clicks a filter and gets an empty shelf, and a
chip appears by itself the night the first brief or tale lands in it. The
renderer counts across all the data rather than the filtered list, so the row
does not shift under the reader as they click.

This means `node tools/check-content.js` is the only place the gaps are
visible. Read its warnings as the to-write list.

### Provenance on a tale

Every tale carries `origin`, and it is printed on all three surfaces a reader
meets a tale on — the receipt (under the dek), the bedtime shelf (the pill), and
the tale's own page (the meta line). It is four or five words and it must be
true:

- **Traditional** — name the source and the date: `"Aesop, roughly 600 BC"`,
  `"Livy, about 25 BC"`, `"Vasari, 1550"`, `"English legend, about 1000 AD"`.
- **Written for this, out of real history** — say so and name the history:
  `"New tale, from Vienna, 1683"`.
- **Written for this, out of nothing** — name the tradition it stands in:
  `"New tale, from the old dragon stories"`.

`source` is optional and longer: one sentence, shown only on the tale's own
page under "Where it comes from", saying plainly what is inherited and what is
invented ("Mila is invented. The winged hussars are not."). Both fields are
searched; neither drives a filter.

Provenance is the cheapest proof the site has that a tale is not content, so an
`origin` that overstates costs more than it earns. If you cannot name a source,
say it is new.

Per-page SEO titles and meta descriptions live in the `META` object in `app.js`
and are swapped on each route change; `account/index.html`'s own `<title>` and
`<meta name="description">` are the fallback for any page without an entry
(currently About and Contact), and match the Home copy.

## The logo

`assets/source/dragon-original.png` is the artwork everything else is traced
from — lime body, black outline, coral flame. **Keep it.** The SVGs cannot be
edited back into it, and it is the reference if the mark ever needs redrawing.

Two shapes, two themes, four files:

| | pale surfaces (`-light`) | dark surfaces (`-dark`) |
| --- | --- | --- |
| **line art** — 48px and up | `dragon-light.svg` | `dragon-dark.svg` |
| **solid silhouette** — below 48px | `dragon-mark-light.svg` | `dragon-mark-dark.svg` |

The silhouette is not a nicety: below about 48px the outlined version closes up
into an orange smudge. The landing topbar mark is 30px and uses it; the 58px
sidebar avatar is line art.

Colours, and why:

| part | pale surfaces | dark surfaces |
| --- | --- | --- |
| body | `#e5825a` (`--accent`, dark theme) | `#e5825a` — same in both, it *is* the brand |
| outline | `#221c15` (`--rcpt-ink`) | `#d2c8be` (logo-only) |
| flame | `#a8451f` (`--rcpt-red`) | `#c9502a` |

The outline inverts because a near-black line vanishes on `#0b0b0c`. It is
deliberately **bone, not paper white** — at full `#f6f1e3` the outline becomes
the brightest thing in the frame and the logo reads as a cream dragon rather
than an orange one. Same reason the flame lifts to `#c9502a` on dark: `#a8451f`
against a dark ground is a smudge, not a colour.

`#d2c8be` is the one logo colour with no token behind it, and it must stay that
way. **Do not "tidy" it into `--rcpt-rule` (`#cfc3a4`)** — that was the first
attempt and it read visibly green. `--rcpt-rule` is hue 43° at 31% saturation,
which is olive; it looks like warm tan only because it is always drawn on cream
paper. Next to a hue-17° orange body on a near-black ground it reads as the lime
of the original artwork. The outline needs to stay near the body's hue with the
chroma kept low — see `LESSONS-LEARNED.md`.

`dragon.svg` and `dragon-mark.svg` are self-switching copies that follow
`prefers-color-scheme` from an internal `<style>`. They exist for the favicon
and for any bare `<img>`, where an external stylesheet's custom properties
cannot reach inside the file. **In-page CSS should use the explicit `-light` /
`-dark` files**, because the site themes on a `data-theme` attribute, which
`prefers-color-scheme` knows nothing about — a self-switching file in the
sidebar would ignore the theme toggle and follow the OS instead.

Every path is root-absolute (`/assets/…`) so a subdirectory page loaded at its
bare path still finds them — see `LESSONS-LEARNED.md`.

PNGs (`*-512.png`, `*-1024.png`, `apple-touch-icon.png`, `favicon-32.png`) are
rendered from the SVGs for places that can't take vector.

### Social banners

`assets/social/` holds the X and Substack banners. Two concepts, each in a dark
and a paper colourway:

- **lockup** — dragon, wordmark, tagline, and `ONE TRUE STORY · ONE TALE ·
  EVERY NIGHT`. Says what this is in one glance.
- **loop** — "You learn something worth knowing" → dragon in a dotted ring with
  circulating arrows → "They get a story worth hearing", wordmark beneath.
  Argues the actual proposition; asks the reader for two seconds more.
  `loop-dark-x-wordmark-above` is the same thing with the wordmark on top —
  kept as an alternative, but it reads top-heavy.

Files are at the platforms' own dimensions (1500x500 for X, 1200x600 for
Substack), not 2x. Both services re-encode on upload, so a retina export only
costs weight — the first pass shipped 3000x1000 files named `1500x500`, which
is the kind of thing that wastes someone's afternoon later.

**The rule that matters if you edit these:** X overlays the profile avatar on
the bottom-left and crops the header differently across viewports, so the whole
composition lives in a centred block no wider than **1000px** and no taller than
**300px** of the 1500x500 frame. The lockup measures 932x224 and the loop
874x258. Both were checked against four cuts — height -25%, height -40%, width
cropped to 2:1, and with the avatar overlaid — and nothing is lost in any of
them. An earlier round that spread content toward the edges did get clipped.
If you move something, re-check that budget rather than trusting the eye.

These are rendered from standalone HTML templates that are **not** in the repo,
so re-rendering at a new ratio currently means rebuilding them. Ask if you want
the generator committed too.

### The knight

`knight-light.svg` / `knight-dark.svg` (plus the self-switching `knight.svg`
and 512/1024 PNGs) are the "Saints" half, recoloured onto the same palette.
**Nothing on the site uses them yet** — they are in the repo so the choice of
where, if anywhere, can be made later. Deleting them is a decision, not
cleanup.

Unlike the dragon this is a *shaded* illustration: every surface is split
left-light / right-dark, and that modelling is the whole design language. So
the recolour does not assign a colour per region — it maps each region's
source luminance through a brand-hue ramp, which moves the hue and leaves the
lighting intact. The armour was hue 212° (cool blue-grey), the opposite side
of the wheel from everything else here.

| part | pale surfaces | dark surfaces |
| --- | --- | --- |
| armour, 4-step ramp | `#b0a89e` → `#6b6257` | `#c9c1b8` → `#8c7c69` |
| face plate | `#c3bdb6` / `#8c8072` | `#dcd7d0` / `#a7998a` |
| trim and shield | `#e08967` / `#c95f36` | `#e08967` / `#cb633a` |
| slots, rivets, chevron | `#221c15` | `#241d16` |

The shield is deliberately the dragon's body orange so the two read as one
family. The trim ramp is **compressed relative to the source**: at the source's
own spacing, doubling the saturation turned a subtle tonal split into a hard
edge and the shield stopped reading as one surface lit from the left. Armour
saturation is 10–14%, kept under the 15% ceiling that the outline entry in
`LESSONS-LEARNED.md` explains.

Two things to know before using it:

- **It is not a favicon-size mark.** It holds down to about 46px; at 32px it
  turns to mush. The dragon solves small sizes with a solid silhouette, but a
  knight bust makes a far less distinctive silhouette — that needs testing
  before anyone promises it works.
- **It is ~204KB, about 68KB gzipped** — roughly 3× the dragon, because it is
  nine shaded regions with intricate boundaries rather than three flat ones.
  Coarsening the trace does not help; only merging regions would, and that
  changes the artwork.
