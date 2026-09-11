---
title: "Solution: When the Simple Model Wins"
description: "Linear totals 14, deep totals 30 — a 16-point gap driven entirely by variance the deep model can't afford at this sample size, not by any weakness in its bias."
lesson_number: 22
track: ml
concept: "Bias/variance in the wild: when a linear model beats a deep one"
stage: 7
layout: solution
role: solution
builds_on: [3, 10, 11]
skin: chalkboard
resources:
  - title: "MLU-Explain — The Bias-Variance Tradeoff"
    url: https://mlu-explain.github.io/bias-variance/
    note: "interactive walkthrough of the exact decomposition used here"
---

**Retrieval check.** `F1(x) = F0 + η·h1(x) = 200 + 0.2 × 45 = 200 + 9 = 209`. Same boosting update,
new baseline and residual.

**Main answer: 16.** Linear model total = `9 + 1 + 4 = 14`. Deep model total = `1 + 25 + 4 = 30`.
Difference = `30 − 14 = 16` — the deep model's expected error is more than twice the linear model's,
on this dataset.

**Why, mechanically.** The deep model *does* deliver on its promise of lower bias (1 vs. 9) — it
really can represent the nonlinear wiggle the linear model can't. But that lower bias costs a
variance of 25 against the linear model's 1, and the arithmetic doesn't care that lower bias sounds
like the more sophisticated achievement: `25` swamps the `8`-point bias advantage by a wide margin.
300 rows simply isn't enough data to pin down a high-capacity model's many parameters reliably —
train it on a different random 300-row sample from the same distribution, and its fit swings a lot;
train the linear model on a different sample, and it barely moves, because it only has a few degrees
of freedom to begin with. The deep model isn't *wrong* about the world in the way a biased model is
— it's *unstable*, and instability shows up in the exact same total-error number a systematic error
would.

**What would flip the ranking.** More data is the direct lever: variance shrinks as a model sees
more independent samples (the same `σ²/n`-shaped fact behind lesson 10's bagging), so at, say,
300,000 rows instead of 300, the deep model's variance term could plausibly fall well below its
current 25, while the linear model's bias² of 9 doesn't move at all — a low-bias, low-variance model
with more capacity available than the data can currently support. A true relationship with *more*
nonlinear structure than "mostly linear, modest wiggle" would also help the deep model, by raising
the linear model's bias² term (it's leaving more real signal on the table) without necessarily
raising the deep model's variance. Neither factor is fixed — this decomposition describes *this*
dataset, at *this* size, with *this* much true nonlinearity, not a universal verdict on linear versus
deep models.

**The baseline-before-brilliance point, made numeric.** "Deep" isn't a synonym for "better" — it's a
bet that lower bias will outweigh the variance cost of more capacity, and that bet is a function of
how much data you actually have relative to how much capacity you're deploying. Before reaching for
a bigger model, this decomposition (or its empirical proxy — comparing validation error across model
families of different capacity, directly) is the check that tells you whether you're buying a real
improvement or buying instability dressed up as sophistication.

**The bayes echo.** This is the frequentist version of an idea lesson 8's regularization already
gestured at in Bayesian language: a strong, well-chosen prior *is* a deliberate bias/variance trade,
made on purpose, to buy stability when data is scarce relative to the model's capacity — the same
trade this lesson's linear model is making implicitly, just without calling it a prior.

**Where this goes:** the next lesson turns from "which model wins" to a subtler failure that hits
winning models too: what happens when you start optimizing directly against the metric you're using
to measure success.
