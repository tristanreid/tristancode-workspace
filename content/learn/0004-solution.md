---
title: "Solution: Find the Last Element"
description: "Choosing the right base case, handling the empty list, and the idea of total vs partial functions."
lesson_number: 4
concept: "Recursion: base-case design"
stage: 1
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
---

```python
def last(xs):
    if len(xs) == 1:
        return xs[0]          # base case: the only element IS the last
    else:
        return last(xs[1:])   # recursive case: last of the rest
```

**Base case:** a one-element list `[x]` — its last element is `xs[0]`, the element itself.

**Recursive case:** the last element of `[3, 1, 2]` is exactly the last element of `[1, 2]`, which is
the last element of `[2]`. Each step throws away the first element and asks the same question of a
shorter list. Notice the difference from [summing a list](../0003-puzzle/): there we *combined*
`xs[0]` with the recursive result (`xs[0] + total(xs[1:])`); here we *discard* `xs[0]` and just pass
the answer straight up (`last(xs[1:])`). The first element does no work — it's only along for the
ride until we reach the last one.

### The trace

```
last([3,1,2]) = last([1,2])
              = last([2])     ← len is 1, base case
              = 2
```

### The empty list: total vs partial functions

What about `last([])`? There's genuinely no answer — an empty list has no last element. With the code
above, `last([])` doesn't hit the `len == 1` base case, so it recurses into `last([])`... forever (or
crashes when it tries `xs[1:]` on nothing, depending on the language). That's a real bug worth naming.

A function that returns a sensible result for **every** input in its type is called **total**. One that
blows up or loops on some inputs is **partial**. `last` as written is partial — it's undefined on `[]`.

You have two honest ways to make it total:

```python
# Option 1: refuse the impossible input loudly.
def last(xs):
    if xs == []:
        raise ValueError("last() of empty list")
    if len(xs) == 1:
        return xs[0]
    return last(xs[1:])

# Option 2: return an "absent" value instead of a real element.
def last(xs):
    if xs == []:
        return None           # "no last element"
    if len(xs) == 1:
        return xs[0]
    return last(xs[1:])
```

Option 2 hints at something important coming later: instead of crashing, you can make "might be
absent" an explicit, ordinary value (often called `Option`/`Maybe`/`None`) that the caller must deal
with. We'll build that idea properly when we reach **algebraic data types**.

The deeper lesson: **your base cases aren't an afterthought — they're where you decide what your
function even means.** Choosing `[]` vs `[x]` vs "raise vs return None" *is* the design.

**Next:** counting a list recursively — and a first look at the **accumulator** pattern that makes
recursion efficient (Lesson 5).
