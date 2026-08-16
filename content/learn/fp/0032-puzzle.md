---
title: "Sharing vs Recomputation: The Hidden Cost of Naive Fibonacci"
description: "Purity lets you share a computed value freely — but only if your code actually shares it instead of recomputing it. Spot where naive recursion throws that away."
lesson_number: 32
track: fp
aliases: ["/learn/0032-puzzle/"]
concept: "Sharing vs recomputation"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [15, 23, 29]
skin: chalkboard
numeric:
  question: "How many total calls does naive recursive fib(n) make to compute fib(6) (fib(0) and fib(1) count as calls too)?"
  answer: 25
  tolerance: 0
  unit: "calls"
---

**Terms (standalone):**

- **Sharing**: reusing an already-computed value instead of recomputing it. In a pure language,
  sharing is always *safe* — a pure function returns the same output for the same input every time
  (Lesson 1's referential transparency, Lesson 7), so it never matters *how many times* or *when*
  you evaluate it, only *whether* the result gets reused once computed.
- **Recomputation**: computing the same value more than once because nothing cached or reused the
  first result. Recomputation is a performance bug, not a correctness bug — purity guarantees the
  *answer* is identical either way, but says nothing about how much *work* you did to get it.
- **Memoization**: explicitly caching a function's results keyed by its arguments, so a repeated
  call with the same input is served from the cache instead of recomputed.

Purity buys you the *option* to share freely — no aliasing bugs, no stale-cache correctness risk
(Lesson 7 established this). But purity does not *automatically* share anything. Whether a given
piece of code shares or recomputes is a property of how it's written, not a property of purity
itself.

The classic example is naive recursive Fibonacci:

```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

### Part 1 — Numeric (above): count the calls

Draw (on paper or in your head) the call tree for `fib(6)`. Every call to `fib`, at every depth —
including the base cases `fib(0)` and `fib(1)` — counts as one call. How many total calls happen?

(Hint: `fib(n)`'s call count `T(n)` satisfies `T(n) = T(n-1) + T(n-2) + 1`, with `T(0) = T(1) = 1`.
Build the tree, or the recurrence, up from the bottom.)

---

### Part 2 — Where's the actual duplication?

Look at the call tree for `fib(5)` specifically (a subtree of the `fib(6)` tree you just built).
`fib(3)` appears as a subcall of both `fib(4)` and `fib(5)` inside that tree. Is `fib(3)` computing
something *different* each of those times, or exactly the *same* value both times? What does that
tell you about whether this duplication is a correctness issue or a pure-waste issue?

---

### Part 3 — Fix it with memoization

Rewrite `fib` to cache results by argument, so each distinct `n` is computed at most once:

```python
def fib_memo(n, cache={}):
    ...
```

(In real code you'd avoid the mutable-default-dict gotcha with a fresh dict per top-level call or a
`functools.lru_cache` decorator — for this exercise, focus on the caching *logic*, not the Python
idiom.)

---

### Part 4 — What's the new call count, asymptotically?

With memoization, how many *distinct* values of `n` ever get computed for `fib(6)`? What does that
make the total work, roughly, compared to the exponential blowup of the naive version?
