---
title: "Runaway Recursion: When Eager Definitions Explode"
description: "Self-referential definitions that work in lazy languages blow the stack in eager ones. Learn exactly why, predict which recursive definitions terminate, and understand the role of guarded recursion in safe infinite structures."
lesson_number: 30
track: fp
aliases: ["/learn/0030-puzzle/"]
concept: "Runaway recursion"
stage: 5
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [3, 28, 29]
skin: chalkboard
mcq:
  question: "What happens when you call `bad_ones()` in Python?\n\n```python\ndef bad_ones():\n    return [1] + bad_ones()\n```"
  options:
    - "It loops forever, producing an ever-growing list until you kill the process"
    - "It immediately raises RecursionError: maximum recursion depth exceeded"
    - "It returns [1, 1, 1, ...] — Python handles infinite recursion via lazy list construction"
    - "It returns [1] — Python detects the cycle and stops"
  correct: 1
---

In Lesson 29 you wrote `ones()` using a thunk:

```python
def ones():
    return Cons(1, lambda: ones())   # works fine
```

What if you forget the `lambda:`?

```python
def bad_ones():
    return [1] + bad_ones()          # ???
```

And in Haskell, no lambda is needed at all:

```haskell
ones = 1 : ones    -- works in Haskell
```

Why does the thunk version work, the bare Python version blow up, and the Haskell version work without any explicit thunk?

**Terms (standalone):**

- **Eager evaluation** (from Lesson 28): argument expressions are evaluated before the function call. The call stack grows by one frame per pending function call.
- **Stack frame**: each function call adds a frame to the call stack to record where to return and what local variables hold. A *stack overflow* (Python: `RecursionError`) occurs when the call stack exceeds its limit (typically ~1000 frames in Python).
- **Guarded recursion**: a recursive reference that is *inside* a data constructor (like `Cons`) rather than naked in an expression. In a lazy language, constructors don't evaluate their arguments — they guard the recursive reference. In an eager language, you must use a thunk to achieve the same effect.
- **Circular reference**: a value that refers to itself. Lazy languages can represent truly circular in-memory structures (one node pointing back to itself); eager languages cannot build them directly.

---

### Part 1 — MCQ (above): what does `bad_ones()` do?

Think before you answer. At what point in the execution does `bad_ones()` need to call itself again? Does it ever return a value before needing the recursive result?

---

### Part 2 — Trace the failure

Trace the first four calls of `bad_ones()` and explain why the stack overflows. At what point would the function ever be able to compute `[1] + ...`?

---

### Part 3 — Compare to the thunk version

```python
def good_ones():
    return Cons(1, lambda: good_ones())
```

`good_ones()` also mentions itself. Trace one call: what does it return, and does it call `good_ones()` again before returning?

Why does the stack stay shallow?

---

### Part 4 — MCQ: Haskell's `ones`

In Haskell, you write:

```haskell
ones = 1 : ones
```

Haskell does not crash. Which best explains why?

(a) Haskell is also eager but detects infinite recursion and short-circuits.
(b) `:` is a data constructor, not a function; Haskell's constructors are lazy — they don't evaluate their arguments at construction time. The tail `ones` is not forced until a consumer demands it.
(c) Haskell limits list length at compile time to prevent overflow.
(d) Haskell converts the circular definition to an iterative generator automatically.

---

### Part 5 — Four definitions: which terminate?

Predict the outcome for each in Python. For ones that crash, explain why; for ones that return, give the value.

```python
# A — no base case
def f(n):
    return f(n - 1) + 1   # called as f(5)

# B — with base case
def g(n):
    if n == 0: return 0
    return g(n - 1) + 1   # called as g(5)

# C — returns a thunk
def h():
    return lambda: h()   # called as h()

# D — direct self-call in return position
def k():
    return k()           # called as k()
```
