# Lessons learned

A running log of bugs that shipped, what actually caused them, and the rule that
prevents a repeat. Add an entry when something breaks in a way that was not
obvious from reading the code.

---

## 2026-09-21 — `/7stories` rendered a blank main column in production

**Symptom.** On the live site, `/7stories` showed the sidebar, correctly styled,
and nothing at all in the main column — no heading, no form. No visible error.
The same files worked when served locally.

**Cause.** The page lives at `7stories/index.html` and was reached as
`domain.com/7stories` — **no trailing slash**. A browser resolves relative URLs
against the *directory of the current URL*, and for `/7stories` that directory is
the site root, not `/7stories/`. So:

| markup | requested at `/7stories` | result |
| --- | --- | --- |
| `href="../styles.css"` | `/styles.css` | 200 — this is why the sidebar still looked right |
| `href="stories.css"` | `/stories.css` | **404** |
| `src="stories.js"` | `/stories.js` | **404** |

With the script 404'd, the code that unhid the gate never ran, so the section
stayed `hidden` and the column was empty. The one asset that happened to resolve
correctly was the shared stylesheet, which made the page look half-healthy and
disguised the real failure.

**Why local testing missed it.** `python3 -m http.server` (and most dev servers)
answer a bare directory path with a **301 redirect** to `/7stories/`, so the
trailing slash is silently added and every relative path resolves fine. Several
production hosts — Cloudflare Pages, Netlify, S3-style static hosting — instead
serve the directory's `index.html` **at the bare path** with no redirect. The bug
only exists on the hosts that do not redirect, which is exactly where the site
runs.

**Fix.** `7stories/index.html` is self-contained: its CSS and JS are inlined, so
there is no page-specific asset whose path can break. The gate renders by default
rather than being unhidden by script, and the PDF link is resolved at load from
`location.pathname`, which covers both URL forms. (Later replaced by a
root-absolute `href="/7stories/7-bedtime-stories.pdf"`: rule 1 below, and it
no longer needs script to be right.)

### Rules

1. **A page in a subdirectory must not depend on a relative path to its own
   assets.** Inline them, or use a root-absolute path (`/7stories/x.css`), or add
   `<base href="/7stories/">`. Note that `<base>` can break same-document
   fragment references such as the SVG sprite's `<use href="#icon">`, so inlining
   is the safest choice for a small page.
2. **Content must not depend on JavaScript running.** Markup ships visible and
   script only hides or swaps things. A failed script then costs an enhancement,
   not the whole page.
3. **Test both URL forms — `/page` and `/page/` — on a server that does not
   redirect the bare path.** `python3 -m http.server` redirects and will pass a
   page that is broken in production. There is a throwaway non-redirecting server
   in the commit history for this entry; reuse that shape.
4. **Watch for partial styling as a symptom.** A page that is styled but empty
   almost always means *some* assets 404'd, not that CSS is broken. Check the
   network panel for the resolved paths before touching the code.
5. **Root-hosting assumption.** `../styles.css` only resolves at the bare path
   because the site is served from the domain root. If the site ever moves under
   a subpath, every `../` link needs revisiting.

---

## 2026-09-22 — the dark-theme logo outline read green

**Symptom.** The recoloured dragon shipped with a `#cfc3a4` outline on the dark
theme. In the sidebar avatar the outline looked distinctly green — close to the
lime of the stock artwork the recolour was meant to get away from.

**Cause.** `#cfc3a4` is `--rcpt-rule`, and reusing it looked like good hygiene:
an existing token rather than a new hex. But it is **hue 43° at 31% saturation**
— an olive. It only ever reads as warm tan because every other use of it draws
hairlines on `#f6f1e3` cream paper, where the surround is lighter than the line
and the chroma is swamped. Two things changed when it moved onto the logo:

- **Near-black surround.** Against `#0b0b0c` the line is now the light element,
  and 31% saturation that was invisible on paper becomes a stated colour.
- **Simultaneous contrast with the body.** The body is hue 17°. The eye pushes
  an adjacent desaturated yellow *away* from its vivid neighbour, exaggerating a
  26° gap into a visible green cast.

**Why review missed it.** The candidate outlines were compared on a rendered
screenshot, but only for *value* — the question asked was "does the outline
outshine the body", and it does not. Hue was never the axis under test, so the
one swatch in the set that was off-hue won on the axis being judged.

**Fix.** `#d2c8be` — hue 30°, saturation 18%. Same lightness, so the body still
dominates; pulled toward the body's hue with the chroma cut, so there is no cast.

### Rules

6. **A token is only warm/neutral relative to the surface it was designed for.**
   Before reusing a colour on a new surface, read its HSL. Low-saturation
   shorthand like "bone" or "warm grey" is unreliable above roughly 15%
   saturation once the surround inverts.
7. **When comparing colour candidates, name the axis you are judging and check
   the others separately.** A value comparison will happily pick a hue mistake.

---

## 2026-09-23 — a paid checkout that granted nothing and sent nothing

**Symptom.** The first live checkout from the landing page went through at
Stripe, but no account appeared and no sign-in email arrived. Asking for a
link on `/login` said only "that did not work". Once the first fault was
fixed, it said "We could not send the email just now".

**Cause.** Three configuration faults, stacked so that each one hid the next:

1. **The database refused TLS.** Supabase signs its database certificate
   with its own CA, not a public one, so node-postgres rejected it with
   `SELF_SIGNED_CERT_IN_CHAIN`. `db.js` assumed a public chain. Two details
   of node-postgres made it worse: `sslmode=require` in the URL now means
   *full verification against the public CAs*, and parameters in the URL
   **override** the options object passed next to it.
2. **Vercel hid the reason.** A function that throws is answered with a
   bare 500 and no `message` field, so every page could only say "that did
   not work".
3. **The sending domain did not exist in Resend.** `EMAIL_FROM` said
   `send.saintsanddragons.com`, with the brand name spelled out. The domain
   verified in Resend is `send.saintsdragons.com`. Resend checks the exact
   domain, and a subdomain counts as a separate domain.

**Why it looked half-working.** A signed-out checkout never queries the
database: `api/billing/checkout.js` only looks a reader up when a session
cookie exists. So Stripe opened and took the money, and everything after it
(the webhook, `request-link`) failed. Locally none of this showed, because
the dev Postgres has no TLS, and with no `RESEND_API_KEY` the link is
printed to the log instead of sent.

**Fix.** `DATABASE_CA_CERT` holds Supabase's CA, and `db.js` verifies
against it with the `ssl*` URL parameters removed. `/api/health` names each
broken piece: the database connection as an error code plus a hint, missing
tables, unset keys, and whether the from domain is verified in Resend. The
default sender is `hello@send.saintsdragons.com`. Quotes around
`EMAIL_FROM` are stripped, because Vercel keeps them literally.

**Recovery.** Nothing was lost. Stripe retries a failed webhook for about
three days, and "Resend" on the event in the Stripe dashboard replays it at
once. The payer never has to pay again.

### Rules

8. **When anything fails without a reason, open `/api/health` before reading
   code.** It answers in one page what took three rounds of guessing here.
9. **A step that works says nothing about the steps after it.** Checkout
   succeeding proved Stripe's keys, not the database. Trace which requests
   actually touch each dependency before concluding what is healthy.
10. **Never fix a certificate error by turning verification off.** Find the
    CA that signed it and trust that CA. With node-postgres, take `sslmode`
    off the URL whenever `ssl` is passed in code, or the URL wins.
11. **The brand is spelled out, the sending domain is not.** Mail goes from
    `send.saintsdragons.com`. Any new email address, domain or DNS record
    should be checked letter by letter against what Resend lists.
12. **Vercel stores an environment value exactly as pasted, quotes
    included.** `.env.example` quotes values for dotenv's sake, so code that
    reads a value with spaces in it should strip surrounding quotes.

---

## 2026-09-23 — building the on-site checkout without keys

Not a bug that shipped: a list of things that cost time while replacing the
redirect to Stripe's hosted Checkout with `#checkout`, so the next session
does not pay for them again.

**Stripe renamed the thing mid-flight.** The custom Checkout Sessions UI
mode is `ui_mode: 'custom'` with `stripe.initCheckout` on the pinned API
version (`2025-08-27.basil`), became synchronous and took `clientSecret`
in clover, and is `ui_mode: 'elements'` with `initCheckoutElementsSdk` in
dahlia. Stripe's docs now show only the newest names. The basil shape was
settled by loading the real `js.stripe.com/basil/stripe.js` in a headless
page and calling it: `initCheckout` returns a Promise and rejects
`clientSecret` as "not an accepted parameter", so it takes
`fetchClientSecret`.

**The sandbox could not see Vercel's keys.** Environment variables set in
Vercel live on Vercel. A cloud session only has what its own environment
settings give it, and only picks those up when the session starts. The
card form was merged without ever being run against Stripe, which is why
the hosted page stays in as a fallback (rule 15).

**Headless screenshots lied four ways**, each caught only by looking at the
image:

- `hidden` does nothing to an element whose CSS sets `display` (a flex row,
  an inline-flex button). Every "hidden" state showed at once until
  `[hidden] { display: none !important }` was scoped in.
- Web fonts come from Google through the sandbox's proxy, which Chromium
  does not use; the shots silently fell back to Georgia. Route
  `fonts.googleapis.com`/`gstatic.com` through `curl` in Playwright, or
  check `document.fonts` before trusting a shot.
- Resizing a loaded page from desktop to phone width catches the sidebar
  mid-transition. Load the page at the size you mean to shoot.
- `page.goto` to a URL that differs only in its hash does not reload, so
  a plan flipped in the database did not show (see CLAUDE.md, step 6).

**Stripe.js cannot load in the sandbox either.** `js.stripe.com` answers
curl through the proxy, but Chromium rejects the proxy's certificate, so
the card form never mounts in a headless test here. That is a real-world
case too (Stripe.js blocked), and the page's fallback was tested on it.

### Rules

13. **Pin Stripe.js to the same release as the API version, and move them
    together.** `STRIPE_JS` in `app.js` and `apiVersion` in
    `api/_lib/stripe.js`. When the docs and the pinned version disagree,
    ask the real script, not the docs.
14. **A column added to a table that has already shipped must be
    tolerated until the migration runs.** Deploy and `schema.sql` are two
    separate steps done by two different people. Catch `42703` (undefined
    column), fall back to the old behaviour, and let `/api/health` name
    what is missing. Never let a login fail over a migration.
15. **A new way to pay keeps the old way as its fallback until it has
    taken a real payment.** `#checkout` offers Stripe's hosted page
    whenever its own form cannot run, and the server sends the hosted URL
    whenever Stripe refuses the custom session.
16. **Keys live where the code runs.** If a session needs a key, it goes in
    that session's environment settings and a new session is started. Keys
    are never pasted into the chat.
