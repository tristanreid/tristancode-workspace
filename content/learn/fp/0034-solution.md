---
title: "Solution: Sharing vs Recomputation — The Tree That Is Smaller Than It Looks"
description: "build_shared(20) allocates 21 objects but a plain fold makes 2,097,151 calls over it; memoizing by identity cuts that to 41, but only for folds whose answer depends on the subtree alone and that have no side effects."
lesson_number: 34
track: fp
concept: "Sharing vs recomputation"
stage: 5
layout: solution
role: solution
builds_on: [7, 23, 25, 28, 30]
skin: chalkboard
resources:
  - title: "SICP 1.2.2 — Tree Recursion"
    url: https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-11.html#%_sec_1.2.2
    note: "the classic Fibonacci version of this exact blow-up"
  - title: "Spark RDD Programming Guide — RDD Persistence"
    url: https://spark.apache.org/docs/latest/rdd-programming-guide.html#rdd-persistence
    note: "what cache()/persist() actually promise"
---

### Warm-up recall answer: 8

The seeds go `6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1`. Each seed is emitted *before* stepping, and `1`
triggers `stop` so it is never emitted: `[6, 3, 10, 5, 16, 8, 4, 2]`, **8 elements**. The unfold
stops on a property of the *seed*, not after a fixed count — the seed is the loop's entire state.

---

### Part 1 — Allocations: 21 vs 2,097,151

`build_shared(n)` makes one recursive call and one `Node`, so it allocates `n + 1` objects: 20 `Node`s
plus 1 `Leaf` = **21**.

`build_copied(n)` makes *two* recursive calls per level. With `A(0) = 1` and
`A(n) = 1 + 2·A(n−1)`, you get `A(n) = 2^(n+1) − 1`, so `A(20) = 2^21 − 1 = ` **2,097,151** objects.

Yet every pure fold returns the same answer on both. You cannot tell them apart except by cost (or by
asking `left is right`). That is what "sharing is invisible" means.

---

### Part 2 — The graded answer: 2,097,151

`tree_fold` follows references. At a `Node` it calls itself on `left` and on `right`, and it has no
idea those are the same object. So the call count on `build_shared(n)` obeys the *copied* recurrence,
not the shared one:

```
C(0) = 1                     # a Leaf: one call
C(n) = 1 + C(n−1) + C(n−1)   # this call + both children, shared or not
     = 2^(n+1) − 1
```

`C(20) = 2^21 − 1 = ` **2,097,151** calls. The sum it returns is `2^20 = 1,048,576` (one per leaf
*position*), even though there is exactly one `Leaf` object.

Tempting wrong answers:
- **21**: counts objects, not paths. A structural recursion pays once per *path* to a node, and the
  level-`k` node is reachable by `2^(20−k)` paths.
- **1,048,576**: counts only leaf calls, forgetting the 1,048,575 `Node` calls above them.

This is the same recurrence as naive `fib(n) = fib(n−1) + fib(n−2)` (SICP's classic example of tree
recursion): a small description, an exponential number of equal subproblems.

---

### Part 3 — Memoized: 41 invocations, 21 computations

Each distinct object is computed once: **21** runs of `leaf_fn`/`node_fn` (1 leaf, 20 nodes).
Invocations: the root call, plus two child calls from each of the 20 `Node`s that actually compute.
At every level the first child call computes and the second is a cache hit. `1 + 2·20 = ` **41**.

From two million calls to 41, with the same answer. The cache turned the *tree* the fold thought it
was walking back into the *DAG* (a graph where nodes can have several parents) that was really in
memory.

Pitfall: `id()` keys are only valid while the objects are alive. Here the tree keeps them alive for
the whole fold. A cache that outlives the tree can hand a recycled `id` a stale result.

---

### Part 4 — Which folds may be memoized?

- **(a) Sum of leaves — safe.** The result is a pure function of the subtree alone, so equal
  subtrees (let alone the identical one) must give equal answers.
- **(b) Height — safe**, for the same reason: `1 + max(a, b)` needs nothing from outside the subtree.
- **(c) `label(t, offset)` — unsafe.** The computation's real input is `(subtree, offset)`, not the
  subtree. The shared `Leaf` sits at 1,048,576 different positions. Memoizing on `id(t)` returns the
  first position's labels everywhere (every leaf labeled `0`). Keying on `(id(t), offset)` is
  *correct*, but every path to a shared node arrives with a different offset, so there are **zero**
  cache hits. You are back to 2,097,151 calls, and now you also store 2,097,151 cache entries. The
  output itself has 1,048,576 distinct labeled leaves, so no trick can make it small. **Sharing only
  saves work when the answer depends on the shared thing alone.**
- **(d) Counting `node_visits` — changes behavior.** The sum is still right, but the counter reads
  **20** memoized vs **1,048,575** unmemoized (one per `Node` *call*). A side effect is output that
  memoization silently skips. This is **referential transparency** (Lesson 7) seen from the other
  side: memoization is replacing a call with its already-known result, which is legal exactly when
  that call has no effects.

The two conditions to check before sharing or caching any computation: **the result depends only on
the shared input, and the function has no side effects.**

---

### Part 5 — Spark: lineage is a recipe, `cache()` is memoization

An RDD or DataFrame without `cache()` is a *description* of how to compute rows from the source (its
**lineage**), like `build_copied`'s code rather than its output. Each **action** (`count`, `reduce`,
`collect`, `write`) replays that recipe from the source.

- **No cache: 2 runs per row.** `count()` runs `parse_event` over every row; `reduce` runs it all over
  again. This is Part 2's bug with a cluster bill attached.
- **With `parsed.cache()`: 1 run per row.** The first action materializes the partitions, and the
  second reads them. If an executor loses a cached partition, Spark silently recomputes *that
  partition* from lineage. That is fine only because recomputing gives the same rows.
- **Nondeterministic `parse_event` (`uuid4()`, `now()`): the two actions see different data.**
  Without the cache, `n` and `total` are computed over two different versions of `parsed`: different
  ids, and different results from any timestamp-based filtering. With the cache, an eviction mixes old
  and freshly recomputed partitions inside what you think is one dataset. Part 4(d) again: a
  recomputation you believed was invisible is not. The standard fixes are to keep transformations
  deterministic (derive ids from content, e.g. a hash of the event key) or to materialize (write out
  or `checkpoint`) right after the nondeterministic step so later actions read a fixed copy.

---

### The pattern and the through-line

An immutable structure can be **shared** freely: no one can mutate it, so a thousand references to
one subtree are as good as a thousand copies, and parallel workers can read it simultaneously with no
locks. But consuming code pays per *path* unless it recognizes the sharing. A memo table is how it
does. Both moves are licensed by the same property that made folds parallelizable: purity.

Laziness (Lesson 30) meets this directly. A plain thunk (`lambda: expensive(x)`) re-runs every time it
is forced: **call-by-name**. Haskell's laziness is **call-by-need**: a forced thunk overwrites itself
with its value, so every reference shares one evaluation. That is memoization built into the
evaluation strategy.

**Stage 5 complete.** Next, Stage 6 opens with **continuation-passing style**: making "what happens
after this call returns" an explicit function argument. It turns every call into a tail call, and
shows where the stack in the last two lessons was hiding.
