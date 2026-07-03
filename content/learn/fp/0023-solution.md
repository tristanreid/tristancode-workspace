---
title: "Solution: Fold as Elimination: The Tree Fold"
description: "tree_fold replaces each constructor with a value/function; the result type is determined by leaf_val; every tree operation is a catamorphism."
lesson_number: 23
track: fp
aliases: ["/learn/0023-solution/"]
concept: "Fold over ADT"
stage: 3
layout: solution
role: solution
builds_on: [15, 21, 22]
skin: chalkboard
---

### Part 1 — `size` as a tree fold

```python
size = lambda t: tree_fold(
    0,                               # leaf_val: a Leaf has 0 nodes
    lambda v, l_sz, r_sz: 1 + l_sz + r_sz,   # node_fn: 1 + left_size + right_size
    t)
```

`v` (the node's stored integer) is ignored — `size` doesn't care about values, only structure.

---

### Part 2 — `sum_tree` and `depth`

**`sum_tree`:**

```python
sum_tree = lambda t: tree_fold(
    0,
    lambda v, l_sum, r_sum: v + l_sum + r_sum,
    t)
```

Unlike `size`, `v` is used — the node's value is added into the accumulation.

**`depth`:**

```python
depth = lambda t: tree_fold(
    -1,                              # leaf_val: -1 is the sentinel (not 0!)
    lambda v, l_d, r_d: 1 + max(l_d, r_d),
    t)
```

`leaf_val = -1` because depth counts *edges* on the longest path. A `Leaf` is a dead end; its depth is -1 so that the `+1` contributed by the parent node nets to 0 (correct: a single node has depth 0). Using `leaf_val = 0` would make every single-node tree report depth 1 instead of 0.

The result type of `depth` is `Int`, same as `size` and `sum_tree` — but the `leaf_val` and `node_fn` differ.

---

### Part 3 — `mirror` as a tree fold

```python
mirror = lambda t: tree_fold(
    Leaf(),                          # leaf_val: mirror of an empty tree is empty
    lambda v, l_m, r_m: Node(v, r_m, l_m),   # swap the mirrored subtrees
    t)
```

The crucial point: `node_fn` returns `Node(v, r_m, l_m)` — the right-mirrored result goes into the left slot, and vice versa. The fold handles the recursion; `node_fn` receives *already-mirrored* subtrees and just has to place them correctly.

The result type here is `Tree` (not `Int`). `leaf_val` is a `Tree` (`Leaf()`); `node_fn` returns a `Tree`. The type of `tree_fold`'s result is whatever type `leaf_val` and `node_fn` produce.

---

### Part 4 — What determines the result type?

The result type `R` is the type of `leaf_val` and the return type of `node_fn`. The signature (informally):

```
tree_fold : (R, (Int, R, R) -> R, Tree) -> R
```

- `leaf_val : R`
- `node_fn : (Int, R, R) -> R`
- result: `R`

`R` can be *any* type:
- `Int` → computes a number (`size`, `depth`, `sum_tree`)
- `Tree` → produces a new tree (`mirror`)
- `String` → renders the tree as text
- `List[Int]` → collects node values in some order (in-order traversal, etc.)
- `Bool` → checks a property of the tree

The fold is a *universal eliminator* for trees. This is the deep connection to the list fold from Lesson 15:

| Structure | Constructor 1 | Constructor 2 | fold signature |
|-----------|--------------|--------------|----------------|
| List      | `Nil` → `init` | `Cons(h, t)` → `f(h, fold(t))` | `foldl(init, f, list)` |
| Tree      | `Leaf` → `leaf_val` | `Node(v,l,r)` → `node_fn(v, fold(l), fold(r))` | `tree_fold(leaf_val, node_fn, tree)` |

Both follow the same principle: **a fold replaces each constructor with a value or function, and processes the structure bottom-up**. This is what "fold as elimination" means.

---

### Why this matters for parallelism

`tree_fold` processes both subtrees independently before combining them in `node_fn`. The two recursive calls — `tree_fold(..., left)` and `tree_fold(..., right)` — have *no dependency on each other*. They can run in parallel.

This is the first hint of the Stage 7 payoff: tree-shaped reductions (including `reduce` / parallel `foldl`) are parallelisable precisely because the subproblems are independent. Sequential `foldl` cannot be parallelised because each step depends on the previous accumulator. Tree fold has no such dependency.

**Next**: apply this principle to a richer ADT — an arithmetic expression tree — and see how multiple different "interpretations" are just different choices of fold parameters (Lesson 24).
