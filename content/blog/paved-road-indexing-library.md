---
title: "From One-Off Index Jobs to a Paved-Road Library"
description: "When the same nine-step lifecycle gets retyped for the fifth time, it's time for a library — and the hard part isn't the code, it's choosing defaults that encode real operational learning without hiding one workload's assumptions inside everyone else's job."
weight: 10
series: "From Rows to Retrieval"
series_weight: 180
skin: graph
---

The fifth time you write the same two hundred lines, you notice.

Configure a Spark session and the connector JARs. Derive cluster and
authentication settings for whichever environment this is. Query a warehouse
table. Create a physical index with mappings. Write the DataFrame through the
connector. Change the index settings. Move an alias. Retain or delete the old
indexes.

Every search index in the system needed those steps. Documents, entities,
topics, onboarding content, internal data documentation — each had a workflow
script, and each script contained its own slightly different copy of that
sequence. Copy-paste with drift, which is the most expensive kind.

But the repetition that mattered wasn't the syntax. **It was the lifecycle** —
and specifically the fact that the parts being retyped were the dangerous
parts. Anyone can rewrite a `SELECT`. What was being re-derived, five times,
with five sets of small variations, was the sequence that determines whether
a failed load takes down search. That's the observation that turns "we have
some duplication" into "we need a library."

This closes the first season of this series, and it's the one post about
organizations rather than systems: what happens when a pattern is understood
well enough to be encoded, and what it costs to encode it.

## Extract the lifecycle, not the function

The instinctive extraction is a utility: `write_dataframe_to_index(df, name)`.
That's the wrong seam. It factors out the easy part — the part nobody gets
wrong — and leaves every caller still hand-rolling the risky choreography
around it.

The right unit was the whole thing: **give me SQL and a logical target, and
I'll give you a correctly swapped index.** At Netflix I worked on a library
that did exactly that, and the shape of its main entry point is most of the
design:

```python
load_sql_to_es(sql, alias, mappings=..., settings=..., options=...)
```

Behind that call sits [the entire alias-swap
lifecycle](/blog/zero-downtime-index-rebuilds-aliases/): timestamped physical
index, mappings applied before the write, ingest-oriented settings during
load, search settings restored after, one atomic alias move, previous index
retained, older ones cleaned up.

The invariants it enforces are the ones a team learns the hard way:

- **A rebuild always goes to a new physical index.** Never mutate the live one.
- **Mappings are applied at creation**, before a single document is written,
  because afterward is too late.
- **The alias moves exactly once, atomically.**
- **The previous index survives**, so rollback is a pointer move.

Encoding those four rules is the library's actual product. The Spark
plumbing is incidental.

## Two levels, and an escape hatch that's real

The library had a low-level function and a streamlined wrapper on top. In its
simplest form a caller could write something very close to:

```python
es_load(f"SELECT * FROM {get_table('input')}")
```

Environment, cluster, credentials, and physical table names come from
workflow parameters rather than from arguments — configuration lives in the
control plane, where operations can see and change it, instead of being
baked into application code.

That one-liner is the paved road. What makes a paved road usable, though, is
that the shoulder is paved too. Every layer stayed overridable: mapping and
settings overrides, extra Spark options, extra connector options, a
deterministic ID field, multi-part loads for the big cases, and — crucially —
the low-level function itself, callable directly when the wrapper's
assumptions don't fit.

I'd state that as a rule: **the escape hatch must be a supported interface,
not a fork.** The failure mode for internal platforms isn't that someone
needs to do something unusual; it's that doing something unusual requires
abandoning the library, at which point that team stops receiving every
improvement and bug fix you ship afterward. A team using your low-level API
in a weird way is still your user. A team that copied your module into their
repo and edited it is a future incident.

## Defaults are bets

Here's the tension at the center of this kind of work, and I don't think it
resolves cleanly.

A default encodes learning. Somebody figured out — probably during an
outage — that loading with replicas disabled and refresh turned off is
dramatically faster, and that restoring them before cutover is essential. Now
every job gets that for free, including jobs written by people who've never
heard of a translog. That's the whole promise of a paved road: the tenth team
gets the first team's scars without the bleeding.

But every one of those defaults is a **bet about a workload**, and the bet is
invisible at the call site.

{{< themed-svg "/images/search-series/defaults-as-bets" "Four indexing defaults, the assumption each one encodes, and the situation where that assumption fails: shard count, writer parallelism, replica and refresh settings during load, and automatic deletion of old indexes" >}}

Take the last row, which is my favourite because it's the one where the
library's convenience and its danger are literally the same feature.
Automatic cleanup of old physical indexes is what keeps a cluster from
filling with the residue of a year of rebuilds. It works by matching a naming
pattern. Which means **the naming convention is load-bearing safety
machinery**, and if anyone ever creates an index by hand that happens to
match it, the library will eventually delete their index, correctly, per its
rules.

Or the third row: aggressive ingest settings are safe *because the old index
is still serving*. That reasoning is airtight for a rebuild and doesn't hold
for a first-ever build, where there's no predecessor to fall back on. Same
default, same code, materially different risk — determined by a fact the
library doesn't check.

So the resolution I'd offer isn't "choose better defaults." It's:

> **A default is wisdom that becomes debt the moment it outlives the workload
> it was chosen for. Write the assumption down next to the value.**

Which is the same lesson as [the freshness
post](/blog/freshness-failure-and-the-document-you-serve/), arriving from a
completely different direction — there it was a policy whose justification
expired; here it's a default whose justification was never written down in
the first place. Both fail silently, and both are cheap to prevent with a
sentence of prose next to the number.

## Make the dangerous things loud

Two operations in this library deserved to be harder to invoke than the rest:
deleting old indexes, and multi-part loads that append to an existing target
with upsert semantics instead of rotating a fresh one.

Both are legitimate. Both also break the mental model the rest of the
library establishes — *builds are immutable and disposable* — and a caller
skimming a config option may not notice they've opted out of the safety
property that makes everything else defensible. Anything that removes data or
mutates a live target should be verbose at the call site, loud in the logs,
and impossible to enable by accident.

## Compatibility is part of your API

The most underrated line item in internal-library work: this library's real
interface included Python, Spark, the JDK, the Elasticsearch-Hadoop
connector, the client library, and the server version — a compatibility
matrix, most of which appears nowhere in the function signature.

Upgrade Spark and the connector may not support it. Upgrade the cluster and
the client may go out of range. Every caller inherits that matrix whether or
not anybody documented it, and the library owner becomes the person who
absorbs those transitions on everyone's behalf. That work is unglamorous,
invisible when it goes well, and is a large fraction of what it actually
means to own a paved road. Budget for it, or the road silently becomes
unmaintained and teams start driving around it.

## Testing something that only does side effects

This kind of library is nearly all side effects: create, write, mutate
settings, swap, delete. There's very little pure logic to unit test, which is
exactly why it's tempting to test nothing and rely on it working in
production.

The seam that makes it testable is separating **decisions** from **effects**.
What physical name should this build get? Which index currently holds the
alias? What alias actions does the swap require? What's the deletion set
under this retention policy? Each of those is a pure function you can test
exhaustively — especially the deletion set, where the test you want is the
one asserting that an index *not* matching the pattern is never selected, and
that an aliased index is never selected regardless.

Then the effects layer is a thin adapter over the client, and it's the only
part that needs an integration environment. The bugs that hurt in this
lifecycle are decision bugs — wrong name, wrong swap, wrong deletion — and
those are the ones this split lets you catch cheaply.

## What I'd add now

The gap I'd close first is the one I flagged in [the rebuild
post](/blog/zero-downtime-index-rebuilds-aliases/): **a real validation gate
before cutover.** Row-count floors, source-to-index reconciliation, distinct
ID counts, mapping version, settings actually restored, smoke queries — with
failure blocking the alias move rather than logging a warning. A library that
owns the swap is the perfect place to own the gate, because it's the one
component that knows both what was intended and what landed. Every caller
would inherit it for free, which is precisely the argument for the library in
the first place.

After that: consistent structured metrics on every load (duration, counts
in and out, rejections, which settings were applied), so that "is the index
healthy?" is answerable from the same telemetry everywhere instead of
per-team archaeology.

## Two ways to encode expertise

It's worth contrasting this with the other approach to the same problem,
which I've also built. Years earlier, on Hulu's data platform, we tackled
"lots of teams need to do a similar thing" with
[a domain-specific language](/blog/beaconspec-hulu-dsl-data-pipeline/) and
[an embedded expression language](/blog/hulu-pipeline-mvel-user-jobs/) —
give people a constrained vocabulary and let them express their own logic
inside it.

That's the right move when your users aren't the platform's engineers and
shouldn't have to be: a DSL trades expressiveness for accessibility, and
its ceiling is deliberate. A library is the right move when your users *are*
engineers who could write the code themselves and shouldn't have to write
the *risky* part again. The DSL constrains what can be expressed; the
library standardizes how something dangerous gets done. Different audiences,
different failure modes, same underlying instinct — encode the expertise
once, in the place where it can be improved for everyone.

## Closing the season

The most valuable thing that library did was not sending rows to
Elasticsearch. It was making the lifecycle of a derived projection **boring,
repeatable, and reversible.**

That sentence also sums up the season. We started with the claim that
[a search index is a projection rather than the
truth](/blog/search-index-not-source-of-truth/), and everything since has
been a consequence of taking that seriously: if the index is derived, you can
[rebuild it fearlessly](/blog/zero-downtime-index-rebuilds-aliases/); if it's
assembled from many sources, you need
[canonical identity](/blog/url-is-a-locator-not-an-identity/) and an explicit
[policy for when you can't confirm what you have](/blog/freshness-failure-and-the-document-you-serve/);
its
[entity](/blog/embeddings-dont-know-which-rock/) and
[graph](/blog/knowledge-graph-without-a-graph-database/) features are
projections too; and
[chunking](/blog/chunking-is-information-architecture/) is the projection
decision that determines what can be found at all.

A library like this is what that worldview looks like once an organization
believes it. Not an abstraction over Elasticsearch — an assertion that
building, validating, swapping, and retiring derived data is a *known
procedure* rather than something each team improvises. That's the payoff of
the whole projection framing: it turns the scariest operations in a search
system into a paved road, and then into something nobody thinks about on a
Tuesday.
