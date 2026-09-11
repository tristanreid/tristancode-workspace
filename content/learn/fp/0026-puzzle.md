---
title: "When Bool Isn't Enough: Enriching a Tree Fold"
description: "A property like 'is this a valid BST' looks like a yes/no question, but Bool can't carry it through a fold. Enrich the result type — with a distinct empty-case value — and the bug disappears."
lesson_number: 26
track: fp
aliases: ["/learn/0026-puzzle/"]
concept: "Fold with an enriched result type"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [21, 23]
skin: chalkboard
numeric:
  question: "Given the tree below, how many node values violate the true binary-search-tree invariant once you account for every ancestor's constraint (not just each node's immediate parent)?"
  answer: 1
  tolerance: 0
  unit: "node(s)"
---

**Warm-up recall (Lesson 18).** `reduce(init, f, list)` folds a list into one value by repeatedly
applying `f(acc, x)`, left to right, starting from `init`. Using `reduce`, compute the *product* of
`[2, 3, 4, 5]` (not the sum — that's the new setting here). Keep your number; the solution confirms
it before moving on.

---

**Terms (standalone, from Lessons 21 and 23):**

- **Binary tree**: `Tree = Leaf | Node(value: Int, left: Tree, right: Tree)` — either empty, or a
  value with two subtrees.
- **Tree fold** (`tree_fold(leaf_val, node_fn, t)`): replaces every `Leaf` with `leaf_val` and every
  `Node(v, l, r)` with `node_fn(v, fold(l), fold(r))`, working bottom-up. The result type `R` is
  whatever type `leaf_val` and `node_fn` produce — it can be `Int`, `Tree`, `String`, or anything
  else.

A **binary search tree (BST)** is a binary tree where, for *every* node, every value in its left
subtree is less than the node's value, and every value in its right subtree is greater. Crucially,
this must hold against *every ancestor*, not just the immediate parent — a value two levels down
still has to respect a constraint set by its grandparent.

### The tempting (and wrong) approach

It's natural to reach for `Bool` as the result type: `is_bst(t) = tree_fold(True, node_fn, t)`,
where `node_fn(v, left_ok, right_ok)` checks `left_ok and right_ok and left.max < v < right.min`.
The problem: once you're inside `node_fn`, you only have `True`/`False` from each subtree — the
actual values that subtree contains are gone. You can't check "less than `v`" against a `Bool`.

Here's the tree to test that on:

```
        10
       /  \
      5    15
          /  \
         6    20
```

```python
tree = Node(10,
    Node(5, Leaf(), Leaf()),
    Node(15,
        Node(6, Leaf(), Leaf()),
        Node(20, Leaf(), Leaf())))
```

---

### Part 1 — Check it locally, node by node

Walk the tree and, at each `Node`, check only the immediate parent/child relationship: is the left
child's value less than this node's value, and the right child's value greater? Does every single
node pass that local check?

---

### Part 2 — Check it against full ancestry

Now check the *real* invariant: for each node, does its value respect every constraint imposed by
every ancestor above it (not just its direct parent)? Specifically: node `6` sits in the right
subtree of `10` — what does that require of `6`, and does `6` satisfy it?

---

### Part 3 — Design the fix: what must `R` be?

`Bool` failed because it threw away the information `node_fn` needed. Design a result type `R` that
carries enough information to check the invariant correctly — as a tuple. Think about:

- What two facts about a subtree does a parent need, to check whether attaching this subtree at a
  given value is legal?
- What should `leaf_val` be for an **empty** subtree — and does it need to be *distinct* from
  whatever value you'd use to mean "invalid"? (Hint: don't reach for `None` for both. `None` can't
  be compared with `<`, and using it for two different meanings — "there's nothing here" vs. "this
  subtree broke the rule" — makes those two cases indistinguishable to the code that combines them.)

---

### Part 4 — The graded question (above)

Using the *true* invariant from Part 2 (full ancestry, not just local parent/child), count how many
node **values** in the tree above actually violate the BST property. Enter that count in the numeric
box.
