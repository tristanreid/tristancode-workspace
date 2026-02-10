# Mergeable Operations in Distributed Computation — Research Notes

Research for the planned blog post/series: **Mergeable Operations in Distributed Computation** (see `DEVELOPMENT.md`).

---

## Core Thesis

The most powerful data structures for distributed computing aren't the most precise — they're the ones whose operations **compose cleanly across machine boundaries**. If you can split a computation across N machines, compute independently, and combine the results to get the same answer as if you'd computed on one machine, you have a mergeable operation. Understanding which operations are mergeable — and which aren't — is the key to thinking about scalable computation.

---

## What Makes an Operation Mergeable?

An operation is mergeable when it satisfies two properties:

1. **Associativity**: `merge(merge(a, b), c) = merge(a, merge(b, c))` — grouping doesn't matter
2. **Commutativity** (often but not always required): `merge(a, b) = merge(b, a)` — order doesn't matter

Together with an identity element, this gives you a **commutative monoid** — but the blog should make people *feel* this without reaching for abstract algebra.

### Intuitive examples

| Operation | Mergeable? | Why / Why Not |
|---|---|---|
| `sum(a, b)` | Yes | Split across machines, sum partial results |
| `max(a, b)` | Yes | Max of maxes = max of all |
| `min(a, b)` | Yes | Same as max |
| `count(a, b)` | Yes | Count is just sum of 1s |
| `union(a, b)` | Yes | Union of unions = union of all |
| `intersection(a, b)` | Yes | Intersection of intersections = intersection of all |
| `mean(a, b)` | **No** | Mean of means ≠ mean of all (unless you also carry counts) |
| `median(a, b)` | **No** | Median of medians ≠ median of all |
| `percentile(a, b)` | **No** | Same problem as median |

The **mean** example is particularly instructive: it's *almost* mergeable. If you carry `(sum, count)` pairs instead of just the mean, you *can* merge: `(sum₁ + sum₂, count₁ + count₂)`. This is a common pattern — making non-mergeable operations mergeable by carrying more state.

---

## Case Studies from the Codebase

### 1. HyperLogLog (HLL) — Approximate Distinct Count

**Already covered in the existing HLL blog series**, but connects directly to this narrative.

The HLL merge operation is element-wise max of registers. It's trivially parallelizable: you can count unique visitors across 1,000 servers and combine the results with no coordination.

**From the codebase** (`repos/pcra-dse/workflows/productinsights/`):

HLL sketches are used for approximate distinct counts in Druid ingestion. The `HLLSketchMerge` aggregation type appears throughout the Druid ingestion specs:

```json
{
  "type": "HLLSketchMerge",
  "name": "account_id_hll",
  "fieldName": "account_id_hll8_16",
  "lgK": 8,
  "tgtHllType": "HLL_4"
}
```

**Key properties**:
- Merge = element-wise `max()` of register arrays
- Associative and commutative
- Approximate: trades exactness for massive scalability
- Compact: fixed-size regardless of cardinality

### 2. Trie — Broadcast + Local Scan

**Covered in detail in `notes/trie-data-structure-research.md`**, but the mergeable angle is distinct.

The Trie itself isn't merged in the traditional sense — it's **replicated**. The pattern:

1. Build the trie on the driver
2. Broadcast it (serialize once, deserialize on each executor)
3. Each executor scans its partition of documents locally
4. Results (entity scores) are collected back — these *are* mergeable (sums of scores)

This illustrates an important variant: sometimes the best strategy for distributed computation isn't merging the data structure itself, but making it **cheap to replicate** and merging only the outputs.

However, the **tie-breaker function** in `GenericTrie` is a genuine merge operation:

```scala
// AlternateTitleFrequencyCount.scala lines 35-36
val tieBreaker = (a: AlternateTitleDescList, b: AlternateTitleDescList) =>
  AlternateTitleDescList(a.title_desc, a.show_title_ids ++ b.show_title_ids)
```

This merges two values that map to the same key by concatenating their ID lists. The operation is associative and commutative (list concatenation is associative; for this use case, order doesn't matter). This is a **monoid** operating at insert time.

And Tries themselves *could* be merged — you could build partial tries on different machines and merge them node-by-node. The blog could explore this as a thought experiment, even though the codebase uses broadcast instead.

### 3. Entity Scores — Sum as Merge

The entity scoring pipeline in `EntityScoreNetflixShow.scala` demonstrates mergeable aggregation:

```scala
val findMatches = (s: String) =>
  (ignoreCaseBroadcastedTrie.value.allMatches(s).map { case (value, _) => value }
   ++ broadcastTrie.value.allMatches(s).map { case (value, _) => value })
    .groupBy(_.show_title_id)
    .mapValues(_.map(_.score).sum)  // ← sum is mergeable
    .toSeq
```

Multiple matches for the same entity are combined by **summing** their scores. Sum is the simplest mergeable operation — it doesn't matter whether you sum all scores at once or sum partial groups and then sum the subtotals.

The final SQL aggregation continues this pattern:
```sql
sum(score * (50 * (1.0 + coalesce(talent_score, 0)))) as score
```

### 4. HLL in Druid — Pre-Aggregation + Merge at Query Time

The Druid HLL ingestion specs in `repos/pcra-dse` show a two-phase merge:

**Ingestion time**: Raw events are sketched into HLL registers per partition
**Query time**: `HLLSketchMerge` combines registers across partitions and time segments

This is the same principle as MapReduce: the "map" phase builds per-partition sketches, the "reduce" phase merges them. The key insight is that the merge happens at *query time*, not ingestion time — so the same pre-aggregated data can answer different queries with different groupings.

Files demonstrating this pattern:
- `workflows/productinsights/test/h2d.druid_hll_test_precalculated.py`
- `workflows/launchpad/launchpad_pc_cumulative/h2d.py`
- `notes_and_examples/conditional_sketch.json`
- `notes_and_examples/conditional_sketch_multititle.json`

---

## Algebird and the Twitter/Scalding Ecosystem

Oscar Boykin's [Algebird](https://github.com/twitter/algebird) deserves significant coverage. It's a Scala library that provides abstract algebraic structures (monoids, groups, rings) designed for aggregation in distributed systems.

### Key Algebird types relevant to this series

| Type | Merge Operation | Use Case |
|---|---|---|
| `HyperLogLogMonoid` | Element-wise max of registers | Approximate distinct count |
| `CountMinSketch` | Element-wise addition of cells | Approximate frequency |
| `BloomFilter` | Bitwise OR | Approximate set membership |
| `DecayedValue` | Weighted combination | Time-decayed aggregation |
| `Moments` | Algebraic combination | Streaming mean, variance, skewness |
| `QTree` | Merge quantile trees | Approximate quantiles (making quantiles "almost mergeable") |

### Why Algebird matters for the narrative

Algebird takes the intuition "some operations can be split and recombined" and makes it rigorous. The `Monoid` typeclass gives you a `plus` operation and a `zero` element — if your aggregation is a Monoid, it automatically works with Scalding's `sumByKey`, `aggregate`, and `reduce`.

**Personal experience note** (from DEVELOPMENT.md): "worked with Algebird + Scalding and found it genuinely fascinating — the library makes the algebra practical rather than theoretical"

### Blog angle

Algebird is fascinating *further reading*, not a prerequisite. The blog should make readers understand mergeability through concrete examples first, then reveal that there's a whole mathematical framework (and a practical library) that formalizes the pattern.

---

## Sketches and Approximate Data Structures

A major theme: the most scalable data structures trade **exactness for mergeability**.

| Data Structure | What It Approximates | Merge Operation | Error Bound |
|---|---|---|---|
| HyperLogLog | Distinct count | Element-wise max | ~1.04 / √(2^p) |
| Count-Min Sketch | Frequency | Element-wise add | ε with probability 1-δ |
| Bloom Filter | Set membership | Bitwise OR | False positive rate p |
| T-Digest / Q-Digest | Quantiles | Merge sorted centroids | Configurable accuracy |
| Top-K (SpaceSaving) | Heavy hitters | Merge and trim | Guaranteed for items above threshold |

All of these are **monoids**: they have an associative merge operation and an identity element (empty sketch). This is what makes them work in MapReduce, Spark, Druid, and stream processing.

---

## The Map/Reduce Connection

The blog should build from first principles:

1. **You have more data than fits on one machine** — you need to split it
2. **The "map" step** is embarrassingly parallel: apply a function to each partition independently
3. **The "reduce" step** is where mergeability matters: combine partial results
4. **If your reduce operation is associative and commutative**, you can:
   - Reduce in any order
   - Reduce in parallel (tree reduction)
   - Reduce incrementally (streaming)
   - Re-reduce after adding new data
5. **If it's not**, you need tricks:
   - Carry more state (mean → (sum, count))
   - Use approximate data structures (median → T-Digest)
   - Accept a global shuffle (exact median requires seeing all data)

---

## Blog Series Structure Ideas

### Option A: Single Long Post

"Mergeable Operations: The Key to Distributed Computation"
- Start with the intuition: max is mergeable, median isn't
- HLL as a case study (connect to existing series)
- Trie as a case study (connect to planned series)
- Algebird as the "if you want to go deeper" section
- The broader lesson: approximation enables composition

### Option B: Multi-Part Series

**Part 1: "Split, Process, Combine"**
- The fundamental pattern of distributed computation
- Which operations survive the split? Intuitive examples
- The mean trick: carrying more state to enable merging

**Part 2: "Sketches — Trading Precision for Scalability"**
- HLL, Count-Min Sketch, Bloom Filter
- Why approximate data structures dominate big data
- The common thread: all mergeable, all monoids

**Part 3: "Algebird — When Abstract Algebra Becomes Practical"**
- The Monoid abstraction: `zero` + `plus`
- How Algebird + Scalding made MapReduce pipelines algebraic
- Personal experience and why it was genuinely exciting

**Part 4: "The Trie as a Distributed Data Structure"**
- Broadcast vs. merge strategies
- The tie-breaker as a merge operation
- When replication beats aggregation

### Option C: Hybrid

A single "pillar" post that covers the intuition and examples, with optional deep-dive posts on Algebird and specific data structures. This matches the tone goal: "accessible and intuitive, not academic."

---

## Interactive Component Ideas

- **Merge visualizer**: Two machines, each with a partial result. Show how different operations merge (or fail to merge). Let the reader pick operations and see whether the distributed result matches the centralized one.
- **Sketch simulator**: Build up an HLL / Bloom filter interactively, merge two of them, show the approximate vs. exact result
- **Monoid playground**: Given a set of values and an operation, show whether it forms a monoid (associativity test, identity check)
- **MapReduce simulator**: Split a dataset across N machines, apply map + reduce, show how the result depends on whether reduce is mergeable

---

## Connections to Other Planned Series

- **HLL series** (existing): HLL is the poster child for mergeable data structures — the merge series should reference the HLL series extensively
- **Trie series** (planned): Tries demonstrate the "replicate read-only, merge outputs" variant of distributed computation
- **Entity Resolution series** (planned): Entity scoring uses sum (mergeable) as its aggregation; the pipeline demonstrates the broadcast+scan pattern
- **Hulu Pipeline series** (in progress): The Hulu pipeline's MapReduce jobs were an early encounter with distributed computation patterns

---

## Tone and Audience Notes

From `DEVELOPMENT.md`:
> - Accessible and intuitive, not academic
> - Use concrete examples: "imagine you have 100 servers each counting visitors..."
> - Reference Algebird and abstract algebra as fascinating further reading, not as prerequisites
> - The reader should come away understanding *why* mergeability matters without needing an algebra textbook

The target reader has programming experience but may not have worked with distributed systems. The blog should create "aha moments" — making the reader realize that mergeability is the hidden design constraint behind every choice in distributed data processing.

---

## Source File Reference

| File | Key Content |
|---|---|
| `repos/pcra-dse/.../EntityScoreNetflixShow.scala` | Sum-based score merging, broadcast trie pattern |
| `repos/pcra-dse/.../AlternateTitleFrequencyCount.scala` | Tie-breaker as merge operation (list concatenation monoid) |
| `repos/pcra-dse/.../package.scala` | `FieldEntityScore` — the scored output that gets summed |
| `repos/pcra-dse/.../h2d.druid_hll_test_precalculated.py` | HLLSketchMerge in Druid ingestion |
| `repos/pcra-dse/.../h2d.druid_hll_smaller_test_precalculated.py` | More HLL merge examples |
| `repos/pcra-dse/.../launchpad_pc_cumulative/h2d.py` | HLL for cumulative accounts |
| `repos/pcra-dse/notes_and_examples/conditional_sketch.json` | HLL aggregation in Druid queries |
| `repos/pcra-dse/notes_and_examples/conditional_sketch_multititle.json` | Multiple HLL merge aggregations |
| `repos/cau-lib-core/.../core/data/trie.py` | Trie with accumulative values (List[T]) |
| `repos/pcra-dse/.../util/GenericTrie.scala` | Trie with tie-breaker merge |
| `repos/pcra-dse/km-python/shared/generic_trie.py` | Python trie with tie-breaker |
| `interactive/src/hll-sim.ts` | Existing HLL simulation (for cross-reference) |

---

## External References

- [Algebird](https://github.com/twitter/algebird) — Twitter's abstract algebra library for Scala
- [Scalding](https://github.com/twitter/scalding) — Scala MapReduce framework that uses Algebird
- Oscar Boykin — Algebird's primary author; several talks on "Abstract Algebra for Analytics"
- [Add ALL the Things: Abstract Algebra Meets Analytics](https://www.youtube.com/watch?v=BDi0tMVMpqE) — Avi Bryant's Strata talk on monoids in analytics
- Apache DataSketches — Java library of mergeable sketch data structures (HLL, CMS, Theta, KLL, etc.)
