---
title: "It Has More Parameters Than Data Points. Why Doesn't It Just Memorize?"
description: "Classical bias-variance intuition says a heavily overparameterized network should overfit catastrophically. It usually generalizes fine anyway. What's actually going on?"
lesson_number: 20
track: ml
concept: "Why training works anyway: SGD, overparameterization, early stopping"
stage: 4
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [3, 6, 19]
skin: chalkboard
mcq:
  question: "A network has far more parameters than training examples. Classical bias-variance intuition (Lesson 3) says it should overfit badly. Trained with plain SGD, it often generalizes fine anyway. Which explanation best fits what actually happens?"
  options:
    - "It doesn't really have that many effective parameters — the extra ones are just wasted and never actually get used"
    - "SGD's noisy, randomized path through parameter space tends to settle into flat, simple-shaped minima that generalize well, rather than the sharp minima that fit training noise exactly — an implicit bias toward simplicity that classical capacity-counting doesn't account for"
    - "Modern hardware corrects for it automatically during training"
    - "It doesn't actually generalize fine in practice — this is a myth from marketing, not real behavior"
  correct: 1
---

Lesson 3 established the classical picture: more model capacity relative to your data means more
room to fit noise instead of signal, and test error eventually turns upward — the U-shaped curve.
By that logic, a network with, say, a million weights trained on ten thousand examples should be
deep in overfitting territory: plenty of capacity to memorize the training set exactly, including
its noise, and generalize badly.

**What actually happens, empirically, surprisingly often:** train such a network with plain
stochastic gradient descent (Lesson 6, 19's mechanism for computing *how* to update each weight),
and test performance is frequently still good — sometimes it even keeps *improving* as you add more
parameters past the point where the model can perfectly fit the training data, which is the opposite
of what the classical U-shaped curve predicts.

This isn't a small footnote — it's one of the things that genuinely puzzled the field, and reconciling
it with classical statistical learning theory is still an active area of research. But there's a
leading explanation that fits the puzzle well enough to build real intuition from.

**Your task:** among the four explanations above, which one best matches how modern
overparameterized networks, trained with SGD, actually behave?
