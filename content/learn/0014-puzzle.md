---
title: "Build Map and Filter"
description: "Implement map and filter from scratch using recursion and first-class functions — then try to write filter in terms of map, and discover why you can't."
lesson_number: 14
concept: "Building map and filter"
stage: 2
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [9, 10, 13]
skin: chalkboard
---

You hand-built `transform` (Lesson 9) and `keep` (Lesson 10) using recursion. In this lesson you
formalise them as `my_map` and `my_filter`, and then try something harder: can filter be built from
map?

**Terms used here (standalone):**

- **Map**: apply a function `f` to every element of a list, producing a new list of the same length.
  `map(f, [a, b, c])` → `[f(a), f(b), f(c)]`.
- **Filter**: keep only the elements for which a predicate `pred` returns `True`.
  `filter(pred, [a, b, c])` → a sub-list of elements where `pred` holds.
- **Predicate**: a function that takes a value and returns `True` or `False`.
- **Pure function**: output depends only on inputs; no side effects.

---

### Part 1 — `my_map`

Write `my_map(f, xs)` recursively. No built-in `map`, no list comprehensions.

```python
my_map(lambda x: x ** 2, [1, 2, 3, 4])   # [1, 4, 9, 16]
my_map(str.upper, ["a", "b", "c"])        # ["A", "B", "C"]
my_map(lambda x: x, [])                  # []
```

---

### Part 2 — `my_filter`

Write `my_filter(pred, xs)` recursively.

```python
my_filter(lambda x: x % 2 == 0, [1, 2, 3, 4, 5])   # [2, 4]
my_filter(lambda s: len(s) > 3, ["hi", "hello", "yo"])  # ["hello"]
my_filter(lambda x: True, [])                         # []
```

---

### Part 3 — Can you write `my_filter` using only `my_map`?

This is the hard part. Think carefully before trying to code it.

Given only `my_map` (and no recursion of your own), can you implement `my_filter`? The output of
`my_map` always has the *same length* as the input. `my_filter` may shorten the list.

- If yes: write it.
- If no: explain precisely *what* `my_map` cannot do that `my_filter` requires, and what additional
  tool you would need.

(Hint: what does map guarantee about the output's length? What does filter guarantee — or not?)
