---
title: "A Knowledge Graph Without a Graph Database"
description: "Bounded traversals, edge tables, and batch jobs gave a search system everything it needed from a graph — corpus discovery, a trust boundary, and an authority score — without adopting a graph database."
weight: 10
series: "From Rows to Retrieval"
series_weight: 160
skin: graph
---

A structured system you trust — a project registry, a launch tracker — links
out to a design document. That design document links to a test report. The
test report links to a dashboard guide. The dashboard guide links to
something on the open internet.

Two questions fall out of that chain, and they're the same question wearing
different hats. Which of these documents belong in your search corpus? And
of the ones that do, how much should each be trusted?

That is a graph problem. It is not, necessarily, a graph *database* problem —
and the distinction is the subject of this post. In the system I've been
drawing on throughout this series, a knowledge graph did real work: it
decided what entered the corpus, how far the crawler went, how much of each
document got indexed, and one of the ranking signals. It did all of that as
edge tables and batch jobs in a warehouse, with no graph database anywhere.

I want to explain why that was the right call there, and — just as
importantly — the conditions under which it would be the wrong call for you.

## The graph already exists

The first thing to notice is that nobody decided to build a graph. Documents
contain links. Structured sources reference documents. Those are edges,
whether or not you ever draw them. The only real decision is whether you
*materialize* them and what you do with them.

Which means the graph inherits everything from the identity work in
[the URL post](/blog/url-is-a-locator-not-an-identity/). A graph is nodes and
edges; if your node identity is a URL string, then the same document reached
three ways is three nodes, your traversal counts them separately, your
authority scores split three ways, and every conclusion you draw is wrong in
a way that's very hard to see. **Canonical identity isn't a prerequisite for
the graph — it *is* the graph's node definition.** Get it wrong and no
amount of graph sophistication downstream will recover.

With stable IDs in hand, the durable representation is boring: an edge table.
Source-to-document edges and document-to-document edges, deduplicated,
self-links excluded, each row carrying where it was observed. Boring is the
point — it's a warehouse table like any other, it joins to everything else,
it versions with your other data, and it can be rebuilt from scratch the same
way [the index itself is rebuilt](/blog/zero-downtime-index-rebuilds-aliases/).

## Bounded breadth-first expansion

The traversal that matters is deliberately simple: a bounded breadth-first
walk out from the sources you trust.

```text
generation 0 = documents referenced directly by an authoritative source
generation 1 = not-yet-seen documents linked from generation 0
generation 2 = not-yet-seen documents linked from generation 1
…
stop at a small fixed depth
```

Each document gets a **shortest generation** — the fewest hops from any
accepted source — plus one concrete path back to a source that produced it.
In batch, this is a handful of joins repeated a fixed number of times; the
"not-yet-seen" condition is what keeps it terminating and what makes each
document's generation the *shortest* one. Cycles, which are the classic
hazard of link graphs, stop being a hazard: a document already mapped in an
earlier generation is simply never remapped.

Note what fixed depth buys beyond termination. It's a statement of editorial
policy in the shape of an integer. Three hops from a trusted registry is
still, plausibly, work product. Eight hops is the entire internet. The depth
limit is where somebody decides how far "related to what we do" extends, and
writing it as a number in a config makes that judgment reviewable instead of
emergent.

{{< themed-svg "/images/search-series/bounded-graph" "Bounded breadth-first discovery from an authoritative source: each generation adds newly-seen documents, a corpus gate cuts off past a maximum generation, and generation number simultaneously drives discovery, trust, and ranking" >}}

## One number, three jobs

Here's what I find genuinely elegant about this design, and it took me a
while to appreciate: **the generation number does three different jobs at
once**, and they reinforce each other.

**It drives discovery.** The frontier — the documents just added at
generation N — is exactly the fetch list for the next pass. The graph tells
the crawler where to go, and the depth limit tells it when to stop. Discovery
isn't a separate system with its own notion of scope.

**It draws the trust boundary.** The corpus gate is a predicate on
generation: a document is included only if it's within the maximum accepted
distance from a source. This is a genuinely different way to think about
corpus construction. Instead of asking "is this document good?" — which
requires judging content — you ask "is this document *connected* to something
we already decided was authoritative, closely enough?" Provenance as
membership criterion.

**It's a ranking feature.** Distance from a trusted source is a reasonable
prior on how much a document should be believed, and it feeds a simple
authority score I'll come back to in a moment.

And then there's a fourth use that I think is the cleverest thing in the
system, because it turns a trust policy into a cost control. **How much of a
document's text gets indexed can itself scale with generation.** Documents
close to an authoritative source contribute substantially more text to the
index; distant ones contribute a truncated version. Think about what that
accomplishes in one move: index size is bounded, retrieval quality is
protected where it matters most, and the corpus can be generous at its edges
without letting marginal documents consume the same resources as core ones.
It's not "in or out" — it's a *graded* membership, where the graph decides
how much space you earn.

That's the kind of design that only appears when the graph and the index are
built by the same pipeline. A general-purpose graph database sitting off to
the side would have made this awkward to even express.

## Authority you can explain

For a ranking signal, the system used a deliberately unsophisticated score:

```text
score(document) = Σ over incoming links of  1 / (1 + generation(linking document))
```

A link from a document sitting right next to an authoritative source counts
for a lot. A link from something four hops out counts for little. Sum them up.
That's the whole feature.

This is not PageRank, and the difference is the point. PageRank is a global
eigenvector computation over the entire graph — beautiful, well-understood,
and *opaque* in exactly the way that hurts when someone asks why their
document ranks below another one. The generation-weighted score can be
explained to a skeptical colleague in one sentence, and — more usefully —
audited: you can list the specific incoming links that produced the number
and see immediately whether they look like endorsements or noise.

I'd defend that choice generally. **In enterprise corpora, interpretable
authority features usually beat sophisticated ones**, for a reason that's
structural rather than mathematical: the corpus is small enough that a
handful of weird links can dominate a global algorithm, there's no adversary
you're defending against, and the people who complain about ranking have
standing to demand an explanation. Global graph algorithms earn their keep on
the web, where the graph is enormous, adversarial, and nobody gets to appeal.

(The production index did also carry a PageRank field, computed by a separate
producer that I never worked on and won't describe. Worth knowing it existed;
I can't tell you what it contributed.)

## What a link actually means

The largest intellectual honesty problem in all link-based systems, and the
one I'd want stated plainly in any design doc that proposes one:

**A hyperlink is not an endorsement.** It might be navigational ("back to
index"). It might be critical ("this proposal is wrong, see here"). It might
be obsolete, pointing at a document deprecated two years ago. It might be
boilerplate in a template that appears on ten thousand pages. Treating link
structure as a semantic relationship — "these documents are about related
things, and this one vouches for that one" — is an approximation that is
frequently, specifically false.

What the graph path genuinely is, and all I'd claim for it, is **provenance**:
a record of how this document was found and what it hangs off. That's an
honest and useful thing. It supports "this was reachable from a launch
tracker in two hops," which is a real statement about a document's context.
It does not support "this document is endorsed by that tracker," and systems
that quietly upgrade the first claim into the second produce ranking that
feels arbitrary — because it is.

The graded-text-budget idea above is a good example of respecting that limit.
It uses graph distance to allocate *resources*, which is a defensible use of
a weak signal, rather than to assert *relevance*, which would be overreach.

## Why no graph database was needed

Step back and look at what was actually required of the graph, and the
absence of a graph database stops looking like an omission:

- **The traversal was bounded and known in advance.** Breadth-first, from
  fixed roots, to a fixed depth. That's not arbitrary traversal — it's a
  fixed-iteration batch job.
- **Freshness requirements were batch-shaped.** The corpus is recomputed on a
  schedule. Nothing needed a millisecond answer to a graph question.
- **The consumer wanted flat features, not paths.** By serving time, the
  index needed a generation number, a path string, some counts, and a score —
  scalars on a document, precisely as
  [the projection model predicts](/blog/search-index-not-source-of-truth/).
  Nobody queried the graph at request time. The graph's entire output was
  five or six columns.
- **The data was already in the warehouse.** The edges came from the same
  pipeline as everything else. Adding a graph database would have meant
  another system to sync, secure, monitor, and reconcile — for computations
  that were already a few joins in Spark.

That last point is the real argument, and it generalizes past graphs. A new
piece of infrastructure has to earn its keep against the cost of *existing*:
another failure domain, another schema to evolve, another thing that can be
stale in a way nobody notices. Precomputing five columns in a pipeline you
already run is an enormously high bar for a new database to clear.

## When you should buy one

I don't want to leave the impression that graph databases are a mistake.
There are conditions where the design above falls apart, and they're
recognizable:

**Interactive traversal of arbitrary shape.** If users compose queries you
didn't anticipate — "show me everything within three hops of this, filtered
by type, sorted by recency" — you can't precompute the answers, and you need
an engine that traverses at query time.

**Path queries as the product.** If the *path* is what the user wants —
shortest path between two entities, all routes between systems, cycle
detection — that's a graph database's home turf, and expressing it as
repeated joins is masochism.

**Rapidly changing edges with tight freshness.** Batch recomputation assumes
the graph is stable between runs. If edges change constantly and those
changes must be immediately visible, you want a store designed for
incremental graph mutation.

**Transactional graph updates.** If edges must be written and read
consistently as part of an application's workflow, a batch projection isn't a
serving layer.

The Hulu platform I wrote about years ago is the counterexample in my own
history — there,
[Neo4j and Cypher](/blog/hulu-pipeline-neo4j-cypher-graph-queries/) genuinely
earned their place, because the questions being asked were interactive,
arbitrary, and path-shaped: engineers troubleshooting a pipeline needed to
explore dependency structure at 3am, not read a precomputed column. Same
underlying data model, opposite access pattern, opposite conclusion.

That's the test I'd apply, and it isn't "how graphy is my data?" It's:
**are the traversals bounded and known in advance, and can they be
answered in batch?** If yes, you have a graph *modeling* problem, and edge
tables plus iterative jobs will serve you well. If no — if the questions are
composed at query time — buy the database, because you'll otherwise
reimplement one badly.

## The takeaway

Everything in this post follows from treating the graph the same way the
series treats indexes: as a projection built to answer a specific, known set
of questions. Bounded traversal, edge tables, a generation number doing
quadruple duty, and an authority score simple enough to argue about.

The trap worth naming is the one where "we need a knowledge graph" becomes
"we need a graph database," and a team spends a quarter standing up
infrastructure to compute what a batch job could have produced as five
columns. A graph is a way of thinking about your data. Occasionally it's also
a purchase order — but only when the questions arrive faster than you can
precompute the answers.

Next in this series: chunking as information architecture — the last
projection decision before retrieval becomes a language-model problem.
