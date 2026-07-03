---
title: "Fold as Elimination: The Tree Fold"
description: "Every function that consumes a binary tree by structural recursion is a tree fold in disguise. Once you see the pattern, you can re-derive size, depth, sum, and mirror as pure data — no explicit recursion needed."
lesson_number: 23
track: fp
aliases: ["/learn/0023-puzzle/"]
concept: "Fold over ADT"
stage: 3
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [15, 21, 22]
skin: chalkboard
---

In Lessons 21 and 22 you wrote four tree functions. Here is their structure side by side:

```python
def size(t):
    match t:
        case Leaf():      return 0
        case Node(v,l,r): return 1 + size(l) + size(r)

def depth(t):
    match t:
        case Leaf():      return -1
        case Node(v,l,r): return 1 + max(depth(l), depth(r))

def sum_tree(t):
    match t:
        case Leaf():      return 0
        case Node(v,l,r): return v + sum_tree(l) + sum_tree(r)

def mirror(t):
    match t:
        case Leaf():      return Leaf()
        case Node(v,l,r): return Node(v, mirror(r), mirror(l))
```

**The skeleton is always the same.** Each function:
1. Returns a fixed value on `Leaf`.
2. Recurses on `left` and `right`, then combines `v`, `left_result`, `right_result` with some logic.

This identical skeleton can be factored out into a single higher-order function — the **tree fold**.

**Terms:**

- **Tree fold** (also: catamorphism over a tree): a function that consumes a `Tree` by replacing each constructor with a supplied value or function.
  - `Leaf` is replaced by a fixed value `leaf_val`.
  - `Node(v, l, r)` is replaced by `node_fn(v, fold(l), fold(r))` — `node_fn` receives the node value and the *already-folded* results from both subtrees.
- **Binary tree** (standalone): `Tree = Leaf | Node(value: Int, left: Tree, right: Tree)`.

Here is `tree_fold`:

```python
def tree_fold(leaf_val, node_fn, t):
    match t:
        case Leaf():
            return leaf_val
        case Node(v, left, right):
            return node_fn(v,
                           tree_fold(leaf_val, node_fn, left),
                           tree_fold(leaf_val, node_fn, right))
```

`tree_fold` contains the recursion; `leaf_val` and `node_fn` contain the logic. Your four functions become parameter choices.

---

### Part 1 — Express `size` as a tree fold

Find `leaf_val` and `node_fn` such that:

```python
size = lambda t: tree_fold(leaf_val, node_fn, t)
```

(Hint: `size(Leaf) = 0`; `size(Node(v, l, r)) = 1 + size(l) + size(r)`. What does `node_fn(v, l_sz, r_sz)` need to return? Note that `v` — the node's value — is not used by `size`.)

---

### Part 2 — Express `sum_tree` and `depth` as tree folds

Same task. Find the `leaf_val` and `node_fn` for each. `depth`'s `leaf_val` is not zero — think about why, and what it must be.

---

### Part 3 — Express `mirror` as a tree fold

This one is harder. `mirror` returns a `Tree`, not an `Int`, so `leaf_val` and the return type of `node_fn` are trees — not numbers.

What is `leaf_val`? What does `node_fn(v, l_mirrored, r_mirrored)` return? (Recall: in `mirror`, the left and right results are *swapped* in the output node.)

---

### Part 4 — The fold eliminates the type

`tree_fold` takes a `Tree` and produces a value of some other type `R` (determined by `leaf_val` and `node_fn`). In functional programming, a function that "eliminates" a type — consuming the structure and producing a result — is called an **eliminator** or **catamorphism**.

Consider: `tree_fold(0, lambda v, l, r: v + l + r, t)` computes `sum_tree`. The result type is `Int`. `tree_fold(Leaf(), lambda v, l, r: Node(v, r, l), t)` computes `mirror`. The result type is `Tree`.

The same fold, different result types. What determines the result type of `tree_fold`?
