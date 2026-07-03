---
title: "Reduce Reconstructs Everything"
description: "Express sum, product, map, filter, and reverse using only foldl — proving that fold is the universal list consumer."
lesson_number: 18
track: fp
aliases: ["/learn/0018-puzzle/"]
concept: "Reduce as universal"
stage: 2
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [14, 15, 17]
skin: chalkboard
---

This is the payoff for Stage 2. You will re-derive every list operation you've written — using
*only* `foldl` as the engine.

**`foldl` recap (standalone):** consumes a list by updating an accumulator left-to-right.

```python
def foldl(f, init, xs):
    if xs == []:
        return init
    return foldl(f, f(init, xs[0]), xs[1:])
```

`foldl(f, init, [a, b, c])` expands to `f(f(f(init, a), b), c)`. The combining function `f` takes
`(acc, element)` and returns the new accumulator. The `init` is the starting accumulator.

---

Implement each of the following using **only `foldl`** — no recursion of your own, no built-ins
beyond basic arithmetic and list concatenation.

### Part 1 — `my_sum` and `my_product`

```python
my_sum([1, 2, 3, 4])       # 10
my_product([1, 2, 3, 4])   # 24
my_sum([])                 # 0
my_product([])             # 1
```

What is the correct `init` for each? (If you get this wrong, the empty-list case reveals it.)

---

### Part 2 — `my_map_via_fold`

```python
my_map_via_fold(lambda x: x**2, [1, 2, 3])   # [1, 4, 9]
```

The combining function must build up a list. What is `init`? What does `f(acc, x)` return?

---

### Part 3 — `my_filter_via_fold`

```python
my_filter_via_fold(lambda x: x % 2 == 0, [1, 2, 3, 4, 5])   # [2, 4]
```

The combining function must decide per-element whether to include it.

---

### Part 4 — `my_reverse_via_fold`

```python
my_reverse_via_fold([1, 2, 3])   # [3, 2, 1]
```

This one is tricky. Think about where each element must go relative to the accumulator. A fold
processes left-to-right; how can prepending to the accumulator reverse the order?

---

### Stretch — `my_flatten_via_fold`

```python
my_flatten_via_fold([[1, 2], [3, 4], [5]])   # [1, 2, 3, 4, 5]
```

(One level of nesting only — not arbitrary depth.) What does `f(acc, sublist)` look like?
