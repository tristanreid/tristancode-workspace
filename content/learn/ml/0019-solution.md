---
title: "Solution: Building the Calibration Curve From Scratch"
description: "37.5 percentage points of overconfidence in the top bin — and the bin-then-average recipe you just did by hand is exactly the reduce that scales to billions of pairs."
lesson_number: 19
track: ml
concept: "Calibration: building the curve by hand from raw (score, label) pairs"
stage: 3
layout: solution
role: solution
builds_on: [10, 16]
skin: chalkboard
resources:
  - title: "scikit-learn — Probability calibration"
    url: https://scikit-learn.org/stable/modules/calibration.html
    note: "the same binning idea, plus Platt scaling and isotonic regression as fixes"
---

**Retrieval check.** `Var(average of 9) = 81 / 9 = 9`. Averaging independent estimators shrinks
variance by a factor of `n` — same fact, smaller number, new setting.

**Main answer: 37.5 percentage points, overconfident.** Sorting the 12 pairs:

- **Bin 1** `[0, 0.4)`: scores 0.10, 0.20, 0.20, 0.30 → mean score 0.20. Labels 0, 0, 1, 0 → mean
  0.25. Gap = 0.20 − 0.25 = **−5pp** (mildly *under*confident).
- **Bin 2** `[0.4, 0.7)`: scores 0.40, 0.50, 0.50, 0.60 → mean score 0.50. Labels 1, 0, 1, 0 → mean
  0.50. Gap = **0pp** — this bin is honest: when it says "about 0.5," customers churn about half
  the time.
- **Bin 3** `[0.7, 1.0]`: scores 0.80, 0.85, 0.90, 0.95 → mean score = 3.50 / 4 = **0.875**. Labels
  1, 0, 1, 0 → mean = 2/4 = **0.50**. Gap = 0.875 − 0.50 = **0.375 → 37.5pp overconfident.**

**Reading it.** In bin 3, the model is effectively saying "I'm about 87–88% sure" on every one of
these four customers, and it was right half the time. That's not a rounding error — it's a
systematic miscalibration specifically at the high-confidence end, exactly where a business is most
likely to act on the number without double-checking it (auto-approving the highest-risk-flagged
accounts for a retention call, say). Bin 2, by contrast, is well-calibrated even though its
predictions are less confident — calibration and confidence are independent axes, and a model can
be badly wrong in exactly the range where it sounds most sure of itself.

**Why this is the same recipe as lesson 16, run one level down.** Lesson 16 gave you a bucket's
final tallies (300 customers, 210 churned) — someone had already done steps 1 and 2 below. Here you
did all three:

1. **Bin** every row by its score (a `groupBy` on a bucketed score column, in Spark terms).
2. **Accumulate**, per bin, a running `(sum of scores, sum of labels, count)` — for bin 3:
   `(3.50, 2, 4)`.
3. **Finalize**: divide each sum by the count to get the bin's mean predicted score and mean actual
   rate, then subtract.

**Why this scales to billions of pairs without changing the recipe.** Step 2's accumulator —
`(sum of scores, sum of labels, count)` — combines with another partial accumulator by simple
elementwise addition: `(s1,l1,c1) + (s2,l2,c2) = (s1+s2, l1+l2, c1+c2)`. That combine step is
**associative** (grouping doesn't matter) and **commutative** (order doesn't matter), which is
exactly what lets a distributed engine split 10 billion `(score, label)` pairs across thousands of
partitions, accumulate each partition's per-bin totals independently, and combine the partial
results in any order — or as a tree, combining pairs of partial results in parallel — and still get
the identical final answer as doing it in one pass. The by-hand version you just did on 12 rows and
the Spark `reduceByKey` version on 10 billion are the *same computation*, differing only in how many
partial accumulators get combined and in what order.

**Where this goes:** evaluation discipline — leakage, imbalance, calibration — is the full toolkit
for trusting a model's own self-report. The lessons ahead turn from checking a model honestly to a
different question: how the training and inference of these models actually gets *computed*, and why
some of that computation parallelizes beautifully while some of it fundamentally can't.
