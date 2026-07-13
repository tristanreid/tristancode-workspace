---
title: "Chasing the Leftover Error"
description: "Bagging averages independent guessers to kill variance. Boosting does something structurally different: each new learner's entire job is to fix what's still wrong."
lesson_number: 11
track: ml
concept: "Boosting: stacking weak learners on residuals"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [9, 10]
skin: chalkboard
numeric:
  question: "F1(x), the prediction after one boosting round?"
  answer: 51.8
  tolerance: 0.1
---

Lesson 10's random forest grew many deep trees **independently** and averaged them, attacking
variance. **Boosting** attacks the *other* half of lesson 3's tradeoff — **bias** — with a
completely different structure: trees built **sequentially**, each one trained specifically to
predict what the *previous* trees still got wrong.

The core loop, for a numeric target:

1. Start with a simple baseline prediction, **F₀** (often just the training mean).
2. Compute the **residual** for each data point: actual value − current prediction.
3. Fit a new, deliberately weak learner (a shallow tree) to *predict that residual* — not the
   original target, the leftover error.
4. Add the weak learner's prediction back in, scaled by a small **learning rate (shrinkage) η**
   (typically 0.05–0.3), so no single round overcorrects: **F₁ = F₀ + η · h₁(x)**.
5. Repeat: compute new residuals against F₁, fit another weak learner to *those*, and so on.

Each round's weak learner only ever has to solve the *remaining* problem — a much easier target
than the raw data — which is how a sequence of individually weak, high-bias learners combines into
a strong, low-bias one, so long as each round genuinely reduces the leftover error a little.

For one training example: **actual value = 80**. Baseline **F₀ = 50** (the training mean). The
residual is 80 − 50 = 30. A shallow tree is fit to predict that residual, but — being weak, it
doesn't nail it exactly — for this point it predicts **h₁(x) = 18**. Using a learning rate
**η = 0.1**, compute **F1(x)**, the prediction after this one boosting round.
