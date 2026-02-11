---
title: "Split, Process, Combine"
description: "Why some operations survive being distributed across a thousand machines — and why others break. The hidden design constraint behind every choice in distributed data processing."
weight: 10
series: "Mergeable Operations in Distributed Computation"
skin: graph
---

You have a billion rows of data and a simple question: *how many unique visitors came to the site today?*

The data is spread across a hundred machines. Each machine has its own shard. You can't bring it all to one place — there's too much.

So you split the problem:

1. **Split**: each machine processes its own shard
2. **Process**: compute a partial answer locally
3. **Combine**: merge the partial answers into a final result

This is the fundamental pattern of distributed computation. MapReduce, Spark, Flink, Druid — they all do this. And the pattern works beautifully for some operations. For others, it breaks.

The difference is **mergeability**: whether partial results can be combined to produce the same answer as processing everything in one place. Understanding which operations are mergeable — and which aren't — is the most important design constraint in distributed data processing.

---

## The Operations That Work

Start with the simple ones:

| Operation | Distributed? | Why |
|---|---|---|
| **Sum** | Yes | Sum of the partial sums = sum of everything |
| **Max** | Yes | Max of the partial maxes = max of everything |
| **Min** | Yes | Min of the partial mins = min of everything |
| **Count** | Yes | Count is just a sum of 1s |
| **Union** | Yes | Union of the partial sets = union of everything |

These operations share a property: it doesn't matter how you split the data, or in what order you combine the results. The answer is always the same.

Imagine three machines, each with a subset of page-view counts:

```
Machine A: [7, 3, 9]    →  max = 9
Machine B: [2, 14, 1]   →  max = 14
Machine C: [5, 8, 6]    →  max = 8

Combined max: max(9, 14, 8) = 14  ✓
Actual max:   max(7, 3, 9, 2, 14, 1, 5, 8, 6) = 14  ✓
```

Max of maxes = max of all. You could split the data across two machines or two thousand — the answer doesn't change.

---

## The Operations That Break

Now try the mean:

```
Machine A: [7, 3, 9]    →  mean = 6.33
Machine B: [2, 14, 1]   →  mean = 5.67
Machine C: [5, 8, 6]    →  mean = 6.33

Combined mean: mean(6.33, 5.67, 6.33) = 6.11  ✗
Actual mean:   mean(7, 3, 9, 2, 14, 1, 5, 8, 6) = 6.11  ✓ (by coincidence!)
```

This happens to work here because the partitions are the same size. Change that and it breaks:

```
Machine A: [7, 3, 9, 2, 14]   →  mean = 7.0
Machine B: [1]                 →  mean = 1.0
Machine C: [5, 8, 6]          →  mean = 6.33

Combined mean: mean(7.0, 1.0, 6.33) = 4.78  ✗
Actual mean:   mean(7, 3, 9, 2, 14, 1, 5, 8, 6) = 6.11  ✗
```

The mean of the means is *not* the mean of all. The small partition's mean gets equal weight with the large partition's mean, which skews the result.

Median is even worse:

```
Machine A: [1, 2, 100]    →  median = 2
Machine B: [3, 4, 5]      →  median = 4
Machine C: [6, 7, 8]      →  median = 7

Combined median: median(2, 4, 7) = 4  ✗
Actual median:   median(1, 2, 3, 4, 5, 6, 7, 8, 100) = 5  ✗
```

There's no trick that makes the median of the medians equal the global median. Exact median requires seeing all the data in one place — and that means a global shuffle, the most expensive operation in distributed computing.

---

## The Mean Trick: Carrying More State

The mean isn't naturally mergeable, but it can be *made* mergeable. The trick: instead of carrying just the mean, carry the `(sum, count)` pair:

```
Machine A: [7, 3, 9, 2, 14]   →  (sum=35, count=5)
Machine B: [1]                 →  (sum=1,  count=1)
Machine C: [5, 8, 6]          →  (sum=19, count=3)

Combined: (35+1+19, 5+1+3) = (55, 9)  →  mean = 55/9 = 6.11  ✓
```

Both sum and count are individually mergeable, so the pair is too. You recover the exact mean by dividing at the end.

This is a recurring pattern in distributed systems: **make non-mergeable operations mergeable by carrying more state**. You'll see it again with approximate quantiles — where "more state" means carrying enough information to reconstruct an approximate distribution.

---

## Two Rules

What makes an operation mergeable? Two properties:

**Associativity** — grouping doesn't matter:

```
merge(merge(a, b), c) = merge(a, merge(b, c))
```

This means you can reduce partial results in any tree structure — not just left-to-right. That's what enables parallel reduction: a thousand machines can combine results in log₂(1000) ≈ 10 stages instead of 999 sequential steps.

**Commutativity** — order doesn't matter:

```
merge(a, b) = merge(b, a)
```

This means you don't care which machine finishes first. Results can arrive in any order and the final answer is the same.

Sum has both. Max has both. Set union has both. The mean (as a single number) has neither.

There's a third ingredient that's easy to overlook: an **identity element** — a value that doesn't change anything when merged. For sum it's 0. For max it's -∞. For union it's the empty set. This is what lets you start with "nothing" and accumulate results one at a time, or handle the case where a machine has no data.

The combination of these three properties has a name in mathematics — a *commutative monoid* — but you don't need the name to use the idea. You just need to ask: "If I split this computation across machines, can I combine the partial results and get the right answer?"

---

## Case Study: HyperLogLog

In the [HyperLogLog series](/blog/hll-counting-unique-items-part1/), we built a data structure that estimates how many unique items you've seen using about 1.5KB of memory. The core idea: hash each item, track the longest run of leading zeros, and use that as a statistical proxy for the count.

What we didn't emphasize at the time is the property that makes HLL revolutionary for distributed systems: **its merge operation is trivial.**

An HLL sketch is an array of registers, each holding the maximum leading-zero count seen for that register's bucket. To merge two sketches, you take the element-wise maximum:

```
Sketch A registers: [3, 5, 2, 7, 1, 4, 6, 3]
Sketch B registers: [4, 2, 6, 3, 5, 1, 2, 8]

Merged:             [4, 5, 6, 7, 5, 4, 6, 8]
```

That's it. Element-wise max. The merged sketch is exactly the sketch you would have gotten by processing all items from both sources into a single sketch. It's associative, commutative, and the identity element is an array of zeros.

This means you can:
- Count unique visitors across 1,000 web servers and combine the results with no coordination
- Pre-aggregate sketches during data ingestion and merge them at query time (this is how [Druid](https://druid.apache.org/) works)
- Store daily sketches and merge them to answer "how many unique visitors this month?" without re-scanning the raw data

The sketch is fixed-size regardless of cardinality. The merge is O(m) where m is the number of registers — typically 1,024 or 16,384. It's the poster child for mergeable data structures.

---

## Case Study: The Broadcast Pattern

Not every distributed pattern involves merging the data structure itself. Sometimes the best approach is **cheap replication**.

In the [Entity Detection series](/blog/entity-detection-the-you-problem/), we built a dictionary-based entity detector: given 100,000 entity names and a million documents, find every mention. The architecture:

1. **Build** a trie containing all entity names (on the driver)
2. **Broadcast** it to every machine (serialize once, deserialize on each executor)
3. **Scan** each machine's partition of documents locally
4. **Collect** the entity scores — and *these* are what get merged

The trie itself isn't merged — it's replicated. But the outputs are:

```scala
.mapValues(_.map(_.score).sum)  // sum is mergeable
```

Multiple matches for the same entity are combined by summing their scores. Sum is the simplest mergeable operation — it doesn't matter whether you sum all at once or sum partial groups and then sum the subtotals.

This illustrates an important variant: when the data structure is read-only and the outputs are simple aggregates, **replication beats aggregation**. Broadcasting a trie is cheaper than trying to merge trie structures across machines. The mergeability requirement falls on the output, not the structure.

That said, tries *could* be merged — you could build partial tries on different machines and combine them node by node. The tie-breaker function in the entity detection pipeline is a genuine merge operation:

```scala
val tieBreaker = (a: AlternateTitleDescList, b: AlternateTitleDescList) =>
  AlternateTitleDescList(a.title_desc, a.show_title_ids ++ b.show_title_ids)
```

When two values map to the same key, their ID lists are concatenated. List concatenation is associative, and for this use case, order doesn't matter. It's a merge operation hiding inside an insert.

---

## Why Mergeability Is the Constraint That Matters

If your operation is mergeable, you get three things for free:

1. **Parallelism**: combine results in a tree structure, not sequentially
2. **Streaming**: process data incrementally, merging new results into a running aggregate
3. **Re-computation**: add new data without reprocessing old data (just merge the new partial result into the existing aggregate)

If your operation is *not* mergeable, you need a **global shuffle** — collecting all data in one place. In Spark, that's a `repartition` or `collect`. In MapReduce, that's the shuffle phase. It's the most expensive operation in distributed computing because it requires moving data across the network, and it's the bottleneck that limits how much you can scale.

Every choice in distributed system design is, at some level, a bet about mergeability. The data structures you choose, the aggregations you compute, the way you partition your data — they all encode assumptions about what can be split and recombined.

---

## What About the Operations That Can't Merge?

The operations that aren't naturally mergeable — median, percentiles, frequency estimation — are exactly the ones where distributed systems get creative. The strategy: replace the exact operation with an approximate one that *is* mergeable.

- **Exact median** requires seeing all data → global shuffle
- **Approximate median** via a T-Digest sketch → element-wise merge of sorted centroids

The approximate versions trade a small amount of precision for the ability to compose. And in most applications, a 99%-accurate median computed in milliseconds across a thousand machines is far more valuable than an exact median that takes minutes because it requires centralizing the data.

In the [next post](/blog/mergeable-operations-sketches/), we'll explore these approximate data structures — HLL, Count-Min Sketch, Bloom filters, and T-Digest — and see how they all follow the same pattern: fixed memory, bounded error, and a merge operation that makes them work at any scale.

---

*Next: [Sketches: Trading Precision for Scalability](/blog/mergeable-operations-sketches/)*
