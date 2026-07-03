---
title: "Tail Calls and the Accumulator Pattern"
description: "Identify which recursive calls are in tail position, refactor a non-tail-recursive function using an accumulator, and understand what a runtime gains from it."
lesson_number: 12
track: fp
aliases: ["/learn/0012-puzzle/"]
concept: "Tail recursion"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [5, 6]
skin: chalkboard
---

You've used accumulators in Lessons 5 and 6 to make counting and reversing O(n). This lesson
makes the underlying principle explicit.

**Terms used here (standalone):**

- **Tail call**: a call where the *return value of the recursive call* is immediately returned —
  nothing is left to do with the result once it comes back. Formally, the call is in *tail
  position*.
- **Non-tail call**: a call where there's still work to do with the result before returning (like
  adding `1 +` to it, or prepending `[x] +`).
- **Tail-recursive function**: one whose recursive calls are all tail calls.
- **TCO (tail-call optimisation)**: an optimisation some runtimes perform — if a call is in tail
  position, reuse the current stack frame instead of pushing a new one. The recursion becomes
  as cheap as a loop, with constant stack depth.

---

### Part 1 — Spot the tail call (or lack thereof)

Label each recursive call as **tail** or **not-tail**:

```python
# A
def sum_list(xs):
    if xs == []:
        return 0
    return xs[0] + sum_list(xs[1:])   # tail call?

# B
def sum_tail(xs, acc=0):
    if xs == []:
        return acc
    return sum_tail(xs[1:], acc + xs[0])   # tail call?

# C
def contains(xs, target):
    if xs == []:
        return False
    if xs[0] == target:
        return True
    return contains(xs[1:], target)   # tail call?
```

---

### Part 2 — Refactor to tail-recursive

The function below is correct but not tail-recursive. Rewrite it as a tail-recursive function with
an accumulator, so a TCO-capable runtime could run it in constant stack space.

```python
def sum_squares(xs):
    """Return the sum of squares of all elements in xs."""
    if xs == []:
        return 0
    return xs[0] ** 2 + sum_squares(xs[1:])
```

Your rewrite: `def sum_squares_tail(xs, acc=0): ...`

---

### Part 3 (think, don't code)

Can `flatten` from Lesson 11 be made tail-recursive? Why or why not?
