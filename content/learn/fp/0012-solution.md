---
title: "Solution: Tail Calls and the Accumulator Pattern"
description: "Identifying tail vs non-tail calls, the accumulator refactor, and why doubly-recursive functions can't be tail-called in the obvious way."
lesson_number: 12
track: fp
aliases: ["/learn/0012-solution/"]
concept: "Tail recursion"
stage: 1
layout: solution
role: solution
builds_on: [5, 6]
skin: chalkboard
---

### Part 1 — Answers

**A — `sum_list`: NOT a tail call.**

```python
return xs[0] + sum_list(xs[1:])
```

After `sum_list(xs[1:])` returns, you still have to add `xs[0]` to it. The `+` is pending
work. The call is wrapped inside another operation — not in tail position.

**B — `sum_tail`: IS a tail call.**

```python
return sum_tail(xs[1:], acc + xs[0])
```

The result of the recursive call is returned *directly* — no further operation. `acc + xs[0]`
is computed *before* the call, as the new argument. After the call completes, the caller just
hands back what it received. That's tail position.

**C — `contains`: IS a tail call.**

```python
return contains(xs[1:], target)
```

The result is returned unchanged. Nothing left to do. Tail call.

### Part 2 — `sum_squares` refactored

```python
def sum_squares_tail(xs, acc=0):
    if xs == []:
        return acc
    return sum_squares_tail(xs[1:], acc + xs[0] ** 2)
```

The square is computed as the new `acc` value *before* the recursive call, so the call is in
tail position. Trace for `[1, 2, 3]`:

```
sum_squares_tail([1,2,3], 0)
  → sum_squares_tail([2,3], 0+1)   = sum_squares_tail([2,3], 1)
  → sum_squares_tail([3],  1+4)   = sum_squares_tail([3],  5)
  → sum_squares_tail([],   5+9)   = sum_squares_tail([],  14)
  → 14
```

No pending arithmetic — the accumulator holds the partial result the whole time. A TCO-capable
runtime replaces each call with a goto to the top of the same frame, making it O(1) stack.

### Part 3 — Can `flatten` be made tail-recursive in the obvious way?

No, not straightforwardly. `flatten` makes *two* recursive calls when the head is a list:

```python
return flatten(xs[0]) + flatten(xs[1:])
```

Even if you put one call in tail position, the other still isn't — you still need both results to
do the final concatenation. Functions with two or more recursive calls (tree-recursive functions)
cannot be turned into simple tail recursion by adding an accumulator. They require a more
sophisticated technique: **continuation-passing style (CPS)**, which makes the "what to do with
the result" an explicit argument instead of an implicit stack frame. That's Stage 6 material.
For doubly-recursive functions, you typically accept the stack depth or use an explicit stack
data structure to simulate it.

### Why TCO matters in practice

Python does not implement TCO (Guido van Rossum famously refuses to add it). Schemes, Haskell,
Scala (for direct self-calls), and Bend all do. Writing tail-recursive code in Python is still
valuable — it's clearer and the accumulator argument documents the invariant — but the stack-depth
benefit only appears in runtimes that honour it.

In the parallel runtime model Bend targets, tail calls are additionally important because they
enable *constant-space* looping without heap allocation. "No stack growth" isn't just a nicety;
it's what makes recursive programs feasible at scale when a runtime maps them onto many parallel
workers.

**Stage 1 is done.** You've built the full recursive toolkit for lists: sum, last, length, reverse,
membership, transform, filter, slicing, flatten, and tail calls. Next, we abstract all of that —
functions become first-class values you compose and pass around (Stage 2, Lesson 13).
