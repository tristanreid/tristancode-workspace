---
title: "Tree Unfold: Building Trees Top-Down"
description: "Where tree_fold consumes a tree by replacing constructors, tree_unfold builds a tree by recursively expanding a seed. Derive perfect binary trees and balanced BSTs as pure unfold calls."
lesson_number: 26
track: fp
aliases: ["/learn/0026-puzzle/"]
concept: "Tree unfold"
stage: 4
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [21, 25]
skin: chalkboard
---

In Lessons 21–23 you wrote functions that *consumed* trees. In Lesson 25 you saw that a list unfold generates a list from a seed, branching linearly. The **tree unfold** (also: anamorphism for trees) does the same but branches at each step — one seed produces two child seeds.

**Terms (standalone):**

- **Binary tree**: `Tree = Leaf | Node(value: Int, left: Tree, right: Tree)`. A `Leaf` carries no value and no children.
- **Tree unfold** (anamorphism): generates a `Tree` from a seed by recursively splitting the seed into a value and two child seeds, stopping when a predicate fires.
- **Perfect binary tree** of depth d: every leaf is at the same depth; a tree of depth 0 is `Leaf`; a tree of depth 1 is `Node(v, Leaf, Leaf)`.
- **BST (binary search tree)**: every value in a node's left subtree is less than the node's value; every value in the right subtree is greater.

```python
def tree_unfold(seed, is_leaf, node_value, left_seed, right_seed):
    """
    seed       — initial state
    is_leaf    — when True, return Leaf() and stop recursing
    node_value — extract the Node's value from the seed
    left_seed  — compute the left child's seed
    right_seed — compute the right child's seed
    """
    if is_leaf(seed):
        return Leaf()
    return Node(
        node_value(seed),
        tree_unfold(left_seed(seed), is_leaf, node_value, left_seed, right_seed),
        tree_unfold(right_seed(seed), is_leaf, node_value, left_seed, right_seed)
    )
```

Compare to list `unfold`: instead of `step : S → S` (one new seed), tree unfold has `left_seed : S → S` and `right_seed : S → S` — branching.

---

### Part 1 — Perfect binary tree of depth d

Using `tree_unfold`, build a perfect binary tree of depth `d` where a node's *value* is the depth at which it sits — the root (one level above the last `Node`) has value `d − 1`, the row above `Leaf` has value `0`.

```
perfect(3):
Node(2,
  Node(1, Node(0, Leaf, Leaf), Node(0, Leaf, Leaf)),
  Node(1, Node(0, Leaf, Leaf), Node(0, Leaf, Leaf)))
```

The seed is the remaining depth. Let `is_leaf` fire when no depth remains.

What are `is_leaf`, `node_value`, `left_seed`, and `right_seed`?

---

### Part 2 — Balanced BST from a contiguous range

`bst_from_range(start, stop)` builds a balanced binary search tree containing integers `start, start+1, …, stop−1`. The seed is a `(start, stop)` pair; the root is the midpoint.

```
bst_from_range(1, 8):
        4
       / \
      2   6
     / \ / \
    1  3 5  7
```

Rules:
- `mid = (start + stop) // 2` is the current node's value.
- The left subtree covers `[start, mid)`.
- The right subtree covers `(mid, stop)` = `[mid + 1, stop)`.
- `is_leaf` fires when the range is empty.

Write the five arguments to `tree_unfold(seed, is_leaf, node_value, left_seed, right_seed)`.

Trace through the seed `(1, 4)` by hand to verify your left and right seeds are correct.

---

### Part 3 — Node count

For `perfect(d)`, how many total calls to `tree_unfold` are made (including the leaf calls where `is_leaf` fires)? Express as a formula in `d`.

Hint: count the internal nodes and the leaves separately.

---

### Part 4 — Inherent parallelism

The two recursive calls inside `tree_unfold`:

```python
tree_unfold(left_seed(seed), ...),
tree_unfold(right_seed(seed), ...)
```

share the same `is_leaf`, `node_value`, `left_seed`, and `right_seed` functions, but operate on *different seeds*. Neither call depends on the other's result before it can run.

In one sentence: why does this make tree_unfold inherently parallelisable?

---

### Part 5 — An unfold that builds unequally

The two seeds don't have to be "the same kind of split". Consider building a sorted list as a *tree* (a binary trie) where left subtrees hold values less than the median and right subtrees hold the rest.

Without writing code: describe what `left_seed` and `right_seed` would return if the seed were a sorted Python list `xs`. What does `is_leaf` check?
