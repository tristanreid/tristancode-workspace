---
title: "Curry, Partial, Compose"
description: "Curry a two-argument function by hand, use partial application to build specialised functions, and implement function composition — then wire them together."
lesson_number: 17
concept: "Currying & composition"
stage: 2
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [13, 16]
skin: chalkboard
---

Three tools. Each is a single concept; together they form the vocabulary of functional plumbing.

**Terms used here (standalone):**

- **Currying**: converting a function that takes multiple arguments into a chain of functions that
  each take one argument. `f(a, b)` becomes `curried_f(a)(b)`.
- **Partial application**: fixing some of a function's arguments in advance, returning a function
  that takes the remaining arguments. `add(3, _)` fixed at `3` becomes a "add 3 to anything" function.
- **Function composition**: combining two functions into one. `compose(f, g)(x) = f(g(x))` — `g`
  runs first, `f` runs second.
- **Closure** (from Lesson 16): a function that captures variables from its defining scope.

---

### Part 1 — Curry `add` by hand

The two-argument `add` below takes both arguments at once. Write a curried version `add_c` that
takes one argument and returns a function that takes the second.

```python
def add(x, y):
    return x + y

# Target: add_c(3)(4) == 7
def add_c(x):
    ???
```

Then use `add_c` to create `add10` — a function that adds 10 to anything.

---

### Part 2 — Partial application with `functools.partial`

Python's `functools.partial` fixes some arguments of any function:

```python
from functools import partial
add10 = partial(add, 10)   # add(10, ?)  — first arg fixed at 10
add10(5)                   # 15
```

Given:
```python
def power(base, exponent):
    return base ** exponent
```

Use `partial` to create `square` (exponent=2) and `cube` (exponent=3). Then create `powers_of_2`
(base=2).

```python
square(5)       # 25
cube(3)         # 27
powers_of_2(8)  # 256
```

---

### Part 3 — Compose and apply

Write `compose(f, g)` (you saw it in Lesson 13; write it from scratch here).

Then use it and your Part 1/2 results to build a pipeline function `double_then_square` using only
`compose`, `partial`, and `power` (no arithmetic operators directly, no lambdas).

```python
double_then_square(3)   # (3*2)^2 = 36
double_then_square(5)   # (5*2)^2 = 100
```

---

### Stretch — `compose` for N functions

Write `compose_all(fns)` that composes an arbitrary list of functions (right-to-left, so the last
function in the list runs first).

```python
compose_all([str, abs, lambda x: x - 100])(42)   # str(abs(42 - 100)) = str(58) = "58"
```
