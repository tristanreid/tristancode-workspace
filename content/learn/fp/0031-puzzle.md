---
title: "Tail Calls: The Recursion That Doesn't Grow the Stack"
description: "Why some recursive calls can run in constant stack space in principle — and why Python still blows the stack anyway."
lesson_number: 31
track: fp
aliases: ["/learn/0031-puzzle/"]
concept: "Tail calls & tail-call optimization"
stage: 5
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [6, 12, 30]
skin: chalkboard
mcq:
  question: "Which of these two calls is in *tail position*?\n\n```python\ndef f(n):\n    return 1 + f(n - 1)      # (A)\n\ndef g(n, acc):\n    return g(n - 1, acc + n) # (B)\n```"
  options:
    - "Only (A) — the recursive call happens first"
    - "Only (B) — nothing happens to the result of the recursive call after it returns"
    - "Both — they're both recursive calls in a return statement"
    - "Neither — both need a base case to be valid"
  correct: 1
---

Lesson 30 showed you the cliff edge: naked recursion without a guard blows the stack. This lesson
gives you the concept that explains *why* some recursive functions are one small rewrite away from
running in constant space, while others fundamentally can't be.

**Terms (standalone):**

- **Call stack**: the record of pending function calls. Each call adds a **stack frame** holding
  the function's local variables and the address to resume at once it returns. Frames are freed as
  calls return — but only once they return.
- **Tail position**: the very last action a function performs before it returns — nothing else
  happens to that value afterward. `return f(x)` puts `f(x)` in tail position. `return 1 + f(x)`
  does **not**: after `f(x)` returns, the pending `+ 1` still has to run.
- **Tail call**: a function call that sits in tail position.
- **Tail-call optimization (TCO)**: a compiler/runtime technique that reuses the *current* stack
  frame for a tail call instead of pushing a new one — because there is nothing left to do in the
  current frame after the call returns, the current frame's information is no longer needed at all.
  A tail call turns from "descend and remember to come back" into "just jump," so a recursive
  function using only tail calls can, with TCO, run in **O(1) stack space** no matter how deep the
  recursion goes.

### Part 1 — MCQ (above): which call is in tail position?

Trace what each function does with the *result* of its own recursive call before returning.

---

### Part 2 — Why does frame-reuse only work for tail calls?

Consider `f(n) = 1 + f(n - 1)` again. Suppose a runtime tried to reuse `f(n)`'s stack frame for the
call to `f(n - 1)`, throwing away `f(n)`'s local state. When `f(n - 1)` eventually returns its
value, what information would the runtime need that it just threw away? Be specific about what's
missing.

---

### Part 3 — Rewrite `f` to be tail-recursive

`f(n)` computes `1 + 1 + ... + 1` (n times) via `f(n) = 1 + f(n-1)`, `f(0) = 0`. Rewrite it using
an **accumulator** parameter (the same trick from Lesson 12's tail-recursive `reverse`) so that the
recursive call is the *entire* return expression — nothing pending afterward.

```python
def f(n):
    if n == 0:
        return 0
    return 1 + f(n - 1)

# your version:
def f_tail(n, acc=0):
    ...
```

---

### Part 4 — MCQ: does Python actually get the O(1) stack benefit?

You've now written `f_tail`, a properly tail-recursive function in Python. Call `f_tail(100_000)`.
What happens?

(a) It runs in O(1) stack space and returns 100000, because the recursive call is in tail position.
(b) It raises `RecursionError` — CPython does not perform tail-call optimization, so every call
    (tail position or not) still pushes a new stack frame.
(c) It returns 100000 but takes exponential time.
(d) It silently returns the wrong answer because Python reuses stale accumulator values.

---

### Part 5 — Connect the dots

Given your answer to Part 4: what was the actual practical benefit, if any, of rewriting `f` to be
tail-recursive in Python — if Python won't optimize it anyway? (Hint: think about what a
tail-recursive definition can always be mechanically converted into, by hand, even without runtime
support.)
