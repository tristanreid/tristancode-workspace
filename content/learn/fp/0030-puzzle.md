---
title: "Eager vs Lazy: Counting the Wasted Work"
description: "Eager evaluation computes every argument before a function runs, whether or not the function ends up needing it. Count exactly how much work that wastes across three calls to a branching function."
lesson_number: 30
track: fp
aliases: ["/learn/0030-puzzle/"]
concept: "Eager vs lazy evaluation"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: []
skin: chalkboard
numeric:
  question: "Across the three pick_eager calls below, how many total calls to expensive(...) turn out to be unnecessary — computed but never used?"
  answer: 3
  tolerance: 0
  unit: "wasted evaluations"
---

**Warm-up recall (Lesson 9).** Finding an element by scanning a list means checking each element in
order until one matches a condition, and returning where it was found. In `[3, 9, 16, 20]`, what is
the index (0-based) of the *first* value greater than 15? Keep the number; the solution confirms it.

---

**Terms (standalone):**

- **Eager evaluation**: an argument to a function is computed *before* the function is called,
  unconditionally — regardless of whether the function's body ends up using that argument at all.
  This is how Python, most of Java, and most everyday code work.
- **Lazy evaluation**: an argument is wrapped so its computation is deferred until (and unless) the
  function body actually asks for its value. If the body never touches it, it's never computed.

Consider a function that picks one of two values based on a condition:

```python
def pick_eager(cond, a, b):
    return a if cond else b
```

In an eager language, **both `a` and `b` are fully computed before `pick_eager` is even entered** —
the call `pick_eager(cond, expensive(x), expensive(y))` runs `expensive` twice, no matter what
`cond` is, because Python evaluates every argument expression before the function body ever sees
`cond`.

```python
counter = 0
def expensive(x):
    global counter
    counter += 1
    return x * x
```

```python
pick_eager(True,  expensive(3), expensive(4))
pick_eager(False, expensive(5), expensive(6))
pick_eager(True,  expensive(7), expensive(8))
```

---

### Part 1 — How many times does `expensive` run in total?

Count every call to `expensive` across all three lines above (both arguments, every line — `cond`
doesn't stop either one from being evaluated).

---

### Part 2 — Which calls were wasted?

For each of the three lines, `pick_eager` only ever *returns* one of the two computed values — the
other one was computed and then discarded. For each line, which call to `expensive` was wasted (its
result never used)?

---

### Part 3 — The graded question (above)

Total up the wasted calls across all three lines. Enter that count in the numeric box.

---

### Part 4 — What a lazy version would do differently

Sketch `pick_lazy(cond, a_thunk, b_thunk)`, where `a_thunk` and `b_thunk` are zero-argument
functions (`lambda: expensive(3)` instead of `expensive(3)`) that only run when actually called
inside `pick_lazy`. How many total calls to `expensive` would the three-line sequence make under
`pick_lazy`, and why does that number match "wasted calls under eager" being exactly what's *saved*
under lazy?
