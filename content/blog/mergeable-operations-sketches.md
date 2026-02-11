---
title: "Sketches: Trading Precision for Scalability"
description: "HyperLogLog, Count-Min Sketch, Bloom filters, and T-Digest — the approximate data structures that dominate big data all share one property: they merge."
weight: 20
series: "Mergeable Operations in Distributed Computation"
skin: graph
---

In the [previous post](/blog/mergeable-operations-split-process-combine/), we saw that the key to distributed computation is mergeability: can you split a computation across machines, compute independently, and combine the results? Some operations — sum, max, union — merge naturally. Others — mean, median, percentiles — don't.

But here's the twist: some of the operations that *seem* unmergeable have approximate versions that merge beautifully. And these approximate versions aren't compromises — they're the dominant data structures in modern big data systems.

This post is about **sketches**: compact, fixed-size data structures with bounded error and mergeable operations. They trade a small amount of precision for the ability to work at any scale.

---

## What Makes a Sketch

Every sketch shares three properties:

1. **Fixed or bounded memory** — the size doesn't grow with the amount of data
2. **A mergeable operation** — combine two sketches and get the same result as if you'd processed all data through one
3. **Bounded error** — the approximation has a mathematical guarantee, not just a hope

This combination is what makes sketches so powerful. A sketch can process a billion items on a laptop, ship the result in a few kilobytes, merge it with sketches from a thousand other machines, and produce an answer that's provably within a known error bound.

Let's walk through the four most important ones.

---

## HyperLogLog — "How Many Unique?"

We covered HLL extensively in the [HyperLogLog series](/blog/hll-counting-unique-items-part1/), so this is a brief recap through the lens of mergeability.

**The problem**: How many distinct items have I seen? (Unique visitors, unique queries, unique IPs.)

**The exact solution**: Keep a set of every item you've seen. Memory grows linearly with the number of distinct items — untenable at billions.

**The sketch**: Hash each item. Use the first few bits to assign it to a register. Track the longest run of leading zeros in the remaining bits. From the pattern of longest runs across all registers, estimate the distinct count.

**Memory**: Fixed. 1,024 registers × 6 bits = 768 bytes, regardless of whether you've seen a thousand items or a billion.

**Merge**: Element-wise max of registers.

```
Sketch A: [3, 5, 2, 7, 1, 4, ...]
Sketch B: [4, 2, 6, 3, 5, 1, ...]
Merged:   [4, 5, 6, 7, 5, 4, ...]
```

The max of two registers preserves the "longest run seen" from either source — exactly the same as if every item had been processed through a single sketch.

**Error**: Standard error ≈ 1.04 / √m, where m is the number of registers. With 1,024 registers: ~3.2%. With 16,384: ~0.8%.

**Why it dominates**: Every major analytics system — Druid, BigQuery, Redis, Presto, ClickHouse — uses HLL for approximate distinct counts. The reason isn't just that it's small. It's that the merge is trivial, which means you can pre-aggregate during ingestion and re-aggregate at query time with different groupings.

---

## Count-Min Sketch — "How Often?"

**The problem**: How many times has a specific item appeared? (Top search queries, frequent IP addresses, popular products.)

The exact solution — a hash map from items to counts — works fine until you have billions of distinct items and need to count across a thousand machines.

**The sketch**: A two-dimensional array of counters (d rows × w columns) with d independent hash functions. To add an item, hash it with each function and increment the corresponding cell in each row. To query, hash the item with each function and take the *minimum* across rows.

```
Adding "apple" (hashes to columns 3, 7, 1 in each row):

Row 0:  [0, 0, 0, 1, 0, 0, 0, 0]    ← increment position 3
Row 1:  [0, 0, 0, 0, 0, 0, 0, 1]    ← increment position 7
Row 2:  [0, 1, 0, 0, 0, 0, 0, 0]    ← increment position 1
```

Collisions happen — other items hash to the same cells, inflating the counts. But the minimum across rows limits the damage, because it's unlikely that every hash function collides for the same item.

**Memory**: Fixed. d × w counters. Typical: 5 rows × 2,000 columns = 10,000 counters ≈ 40KB.

**Merge**: Element-wise addition.

```
Sketch A cells: [3, 0, 5, 2, ...]
Sketch B cells: [1, 4, 0, 3, ...]
Merged:         [4, 4, 5, 5, ...]
```

Addition is the natural merge for counters — if sketch A saw an item 3 times and sketch B saw it 5 times, the merged sketch should reflect 8 occurrences. Since every cell is a sum of the counts that hash to it, adding two sketches' cells gives the same result as processing all items through one sketch.

**Error**: The sketch *overestimates* counts but never underestimates. The overestimate is bounded: with probability at least 1 - δ, the error is at most εN, where N is the total count and ε and δ are determined by the sketch dimensions. Wider sketches (more columns) reduce ε; more rows reduce δ.

**Why it matters**: Count-Min Sketch is the workhorse behind heavy-hitter detection. "Which search queries are trending?" "Which IPs are sending the most traffic?" "Which products are being viewed most this hour?" Any question of the form "what are the top K most frequent items?" can be answered with a CMS — across any number of machines, with a simple merge.

---

## Bloom Filters — "Have I Seen This?"

**The problem**: Is this item in the set? (Duplicate detection, cache bypass, spell checking.)

The exact solution — a hash set — works until the set has billions of members and needs to be checked on every request.

**The sketch**: A bit array of m bits, initialized to all zeros, with k hash functions. To add an item, compute k hash positions and set those bits to 1. To check membership, compute the same k positions — if all bits are 1, the item is *probably* in the set. If any bit is 0, the item is *definitely* not.

```
Adding "cat" (hashes to positions 2, 5, 11):

Bits: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
              ^           ^                    ^

Checking "dog" (hashes to positions 3, 5, 9):

Bits: [0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
                 ^        ^              ^
Position 3 is 0 → "dog" is definitely NOT in the set  ✓
```

**Memory**: Fixed. A Bloom filter with 1% false positive rate uses about 10 bits per item. For a million items: ~1.2 MB. For a billion: ~1.2 GB (still much smaller than storing the items themselves).

**Merge**: Bitwise OR.

```
Filter A bits: [0, 1, 1, 0, 0, 1, 0, 0]
Filter B bits: [1, 0, 1, 0, 1, 0, 0, 0]
Merged:        [1, 1, 1, 0, 1, 1, 0, 0]
```

If an item is in *either* filter, its bit positions are set in the merged filter. OR is associative, commutative, and the identity is all-zeros — a textbook merge.

**Error**: False positives (says "yes" when the answer is "no") but **no false negatives** (never says "no" when the answer is "yes"). The false positive rate increases as the filter fills up, and increases further after merging (because more bits are set). This is the one sketch where merging degrades quality — but the degradation is predictable and bounded.

**Why it matters**: Bloom filters are everywhere. Databases use them to avoid unnecessary disk reads. CDNs use them to decide which items to cache. Web crawlers use them to avoid re-visiting URLs. Network routers use them for packet classification. The merge operation means you can build per-partition filters and combine them — useful for distributed duplicate detection, where each machine tracks what it's seen and the merged filter represents what *anyone* has seen.

---

## T-Digest — "What's the Median?"

This one is the surprise.

In [Part 1](/blog/mergeable-operations-split-process-combine/), we established that the median is fundamentally not mergeable: the median of partial medians is not the global median. Exact quantiles require seeing all the data in one place.

T-Digest makes quantiles *approximately* mergeable by representing the distribution not as raw data points, but as a collection of **centroids** — weighted summary points that capture the shape of the distribution.

**The idea**: Instead of storing every value, cluster nearby values into centroids. Keep centroids small (high precision) near the edges of the distribution (where quantiles like p1, p50, p99 live) and allow them to be larger (lower precision) in the middle. This gives the best accuracy exactly where you need it most — at the tails.

**Memory**: Bounded. A T-Digest with a compression factor of 100 (typical) uses a few hundred centroids, regardless of how many data points it's seen.

**Merge**: Combine the centroid lists from both digests and re-compress.

```
Digest A centroids: [(mean=2.1, weight=50), (mean=5.3, weight=120), ...]
Digest B centroids: [(mean=1.8, weight=30), (mean=5.5, weight=90), ...]

Merged: combine all centroids, sort, re-compress into bounded size
```

The re-compression step is what makes this work: it merges nearby centroids while respecting the "high precision at the edges" constraint. The result is a bounded-size digest that approximates the combined distribution.

**Error**: The error is smallest at extreme quantiles (p1, p99) and largest near the median — which is the opposite of what you might expect, but exactly what most applications want. "What's the p99 latency?" is a far more common question than "what's the exact median?"

**Why it matters**: T-Digest is the "carry more state" pattern from Part 1, taken to its logical extreme. We said you can make the mean mergeable by carrying `(sum, count)` instead of just the mean. T-Digest carries enough state to reconstruct the *entire approximate distribution* — and that makes every quantile query mergeable.

This is the data structure behind approximate percentiles in Elasticsearch, Druid, and Apache DataSketches. When someone asks "what's the p95 response time across all servers?" the answer almost certainly comes from merging T-Digest sketches.

---

## The Pattern

Step back and look at what these four data structures have in common:

| Sketch | Question | Merge Op | Error Type |
|---|---|---|---|
| HyperLogLog | How many unique? | element-wise max | ±% of true count |
| Count-Min Sketch | How often? | element-wise add | overestimate only, bounded |
| Bloom Filter | Have I seen this? | bitwise OR | false positives only, bounded |
| T-Digest | What percentile? | combine + compress | bounded, tightest at extremes |

Four different questions. Four different internal representations. But the same three-part contract:

1. **Fixed memory** — the sketch doesn't grow with the data
2. **Bounded error** — the approximation has a mathematical guarantee
3. **Associative, commutative merge** — combine any number of sketches in any order

This contract is why sketches dominate distributed analytics. The fixed memory means you can build a sketch on each machine without worrying about coordination. The merge means you can combine results in any order — in parallel, incrementally, or retroactively. The bounded error means you can tell the user exactly how much precision you traded for that scalability.

And there's a deeper point: every one of these merge operations is **trivially cheap** relative to the query they answer. Merging two HLL sketches is O(m) — a few thousand comparisons. Merging two Bloom filters is a single bitwise OR. The cost of the merge is negligible compared to the cost of processing the raw data. This is what makes the "pre-aggregate at ingestion, merge at query time" pattern so effective.

---

## The Trade-Off Is Usually Worth It

There's an honest question here: is approximation actually good enough?

For most applications, overwhelmingly yes.

- A **3% error** on a distinct count of 50 million is ±1.5 million. When you're deciding whether to scale up infrastructure or prioritize a feature, the difference between 48.5M and 51.5M doesn't change the decision.

- A **p99 latency** that's within 1% of the true value is indistinguishable from exact for alerting and capacity planning.

- A Bloom filter with a **1% false positive rate** means 99 out of 100 negative results are correct, and you can always double-check the positive ones with an exact lookup.

The cases where exact answers matter — financial reconciliation, legal compliance, billing — are real but relatively rare compared to the vast landscape of analytics, monitoring, and feature development where "close enough" is more than enough.

The sketches aren't a compromise. They're a design choice: give up a little precision and gain the ability to operate at any scale, with any partitioning, with trivial merges. For most questions, that's not just acceptable — it's optimal.

---

## What These Structures Have in Common (Formally)

Every sketch we've seen has an associative merge operation with an identity element (the empty sketch). In mathematics, this structure has a name — but we've been careful not to front-load the formalism.

In the [next post](/blog/mergeable-operations-algebird/), we'll name it. We'll look at a library that takes this pattern and makes it a first-class abstraction: define the merge for your data type, and get distributed computation for free. It turns out the abstract algebra is not just theoretically elegant — it's the most practical tool in the distributed engineer's toolkit.

---

*Next: [When Abstract Algebra Becomes Practical](/blog/mergeable-operations-algebird/)*
