---
name: history-for-dads
description: Write a "history for dads" piece for Saints & Dragons from an uploaded source (usually a PDF of a Wikipedia article) or a named topic. Use whenever the owner uploads a PDF or article about a historical person or event, or asks for a history, a history for dads, or a piece like the Drake / Golden Hind one.
---

# History for dads

1. **Read the standard and the reference first, every time:**
   - `docs/history-for-dads.md`: reader, length, structure, voice, sources
   - `docs/histories/golden-hind.md`: the approved reference piece. Match its
     shape, length and tone.

2. **Read the whole source.** If the Read tool can't render the PDF
   (`pdftoppm` is not installed in the sandbox), extract the text instead:

   ```sh
   pip install -q pypdf cffi
   python3 -c "import pypdf,sys; r=pypdf.PdfReader(sys.argv[1]); print('\n'.join(p.extract_text() for p in r.pages))" "<path to pdf>" > "$SCRATCH/source.txt"
   ```

   (`cffi` is needed because without it pypdf's crypto import crashes.)
   Put the text in the scratchpad, not the repo.

3. **Fill in what the source leaves out** (motives, context, what came before
   and after) from general knowledge, and don't invent anything. Note which
   facts came from memory and which of those you're unsure of.

4. **Write the piece**, then check it against the standard:
   - the main piece is about 750–800 words, in paragraphs, with every section
     present and in order
   - 6–8 side notes in bullets with bold lead-ins, about 250–300 words
   - it ends on a question for the kids before the side notes
   - count the words (`wc -w`) and don't guess

5. **Deliver it in chat**: the piece, then a two- or three-line note with the
   word count, anything from the source left out, and the facts to check.
   Don't commit it unless the owner asks. If they approve it and ask, save it
   as `docs/histories/<slug>.md` and merge it the way `CLAUDE.md` describes.

6. **Put it on the site only when asked.** When the owner asks for an
   approved piece to go live, enter it into `BRIEFS` in `data/content.js`
   following **Putting it on the site** in `docs/history-for-dads.md`: the
   sectioned shape (`dek`, `opening`, `sections`, `kidsQuestion`,
   `sideNotes`), word for word from the Markdown, with `"golden-hind"` as
   the worked example. Generate the entry from the file with a short script
   rather than retyping it. Fill `era`, `kind`, `minutes` and a `hook`, show
   the owner the hook, and don't invent a tale or a card to pair it with.
   Then `npm run check` and every step of **Before you merge** in
   `CLAUDE.md`, including a free reader's `/api/session` carrying none of
   the piece.

The standard is the only set of rules. The flat-`body` briefs already in
`data/content.js` were written to an older voice; leave them alone.
