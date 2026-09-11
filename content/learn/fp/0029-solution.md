---
title: "Solution: Fold ∘ Unfold — Never Build the Tree At All"
description: "depth_of_range(lo, hi) fuses tree_unfold and the depth fold into one function with no intermediate Tree; depth_of_range(1, 20) = 4, consistent with depth_of_range(1, 10) = 3 from Lesson 28."
lesson_number: 29
track: fp
aliases: ["/learn/0029-solution/"]
concept: "Fold ∘ Unfold (fusion)"
stage: 4
layout: solution
role: solution
builds_on: [23, 25, 28]
skin: chalkboard
---

### Warm-up recall answer

Map "add 5" over `[10, 20, 30]` → `[15, 25, 35]`. Sum: `15 + 25 + 35 = 75`. **75.**

---

### Part 1 — The fused function

Substituting Lesson 28's `pred`/`value`/`left_seed`/`right_seed` and Lesson 23's `leaf_val=-1`,
`node_fn(v,l,r) = 1 + max(l,r)` into the fusion template:

```python
def depth_of_range(lo, hi):
    if lo > hi:
        return -1                                   # was: tree_fold's leaf_val
    mid = (lo + hi) // 2                             # was: value(seed)
    return 1 + max(depth_of_range(lo, mid - 1),      # was: node_fn(v, fold(left), ...)
                   depth_of_range(mid + 1, hi))
```

Every piece has a direct counterpart: the `lo > hi` check *is* `pred`; `mid` *is* `value`; the two
recursive calls *are* `tree_fold` applied to `tree_unfold`'s two child seeds, except the tree in
between never gets built — `depth_of_range` calls itself directly on `(lo, mid-1)` and `(mid+1, hi)`
instead of constructing `Node` objects first.

---

### Part 2 — Sanity check: `depth_of_range(1, 10) = 3`

```
depth_of_range(1,10):  mid=5 → depth_of_range(1,4), depth_of_range(6,10)
  depth_of_range(1,4):   mid=2 → depth_of_range(1,1)=0, depth_of_range(3,4)=1 → 1+max(0,1)=2
  depth_of_range(6,10):  mid=8 → depth_of_range(6,7)=1, depth_of_range(9,10)=1 → 1+max(1,1)=2
  depth_of_range(1,10) = 1 + max(2,2) = 3
```

Matches Lesson 28's build-then-fold answer exactly, as it must — fusion changes *how* the value is
computed, never *what* value comes out.

---

### Part 3 — The graded answer: `depth_of_range(1, 20) = 4`

```
depth_of_range(1,20):   mid=10 → depth_of_range(1,9), depth_of_range(11,20)

depth_of_range(1,9):    mid=5  → depth_of_range(1,4)=2, depth_of_range(6,9)=2  → 1+max(2,2)=3
depth_of_range(11,20):  mid=15 → depth_of_range(11,14)=2, depth_of_range(16,20)=2 → 1+max(2,2)=3

depth_of_range(1,20) = 1 + max(3,3) = 4
```

**4.** Sanity check: 20 elements, `log2(20) ≈ 4.32` — a depth of 4 is exactly the balanced-tree
ballpark, one more than the 10-element tree's depth of 3, which is what you'd expect from roughly
doubling the element count.

---

### Part 4 — What's preserved, what's lost

**Preserved**: the exact same result, and the same asymptotic work — both versions do `O(n)` total
value/node computations for a range of `n` integers, since fusion doesn't change *how much* work
happens, only whether an intermediate data structure exists to hold it.

**Lost**: reusability, exactly as in Lesson 25's `sum_range` fusion. The two-stage version builds a
real `Tree` you can fold *again* with a different `node_fn` — compute its size, mirror it, check
`is_bst`, print it — all from the same built structure. `depth_of_range` computes only depth, for
good: there's no tree sitting around afterward to feed a second fold. This is the same
efficiency-vs-reusability tradeoff you saw with lists: fusing eliminates allocation at the cost of
locking the computation to one specific purpose.

---

### The pattern

**"Build then consume" is a mental model, not a mandate.** It's the clearest way to *design* a
computation — get the shape of the data right first, then decide what to extract from it — but
once the design is right, an unfold immediately followed by a fold can always be collapsed into one
recursive function, because the fold never needed the *data structure*, only the *values* the
unfold would have put into it. The tree (or list) was scaffolding for your understanding, not a
requirement of the computation.

**Why this matters for parallelism**: fusion doesn't change independence. `depth_of_range(lo, mid-1)`
and `depth_of_range(mid+1, hi)` still depend on nothing but their own arguments — the same
independence that let the unbuilt tree's two branches run in parallel in Lesson 28 is still present
here, just without an intermediate object to point at. Parallelism comes from the *shape* of the
recursion, not from whether you happened to materialize a data structure along the way.

**Stage 4 complete.** You now have the full build/consume vocabulary: unfold for lists (Lesson 25),
unfold for trees (Lesson 28), and fusing either with its dual fold (Lesson 25's `sum_range`, today's
`depth_of_range`). **Next**: Stage 5 asks a question that's been quietly assumed this whole time —
*when* does an argument actually get computed? Lesson 30 starts with eager vs. lazy evaluation.
