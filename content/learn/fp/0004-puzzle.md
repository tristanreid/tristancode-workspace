---
title: "Find the Last Element"
description: "A recursion whose base case isn't the empty list — it's a list of one."
lesson_number: 4
track: fp
aliases: ["/learn/0004-puzzle/"]
concept: "Recursion: base-case design"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [3]
skin: chalkboard
---

Get the **last** element of a list, recursively — no loops, no indexing tricks like `xs[-1]`. Just a
function that calls itself.

Quick recap of the tool, so this stands alone. **Recursion** means solving a problem by calling a
function on a smaller piece of itself. Every recursive function needs a **base case** (the smallest
input, answered outright, which stops the recursion) and a **recursive case** (call yourself on
something smaller, then use the result). We'll treat a list as **a first element `xs[0]` followed by
the rest `xs[1:]`**.

For summing a list, the base case was the empty list. But "the last element" is different — **an empty
list has no last element at all.** So the natural smallest *answerable* case isn't `[]`; it's a list of
exactly **one** element, whose last element is obviously itself.

```python
def last(xs):
    if len(xs) == 1:
        return ???          # base case: one element — what's the last?
    else:
        return ???          # recursive case: where does the answer live?
```

**Your task:** fill in both blanks.

Things to settle before revealing:

- In the base case, the list is `[x]`. What's its last element?
- In the recursive case, the last element of `[3, 1, 2]` is the same as the last element of
  *what shorter list*? Write that as a call to `last`.
- Bonus: what *should* `last([])` do? (There's no good value to return — note what you'd want to
  happen.)
