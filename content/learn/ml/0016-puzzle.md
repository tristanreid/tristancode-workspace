---
title: "When '90% Confident' Means 70% Right"
description: "A churn model's 0.9-score bucket should churn 90% of the time if it's calibrated. Check whether it actually does."
lesson_number: 16
track: ml
concept: "Calibration: when a stated probability matches the observed rate"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [15]
skin: chalkboard
numeric:
  question: "What is the empirical churn rate in this bucket, as a percentage rounded to the nearest whole number?"
  answer: 70
  tolerance: 1
  unit: "%"
---

A classifier doesn't have to output just "yes" or "no" — most output a **score** between 0 and 1
meant to be read as a probability: "this customer has a 0.9 probability of churning." A model is
**calibrated** if that number is honest: among all the times it says "0.9", the thing it's
predicting should actually happen about 90% of the time. Say "0.9" a thousand times and be right
600 of them, and the model isn't just imprecise — its stated confidence is a lie, even if its
*ranking* of who's riskier is fine.

You check calibration by binning: gather every prediction that fell in a score range, and see how
often the outcome was positive.

A churn model gives out scores for 10,000 customers this quarter. You pull every customer whose
score landed in the **[0.85, 0.95) bucket** — the model effectively saying "about 90% chance this
one churns." There are **300 customers** in that bucket. By quarter's end, **210 of them** actually
churned.

If the model were perfectly calibrated in this bucket, close to 90% of these 300 customers should
have churned. Compute the *actual* observed churn rate in this bucket, as a percentage rounded to
the nearest whole number, and compare it to what "0.9" promised.
