---
title: "Solution: A Seed With Two Jobs — Digits Most-Significant-First"
description: "largest_power_leq(2024,16) = 256, so the seed (2024, 256) unfolds to hex digits [7, 14, 8] — leading digit 7 — with no reversal, because the place value in the seed is exactly the control state the naive least-significant-first unfold was missing."
lesson_number: 27
track: fp
aliases: ["/learn/0027-solution/"]
concept: "Unfold with a control-carrying seed"
stage: 4
layout: solution
role: solution
builds_on: [25]
skin: chalkboard
---

### Warm-up recall answer

`[[1, 2], [3, [4, 5]], 6]` flattens to `[1, 2, 3, 4, 5, 6]` — **6 elements**. (`[4, 5]` is nested two
levels deep inside the second element; flattening recurses into it just like the top-level list.)

---

### Part 1 — `largest_power_leq(2024, 16)`

```python
def largest_power_leq(n, b):
    p = 1
    while p * b <= n:
        p *= b
    return p
```

`16^0 = 1`, `16^1 = 16`, `16^2 = 256`, `16^3 = 4096`. Since `256 ≤ 2024 < 4096`,
**`largest_power_leq(2024, 16) = 256`**. This is the number the naive least-significant-first
unfold never has to compute — and exactly the number the seed needs before it can emit anything.

---

### Part 2 — Trace `unfold_digits(2024, 16)`

```
seed=(2024,256) → element=2024//256=7,   next=(2024%256,256//16)=(232,16)
seed=(232,16)   → element=232//16=14,    next=(232%16,16//16)=(8,1)
seed=(8,1)      → element=8//1=8,        next=(8%1,1//16)=(0,0)
seed=(0,0)      → pred fires (place==0) → stop

result: [7, 14, 8]
```

Check: `7*256 + 14*16 + 8*1 = 1792 + 224 + 8 = 2024`. ✓ Three digits total — hex `0x7E8` (14 is the
hex digit `E`).

---

### Part 3 — The graded answer: 7

The first element the unfold emits is `2024 // 256 = 7` — the leading hex digit. **7.**

This is the exact repair for the gap the diagnostic surfaced: knowing *that* the seed should carry
extra state ("perhaps the seed could carry the power of `b`") isn't the same as being able to wire
up `pred`, `element`, and `step` so that state actually drives the computation. Here, `place_value`
is what `element` divides by to read a digit, and `s[1] // b` is what shrinks it — one place per
step, in lock-step with the digit already consumed.

---

### Part 4 — Other seeds that carry control state

- **Pagination cursor**: unfolding "all pages of a paged API" from a seed like
  `(next_page_token, has_more)` — the token is control state that has nothing to do with the page's
  *contents*, only with where to fetch next and whether to stop.
- **Run-length decoding**: unfolding `[(3, 'a'), (2, 'b')]` into `"aaabb"` needs a seed like
  `(remaining_runs, current_run_countdown)` — the countdown is pure control state tracking how many
  copies of the *current* character are left, separate from which character is being emitted.

Both share the shape of today's fix: the seed is a pair (or more) where one part *is* (or determines)
the next output, and the other part exists purely to steer the process — when to advance to the
next unit of input, when to stop.

---

### The pattern

`iterate`'s seed `(value, count)` and today's `(remaining, place)` are the same idea in different
clothes: **whenever what-to-emit-next and how-much-of-the-process-is-left are two different
questions, the seed has to answer both, as two separate components you evolve independently in
`step`.** A seed that only tracks the output value works exactly when those two questions happen to
have the same answer (as in plain `range`) — which is the easy case, not the general one.

**Why this matters for parallelism**: an unfold's `step` function only depends on the *current*
seed — never on how many steps have already happened or what's still to come — so each step is a
pure function of local state. That's what makes a family of unfolds (say, decoding many independent
numbers into digit lists) embarrassingly parallel: no unfold needs to know anything about another.

**Next**: back to trees. Lesson 25 ended with a forward hook to a *tree* unfold — a seed that
branches into two child seeds instead of stepping to one. Lesson 28 builds it for real, and checks
the result with a fold you already have (Lesson 23's `depth`).
