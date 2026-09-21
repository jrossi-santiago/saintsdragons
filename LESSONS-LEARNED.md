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
`location.pathname`, which covers both URL forms.

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
