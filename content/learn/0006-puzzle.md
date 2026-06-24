---
title: "Reverse a List — Twice"
description: "Write reverse the obvious way, then discover it's secretly O(n²) — and fix it with an accumulator."
lesson_number: 6
concept: "Recursion: efficiency & accumulators"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [3, 5]
skin: chalkboard
---

Reverse a list recursively: `reverse([1, 2, 3])` should give `[3, 2, 1]`. No loops, no built-in
`reversed`.

Standing on its own: **recursion** is a function that calls itself on a smaller piece, with a **base
case** (smallest input, answered directly) and a **recursive case** (call yourself on something
smaller, then combine). A list is **a first element `xs[0]` followed by the rest `xs[1:]`**. In Python
pseudocode, `a + b` on two lists **concatenates** them into a new list: `[1] + [2, 3]` is `[1, 2, 3]`.

**Part 1 — the obvious version.** Think about the shape: if you reverse the *rest* of the list, where
does the first element belong in the final answer? Fill in:

```python
def reverse(xs):
    if xs == []:
        return ???                 # base case: reverse of nothing
    else:
        return ??? + [xs[0]]       # reverse the rest, then place the first element... where?
```

**Part 2 — the catch.** Your Part 1 answer is correct but quietly *slow*. The culprit is that
`+ [xs[0]]` builds a whole new list every call, and appending one item to the end of an n-element list
costs n steps. Do that once per element and the total work grows like n×n — **O(n²)**.

Can you write a second version that reverses in **O(n)** (work proportional to n, not n²) by carrying
the answer forward in an **accumulator** — an extra argument that holds the result-so-far, the same
trick that made [counting a list](../0005-puzzle/) cheap? Hint: if you push each element onto the
*front* of the accumulator as you go, the order flips for free.

```python
def reverse(xs, acc=[]):
    ???
```

Reveal when you've got both.
