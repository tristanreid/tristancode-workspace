---
title: "Embeddings Don't Know Which Rock You Mean"
description: "Vector search gives you semantic neighborhood. Entity resolution gives you a decision — a discrete, joinable, correctable ID. Most retrieval systems need both, and reach for the wrong one first."
weight: 10
series: "From Rows to Retrieval"
series_weight: 150
skin: graph
---

A document mentions "The Rock."

Which one? Dwayne Johnson, plausibly. Or the 1996 Michael Bay film. Or
Alcatraz Island, which is what the film is named after. Or a climbing gym, a
church, a radio station, or a nickname somebody's colleague acquired in
college. The string is three characters of article and four of noun, and it
identifies nothing on its own.

Now the question I actually care about: **what should your retrieval system
do with that document?** In 2026 the reflexive answer is to embed it and let
vector similarity sort things out. I want to argue that this answer is
confidently wrong in a specific and instructive way — and that the older,
cheaper technique it's replacing is doing a job embeddings cannot do at all.

This is part of a series about search systems as
[projections rather than truth](/blog/search-index-not-source-of-truth/). This
post is about two projections that get conflated: one that captures what a
document is *like*, and one that records what it is *about*.

## What an embedding actually gives you

An embedding maps a document into a space where nearby means "similar."
That's genuinely powerful, and I've written elsewhere about
[what embeddings are](/blog/exploring-data-what-embeddings-are/) and
[what you can see in that space](/blog/exploring-data-first-contact/). For a
document mentioning The Rock, a good embedding will land it somewhere near
other documents about action movies, or wrestling, or San Francisco Bay
landmarks, depending on context. The vector absorbs the surrounding words and
the neighborhood reflects them. That's the strength.

Here's the limitation, stated as precisely as I can: **an embedding gives you
a position, not a decision.** It will tell you this document is near that
one. It will not tell you that this document is about entity `film:11259`
rather than entity `person:18918`. Those are different kinds of answer, and
almost everything a real retrieval system needs to *do* requires the second
kind:

- **Filtering.** "Only documents about this title." You cannot filter on a
  neighborhood. You can threshold a similarity score, which is a filter with
  a knob nobody can explain and a boundary that moves when you change models.
- **Faceting and counting.** "How many documents mention this film?" A count
  requires membership, and membership requires a decision. "About 40, for
  values of *about* determined by cosine distance" is not a number anyone can
  act on.
- **Joining.** Entity IDs connect a document to structured data you already
  have — the catalog row, the owners, the release date, the access rules.
  Vectors join to nothing.
- **Graph edges.** Every relationship feature — this document links to that
  one, this doc and that doc are about the same thing — needs discrete
  endpoints.
- **Governance.** "Remove all documents about X from this index." You cannot
  govern a fuzzy region of space.

Embeddings are a *similarity* structure. Entity resolution produces an
*identity* claim. Reaching for the first when you need the second is the
mistake I keep seeing, and it's seductive precisely because vector search
demos beautifully on exactly the queries that don't need identity.

## Deciding is the hard part, and it's mostly counting

The thing that makes "The Rock" hard is not that it's semantically slippery.
It's that the *name is cheap* — it's ordinary English that appears constantly
for reasons unrelated to any entity.

I've written the mechanics of solving this at length in the
[Entity Detection series](/blog/entity-detection-the-you-problem/), so I'll
compress it to the two ideas that matter here, both of which are just
arithmetic:

**Distinctiveness.** Score how surprising a name is in ordinary text, using a
big neutral corpus — Wikipedia works well — as the denominator. "Stranger
Things" appears in a few thousand articles; "You" appears in millions. A
TF-IDF–flavored ratio turns that into a per-name prior for how much a bare
match should count. [The scoring post](/blog/entity-detection-scoring-matches/)
has the formula and the numbers.

**Corroboration.** Entities travel in company. A document mentioning "Bright"
tells you almost nothing. A document mentioning "Bright" *and* "Will Smith"
tells you quite a lot, because the co-occurrence of a weak match with a
related entity is much more likely under the hypothesis that the document is
about the film than under chance. Same for "The Rock" appearing alongside
"Alcatraz" versus alongside "Fast & Furious" — the neighbors disambiguate.

Both techniques are decades old, run in a batch job, cost approximately
nothing, and produce a discrete answer with an audit trail: *this match, at
this offset, scored this way, boosted by that corroborating entity.* Compare
that to explaining why a cosine similarity was 0.71.

## The property I care most about: correctability

Here's the argument that would keep me on deterministic entity resolution
even if embeddings were free and perfect on average.

When deterministic resolution gets something wrong, **you can fix the reason**.
A name got matched that shouldn't have? Adjust its distinctiveness floor, or
add it to the pre-filter list. A corroboration rule fired too eagerly? Change
the weight. Every decision traces to a rule and a number, both of which a
person can inspect, argue about, and change — and the change is testable
against the cases that motivated it. Your bug fixes accumulate as a growing
table of known-hard examples, which is the same pattern I recommended for
[URL canonicalization](/blog/url-is-a-locator-not-an-identity/) and for much
the same reason.

When an embedding-based system gets something wrong, what is the fix? You can
adjust a threshold, which moves every other decision too. You can add
examples and fine-tune, which is expensive and moves every other decision in
ways you can't enumerate. You can build a reranker on top, which adds a
second opaque component to explain the first one's behavior. None of these is
*inspection*, and none of them is a targeted repair.

That asymmetry compounds. A deterministic resolver gets monotonically better
as you feed it edge cases. A learned system gets *differently* wrong, and
you find out from users.

I'm not arguing that models don't belong in retrieval. I'm arguing that when
a component's job is to make a discrete claim that other systems will filter,
count, join, and govern on, you want that claim produced by something you can
audit and repair — and that "just use embeddings" quietly converts a
correctable system into an uncorrectable one.

## Where embeddings genuinely win

The honest other half. Entity resolution can only find things it has names
for, which makes it useless for:

- **Queries that name nothing.** "Documents about the awkwardness of moving a
  team to a new on-call rotation" has no entity in it. Lexical and entity
  retrieval both fail; a vector doesn't care.
- **Paraphrase and vocabulary gaps.** A document that discusses the concept
  without using your catalog's word for it. Embeddings bridge this; string
  matching cannot.
- **"More like this."** Similarity is *literally* the operation vectors are
  good at. It's not an approximation of something else — it's the native
  question.
- **Long-tail and unnamed concepts**, where maintaining a dictionary would be
  absurd.

Those are real, common, and valuable. Which is why the answer isn't
"embeddings bad" — it's that they're a different projection answering a
different question, and a serious system carries both.

## Carry both, deliberately

In the projection framing from
[the first post in this series](/blog/search-index-not-source-of-truth/), this
resolves cleanly. A search document can hold:

```json
{
  "id": "doc-17",
  "title": "…",
  "entities": [
    {"type": "film", "id": "film:11259", "score": 0.86, "via": "corroboration:alcatraz"}
  ],
  "embedding": ["…"]
}
```

Two fields, two projections, two question families. `entities` answers "which
known thing is this about?" and supports filters, facets, joins, access rules,
and graph features. `embedding` answers "what else is like this?" and rescues
the queries that name nothing. They're complementary because they fail
differently: entity resolution has excellent precision on things it knows and
zero recall on things it doesn't; embeddings have broad recall and no notion
of identity at all.

A practical ordering I'd defend for most corpora with a real catalog behind
them:

1. **Resolve entities first**, because identity is what the rest of your
   system — permissions, analytics, graph, facets — is built to consume.
2. **Use entity matches as ranking features and filters**, not just
   decoration.
3. **Add vectors for the recall you can't get any other way**, and evaluate
   that addition separately so you can tell what it bought.
4. **Resolve entities in the query too**, not only in documents. A query that
   names a known title should be able to say so, rather than hoping
   similarity notices.

That fourth one is where the payoff shows up fastest, and it's the step
teams skip most often.

## The summary I'd want a team to internalize

Vector search made an old capability easy and, in the process, made an older
one look obsolete. It isn't. **Similarity and identity are different
questions, and the second one is what most of the machinery around your
search box actually consumes.**

If a document mentions The Rock, the interesting engineering question is not
"what is this document near?" It's "which rock, how confident are we, what
evidence supports that, and can someone fix it when we're wrong?" Embeddings
have no opinion on any of those. Two decades of counting tricks have very
good ones, for about the cost of a batch job.

*I covered a version of this material — entity resolution and embeddings for
search — in a 2023 Netflix Data Engineering Tech Talk;
[the slides are here](https://docs.google.com/presentation/d/1-563hFAYUX7s9kEgz6cqcbpcUUwWTJcZ9syoZjJ9rvM/preview).*

Next in this series: chunking as information architecture — how splitting a
document is a projection decision, and what it destroys when you get it wrong.
