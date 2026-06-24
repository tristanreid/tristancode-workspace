---
title: "Solution: Functions Are Values"
description: "Tracing the compose pipeline — how closures capture state, how compose chains functions left-to-right, and why first-class functions are the foundation of Stage 2."
lesson_number: 13
concept: "Functions as values"
stage: 2
layout: solution
role: solution
builds_on: [1, 9]
skin: chalkboard
---

**The answer is 42.**

### Trace

```
add5   ≡ λx. x + 5
double ≡ λx. x * 2
triple ≡ λx. x * 3
steps  = [add5, double, triple]
```

The loop composes step-by-step:

```
before loop:  pipeline = add5               # x → x+5

iteration 1:  step = double
              pipeline = compose(double, add5)
              # pipeline(x) = double(add5(x)) = 2*(x+5)

iteration 2:  step = triple
              pipeline = compose(triple, compose(double, add5))
              # pipeline(x) = triple(double(add5(x))) = 3 * 2 * (x+5) = 6*(x+5)
```

So `pipeline(2) = 6 * (2+5) = 6 * 7 = 42`.

Step by step: `add5(2) = 7`, `double(7) = 14`, `triple(14) = 42`.

### Where the distractors go wrong

- **7**: only applied `add5(2)` — treated `steps[0]` as the whole pipeline.
- **14**: computed `double(add5(2))` and stopped — forgot the third compose (triple).
- **21**: computed `triple(add5(2)) = triple(7) = 21` — skipped double (the middle step).

Each corresponds to a specific mistake in tracing the loop. If you got one of these, find which
iteration you stopped at or skipped.

### What the code demonstrates

**`make_adder` and `make_multiplier` return closures** — functions that capture the value of `n`
from their enclosing scope. `add5` permanently holds `n=5`; `triple` permanently holds `n=3`.
The returned function and the captured variables together are a closure. We'll formalize this in
Lesson 16.

**`compose` is a higher-order function** — it takes two functions and returns a third. The returned
`h` is itself a closure that captures `f` and `g`.

**The loop is `reduce(compose, steps)`** — it folds the list of steps into a single composed
pipeline, applying them left-to-right. You could write it equivalently as:

```python
from functools import reduce
pipeline = reduce(compose, steps)
```

That reduction pattern is exactly what `reduce` / `foldl` does — we'll build it from scratch in
Lesson 15.

**First-class functions let you separate structure from behavior.** The compose loop doesn't know
or care what `add5`, `double`, and `triple` do — it only knows they're callable. The caller
decides the steps; `compose` provides the glue. That separation of concerns is the defining idea
of higher-order programming.

**Next:** build `map` and `filter` from scratch — the two most common list HOFs (Lesson 14).
