---
title: "Solution: Build Map and Filter"
description: "Recursive map and filter implementations, why filter can't be written in terms of map alone, and what reduce makes possible that neither can do solo."
lesson_number: 14
concept: "Building map and filter"
stage: 2
layout: solution
role: solution
builds_on: [9, 10, 13]
skin: chalkboard
---

### Part 1 — `my_map`

```python
def my_map(f, xs):
    if xs == []:
        return []
    return [f(xs[0])] + my_map(f, xs[1:])
```

Identical to `transform` from Lesson 9 — you already built this. `map` is just the canonical name.

---

### Part 2 — `my_filter`

```python
def my_filter(pred, xs):
    if xs == []:
        return []
    elif pred(xs[0]):
        return [xs[0]] + my_filter(pred, xs[1:])
    else:
        return my_filter(pred, xs[1:])
```

Same as `keep` from Lesson 10.

---

### Part 3 — Why filter cannot be written in terms of map alone

You cannot implement `my_filter` using only `my_map`. Here's why:

**`my_map` is length-preserving.** Whatever list you feed it, the output has the same number of
elements. This is a structural guarantee — it applies one function to each slot and emits one
result per slot. It cannot discard slots.

**`my_filter` changes the length.** If none of the elements pass the predicate, the output is `[]`
regardless of the input's length. If all pass, the output equals the input. Length is *not*
preserved — it's data-dependent.

No composition of `my_map` calls can produce a list shorter than its input. Therefore, no
`my_map`-only implementation of `my_filter` is possible.

What you need is something that can *decide per element whether to include it in the accumulator*.
That decision — include or skip — is exactly what `reduce` (fold) enables, because its combining
function gets to return *anything*, not just a same-length structure.

```python
# Preview: filter via reduce (Lesson 15)
def my_filter_via_reduce(pred, xs):
    return foldl(lambda acc, x: acc + [x] if pred(x) else acc, [], xs)
```

The `foldl` combinator accumulates a new list, adding `x` only when `pred(x)` holds. This is
expressible in fold but not in map — fold is strictly more powerful as a list consumer.

### The hierarchy of list operations

```
map  — same length, transform each element  
filter — shorter or equal, select a subset  
reduce — any length (even 0), collapse to a single value (or rebuilt structure)
```

`map` and `filter` can both be derived from `reduce`. Neither can be derived from the other.
`reduce` is the bottom of this hierarchy — the single combinator that can construct all others.

This is why `reduce` is often called *the universal list consumer*. In Lesson 18, you'll
re-derive `map`, `filter`, `sum`, and `product` all from a single `foldl`.

**Next:** build `foldl`/`reduce` from scratch — the combinator that subsumes everything above
(Lesson 15).
