---
name: card-batch
description: Turn the owner's batch Google Doc (for each night, a date and their picks for Today in History, History for Dads and a bedtime story) into receipt cards in data/content.js, filling in everything else, each with its own release date. Use whenever the owner sends a batch doc link, says a batch is ready, asks to "make the cards", or asks for the batch template again.
---

# Card batch

The owner chooses each night's three pieces: the Today in History event,
the history for dads, and the bedtime story. Everything else is yours to
fill in. The owner fills in a Google Doc made from the batch template,
one NIGHT section per card, and sends the link. It becomes `CARDS`,
`BRIEFS`, `TALES` and `TODAY` entries in `data/content.js`.

The template was simplified on 2026-09-23 at the owner's request: the
first version asked for every field (hook, era, virtue, prayer and so
on), and that was too many moving pieces. Don't add fields back. If you
need something from the owner, ask in chat.

## The template

- **Source:** `docs/batches/template.html`. This file is the template; the
  Google Doc was made from it.
- **The Doc:** "Saints & Dragons — Batch Template" in the owner's Drive
  (id `1l2RiaKcaebOg8xpdQTlpsyK39BKYsXjPr9ci8nkabo8`, 2026-09-23, the
  version with the Image field). The owner makes a copy of it for each
  batch. The two earlier versions were renamed "OLD — …" and
  "OLD 2 — …" in the same Drive.
- **To change the template:** edit the HTML, then upload it with the Google
  Drive connector's `create_file` (`contentMimeType: text/html`; Drive
  converts it to a Doc; the connector cannot rewrite an existing Doc's
  contents). Read the result back with `read_file_content` to confirm it
  converted, then give the owner the new link and update the id above.

Each night has six fields: **Date**, **Today in History**, **History for
Dads**, **Image** (optional, added 2026-09-23 at the owner's request),
**Bedtime Story** and **Notes**. Each is free-form. The owner may
paste finished text, name a topic, or give a link or a PDF.

## Reading a batch

1. **Read the Doc** with the Drive connector (`read_file_content`, and
   `includeComments: true`, because the owner may leave notes as
   comments). Each `# NIGHT n` is one card. A field is its bold label
   followed by the text up to the next bold label or heading.
2. **Ignore the grey italic hint lines.** They are the template's own
   text, and come back as `*...*` paragraphs. Compare them against
   `docs/batches/template.html` rather than guessing, because the owner
   may write in italics too.
3. **Skip a night with nothing filled in.** A night with a date and at
   least one piece chosen is meant to ship. If a piece is missing, ask.
4. **Decide, for each piece: is it written or named?**
   - **Written:** the owner pasted the text. It ships word for word.
     Ask about apparent slips; don't fix them. See **Wording** in
     `CLAUDE.md`.
   - **Named:** a topic, title or link. You write it (see below).
5. **Before writing anything, say back in a few lines** which nights you
   read, their dates, which pieces you will write, and anything that
   looks wrong: a date that clashes with an existing card, a fact you
   doubt. The three picks don't need to relate: a night shares a date
   and a receipt, not an idea, so don't flag a story for not fitting the
   history. Then do the work.

## What you write

Draft everything the owner did not paste, and show it all before
anything ships:

- **Today in History:** keyed `TODAY["MM-DD"]` on the release date, as
  `[{ year, text }]`. The text is 100–150 words and the first sentence is
  the hook, because the receipt prints only that sentence. If the date
  already has an entry, ask whether to add to it or replace it.
- **History for Dads:** use the `history-for-dads` skill with whatever the
  owner gave (a topic, a link or a PDF). It writes to
  `docs/history-for-dads.md`, and the owner approves the piece before it
  is entered. A pasted piece is entered as it is. Either way, follow
  **Putting it on the site** in that document. You fill in `title`,
  `dek`, `era`, `kind`, `hook`, `stillWithUs` (optional) and `minutes`.
- **Image:** one picture for the top of the history's page, stored as
  `image: { src, alt, credit }` on the brief (see the note above `BRIEFS`).
  The owner gives a link. A picture pasted into the Doc can't be pulled
  out through the Drive connector, so ask for its link instead.
  1. **Rights first.** Use it only if it's public domain or licensed for
     reuse (Wikimedia Commons says which on the file's page). For a
     Commons file, the API gives the file URL, the artist and the licence:
     `https://commons.wikimedia.org/w/api.php?action=query&titles=File:<name>&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json`.
     Download with `curl -A "SaintsDragons/1.0"`, because Wikimedia refuses
     requests without a user agent. For anything else, ask the owner
     where it's from before using it.
  2. **Shrink it** with Pillow (`pip install pillow`) to fit 900×1200,
     as a JPEG at quality 82, saved to
     `assets/histories/<brief slug>.jpg`. That keeps it around 150 KB.
  3. **Look at it** (Read the file), then write `alt` as what is actually
     in the picture. Write `credit` as who made it, the date, the licence
     and where it's from: "Francis Drake, painted by Marcus Gheeraerts the
     Younger, 1591. Public domain, via Wikimedia Commons."
  4. `npm run check` fails a path that doesn't resolve or an image with
     no alt text. Files under `assets/` are public, so an image for a
     queued night can be fetched before its date, though nothing links
     to it yet.
- **Bedtime Story:** a named traditional story is retold for reading
  aloud. A named idea with no source is a new tale, and its `origin`
  says so. You fill in `title`, `age` (a band from `AGE_BANDS`,
  `ageLabel` only if it sits between bands), `virtue` (required),
  `theme` (optional), `origin` and `source` (following **Provenance on a
  tale** in `README.md`), `minutes` (a string, about 130 words a minute)
  and `body` (one string per paragraph). Series: `night: { n, of }`
  plus a shared `series` key.
- **The card:** `date`, `title` (usually the history's title with its
  year), `brief`, `tale`, `question`, `whyOurs` and `prayer`. Take the
  last three's voice from the existing `CARDS`.
- **Tags:** use `era`, `kind`, `virtue` and `theme` only from `ERAS`,
  `KINDS`, `VIRTUES` and `THEMES`. A piece that fits none is a question
  for the owner, not a new entry.
- **Slugs:** lowercase and hyphenated, from the title. Check the slug is
  free. The card names the brief and the tale; the brief and the tale do
  not name each other. The three picks don't need to relate.
- **Brief `minutes`:** the main piece plus the side notes, divided by
  200 and rounded (`wc -w`).

Quote marks inside the text need escaping for a JS string. Match what is
already in the file (`\u2019`, `\"`) and don't retype the owner's
punctuation.

**Showing the owner:** one message per batch. For each night, list what
you wrote (hook, question, why it's ours, prayer, tags, and any piece you
wrote in full), and mark what was theirs as "yours, unchanged". Then
send the receipt screenshots.

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
