---
title: "A Tree in a Box: Binary Trees and Recursion"
description: "Define a binary tree as a recursive sum type, then write size and depth — two functions that look similar but diverge in a revealing way."
lesson_number: 21
concept: "Binary trees"
stage: 3
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [19, 20]
skin: chalkboard
---

So far, sum types like `Circle | Rectangle` have flat variants. The structure can go deeper: a **binary tree** is a sum type where one variant carries *other trees* as fields. The definition is recursive.

**The type:**

```
Tree = Leaf
     | Node(value: Int, left: Tree, right: Tree)
```

A tree is either empty (`Leaf`) or a node holding an integer and two subtrees — each of which is itself a `Tree`. The recursion in the type definition is what makes the functions you write over it recursive: you mirror the shape.

In Python pseudocode:

```python
@dataclass
class Leaf:
    pass

@dataclass
class Node:
    value: int
    left:  "Tree"
    right: "Tree"

Tree = Leaf | Node
```

A concrete tree — the one you will use throughout this puzzle:

```
        5
       / \
      3   8
     / \
    1   4
```

```python
tree = Node(5,
    Node(3,
        Node(1, Leaf(), Leaf()),
        Node(4, Leaf(), Leaf())),
    Node(8, Leaf(), Leaf()))
```

The structural recursion template mirrors the type:

```python
def f(t):
    match t:
        case Leaf():
            return BASE_CASE
        case Node(v, left, right):
            l = f(left)
            r = f(right)
            return COMBINE(v, l, r)
```

Because `Tree` has two constructors, every tree function has exactly two arms. The `Leaf` arm supplies the base case; the `Node` arm supplies the recursive step.

---

### Part 1 — `size(t: Tree) -> Int`

Return the number of `Node`s (not counting `Leaf` as a node).

- A `Leaf` has 0 nodes.
- A `Node` contributes 1 (itself) plus the size of each subtree.

Expected: `size(tree) = 5`

---

### Part 2 — `depth(t: Tree) -> Int`

Return the **depth** (also called height): the number of edges on the longest path from the root to any `Leaf` below it.

Convention: use `depth(Leaf()) = -1`. (This sentinel makes the single-node case work: `1 + max(-1, -1) = 0`. Verify it.)

- A single-node tree — `Node(v, Leaf, Leaf)` — has depth 0 (no edges below the root).
- The example tree has depth 2 (path 5 → 3 → 1, two edges).

The recursive formula for a `Node` uses `max`, not `+`. Write the implementation and then answer in one sentence: **why is the formula `1 + max(depth(left), depth(right))` correct, and what would go wrong if you used `1 + depth(left) + depth(right)` instead?**

---

### Part 3 — Trace `depth` on the example tree

Expand `depth(tree)` step by step using the sentinel convention, the way you traced `foldl` in Lesson 15. Show the value computed at each node.
