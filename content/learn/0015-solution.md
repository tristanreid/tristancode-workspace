---
title: "Solution: Build the Fold"
description: "foldl implemented and traced, the init-value trap for max, and why fold is the universal list consumer."
lesson_number: 15
concept: "Fold / reduce"
stage: 2
layout: solution
role: solution
builds_on: [12, 13, 14]
skin: chalkboard
---

### Part 1 — `foldl`

```python
def foldl(f, init, xs):
    if xs == []:
        return init
    return foldl(f, f(init, xs[0]), xs[1:])
```

Each recursive call passes the updated accumulator `f(init, xs[0])` as the new `init`. The
recursive call is in tail position — this is already tail-recursive and runs in constant stack
space in a TCO-capable runtime.

---

### Part 2 — Trace

`foldl(lambda acc, x: acc - x, 100, [10, 20, 5])`:

```
foldl(sub, 100, [10, 20, 5])
  = foldl(sub, 100-10, [20, 5])   = foldl(sub, 90, [20, 5])
  = foldl(sub, 90-20,  [5])       = foldl(sub, 70, [5])
  = foldl(sub, 70-5,   [])        = foldl(sub, 65, [])
  = 65
```

Equivalent to `((100 - 10) - 20) - 5 = 65`. Left-associative — parentheses nest to the left.

---

### Part 3 — `max_element`

**Naive attempt with `init=0` — wrong for all-negative lists:**

```python
# BUG: max_element([-5, -3, -1]) returns 0 — 0 was never in the list
max_element = lambda xs: foldl(lambda acc, x: x if x > acc else acc, 0, xs)
```

`0` is never a valid answer for a list of negative numbers. The initial accumulator must be an
element of the list, or a value that can never "win" against any real element.

**Option A — use `xs[0]` as the seed (cleanest):**

```python
def max_element(xs):
    return foldl(lambda acc, x: x if x > acc else acc, xs[0], xs[1:])
```

Seed with the first element, fold over the rest. If the list has one element, `foldl` immediately
returns `xs[0]`. If the list is empty, this raises an `IndexError` — appropriate, since "maximum
of an empty set" is undefined.

**Option B — use `float('-inf')` as the sentinel:**

```python
max_element = lambda xs: foldl(lambda acc, x: x if x > acc else acc, float('-inf'), xs)
```

`-∞` is less than every real number, so the first element always wins the first comparison.
This works for any non-empty list including all-negatives. It also works for the empty list
(returning `-∞`), which you may or may not want.

**The lesson about `init`**: the initial accumulator is a commitment. Whatever you put there can
end up in the output if it's "better" than every element. For sum that's `0` (neutral for addition).
For product it's `1` (neutral for multiplication). For max it must be something *no real element
can be beaten by* — the identity / absorbing element for the operation. `float('-inf')` is the
mathematical identity for max; `xs[0]` sidesteps the problem by starting from a real element.

---

### Why fold is universal

Every list operation you've written can be expressed as `foldl`:

```python
# sum
foldl(lambda acc, x: acc + x, 0, xs)

# length
foldl(lambda acc, x: acc + 1, 0, xs)

# reverse
foldl(lambda acc, x: [x] + acc, [], xs)   # prepend each element — reverses order

# map
foldl(lambda acc, x: acc + [f(x)], [], xs)

# filter
foldl(lambda acc, x: acc + [x] if pred(x) else acc, [], xs)
```

The combining function `f(acc, x)` is the *only* thing that varies. `foldl` provides the structure
(left-to-right traversal with accumulator); you supply the logic.

This universality comes at a cost: all of these fold left-to-right and are inherently sequential
— each step depends on the previous accumulator. In Stage 7 you'll see that `foldr` and tree-shaped
reductions can be parallelised under the right conditions (when `f` is associative). The limits of
left fold are real; understanding them is what unlocks parallel combinators.

**Next:** closures — functions that capture their defining environment, and why that can surprise
you (Lesson 16).
