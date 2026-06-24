---
title: "Count the List"
description: "Which recursive definition actually computes a list's length — and a first look at accumulators."
lesson_number: 5
concept: "Recursion: counting & accumulators"
stage: 1
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [3]
skin: chalkboard
mcq:
  question: "Which definition correctly returns the length of a list, recursively?"
  options:
    - "def length(xs): return 0 if xs == [] else length(xs[1:])"
    - "def length(xs): return 0 if xs == [] else 1 + length(xs[1:])"
    - "def length(xs): return 1 if xs == [] else 1 + length(xs[1:])"
    - "def length(xs): c = 0; while xs != []: c += 1; xs = xs[1:]; return c"
  correct: 1
---

Count how many elements are in a list — recursively, no `len`, no loop.

Recap so it stands alone. **Recursion** = a function that calls itself on a smaller piece, with a
**base case** (smallest input, answered directly, stops the recursion) and a **recursive case** (call
yourself on something smaller, then use the result). A list is **a first element `xs[0]` followed by
the rest `xs[1:]`**; the empty list is written `[]`.

The skeleton for length is: *an empty list has length 0; otherwise it's **one** (for the first
element) plus the length of the rest.* Easy to say — easy to get subtly wrong.

Below are four candidate definitions. **Exactly one is a correct recursive `length`.** Read each
carefully and predict what it returns for `["a", "b", "c"]` before you pick:

```python
# A
def length(xs): return 0 if xs == [] else length(xs[1:])

# B
def length(xs): return 0 if xs == [] else 1 + length(xs[1:])

# C
def length(xs): return 1 if xs == [] else 1 + length(xs[1:])

# D
def length(xs):
    c = 0
    while xs != []:
        c += 1
        xs = xs[1:]
    return c
```

Which one is the correct **recursive** length — and what's wrong with each of the others?
