# History for dads — the standard

This is how a history for dads is written. It was worked out on
2026-09-23 by writing one piece, Francis Drake and the *Golden Hind*, from
a Wikipedia PDF and revising it with the owner until they signed off on it.
That piece is the reference implementation:
[`docs/histories/golden-hind.md`](histories/golden-hind.md). Read it before
writing a new one. When this document and that piece disagree, the piece
wins, and this document gets fixed.

**This is the only standard for a new history.** It replaced the older
brief voice (the "military explainer": third person, no "you", no closing
line, no fun facts, Hastings as the reference), whose rules sat in the header
of `data/content.js` until 2026-09-23 and were taken out then; they are in git
at commit `358a053` if anyone needs to see them. The histories already on the
site were written to that voice and stay as they are: don't rewrite them
toward this one. The owner set that voice aside for this exercise and
approved the result as the new standard.

## The usual job

The owner uploads a source, usually a PDF of a Wikipedia article, and asks
for a history. The output is a piece in the shape below, delivered in chat,
ready to read. The source is the starting point, not the limit. See
**Sources and accuracy**.

## Who's reading

A dad who wants to keep learning. He doesn't want to feel like he's
standing still, he wants to know things he can pass on to his kids, and he
wants to be the kind of person who knows how the world got this way. He is
**not a history nerd**, and he has very little time or spare attention.

Two failures to avoid, and they pull in opposite directions:

- **Too long, too much.** Heavy on dates, a list of every name, long
  background before anything happens. He stops reading.
- **Talking down to him.** Cute, breathless, "Imagine this!", lessons spelled
  out, rough parts softened. He is an adult who is short on time, not a child.

The target is how a sharp friend who knows the subject would tell it over a
beer: plain, specific, a little dry, and never padded.

## Length

- **Main piece: about 750–800 words** (the reference is 780). This is the
  number the owner settled on: the first draft, around 1,300 words, was
  "a bit too long," and cutting to about 750 was right.
- **Side notes: about 250–300 words**, 6 to 8 bullets. They don't count
  against the main length, because they are optional reading.
- Word budget per section, from the reference:

  | Section | Words |
  |---|---|
  | Title, dek and opening | ~50 |
  | Why he did it | ~120 |
  | How he did it | ~230 |
  | The rest of the story | ~100 |
  | Where it fits | ~75 |
  | Why it matters today | ~85 |
  | For the dinner table | ~70 |
  | Side notes | ~290 |

  "How" gets the most room because it is the story. When cutting, take from
  background and side detail first, never from the story.

## Structure

Always the same sections, in this order and with these headers. Section
titles can be adjusted to the subject when "he" doesn't fit, such as "Why it
happened" for an event with no single hero, but keep the order and purpose.

1. **Title** — a hook, not a label. "The Pirate the Queen Knighted", not
   "The Circumnavigation of Francis Drake".
2. **Dek** — one bold line: who, what, when. "Francis Drake sails around the
   world, 1577–1580".
3. **Opening paragraph** (no header) — the whole thing in three sentences. What
   happened, the most striking number or fact, and why it was a big deal. If he
   reads nothing else, he still has it.
4. **Why he did it** — the motives: money, politics, grudges, what the world
   looked like just before. Give enough setup to make the action make sense,
   and no more.
5. **How he did it** — the story itself, in order, with the concrete details
   that make it real (numbers, names of ships, what went wrong). This is the
   longest section.
6. **The rest of the story** — what he did before and after that's worth
   knowing, and how he ended.
7. **Where it fits** — what came just before and just after, on the scale of
   decades rather than centuries. It connects the piece to events he has
   probably heard of: the Armada, Jamestown and the East India Company.
8. **Why it matters today** — two or three concrete links to the world he
   lives in, such as why we speak English and where the money came from. If
   there is a real "it depends who's telling it," say so plainly.
9. **For the dinner table** — things he can point at or mention today (places
   named after it, objects you can still go and see), then **one question to
   ask the kids**. The question should be easy to answer and open-ended, and
   come out of the story, not out of a moral.
10. **Side notes** — bullets, see below.

## Prose, not bullets

The main piece is **paragraphs**. The first draft was mostly bullets and the
owner asked for "less bullet pointy". Each paragraph makes one point, in two
to five sentences. Headers stay, so it still skims.

**Side notes are the one place bullets belong.** The owner asked for the
details cut for length to come back "as bullet points at the end ... little
notes that aren't essential but cool to know". Each note is:

- a short **bold lead-in** naming the thing ("**Stuck on a reef.**"), then
- one to three sentences telling it.

Good side notes are the details a history nerd would love and a busy dad can
skip: a close call, a legend and whether it's true, a hoax, an odd object that
survives, the story behind a name. They are also where cut material goes. If a
detail doesn't earn a place in the main piece, move it to the side notes
rather than deleting it.

No timeline tables in the main piece. The timeline goes into prose in
**Where it fits**.

## Voice

- **Plain words, short sentences, active verbs.** "He beheaded his
  co-commander," not "the co-commander was subsequently executed."
- **Specific beats general.** "26 tons of silver" does the work of a paragraph
  of adjectives. Every section should have at least one hard number or name.
- **Dry and a little funny, never cute.** "*Cacafuego*, roughly
  'Fire-Crapper'" is fine. Exclamation marks and "Imagine..." are not.
- **"You" is allowed** where it's natural ("It's part of the reason you speak
  English"). Don't overdo it.
- **Say the hard parts plainly, once.** Drake's early voyages traded slaves,
  and the piece says so in one sentence and moves on. Don't hide it, and
  don't lecture about it.
- **Hero or villain depends on who's telling it.** When a figure looks
  different from the other side, say so ("to England ... a national hero, and to
  Spain he was a pirate. Both are true."). Don't pick a side for the reader.
- **Mark legends as legends.** "Reportedly", "almost certainly made up",
  "many historians suspect". A myth that's labelled is a great side note. A
  myth told as fact is a mistake.
- **End each section on a fact, not a moral.** "That stretch of water is
  still called the Drake Passage" is a good ending. "And that teaches us
  about perseverance" is not.
- **No jargon without a gloss.** If a term is needed (privateer, galleon),
  it gets a few plain words of explanation the first time.
- **Religion is subject matter, not register.** Saints, councils, heresies
  and feasts are history and get written like any other history. What stays
  out is the devotional register: no preaching, no piety, and no miracle
  asserted as fact when the evidence for it is a hagiographer writing three
  centuries later. Name the source, say when it was written, and let the
  reader weigh it. The only two places the site speaks in a religious voice
  are a card's "Before lights out" prayer or verse and its one-line "Why
  this is ours". (Carried over from the old header of `data/content.js`,
  where it was the one rule that was not about the old voice.)

## Sources and accuracy

- **The upload is a starting point.** Wikipedia articles about a thing (a
  ship, a treaty) often leave out the person and the context. The Golden Hind
  article is mostly about replicas, and it has almost nothing on Drake's
  motives, the Armada or the timeline. Fill that in from general knowledge. The
  owner wants the complete history, not a summary of the PDF.
- **Don't invent anything to fill a gap.** No made-up quotes, no numbers
  rounded into something bigger, and no guessed dates. If the source and your
  own knowledge disagree, say so to the owner.
- **Flag what needs checking.** After the piece, list in one or two lines the
  facts that came from memory rather than the source and that you're less
  than sure about. For Drake that was the Keynes line, whether the Queen's
  share cleared the whole national debt, and "first museum ship." That list
  is for the owner, not the reader.

## Delivering it

In chat:

1. The piece, complete, in Markdown, in the shape above.
2. A short note after it: the word count, anything from the source that was
   left out (and why), and the facts to check.

Don't commit a new piece to the repo unless the owner asks. Approved pieces
live in `docs/histories/<slug>.md`, next to the reference.

### Putting it on the site

Also only when the owner asks. An approved piece goes into `BRIEFS` in
`data/content.js` in the sectioned shape, word for word from its Markdown
file; the note above `BRIEFS` has the field list and the Drake entry
(`"golden-hind"`) is the worked example:

| Markdown | `BRIEFS` field |
|---|---|
| `# Title` | `title` |
| the bold line under it | `dek` (without the `**`) |
| the paragraph before the first header | `opening` |
| each `## Header` and its paragraphs, up to and including "For the dinner table" | `sections: [{ heading, body: [...] }]` |
| the text after "A question for the kids:" at the end of the dinner-table paragraph | `kidsQuestion`, exactly as written (the site prints the label); the paragraph keeps the rest |
| each side-note bullet | `sideNotes: [{ lead, text }]`, lead with its full stop, without the `**` |

Keep `*italics*` as they are (ship names); the page prints them in italics.
Then fill the fields every brief has:

- `era` and `kind`, from `ERAS` and `KINDS` (a new entry is a decision for
  the owner, not a filing convenience).
- `minutes`: count the words with `wc -w`, main piece plus side notes, at
  about 200 a minute, rounded (the Drake piece is 780 + 296, so 5).
- `hook`: two or three sentences for the shelf, the receipt and a locked
  page. It is new copy, so show it to the owner.
- A card (`CARDS`) is a separate decision. A brief does not name a
  bedtime story; the card is the only thing that puts a history and a
  story together, and the two don't need to relate.

`node tools/check-content.js` fails a sectioned brief missing its opening,
sections or kids' question, and warns when the main piece is outside 650 to
900 words or the side notes are not 6 to 8. Then check it on the site as
`CLAUDE.md` describes, as a paid reader and a free one.

## How the reference got here

Four rounds, each a note from the owner. Keep them, because they are the
reasons behind the rules above:

1. **First draft**: the right sections, but mostly bullets and a timeline
   table, about 1,300 words. "That's very good."
2. **"Less bullet pointy"**: rewritten as paragraphs, and the timeline table
   became prose.
3. **"Cut it down a little"**: down to about 780 words, and every section kept.
   The cuts were background and colour, not story.
4. **"Add them back in as bullet points at the end"**: the cut material came
   back as side notes, so the standard now has a main piece and optional
   notes.
