---
title: "Solution: Chasing the Leftover Error"
description: "51.8 — most of the residual is still there on purpose. Shrinkage is what keeps boosting from overfitting round by round."
lesson_number: 11
track: ml
concept: "Boosting: stacking weak learners on residuals"
stage: 2
layout: solution
role: solution
builds_on: [9, 10]
skin: chalkboard
resources:
  - title: "MLU-Explain — Gradient Boosting"
    url: https://mlu-explain.github.io/gradient-boosting/
    note: "animates the residual-fitting loop this lesson walks through by hand"
---

**F1(x) = F0 + η · h1(x) = 50 + 0.1 × 18 = 51.8.**

After one round, the prediction moved from 50 toward 80 — but only to 51.8, a small fraction of the
way. That's not a mistake in the arithmetic; it's the **shrinkage** (learning rate η) doing its job
on purpose. A residual of 30 was found; the model chose to act on only 10% of it (η = 0.1) this
round, leaving a residual of 80 − 51.8 = 28.2 for the *next* round's weak learner to chase.

**Why deliberately underreact.** If each round fully corrected its residual (η = 1, no shrinkage),
the very first weak learner to perfectly fit the training residuals would drive training error to
near zero immediately — which is exactly the overfitting failure mode lesson 3 named: a model that
has memorized the specific noise in *this* training batch rather than the general pattern. Small η
forces the correction to be spread across **many** rounds, each contributing only a sliver, so the
final model reflects a slow *consensus* of many weak, residual-chasing trees rather than one
learner's confident (and likely noise-fitting) full correction. The practical cost: more rounds are
needed to reach a good fit — shrinkage trades training speed for generalization, a direct,
intentional bias/variance-style knob (higher η fits faster and risks overfitting; lower η is safer
but slower and needs more rounds).

**Bagging (lesson 10) vs boosting (this lesson) is the sharpest contrast in this whole stage.**
Bagging's trees are grown **independently and in parallel**, each blind to what the others predict
— averaging works because their *errors* are (imperfectly) independent, which is a variance play.
Boosting's trees are grown **sequentially and dependently** — each one's entire existence is a
reaction to what came before, deliberately targeting the specific gap the ensemble-so-far left
open, which is a bias play. A forest of independent guessers vs. a relay team where each runner
picks up exactly where the last one stopped — same "combine many trees" surface, opposite
mechanism, opposite failure mode each guards against.

**Where this goes:** boosting builds a strong model by stacking many weak, correction-focused
trees — but *which* features each of those trees actually leaned on to make its corrections is a
question worth its own skepticism, next lesson.
