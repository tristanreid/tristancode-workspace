---
title: "A Second Closed Form: Normal Meets Normal"
description: "Beta-binomial isn't the only conjugate pair. Estimate a precision-weighted posterior mean before computing it exactly."
lesson_number: 19
track: bayes
concept: "Conjugacy as a closed-form update; normal-normal"
stage: 3
layout: puzzle
role: puzzle
answer_type: estimate
builds_on: [15, 18]
skin: chalkboard
estimate:
  prompt: "What's the posterior mean session length, in minutes, after combining the prior belief with the observed data below?"
  answer: 6.038
  unit: "min"
---

Every update so far has used the same machinery: beta prior, binomial-flavored data, add counts. That
pairing — a prior family that, combined with a specific likelihood, produces a posterior in the
*same* family — is called **conjugacy**. Beta-binomial is one conjugate pair. It's not the only one.

**A second conjugate pair: normal-normal.** When your prior belief about an unknown mean is itself a
normal distribution, and your data is normally distributed with a *known* variance, the posterior is
*also* normal — with a closed-form mean and variance. No integration required, just like
beta-binomial.

The closed form, expressed in **precision** (precision = 1 / variance — a bigger number means a
tighter, more confident distribution):

```
posterior precision = prior precision + data precision
posterior mean = (prior_mean × prior_precision + sample_mean × data_precision) / posterior precision
```

where `data precision = n / σ²` (`n` observations, each with known per-observation variance `σ²`).
Notice the shape: it's a weighted average of the prior mean and the sample mean, weighted by how
*confident* each one is — exactly the same spirit as "more data pulls you further," just phrased in
variance instead of beta's counts.

**Your scenario.** You're estimating the true average session length on a website.

- **Prior belief:** mean = **5.0 minutes**, variance = **1.0** (so prior precision = 1/1.0 = 1).
- **New data:** `n = 9` sessions observed, sample mean = **6.5 minutes**. Individual sessions are
  known (from long historical experience) to have variance `σ² = 4` — so the *sample mean's* variance
  is `σ²/n = 4/9 ≈ 0.444`, giving data precision `n/σ² = 9/4 = 2.25`.

Before computing anything, use the precision-weighted-average intuition: the data's precision (2.25)
outweighs the prior's precision (1), so the posterior mean should land closer to the sample mean
(6.5) than to the prior mean (5.0) — roughly how much closer is exactly what you're estimating.

**Give your best guess for the posterior mean (in minutes), plus a 90% interval you're confident
contains the true value**, before you compute it exactly.
