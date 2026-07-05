---
title: "Averaging Away the Wobble"
description: "One overfit tree swings wildly on fresh data. Four of them, averaged, swing far less — compute exactly how much less, under an idealized assumption."
lesson_number: 10
track: ml
concept: "Bagging & random forests"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [9]
skin: chalkboard
numeric:
  question: "Variance of the 4-tree averaged prediction, in the same units²?"
  answer: 25
  tolerance: 1
---

Lesson 9 ended on a fully-grown tree: near-zero train error, poor test error — high **variance**
in lesson 3's vocabulary, meaning the fit swings a lot depending on which noisy training batch it
happened to see. Constraining depth is one fix. **Bagging** (bootstrap aggregating) is a
completely different one: don't tame any single tree — grow *many* deep, overfit, high-variance
trees, each on a random resample (with replacement) of the training data, and **average their
predictions**. A **random forest** is bagging's most common instance, with one addition (next
lesson's setup): each tree also only considers a random subset of features at every split.

Why averaging helps is a fact about variance itself: if you average **n** predictions that are
each individually noisy but **independent**, with each individual prediction having variance
**σ²**, the variance of their average is:

> Var(average of n independent estimators) = σ² / n

Averaging doesn't touch **bias** (a systematic error every tree shares gets averaged right along
with the rest — more on that in a moment) — it specifically attacks the *wobble*, the part of the
error that varies from tree to tree.

Suppose a single deep, overfit tree's predictions have variance **σ² = 100** (some squared unit of
the target) from one noisy training resample to the next, and you average **4** such trees,
**assumed independent**. What's the variance of the 4-tree averaged prediction?
