---
title: "Solution: The Penalty That Shrinks the Fit"
description: "w=1, pulled down from 5 by the penalty — and why that pull is exactly what a Bayesian would call a prior belief that coefficients start small."
lesson_number: 8
track: ml
concept: "Regularization"
stage: 1
layout: solution
role: solution
builds_on: [5, 6]
skin: chalkboard
resources:
  - title: "MLU-Explain — Ridge Regression"
    url: https://mlu-explain.github.io/ridge-lasso/
    note: "L1 vs L2 penalties, and why they shrink coefficients differently"
---

**w = 1.** Setting the derivative to zero: `2(w−5) + 2(4)w = 0` → `2w − 10 + 8w = 0` →
`10w = 10` → **w = 1**. Compare to the unregularized optimum (λ=0): plain `2(w−5)=0` gives `w=5`.
The penalty pulled the fitted weight from 5 all the way down to 1 — not because the data changed,
but because the loss now charges for coefficient size, and giving up some data-fit to shrink `w`
was worth it once that charge was added. In general, ridge's closed form here is
`w = w_unregularized / (1 + λ)` — plug in λ=4 and 5/(1+4)=1 falls straight out, and it shows the
whole mechanism in one glance: bigger λ divides harder, shrinking the fit further toward zero
(λ→∞ crushes every weight to 0 — a model that predicts the same constant everywhere, ignoring
data entirely, lesson 4's mean-baseline reborn as a regularization limit).

**Why shrinking toward zero fights overfitting.** A model with large coefficients can swing
wildly with small input changes — exactly lesson 3's degree-9 polynomial, whose oscillations came
from large, precisely-tuned coefficients threading noisy points. Penalizing size directly
discourages that swinginess without having to hand-pick a simpler function family; you keep the
flexible family but tax it for using more flexibility than the data can justify, and the tax gets
paid for out of variance (this bias/variance vocabulary, from lesson 3, applies exactly here too):
regularization trades a little bias (the fit is no longer the absolute best on training data) for
a lot less variance (it swings far less on a fresh batch).

**The Bayesian reading — the same idea from an entirely different direction.** If you place a
prior belief on `w` that it's probably close to zero unless the data strongly argues otherwise
(a specific shape of prior — Gaussian, centered at 0 — gives you exactly this L2 penalty as the
math falls out), then finding the *most probable* `w` given the data (a Bayesian's natural
objective) produces precisely this same shrunk-toward-zero answer. Regularization strength `λ`
and "how confident/narrow the prior is" turn out to be the same knob, described in two
vocabularies: a large λ is a strong prior that coefficients are near zero; λ=0 is "no prior
opinion, let the data fully decide." This isn't an analogy — it's the identical optimization
problem, arrived at by two historically separate traditions (frequentist penalized regression;
Bayesian maximum-a-posteriori estimation) that turn out to compute the same number.

**Where this goes:** stage 1 built linear models end to end — fit, search, calibrate, tame. Stage
2 moves to a completely different function family that makes no linearity assumption at all:
decision trees, which carve up feature space with a sequence of if/else cuts instead of a weighted
sum.
