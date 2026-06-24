---
title: "Solution: Reverse a List — Twice"
description: "The naive O(n²) reverse, the O(n) accumulator version, and how to reason about the cost of recursion."
lesson_number: 6
concept: "Recursion: efficiency & accumulators"
stage: 1
layout: solution
role: solution
builds_on: [3, 5]
skin: chalkboard
---

### Part 1 — the obvious version

```python
def reverse(xs):
    if xs == []:
        return []                       # reverse of nothing is nothing
    else:
        return reverse(xs[1:]) + [xs[0]]
```

The idea: reverse *the rest* of the list, then stick the first element on the **end** — because in the
reversed result, the original first element must come last. Trace it:

```
reverse([1,2,3]) = reverse([2,3]) + [1]
                 = (reverse([3]) + [2]) + [1]
                 = ((reverse([]) + [3]) + [2]) + [1]
                 = (([] + [3]) + [2]) + [1]
                 = [3,2,1]
```

Correct — and pure: a new list out, the original untouched.

### Part 2 — why it's secretly O(n²), and the fix

Every `something + [xs[0]]` builds a brand-new list by copying `something` and adding one element at
the end. Appending to the end of a k-element list copies all k elements. We do that for lists of length
0, 1, 2, …, n−1 as the calls return — so the total work is `0 + 1 + 2 + … + (n−1)`, which grows like
**n²/2**. For a 10,000-element list that's ~50 million copy steps to reverse 10,000 things. Ouch.

The accumulator version does it in **O(n)**:

```python
def reverse(xs, acc=[]):
    if xs == []:
        return acc                          # nothing left — the answer is built
    else:
        return reverse(xs[1:], [xs[0]] + acc)  # push first element onto the FRONT of acc
```

Trace it and watch the reversal fall out of the order you stack things on the front:

```
reverse([1,2,3], [])  = reverse([2,3], [1])
                      = reverse([3],   [2,1])
                      = reverse([],    [3,2,1])
                      = [3,2,1]
```

Each step does a constant amount of work — peel one element, prepend it to `acc` — and there are n
steps. That's O(n). As a bonus, the recursive call is in **tail position** (its result is returned
directly, nothing waiting afterward), the same property we met when [counting a
list](../0005-puzzle/), so a runtime that optimizes tail calls runs this in constant stack space too.

> Note: `[xs[0]] + acc` is itself a small copy in Python specifically. In languages built around
> **immutable linked lists** (Clojure, Scala's `List`, Haskell), prepending is a true O(1) operation —
> the new list just points at the old one as its tail, sharing all of it. There the accumulator
> reverse is cleanly O(n). The lesson about *where the cost hides* is what transfers.

### The transferable skill

You just did **cost analysis of a recursion**: look at how much work each call does *and* how the work
sizes add up across the call chain. "Build it up on the way back" (Part 1) versus "carry it forward in
an accumulator" (Part 2) isn't just style — it changed an O(n²) algorithm into an O(n) one. Keep an
eye out for that hidden `+ [x]`-at-the-end pattern; it's a classic quadratic trap.

This closes our first pass over **recursion on lists**. Next we generalize the move you've now made
several times — *combine the head with the result for the tail* — into the single most powerful
list tool there is: the **higher-order function**, where functions themselves become values you pass
around.
