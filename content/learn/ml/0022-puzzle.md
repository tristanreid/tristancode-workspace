---
title: "When the Simple Model Wins"
description: "A linear model and a deep network, decomposed into bias, variance, and noise. Compute both totals and see exactly why the smaller model ships."
lesson_number: 22
track: ml
concept: "Bias/variance in the wild: when a linear model beats a deep one"
stage: 7
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [3, 10, 11]
skin: chalkboard
numeric:
  question: "How much higher is the deep model's total expected error than the linear model's (deep total − linear total)?"
  answer: 16
  tolerance: 0
---

**Quick retrieval, before the main puzzle** (lesson 11's idea, new numbers): baseline `F0 = 200`
(training mean price). A weak learner is fit to the residual and predicts `h1(x) = 45` for one
point. With learning rate `η = 0.2`, what's `F1(x)`? Hold your answer; the solution confirms it.

Now the main event. Lesson 3 introduced **bias** (systematic error a model's function family can't
escape, however it's trained) and **variance** (how much the fitted model swings depending on which
noisy training sample it happened to see) as the two things trading off against each other as
capacity rises. That tradeoff has a precise decomposition: for a model's expected error on a fresh
point,

> **total expected error = bias² + variance + irreducible noise**

where **irreducible noise** is randomness in the data-generating process itself — no model, however
good, can predict it away.

**The scenario.** A tabular dataset has **300 rows** and a relationship that's mostly linear, with
some genuine but modest nonlinear structure. Two candidates are trained on it:

- **A linear model** — low capacity, so it can't chase the small nonlinear wiggles in the true
  relationship (some bias), but with only a handful of parameters to fit from 300 rows, it barely
  moves from one training sample to the next (very low variance). Decomposition on held-out data:
  **bias² = 9, variance = 1, noise = 4** (arbitrary matching squared units throughout).
- **A deep neural network** — high capacity, so it can in principle represent the nonlinear wiggles
  the linear model misses (lower bias), but 300 rows is nowhere near enough to pin down its many
  parameters reliably, so its fit swings substantially depending on which 300 rows it happened to
  train on (much higher variance). Decomposition: **bias² = 1, variance = 25, noise = 4**.

**Your task.** Compute each model's total expected error from its three components, then report how
much higher the deep model's total is than the linear model's (deep − linear). Before checking the
solution, say in one line *why* this particular dataset size and structure produces this result —
what would have to change about the data for the ranking to flip?
