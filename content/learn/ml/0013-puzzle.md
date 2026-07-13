---
title: "One Split Isn't Enough to Trust"
description: "A single train/test split gives one estimate of how a model generalizes. Cross-validation gives several — and shuffling the wrong way quietly ruins them all the same way."
lesson_number: 13
track: ml
concept: "Cross-validation: what it estimates, and how to leak through it"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [2]
skin: chalkboard
mcq:
  question: "A model predicts next month's sales from a time-ordered dataset. The pipeline uses standard random k-fold cross-validation, shuffling rows before splitting into folds. What's the problem?"
  options:
    - "There is no problem; k-fold cross-validation is always safe regardless of data structure"
    - "Random shuffling lets some folds train on data from *after* the point in time the validation fold is testing on, letting the model implicitly use future information it would never have in real deployment"
    - "K-fold cross-validation always requires exactly 10 folds, and using a different number invalidates the result"
    - "Cross-validation is strictly worse than a single train/test split and should never be used"
  correct: 1
---

Lesson 2 introduced the train/test split: hold out data the model never sees during training, then
score it there, to expose memorization masquerading as skill. That's one estimate, from one
particular split. **K-fold cross-validation** asks for several: split the data into k roughly equal
folds, and run k rounds where each fold takes a turn as the held-out test set while the model
trains on the rest — producing k separate error estimates instead of one, whose average (and
spread) is a far more stable read on how the model generalizes than any single split could give.

More folds used for validation, not just one, means less of the estimate depends on which
particular slice happened to become "the" test set — a real improvement over lesson 2's single
split, especially on smaller datasets where one unlucky split can badly mislead.

But cross-validation inherits, and can *amplify*, the same core risk lesson 2 first raised: the test
fold has to represent data the model genuinely wouldn't have access to at prediction time. Standard
k-fold **shuffles rows randomly** before splitting into folds — a fine default for i.i.d. data
(each row independent of row order), but not for every kind of dataset.

A model predicts **next month's sales** from a dataset **ordered in time**. The pipeline runs
standard k-fold, shuffling rows first. What breaks?
