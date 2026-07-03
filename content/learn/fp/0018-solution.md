---
title: "Solution: Reduce Reconstructs Everything"
description: "All five list operations expressed as foldl — the canonical proof that fold is the universal list consumer, with a note on its limits."
lesson_number: 18
track: fp
aliases: ["/learn/0018-solution/"]
concept: "Reduce as universal"
stage: 2
layout: solution
role: solution
builds_on: [14, 15, 17]
skin: chalkboard
---

### Part 1 — `my_sum` and `my_product`

```python
my_sum     = lambda xs: foldl(lambda acc, x: acc + x, 0,  xs)
my_product = lambda xs: foldl(lambda acc, x: acc * x, 1,  xs)
```

`init=0` for sum: adding nothing to an empty list gives 0 (the additive identity).
`init=1` for product: the multiplicative identity — multiplying nothing gives 1. Use `0` and
`my_product([]) = 0` instead of 1, which would be wrong.

---

### Part 2 — `my_map_via_fold`

```python
def my_map_via_fold(f, xs):
    return foldl(lambda acc, x: acc + [f(x)], [], xs)
```

`init=[]` (empty output). At each step, apply `f` to the element and append it to the right
of the accumulator. The list grows in order — first to last — because foldl processes left-to-right
and we append to the right.

---

### Part 3 — `my_filter_via_fold`

```python
def my_filter_via_fold(pred, xs):
    return foldl(lambda acc, x: acc + [x] if pred(x) else acc, [], xs)
```

When `pred(x)` is true, include `x`; otherwise return the accumulator unchanged. The length of
the output is not fixed — it depends on how many elements pass the predicate.

---

### Part 4 — `my_reverse_via_fold`

```python
my_reverse_via_fold = lambda xs: foldl(lambda acc, x: [x] + acc, [], xs)
```

The key: **prepend** each element to the front of the accumulator rather than appending to the
back. Fold processes `[1, 2, 3]` left-to-right:

```
foldl(prepend, [], [1,2,3])
  → foldl(prepend, [1],     [2,3])
  → foldl(prepend, [2,1],   [3])
  → foldl(prepend, [3,2,1], [])
  → [3,2,1]
```

Each new element goes to the front — naturally reversing the order. This is also the exact shape
of the accumulator-reverse from Lesson 6, now expressed in one line.

---

### Stretch — `my_flatten_via_fold` (one level)

```python
my_flatten_via_fold = lambda xss: foldl(lambda acc, xs: acc + xs, [], xss)
```

Each element of the outer list is itself a sub-list. The combining function concatenates it onto
the accumulator. This is Python's `sum(xss, [])` in disguise.

---

### The universality of fold — and its limits

You now have:

```
my_sum     = foldl((+),  0,  ·)
my_product = foldl((*),  1,  ·)
my_map f   = foldl(append ∘ f, [], ·)
my_filter p = foldl(conditional_append p, [], ·)
my_reverse = foldl(prepend, [], ·)
my_flatten = foldl(concat, [], ·)
```

Every list consumer you've written is a `foldl` with a different combining function and init.
The structure (linear traversal, one accumulator) is always the same. This is the mathematical
content of the claim that *fold is the universal list consumer*: any function of type `List[A] → B`
that processes elements one-at-a-time left-to-right is expressible as a `foldl`.

**What fold cannot do (easily):**

- **Short-circuit early**: `foldl` visits every element even after it could stop. `contains` could
  return `True` the moment it finds the target; fold runs to the end. Some languages have a
  lazy `foldl` that short-circuits, but the basic recursive version doesn't.
- **Parallelise freely**: `foldl` is sequentially dependent — each step needs the previous
  accumulator. If the combining function is *associative* (like `+` or `max`), you can
  reorganise the fold as a tree of operations and run the branches in parallel. That's the
  difference between `foldl` and `reduce` in Stage 7.
- **Produce infinite output**: a fold consuming a finite list always terminates. You need a
  different tool (unfold / corecursion) to produce infinite structures.

**Congratulations — Stage 2 is complete.** You now have the complete higher-order toolkit: map,
filter, fold, closures, currying, and composition. Stage 3 zooms out to algebraic data types —
defining the *shape* of data with sum types and product types, and then consuming it with pattern
matching and folds.
