---
title: "Tree Unfold: Building a Balanced BST From a Range"
description: "Unfold's seed steps to one new seed; tree_unfold's seed branches into two. Build a balanced binary search tree from nothing but a (lo, hi) range, then check it with the depth fold you already have."
lesson_number: 28
track: fp
aliases: ["/learn/0028-puzzle/"]
concept: "Tree unfold"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [21, 23, 25]
skin: chalkboard
numeric:
  question: "Build the balanced BST containing every integer 1 through 10 via tree_unfold, then compute its depth with Lesson 23's depth fold (leaf_val = -1). What is the depth?"
  answer: 3
  tolerance: 0
  unit: "edges (depth)"
---

**Warm-up recall (Lesson 16).** A **closure** is a function that captures variables from the
environment where it was defined, so it can still use them later even after that environment is
gone. Suppose `make_multiplier(k)` returns a closure that multiplies its argument by `k`. If
`m3 = make_multiplier(3)`, what is `m3(7)`? Keep the number; the solution confirms it.

---

**Terms (standalone):**

- **Binary tree** (Lesson 21): `Tree = Leaf | Node(value: Int, left: Tree, right: Tree)`.
- **List unfold** (Lesson 25): `unfold(seed, pred, element, step)` — from a seed, emit one element,
  step to *one* new seed, repeat. Linear: one seed in, one seed out.
- **Depth fold** (Lesson 23): `depth = tree_fold(-1, lambda v, l, r: 1 + max(l, r), t)`. `Leaf` gets
  `-1` (not 0) so that a single-node tree — one `Node` wrapping two `Leaf`s — correctly comes out to
  `1 + max(-1, -1) = 0`.

### Tree unfold

A **tree unfold** is `unfold`'s branching cousin. Instead of one `step` producing one next seed, it
needs **two** — a seed for the left child and a seed for the right child — plus a way to tell when a
seed should become a `Leaf` instead of branching further:

```
tree_unfold : (S, S → Bool, S → A, S → S, S → S) → Tree[A]
```

```python
def tree_unfold(seed, pred, value, left_seed, right_seed):
    if pred(seed):
        return Leaf()
    v = value(seed)
    return Node(v,
                tree_unfold(left_seed(seed), pred, value, left_seed, right_seed),
                tree_unfold(right_seed(seed), pred, value, left_seed, right_seed))
```

Same shape as `unfold` — a stopping predicate, a way to extract the current output, functions to
produce the next seed(s) — just with two "next seed" functions instead of one, because a tree has
two branches instead of one tail.

### Worked example: seed = a range `(lo, hi)`

To build a balanced BST containing every integer from `lo` to `hi`: the seed *is* the range. Stop
when the range is empty (`lo > hi`). Otherwise, the node's value is the midpoint, and the two child
seeds are the two halves of the range on either side of it:

```python
pred        = lambda s: s[0] > s[1]                  # lo > hi: empty range
value       = lambda s: (s[0] + s[1]) // 2            # midpoint
left_seed   = lambda s: (s[0], (s[0] + s[1]) // 2 - 1)
right_seed  = lambda s: ((s[0] + s[1]) // 2 + 1, s[1])
```

On seed `(1, 3)`: `pred((1,3))` is false, `value = 2`. `left_seed((1,3)) = (1, 1)`,
`right_seed((1,3)) = (3, 3)`. Both of those are single-element ranges, so each produces
`Node(x, Leaf, Leaf)`. Result: `Node(2, Node(1, Leaf, Leaf), Node(3, Leaf, Leaf))` — a balanced tree
containing `1, 2, 3`, built entirely from the range `(1, 3)` with no list ever constructed.

---

### Part 1 — Build the tree for `(1, 4)`

Trace `tree_unfold((1, 4), pred, value, left_seed, right_seed)` by hand: what is the root value, and
what are the two child seeds? Keep going until every branch bottoms out at a `Leaf`. Draw the tree.

---

### Part 2 — Build the tree for `(1, 10)`

Same process, larger range. This tree has 10 nodes. Draw it (or trace it carefully enough to know
its shape) before moving to Part 3.

---

### Part 3 — The graded question (above)

Using the tree from Part 2 and the **depth fold** from Lesson 23 (`leaf_val = -1`,
`node_fn(v, l, r) = 1 + max(l, r)`), compute the depth of the `(1, 10)` tree. Enter it in the numeric
box.

---

### Part 4 — Why the midpoint, and what breaks without it

If `value` always picked `s[0]` (the low end) instead of the midpoint, what shape would the
resulting tree have, and what would happen to its depth as the range grows? (You don't need exact
numbers — describe the shape and say whether depth would still grow like `log(n)`.)
