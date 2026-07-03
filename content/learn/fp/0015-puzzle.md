---
title: "Build the Fold"
description: "Implement foldl from scratch, trace it carefully, and use it to write max_element — where getting the initial value wrong breaks everything."
lesson_number: 15
track: fp
aliases: ["/learn/0015-puzzle/"]
concept: "Fold / reduce"
stage: 2
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [12, 13, 14]
skin: chalkboard
---

`foldl` (also called `reduce` or `foldLeft`) is the single most powerful list combinator. Every
list operation you have written — sum, length, reverse, map, filter — can be re-expressed as a
fold. This lesson builds it from scratch, and then puts it under stress.

**Terms used here (standalone):**

- **Fold (foldl)**: consumes a list by combining elements one-at-a-time with an accumulator. Takes
  three arguments: a combining function `f`, an initial accumulator value `init`, and a list `xs`.
  Processes from left to right:
  ```
  foldl(f, init, [a, b, c]) = f(f(f(init, a), b), c)
  ```
- **Accumulator**: a value carried forward through each step, updated by the combining function.
- **Combining function**: `f(acc, x)` takes the current accumulator and the current element,
  returns the new accumulator.

---

### Part 1 — Implement `foldl`

Write `foldl(f, init, xs)` recursively. Base case: empty list → return `init`. Recursive case:
apply `f` to the accumulator and the head, recurse on the tail with the new accumulator.

```python
foldl(lambda acc, x: acc + x, 0, [1, 2, 3, 4])   # 10
foldl(lambda acc, x: acc * x, 1, [1, 2, 3, 4])   # 24
foldl(lambda acc, x: acc + [x], [], [1, 2, 3])    # [1, 2, 3]
```

Note that `foldl` as defined here is already tail-recursive (the recursive call is in tail
position). No accumulator-refactor needed.

---

### Part 2 — Trace it

Expand `foldl(lambda acc, x: acc - x, 100, [10, 20, 5])` step by step. What is the result?
(Do NOT use Python — work it out manually. Fold is left-associative: process left-to-right.)

---

### Part 3 — `max_element` via `foldl`

Write `max_element(xs)` using only `foldl` — no explicit recursion of your own. It should return
the maximum element of a non-empty list.

```python
max_element([3, 1, 4, 1, 5, 9, 2, 6])   # 9
max_element([7])                         # 7
```

**The hard part**: what is `init`? You cannot use `0` (the list might be all negative). You cannot
use `None` without branching. Think about what the initial accumulator should be for a max fold —
and why getting it wrong silently produces a wrong answer for lists with all-negative elements.

(Hint: one clean solution avoids `init` entirely by treating `xs[0]` as the seed.)
