---
title: "Does the Order Evidence Arrives In Matter?"
description: "Update on two batches of data in one order, then the other. Same posterior either way — see why, and start to suspect when it would fail."
lesson_number: 18
track: bayes
concept: "Yesterday's posterior is today's prior (order of evidence)"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [15]
skin: chalkboard
numeric:
  question: "What is the final posterior mean, as a decimal, regardless of which order the two batches are processed in?"
  answer: 0.6
  tolerance: 0.005
---

Lesson 15 gave you the beta-binomial update rule: start with `Beta(α, β)`, observe `k` successes out
of `n` trials, and the posterior is `Beta(α + k, β + (n − k))` — you just add counts. So far every
lesson has updated on one batch of data at a time. Real data rarely arrives that tidily: it comes in
chunks, on different days, from different sources.

**Setup.** You start with a uniform prior, `Beta(1, 1)` (genuine ignorance — every value of `p` is
equally plausible). Two batches of evidence arrive, in some order:

- **Batch A**: 3 successes, 1 failure (4 trials)
- **Batch B**: 2 successes, 2 failures (4 trials)

**Part 1 — Process A, then B.** Starting from `Beta(1, 1)`, update on Batch A to get an intermediate
posterior. Then treat *that* posterior as your new prior, and update on Batch B. Write down the final
`Beta(α, β)` and its mean.

**Part 2 — Process B, then A.** Now start over from `Beta(1, 1)` again, but update on Batch B first,
then treat that result as your prior and update on Batch A. Write down this final `Beta(α, β)` and
its mean.

**Part 3 — Compare.** Are the two final posteriors the same? Give the shared posterior mean as a
decimal (this is the numeric answer above). Then, in a sentence, say *why* — what property of "just
add counts" guarantees the order can't matter here.
