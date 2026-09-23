# Saints & Dragons

> Dads learning things worth knowing & passing them on to their kids.
> History, faith and virtue, handed down rather than explained.

That line is the positioning. It is the meta description on `/` and
`/account`, the `home` entry in `META` in `app.js`, and the bio on every
external profile. **If you change it, change it in all of those places at
once** — it is the one sentence that has to match everywhere.

Two things it commits us to, both easy to break by accident:

- **The subject is the dad, not the product.** It opens with what he does,
  not with what arrives. Copy that starts "The receipt is…" has quietly
  changed the subject.
- **"Handed down rather than explained" is a refusal.** No moralising, no
  lesson spelled out after the story, no fun facts. The About page says the
  same thing at length under *What this is not*; that section and this line
  have to keep agreeing.

**The product** is a daily pair: a piece of history the dad reads on his own
time (morning, lunch, before he leaves work) and a bedtime story on the same
idea he reads to them that night, plus today in history. The receipt is how
`/account` *draws* it, not what it is called. `/` sells it; `/account` is it.

**Cadence and plans.** Paid: a new history and bedtime story every day, 7 of
each a week. Free: one of each a week. Separately, `/7stories` is a free
7-story PDF lead magnet. The only time claim anywhere in outward copy is
"under 10 minutes" of reading for the dad; there is no "nightly" and no
"twice a week". (The "Nightly Receipt" name and the twice-a-week claim were
both dropped on purpose — don't bring them back.)

**Outward words.** Readers see *history* and *bedtime story*. "Brief",
"card", "shelf", "pairing", "band" and "night" (for a day's edition) are
code names only — fine in `data/content.js`, comments and URL slugs (`#brief/…`
stays, so old links keep working), never in visible text.

`History for dads · Tales for bedtime` stays as the short lockup — the
sidebar, the receipt header, the banners. It is a subset of the line above,
not a competing claim, and it is baked into rendered PNGs, so changing it
means re-rendering `assets/social/`.

Static site: plain HTML, CSS, and vanilla JavaScript. No build step.

Since accounts arrived there is also a small API — nine serverless functions
under `api/`, deployed on Vercel, reading a Supabase Postgres. The pages are
still plain files with no build step; the API is the only part with
dependencies (`pg`, `stripe`, `resend`). See **Accounts, money and the gate**
below.

Supabase is used as a database and nothing else — not its auth, not its Data
API. Logins are the magic links described below, and every query goes through
`api/_lib/db.js` as plain SQL.

## Structure

- `index.html` — the public marketing home at `/`. Self-contained (its own
  inlined `<style>`), but reads the shared design tokens from `styles.css` so
  it stays on-brand. No login exists. Every CTA on it points at the `#start`
  signup form near the foot of the page; only the footer's "Already a member?"
  link goes to `/account`.
- `account/` — the actual app, for people who've "signed up":
  - `index.html` — page shell: sidebar (profile, bio, socials, theme toggle,
    search, page nav) and main content area. Loads `/app.js` by absolute
    path, same reasoning as `7stories/` below — it lives in a subdirectory
    and must not depend on a relative path to assets one level up. It does
    not load the content: `app.js` fetches that from `/api/session`.
- `styles.css` — design tokens for dark/light themes, layout, and components
  — shared by `account/index.html`, `7stories/index.html`, and read (for
  tokens only) by the root `index.html`.
- `app.js` — hash routing, all page renderers, search, theme persistence,
  mobile sidebar. Only loaded by `account/index.html`.
- `data/content.js` — the nightly content: `CARDS`, `BRIEFS`, `TALES`,
  `TODAY`. Still the only file you edit to add a night. It sits in `data/`
  rather than the site root because it is no longer served to the browser:
  it holds the archive the paid plan sells, so the server reads it and sends
  each reader only what their plan entitles them to. See **Accounts, money
  and the gate**.
- `api/` — the serverless functions: magic-link login, the session and
  content payload, onboarding, Stripe checkout and its webhook.
- `login/index.html` — the one login page. Self-contained for the same
  bare-path reason as `7stories/`.
- `db/schema.sql` — the whole database, re-runnable.
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
`account/index.html` cannot — it loads `/app.js` and `/styles.css` by
absolute path, which only resolves against a served site root, not `file://`,
and it boots from `/api/session`, which needs the API and a database. So:

```sh
npm install
cp .env.example .env          # fill in at least DATABASE_URL
psql "$DATABASE_URL" -f db/schema.sql
npm run dev                   # http://localhost:8000
```

`npm run dev` is `tools/dev-server.js`: the static site and the API on one
port, matching production in the two ways that have bitten this repo before —
a bare path serves its directory's `index.html` without redirecting, and
`data/`, `api/` and `node_modules/` are never served.

`python3 -m http.server 8000` still serves `/` and `/7stories` for a quick
look at the marketing pages, but `/account` will not load against it.

With no `RESEND_API_KEY`, login links are printed to the dev server's log
instead of emailed — that is how you log in locally. Copy the link from the
terminal and open it.

Note: `http.server` redirects `/7stories` and `/account` to their
trailing-slash form, which most production hosts do not do. To test a page
the way it will actually be served, request the bare path against a server
that serves the directory index without redirecting — see `LESSONS-LEARNED.md`.

## Customizing

- **Profile photo** — `.avatar` in `styles.css` currently shows the dragon mark. Replace the `background` with an `<img>` inside `.avatar` in `account/index.html` when there's a real photo.
- **Pages** — the `About` and `Contact` pages are the only ones left in the `PAGES` object in `app.js`; nav links live in `account/index.html`. Everything else on the site is nightly content — see below.
- **Social links** — the three `<a href="#">` entries in `.socials`.
- **The marketing home (`index.html`)** — headline, pricing, and the "product shot" receipt preview in the hero are all hand-written copy, not pulled from `data/content.js`. Update them by hand when the pitch or price changes.
  - **Page order.** Hero (headline "Be the dad with stories worth passing
    on.", then the format line "A true story for you. A bedtime story for
    them.") → *What you get* (real screenshots) → *How one day goes* → *Why
    dads use it* → *Who it's for* → *What this is not* → library → reader
    quotes → plans → signup. The hero receipt shows the pairing, history
    then bedtime story, because the pairing is the product; today in history
    is the tag line under it.
  - **Screenshots** in *What you get* are real captures of `/account`, one
    per theme, in `assets/landing/`. They bake in the day's content, so
    re-render them with `node tools/render-landing-shots.js` (server running
    on :8000) when `#home` or the Lion and the Mouse page changes.
  - **What this is not** repeats the About page's section of the same name,
    shortened. The two have to keep agreeing.
  - **Reader quotes (`#voices`)** ship `hidden`, with an empty grid. Only
    real words from real readers go in; the HTML comment above the section
    shows the shape. Remove `hidden` once there are two or three.
- **The "bigger thing" section (`#work`)** — two hand-maintained columns. The
  left one uses a tick and may only list things that actually exist; the right
  one uses a hollow dot (`#i-dot`) and is explicitly unshipped, which the note
  underneath says out loud. When something ships, move it across and change its
  icon — never tick an item in the right-hand column in place.
- **Campaign page** — all visible copy in `7stories/index.html` is sample text. The form fields are first name, children's age ranges (multi-select: 0–2, 3–5, 6–9, 10+) and email; all are required.
- **Landing-page signup (`#start`)** — the only thing on `/` that collects
  anything. First name and email, posting JSON to `/api/auth/request-link`
  with `source: "/#start"`. That endpoint makes the account if the address is
  new and emails a link either way, so this form is signup and login at once.
  The endpoint is the form's `action` and the inline script reads it from
  there, so there is one place to change it. The form ships as real markup
  with a real `action`, so it still posts if the script never runs (rule 2 in
  `LESSONS-LEARNED.md`); a real form post lands on `/login` with the address
  echoed back. A failed POST is reported to the reader rather than swallowed
  — same reasoning as the Contact form: there is no download to fall back on.
- **Campaign signup (`/7stories`)** — posts the same JSON plus `childAges`
  (an array of the stored bands), so the gate both delivers the PDF and puts
  the reader in the funnel with their children's ages already answered. If
  the POST fails the download is still unlocked, so a network error never
  blocks a reader.
- **Contact form** — the last thing still on Formspree, and the right place
  for it: a message is not a signup and does not want an account. Posts JSON:
  `name`, `email`, `message`, `source`. The endpoint is `FORM_ENDPOINT` at the
  top of `app.js`; change it in that one place. A failed POST here is reported
  to the reader rather than swallowed — there is no download to fall back on,
  so silently thanking someone for a message that went nowhere would be a lie.

## Accounts, money and the gate

Three ideas, and everything else follows from them.

**One door.** `POST /api/auth/request-link` is signup and login at once. A
first-time address gets an account and an emailed link; a returning one gets
a link. Nobody is asked which of the two they are, and there is no password
anywhere in the system. The landing page's `#start` form, `/7stories` and
`/login` all post to that one endpoint, each with its own `source` so the
three surfaces stay apart in the `users` table.

The link goes to `GET /api/auth/verify`, which spends the token (single use,
twenty minutes, enforced by the database rather than in node), starts a
session, and sends a first-time reader to `#welcome` and everybody else to
`#home`. Tokens and session cookies are 32 random bytes; the database only
ever holds their SHA-256, so a dump of it cannot be replayed as a login.

**The webhook is the only thing that grants access.** Not Checkout's success
page — the reader can close it, and a card can fail a month later with
nobody on the site. `POST /api/stripe/webhook` verifies Stripe's signature
against the raw bytes, drops duplicates through `stripe_events`, and upserts
the subscription. A reader is on the paid plan when they hold a subscription
that Stripe calls `active`, `trialing` or `past_due` — `past_due` on purpose,
because locking a father out of tonight's story over a retry that may
succeed in an hour is the wrong trade.

**The gate is on the server, not in the page.** `/account` no longer loads
`content.js`; it boots from `GET /api/session`, which answers with the
reader, their plan, and the content that plan entitles them to. A free
reader's payload physically does not contain the paid stories.

What is free:

- **the first card of each ISO week**, and everything it points at;
- **today's** entry in Today in history, but not the rest of the calendar.

First-of-week rather than newest-of-week is deliberate and worth keeping: it
never takes anything back. The first card of a week is the first card of
that week forever, so a story a free reader opened on Monday is still theirs
on Friday. The first attempt keyed on the newest card of the week and
re-locked Monday's story the moment Wednesday's arrived.

Because tonight's card is usually not the free one, `#home` shows a free
reader the most recent day they *do* have, with a line above it saying what
tonight's was and offering the plan. Meeting the product is the argument for
paying for it; a wall is not.

A locked brief or tale keeps its title, hook, era, age, virtue and
provenance and loses only its `body` (a locked card also loses its question,
why-ours line and prayer). So the shelves stay full, search keeps working,
and what a reader is being asked to pay for is visible. `lockPanel` in
`app.js` is the one place the ask is worded, so it reads the same on the
receipt, on a shelf and on a story's own page.

### Where each piece lives

| File | What it does |
| --- | --- |
| `api/_lib/db.js` | The only place SQL leaves the codebase. A tagged template that turns interpolations into placeholders — there is no escaping helper, on purpose. Plain node-postgres, so the same file talks to Supabase in production and to a Postgres on your own machine in development. Read the header before changing `DATABASE_URL`: the pooler and the port are both load-bearing. |
| `api/_lib/session.js` | Magic-link tokens, sessions, and the one query that answers "who is this and what are they entitled to". |
| `api/_lib/content.js` | Loads `data/content.js` with `vm`, the same way `tools/check-content.js` does, and decides what a given reader may have. The free/paid rules above are all in here. |
| `api/_lib/email.js` | The only thing that sends mail. Resend behind one function; with no API key it prints the link to the log rather than swallowing it. |
| `api/_lib/stripe.js` | One configured client; creates a Stripe customer once per reader and reuses it. |
| `api/session.js` | What `/account` boots from: reader, plan, content. `401` means "not signed in" and is not an error. |
| `api/profile.js` | The two onboarding answers, and any later edit of them. |
| `api/billing/checkout.js`, `api/billing/portal.js` | Hand the reader to Stripe. No card detail ever touches this site; cancelling and invoices live in Stripe's portal, which is how "cancel any time" is kept. |
| `api/_lib/users.js` | The one statement that turns an email into an account, shared by the login box and a checkout. |
| `api/stripe/webhook.js` | The only writer of `subscriptions`. A checkout started while signed out (the paid plan on `/`) arrives here with no user: the email given to Stripe becomes the account, or finds the one it already is, and the sign-in link is emailed to it. Coming back from Stripe signs nobody in. |
| `db/schema.sql` | Every table, re-runnable. |

### Setting it up

1. **Supabase** — a project, then run `db/schema.sql` in the SQL Editor (or
   `psql "$DATABASE_URL" -f db/schema.sql`). Take the connection string from
   Project Settings → Database → **Transaction pooler, port 6543**; the
   direct connection is IPv6-only and Vercel cannot reach it. `.env.example`
   spells this out.

   The schema ends by enabling row-level security on all five tables and
   revoking `anon`/`authenticated`. That is not decoration: Supabase
   publishes the `public` schema through its Data API and grants those roles
   access to new tables, and these tables hold reader emails and the session
   hashes that stand in for passwords. The site connects as `postgres`,
   which bypasses RLS, so it costs our queries nothing. **Do not add a
   policy to make something work** — if code needs a row it goes through
   `api/_lib/db.js`.
2. **Resend** — verify the sending domain and set `RESEND_API_KEY` and
   `EMAIL_FROM`. Until the domain is verified, links will not arrive.
3. **Stripe** — one product with a $6/month recurring price; set
   `STRIPE_PRICE_ID` to the price (`price_…`), not the product. Add a webhook
   endpoint at `https://<site>/api/stripe/webhook` subscribed to
   `checkout.session.completed` and `customer.subscription.*`, and set
   `STRIPE_WEBHOOK_SECRET` from it. Turn on the Billing Portal in Stripe's
   settings or `/api/billing/portal` will fail. Test mode first: `stripe
   listen --forward-to localhost:8000/api/stripe/webhook` gives a local
   signing secret.
4. **Vercel** — set every name in `.env.example` in project settings.
   `SITE_URL` goes on **Production only**, with no trailing slash: preview
   deployments fall back to their own `VERCEL_URL`, so a login link made
   while testing a branch opens that branch rather than the live site.
   Scope the Stripe keys the same way — live keys on Production, test keys
   on Preview and Development — and remember a webhook endpoint points at
   exactly one URL, so upgrades complete on production and not on a
   preview.

The price appears in three places that must agree: Stripe's price object,
the plans section of `index.html`, and `lockPanel` in `app.js`.

## The pages

`/` is a static pitch for the product; it never touches `data/content.js` or
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

To add a night, edit `data/content.js`:

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

The only test this site has. It reads `data/content.js` and verifies the things
that break silently: every card points at a brief and a tale that exist, every
pairing reciprocates (the brief names the tale *and* the tale names the brief),
every era, kind, theme, virtue and age band is in its taxonomy, no card is missing its
question, why-ours line or prayer, dates are real and in order, a series adds
up to the number of nights it claims, and every slug in `TODAY` resolves.

No dependencies, and none are wanted — it uses `vm` from the standard library
to evaluate `data/content.js` the way a browser does, then walks what it defined.

**Errors fail the run (exit 1). Warnings never do.** Warnings are things worth
a look that are not broken: a brief on the shelf that no card ever sent, a
`TODAY` entry outside the 100-to-150-word house length, and any chip in `ERAS`,
`KINDS`, `THEMES` or `VIRTUES` with nothing behind it. That last one is not a
fault — the shelves only draw a chip once something is filed under it — it is
the roadmap, and the warning list is what has not been written yet.

Run it after editing `data/content.js` and before merging, alongside the
`node --check` step in `CLAUDE.md`.

Tales without a brief are fine — they show on the bedtime shelf and simply have
no "Goes with" line. Cards, however, should always carry both halves. A
multi-night tale sets `night: { n, of }` and a shared `series` key.

### Age on a tale

A tale's `age` is a **bucket id, not a number of years**, and it is never
printed. `AGE_BANDS` in `data/content.js` turns it into the label every surface
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

`ERAS`, `KINDS`, `THEMES` and `VIRTUES` stay whole in `data/content.js` — they are
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

### Profile logos

`assets/social/logo-*.png` are square exports of the dragon on its own, for
places that want an avatar rather than a banner — Substack, X, anywhere with a
profile picture.

| file | use |
| --- | --- |
| `logo-light-*` | transparent, dark ink outline &mdash; for pale UI |
| `logo-dark-*` | transparent, bone outline &mdash; for dark UI |
| `logo-on-white-*` | the light one flattened onto `#ffffff` |
| `logo-on-paper-*` | the light one flattened onto `#f6f1e3` |

**Upload `logo-on-white-512` or `logo-light-512` to Substack.** The dark one
has a bone outline that vanishes on white; it is for this site and dark decks.

The dragon sits at 70% of the canvas rather than filling it, because these
services crop avatars to a circle and the wingtips and tail are the first
things a square-to-circle crop eats. Checked at 120 / 64 / 40 / 28px.

### Mascots

`assets/mascots/` holds three characters &mdash; **Ember** (dragon), **Tin**
(knight) and **Slip** (the receipt) &mdash; each in seven expressions. Nothing
uses them yet; they are candidates, not a shipped decision.

The whole system is that **the body never changes and the eyes carry the
mood**. Adding a mood is a branch in `eyes()`, not a redraw. Regenerate the
set with `python3 tools/make-mascots.py`; the script is the source, since an
SVG cannot be edited back into a design.

Three things were learned the hard way and are commented in the script, so
they do not get undone:

- **Eyes only.** Give a round dragon a pale snout with nostrils and it reads
  as a pig. The reference these came from has no mouth and no nose.
- **Horns root at the crown.** Wide triangles on the sides of a dome are how
  you draw an *ear*; low side-wings are how you draw a *crab claw*.
- **Sleepy tilts the outer ends down.** Inner-ends-down is the universal anger
  cue. That one shipped wrong once and "lights out" read as furious.

`assets/mascots/explorations/` holds two earlier characters (a serpent and a
lion) that were not carried forward. They are kept because they cost something
to make and the lion in particular is a better fit if the brand ever leans
harder on the *Saints* half &mdash; its mane is nearly a halo.

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
