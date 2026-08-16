---
title: "Solution: Sharing vs Recomputation — The Hidden Cost of Naive Fibonacci"
description: "25 calls for fib(6), most of it pure waste — the same fib(3) computed from scratch every time it's needed. Purity makes sharing safe; memoization is what actually shares."
lesson_number: 32
track: fp
aliases: ["/learn/0032-solution/"]
concept: "Sharing vs recomputation"
stage: 5
layout: solution
role: solution
builds_on: [15, 23, 29]
skin: chalkboard
---

### Numeric answer: 25 calls

Using the recurrence `T(n) = T(n-1) + T(n-2) + 1` (one call for `fib(n)` itself, plus everything
its two recursive calls do), with `T(0) = T(1) = 1`:

```
T(0) = 1
T(1) = 1
T(2) = T(1) + T(0) + 1 = 1 + 1 + 1 = 3
T(3) = T(2) + T(1) + 1 = 3 + 1 + 1 = 5
T(4) = T(3) + T(2) + 1 = 5 + 3 + 1 = 9
T(5) = T(4) + T(3) + 1 = 9 + 5 + 1 = 15
T(6) = T(5) + T(4) + 1 = 15 + 9 + 1 = 25
```

**25 total calls** to compute a single answer that only required 7 *distinct* values of `n` (0
through 6). This ratio gets dramatically worse as `n` grows — `T(n)` grows exponentially (roughly
`φⁿ` where φ is the golden ratio), while the number of distinct subproblems grows only linearly.
`fib(30)` naively makes over 2.5 million calls to answer a question with only 31 distinct inputs.

---

### Part 2 — Same value, computed twice, for free

`fib(3)` shows up **three separate times** in the full `fib(6)` tree: once as `fib(5)`'s direct
right branch, once inside `fib(6)`'s own `fib(4)` branch (`fib(4) → fib(3)`), and once inside
`fib(5)`'s `fib(4)` branch (`fib(5) → fib(4) → fib(3)`). Three different call sites, and **every
single time**, `fib(3)` re-derives the exact same answer (`fib(3) = 2`) via the exact same
sub-recursion, from scratch, ignorant that it was just computed moments ago.

This is purely a **waste-of-work** issue, not a correctness issue — and that distinction is the
whole lesson. Because `fib` is pure (Lesson 1: output depends only on input; Lesson 7: referential
transparency — a call can be replaced by its result with no change in meaning), `fib(3)` is
*guaranteed* to return `2` every time, unconditionally, forever. There is no risk of "the value
changed since last time" or "someone else's call polluted my cache" — the exact hazards that make
caching dangerous in code with mutable state or side effects. Purity is precisely what makes it
*safe* to skip recomputing `fib(3)` the second time and just hand back the answer from the first
call. But nothing about purity does that automatically — the naive recursive definition simply
never tries.

---

### Part 3 — Memoized `fib`

```python
def fib_memo(n, cache=None):
    if cache is None:
        cache = {}
    if n in cache:
        return cache[n]
    if n <= 1:
        result = n
    else:
        result = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    cache[n] = result
    return result
```

The logic: before recursing, check whether this `n` has already been solved. If so, return the
cached answer immediately — zero further recursive calls. If not, compute it (recursively, passing
the *same* cache down so sibling branches share it), then store the result before returning.

(The idiomatic Python version is `@functools.lru_cache(maxsize=None)` on a single-argument `fib` —
same idea, handled for you. The mutable-default-argument version above is written out explicitly so
the caching mechanism is visible.)

---

### Part 4 — Distinct values: 7. Total work: linear, not exponential

For `fib(6)`, exactly 7 distinct arguments ever get computed: `fib(0)` through `fib(6)`. Each is
computed **once**, cached, and every subsequent request for that same `n` is an O(1) cache lookup.
Total real work is O(n) instead of O(φⁿ) — an exponential-to-linear improvement, all from the same
recursive structure, just refusing to throw away an answer it already has.

---

### The pattern

| Version | Distinct values computed | Total calls for fib(6) | Growth |
|---|---|---|---|
| Naive recursive | 7 | 25 | O(φⁿ) — exponential |
| Memoized | 7 | 7 (+ cache hits) | O(n) — linear |

**Rule**: purity guarantees *that* a repeated computation gives the same answer — it never
guarantees you'll notice the repetition and skip it. Sharing is a decision your code makes
(memoization, or restructuring to compute bottom-up as Stage 3's folds do); recomputation is simply
what happens by default when nothing makes that decision.

**Connects to Lesson 29**: the lazy streams you built there get this sharing "for free" in real
lazy languages via a technique called *memoized thunks* — a thunk, once forced, caches its result
so later demands for the same value are O(1) instead of re-running the computation. That's exactly
today's fix, just built into the laziness mechanism itself rather than hand-rolled.

**Where this goes:** Stage 5 closes here, having covered eager vs lazy evaluation, infinite
structures, runaway recursion, tail calls, and now sharing. Stage 6 opens with continuation-passing
style — an explicit representation of "what happens next" that turns *every* call into a tail call
by construction.
