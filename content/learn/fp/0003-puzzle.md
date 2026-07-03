---
title: "Sum a List Without a Loop"
description: "Recursion from first principles: a base case and a recursive case, using the sum of a list."
lesson_number: 3
track: fp
aliases: ["/learn/0003-puzzle/"]
concept: "Recursion over lists"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [1]
skin: chalkboard
---

Here's a challenge with a rule: **add up all the numbers in a list, but you may not use a loop** (no
`for`, no `while`) and no built-in `sum`. Your only tool is the function calling *itself*. That tool is
**recursion**.

A **recursive function** is one that solves a problem by calling itself on a smaller piece of the same
problem. Every recursive function needs two parts:

1. A **base case** — the smallest input, simple enough to answer outright with no further calls. It's
   what stops the recursion.
2. A **recursive case** — solve a *smaller* version of the problem by calling yourself, then combine
   that result with the current piece.

Think about a list as **a first element followed by the rest of the list**. For example
`[3, 1, 2]` is `3` followed by `[1, 2]`. We'll write the answer in Python-flavored pseudocode, where
`xs[0]` is the first element and `xs[1:]` is "everything after the first":

```python
def total(xs):
    # base case: what is the sum of an EMPTY list?
    if xs == []:
        return ???
    # recursive case: combine the first element
    # with the sum of the rest
    else:
        return ???
```

**Your task:** fill in both blanks.

Two prompts to push on before you reveal the answer:

- What number should an *empty* list sum to, so that the recursion bottoms out cleanly?
- In the recursive case you'll write `total(xs[1:])` — but **trust** that it correctly returns the sum
  of the rest. What do you do with `xs[0]` and that result?

Then trace it by hand for `total([3, 1, 2])` and see the calls stack up and resolve.
