---
title: "Solution: A Tree in a Box: Binary Trees and Recursion"
description: "size sums both subtrees; depth takes the max — understanding why they diverge is the key insight about what each function is actually computing."
lesson_number: 21
concept: "Binary trees"
stage: 3
layout: solution
role: solution
builds_on: [19, 20]
skin: chalkboard
---

### Part 1 — `size`

```python
def size(t):
    match t:
        case Leaf():
            return 0
        case Node(v, left, right):
            return 1 + size(left) + size(right)
```

Trace on the example tree:

```
size(Node(1, Leaf, Leaf)) = 1 + 0 + 0 = 1
size(Node(4, Leaf, Leaf)) = 1
size(Node(3, Node(1,...), Node(4,...))) = 1 + 1 + 1 = 3
size(Node(8, Leaf, Leaf)) = 1
size(Node(5, Node(3,...), Node(8,...))) = 1 + 3 + 1 = 5  ✓
```

`size` counts every node in every subtree, so it adds both sides. There is no choice.

---

### Part 2 — `depth`

```python
def depth(t):
    match t:
        case Leaf():
            return -1
        case Node(v, left, right):
            return 1 + max(depth(left), depth(right))
```

**Why `max` and not `+`?**

Depth answers: what is the longest path from *this node* to a `Leaf`? A node has two subtrees; the deepest `Leaf` is in whichever subtree is deeper. `max` selects that branch.

If you wrote `1 + depth(left) + depth(right)`, you would be *summing* the depths of both branches — as if the path somehow descended into the left subtree and then continued into the right subtree. That quantity has no geometric meaning. For a lopsided tree like `Node(5, Node(3, Node(1, Leaf, Leaf), Leaf), Leaf)`:

```
Correct:    depth = 1 + max(1 + max(0, -1), -1) = 1 + 1 = 2
Sum-wrong:  depth = 1 + (1 + (1 + (-1) + (-1))) + (-1) = 1 + 0 + (-1) = 0  ✗
```

The `+` version completely breaks for any tree that isn't perfectly balanced.

**Why `depth(Leaf) = -1`?** The sentinel ensures the edge count is correct. A single node has no edges below it — its depth should be 0. The formula `1 + max(-1, -1) = 0` delivers this. The `-1` absorbs the `+1` contributed by the node itself, netting zero edges.

An alternative convention is `depth(Leaf) = 0` and to define depth as "the number of nodes on the longest root-to-leaf path" — a single node then has depth 1. Both conventions are correct; choose one and be consistent.

---

### Part 3 — Trace

```
depth(Node(1, Leaf, Leaf)) = 1 + max(-1, -1) = 0
depth(Node(4, Leaf, Leaf)) = 0
depth(Node(3, Node(1,...), Node(4,...))) = 1 + max(0, 0) = 1
depth(Node(8, Leaf, Leaf)) = 0
depth(Node(5, Node(3,...), Node(8,...))) = 1 + max(1, 0) = 2  ✓
```

---

### The pattern: structural recursion mirrors the type

Both `size` and `depth` follow the same template: base case on `Leaf`, recurse on `left` and `right`, combine results in the `Node` arm. They differ *only* in the combining step:

| Function | `Leaf` value | Combining step |
|----------|-------------|----------------|
| `size`   | `0`         | `1 + l + r` |
| `depth`  | `-1`        | `1 + max(l, r)` |

The structure is identical. The logic is entirely in the two choices. This pattern — "same skeleton, different operations" — is the first hint of something deeper: the fold. You will see the full picture in Lesson 23.

**Next**: more tree operations — mirror and sum — to build fluency before the fold (Lesson 22).
