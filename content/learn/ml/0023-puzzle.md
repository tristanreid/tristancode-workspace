---
title: "The Nearest Neighbor Is Lying to You"
description: "Nearest-neighbor search is only as good as the distance it trusts. Compute one by hand on raw, unscaled features and watch it pick the obviously wrong match."
lesson_number: 23
track: ml
concept: "Nearest neighbors: uses and traps (hubness, scale, stale embeddings)"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [22]
skin: chalkboard
numeric:
  question: "Using the raw (unscaled) feature values, compute the Euclidean distance from Q to X, and separately from Q to Y. Enter the SMALLER of the two distances, rounded to the nearest whole number."
  answer: 50
  tolerance: 1
  unit: ""
---

Lesson 22 established that "close in embedding space" means close according to whatever the training
objective rewarded. Even once you've picked the right objective, a second, more mechanical trap is
waiting in how you compute "close" in the first place — and it doesn't need any machine learning at
all to demonstrate, just two features and a ruler.

**The setup.** A product catalog has each item described by two raw numbers: `reviews` (total review
count, typically in the hundreds to low thousands) and `rating` (average star rating, 1.0 to 5.0). No
scaling has been applied — these are the numbers exactly as they'd sit in a database column, fed
straight into Euclidean distance: for two points $(r_1, s_1)$ and $(r_2, s_2)$,
$\text{distance} = \sqrt{(r_1 - r_2)^2 + (s_1 - s_2)^2}$.

Three items:

| item | reviews | rating |
|---|---|---|
| **Q** (query) | 1000 | 4.8 |
| **X** (candidate) | 1050 | 2.1 |
| **Y** (candidate) | 200 | 4.7 |

X has 50 more reviews than Q, but a rating that's wildly different (2.1 vs. 4.8 — a badly-reviewed
product). Y has a rating almost identical to Q (4.7 vs. 4.8 — essentially the same quality) but 800
fewer reviews.

**Your task:** compute the raw Euclidean distance from Q to X, and from Q to Y. Whichever comes out
smaller is the one a nearest-neighbor search would return as "most similar" to Q. Enter that smaller
distance, rounded to the nearest whole number. (Before you check the solution: does the item this
distance points to actually strike you as the more similar product?)
