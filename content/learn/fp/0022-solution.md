---
title: "Solution: Mirroring and Summing a Binary Tree"
description: "mirror must recurse into both subtrees and swap them; mirroring twice is an involution. sum_tree is straightforward structural recursion."
lesson_number: 22
track: fp
aliases: ["/learn/0022-solution/"]
concept: "Tree recursion"
stage: 3
layout: solution
role: solution
builds_on: [21]
skin: chalkboard
---

### Part 1 — `mirror`

```python
def mirror(t):
    match t:
        case Leaf():
            return Leaf()
        case Node(v, left, right):
            return Node(v, mirror(right), mirror(left))
```

The key: `Node(v, mirror(right), mirror(left))`. The right subtree — mirrored — becomes the new left child, and vice versa. This swap happens at *every* level because both recursive calls apply `mirror` to their argument before the results are placed into the new `Node`.

**Common mistake**: returning `Node(v, right, left)` (swapping without mirroring). This only swaps the top level; subtrees are not internally mirrored. On the example tree:

```
# Bug — only top-level swap:
Node(5, Node(8, Leaf, Node(9,...)), Node(3, Node(1,...), Leaf))

# Correct — mirror applied recursively:
Node(5, Node(8, Node(9,Leaf,Leaf), Leaf), Node(3, Leaf, Node(1,Leaf,Leaf)))
```

Visually:
```
Correct mirror:
        5
       / \
      8   3
     /     \
    9       1
```

---

### Part 2 — `sum_tree`

```python
def sum_tree(t):
    match t:
        case Leaf():
            return 0
        case Node(v, left, right):
            return v + sum_tree(left) + sum_tree(right)
```

`sum_tree(tree) = 5 + (3 + 1 + 0) + (8 + 0 + 9) = 5 + 4 + 17 = 26` ✓

Notice how similar this is to `size` from Lesson 21 — same combining shape, different logic. Here you use the node's *value* `v` instead of the constant `1`.

---

### Part 3 — Trace of `mirror`

```
mirror(Leaf)            = Leaf
mirror(Node(1,Leaf,Leaf)) = Node(1, mirror(Leaf), mirror(Leaf))
                          = Node(1, Leaf, Leaf)        [symmetric — unchanged]
mirror(Node(9,Leaf,Leaf)) = Node(9, Leaf, Leaf)        [symmetric — unchanged]

mirror(Node(3, Node(1,Leaf,Leaf), Leaf))
  = Node(3, mirror(Leaf), mirror(Node(1,Leaf,Leaf)))
  = Node(3, Leaf, Node(1,Leaf,Leaf))
  # 3's right child is now 1; left is Leaf

mirror(Node(8, Leaf, Node(9,Leaf,Leaf)))
  = Node(8, mirror(Node(9,Leaf,Leaf)), mirror(Leaf))
  = Node(8, Node(9,Leaf,Leaf), Leaf)
  # 8's left child is now 9; right is Leaf

mirror(Node(5, Node(3,...), Node(8,...)))
  = Node(5, mirror(Node(8,...)), mirror(Node(3,...)))
  = Node(5,
        Node(8, Node(9,Leaf,Leaf), Leaf),
        Node(3, Leaf, Node(1,Leaf,Leaf)))
```

Result:
```
        5
       / \
      8   3
     /     \
    9       1  ✓
```

---

### Part 4 — Double mirror is the identity

**Yes** — `mirror(mirror(t)) == t` for all trees `t`.

By structural induction:

- `mirror(mirror(Leaf)) = mirror(Leaf) = Leaf` ✓
- For `Node(v, l, r)`:
  ```
  mirror(mirror(Node(v, l, r)))
    = mirror(Node(v, mirror(r), mirror(l)))
    = Node(v, mirror(mirror(l)), mirror(mirror(r)))
    = Node(v, l, r)        [by the inductive hypothesis]
  ```

Each swap is undone by the second swap. The operation is its own inverse — mathematicians call this an **involution** (a function `f` where `f(f(x)) = x`). Other involutions: boolean `not`, negation on numbers, list `reverse`.

Involutions are a useful pattern to recognize: they encode "toggle", "flip", or "undo" — operations where applying twice gets you back to the start.

---

### What these functions share

| Function  | `Leaf` value | `Node(v, l, r)` step |
|-----------|-------------|----------------------|
| `size`    | `0`         | `1 + l + r`          |
| `depth`   | `-1`        | `1 + max(l, r)`      |
| `sum_tree`| `0`         | `v + l + r`          |
| `mirror`  | `Leaf()`    | `Node(v, r, l)`      |

All four have *identical structure*: match `Leaf`, match `Node`, recurse on children, combine. Only the base case and combining step differ. This is the pattern that Lesson 23 distills into a single function — the tree fold.

**Next**: abstract this skeleton into `tree_fold` and re-derive every operation as a parameter (Lesson 23).
