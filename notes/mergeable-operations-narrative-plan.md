# Mergeable Operations — Narrative Plan

## Series Overview

A three-part series on why some operations compose cleanly across machine boundaries and others don't — and why this distinction shapes every choice in distributed data processing. Ties together the HLL, Trie, and Entity Detection series through the unifying lens of mergeability.

### Series Structure

| Part | Title | Focus |
|------|-------|-------|
| **1** | Split, Process, Combine | The intuition: which operations survive distribution? |
| **2** | Sketches: Trading Precision for Scalability | HLL, Count-Min Sketch, Bloom filters — approximation enables composition |
| **3** | When Abstract Algebra Becomes Practical | Algebird, monoids, and the reveal that everything in Parts 1-2 was algebra all along |

Part 1 builds intuition through everyday examples and case studies from the existing series. Part 2 explores the approximate data structures that dominate big data (and explains why). Part 3 reveals the mathematical framework — Algebird and monoids — as the formalization of what the reader already understands.

### What makes this series distinctive

1. **Capstone**: This series exists because the HLL, Trie, and Entity Detection series already built the case studies. This pulls them together under one idea.
2. **The "aha" structure**: The reader should feel the constraint before learning the name. Monoids come in Part 3, not Part 1.
3. **Concrete first, abstract second**: Every concept is grounded in "imagine you have 100 servers" before any formalism appears.
4. **Personal**: The Algebird section draws on real experience with Scalding at scale.

---

## Part 1: "Split, Process, Combine"

### Narrative Arc

#### 1.1 — The Problem: More Data Than One Machine

- Open with the practical reality: you have a billion rows and one question
- You split the data across N machines. The map step is embarrassingly parallel — apply a function to each partition independently.
- The interesting part: **combining the partial results**. This is where operations diverge.

#### 1.2 — Which Operations Survive?

The core teaching table:

| Operation | Mergeable? | Why / Why Not |
|---|---|---|
| sum | Yes | Sum of sums = sum of all |
| max | Yes | Max of maxes = max of all |
| count | Yes | Count is just sum of 1s |
| union | Yes | Union of unions = union of all |
| **mean** | **No** | Mean of means ≠ mean of all |
| **median** | **No** | Median of medians ≠ median of all |

Linger on mean: it's *almost* mergeable. If you carry `(sum, count)` pairs, you can merge. This is a recurring pattern — making non-mergeable operations mergeable by carrying more state.

#### 1.3 — Case Study: HyperLogLog

- Connect to the HLL series: "In [the HLL series](/blog/hll-counting-the-crowd/), we built a data structure that estimates how many unique items you've seen using just 1.5KB of memory. But we didn't talk about the property that makes it revolutionary for distributed systems: **its merge operation is trivial.**"
- Element-wise max of register arrays. Associative, commutative, constant-size.
- You can count unique visitors across 1,000 servers and combine the results with no coordination.
- HLL merge in Druid: two-phase (ingestion builds per-partition sketches, query time merges them).

#### 1.4 — Case Study: Tries and the Broadcast Pattern

- Connect to the Trie series: not every distributed pattern involves merging the data structure itself
- Sometimes the best strategy is **cheap replication**: build once, broadcast, scan locally, merge only the outputs
- The broadcast + scan pattern from Entity Detection: trie is replicated, entity scores are summed (sum is mergeable)
- The tie-breaker function as a genuine merge operation: when two values map to the same key, concatenate their ID lists
- Thought experiment: you *could* merge tries node-by-node, but broadcasting is better when the structure is read-only and the outputs are simple aggregates

#### 1.5 — The Rules

Two properties that make an operation safe to distribute:
1. **Associativity**: grouping doesn't matter → `merge(merge(a, b), c) = merge(a, merge(b, c))`
2. **Commutativity**: order doesn't matter → `merge(a, b) = merge(b, a)`

Don't name these "monoid" yet — that comes in Part 3.

#### 1.6 — Why This Matters

- If your operation is mergeable, you get parallelism, streaming, and incremental updates for free
- If it's not, you need a global shuffle — and that's the most expensive operation in distributed computing
- Tease Part 2: "But what about operations like distinct count and frequency estimation that *seem* like they shouldn't be mergeable? That's where sketches come in."

### Interactive Component Ideas
- **Merge explorer**: pick an operation (sum, max, mean, median), split a dataset across 2-3 machines, see whether the distributed result matches the centralized one. Highlight the failure cases.
- Could be lightweight — even a static table with a "reveal" interaction might suffice

### Assumptions About the Reader
- Programming experience, probably has used map/reduce or Spark conceptually
- May not have thought about *why* some aggregations work in distributed systems and others don't

---

## Part 2: "Sketches: Trading Precision for Scalability"

### Narrative Arc

#### 2.1 — The Approximation Trade-Off

- The most powerful operations for distributed computing aren't the most precise — they're the ones that merge
- Exact distinct count requires seeing all the data in one place. Approximate distinct count (HLL) merges trivially.
- This isn't a compromise — it's a design philosophy

#### 2.2 — HLL Revisited

- Brief (the HLL series covers this deeply) — focus on the merge operation and why it works
- Element-wise max preserves the "longest streak seen" across all partitions
- Memory is fixed regardless of cardinality — this is what makes merge cheap

#### 2.3 — Count-Min Sketch

- Problem: "how often does item X appear?" — frequency estimation
- The sketch: a 2D array of counters, multiple hash functions, increment cells
- Merge: element-wise addition (just add the counter arrays)
- Overestimates but never underestimates — and the overestimate is bounded
- Use cases: heavy hitter detection, network traffic monitoring

#### 2.4 — Bloom Filters

- Problem: "have I seen this item before?" — approximate set membership
- The sketch: a bit array with multiple hash functions
- Merge: bitwise OR (just OR the arrays together)
- False positives but no false negatives
- Use cases: duplicate detection, cache optimization, spell checkers

#### 2.5 — T-Digest (Approximate Quantiles)

- This is the most surprising entry: remember from Part 1 that median is "not mergeable"?
- T-Digest makes quantiles *approximately* mergeable by representing the distribution as sorted centroids
- Merge: combine the centroid lists and re-compress
- This is the "carry more state" pattern from Part 1, taken further — carry enough state to reconstruct the distribution approximately

#### 2.6 — The Pattern

All of these share three properties:
1. Fixed or bounded memory
2. Associative, commutative merge operation
3. Bounded error with probabilistic guarantees

They all trade exactness for mergeability. And they're all... well, Part 3 will name it.

### Interactive Component Ideas
- **Sketch comparison**: a single dataset processed by HLL, CMS, and Bloom filter. Show each sketch's merge operation side by side.
- **CMS demo**: add items, query frequencies, merge two sketches, show the overestimate behavior
- **Bloom filter demo**: add items, check membership, merge two filters, show false positive rate

### Assumptions About the Reader
- Has read Part 1, understands mergeability and why it matters
- Familiar with HLL from the existing series (or at least from Part 1's recap)

---

## Part 3: "When Abstract Algebra Becomes Practical"

### Narrative Arc

#### 3.1 — The Reveal

- "Every data structure in Part 2, every operation in Part 1 — they all share a mathematical structure."
- A **monoid** is: a set of values, an associative binary operation (`plus`), and an identity element (`zero`)
- That's it. Sum is a monoid (zero is 0). Max is a monoid (zero is -∞). HLL is a monoid (zero is an empty register array).
- Name-drop: "if you carried (sum, count) pairs for mean in Part 1, you were building a **product monoid** without knowing it"

#### 3.2 — Algebird

- Oscar Boykin and Twitter's Algebird library: abstract algebra made practical
- The `Monoid` typeclass: define `zero` and `plus` for your type, and you get Scalding's `sumByKey`, `aggregate`, and `reduce` for free
- Show the type hierarchy: Semigroup → Monoid → Group → Ring
- Key types: `HyperLogLogMonoid`, `CountMinSketch`, `BloomFilter`, `DecayedValue`, `Moments`, `QTree`
- The magic: once your data type is a Monoid, the framework handles distribution, parallelism, and combining automatically

#### 3.3 — Personal Experience

- Working with Algebird + Scalding at scale
- The moment it clicked: "these aren't just data structures — they're algebraic objects, and the algebra is what makes them work"
- Why this was genuinely exciting as an engineer — not because the math is elegant (it is), but because it *works*
- The practical payoff: adding a new metric to a pipeline was trivial if it was a Monoid — define the merge, get distribution for free

#### 3.4 — The Broader Lesson

- The most powerful data structures for big data aren't the most precise — they're the ones whose operations compose
- This is a design constraint hiding in plain sight: when you choose how to aggregate data, you're implicitly choosing whether your system can scale
- The "is this a monoid?" question is the most important question in distributed system design — even if you never use the word

#### 3.5 — Further Reading

- Algebird repo, Oscar Boykin's talks
- Avi Bryant's "Add ALL the Things: Abstract Algebra Meets Analytics"
- Apache DataSketches (Java implementation of mergeable sketches)
- The original papers: Flajolet-Martin, Count-Min Sketch, Bloom 1970

### Tone for This Post
- Still accessible — the reader should feel like they're being let in on a secret, not lectured
- The math is named but not formalized: we say "monoid" and explain what it means, but don't write proofs
- The personal experience section is critical: this isn't abstract appreciation, it's practical testimony

### Assumptions About the Reader
- Has read Parts 1-2 — already understands mergeability, sketches, and the trade-off
- Ready for: the mathematical name for what they've been seeing, and Scala code examples

---

## Narrative Principles

1. **Concrete before abstract**: Every concept starts with "imagine 100 servers" before any formalism. The word "monoid" doesn't appear until Part 3.

2. **Capstone energy**: This series ties together HLL, Tries, and Entity Detection. Cross-references should be generous — reward the reader who's been following along, without excluding newcomers.

3. **The "aha" is the structure**: The three-part arc mirrors the reader's understanding: intuition → examples → "oh, there's a name for this."

4. **Honest about trade-offs**: Approximation is a genuine cost. Don't oversell — explain why it's usually worth it.

5. **Personal in Part 3**: The Algebird section is the one place the series gets personal. Make it count.

---

## Tone and Style

- Conversational, like explaining a pattern you noticed to a curious colleague
- Tables and side-by-side comparisons for "works vs. doesn't work" — make the distinction visual
- Code snippets from the actual codebase where possible (entity scoring, HLL in Druid, trie tie-breaker)
- Skin: TBD — `graph` (matches HLL, Trie, Entity Detection) is the natural choice for continuity
- Follow site conventions: no dates, no tags, `series` field, `weight` for ordering
