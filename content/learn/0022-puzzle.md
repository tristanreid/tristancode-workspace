---
title: "Mirroring and Summing a Binary Tree"
description: "Two more recursive operations on trees: mirror swaps left and right at every level; sum_tree aggregates all node values. One of them has a common mistake that only shows up on asymmetric trees."
lesson_number: 22
concept: "Tree recursion"
stage: 3
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [21]
skin: chalkboard
---

**Terms (standalone):**

- **Binary tree**: `Tree = Leaf | Node(value: Int, left: Tree, right: Tree)`. A `Leaf` is empty; a `Node` carries a value and two subtrees. (Introduced in Lesson 21.)
- **Structural recursion**: process a tree by recursing on its subtrees, mirroring the type definition. Every tree function has a `Leaf` arm (base case) and a `Node` arm (recursive case).
- **Mirror**: a transformation that produces a new tree with every node's left and right children swapped — recursively at every level.

---

Work with this tree throughout:

```
        5
       / \
      3   8
     /     \
    1       9
```

```python
tree = Node(5,
    Node(3,
        Node(1, Leaf(), Leaf()),
        Leaf()),
    Node(8,
        Leaf(),
        Node(9, Leaf(), Leaf())))
```

---

### Part 1 — `mirror(t: Tree) -> Tree`

Write a function that returns a new tree that is the mirror image of `t`. In the mirrored tree, every node's left and right children are swapped — and so are their children's children, all the way down.

The common mistake: only swapping the top level. Make sure your implementation recurses into *both* subtrees.

Expected result (draw or describe the mirrored tree for the example above):

```
        5
       / \
      8   3
     /     \
    9       1
```

---

### Part 2 — `sum_tree(t: Tree) -> Int`

Return the sum of all `Node` values in the tree. A `Leaf` contributes 0.

Expected: `sum_tree(tree) = 1 + 3 + 5 + 8 + 9 = 26`

---

### Part 3 — Trace `mirror` on the example tree

Step through `mirror(tree)` explicitly. Show the `Node` constructed at each level. This is harder than tracing `size` or `depth` because the return type is a tree, not an integer — you must track nested structure, not just a number.

---

### Part 4 — Challenge

After mirroring twice, do you get back the original tree? That is, does `mirror(mirror(t)) == t` for all trees `t`?

Argue yes or no from the definition alone (you do not need to run code). What property of the mirror operation guarantees this?
