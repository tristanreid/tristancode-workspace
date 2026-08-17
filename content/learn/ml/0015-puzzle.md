---
title: "Two Systems, Same Accuracy, One Useless"
description: "A vendor's fraud model and a model that never flags anything score almost identically on accuracy. Compute the number that actually separates them."
lesson_number: 15
track: ml
concept: "Class imbalance: accuracy lies; precision/recall"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [14]
skin: chalkboard
numeric:
  question: "What is System B's recall, as a percentage rounded to the nearest whole number?"
  answer: 70
  tolerance: 1
  unit: "%"
---

A payment processor tests a fraud model on last month's 10,000 transactions, of which **120 were
confirmed fraud** — 1.2% of traffic, a realistic imbalance for this domain. **Accuracy** is
`(true positives + true negatives) / total`: the fraction of all predictions the model got right,
positive or negative.

Two systems, same 10,000 transactions:

- **System A** — the "always legitimate" baseline. It flags nothing as fraud, ever. It gets every
  one of the 9,880 legitimate transactions right, and misses all 120 frauds.
- **System B** — the vendor's model. Its confusion matrix on the same data:
  - True positives (fraud correctly flagged): **84**
  - False negatives (fraud missed): **36**
  - False positives (legitimate transactions wrongly flagged): **210**
  - True negatives (legitimate transactions correctly passed): **9,670**

Work out System A's accuracy and System B's accuracy — they land within a percentage point of each
other, both in the high 90s. Accuracy alone can't tell you System B is worth deploying and System A
is worthless; on a 1.2%-positive dataset, "predict the majority class always" is a strong-looking
baseline that catches nothing.

The number that actually matters here is **recall**: of the fraud that really happened, what
fraction did the model catch? `recall = true positives / (true positives + false negatives)`.

Compute System B's recall as a percentage, rounded to the nearest whole number.
