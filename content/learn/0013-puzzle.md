---
title: "Functions Are Values"
description: "Trace code that stores functions in lists, passes them as arguments, and chains them with compose — predict the output before running it."
lesson_number: 13
concept: "Functions as values"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1, 9]
skin: chalkboard
mcq:
  question: "What does `pipeline(2)` evaluate to?"
  options:
    - "7"
    - "14"
    - "42"
    - "21"
  correct: 2
---

In most languages a function is just a value — you can assign it to a variable, put it in a list,
pass it to another function, and return it from a function. These are called **higher-order
functions** (HOFs): functions that operate on other functions.

**Terms used here (standalone):**

- **First-class function**: a function that can be stored, passed, and returned like any other value.
- **Higher-order function**: a function that takes a function as an argument or returns one.
- **`compose(f, g)(x)`** returns `f(g(x))` — `g` runs first, `f` runs second.

---

Read this code carefully and trace it by hand:

```python
def make_adder(n):
    def add(x):
        return x + n
    return add

def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply

def compose(f, g):
    """h(x) == f(g(x)):  g runs first, f runs second."""
    def h(x):
        return f(g(x))
    return h

add5   = make_adder(5)
double = make_multiplier(2)
triple = make_multiplier(3)

steps    = [add5, double, triple]
pipeline = steps[0]
for step in steps[1:]:
    pipeline = compose(step, pipeline)

result = pipeline(2)
```

Trace `pipeline` after each iteration of the loop. What function does it represent?

Then apply it to `2`.

The distractors are wrong for specific, traceable reasons — figure out which mistake each one
corresponds to.
