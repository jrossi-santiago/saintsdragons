# Working on this repo

Static site, no build step, plus a small serverless API under `api/` for
accounts, billing and the content gate, on Vercel over a Supabase Postgres.
`main` is what ships.

## Getting to main

Every change since the initial commit has reached `main` the same way, and
the history is clean because of it. Keep it that way.

**`main` only ever receives merge commits. Never commit to it directly.**

```sh
# 1. branch from the current main (one branch per session is fine —
#    the same name is reused across tasks, re-pointed at main each time)
git fetch origin main
git checkout -B claude/<branch-name> origin/main

# 2. do the work, one focused commit per task
git add -A && git commit

# 3. push the branch
git push -u origin claude/<branch-name>

# 4. merge it into main, never fast-forward
git checkout main
git reset --hard origin/main
git merge --no-ff claude/<branch-name> -m "Merge branch 'claude/<branch-name>': <summary>"

# 5. push main, then get off main immediately (see the trap below) and
#    fast-forward the branch ref so it is not left behind its remote
git push origin main
git checkout -B claude/<branch-name> origin/main
git push origin claude/<branch-name>
```

Step 5 ends with the branch, `main`, and both remotes all on the same
commit, so nothing is left unpushed. Skipping the last push leaves the
branch ref pointing at a merge commit its remote has not seen, which reads
as an unpushed commit even though the work is safely on `main`.

`--no-ff` is the point: each task becomes one merge bubble on `main`'s first
parent, so `git log --first-parent` reads as a list of shipped changes, and
any single task can be reverted as a unit.

### The merge message

`Merge branch 'claude/<branch>': <summary>`

The summary is lowercase, present-tense-ish, and says what changed for a
reader — not what files moved. Real examples from this repo:

- `Merge branch 'claude/lucid-pascal-b1wj36': mobile menu button repositioned`
- `Merge branch 'claude/relaxed-brown-eyfvd0': barcode and "Goodnight." dropped again`
- `Merge branch 'claude/practical-gates-72t5vy': fix blank /7stories at the bare path`

### The trap

After step 4 you are standing on `main`. The next task's commit then lands
on `main` directly and silently breaks the rule — this has already happened
once. Either check out the branch again as soon as `main` is pushed (step 5),
or check `git branch --show-current` before every commit.

If you do commit to `main` by mistake and have **not** pushed, it is a local
fix — move the commit onto the branch and put `main` back:

```sh
git checkout -B claude/<branch-name> <the-stray-commit-sha>
git checkout main && git reset --hard origin/main
# then merge normally, from step 4
```

### Reusing a branch whose work is already merged

Don't stack new commits on merged history. Re-point the branch at the
current `main` and start fresh from there — that is what step 5 does, and
it is what produces the flat `|/` shape in this repo's graph. Because
re-pointing moves the branch forward to a commit its remote does not have,
push the branch straight after, as step 5 does.

## Before you merge

`main` ships, so the gate is "I watched it work", not "it should work":

1. `npm run dev` and load the page you changed. (`python3 -m http.server`
   is no longer enough: `/account` boots from `/api/session`, and
   `data/content.js` is deliberately not servable. It still serves `/` and
   `/7stories`.) Logging in locally means copying the link the dev server
   prints to its own log — with no `RESEND_API_KEY` nothing is emailed.
2. Screenshot it headlessly and **look at the image**. Chromium is
   pre-installed in the web sandbox at `/opt/pw-browsers` with Playwright
   configured to find it — never run `playwright install`. Two real bugs in
   one session were caught this way and by nothing else: a truncation that
   cut "1937 J.R.R." mid-name, and a card grid that wrapped 4+1.
3. `npm run check` — `node --check` on `app.js` and `data/content.js` plus
   the content checker. There is no build step, so a syntax error ships. If
   you touched `api/`, `node --check` those files too; nothing else will.
4. `node tools/check-content.js` if you touched `data/content.js`. It catches the
   cross-reference breakage `node --check` cannot see — a card pointing at a
   slug that does not exist, an era or virtue that is not in its list. Exit 1 means do not merge.
5. Click through the other hash routes. `app.js` renders every page from one
   file; a change to a shared helper reaches all of them.
6. **Look at it as a free reader and as a paid one.** They get different
   payloads from `/api/session`, and half the renderers now have a locked
   branch that the paid view never exercises. The cheapest way to flip is a
   row in `subscriptions`: insert one with status `active` for your user,
   reload, delete it, reload. A locked brief, a locked tale, a locked Today
   in history entry and `#home` with tonight's card held back are four
   different drawings — the last one only appears when the newest card is
   not the first of its ISO week. "Reload" means a real reload: changing
   only the hash keeps the payload the page booted with, so a test that
   flips the plan and then sets `location.hash` is looking at the old plan.

   `#checkout` is a fifth drawing for the free reader (the card form, or
   its "pay on Stripe's secure page" fallback when the publishable key is
   unset or Stripe.js cannot load) and "You're already in" for the paid one.
7. **Money and mail paths without real keys.** Stripe and Resend can be
   exercised locally by stubbing the module with a preload, which keeps
   the real handlers, database writes and redirects in the test:
   `node -r ./stub-stripe.js tools/dev-server.js`, where the stub replaces
   `require("stripe")` via `Module._load` with an object whose
   `checkout.sessions.create` returns a fake URL and whose
   `webhooks.constructEvent` just parses the body. Then POST events at
   `/api/stripe/webhook` yourself and route `checkout.stripe.com` to a
   blank page in Playwright. It proves our side only. Say so, and ask
   for one real test-mode payment before calling billing done.
   Give `customers.create` a fresh id per call: `users.stripe_customer_id`
   is unique, and one fixed id fails the second reader's checkout.

Report what the screenshot actually shows, including what still looks wrong.
"Should be fine" is not a check.

In the sandbox, `pkill -f <pattern>` also matches the shell running it,
because the pattern is in that shell's own command line, and kills your
command mid-way (exit 144). Start servers from a script and `kill` the saved
PID instead.

## Secrets, and what may be served

Nothing under `data/`, `api/` or `db/` is ever served to a browser, and
`.env` is not committed. `data/content.js` in particular is the archive the
paid plan sells — putting it back in the site root, or fetching it from the
client, silently un-gates everything. `tools/dev-server.js` refuses those
paths for the same reason, so local work fails the same way production would
rather than looking fine until it ships.

Every key the site reads is named in `.env.example`, with nothing real in
it. Add a name there when you add one.

**Coming back from Stripe signs nobody in.** Stripe does not check that an
address belongs to whoever typed it, so a session handed out on the return
trip (a `session_id` in the return URL, say) would let anyone pay a few
dollars to take over someone else's account. Every checkout now starts
signed in, so there is nobody to sign in on the way back anyway; keep it so.

**Who is signed in without a link, and why that is safe.** On the owner's
call (2026-09-23), a *new* address is signed in the moment it signs up, with
no email round trip; an address we already know still gets a link. Two
things hold that together, and both must stay: `request-link` only does it
for a request from this site's own origin, and the first link an address
ever uses (`verify.js`) signs out every other session on the account, so
somebody who signed up with an address before its owner did is thrown out
when the owner turns up. Both depend on `users.email_verified_at`; until
`db/schema.sql` has been re-run on a database, new addresses get a link like
everybody else.

**A night dated ahead is not sent to anybody until 12:01am US Eastern on
its date**, whatever the reader's plan. That is how a batch is queued
(`released` in `api/_lib/content.js`). A queued card's brief and tale are
absent from the payload, not locked, so they are not on the shelves, in
search or in the page source. Filter on the server; a client-side date
check would hand the queue to anyone who reads the payload.
`PREVIEW_DATE` fakes the day locally and is ignored on Vercel.

When something fails in production with no reason given, open `/api/health`
first — see `LESSONS-LEARNED.md`, 2026-09-23.

The database tables carry reader emails and the session hashes that stand in
for passwords, and Supabase publishes the `public` schema through its Data
API. `db/schema.sql` therefore ends by enabling row-level security on every
table and revoking the `anon` and `authenticated` roles. The site connects as
`postgres` and bypasses RLS, so nothing here needs a policy — if a new table
arrives, it gets the same two lines.

## Content vs. display

`data/content.js` is the single source of nightly content. When a surface needs
different wording from the data:

- **Chrome belongs to the surface.** Link labels, meta lines and section
  headings can differ per surface — the receipt card says "Read the full
  article", the shelves say something generic. Put it in the renderer.
- **Facts belong to the data.** If a number or a name is wrong, fix
  `data/content.js` so every surface agrees. Don't paper over it in one renderer.
- **Editorial copy that only fits one surface gets its own optional field**,
  falling back to the data when absent — see `ageLabel` on a tale, which
  the receipt prints instead of the numeric `age`. The numeric `age` stays
  the filter bucket, so the shelf chips keep working. Add a field rather
  than widening a taxonomy that drives a filter UI.

## Wording

- **The owner's wording ships as written.** When they supply copy, use it
  verbatim, including grammar they chose on purpose ("pick as many as
  fits"). If something looks like a slip, ask; do not quietly correct it.
- **Readers are parents; ask about the stories, not the children.** The
  onboarding question is "Age range of story listeners?", not "How old are
  they?", which read as prying. Any new question about a reader's family
  should be phrased around what it changes on the site, and should say so.

## Design references

The receipt card on `#home` was built from a standalone mockup at `/test`
that was later deleted, and the live version then drifted from it across
several piecemeal edits. Restoring it meant digging the file out of git
(`git show 619dbba:test/index.html`).

**Don't delete a mockup that is still the reference for a live component.**
If you must, record the commit that holds it, and prefer restating the
target against that file over patching toward a screenshot.

Aesthetic choices get reversed — the barcode and closing "Goodnight." were
removed, restored, then removed again. When a change reverses an earlier
deliberate one, say so in the commit message so the next reader finds the
decision instead of re-deriving it.

## Where things live

`docs/why.md` is the owner's own statement of what this is for, in their words
(2026-09-23). It is the standard to test new work against. Quote it as
written. Posts written from it are in `docs/social/`.

See `README.md` for the file map, how to add a night, and how accounts,
Stripe and the free/paid gate fit together, and `LESSONS-LEARNED.md` before
changing how pages or assets are linked.

New histories for dads are written to `docs/history-for-dads.md`, with
`docs/histories/golden-hind.md` as the reference piece; those two are the
only rules. The older brief voice they replaced on 2026-09-23 was taken out
of `data/content.js`; the flat-`body` briefs written to it stay as they are.
The `history-for-dads` skill runs the standard when the owner uploads a
source PDF, and knows how to enter an approved piece into `BRIEFS` when
asked.

Nights are made in batches. The owner fills in a Google Doc made from
`docs/batches/template.html`: for each night, a date and their picks for
Today in History, the history and the bedtime story. They send the link.
The `card-batch` skill turns it into `data/content.js`. The picks are
the owner's, and anything they paste ships as written. Everything else
(hook, question, why it's ours, prayer, tags, and any piece they only
named) is drafted and shown to them before it ships.
