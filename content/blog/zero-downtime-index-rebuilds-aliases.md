---
title: "Zero-Downtime Elasticsearch Rebuilds with Versioned Indexes and Aliases"
description: "Why rebuilding a search index from scratch is often safer than updating one in place — and the alias-swap lifecycle that makes full rebuilds routine, including the parts that aren't atomic."
weight: 10
series: "From Rows to Retrieval"
series_weight: 120
skin: graph
---

Picture the worst version of a Tuesday. A job that refreshes your search index
is halfway through the corpus when it dies — bad input, a cluster hiccup, an
expired credential, doesn't matter. Nobody gets paged, because search is still
up. It's *answering*, which is worse than being down.

Half the index is Tuesday's data and half is last Tuesday's. Documents deleted
at the source are still in there, cheerfully returned as results, because a
deletion at the source isn't an event your update job ever saw. Retrying the
job re-processes some records and skips others depending on where it died.
Nothing in the system knows the index is in two vintages at once, so nothing
tells you. You find out from a user asking why a result won't go away.

Now the alternative. The refresh writes into a **brand new index** that no
query can reach. If it dies, you delete it and try again — the live index was
never touched, and nobody noticed anything. When it finishes and passes its
checks, one API call redirects every reader to the new index, in a single
atomic step. If the new index turns out to be wrong, the same call points
back.

That second pattern is the subject of this post: versioned physical indexes
behind a stable logical alias. It's how I'd build essentially any search
index fed from batch data, and it follows directly from
[the previous post's argument](/blog/search-index-not-source-of-truth/) that
an index is a *projection*, not the truth. If the index is derived, it's
disposable. If it's disposable, you can throw the whole thing away and build
a new one — which turns out to be the cheapest safety mechanism available.

## Why in-place refreshes are so awkward

In-place updates aren't wrong — near-real-time systems depend on them. But as
a *full-corpus refresh* strategy they have four structural problems, and it's
worth being precise about them, because each one disappears in the rebuild
model.

**Partial state is invisible.** A half-finished update leaves the index in a
state no one designed: internally consistent as far as the engine knows,
semantically a chimera. There's no transaction to roll back and no flag that
says "this index is currently a mixture."

**Deletes are the hard part.** Updating changed records is straightforward.
Noticing that a record *vanished* from the source means diffing the full set
of IDs — at which point you're already doing the work of a full rebuild,
minus its safety. Deletion bugs are the single most common way stale results
survive in an otherwise healthy index.

**Retries aren't idempotent unless you make them so.** Re-running a partially
complete job duplicates work at best; without stable IDs it duplicates
*documents*. (Deterministic IDs derived from a canonical identity are the fix,
and they're a big enough topic that they get their own post — which is also
where the "what is this document, exactly?" question from the last post comes
back to bite.)

**Some changes are impossible in place.** Change how a field is analyzed —
switch a `text` field's analyzer, make a field filterable — and existing
documents don't retroactively acquire the new behavior. The index has to be
rebuilt for the change to mean anything. If rebuilds are scary, this is the
moment your schema calcifies: teams start avoiding mapping changes, and the
index quietly becomes something nobody can improve.

That last point is the one I'd underline. **The value of routine rebuilds
isn't just recovery from failure — it's that schema evolution stops being
frightening.** A team that can rebuild its index on any Tuesday will keep
improving its mappings. A team that can't will still be running the analyzer
choices someone made in a hurry three years ago.

## Logical names and physical indexes

The whole pattern rests on one separation: **the name readers use is not the
name the data lives in.**

Queries address a logical name — `documents`. That name is an alias pointing
at a physical index with a versioned name like
`documents_idx_20250301_120000`. Readers never learn the physical name; it's
an implementation detail that changes every rebuild. The alias is the stable
read contract, and the physical index is a disposable artifact behind it.

{{< themed-svg "/images/search-series/alias-lifecycle" "Alias lifecycle: a logical alias points at a versioned physical index while a replacement builds unseen, then one atomic swap moves the alias and the old index is kept for rollback" >}}

If you've used symlinked release directories for deploys — `current` pointing
at `releases/20250301120000` — this is the same idea, and the same benefits:
build somewhere else, flip a pointer, keep the last one around in case you
need to flip back.

## Build it out of sight

Because the new index serves no traffic while it loads, you can configure it
for one job — ingest speed — and only make it a search index afterward. In a
library I worked on at Netflix for loading warehouse query results into
Elasticsearch, the build phase and the serving phase had deliberately
different settings: during load, refresh disabled, replicas at zero, a larger
translog flush threshold and relaxed durability; after load, replicas
restored and a finite refresh interval put back.

Those specific values were tuned for particular clusters and workloads and I
wouldn't hand them to you as defaults. The principle behind them travels
fine:

> During a controlled rebuild, stop paying for work whose only purpose is
> serving concurrent searches. After loading, restore the redundancy and
> visibility that serving requires.

Every one of those settings is a trade against safety, and it's worth naming
the risk out loud: **with no replicas and relaxed durability, losing a node
mid-load can destroy the half-built index.** That's an acceptable bet only
because of the shape of the pattern — the thing you lose is a disposable
artifact nobody is reading, and the old index is still serving every query
while you rebuild. The same settings applied to a live index would be
reckless. Context is what makes them reasonable.

One caution from experience: the restore step is easy to treat as a
formality, and it isn't. An index promoted with zero replicas is one node
failure away from an outage, and it will serve queries perfectly until that
happens. Restoring search settings belongs *before* the cutover, and whether
it actually took effect belongs in your validation.

## Validate before you swap

Here's where I'll be explicit about registers, because this section is a
recommendation rather than a description.

The implementations of this pattern I've worked with validated modestly
before cutover — chiefly that the new index existed and the load reported
success. That is not enough, and the gap is easy to describe: a rebuild can
succeed mechanically and still produce a bad index. A source table can be
half-populated because an upstream job is late. A connector can silently drop
records it can't coerce. A mapping template can fail to apply, leaving fields
with guessed types. In all three cases the job exits zero, and the alias swap
promotes a broken index in one atomic, unnoticeable step.

The cutover is exactly the right moment for a gate, because it's the last
point where rejecting the build costs nothing. **This is the lesson I would
encode now, and the checks I'd insist on:**

- **A minimum row count** — not "greater than zero," but a floor that would
  catch a half-empty source.
- **Source-to-index reconciliation** — the count the pipeline read versus the
  count the index holds; a gap means dropped writes.
- **Distinct stable-ID count** — catches the duplicate-identity failures that
  a plain row count hides.
- **No rejected bulk writes** — connector-level rejections are frequently
  logged and rarely watched.
- **The expected mapping version actually applied**, so you know your template
  landed and fields aren't dynamically typed.
- **Search settings successfully restored** — replicas back, refresh interval
  finite.
- **Expected shard and replica health** on the new index.
- **Smoke queries** — a handful of known queries with known-good results,
  including one filter, one sort, and one query per field type you care
  about. This is the check that catches analyzer mistakes, and it's the one
  people skip.

Every item on that list is cheap compared to serving a broken corpus, and
each corresponds to a way I've seen a "successful" load go wrong. The
pipeline-monitoring instincts from the
[Hulu data platform series](/blog/hulu-pipeline-email-explosion-monitoring/)
apply here too: a check nobody looks at is not a check, so failures should
block the swap rather than send mail.

## The swap itself

The cutover is one request that removes the alias from the old index and adds
it to the new one, in a single action:

```json
POST /_aliases
{
  "actions": [
    { "remove": { "alias": "documents", "index": "documents_idx_20250301_120000" } },
    { "add":    { "alias": "documents", "index": "documents_idx_20250308_120000" } }
  ]
}
```

This atomicity is the load-bearing property of the whole design. There is no
instant where `documents` resolves to nothing, and no instant where it
resolves to both. An in-flight query either reads the old index or the new
one. Do the same thing as two requests — remove, then add — and you've
created a window, brief and real, where the alias points nowhere and queries
fail. That's the difference between a deploy and an outage, and it's one JSON
array.

Rolled up, the whole flow is about ten lines:

```python
new_index = timestamped_name("documents")

create_index(new_index, mappings=MAPPINGS, settings=INGEST_SETTINGS)
write_snapshot_to_index(snapshot, new_index)
validate_index(new_index, expected=snapshot)   # gate: raise, don't warn
restore_search_settings(new_index)

update_aliases_atomically([
    {"remove": {"alias": "documents", "index": current_index}},
    {"add":    {"alias": "documents", "index": new_index}},
])

retain(current_index, reason="rollback")
delete_unaliased_indexes_older_than(retention_window)
```

## Rollback, retention, and garbage

Keep the previous physical index after the swap. It costs disk and buys you a
rollback that is *the same atomic operation run backwards* — no restore, no
re-run of the pipeline, no waiting. Roll back first, diagnose second. Any
recovery story that starts with "we'll rebuild it, should take about an hour"
is a worse story than "point the alias back."

Retention beyond that previous index is garbage collection, and it needs to
be automatic, because versioned indexes accumulate silently until a disk
watermark makes it everyone's problem. Two rules keep cleanup safe:

1. **Never delete an aliased index.** The alias is the definition of "in
   use," not your bookkeeping.
2. **Only delete indexes matching the controlled naming pattern**, so
   deletion can never wander outside indexes this pipeline created.

Which makes the naming convention load-bearing in a way that's easy to miss:
`documents_idx_<timestamp>` isn't cosmetic. It's what lets automated cleanup
distinguish "an old version of this index" from "someone else's index that
happens to live in this cluster." Sloppy names make automatic deletion
unsafe, which means it doesn't get built, which means someone deletes indexes
by hand at 2am under disk pressure — a moment when mistakes are both likely
and irreversible.

## What is *not* atomic

The most important nuance in this pattern, and the one I'd want a team to
internalize: **only the alias update is atomic. The pipeline is not a
transaction.**

Extracting the snapshot, creating the index, writing distributed data,
restoring settings, validating, swapping, and cleaning up are seven separate
effects, and each can fail independently. A failure between "restore
settings" and "swap" leaves a perfectly good index that nothing points to. A
failure during cleanup leaves extra indexes. A failure mid-write leaves a
partial index — harmless, but only if something eventually deletes it.

So each step needs its own retry and its own idempotence, and the system
needs an answer to "what if we crash *here*?" at every seam. The pattern's
gift is not that failure becomes impossible; it's that **failure becomes
invisible to users**, because everything that can fail happens off to the
side of the thing that's serving traffic. That's a much more achievable goal,
and a much better one.

## When not to do this

Full rebuilds are not universal. Reach for something else when:

- **The corpus is too large to rebuild** in an acceptable window, or the
  storage to hold two copies is prohibitive. (Both limits move: rebuild time
  is often a parallelism problem, and double storage is usually cheaper than
  the incident it prevents. Measure before assuming.)
- **You need near-real-time updates.** If an edit must be searchable in
  seconds, no rebuild cadence will do; you need in-place updates, possibly
  alongside periodic rebuilds that repair the drift they accumulate. That
  hybrid — fast in-place writes, slow authoritative rebuilds — is a common
  and sensible destination.
- **You can't get a consistent snapshot of the source.** The pattern assumes
  the full corpus is available and coherent at build time. Without that, a
  rebuild just freezes an inconsistent moment.

Notice that all three exceptions are about the *source*, not the index. That
follows from the projection framing: what you can do with a derived artifact
depends entirely on your access to what it's derived from. A warehouse that
holds the whole corpus is what makes disposable indexes possible in the first
place.

## The takeaway

If your index is a projection, treat it like one: build a new one, check it,
point at it, keep the old one for a bit, and delete the rest on a schedule.
The pattern is not clever. Its value is that it converts a class of scary,
rare, high-stakes operations — full refreshes, mapping changes, analyzer
experiments — into a boring thing you do on a Tuesday.

That's the real argument for it. Not zero downtime, though you get that.
It's that a team who can rebuild cheaply keeps *improving* the index, and a
team who can't stops touching it. Over a few years, that difference compounds
into a better search system, from nothing more than a naming convention and
a JSON array with two actions in it.

Next in this series: what happens when the documents you're indexing don't
agree about who they are — canonical identity, and why a URL is a locator
rather than a name.
