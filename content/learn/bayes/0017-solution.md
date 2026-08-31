---
title: "Solution: What Do You Expect Next, Honestly?"
description: "0.429, not 0.413 — the honest predictive probability is higher than squaring the mean because a first success would itself update your belief about p."
lesson_number: 17
track: bayes
concept: "Posterior predictive: what do you expect next?"
stage: 2
layout: solution
role: solution
builds_on: [12, 15, 16]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive posterior visualization; watch how predictions widen when p itself is uncertain"
---

**Exact answer: 0.429.**

```
P(both succeed) = (9/14) × (10/15) = 0.6429 × 0.6667 = 0.4286 ≈ 0.429
```

Compare to the naive shortcut, squaring the mean: `0.643² ≈ 0.413`. The honest predictive
probability (0.429) is *higher* than the naive one (0.413) — not by accident. Here's why.

**Why the two numbers differ.** The naive shortcut treats `p` as if it were pinned at exactly 0.643
and asks a plain probability question about two independent trials at that fixed rate. But `p` isn't
pinned — Beta(9, 5) is a whole distribution of plausible values, some above 0.643, some below. The
correct calculation has to average the joint probability of "both succeed" over that entire
distribution, not evaluate it at one point.

Concretely: the reason the honest number comes out higher is that the two trials aren't independent
once you're uncertain about `p`. If the first trial happens to succeed, that success is itself
*evidence* that `p` is a bit higher than you thought — the posterior mean ticks up from 0.643 to
`10/15 ≈ 0.667` (exactly Lesson 16's update). So the second trial's probability of success, computed
under the *updated* posterior, is a little better than 0.643. Squaring the original mean ignores this
— it silently assumes the first trial teaches you nothing, when in fact every observation should
update your beliefs about every future one. Uncertainty about a parameter, carried through correctly,
correlates the outcomes that depend on it.

**The general pattern.** For a Beta(a, b) posterior, the probability the next `k` trials are all
successes is:

```
[a/(a+b)] × [(a+1)/(a+b+1)] × [(a+2)/(a+b+2)] × ... × [(a+k-1)/(a+b+k-1)]
```

— each factor is "the current posterior mean," updated one success at a time, exactly as if the
previous trials had actually happened. This is the **posterior predictive distribution** for future
Bernoulli trials under a beta-binomial model: it's always a bit more spread out (here, biased toward
the extremes and away from what a single fixed-`p` calculation would say) than treating the point
estimate as ground truth, because it's carrying real uncertainty about `p`, not pretending it away.

**Where this goes:** Stage 2 is done — you've built a posterior, watched it sharpen, and now
predicted honestly from it. Stage 3 formalizes something you've been doing informally the whole
time: treating yesterday's posterior as today's prior, and asking when the *order* evidence arrives
in is allowed to not matter.
