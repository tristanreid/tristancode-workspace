---
title: "Solution: Find It, Then Transform It"
description: "Recursive membership search and hand-built map — and why passing a function as an argument is the gateway to higher-order programming."
lesson_number: 9
track: fp
aliases: ["/learn/0009-solution/"]
concept: "Recursion: membership & transform"
stage: 1
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
---

### Part 1 — `contains`

```python
def contains(xs, target):
    if xs == []:
        return False
    elif xs[0] == target:
        return True
    else:
        return contains(xs[1:], target)
```

Three branches: empty list → definitely not there; head matches → found it; otherwise → the answer
is the same as whether `target` is in the rest. Trace:

```
contains([3,7,1], 7)
  = contains([7,1], 7)    # 3 ≠ 7
  = True                  # 7 == 7 ✓
```

Short-circuits as soon as it finds a match — it doesn't scan the rest of the list.

### Part 2 — `transform`

```python
def transform(xs, f):
    if xs == []:
        return []
    else:
        return [f(xs[0])] + transform(xs[1:], f)
```

Trace for `transform([1, 2, 3], lambda x: x*x)`:

```
transform([1,2,3], sq)
  = [sq(1)] + transform([2,3], sq)
  = [1]     + ([sq(2)] + transform([3], sq))
  = [1]     + ([4]     + ([sq(3)] + transform([], sq)))
  = [1]     + ([4]     + ([9]     + []))
  = [1, 4, 9]
```

### Functions as arguments — the key move

You just passed a function (`f`, `lambda x: x*x`, `str.upper`) as an argument to another function.
That's the move. In most languages, a function is just a value you can store in a variable, put in a
list, or pass around. `transform` doesn't care what `f` *does* — it only cares that `f` is
callable with one argument. The caller decides the behavior; `transform` provides the structure
(apply to every element, in order).

This is the seed of **higher-order functions** — functions that take other functions as arguments or
return them. You've already used one: `transform` itself.

### Common pitfalls

- Forgetting the brackets: `f(xs[0])` returns a value; `[f(xs[0])]` wraps it in a list so
  concatenation with `+` works. Writing `f(xs[0]) + transform(xs[1:], f)` tries to add a value to
  a list — type error.
- Wrong base case: returning `None` instead of `[]` breaks concatenation the same way.
- Calling `f` on the whole list instead of one element: `f(xs)` instead of `f(xs[0])` — a
  common slip when skimming.

### Why this matters for parallelism (preview)

`transform` does *independent* work on each element. Nothing about element 2 depends on what
happened to element 1. That's the signature of **embarrassingly parallel** computation — give each
element to a different processor, collect the results. When we build the real `map` in Stage 2 and
then meet parallel combinators in Stage 7, this independence is exactly the property that makes
safe, lock-free parallelism possible.

**Next:** filter-by-hand, `take`, and `drop` — more list surgery with recursion (Lesson 10).
