---
title: "Solution: When the Closed Form Runs Out"
description: "Option 3 — a bimodal belief force-fit into a Beta(2,2) shape. The closed-form update then answers a question about the wrong prior."
lesson_number: 20
track: bayes
concept: "When conjugacy breaks and why that's fine (grid thinking preview)"
stage: 3
layout: solution
role: solution
builds_on: [19]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 3, Estimation"
    url: https://allendowney.github.io/ThinkBayes2/chap03.html
    note: "grid approximation worked from scratch, no conjugacy required"
---

**Option 3.** Setups 1, 2, and 4 all use a prior that genuinely *is* the shape it's paired with —
Beta with Bernoulli/binomial, Normal with Normal — so the closed-form update is exact and correct.
Setup 3 uses the same `Beta(2, 2)` arithmetic, but admits up front that the real belief being
represented is **bimodal** (two humps — "probably low, or probably high, but probably not the
single-humped middle that Beta(2,2) actually describes"). A Beta(2, 2) is single-peaked at 0.5 by
construction; it *cannot* represent "I think it's either around 0.2 or around 0.8, unlikely to be near
0.5" no matter how you tune its two parameters. Feeding it into the closed-form update produces a
perfectly valid posterior — for the wrong prior. The arithmetic doesn't know it's being lied to.

**Why this matters more than it sounds like it should.** Conjugacy is seductive precisely because
it's so convenient: pick a prior *because* it's conjugate, rather than because it's what you
actually believe, and the update stays easy — while quietly drifting away from representing your
real uncertainty. The rule to hold onto: **conjugacy is a property of a prior-likelihood pair, not
a blank check to approximate any belief with whatever family makes the math clean.**

**What you do instead: grid approximation.** When the true prior doesn't match any conjugate family
(bimodal, oddly skewed, bounded in a strange way, built from a mix of expert opinions — anything),
you can still get an exact-enough posterior *numerically*, no closed form required:

1. Lay out a fine grid of candidate values for the parameter (say, `p = 0.00, 0.01, 0.02, ..., 1.00`).
2. Assign each grid point a prior weight matching your *actual* belief (read it off your hand-drawn
   curve, however lumpy).
3. For each grid point, multiply by the likelihood of the observed data at that value of `p`
   (the same binomial/normal/whatever likelihood formula you've been using all along).
4. Normalize (divide by the sum) so the weights sum to 1 — that's your posterior, one number per
   grid point, as a lookup table instead of a formula.

No conjugate family required — this works for *any* prior shape, at the cost of doing the sum by
brute force instead of algebra. It's less elegant than a closed form, and it's also strictly more
general: closed-form updates are the special case where the brute-force grid sum happens to have a
tidy algebraic shortcut.

**Where this goes:** Stage 5 builds grid approximation properly, by hand, as "the honest workhorse"
for exactly this situation. For now, the lesson to keep is narrower: before reaching for a conjugate
shortcut, check that the shortcut's shape is actually the belief you hold — not just the belief
that's easiest to compute with.
