---
title: "Solution: A Second Closed Form: Normal Meets Normal"
description: "6.04 minutes — the data's higher precision (2.25 vs the prior's 1) pulls the posterior about 69% of the way from the prior toward the sample mean."
lesson_number: 19
track: bayes
concept: "Conjugacy as a closed-form update; normal-normal"
stage: 3
layout: solution
role: solution
builds_on: [15, 18]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 4"
    url: https://allendowney.github.io/ThinkBayes2/chap04.html
    note: "grid-based intuition for normal-normal and other conjugate updates"
  - title: "3Blue1Brown — Bayes theorem"
    url: https://www.youtube.com/watch?v=HZGCoVF3YvM
    note: "visual intuition for how evidence reweights a prior"
---

**Exact answer: 6.038 minutes.**

```
prior precision = 1 / 1.0 = 1
data precision   = n / σ² = 9 / 4 = 2.25
posterior precision = 1 + 2.25 = 3.25

posterior mean = (5.0 × 1 + 6.5 × 2.25) / 3.25
               = (5.0 + 14.625) / 3.25
               = 19.625 / 3.25
               ≈ 6.038
```

If your guess landed noticeably closer to 6.5 than to 5.0, your intuition for precision-weighting is
already on track — the data's precision (2.25) is more than double the prior's (1), so it should pull
harder. The posterior mean sits about 69% of the way from the prior mean to the sample mean
(`(6.038 − 5.0) / (6.5 − 5.0) = 1.038 / 1.5 ≈ 0.69`) — proportional to the data's *share* of total
precision (`2.25 / 3.25 ≈ 0.69`, exactly).

**Why this is conjugacy, concretely.** Just like beta-binomial, the update didn't require touching
an integral: you added two precisions and took a weighted average of two means, and the result was
guaranteed (by the algebra of normal distributions) to itself be normal. That's what "conjugate"
buys you — a prior family paired with a likelihood family such that the posterior stays in the same
family, so the update reduces to arithmetic on the family's parameters. Beta-binomial adds *counts*
(`α`, `β`); normal-normal adds *precisions* and takes a weighted mean. Different families, same
underlying shape: combine what you believed with what you saw, weighted by how much each one is
worth trusting.

**More data narrows things further, exactly like Beta did.** If this had been `n = 900` sessions
instead of 9 (same sample mean), data precision would be `900/4 = 225`, dwarfing the prior's 1 — the
posterior mean would land almost exactly on 6.5, and the posterior variance (`1/posterior precision`)
would shrink correspondingly. Same "sharpening" phenomenon from Lesson 16, different distribution
family.

**Where this goes:** beta-binomial and normal-normal are two members of a broader family of
conjugate pairs (gamma-Poisson is another common one you'll meet if you go looking). But conjugate
pairs are the *exception*, not the rule — most real priors and likelihoods you'll want to combine
don't have a tidy closed form. Next lesson previews what you do when the closed form runs out.
