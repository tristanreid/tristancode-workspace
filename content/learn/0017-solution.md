---
title: "Solution: Curry, Partial, Compose"
description: "Manual currying, functools.partial, compose from scratch, and compose_all — plus why these tools are the connective tissue of functional programming."
lesson_number: 17
concept: "Currying & composition"
stage: 2
layout: solution
role: solution
builds_on: [13, 16]
skin: chalkboard
---

### Part 1 — Currying `add`

```python
def add_c(x):
    def inner(y):
        return x + y
    return inner

# or, more compactly:
add_c = lambda x: lambda y: x + y

add_c(3)(4)   # 7

add10 = add_c(10)
add10(5)      # 15
add10(100)    # 110
```

`add_c(10)` returns the `inner` closure with `x=10` captured. Every subsequent call just adds 10.
This is `make_adder(10)` from Lesson 13 — currying is the general pattern behind all those factories.

---

### Part 2 — `functools.partial`

```python
from functools import partial

square    = partial(power, exponent=2)   # or: partial(power, 2) for positional
cube      = partial(power, exponent=3)
powers_of_2 = partial(power, 2)

square(5)        # 25
cube(3)          # 27
powers_of_2(8)   # 256
```

Note: `partial(power, 2)` fixes the *first* positional argument (`base=2`). `partial(power, exponent=2)`
uses a keyword argument to fix the *second*. Both work; keyword form is clearer for non-first args.

---

### Part 3 — `compose` and `double_then_square`

```python
def compose(f, g):
    def h(x):
        return f(g(x))
    return h

double        = partial(power, exponent=1)   # Hmm — power(base, 1) = base, not double
```

Wait — `power(base, exponent)` uses the base; to double we need multiplication, not power. Let's
define `double` correctly:

```python
from functools import partial

def multiply(a, b):
    return a * b

double = partial(multiply, 2)         # multiply(2, x) = 2*x
square = partial(power, exponent=2)   # power(x, 2) = x^2

double_then_square = compose(square, double)

double_then_square(3)   # square(double(3)) = square(6) = 36
double_then_square(5)   # square(double(5)) = square(10) = 100
```

`compose(square, double)(x)` = `square(double(x))` = `(2x)²`. Composition order matters: the
rightmost function (`double`) runs first.

---

### Stretch — `compose_all`

```python
def compose_all(fns):
    """Compose a list of functions right-to-left (last in list runs first)."""
    def composed(x):
        result = x
        for f in reversed(fns):
            result = f(result)
        return result
    return composed
```

Or, elegantly, using `foldl` from Lesson 15:

```python
from functools import reduce
compose_all = lambda fns: reduce(compose, fns)
```

`reduce(compose, [f, g, h])` computes `compose(compose(f, g), h)`, which means `h` runs first
(right-to-left). For `fns = [str, abs, lambda x: x-100]`:

```
compose(str, abs) → str(abs(x))
compose(compose(str, abs), sub100) → str(abs(x - 100))

compose_all([str, abs, sub100])(42) = str(abs(42 - 100)) = str(|-58|) = str(58) = "58"
```

---

### The big picture

Currying, partial application, and composition are the connective tissue of functional programming.
They let you:

1. **Build specialised functions from general ones** (partial application).
2. **Chain small transformations into pipelines** (composition).
3. **Write functions in point-free style** — defining a function entirely in terms of other
   functions, without naming the argument it operates on.

In Haskell and Scala, all functions are curried by default and `.` / `andThen` do composition. In
Python you opt in — but `functools.partial` and `compose` give you the same toolkit.

**Next:** the payoff. Use `foldl` to reconstruct `map`, `filter`, `sum`, and `product` — showing
that fold is the one abstraction that generates all the others (Lesson 18).
