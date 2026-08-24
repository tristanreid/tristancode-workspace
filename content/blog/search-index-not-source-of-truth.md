---
title: "The Search Index Is Not the Source of Truth"
description: "A search index is a rebuildable, purpose-built projection of canonical data — and treating it that way changes how you design, operate, and reason about every retrieval system, from Elasticsearch to RAG."
weight: 10
series: "From Rows to Retrieval"
series_weight: 110
skin: graph
---

Here's a question that sounds trivial and isn't: in a document search system,
where does the *document* actually live?

Not the file — the thing you search. The result with a title, an owner, a
project, a snippet, a freshness date, a relevance score. Point to the system
that contains that object.

In every serious search system I've worked on, the answer is: nowhere. No
single source contains the searchable document. One system knows the title
and who owns it. Another knows what project it belongs to. A link graph knows
what points to it and how far it sits from sources you trust. A parser
extracted its text; an entity pipeline tagged what the text mentions; an
embedding model summarized it as a vector; usage logs know whether anyone
still reads it. The "document" your search box returns is a fabrication —
assembled, on purpose, from a dozen places, into a shape that exists for
exactly one reason: answering queries fast.

That's the core idea of this essay, and of the series it begins: **a search
index is not the source of truth. It's a projection of the truth, purpose-built
for one family of questions.** This sounds like a demotion. It's the opposite —
it's the design principle that makes search systems (and OLAP systems, and
graph features, and vector stores, and RAG) comprehensible. Once you see
indexes as projections, a whole set of confusing engineering decisions becomes
mechanical.

## The database instinct

Engineers raised on relational databases — which is most of us — carry a deep
instinct: *there should be one normalized copy of every fact.* Duplication is
a smell. Derived data is suspect. If you want the document's owner, you join
to the owners table; if you want its project, you join again. The schema is
the truth, and queries are questions asked of the truth directly.

This instinct is correct, and you should keep it — for the canonical store.
Normalization is how you guarantee that when a fact changes, it changes
everywhere, because it only lives in one place. Transactions, constraints,
foreign keys: all machinery for keeping one copy of the world consistent.

The instinct only becomes a liability when it's applied to *serving*. Because
here's what a search user is actually asking for: given two or three words,
rank every document in the corpus by estimated relevance, filter by what this
user may see, decorate the top ten with titles, owners, snippets, and dates —
in well under a second, please.

## Why search can't be a join

Try to serve that from the normalized store and you hit a wall that's
architectural, not incremental. Ranked retrieval inverts the access pattern a
relational schema is built for. A join engine answers "given this document,
what are its properties?" A search query asks "given these words, which of
the millions of documents score highest?" — which touches an index organized
by *term*, not by ID, and then immediately needs the properties of the
winners for filtering, ranking, and display.

You can bolt text search onto a relational database (every database vendor
will sell it to you). What you can't do is escape the shape of the problem:
serving ranked retrieval means paying the cost of assembly — the joins, the
enrichment, the derivations — *at some point*, and the only question is
whether you pay it at query time, per user, per keystroke, or once, at index
time, for everyone.

Search architecture is the decision to pay early. The index is where the
prepaid answers are stored.

{{< themed-svg "/images/search-series/projections" "One world of facts, many serving projections: relational rows for lookups, OLAP cubes for aggregation, inverted indexes for ranked retrieval, graph features for authority, vectors for similarity" >}}

## The projection model

So what exactly is the thing you build at index time? Here's a document from
a search corpus, simplified but true to shape:

```json
{
  "id": "doc-17",
  "title": "Launch Review",
  "body": "...",
  "owners": ["owner@example.test"],
  "source_types": ["project", "review"],
  "graph_distance_to_source": 1,
  "incoming_link_count": 7,
  "entities": [{"type": "country", "id": "CA", "score": 20}],
  "last_modified": "2025-03-01T12:00:00Z",
  "embedding": ["…"]
}
```

Read it as a database person and it's a monstrosity: denormalized owner
strings, precomputed counts, derived scores, a *machine-learning output*
stored as a field. Nothing about it is canonical. If the owner changes their
email, this record is instantly wrong.

Now read it as a serving engineer and every field is there for a retrieval
reason. `title` and `body` feed fielded full-text scoring. `owners` and
`source_types` are filters — access and facets — that must be resolvable
without a join, because there is no join engine at query time.
`graph_distance_to_source` and `incoming_link_count` are ranking features:
authority, precomputed from a link graph that took its own pipeline to build.
`entities` lets a query about a *thing* beat a query about a *string* — I
wrote about the machinery behind that in the
[Entity Detection series](/blog/entity-detection-the-you-problem/). The
`embedding` is a fifth kind of projection living inside this one: the
document's meaning, pre-summarized so that semantic similarity becomes cheap
geometry.

No canonical system owned that object. It was *manufactured* — from parsed
content, structured metadata, a link graph, an entity pipeline, and an
embedding model — because that's the arrangement of facts the read path
needs. In one enterprise search system I worked on at Netflix, the pipeline
that assembled documents like this was most of the system: acquisition,
parsing, canonicalization, enrichment, and derivation, all upstream of the
part anyone would recognize as "search." The index at the end was almost an
afterthought — the place where finished projections are parked so queries can
find them.

That inversion is general. **Retrieval quality is mostly determined before
anything is retrieved** — by corpus discovery, identity, parsing, metadata,
freshness, and access decisions. It's the least glamorous claim in this
series and the one I most want to defend, because the industry's attention
sits almost entirely on the query side (ranking models, rerankers, RAG
orchestration) while most real-world search failures I've diagnosed were
manufactured upstream, in the projection.

## "Isn't that just a cache?"

The tempting dismissal: fine, the index is derived data — a big cache. Warm
it, invalidate it, move on.

The word *cache* undersells three properties that will dominate your
operational life. A cache stores answers in the *same shape* the source
produced; a projection has its own schema, one that encodes ranking behavior
(which fields exist, how they're analyzed, what's filterable) and that
evolves on its own timeline, with its own compatibility contract. A cache
entry is cheap to regenerate; a projection can be *expensive* — some fields
above cost a graph computation or a model inference, so "just rebuild it" is
a budget line, not a shrug. And a cache is invisible when correct; a
projection is *load-bearing for behavior* — change how a field is analyzed
and search results change, with no bug anywhere upstream.

The term that fits is a **materialized read model**: derived, yes;
disposable, yes, in principle; but with independent schema, independent cost,
and independent behavior. Derived-ness tells you it can be rebuilt. It does
not tell you rebuilding is easy, and it does not make the projection's design
any less consequential.

## What the projection costs

The projection model is honest accounting: paying at index time means the
costs don't vanish, they change shape. You will pay in —

**Staleness.** The index lags the truth by construction. The real design
question is not "how do we keep it in sync?" (you don't, not perfectly) but
"what lag is acceptable for which fields?" — a title edit probably needs to
show up soon; an incoming-link count can be a day old and no one will ever
know. Freshness is a *budget allocated per field*, not a virtue pursued
globally.

**Identity.** The moment you assemble documents from multiple systems, you
must decide when two records are the same thing. URLs redirect, duplicate,
and decorate themselves with tracking parameters; the same document arrives
from two sources with two names. Identity in a corpus is a policy you write,
not a fact you look up — it's the subject of a later post in this series.

**Schema evolution.** The projection's schema is a contract between the
pipeline that writes it and the queries that read it, and some of its
decisions (how a field is analyzed, whether it's filterable) are frozen into
the built artifact. Changing them means rebuilding the world — which is why
the *rebuild story* is not an ops detail but a first-class architectural
feature. The next post in this series is about exactly that: making full
rebuilds so safe and routine that schema evolution stops being scary.

**Trust decisions.** When a source read fails, do you keep serving the last
good version of that document, or pull it? I've shipped both policies in the
same system — first one, then, deliberately, the other — and the reversal
taught me more about serving derived data than either policy did. That story
also gets its own post.

## The same idea, four more times

The reason this essay opens the series is that the projection model isn't a
search idea — search is just where engineers usually meet it first.

An **OLAP model** is the same move for aggregation: facts reshaped into
dimensions and measures so that slicing is cheap, at the cost of a load
pipeline and a modeling contract. A **sketch** — like the
[HyperLogLog counters](/blog/hll-counting-unique-items-part1/) I've written
about, and the broader family of
[mergeable structures](/blog/mergeable-operations-split-process-combine/) —
is a projection so aggressively purpose-built that it can't answer *anything*
except its one question, and in exchange it's thousands of times smaller than
the truth. **Graph features** project relationship structure into flat
per-node numbers so that "how authoritative is this document?" costs a field
read instead of a traversal. And a **vector index** is a projection of
meaning itself: whatever the embedding model understood, frozen into
geometry, with the model's version becoming part of the projection's lineage.

Same trade every time: precompute the answer-shape a question family needs;
accept staleness, rebuild cost, and a schema contract in return. A serving
architecture is a portfolio of these bets. The systems don't disagree about
the world — they arrange the same world for different questions.

(And if you're building RAG in 2026: retrieval-augmented generation is this
model with a language model bolted on top. The chunks are projections;
chunking policy is schema design; the embedding version is lineage; freshness
and identity failures come out of the model's mouth as confident nonsense.
Most "RAG problems" I've seen are projection problems wearing a new name.
Later posts will take that apart properly.)

## The checklist

The projection model compresses into six questions. I ask them of every
serving store I meet — search index, OLAP cube, feature table, vector store —
and I'd encourage you to ask them of yours:

1. **What is canonical here, and what is derived?** If a fact in the
   projection changed, where would the correction have to originate?
2. **Can we rebuild it from scratch?** How long, at what cost, and when did we
   last actually do it?
3. **What staleness does each field tolerate?** Freshness as a per-field
   budget, not a global aspiration.
4. **Who owns the schema contract?** What breaks — silently — if a field's
   meaning or analysis changes?
5. **What's the identity policy?** When are two records the same thing, and
   who decided?
6. **What happens when a source fails?** Serve the last good version, or drop
   it — and is that a choice someone made, or an accident nobody has noticed
   yet?

If a team can answer all six, their search system is in better shape than
most. If a question has never come up, that's usually where the next incident
is waiting.

The index is not the truth. It's a bet about which questions are coming —
placed early, paid for in staleness and rebuild cost, and worth every penny
when it's placed deliberately. The rest of this series is about placing it
deliberately: rebuilds and aliases, identity, freshness policy, entity
resolution, graph features without a graph database, and chunking — the same
projection decisions, met one at a time, in systems I've actually run.
