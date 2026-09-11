---
title: "Building the Calibration Curve From Scratch"
description: "Lesson 16 handed you a pre-counted bucket. This time you build the bins yourself from raw (score, label) pairs — and the top bin is badly overconfident."
lesson_number: 19
track: ml
concept: "Calibration: building the curve by hand from raw (score, label) pairs"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [10, 16]
skin: chalkboard
numeric:
  question: "For the highest-score bin, what is (mean predicted score − mean actual churn rate), in percentage points?"
  answer: 37.5
  tolerance: 0.5
  unit: "pp"
---

**Quick retrieval, before the main puzzle** (lesson 10's idea, new numbers): you average 9
independent tree predictions, each with variance 81 (same squared units). Using
`Var(average of n independent estimators) = σ²/n`, what's the variance of the 9-tree average? Hold
your answer; the solution confirms it.

Now the main event. Lesson 16 handed you a **bucket** — 300 customers, all scored roughly "0.9,"
210 of them actually churned — and asked you to compute the gap. That bucket didn't come from
nowhere: someone had to take a spreadsheet of individual `(score, label)` pairs, decide on bin
edges, and group every row into the bin its score falls in. This lesson has you do exactly that
step yourself, on a smaller scale, so the process isn't a black box next time you meet 10 billion
of these pairs instead of 12.

**The raw data.** A churn model scores 12 customers this month. `label = 1` means the customer
churned; `0` means they didn't.

| score | label | score | label | score | label |
|---|---|---|---|---|---|
| 0.10 | 0 | 0.40 | 1 | 0.80 | 1 |
| 0.20 | 0 | 0.50 | 0 | 0.85 | 0 |
| 0.20 | 1 | 0.50 | 1 | 0.90 | 1 |
| 0.30 | 0 | 0.60 | 0 | 0.95 | 0 |

**The bins.** Group every pair into one of three ranges by its score: **Bin 1** `[0, 0.4)`,
**Bin 2** `[0.4, 0.7)`, **Bin 3** `[0.7, 1.0]`. Within a bin, a **calibration curve** point is two
numbers: the **mean predicted score** (average the score column) and the **mean actual outcome**
(average the label column — since labels are 0/1, this is exactly the fraction that churned). A
perfectly calibrated bin has those two numbers equal: if the model says "about 0.85" on average, and
this bin's customers churned 85% of the time, the model was honest here.

**Your task.** Sort all 12 pairs into their three bins. For **Bin 3** (the highest-score bin),
compute the mean predicted score and the mean actual churn rate, then report the gap
(predicted − actual) in percentage points. A positive number means overconfident; a negative number
means underconfident.
