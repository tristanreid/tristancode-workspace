---
title: "Chunking Is Information Architecture"
description: "Chunking decides the unit that can be retrieved, ranked, and cited — which makes it schema design, not preprocessing. Structure-aware splitting, inherited headings, tables, and why changing your chunker is an index migration."
weight: 10
series: "From Rows to Retrieval"
series_weight: 170
skin: graph
---

Consider the sentence:

> It increased by 17%.

As a unit of evidence, that is worthless. Increased from what, measuring
what, over what period? Now put it back where it came from — under a heading
"Mobile Signup," inside a document titled "Q3 Experiment Results" — and it
becomes a fact you could act on.

Nothing about the sentence changed. What changed is how much of its context
travelled with it.

That is the whole of chunking, and it's why I'd argue chunking is the most
underrated decision in retrieval systems. It gets discussed as
preprocessing — a thing you configure with `chunk_size=512` before the
interesting work starts. It is actually **schema design for the unit of
evidence**, and it belongs in the same category as everything else in this
series: another
[projection built to answer a family of questions](/blog/search-index-not-source-of-truth/).

## The unit of retrieval defines the possible answers

Start from the constraint that makes this consequential: **your retrieval
system can only return things you made retrievable.** Whatever you chunked
into is the atom. It's what gets embedded, scored, ranked, returned, and
handed to a language model as evidence — and the model cannot recover context
that the chunker threw away. It will happily generate as though it had that
context, which is worse.

So the question "how should I chunk?" is really the question "what should the
smallest findable unit of meaning in my corpus be?" That's an information
architecture question about *your documents and your users' questions*, not a
tuning parameter.

{{< themed-svg "/images/search-series/chunking" "The same sentence chunked two ways: a fixed character window that starts mid-sentence and loses its heading, versus a structure-aware chunk carrying its heading path — only the second can answer the question it contains the number for" >}}

Fixed-size character windows — still the default in a lot of tooling — fail
at this in four ways simultaneously, all visible above. They start and end
mid-sentence. They discard the heading hierarchy that explains what the text
is about. They split tables away from their header rows, turning `4.1%` into
a number with no column name. And they cheerfully staple the beginning of the
next section onto the end of the current one, so a single "unit of meaning"
spans two unrelated topics.

Each of those is a specific, permanent loss. The chunk is what gets embedded;
if the chunk doesn't say what it's about, its vector doesn't either.

## Structure first, then splitting

The move that fixes most of this isn't a better splitting algorithm. It's
doing a conversion step *before* you split: parse whatever the source format
is — HTML, PDF, a wiki export — into a **structure-preserving intermediate
format**, in our case Markdown, where headings are headings and tables are
tables.

That ordering matters more than any parameter. Chunking raw extracted text
means guessing at structure from whitespace. Chunking a structured
representation means the boundaries are already there and you're just
deciding which ones to use. Every improvement I've seen in chunk quality came
from improving the parse, not from tuning the splitter.

With structure available, splitting follows a hierarchy of preferences:
split at headings first, and only when a section is still too large do you
fall back to paragraphs, then single newlines, then sentence punctuation,
then — reluctantly — whitespace. Strongest semantic boundary that works, in
order.

Here's a compact version of that idea, in dependency-free Python, over a toy
document:

```python
import re

HEADING = re.compile(r"^(#{1,6})\s+(.*)$")
SEPARATORS = ["\n\n", "\n", ". ", " "]        # strongest boundary first

def sections(markdown):
    """Yield (heading_path, body) pairs, tracking the heading stack."""
    stack, body = [], []
    for line in markdown.splitlines():
        m = HEADING.match(line)
        if m:
            if body:
                yield list(stack), "\n".join(body).strip()
                body = []
            level = len(m.group(1))
            stack = stack[: level - 1] + [m.group(2).strip()]
        else:
            body.append(line)
    if body:
        yield list(stack), "\n".join(body).strip()

def split_to_fit(text, fits, seps=SEPARATORS):
    """Split on the strongest boundary that works, packing greedily."""
    if fits(text) or not seps:
        return [text]
    sep, weaker = seps[0], seps[1:]
    parts, buf = [], ""
    for piece in text.split(sep):
        candidate = f"{buf}{sep}{piece}" if buf else piece
        if fits(candidate):
            buf = candidate
        else:
            if buf:
                parts.append(buf)
            buf = piece
    if buf:
        parts.append(buf)
    out = []
    for part in parts:
        out.extend([part] if fits(part) else split_to_fit(part, fits, weaker))
    return out

def chunks(markdown, fits, min_chars=60):
    """Structure-aware chunks, each carrying its heading path."""
    for path, body in sections(markdown):
        if not body:
            continue
        prefix = " > ".join(path)
        for piece in split_to_fit(body, fits):
            if len(piece) < min_chars:
                continue                       # drop low-information scraps
            yield f"{prefix}\n\n{piece}" if prefix else piece
```

Run that over a short experiment write-up and the first chunk comes out as:

```text
Q3 Experiment Results > Mobile Signup

We shortened the form from nine fields to four. The change shipped in week two
to fifty percent of traffic. It increased by 17%.
```

The sentence is rescued. Four details in those forty lines are worth pulling
out, because they're where the real decisions live.

**`fits` is a function, not a number.** Notice the code never counts
characters to decide whether a chunk is too big — it calls a predicate you
supply. In production that predicate wraps your model's tokenizer, because
**the limit that matters is tokens, and tokenization is model-specific**.
Character counts are a proxy that drifts badly on code, tables, non-English
text, and anything with unusual punctuation. Passing the limit in as a
function also means switching embedding models doesn't require rewriting the
chunker.

**Greedy packing is small-fragment merging.** The loop accumulates pieces
into `buf` while they still fit, which means three consecutive short
paragraphs under one heading become one chunk rather than three. You want
that. A corpus of tiny fragments retrieves badly — each one is too thin to
match a real question, and they crowd each other out of the results.

**Dropping tiny chunks has a cost.** The `min_chars` filter is why the toy
document's one-line intro ("Summary of the quarter's tests.") never appears
in the output. That's usually right — a fragment that short rarely answers
anything and pollutes the index. But it *is* data loss, applied by a
threshold nobody tuned, and if your corpus is full of meaningful short lines
(definitions, config values, one-line policies) this rule quietly eats them.
Know that you've made the trade.

**The heading path is inherited, not just recorded.** The prefix goes into
the chunk *text* — the thing that gets embedded — not only into a metadata
field beside it. This is the single highest-leverage line in the whole
function. Metadata is available for filtering and display; only the text
participates in the semantic match. If you want "Mobile Signup" to influence
whether this chunk is retrieved for a question about mobile signup, it has to
be in the string you embed.

## Tables want special treatment

Tables are where generic splitters do their most obvious damage, because a
table's meaning is almost entirely in the relationship between its header row
and its data rows. Split them apart and you're left with rows of numbers
labelled by nothing, which is both useless to retrieve and actively
misleading if a model does retrieve it.

The rule I'd apply: treat a table as its own unit type. If it fits, keep it
whole. If it doesn't, split it by *groups of rows* and repeat the header row
on each piece. That's a small amount of table-aware code, and it converts a
category of guaranteed-garbage chunks into usable ones.

The same instinct extends to other structures with an inseparable head and
body — code blocks with their signature line, list items under a stem
sentence, definition lists. The general principle: **find the structures in
your corpus whose meaning lives in a head-body relationship, and teach the
chunker not to sever them.**

## Local meaning versus document context

Once chunks exist, a genuinely interesting design question appears: should a
chunk's embedding represent *only* the chunk?

The alternative is to blend — combine the chunk's own embedding, weighted
heavily, with a smaller contribution from an embedding of the whole document.
The intuition is appealing: a passage from a document about mobile onboarding
should be nudged toward "mobile onboarding" in vector space even when the
passage itself doesn't say so. The system I worked on built exactly that
weighted form, and a parallel unweighted form alongside it for comparison.

Here's where I have to be disciplined about what I actually know: **I can't
tell you which one won.** Both existed; I don't have comparative evaluation
evidence I could stand behind, and I'm not going to claim a result I can't
support. What I can offer is the reasoning I'd apply now, which cuts in an
interesting direction.

Blending makes one vector carry two distinct claims — "this passage is about
X" and "the document containing it is about Y" — with no way for a consumer
to separate them afterward. That's a real cost. It's the same discomfort I
described in
[the entity post](/blog/embeddings-dont-know-which-rock/): when evidence is
fused into a single opaque number, you lose the ability to inspect or correct
the individual contributions. Wrong retrieval becomes hard to diagnose,
because you can't ask *which* part of the representation pulled it in.

The alternative that keeps things separable is to store both vectors and
combine them at query time, where the weighting is a tunable knob rather than
a baked-in property of the index. More storage, more query complexity, but
the blend stays adjustable and debuggable. Given the choice today, and
absent evaluation evidence pointing the other way, I'd lean toward keeping
evidence sources separable — a preference this series keeps arriving at from
different directions.

One more caveat worth stating: a "whole-document embedding" is itself a lossy
thing. Embedding models have input limits, so for any long document that
vector represents a *truncated* version — often just the beginning. Blending
in a document vector may be blending in an embedding of the first page.
That's not necessarily wrong, but you should know it's what you're doing.

## Two indexes, two questions

Chunk-level and document-level retrieval answer different questions, and the
systems I've worked on kept both.

Document retrieval answers "which documents are about this?" — the classic
search-results question, where the user wants to open something. Chunk
retrieval answers "where exactly does this corpus address this?" — the
question RAG needs, where the goal is a specific passage to reason over or
cite.

Running both introduces a wrinkle worth planning for: chunk-level results
produce **duplicate-looking results**, because five chunks from the same
document all match. If chunks are surfaced to a human, you almost certainly
need to collapse them by document with the best chunk as the representative.
If they're feeding a model, you may want the opposite — diversity across
documents, so the context window isn't five paragraphs of the same source.
That's a deduplication policy decision, and it belongs to the application,
not the chunker.

## Provenance is the other half of the job

Every chunk needs to carry a stable pointer home: the document ID, its
position, and the total count. That's what makes citation possible — and
citation is the feature that makes a RAG answer checkable rather than
merely plausible.

This is where the earlier posts collect their debt. A citation is only as
stable as the document identity behind it, which is the entire subject of
[the URL post](/blog/url-is-a-locator-not-an-identity/) — cite a chunk of a
document whose ID isn't canonical and your citation may point at one of three
duplicates, or at nothing after the next rebuild. And the chunk's document
metadata inherits whatever the
[freshness policy](/blog/freshness-failure-and-the-document-you-serve/)
decided, which means a chunk can be cited from a document nobody can open
anymore.

## Evaluating chunking

The metric I see teams reach for is average chunk size, which measures
nothing anyone cares about. Chunking quality is only observable through
retrieval outcomes, and specifically **by question type**:

- Questions whose answer is a single number or fact, where the risk is a
  chunk that contains the value without its subject.
- Questions answered by a table, where the risk is a header-orphaned row.
- Questions spanning sections, where the risk is that no single chunk holds
  the whole answer — the case that argues for larger units or overlap.
- Questions about the document as a whole, which chunk retrieval is
  structurally bad at and document retrieval handles.

Bucket your evaluation questions that way and chunking failures become
legible: you don't learn "retrieval is at 71%," you learn "we fail table
questions," which points at a specific fix. Averages hide exactly the
structure you're trying to fix.

(Chunk overlap — repeating a bit of the previous chunk's tail — is the usual
first suggestion for the spanning-sections case. It's a legitimate option and
it wasn't central to the implementation I'm drawing on. My honest read is
that it's a blunt patch for a structural problem: it costs index size on
every chunk to fix a subset of queries, and structure-aware splitting plus
inherited headings solves more of the same problem more cheaply. Worth
measuring rather than assuming, in your corpus.)

## Chunking changes are index migrations

The last point, and the one that connects this to the beginning of the
series. When you change the chunker — different size limit, different
boundary rules, different heading handling — **every chunk in your index
becomes inconsistent with every chunk produced after the change.** Chunk IDs
shift. Citations break. Old and new chunks with different context conventions
sit side by side in the same vector space, ranked against each other.

There is no incremental fix. A chunking change is a full reindex, exactly
like an analyzer change, which is why
[cheap, routine rebuilds](/blog/zero-downtime-index-rebuilds-aliases/) are
what make chunking *improvable* rather than frozen. The same is true of the
embedding model: chunk text and model version together define the vector
space, and changing either one invalidates the whole index.

Which means the chunking algorithm and the embedding model version are part
of your index's schema contract, and deserve to be recorded as such — written
into the index metadata, so that when results look strange a year from now,
someone can find out which conventions produced them.

## The summary

Chunking looks like preprocessing and behaves like schema design. The unit
you choose is the unit that can be found, ranked, cited, and reasoned over;
context the chunker discards is context no downstream model can recover.

If you take one practice from this: **convert to a structured intermediate
format first, split on the strongest semantic boundary that fits, and put the
heading path into the text you embed.** Those three decisions account for
most of the difference between a chunk corpus that answers questions and one
that returns plausible-looking fragments with nothing to anchor them.

Next, and last in this season: what happens when the same indexing pattern
gets built for the fifth time, and it's time to turn a repeated script into a
paved road.
