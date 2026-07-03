---
title: "Closures Capture Variables, Not Values"
description: "Predict the output of code that creates closures inside a loop — the classic late-binding trap that catches every developer at least once."
lesson_number: 16
track: fp
aliases: ["/learn/0016-puzzle/"]
concept: "Closures"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1, 13]
skin: chalkboard
mcq:
  question: "What does `results` contain after the final line runs?"
  options:
    - "[10, 11, 12]"
    - "[12, 12, 12]"
    - "[10, 10, 10]"
    - "[11, 11, 11]"
  correct: 1
---

A **closure** is a function that *captures* variables from the scope where it was defined — not
just their values at the moment of creation, but the *variables themselves*. When the function is
called later, it reads the variable as it exists at call time, not at definition time.

**Terms used here (standalone):**

- **Scope**: the region of code where a name is visible. In Python, a function body has its own
  local scope; the enclosing function's variables are in the *enclosing scope*.
- **Closure**: a function bundled with the environment (set of captured variables) from its defining
  scope. The function "closes over" those variables.
- **Late binding**: the value of a captured variable is looked up *when the function is called*, not
  when it is defined.

---

Consider this code:

```python
fns = []
for i in range(3):
    fns.append(lambda x: x + i)

results = [f(10) for f in fns]
```

Trace it carefully:

1. `range(3)` produces `0, 1, 2`.
2. Three lambda functions are created, each capturing the variable `i`.
3. After the loop finishes, what is the value of `i`?
4. All three lambdas are called with `x=10`. What do they each return?

Think about *when* `i` is looked up — at lambda-creation time, or at call time.
