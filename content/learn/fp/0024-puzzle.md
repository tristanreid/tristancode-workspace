---
title: "Represent, Then Erase: Expression Trees"
description: "Encode arithmetic expressions as an ADT with three constructors, write a generalized fold over them, and derive three completely different interpretations — evaluate, count operations, and pretty-print — using only fold parameters."
lesson_number: 24
track: fp
aliases: ["/learn/0024-puzzle/"]
concept: "Data as programs"
stage: 3
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [23]
skin: chalkboard
---

The tree fold from Lesson 23 had two constructors: `Leaf` and `Node`. ADTs can have more. Here you will work with a three-constructor expression tree and see that the fold generalizes cleanly.

**Terms (standalone):**

- **Expression tree** (Expr): an ADT representing arithmetic:
  - `Num(n: Int)` — a literal integer (no subtrees; a leaf-like constructor)
  - `Add(left: Expr, right: Expr)` — sum of two sub-expressions
  - `Mul(left: Expr, right: Expr)` — product of two sub-expressions
- **Fold over an ADT**: replace each constructor with a supplied value/function, process bottom-up.
- **Interpretation**: a specific assignment of values/functions to the fold parameters. Different interpretations of the same data produce different results.

```python
@dataclass
class Num:
    n: int

@dataclass
class Add:
    left: "Expr"
    right: "Expr"

@dataclass
class Mul:
    left: "Expr"
    right: "Expr"

Expr = Num | Add | Mul
```

The expression `(1 + 2) * (3 + 4)` as data:

```python
expr = Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4)))
```

---

### The fold

`expr_fold` takes one argument per constructor:

```python
def expr_fold(num_fn, add_fn, mul_fn, e):
    match e:
        case Num(n):
            return num_fn(n)
        case Add(l, r):
            return add_fn(expr_fold(num_fn, add_fn, mul_fn, l),
                          expr_fold(num_fn, add_fn, mul_fn, r))
        case Mul(l, r):
            return mul_fn(expr_fold(num_fn, add_fn, mul_fn, l),
                          expr_fold(num_fn, add_fn, mul_fn, r))
```

Note: `add_fn` and `mul_fn` each receive *two* already-folded results (not the sub-expressions themselves). `num_fn` receives the raw integer `n` from the `Num` constructor.

---

### Part 1 — `evaluate`

Write `evaluate` as a call to `expr_fold`. It should compute the integer result.

```python
evaluate(Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4))))   # 21
evaluate(Add(Num(10), Mul(Num(3), Num(4))))                # 22
```

What are `num_fn`, `add_fn`, `mul_fn`?

---

### Part 2 — `op_count`

Write `op_count` as a call to `expr_fold`. It counts the total number of `Add` and `Mul` nodes. Literal `Num` nodes are not operations.

```python
op_count(Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4))))   # 3  (two Adds, one Mul)
op_count(Num(42))                                          # 0
op_count(Add(Num(1), Num(2)))                              # 1
```

---

### Part 3 — `pretty_print`

Write `pretty_print` as a call to `expr_fold`. It renders the expression as a fully-parenthesised string.

```python
pretty_print(Mul(Add(Num(1), Num(2)), Add(Num(3), Num(4))))   # "((1 + 2) * (3 + 4))"
pretty_print(Add(Num(10), Mul(Num(3), Num(4))))                # "(10 + (3 * 4))"
pretty_print(Num(7))                                           # "7"
```

Note: `num_fn` here returns a `String`, not an `Int`. The result type of the fold changes depending on the parameters — just as in Lesson 23.

---

### Part 4 — Trace and think

Trace `expr_fold` on `Add(Num(1), Num(2))` using the `evaluate` parameters, showing the value at each node. Then answer: can you write an interpretation that counts the *total number of nodes* (Num + Add + Mul)? What are `num_fn`, `add_fn`, `mul_fn`?

---

### Part 5 — Challenge

The same data (`expr`) can be evaluated to an integer, counted for operations, or printed as a string — without modifying the data or writing new recursive functions. Only the fold parameters change.

What does this design pattern enable that a single hardcoded `eval` method on each class does *not*? (One or two sentences.)
