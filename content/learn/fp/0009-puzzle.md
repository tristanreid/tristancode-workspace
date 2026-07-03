---
title: "Find It, Then Transform It"
description: "Write a recursive membership test, then build map-by-hand — applying a function to every element without a loop."
lesson_number: 9
track: fp
aliases: ["/learn/0009-puzzle/"]
concept: "Recursion: membership & transform"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [3]
skin: chalkboard
---

Two exercises. Both use pure recursion — no built-in `in`, no `map`, no list comprehensions.

**Recursion recap** (standing alone): a function is recursive when it calls itself on a smaller
version of its input. The base case handles the smallest possible input directly; the recursive case
breaks the input down one step and uses the result of the smaller call. For lists, the base case is
usually the empty list `[]`, and the recursive case peels off the first element `xs[0]` and
recurses on the rest `xs[1:]`.

A **pure function** depends only on its inputs and has no side effects — the same arguments always
give the same result.

---

### Part 1 — `contains`

Write a pure recursive function `contains(xs, target)` that returns `True` if `target` appears
anywhere in `xs`, and `False` if it does not.

```python
contains([3, 7, 1, 9], 7)   # True
contains([3, 7, 1, 9], 4)   # False
contains([], 5)              # False
```

Skeleton to complete:

```python
def contains(xs, target):
    if xs == []:
        return ???                               # empty list: target cannot be here
    elif xs[0] == target:
        return ???                               # found it at the front
    else:
        return ???                               # not the front — check the rest
```

---

### Part 2 — `transform`

Write a pure recursive function `transform(xs, f)` that returns a new list where every element is
the result of calling `f` on the original element.

```python
transform([1, 2, 3, 4], lambda x: x * x)   # [1, 4, 9, 16]
transform(["hi", "yo"], str.upper)          # ["HI", "YO"]
transform([], lambda x: x + 1)             # []
```

Here `f` is itself passed in as an argument — treat it like any other value. Skeleton:

```python
def transform(xs, f):
    if xs == []:
        return ???
    else:
        return ??? + transform(???, f)
```

Think about what `transform([1, 2, 3], double)` expands to before you write it.
