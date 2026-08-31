---
title: "The Line That Can't Be Drawn"
description: "Four points, two classes — and no straight line separates them. See why a single linear model is provably stuck, and what composing two of them buys you."
lesson_number: 18
track: ml
concept: "The perceptron → depth: composing simple functions buys expressiveness"
stage: 4
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1, 7]
skin: chalkboard
mcq:
  question: "Can a single linear decision boundary (one logistic-regression-style model, one perceptron) correctly classify all four XOR points below?"
  options:
    - "Yes — any four points can be separated by some line if you pick the right weights"
    - "No — the two classes are arranged so that no single straight line can separate them, no matter the weights"
    - "Yes, but only if you also add a squared feature term (still a 'linear' model in that case)"
    - "It depends on which optimizer you use to fit the weights"
  correct: 1
---

Lesson 7 gave you logistic regression: a **linear model** — it computes a weighted sum of the input
features (plus a bias) and passes it through a squashing function. Geometrically, the boundary
between "predict class 0" and "predict class 1" is always a straight line (or, in higher dimensions,
a flat plane/hyperplane). That's true no matter how you tune the weights — the *shape* of what a
linear model can draw is fixed; only its position and angle are adjustable.

**The four points.** Consider two binary input features, `x1` and `x2`, each either 0 or 1, and a
target label that's the **XOR** of them (1 if exactly one input is 1, 0 otherwise — "different
inputs → true, same inputs → false"):

| x1 | x2 | label |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

Plot these as four points on a 2D grid: (0,0) and (1,1) are label 0; (0,1) and (1,0) are label 1. The
two label-0 points sit on one diagonal, the two label-1 points sit on the *other* diagonal — they're
interleaved, not grouped into two separable clusters.

**Your task:** can any single straight line, positioned and angled however you like, put both
label-0 points on one side and both label-1 points on the other? Think about it geometrically before
picking an answer — try sketching the four points and attempting to draw a separating line.
