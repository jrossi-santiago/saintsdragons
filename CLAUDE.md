# Working on this repo

Static site, no build step. `main` is what ships.

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

# 5. push main, then get off main immediately (see the trap below)
git push origin main
git checkout -B claude/<branch-name> origin/main
```

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
it is what produces the flat `|/` shape in this repo's graph.

## Before you merge

`main` ships, so the gate is "I watched it work", not "it should work":

1. `python3 -m http.server 8000` and load the page you changed.
2. Screenshot it headlessly and **look at the image**. Chromium is
   pre-installed in the web sandbox at `/opt/pw-browsers` with Playwright
   configured to find it — never run `playwright install`. Two real bugs in
   one session were caught this way and by nothing else: a truncation that
   cut "1937 J.R.R." mid-name, and a card grid that wrapped 4+1.
3. `node --check app.js && node --check content.js` — there is no build step
   and no test suite, so a syntax error ships.
4. Click through the other hash routes. `app.js` renders every page from one
   file; a change to a shared helper reaches all of them.

Report what the screenshot actually shows, including what still looks wrong.
"Should be fine" is not a check.

## Content vs. display

`content.js` is the single source of nightly content. When a surface needs
different wording from the data:

- **Chrome belongs to the surface.** Link labels, meta lines and section
  headings can differ per surface — the receipt card says "Read the full
  article", the shelves say something generic. Put it in the renderer.
- **Facts belong to the data.** If a number or a name is wrong, fix
  `content.js` so every surface agrees. Don't paper over it in one renderer.
- **Editorial copy that only fits one surface gets its own optional field**,
  falling back to the data when absent — see `ageLabel` on a tale, which
  the receipt prints instead of the numeric `age`. The numeric `age` stays
  the filter bucket, so the shelf chips keep working. Add a field rather
  than widening a taxonomy that drives a filter UI.

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

See `README.md` for the file map and how to add a night, and
`LESSONS-LEARNED.md` before changing how pages or assets are linked.
