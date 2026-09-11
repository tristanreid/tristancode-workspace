---
title: "Solution: Same Data, Either Order"
description: "Beta(9,10) either way, mean 0.474 — addition commutes, so order can't matter, unless the true rate itself was drifting between batches."
lesson_number: 19
track: bayes
concept: "Yesterday's posterior is today's prior (order of evidence)"
stage: 3
layout: solution
role: solution
builds_on: [10, 15]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 4, Estimating Proportions"
    url: https://allendowney.github.io/ThinkBayes2/chap04.html
    note: "walks through sequential vs. batch updating on the same data, free online"
---

**Retrieval check answer.** P(neither fails) = 0.97 × 0.97 = 0.9409. P(at least one fails) =
1 − 0.9409 = **0.0591** (about 5.9%) — small individual risks compound faster than intuition
suggests once you ask "at least one of several."

---

**Part 1 — A then B.** `Beta(2,3)` + Batch A (5 succ, 3 fail) → `Beta(7, 6)`. Then `Beta(7,6)` +
Batch B (2 succ, 4 fail) → **`Beta(9, 10)`**.

**Part 2 — B then A.** `Beta(2,3)` + Batch B (2 succ, 4 fail) → `Beta(4, 7)`. Then `Beta(4,7)` +
Batch A (5 succ, 3 fail) → **`Beta(9, 10)`**. Identical.

**Part 3 — Mean: 0.474.** `9 / (9+10) = 9/19 ≈ 0.4737`. **Why order can't matter:** the update rule is
nothing but addition — `α_new = α_old + successes`, `β_new = β_old + failures`. Whether you add
"5 successes, then 2 successes" or "2 successes, then 5 successes" to `α`, the total is
`2 + 5 + 2 = 9` either way — addition doesn't care what order its terms arrive in. The posterior only
ever depends on the *total* accumulated counts, never the sequence they arrived in. That's the whole
content of "yesterday's posterior is today's prior": every update folds all prior evidence into one
distribution, and that distribution is all the next update needs — it carries no memory of *how* it
got there, only *how much* evidence it represents.

**Part 4 — where it breaks.** Suppose Batch A was collected from a checkout flow *before* a pricing
change, and Batch B was collected from the same flow *after* the pricing change shifted the true
conversion rate. Combining the counts — `Beta(9,10)` — silently assumes both batches are evidence
about one fixed `p`, when in fact you have evidence about *two different* rates that happened to get
mixed together. The arithmetic runs identically and produces a posterior that looks just as confident
as it would for genuinely stationary data — nothing about `Beta(9,10)` warns you that the pricing
change happened. The fix isn't "add more data" — more post-change data mixed with pre-change data
just compounds the error more confidently. The fix is to recognize the two batches describe different
parameters and either model them separately or explicitly track *when* each observation arrived (a
time-varying model), rather than pooling blindly. Order-independence is a genuine, useful property —
right up until the thing you're estimating stops holding still, and then it silently produces a
precise-looking wrong answer instead of failing loudly.

**The pattern:**

| Update order | Intermediate | Final | Mean |
|---|---|---|---|
| A then B | Beta(7,6) → | **Beta(9,10)** | 0.474 |
| B then A | Beta(4,7) → | **Beta(9,10)** | 0.474 |

**Where this goes:** next lesson introduces a second conjugate pair — normal-normal — showing that
beta-binomial's "closed-form update by simple addition" isn't a one-off trick; it's one instance of a
broader pattern called **conjugacy**, with its own version of "add up the evidence" phrased in terms
of precision instead of counts.
