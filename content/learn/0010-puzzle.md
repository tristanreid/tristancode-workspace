---
title: "Keep, Drop, and Slice"
description: "Build filter, take, and drop by hand — pure recursion, no built-ins — and discover how a predicate argument shapes the result."
lesson_number: 10
concept: "Recursion: filter, take, drop"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [3, 9]
skin: chalkboard
---

Four functions. No loops, no `filter`, no slicing, no built-ins except comparison. All return new
lists; the original is never mutated.

**Recursion recap (standalone):** a recursive function calls itself on a smaller input. For lists
the base case is the empty list `[]`; the recursive case peels off the first element `xs[0]` and
recurses on the rest `xs[1:]`. A **predicate** is a function that takes a value and returns a
boolean (`True`/`False`).

---

### Part 1 — `keep(xs, pred)`

Return a new list containing only the elements for which `pred` returns `True`.

```python
keep([1,2,3,4,5], lambda x: x % 2 == 0)   # [2, 4]
keep(["cat","dog","ox"], lambda s: len(s) > 2)  # ["cat","dog"]
keep([], lambda x: x > 0)                 # []
```

---

### Part 2 — `take(n, xs)`

Return the first `n` elements of `xs` (or the whole list if `n ≥ len(xs)`).

```python
take(3, [10, 20, 30, 40])   # [10, 20, 30]
take(0, [10, 20, 30])       # []
take(5, [1, 2])             # [1, 2]
```

There are **two** base cases to handle — figure out what they are.

---

### Part 3 — `drop(n, xs)`

Return the list with the first `n` elements removed.

```python
drop(2, [10, 20, 30, 40])   # [30, 40]
drop(0, [10, 20, 30])       # [10, 20, 30]
drop(5, [1, 2])             # []
```

---

### Part 4 (stretch) — `nth(n, xs)`

Return the element at position `n` (0-based), or `None` if out of range.

```python
nth(0, [10, 20, 30])   # 10
nth(2, [10, 20, 30])   # 30
nth(3, [10, 20, 30])   # None
nth(0, [])             # None
```

Notice the shape of `drop` and think about how `nth` relates to it.
