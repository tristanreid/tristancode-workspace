---
title: "Five Settings, No Formula"
description: "When your actual belief doesn't fit any conjugate family, Bayes' rule still works — just as a grid of numbers instead of an algebraic shortcut."
lesson_number: 21
track: bayes
concept: "When conjugacy breaks: grid approximation preview"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [12, 15]
skin: chalkboard
numeric:
  question: "Posterior mean of p from the 5-point grid below, after observing 3 successes in 4 trials, to 3 decimal places?"
  answer: 0.604
  tolerance: 0.01
---

**First, a quick retrieval check — different concept, new setting.**

A startup's traffic comes from four channels whose shares must sum to 1 (Lesson 12's rule: every
answer sheet of plausibilities has to add up to one, whether it's a die's faces or something else
entirely). Organic search: 35%. Paid ads: 25%. Email: 15%. Referral is the remaining share. What's
referral's share?

*(Confirmed in the solution.)*

---

Lessons 15 and 20 gave you two conjugate pairs — beta+binomial, normal+normal — where the posterior
update collapses to arithmetic on a couple of parameters. That's a huge convenience, but it depends on
your actual prior belief genuinely belonging to the matching family. Sometimes it just doesn't.

**Scenario.** A device can only be manufactured at one of exactly **five known factory settings**,
producing a defect rate `p` of `0.1, 0.3, 0.5, 0.7,` or `0.9` — nothing in between is physically
possible. Based on which factories are currently running this product line, your prior belief across
those five settings is:

| p | 0.1 | 0.3 | 0.5 | 0.7 | 0.9 |
|---|---|---|---|---|---|
| prior weight | 0.05 | 0.15 | 0.50 | 0.20 | 0.10 |

This is **not** a beta distribution — it has five-point discrete support, not a smooth curve over
`[0,1]` — so none of the beta-binomial machinery applies. But Bayes' rule doesn't care whether your
prior is smooth: it works on any prior, by brute force if necessary.

**Grid approximation, the mechanism:**
1. Take each candidate value of `p` and its prior weight.
2. Multiply by the likelihood of the observed data at that value of `p` (the same binomial likelihood
   formula from Lesson 13: `C(n,k) p^k (1−p)^(n−k)` — or since `C(n,k)` is the same constant across
   every row here, you can drop it and use `p^k(1−p)^(n−k)` directly, same reasoning as Lesson 16).
3. Normalize (divide every row by the total) so the weights sum back to 1 — that's your posterior,
   one number per grid point.

**Data:** you observe **3 successes in 4 trials**.

**Part 1 — Compute the likelihood at each grid point.** For each of the 5 candidate `p` values, compute
`p³(1−p)` (dropping the shared `C(4,3)=4` constant, or keep it — it cancels in the normalization
either way; try it without first).

**Part 2 — Unnormalized posterior.** Multiply each prior weight by its likelihood. Sum all five
products.

**Part 3 — Normalize.** Divide each unnormalized value by the sum from Part 2. Confirm the five
normalized values sum to 1.

**Part 4 — Posterior mean (the numeric answer above).** Compute `Σ p × (normalized posterior weight)`
across all five grid points. How does the data (3 out of 4 successes, a 75% raw rate) shift the
distribution compared to the prior, which was heavily weighted toward `p = 0.5`?
