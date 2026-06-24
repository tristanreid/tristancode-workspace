---
title: "Solution: Sum a List Without a Loop"
description: "The two-case shape of recursion, a full call trace, and why this pattern is the seed of folds."
lesson_number: 3
concept: "Recursion over lists"
stage: 1
layout: solution
role: solution
builds_on: [1]
skin: chalkboard
---

Here's the function:

```python
def total(xs):
    if xs == []:
        return 0                      # base case
    else:
        return xs[0] + total(xs[1:])  # recursive case
```

**The empty list sums to `0`.** That's the right base case for two reasons: it's the true answer (an
empty list has nothing to add), and `0` is the value that doesn't disturb a sum — adding it changes
nothing. Every recursion needs a base case like this, or it would call itself forever.

**The recursive case is `xs[0] + total(xs[1:])`.** The leap of faith is this: *assume* `total(xs[1:])`
already gives the correct sum of the rest of the list. Then the sum of the whole list is just the
first element plus that. You don't trace the inner call in your head — you trust it. This is the heart
of recursive thinking: solve the whole by trusting the solution to a smaller piece.

### The trace

Watch `total([3, 1, 2])` unfold. Each call waits on the one inside it:

```
total([3,1,2]) = 3 + total([1,2])
               = 3 + (1 + total([2]))
               = 3 + (1 + (2 + total([])))
               = 3 + (1 + (2 + 0))        ← base case hit
               = 3 + (1 + 2)
               = 3 + 3
               = 6
```

The calls stack up as we peel off one element at a time, hit the base case at the empty list, then
the additions resolve on the way back out. No loop, no mutation, no counter variable — and the
function is [pure](../0001-puzzle/): same list in, same number out, nothing else touched.

### The pattern under the pattern

Look at the recursive case again: `first ELEMENT, then COMBINE it with the result for the rest`. That
exact shape — *take the head, combine with the recursively-computed tail* — describes far more than
summing:

- Product of a list? Base case `1`, combine with `*`.
- Length? Base case `0`, combine with "1 + (length of rest)".
- Largest element? Base case the first element, combine with `max`.

Same skeleton, different "starting value" and "combine" step. Later in this path we'll give that
skeleton a name — a **fold** — and discover it's the single most important tool for consuming a list.
And once the combine step is *associative* (like `+`), it stops being a strict left-to-right chain and
can be split into a tree of work that runs in **parallel** — which is where this all heads.

**Next:** another recursion over lists with a twist in its base case — finding the **last element**
(Lesson 4).
