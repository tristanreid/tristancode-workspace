---
title: "Solution: Fold ∘ Unfold — Build Then Consume"
description: "Hylomorphism = fold ∘ unfold. Factorial, max-of-range, and merge sort as hidden hylomorphisms; mechanical fusion via hylo; why keeping stages separate enables reuse; associativity unlocks the parallel tree reduction."
lesson_number: 27
concept: "Fold ∘ Unfold"
stage: 4
layout: solution
role: solution
builds_on: [15, 25]
skin: chalkboard
---

### Part 1 — Hidden stages

**(a) `factorial(n)`:**

- Unfold: seed = 1, pred = `s > n`, element = `s`, step = `s + 1` → produces `[1, 2, …, n]`.
- Fold: `foldl(1, lambda acc, x: acc * x, [1..n])` → product = n!

The intermediate list `[1..n]` is never needed as a value; it is immediately folded.

**(b) `max_of_range(a, b)`:**

- Unfold: seed = a, pred = `s >= b`, element = `s`, step = `s + 1` → `[a, a+1, …, b−1]`.
- Fold: `foldl(a, lambda acc, x: max(acc, x), [a..b−1])` → maximum element.

Note: `init = a` (not −∞) works as long as `a < b`; for the empty range you'd need −∞ or an error.

**(c) Merge in merge sort:**

The merge step is *only* a fold. The two sorted lists are the intermediate structure produced by the recursive merge sort calls above it (which are the unfold stage). The fold step walks `left` and `right` simultaneously, always picking the smaller head, accumulating into a new sorted list.

The hylomorphism of merge sort as a whole:
- Unfold: split the input list into a binary tree of singletons (tree_unfold, recursively halving).
- Fold: tree_fold that merges two sorted lists at each node.

This is the standard divide-and-conquer structure: unfold (split) → tree → fold (merge). The tree is never stored explicitly — it is implicit in the call stack.

---

### Part 2 — `factorial` via `hylo`

```python
factorial = lambda n: hylo(
    1,                                # seed: start at 1
    lambda s: s > n,                  # pred: stop after n
    lambda s: s,                      # element: current integer
    lambda s: s + 1,                  # step: next integer
    1,                                # init: identity for multiplication
    lambda elem, rest: elem * rest    # combine: multiply current element into rest
)
```

Trace `factorial(4)`:
```
hylo(1, ...) = 1 * hylo(2, ...)
             = 1 * (2 * hylo(3, ...))
             = 1 * (2 * (3 * hylo(4, ...)))
             = 1 * (2 * (3 * (4 * hylo(5, ...))))
             = 1 * (2 * (3 * (4 * 1)))   ← pred fires at s=5
             = 24  ✓
```

The `combine` is right-associative here: `1 * (2 * (3 * (4 * 1)))`. That gives the same answer as left-to-right for multiplication, but for non-commutative operations the order matters.

---

### Part 3 — When to keep stages separate

**Prefer two-stage when:**
- The intermediate structure is *reused*. If you need both the sum and the maximum of a range, unfold once to get the list, then apply two different folds. Fusing forces you to either loop twice or write a more complex combined accumulator.
- The intermediate structure is independently testable or observable (logging, debugging, streaming to another consumer).

**Prefer fused when:**
- Memory is the bottleneck and the intermediate structure would be large (don't allocate a list of 10 million integers just to sum them).
- The intermediate structure is strictly linear (a chain), used exactly once, and the fold is cheap — the overhead of allocation is wasted.

The rule of thumb: fuse when you have a single consumer and memory matters; keep stages separate when you have multiple consumers or need observability.

---

### Part 4 — MCQ answer: (b)

`mystery` is a **tree fold followed by a list fold** — a hylomorphism.

Stage 1 (tree fold / "unfold" of the intermediate): `tree_fold` consumes the tree and produces a `List[Int]` — an in-order traversal. The intermediate is a list.

Stage 2 (list fold / "consume"): `foldl` sums the list.

Combined: `mystery(tree)` = sum of all node values in the tree. The same result could be computed directly with `tree_fold(0, lambda v, l, r: v + l + r, tree)`, which is the fused version — no intermediate list.

Option (a) is backward. Option (c) is wrong because there is an explicit intermediate `nodes`. Option (d) would require a `tree_unfold` call, which is absent.

---

### Part 5 — Associativity

The key property is **associativity**: `(a + b) + c = a + (b + c)`.

When addition is associative, the *order of grouping* doesn't matter — only the order of the elements (left-to-right) must be preserved. This means you can split `[1, 2, 3, 4]` into `[1, 2]` and `[3, 4]`, compute both partial sums independently, then add the results:

```
(1 + 2) + (3 + 4)  = 3 + 7 = 10  ✓
1 + (2 + (3 + 4))  = 1 + 9 = 10  ✓
((1 + 2) + 3) + 4  = 6 + 4 = 10  ✓
```

All equivalent — because `+` is associative.

If the operation were *not* associative — say, string concatenation in a language where left-to-right order and grouping both affect the result — you could not re-parenthesize. Sequential foldl would be the only correct implementation.

**The practical upshot**: any `foldl` over an associative operation can be replaced by a tree fold, which can be computed in parallel with depth O(log n) instead of O(n). This is the theorem behind `reduce` in Spark, the parallel prefix sum in GPU programming, and the "split into shards, reduce each shard, merge" pattern in every MapReduce system. Stage 7 will make this explicit.

---

### Stage 4 complete

You now have the full build/consume toolkit:

| Pattern | Direction | Core operation |
|---------|-----------|----------------|
| `foldl` | consume list → value | accumulate left-to-right |
| `tree_fold` | consume tree → value | combine node + two subtree results |
| `unfold` | seed → produce list | extract element, step seed, repeat |
| `tree_unfold` | seed → produce tree | extract value, produce two child seeds |
| `hylo` | seed → value | unfold fused with fold; no intermediate |

Stage 5 asks: what if we don't evaluate arguments until they are needed? That question opens up infinite structures — and closes the circle on why thunks matter for the parallel patterns you just learned.
