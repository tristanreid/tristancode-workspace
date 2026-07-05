---
title: "Two Tests, One Multiplication (Usually)"
description: "Chaining likelihood ratios across sequential evidence — and the assumption that makes the shortcut legal."
lesson_number: 10
track: bayes
concept: "Sequential evidence & conditional independence"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [9]
skin: chalkboard
numeric:
  question: "Posterior odds of disease after BOTH tests come back positive?"
  answer: 0.3
  tolerance: 0.02
---

Last lesson: **posterior odds = prior odds × likelihood ratio (LR)**, where the LR of a piece of
evidence E for hypothesis H is P(E | H) / P(E | ¬H) — how many times more consistent the evidence
is with H than with not-H.

A patient gets **two different tests** for a rare disease, run by two independent labs using
unrelated methods (one's a blood antibody assay, the other's a genetic marker panel):

- Base rate: the disease affects **1 in 1,000** people, so prior odds = 1/999 ≈ **0.001**.
- **Test A** comes back **positive**. Its likelihood ratio for a positive result is **LR_A = 20**.
- **Test B** — run independently, unaware of Test A's result — also comes back **positive**.
  Its likelihood ratio is **LR_B = 15**.

Because the two tests use unrelated biology, a crucial assumption holds: **conditional
independence given disease status**. That means: among people *who have the disease*, whether
Test A comes back positive tells you nothing extra about whether Test B will (its errors don't
share a cause); the same holds among people who *don't* have the disease. Each test's LR is
exactly as strong in combination as it is alone.

Under that assumption, chaining evidence is just chaining multiplications:

> posterior odds = prior odds × LR_A × LR_B

Compute the posterior odds of disease after both positives. (You can convert to a probability
with P = odds/(1+odds) to build intuition, but the answer wanted is the odds.)
