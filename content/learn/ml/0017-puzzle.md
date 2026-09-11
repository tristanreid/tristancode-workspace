---
title: "Same Detector, Rarer Fraud: Precision Collapses"
description: "Recall barely moves when fraud gets rarer. Precision doesn't survive at all — compute the new number, then read the mechanism as a Bayes update."
lesson_number: 17
track: ml
concept: "Class imbalance: precision depends on prevalence, recall doesn't"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [4, 15]
skin: chalkboard
numeric:
  question: "What is the detector's precision at the lower-prevalence deployment, as a percentage to one decimal place?"
  answer: 13.9
  tolerance: 0.2
  unit: "%"
---

**Quick retrieval, before the main puzzle** (lesson 4's idea, a new setting): a hospital's
readmission model is scored against 800 patients discharged this week. Historically, 12% of
discharged patients get readmitted within 30 days. What accuracy does the "always predict no
readmission" baseline get here, to the nearest whole percent? Hold that number; the solution
confirms it.

Now the main event. Lesson 15 defined **precision** (of everything the model flagged positive,
what fraction really was) and **recall** (of everything truly positive, what fraction got
flagged) — `precision = TP/(TP+FP)`, `recall = TP/(TP+FN)` — and showed that accuracy is
misleading when positives are rare. A natural next question: once you've measured precision and
recall on one dataset, do they travel with the model to a new deployment where the positive class
is rarer or more common?

A fraud detector has two properties that are genuinely fixed, baked into its threshold and
weights: it catches **80% of real fraud** (its **true positive rate**, TPR = recall) and it
wrongly flags **5% of legitimate transactions** (its **false positive rate**, FPR = FP / all
actual negatives). These two numbers describe how the model behaves *per class* — they don't know
or care how common fraud is in the traffic you point it at.

**Deployment 1 — 10% prevalence** (a testing environment seeded with unusually heavy fraud, or a
high-risk merchant segment), 20,000 transactions, 2,000 of them genuine fraud:

- True positives = 80% of 2,000 = 1,600. False negatives = 400.
- Legitimate transactions = 18,000. False positives = 5% of 18,000 = 900. True negatives = 17,100.
- Precision = 1,600 / (1,600 + 900) = 1,600 / 2,500 = **64%**. Recall = 1,600 / 2,000 = **80%**
  (matches TPR exactly, as it should).

**Deployment 2 — same detector, unchanged TPR and FPR, rolled out to general traffic at 1%
prevalence**, same 20,000 transactions, now only 200 are genuine fraud, 19,800 are legitimate.

**Your task:** a colleague argues "precision and recall are both just rates — they don't depend on
prevalence, so precision is still 64%." Work out deployment 2's actual precision, as a percentage
to one decimal place, and see whether that claim survives contact with the arithmetic.
