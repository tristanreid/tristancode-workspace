---
title: "Spot the Pure Function"
description: "The single idea that makes code safe to test, cache, and run in parallel: the pure function."
lesson_number: 1
concept: "Pure functions"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: []
skin: chalkboard
mcq:
  question: "Exactly one of these four functions is pure. Which one?"
  options:
    - "A — add_tax"
    - "B — add_to_cart"
    - "C — now_plus"
    - "D — greet"
  correct: 0
---

Almost everything in this path rests on one idea, so we start there: the **pure function**.

A function is **pure** when both of these hold:

1. **Its output depends only on its inputs.** Same arguments in → same answer out, every single time.
2. **It has no side effects.** It doesn't change anything outside itself — no writing to a global, a
   file, a database, or the screen; and it doesn't modify the arguments it was handed. It just takes
   values and returns a value.

A function that breaks either rule is called **impure**.

Here are four small functions (Python, but the shape is universal — `def name(args): body`, and
`return` hands a value back to the caller):

```python
TAX = 0.08
cart = []

# A
def add_tax(price):
    return price + price * TAX

# B
def add_to_cart(item):
    cart.append(item)        # cart is defined outside the function
    return cart

# C
import time
def now_plus(seconds):
    return time.time() + seconds   # time.time() = seconds since 1970, right now

# D
def greet(name):
    print("Hi, " + name)     # writes to the screen; returns nothing
```

**Exactly one is pure.** Which one — and, for each of the other three, which rule does it break?
