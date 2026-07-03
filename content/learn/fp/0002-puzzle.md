---
title: "The List That Wouldn't Change"
description: "Immutability: building new values instead of modifying old ones — and why parallel code depends on it."
lesson_number: 2
track: fp
aliases: ["/learn/0002-puzzle/"]
concept: "Immutability"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1]
skin: chalkboard
mcq:
  question: "You want with_four(xs) to return a new list ending in 4 while leaving the caller's original list untouched. Which body does that?"
  options:
    - "xs.append(4); return xs"
    - "return xs + [4]"
    - "xs[len(xs):] = [4]; return xs"
    - "xs += [4]; return xs"
  correct: 1
---

A value is **immutable** when it can't be changed after it's created. Instead of *modifying* it, you
*build a new value* from it and leave the original alone. (The opposite — changing a value in place —
is called **mutation**.)

This pairs naturally with last lesson's idea of a **pure function**: a function whose output depends
only on its inputs and which changes nothing outside itself. A function can't very well "change
nothing" if it mutates the list you handed it.

Here's the setup. Some caller has a list and will use it again:

```python
scores = [10, 20, 30]
result = with_four(scores)
# The caller now expects `scores` to STILL be [10, 20, 30],
# and `result` to be [10, 20, 30, 4].
```

In Python, `xs + [4]` builds a **brand-new** list (a new value). But `xs.append(4)`, `xs += [4]`, and
slice-assignment like `xs[len(xs):] = [4]` all **mutate the existing list in place** — so the caller's
`scores` would silently change too.

Which body for `with_four` returns the new list **without** disturbing the caller's original?

```python
def with_four(xs):
    ???
```
