---
title: "The Penalty That Shrinks the Fit"
description: "Regularization adds a second term to the loss that punishes big coefficients — solve for the optimum by hand and watch the fit get pulled toward zero."
lesson_number: 8
track: ml
concept: "Regularization"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [5, 6]
skin: chalkboard
numeric:
  question: "The optimal w that minimizes (w−5)² + λw² when λ=4?"
  answer: 1
  tolerance: 0.01
---

Lessons 5-7 fit weights by minimizing a loss built purely from data-fit — squared error, or
cross-entropy for probabilities. Left alone, that loss is happy to grow a coefficient as large as
the data can justify, and lesson 3's overfitting lesson showed exactly where unchecked flexibility
leads: a curve threading every point, memorizing noise.

**Regularization** adds a second term to the loss — a penalty on the coefficients' size — so the
fit has to *earn* every unit of coefficient magnitude, not just grab whatever minimizes data error
alone. The common form (**L2** / "ridge" regularization) adds `λ · w²` for each weight, where **λ**
(lambda) controls how hard the penalty bites:

> total loss = (data-fit loss) + λ · w²

λ = 0 recovers the unregularized fit exactly. As λ grows, the optimizer trades away data-fit
accuracy for a smaller `w`, because the penalty term now costs real loss-points too. Somewhere in
between is a coefficient that's smaller than pure data-fitting would choose, but generalizes
better precisely because it hasn't chased every quirk of the training set.

Take a toy one-weight loss where pure data-fit alone wants `w = 5` (that's the unregularized
optimum): `L(w) = (w − 5)² + λw²`. With **λ = 4**, find the `w` that minimizes `L(w)`.

(Calculus shortcut: set the derivative to zero. `dL/dw = 2(w−5) + 2λw = 0`, solve for `w`.)
