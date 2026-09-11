---
title: "Fold ∘ Unfold: Never Build the Tree At All"
description: "Build-then-consume is a clean mental model, but you don't have to actually build. Fuse tree_unfold and the depth fold into one recursive function that computes depth directly from a range."
lesson_number: 29
track: fp
aliases: ["/learn/0029-puzzle/"]
concept: "Fold ∘ Unfold (fusion)"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [23, 25, 28]
skin: chalkboard
numeric:
  question: "Write depth_of_range(lo, hi) as a single fused recursive function (no tree ever built) that computes the depth tree_unfold + the Lesson 23 depth fold would produce for the balanced BST over [lo, hi]. What is depth_of_range(1, 20)?"
  answer: 4
  tolerance: 0
  unit: "edges (depth)"
---

**Warm-up recall (Lesson 14).** Building `map` from scratch means applying a function to every
element of a list and collecting the results, in order, into a new list. Apply "add 5" as a map over
`[10, 20, 30]`, then sum the mapped result. What number do you get? Keep it; the solution confirms
it.

---

**Terms (standalone):**

- **Tree unfold** (Lesson 28): `tree_unfold(seed, pred, value, left_seed, right_seed)` builds a
  `Tree` from a seed, branching into two child seeds per step.
- **Tree fold** (Lesson 23): `tree_fold(leaf_val, node_fn, t)` consumes a `Tree` into a value,
  replacing `Leaf` with `leaf_val` and `Node(v,l,r)` with `node_fn(v, fold(l), fold(r))`.
- **Fusion**: combining an unfold immediately followed by a fold into a single recursive function
  that never materializes the intermediate structure. Lesson 25 did this for lists (`sum_range`
  fused a list `unfold` with a `foldl`); today does it for trees.

### Why fusion works

`tree_unfold` then `tree_fold` looks like two passes: build the whole tree, then walk it. But look
at what each piece of `tree_fold` actually needs when the tree in question was *just* produced by
`tree_unfold` from a seed:

- `tree_fold`'s `Leaf` case fires exactly when `tree_unfold`'s `pred(seed)` was true.
- `tree_fold`'s `Node(v, l, r)` case needs `v` (which is exactly `value(seed)`) and the folded
  results of the two children — which, if you never build the tree, are just **recursive calls of
  the fused function on `left_seed(seed)` and `right_seed(seed)`**.

So the unfold's branching structure and the fold's combining logic can be interleaved into one
function that goes straight from seed to final answer:

```python
def fused(seed):
    if pred(seed):
        return leaf_val
    v = value(seed)
    return node_fn(v, fused(left_seed(seed)), fused(right_seed(seed)))
```

No `Tree` object is ever constructed. `fused` *is* `tree_unfold` and `tree_fold` composed, with the
tree itself compiled away.

---

### Part 1 — Fuse `depth` for the range-seed tree

Lesson 28's range-seed `tree_unfold` used:

```python
pred        = lambda s: s[0] > s[1]
value       = lambda s: (s[0] + s[1]) // 2
left_seed   = lambda s: (s[0], (s[0] + s[1]) // 2 - 1)
right_seed  = lambda s: ((s[0] + s[1]) // 2 + 1, s[1])
```

And Lesson 23's depth fold used `leaf_val = -1`, `node_fn(v, l, r) = 1 + max(l, r)`. Substitute both
into the `fused` template above to get a single function `depth_of_range(lo, hi)` that computes tree
depth directly from a range — no tree, no separate fold pass.

---

### Part 2 — Sanity-check against Lesson 28

You already know, from Lesson 28's numeric answer, what depth the `(1, 10)` balanced BST has. Run
your fused function (on paper) on `depth_of_range(1, 10)`. Does it match?

---

### Part 3 — The graded question (above)

Compute `depth_of_range(1, 20)` using your fused function. Enter the result in the numeric box.

---

### Part 4 — What was preserved, what was lost

Compare the two-stage version (`tree_fold(..., tree_unfold(...))`) to the fused version. What is
identical between them (result, time complexity)? What capability does the two-stage version have
that the fused version gives up — and where have you seen this exact tradeoff before?
