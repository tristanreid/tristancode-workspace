---
title: "The Dumbest Model in the Room"
description: "Before any model can claim credit, it has to beat a baseline that does no learning at all. Compute one and see how high the bar already sits."
lesson_number: 4
track: ml
concept: "Baselines"
stage: 0
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [2]
skin: chalkboard
numeric:
  question: "Mean-squared error of the predict-the-mean baseline on these 5 values?"
  answer: 1.6
  tolerance: 0.05
---

Lesson 2's memorizer scored 70% test accuracy — respectable-sounding, until you noticed
always-guessing-the-majority-class scored the *same* 70%. That's the pattern this lesson makes
general: before crediting any model with "learning" something, you have to know what a model that
learned *nothing* would score. That's a **baseline**.

Baselines aren't one thing — pick the one that matches the task:

- **Majority class** (lesson 2's baseline): for classification, always guess the most common
  label. Beats it by exposing base-rate accuracy for what it is.
- **Predict the mean**: for regression, always guess the training average, ignoring every
  feature. If a model with features can't beat "just guess the average," the features are
  buying nothing.
- **"Predict yesterday"** (a persistence baseline): for a time series, guess that tomorrow equals
  today. Absurdly simple, and shockingly hard to beat for slow-moving series like temperature or
  many financial series — a huge fraction of published forecasting "improvements" quietly lose to
  this when checked honestly.

Take the **predict-the-mean** baseline for a regression problem with five training targets:
**2, 4, 4, 4, 6**.

The baseline always predicts the mean of these values, for every input, ignoring all features.
**Mean-squared error (MSE)** is the average of (actual − predicted)² across the examples.

Compute the baseline's MSE on these five training values.
