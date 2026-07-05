---
title: "Squashing a Line Into a Probability"
description: "Logistic regression is linear regression with one extra move: squash the line's output through a curve that only ever returns numbers between 0 and 1."
lesson_number: 7
track: ml
concept: "Logistic regression"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [5, 6]
skin: chalkboard
numeric:
  question: "Predicted probability of the positive class, to 3 decimal places?"
  answer: 0.881
  tolerance: 0.005
---

Lessons 5-6 built and fit a **linear model**: `z = w·x + b`, a weighted sum that can be *any* real
number — including −4,000,000 or 4,000,000. That's fine for predicting a price, but useless for
predicting "will this customer churn": a probability has to land in `[0, 1]`, and a raw linear sum
never respects that on its own.

**Logistic regression** is the fix: fit the same linear combination `z = w·x + b`, then pass `z`
through the **sigmoid function** before calling it a prediction:

> σ(z) = 1 / (1 + e^(−z))

Sigmoid takes any real number and squashes it into `(0, 1)`: very negative z → near 0, very
positive z → near 1, z = 0 → exactly 0.5. The linear part still does all the same work as before
(each feature still gets a coefficient, still interpreted "holding the others fixed," lesson 5's
whole lesson intact) — sigmoid only reshapes the *output* into something a probability can be.

Critically, the model is trained (lesson 6's gradient descent) to make that squashed number not
just *bounded* but **calibrated**: among all the times it outputs "0.7", roughly 70% of those
cases should actually belong to the positive class. A bounded-but-uncalibrated number would still
technically sit in `[0,1]` while being useless as a probability — calibration is the property that
makes "0.7" mean something.

A churn model computes `z = w·x + b = 2.0` for a given customer. What probability of churn does
the model output? (Use e ≈ 2.71828.)
