---
title: "Eager vs Lazy Evaluation"
description: "Most languages evaluate arguments before a function runs (eager). Lazy evaluation defers computation until the value is needed. Understand thunks, short-circuit operators, and when laziness saves you from an error — or an infinite loop."
lesson_number: 28
track: fp
aliases: ["/learn/0028-puzzle/"]
concept: "Eager vs lazy evaluation"
stage: 5
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: []
skin: chalkboard
mcq:
  question: "In Python, which print fires first?\n\n```python\ndef trace(label, x):\n    print(label)\n    return x\n\nresult = trace('A', 1) + trace('B', 2)\n```"
  options:
    - "A — Python evaluates subexpressions left-to-right"
    - "B — the right operand of + is evaluated first"
    - "Undefined — Python's language spec does not guarantee evaluation order for operands of +"
    - "Neither — the prints are deferred until result is used"
  correct: 0
---

Most languages you use day-to-day — Python, TypeScript, Scala, Java — **evaluate arguments before passing them** to a function. This is *eager evaluation* (also: strict evaluation). A few languages — Haskell, Clojure's `lazy-seq`, Racket's `delay` — defer evaluation until the value is *demanded*: *lazy evaluation*.

The difference matters as soon as you care about: (a) avoiding unnecessary work, (b) short-circuit logic, (c) infinite structures (coming in Lesson 29).

**Terms:**

- **Eager / strict evaluation**: an argument expression is evaluated *before* the function call. By the time the function body runs, all argument values are computed.
- **Lazy / non-strict evaluation**: an argument expression is evaluated *when and only when its value is demanded* — possibly never.
- **Thunk**: an explicit encoding of a lazy value in an eager language — a zero-argument lambda: `lambda: <expr>`. Creating the thunk is cheap; the expression runs only when you call `thunk()`.

---

### Part 1 — Predict: what does `always_first` do?

```python
def always_first(x, y):
    return x

always_first(42, 1 / 0)   # ?
```

In Python (eager): what happens, and *when* does it happen? (Before the function body runs, or inside it?)

If Python were lazy: what would happen instead?

---

### Part 2 — Manual thunking

Python gives you an escape hatch: wrap the risky argument in a lambda.

```python
def always_first_lazy(x, y_thunk):
    return x   # never calls y_thunk()

always_first_lazy(42, lambda: 1 / 0)   # ?
```

Why does wrapping in `lambda:` prevent the error?

---

### Part 3 — Short-circuit as hidden laziness

Python's `and` and `or` are not regular functions:

```python
False and (1 / 0)   # → False, no error
True  or  (1 / 0)   # → True,  no error
```

But a custom `my_and` function isn't lazy:

```python
def my_and(a, b):
    if a: return b
    return False

my_and(False, 1 / 0)   # ?
```

What happens, and why does `and` (the built-in operator) succeed where `my_and` fails? Fix `my_and` using a thunk so it short-circuits correctly.

---

### Part 4 — Lazy vs eager on a non-terminating argument

```python
def f(x):
    return 1

f(loop_forever())   # loop_forever() never returns
```

In an eager language: what happens when you call `f(loop_forever())`?
In a lazy language: what happens?

---

### The question above

The MCQ at the top of this puzzle asks about *evaluation order* — a specific, testable consequence of Python's eager semantics. Think it through before reading the solution.

After answering, confirm your mental model against Parts 1–4.
