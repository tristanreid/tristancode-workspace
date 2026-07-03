---
title: "Solution: Tree Unfold — Building Trees Top-Down"
description: "tree_unfold expands a seed into a tree by recursively branching; perfect trees and balanced BSTs as pure unfold calls; node count is 2^(d+1)−1; parallelism comes from independent left/right seeds."
lesson_number: 26
track: fp
aliases: ["/learn/0026-solution/"]
concept: "Tree unfold"
stage: 4
layout: solution
role: solution
builds_on: [21, 25]
skin: chalkboard
---

### Part 1 — Perfect binary tree

```python
def perfect(d):
    return tree_unfold(
        d,
        lambda s: s <= 0,       # Leaf when no depth remains
        lambda s: s - 1,        # node value = depth - 1 (0-indexed)
        lambda s: s - 1,        # left child: same remaining depth
        lambda s: s - 1         # right child: same remaining depth
    )
```

The seed is the remaining depth. Every node value is `seed − 1` (so the root of a depth-3 tree has value 2, the next level has 1, the last nodes above `Leaf` have 0). `is_leaf` fires at `s = 0` so that `Leaf` appears below nodes of value 0.

Trace `perfect(2)`:
```
seed=2: node_value=1, left_seed=1, right_seed=1
  seed=1: node_value=0, left_seed=0, right_seed=0
    seed=0: is_leaf → Leaf
    seed=0: is_leaf → Leaf
    → Node(0, Leaf, Leaf)
  (right child: same)
  → Node(1, Node(0,Leaf,Leaf), Node(0,Leaf,Leaf))
→ Node(1, Node(1, Node(0,L,L), Node(0,L,L)), Node(1, ...))
```

Wait — at seed=2: `node_value = 2-1 = 1`. Both children get seed `2-1 = 1`. At seed=1: `node_value = 0`. Children get seed 0 → `Leaf`. So the root is `Node(1, Node(0, Leaf, Leaf), Node(0, Leaf, Leaf))`. For depth 3 the root is `Node(2, ...)`. ✓

---

### Part 2 — Balanced BST from a range

```python
def bst_from_range(start, stop):
    return tree_unfold(
        (start, stop),
        lambda s: s[0] >= s[1],             # empty range → Leaf
        lambda s: (s[0] + s[1]) // 2,       # mid = node value
        lambda s: (s[0], (s[0]+s[1])//2),   # left: [start, mid)
        lambda s: ((s[0]+s[1])//2 + 1, s[1])# right: [mid+1, stop)
    )
```

Trace for seed `(1, 4)`:
```
mid = (1+4)//2 = 2        → Node value 2
left_seed  = (1, 2)       → seed=(1,2): mid=1, value=1
  left  = (1,1): 1>=1 → Leaf
  right = (2,2): 2>=2 → Leaf
  → Node(1, Leaf, Leaf)
right_seed = (3, 4)       → seed=(3,4): mid=3, value=3
  left  = (3,3) → Leaf
  right = (4,4) → Leaf
  → Node(3, Leaf, Leaf)
→ Node(2, Node(1,L,L), Node(3,L,L))  ✓
```

Full call on `(1, 8)`:
- mid=4 → left `(1,4)` → `Node(2, Node(1,L,L), Node(3,L,L))`, right `(5,8)` → `Node(6, Node(5,L,L), Node(7,L,L))`
- Root: `Node(4, Node(2,...), Node(6,...))` ✓

---

### Part 3 — Node count for `perfect(d)`

A perfect binary tree of depth `d` has:
- Internal nodes: `2^0 + 2^1 + … + 2^(d−1) = 2^d − 1`
- Leaf calls (where `is_leaf` fires): `2^d`
- **Total calls to `tree_unfold`**: `(2^d − 1) + 2^d = 2^(d+1) − 1`

For `perfect(3)`: `2^4 − 1 = 15` calls. The work is exponential in depth — every additional level doubles the number of nodes (and calls). This is why building large perfect trees is expensive, and why a parallel runtime helps: at each level, all nodes on that level can be computed simultaneously.

---

### Part 4 — Inherent parallelism

The two recursive calls operate on different seeds (`left_seed(seed)` and `right_seed(seed)`) and neither needs the other's result — they can run simultaneously, with no shared mutable state, because the seeds carry all required context.

This is the same independence that made `tree_fold` parallelisable (Lesson 23): both fold and unfold on trees have the "no dependency between subtrees" property. Sequential list-fold doesn't have it because each accumulator step depends on the previous.

---

### Part 5 — List-as-tree (binary trie sketch)

If the seed is a sorted list `xs`:

- `is_leaf(xs)`: `len(xs) == 0`
- `node_value(xs)`: `xs[len(xs) // 2]` (the median)
- `left_seed(xs)`: `xs[:len(xs) // 2]` (all values below the median)
- `right_seed(xs)`: `xs[len(xs)//2 + 1:]` (all values above the median)

This is exactly the tree-unfold behind binary search — the recursive "take the midpoint" logic. Note that `is_leaf` needs to handle the empty list (when a range contains only the median, both sub-lists may be empty). This gives you a balanced BST in O(n) unfold calls.

---

### Connecting the four lessons

| Lesson | Pattern | Produces / consumes |
|--------|---------|---------------------|
| 15     | `foldl` | consumes list → value |
| 23     | `tree_fold` | consumes tree → value |
| 25     | `unfold` | seed → produces list |
| 26     | `tree_unfold` | seed → produces tree |

Fold and unfold are duals at every level of structure. The list and tree versions differ only in branching factor (1 vs 2). Stage 7 will show that choosing a tree-shaped intermediate structure — via `tree_unfold` followed by `tree_fold` — is the key to parallel reductions. **Next**: compose fold and unfold (Lesson 27), then explore what happens when computation is deferred until needed (Stage 5, Lesson 28).
