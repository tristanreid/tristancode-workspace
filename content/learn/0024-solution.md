---
title: "Solution: Represent, Then Erase: Expression Trees"
description: "Three interpretations of one data structure via fold parameters — evaluate, count, and pretty-print — and the design principle that separates data from its interpretation."
lesson_number: 24
concept: "Data as programs"
stage: 3
layout: solution
role: solution
builds_on: [23]
skin: chalkboard
---

### Part 1 — `evaluate`

```python
evaluate = lambda e: expr_fold(
    lambda n:    n,          # Num(n) → n
    lambda l, r: l + r,     # Add → sum the sub-results
    lambda l, r: l * r,     # Mul → multiply the sub-results
    e)
```

Trace on `Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4)))`:

```
Num(1) → 1
Num(2) → 2
Add(1, 2) → 3

Num(3) → 3
Num(4) → 4
Add(3, 4) → 7

Mul(3, 7) → 21  ✓
```

---

### Part 2 — `op_count`

```python
op_count = lambda e: expr_fold(
    lambda n:    0,          # Num is not an operation
    lambda l, r: 1 + l + r, # Add is 1 op, plus ops in its subtrees
    lambda l, r: 1 + l + r, # Mul is 1 op, plus ops in its subtrees
    e)
```

`add_fn` and `mul_fn` are identical here — both count as one operation and accumulate counts from below. `num_fn` returns 0 because literals are not operations.

```
op_count(Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4))))
  = 1 + (1 + 0 + 0) + (1 + 0 + 0)
  = 1 + 1 + 1 = 3  ✓
```

---

### Part 3 — `pretty_print`

```python
pretty_print = lambda e: expr_fold(
    lambda n:    str(n),                    # Num → the integer as a string
    lambda l, r: f"({l} + {r})",           # Add → parenthesised
    lambda l, r: f"({l} * {r})",           # Mul → parenthesised
    e)
```

The result type is now `String`. `num_fn` converts an integer to a string; `add_fn` and `mul_fn` wrap their string sub-results in parentheses.

```
pretty_print(Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4))))
  = "((1 + 2) * (3 + 4))"  ✓
```

---

### Part 4 — Trace and total node count

Trace of `expr_fold(evaluate params, Add(Num(1), Num(2)))`:

```
expr_fold on Num(1)    → num_fn(1) = 1
expr_fold on Num(2)    → num_fn(2) = 2
expr_fold on Add(...)  → add_fn(1, 2) = 3  ✓
```

**Total node count** (`Num + Add + Mul` all count as 1):

```python
node_count = lambda e: expr_fold(
    lambda n:    1,
    lambda l, r: 1 + l + r,
    lambda l, r: 1 + l + r,
    e)
```

`num_fn` now returns 1 (a `Num` is a node). This is the only difference from `op_count`.

---

### Part 5 — The separation of data from interpretation

When you hardcode `eval()` as a method on each node class, the *interpretation* is baked into the *representation*. Adding a new interpretation (say, symbolic differentiation, or type-checking, or code generation) requires modifying the classes or adding a visitor on top.

With the fold approach, the representation (`Expr` ADT) and the interpretation (`num_fn`, `add_fn`, `mul_fn`) are completely separate. You can add arbitrarily many interpretations without touching the data type. The data structure is pure description; the fold is the mechanism for consuming it.

This is the essence of "represent, then erase": first capture *what* you want to compute as a data structure; then erase the structure into a result by supplying a fold algebra.

---

### What you have built

| Interpretation | `num_fn` | `add_fn` | `mul_fn` | Result type |
|---------------|----------|----------|----------|-------------|
| `evaluate`    | `n`      | `l + r`  | `l * r`  | `Int`       |
| `op_count`    | `0`      | `1+l+r`  | `1+l+r`  | `Int`       |
| `node_count`  | `1`      | `1+l+r`  | `1+l+r`  | `Int`       |
| `pretty_print`| `str(n)` | `"(l+r)"`| `"(l*r)"`| `String`    |

Same data; same fold structure; different logic in the parameters. This is not a niche trick — it is the foundation of compiler design (parse tree → IR → code), query planning (AST → execution plan), and symbolic computation (expression → derivative).

---

### Stage 3 complete

You now have the full algebraic data type toolkit:

- **Sum types** (Lesson 19): a value is exactly one of a fixed set of variants. Illegal states are unrepresentable.
- **Pattern matching** (Lesson 20): exhaustive case analysis, checked at compile time.
- **Recursive types + structural recursion** (Lessons 21–22): binary trees, mirror, sum, depth.
- **Fold as elimination** (Lesson 23): the universal consumer for any recursive ADT.
- **Multiple interpretations of one representation** (Lesson 24): the fold algebra pattern.

Stage 4 is the dual: instead of consuming data with folds, you will *generate* data from seeds — the unfold (or corecursion). That is the mechanism behind `range`, `iterate`, and infinite structures.
