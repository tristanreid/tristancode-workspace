---
title: "Solution: One Update, Two Distributions"
description: "184 ms — the prior is worth only 4 virtual measurements against 16 real ones, so the posterior lands much closer to the data than to the prior."
lesson_number: 20
track: bayes
concept: "Conjugacy: beta-binomial and normal-normal"
stage: 3
layout: solution
role: solution
builds_on: [15]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive posterior visualization; the same shrink-and-shift behavior, any conjugate family"
---

**Retrieval check answer.** P(alarm) = 0.98×0.01 + 0.05×0.99 = 0.0098 + 0.0495 = 0.0593.
P(defective | alarmed) = 0.0098 / 0.0593 ≈ **0.165** (about 16.5%) — most alarms are false alarms, the
same base-rate story as Lesson 7, on a factory line instead of a clinic.

---

**Part 1 — Virtual sample size: `n₀ = 400/100 = 4`.** This prior is worth only 4 virtual
measurements — weak, compared to 16 real ones (4× as much real evidence as prior evidence). Expect the
posterior to land much closer to the data's 180 ms than to the prior's 200 ms.

**Part 2 — Posterior mean: 184 ms.**

```
prior precision = 1/100 = 0.01
data precision   = 16/400 = 0.04
posterior precision = 0.01 + 0.04 = 0.05

posterior mean = (200 × 0.01 + 180 × 0.04) / 0.05
               = (2 + 7.2) / 0.05
               = 9.2 / 0.05
               = 184
```

184 ms is 4× closer to the data (180) than to the prior (200) — distance 4 from the data, distance 16
from the prior, a 4:1 split, exactly matching the 4:1 ratio of data precision to prior precision
(`0.04 : 0.01`). This is the *precision-weighted average* doing exactly what its name says: whichever
side carries more precision (equivalently, more "weight" in the beta-binomial sense) pulls the
posterior more of the way toward itself.

**Part 3 — With `n = 100`: posterior mean ≈ 180.77 ms.**

```
data precision = 100/400 = 0.25
posterior precision = 0.01 + 0.25 = 0.26
posterior mean = (200×0.01 + 180×0.25) / 0.26 = (2 + 45)/0.26 = 47/0.26 ≈ 180.77
```

With 100 real measurements, data precision (0.25) dwarfs the prior's fixed 0.01 — the posterior lands
almost exactly on the data's 180, barely nudged by the prior at all. This is **washing out the
prior** (Lesson 14) in its precision-weighted form: any finite prior's pull is a fixed, bounded
quantity, while data precision grows without bound as `n` grows, so enough real data eventually
swamps any reasonable prior — the same phenomenon, in a completely different distribution family.

**Why this is conjugacy, concretely.** Neither computation touched an integral. You added two
precisions and took a weighted average of two means, and the algebra of normal distributions
*guarantees* the result is itself normal. That's what "conjugate" buys you: a prior family paired
with a matching likelihood family such that the posterior stays in the same family, collapsing the
update to arithmetic on that family's own parameters. Beta-binomial adds *counts* (`α`, `β`);
normal-normal adds *precisions* and takes a weighted mean. Different parameters, same underlying
shape: combine what you believed with what you saw, weighted by how much each side is worth trusting.

**Where this goes:** conjugate pairs like these two are the convenient exception, not the rule — most
real priors and likelihoods you'd actually want to combine don't have a tidy closed form at all. Next
lesson previews exactly what breaks conjugacy, and what you do once the closed form runs out.
