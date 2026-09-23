---
name: card-batch
description: Turn the owner's batch Google Doc (several nights of Today in History, History for Dads and a bedtime story) into receipt cards in data/content.js, each with its own release date. Use whenever the owner sends a batch doc link, says a batch is ready, asks to "make the cards", or asks for the batch template again.
---

# Card batch

The owner chooses every night's content. The job here is to compile it,
not to write it. The owner fills in a Google Doc made from the batch
template, one NIGHT section per card, and sends the link. It becomes
`CARDS`, `BRIEFS`, `TALES` and `TODAY` entries in `data/content.js`.

## The template

- **Source:** `docs/batches/template.html`. This file is the template; the
  Google Doc was made from it.
- **The Doc:** "Saints & Dragons — Batch Template" in the owner's Drive
  (id `19Tv7R6Gx-uASzy1GDWJ4MpgSvrZEqa4Z-542JDF9DU0`, created 2026-09-23).
  The owner makes a copy of it for each batch.
- **To change the template:** edit the HTML, then upload it with the Google
  Drive connector's `create_file` (`contentMimeType: text/html`; Drive
  converts it to a Doc). Read the result back with `read_file_content` to
  confirm it converted, then give the owner the new link. Keep the bold
  labels stable. Parsing depends on them, and the owner's past batches
  use them.
- **If the pick lists at the top of the template no longer match
  `ERAS`/`KINDS`/`VIRTUES`/`THEMES`/`AGE_BANDS`,** fix the HTML and
  re-upload it.

## Reading a batch

1. **Read the Doc** with the Drive connector (`read_file_content`, and
   `includeComments: true`, because the owner may leave notes as
   comments). It comes back as Markdown. Each `# NIGHT n` is one card;
   `## 01 / 02 / 03 / The card` are its parts. A field is the bold label
   `**Label:**` followed by the text up to the next bold label or heading.
2. **Ignore the grey italic hint lines.** They are the template's own
   text, and they come back as `*...*` paragraphs. Compare them against
   `docs/batches/template.html` rather than guessing, because the owner
   may write in italics too.
3. **Only compile nights whose Status is `Ready`.** List the others in
   your reply and leave them out.
4. **Before writing anything, report back:**
   - which nights are Ready and their release dates
   - which fields are blank (you will draft these)
   - anything that looks wrong: a date that clashes with an existing
     card, a pick-list value that is not in the list, an entry far
     outside its length, a fact you doubt

   Ask about apparent slips; don't fix them. See **Wording** in
   `CLAUDE.md`: the owner's wording ships as written.

## Where each field goes

| Doc field | `data/content.js` |
|---|---|
| Release date | `CARDS[].date` (`YYYY-MM-DD`). Keep `CARDS` sorted, newest last. |
| 01 Year / Entry | `TODAY["MM-DD"]` for the release date: `[{ year, text }]`. Several Year/Entry pairs become several entries in the list. Add `brief:`/`tale:` to an entry only when it is about that night's history. If the date already has an entry, ask whether to add to it or replace it. |
| 02 Title | `BRIEFS[slug].title` |
| Who / what / when | `dek` |
| Era, Kind | `era`, `kind`, exactly as spelled in `ERAS`/`KINDS` |
| Hook | `hook` |
| Still around today | `stillWithUs` (leave the field out if blank) |
| Option A piece | the sectioned shape: `opening`, `sections`, `kidsQuestion`, `sideNotes`. Follow **Putting it on the site** in `docs/history-for-dads.md`. Heading 3 lines in the Doc are the section headings. Side notes are `Lead — text` lines, which become `{ lead, text }`. Save the approved piece to `docs/histories/<slug>.md` too, as that document says. |
| Option B angle | Invoke the `history-for-dads` skill with the Source and the angle, and send the piece back for approval. Don't compile a night until its piece is approved. |
| 03 Title | `TALES[slug].title` |
| Ages | `age` is the band id from `AGE_BANDS` (`1` = 4–6, `3` = 7–9). A label that is not a band's exact text also goes in `ageLabel`, with `age` set to the nearest band. |
| Virtue, Theme | `virtue` (required), `theme` (optional; leave it out if blank) |
| Origin | `origin`. It must follow **Provenance on a tale** in `README.md`. If it overstates, ask. |
| Where it comes from | `source` |
| Part of a series | `night: { n, of }` and a shared `series` key |
| Story | `body`, one string per paragraph |
| Card title | `CARDS[].title` |
| Question / Why it's ours / Prayer | `question`, `whyOurs`, `prayer` |
| Notes for Claude | Instructions to you; never shipped. |

You fill in these yourself; the Doc does not ask for them:

- **Slugs:** lowercase and hyphenated, from the title (`"lion-and-the-mouse"`).
  Check the slug isn't already taken.
- **Pairing:** the brief gets `tale: <tale slug>`, the tale gets
  `brief: <brief slug>`, and the card names both.
- **`minutes`:**
  - brief: words ÷ 200, rounded, counting the main piece and the side notes
    (`wc -w`)
  - tale: the read-aloud time as a string (`"3"`), at about 130 words a
    minute

Quote marks inside the text need escaping for a JS string. Match what is
already in the file (`’`, `\"`) and don't retype the owner's
punctuation. Paste it through.

## Blank fields

Draft any blank field, and mark it as yours when you report back:
"Hook (drafted): …". Nothing you drafted ships until the owner has seen it.

## Release dates

Each card goes live at **12:01am US Eastern** on its release date, and the
whole batch ships in one merge. `todayISO` and `released` in
`api/_lib/content.js` do this on every request. A card dated after today
is left out of every reader's payload, and so is the brief and tale only
it sends and the Today in History entry keyed to its date. Nothing runs
at midnight, and no second deploy is needed.

`npm run check` ends with the schedule, what is live and what is queued,
on the same clock. Read it before merging a batch.

## Before merging

Follow **Before you merge** in `CLAUDE.md`, plus these checks:

1. Run `npm run check`. It must exit 0. Read the warnings too: word counts
   and side-note counts outside the standard show up there.
2. Screenshot each new night's receipt on `#home`, as a free reader and as
   a paid one. Also screenshot its `#brief/<slug>`, `#tale/<slug>` and
   `#today/MM-DD` pages. To see a queued night, start the dev server with
   `PREVIEW_DATE=YYYY-MM-DD` set to its date (see `.env.example`). Turn
   through the nights with ‹ › on `#home` to check that each one sits in
   the right order.
3. Show the owner the screenshots and every drafted field. Merge only
   after they say to ship it.

Commit message: `Batch: <first date> to <last date>, <n> nights`. Merge
summary: `<n> nights queued, <first date> to <last date>`.
