---
title: "Solution: Eager vs Lazy Evaluation"
description: "Eager evaluation computes arguments before the call; lazy defers until demanded. Thunks simulate laziness in eager languages. Short-circuit operators are built-in lazy forms. Infinite structures require laziness (Lesson 29)."
lesson_number: 28
concept: "Eager vs lazy evaluation"
stage: 5
layout: solution
role: solution
builds_on: []
skin: chalkboard
---

### MCQ — evaluation order

**Answer: (a) — A prints first.**

Python evaluates subexpressions **left-to-right**. In `trace('A', 1) + trace('B', 2)`, the left operand `trace('A', 1)` is fully evaluated (printing "A", returning 1) before the right operand `trace('B', 2)` is evaluated (printing "B", returning 2). The `+` runs last.

Python's language reference specifies left-to-right evaluation for almost all operators. This is a *consequence* of eager evaluation — all arguments are evaluated before the operator/function runs, in the order they appear.

---

### Part 1 — `always_first(42, 1/0)`

In Python (eager): raises `ZeroDivisionError` **before** the function body runs. Python evaluates both `42` and `1/0` when building the argument list. The division by zero happens during argument evaluation; `always_first` is never entered.

If Python were lazy: `1/0` would not be evaluated when preparing the call. The function body runs, returning `x = 42`. The second argument is never demanded, so the error never occurs. Result: `42`.

The function body makes no difference under eager evaluation — the error is triggered by the call site, not by any use of `y` inside the function.

---

### Part 2 — Thunk prevents the error

```python
always_first_lazy(42, lambda: 1 / 0)
```

`lambda: 1/0` is a **thunk** — creating it is O(1) and incurs no computation. It is just a closure (an object wrapping the expression `1/0`). Python evaluates `lambda: 1/0` eagerly, but evaluating a lambda expression just captures the code and the enclosing scope; it does *not* run the body.

Since `always_first_lazy` never calls `y_thunk()`, the expression `1/0` is never executed. Result: `42`, no error.

The thunk is a manual lazy value: you hand the function a *recipe* rather than a *result*.

---

### Part 3 — Short-circuit as hidden laziness

`my_and(False, 1/0)` raises `ZeroDivisionError`. Python evaluates `1/0` as an argument *before* `my_and` is called. By the time `my_and` checks `if a`, the error has already happened.

Python's built-in `and` operator is not a function — it is a **special form** with lazy semantics baked into the language. `False and expr` evaluates `expr` only if the left side is truthy. The runtime short-circuits.

Fix with thunks:

```python
def my_and_lazy(a, b_thunk):
    if a:
        return b_thunk()   # force only when needed
    return False

my_and_lazy(False, lambda: 1 / 0)   # → False, no error
my_and_lazy(True,  lambda: 42)      # → 42
```

`b_thunk()` is called only if `a` is truthy. When `a` is `False`, the thunk is never forced. This is exactly the semantics of `and`.

**The key insight**: Python's `and`, `or`, and `if` expressions are the *only* built-in lazy forms in Python. Every other operation is eager. If you want laziness elsewhere, you must simulate it with thunks.

---

### Part 4 — Non-terminating argument

**Eager**: `f(loop_forever())` evaluates `loop_forever()` before calling `f`. Since `loop_forever()` never returns, the call site spins forever (or exhausts stack space). `f` is never entered.

**Lazy**: `loop_forever()` is passed as an unevaluated thunk. `f` returns `1` without ever touching `x`. The non-terminating computation is never triggered. The program terminates in O(1).

This is the theoretically important distinction. In a lazy language, a function can be *total* (always terminates) even when passed a non-terminating argument, as long as it never forces that argument. This is what makes infinite structures possible — you build them lazily, consume only what you need.

---

### The thunk pattern — summary

| Eager (default Python) | Lazy (via thunk) |
|------------------------|------------------|
| `f(expensive_expr)` | `f(lambda: expensive_expr)` |
| Evaluated at call site | Evaluated when `thunk()` is called |
| Error if `expensive_expr` throws | Error only if `thunk()` is called |
| Always computed, even if unused | Computed only if demanded |

**When to use thunks in practice:**
- Conditional logic where some branches are expensive or unsafe.
- Arguments that might not be needed (a default-value factory in a dict lookup).
- Building lazy streams (Lesson 29 — this is the core mechanism).

**What you cannot do with thunks (without more machinery):**
- Make a *self-referential* lazy structure without extra care — calling `lambda: f(lambda: f(...))` still recurses at construction time if you're not careful (Lesson 30).

**Next**: Lesson 29 uses thunks as the building block for infinite streams.
