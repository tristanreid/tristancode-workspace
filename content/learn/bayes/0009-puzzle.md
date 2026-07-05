---
title: "Odds Do the Arithmetic For You"
description: "Posterior odds = prior odds × likelihood ratio — the same update as lessons 6-8, with the division already done."
lesson_number: 9
track: bayes
concept: "Odds form of Bayes' theorem"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [6, 7]
skin: chalkboard
numeric:
  question: "What are the posterior odds that the patient has the disease, given a positive test?"
  answer: 0.2
  tolerance: 0.01
  unit: "(odds, e.g. 0.1 means 1:10)"
---

Lesson 6 derived Bayes' theorem from the joint. There's a second form of it — the **odds form** —
that turns the whole update into one multiplication, no denominator required.

First, **odds** are just a different way to say a probability: if P(disease) = 0.01, the **odds**
of disease are P(disease) / P(no disease) = 0.01 / 0.99 ≈ 1:99. Odds and probability carry the
same information; odds are just "for against how many for" instead of "fraction out of the whole".

The **likelihood ratio (LR)** for a piece of evidence E is:

> LR = P(E | disease) / P(E | no disease)

— how much more likely the evidence is if the hypothesis is true, versus if it's false. And here
is the odds form of Bayes' theorem:

> **posterior odds = prior odds × likelihood ratio**

No P(E) in sight. Lesson 7's rare-disease test, rebuilt as this one multiplication:

- **Prior odds**: the disease has a 1% base rate, so prior odds = 0.01 / 0.99 ≈ **0.0101**.
- **The test**: 99% sensitivity (P(positive | disease) = 0.99) and a 5% false-positive rate
  (P(positive | no disease) = 0.05).
- **Likelihood ratio** for a positive result: LR = 0.99 / 0.05 = **19.8**.

Multiply prior odds by the likelihood ratio to get the posterior odds of disease given a positive
test. (Odds, not probability — you can convert back with P = odds / (1 + odds) if you want to
check it against lesson 7's answer, but the question only asks for the odds.)
