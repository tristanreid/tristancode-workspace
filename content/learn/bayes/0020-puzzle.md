---
title: "One Update, Two Distributions"
description: "Beta-binomial isn't the only conjugate pair. Normal-normal updates the same way in spirit, adding precision instead of counts."
lesson_number: 20
track: bayes
concept: "Conjugacy: beta-binomial and normal-normal"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [15]
skin: chalkboard
numeric:
  question: "Posterior mean response time, in milliseconds, after combining the prior with the new measurements below?"
  answer: 184
  tolerance: 1
  unit: "ms"
---

**First, a quick retrieval check — different concept, new setting.**

A factory sensor should catch defective units. Historically, 1% of units are defective (base rate).
The sensor alarms on 98% of actual defects, but also false-alarms on 5% of good units. It alarms on
today's unit. What's P(actually defective | alarmed)? Same machinery as Lesson 6, a different noun
than the diagnosis it was first taught with.

*(Worked out in the solution.)*

---

Every update in Stage 2 used the same machinery: beta prior, binomial-flavored data, add counts. That
pairing — a prior family that, combined with a specific likelihood, produces a posterior in the
*same* family — is called **conjugacy**. Beta-binomial is one conjugate pair. It isn't the only one.

**A second conjugate pair: normal-normal.** When your prior belief about an unknown mean is itself a
normal distribution, and your data is normally distributed with a *known* variance, the posterior is
*also* normal, with a closed form — no integration required, exactly like beta-binomial.

The closed form, in terms of **precision** (precision = `1 / variance`; a bigger number means a
tighter, more confident distribution):

```
posterior precision = prior precision + data precision
posterior mean = (prior_mean × prior_precision + sample_mean × data_precision) / posterior precision
```

where `data precision = n / σ²` (`n` new observations, each with known per-observation variance `σ²`).
It's a precision-weighted average of the prior mean and the sample mean — the same spirit as
beta-binomial's "more weight resists being moved," just phrased in variance instead of counts.

**Your scenario.** You're estimating the true average response time of an API endpoint.

- **Prior belief:** mean = **200 ms**, variance = **100** (so prior precision = `1/100 = 0.01`).
- **New data:** `n = 16` fresh measurements, sample mean = **180 ms**. Individual measurements are
  known (from long operational history) to have variance `σ² = 400` — so data precision =
  `n / σ² = 16 / 400 = 0.04`.

**Part 1 — Virtual sample size.** Beta-binomial's prior "weight" was `α + β` virtual trials, directly
comparable to real trials. Normal-normal has an analogous idea: a prior with variance `σ0²` behaves
like it's worth `n₀ = σ² / σ0²` virtual observations of the *same* per-observation noise as the real
data. Compute `n₀` for this prior. Is 16 real measurements a lot or a little, compared to that?

**Part 2 — Compute the posterior mean (the numeric answer above).** Use the precision formula above.
Should the posterior land closer to 200 (the prior) or 180 (the data), and by how much, given the two
precisions involved?

**Part 3 — More data.** Suppose instead you'd collected `n = 100` measurements at the same sample mean
of 180 ms. Recompute the posterior mean. Which way does it move relative to Part 2's answer, and why —
in terms of the same washing-out-the-prior idea from Lesson 14?
