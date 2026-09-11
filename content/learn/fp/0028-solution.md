---
title: "Solution: Tree Unfold — Building a Balanced BST From a Range"
description: "tree_unfold((1,10), ...) builds a 10-node balanced BST whose depth-fold result is 3 — the branching cousin of Lesson 25's unfold, checked with Lesson 23's own depth fold."
lesson_number: 28
track: fp
aliases: ["/learn/0028-solution/"]
concept: "Tree unfold"
stage: 4
layout: solution
role: solution
builds_on: [21, 23, 25]
skin: chalkboard
---

### Warm-up recall answer

`make_multiplier(3)` closes over `k = 3`; calling `m3(7)` returns `3 * 7 = 21`. **21.**

---

### Part 1 — `tree_unfold((1, 4), ...)`

`(1,4)`: not empty. `value = (1+4)//2 = 2`. `left_seed = (1, 1)`, `right_seed = (3, 4)`.

- `(1,1)`: `value=1`, `left_seed=(1,0)` → `pred` fires (`1>0`) → `Leaf`. `right_seed=(2,1)` → `pred`
  fires (`2>1`) → `Leaf`. So `(1,1) → Node(1, Leaf, Leaf)`.
- `(3,4)`: `value=(3+4)//2=3`, `left_seed=(3,2)` → `pred` fires → `Leaf`. `right_seed=(4,4)` →
  `value=4`, both children empty → `Node(4, Leaf, Leaf)`. So `(3,4) → Node(3, Leaf, Node(4, Leaf, Leaf))`.

```
Node(2,
  Node(1, Leaf, Leaf),
  Node(3, Leaf, Node(4, Leaf, Leaf)))
```

```
      2
     / \
    1   3
         \
          4
```

---

### Part 2 — `tree_unfold((1, 10), ...)`

`(1,10)`: `value=(1+10)//2=5`. `left_seed=(1,4)`, `right_seed=(6,10)`.

`(1,4)` is exactly Part 1's tree, rooted at `2`.

`(6,10)`: `value=(6+10)//2=8`. `left_seed=(6,7)`, `right_seed=(9,10)`.
- `(6,7)`: `value=6`, `left_seed=(6,5)`→`Leaf`, `right_seed=(7,7)`→`Node(7,Leaf,Leaf)`. Gives
  `Node(6, Leaf, Node(7, Leaf, Leaf))`.
- `(9,10)`: `value=9`, `left_seed=(9,8)`→`Leaf`, `right_seed=(10,10)`→`Node(10,Leaf,Leaf)`. Gives
  `Node(9, Leaf, Node(10, Leaf, Leaf))`.

```
              5
          /       \
         2          8
        / \        / \
       1   3      6    9
            \      \    \
             4      7    10
```

---

### Part 3 — The graded answer: depth 3

Fold bottom-up with `leaf_val = -1`, `node_fn(v, l, r) = 1 + max(l, r)`:

```
Node(1,Leaf,Leaf)  = 0        Node(4,Leaf,Leaf)  = 0        Node(7,Leaf,Leaf) = 0
Node(3,Leaf,4-node)= 1+max(-1,0)=1                          Node(6,Leaf,7-node)=1+max(-1,0)=1
Node(2, 1-node, 3-node) = 1+max(0,1) = 2                    Node(10,Leaf,Leaf)=0
                                                             Node(9,Leaf,10-node)=1+max(-1,0)=1
                                                             Node(8, 6-node, 9-node)=1+max(1,1)=2

Node(5, 2-node(2), 8-node(2)) = 1 + max(2,2) = 3
```

**Depth = 3.** Sanity check: a balanced tree over 10 elements has height on the order of
`log2(10) ≈ 3.3`, so a depth of 3 is exactly what "balanced" should produce — nowhere near the worst
case of 9 you'd get from an unbalanced chain.

---

### Part 4 — Why the midpoint (not the low end)

If `value` always picked `s[0]`, every node would take the *entire remaining range minus one
element* as its right child and an empty range as its left child. That builds a pure right-leaning
chain — the same shape as inserting `1, 2, 3, …, n` one at a time into a naive (non-balancing) BST.
Depth would grow **linearly** with `n` (`n - 1` edges for `n` nodes), not logarithmically. The
midpoint is what makes the two child seeds roughly equal in size at every level, which is exactly
what keeps depth at `O(log n)`.

---

### The pattern

`tree_unfold` is structurally identical to `unfold` — a predicate, a value extractor, functions to
produce the next seed(s) — with the only change being *how many* "next seed" functions the shape of
the target structure requires. A list has one tail, so one `step`. A binary tree has two children,
so two seed functions. An n-ary tree would need a function producing a *list* of child seeds. The
recursion scheme generalizes to whatever branching factor the data type has; a fold correspondingly
needs one "combine" argument per constructor field of that type — the numeric proof you just ran
(the depth-fold from Lesson 23) is a fold consuming exactly the structure this unfold just built.

**Why this matters for parallelism**: `left_seed(seed)` and `right_seed(seed)` depend only on the
current seed, never on each other — so the two recursive `tree_unfold` calls that build the left and
right subtrees are fully independent and can run in parallel, exactly like the fold in Lesson 23
that later consumes them.

**Next**: you just built a tree, then separately folded it to get a depth. Lesson 29 fuses those two
passes into one function that never builds the intermediate tree at all.
