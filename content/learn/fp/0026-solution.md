---
title: "Solution: When Bool Isn't Enough — Enriching a Tree Fold"
description: "Bool can't carry the range information a BST check needs. Enrich R into a (is_valid, min, max) tuple with +inf/-inf as the empty-case sentinel — not None doing double duty — and the fold catches the violation the naive local check misses."
lesson_number: 26
track: fp
aliases: ["/learn/0026-solution/"]
concept: "Fold with an enriched result type"
stage: 3
layout: solution
role: solution
builds_on: [21, 23]
skin: chalkboard
---

### Warm-up recall answer

`reduce(0... )` — actually multiplication needs `init = 1` (the identity for `*`, not `+`).
`reduce(1, lambda acc, x: acc * x, [2, 3, 4, 5])`: `1*2=2`, `2*3=6`, `6*4=24`, `24*5=120`. **120.**
(If you used `init = 0`, you'd have gotten 0 for everything — a reminder that the identity element
has to match the operation.)

---

### Part 1 — Local check: everything passes

At `10`: left child `5 < 10` ✓, right child `15 > 10` ✓.
At `15`: left child `6 < 15` ✓, right child `20 > 15` ✓.
`5`, `6`, `20` are leaves — trivially fine.

**Every node passes the local, parent-only check.** A `Bool`-returning fold that only compares a
node to its immediate children would report this tree as a valid BST.

---

### Part 2 — Full ancestry: it's broken

Node `6` is in the **right subtree of `10`**. The BST invariant says every value in `10`'s right
subtree must be greater than `10` — not just greater than `10`'s immediate right child (`15`). `6`
is less than `10`, so it violates a constraint from its *grandparent*, even though it happily
satisfies its own parent (`6 < 15`). **One node value violates the invariant: `6`.** That's the
graded answer — **1**.

This is exactly the gap a local check can't see: legality is a property relative to the whole path
of ancestors, and a fold only ever hands `node_fn` the *already-folded results* of the immediate
children — not the ancestor chain above. So the subtree results themselves have to carry the range
information forward.

---

### Part 3 — The enriched result type

`R = (is_valid: Bool, min_val: Int, max_val: Int)` — the validity of the subtree, plus the smallest
and largest values it actually contains.

The empty case needs values that make the *combining* logic work without special-casing "this side
has nothing." Use `+infinity` as the sentinel minimum and `-infinity` as the sentinel maximum for an
empty subtree — **not `None` for both**:

```python
leaf_val = (True, float('inf'), float('-inf'))
```

Why this specific pair, and why not `None`: a real subtree's minimum has to lose every comparison
against "is there something smaller on the left," and its maximum has to lose every comparison
against "is there something bigger on the right," when that side is empty. `+inf` is never less
than anything real; `-inf` is never greater than anything real. So an empty side simply never
constrains its parent — no `if left is None: ...` branch needed anywhere. `None` can't play this
role at all (you can't write `None < v`), which is exactly why using it forces you to special-case,
and why reusing it as *also* the "invalid" marker collapses "there's nothing here" and "something
here is broken" into one indistinguishable value — the mistake the diagnostic caught.

```python
def node_fn(v, left, right):
    l_valid, l_min, l_max = left
    r_valid, r_min, r_max = right
    is_valid = l_valid and r_valid and l_max < v < r_min
    return (is_valid, min(l_min, v), max(r_max, v))

is_bst_info = lambda t: tree_fold(leaf_val, node_fn, t)
```

Note `is_valid` and the range are tracked *together but separately* — one Bool, two numbers — never
merged into a single overloaded value.

---

### Trace on the tree

```
Node(5, Leaf, Leaf)   → (True, 5, 5)
Node(6, Leaf, Leaf)   → (True, 6, 6)
Node(20, Leaf, Leaf)  → (True, 20, 20)

Node(15, (True,6,6), (True,20,20)):
  is_valid = True and True and (6 < 15 < 20) = True
  → (True, 6, 20)

Node(10, (True,5,5), (True,6,20)):
  is_valid = True and True and (5 < 10 < 6)   ← 10 < 6 is FALSE
  → (False, 5, 20)
```

The check that fails is `v < r_min`, i.e. `10 < 6`. `r_min = 6` is the *minimum value anywhere in
10's right subtree* — not just its immediate child — because `min`/`max` accumulate across the
whole subtree on every step. That's precisely the ancestor-spanning information a `Bool` couldn't
hold. The fold correctly reports `is_valid = False` at the root, with the violation traced to the
exact comparison that catches it.

---

### The pattern

**A fold's result type has to carry everything `node_fn` needs to make its decision — no more, no
less.** `Bool` is compositional for properties like "is every value even" (a child's `True`/`False`
is all a parent needs). It is *not* compositional for properties like BST-validity, balance, or
k-th-smallest, where the correctness of a subtree depends on facts about its *contents* (range,
height, count) that a parent must combine, not just a pass/fail flag. When a property isn't
compositional as `Bool`, enrich `R` into a tuple that carries exactly the missing facts — and give
the empty case a value chosen so it never has to be special-cased in the combining logic.

**Why this matters for parallelism**: `node_fn` still only reads the *already-folded* results of
`left` and `right` — it never re-inspects the raw subtrees. That means the two recursive calls
`tree_fold(..., left)` and `tree_fold(..., right)` remain fully independent of each other and can
run in parallel, exactly as in Lesson 23 — enriching `R` doesn't cost you that property, because the
independence lived in the fold's *shape*, not in what type `R` happens to be.

**Next**: the dual problem. Lesson 25's `unfold` also has a "what does the seed carry" trap — when
the seed needs to track *control state* beyond the value it's producing. Lesson 27 walks into that
trap in a brand-new domain, then out of it.
