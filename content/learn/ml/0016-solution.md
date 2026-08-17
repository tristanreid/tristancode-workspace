---
title: "Solution: When '90% Confident' Means 70% Right"
description: "210/300 = 70%, not 90%. The model's 0.9 bucket is overconfident — a calibration failure, separate from whether its rankings are useful."
lesson_number: 16
track: ml
concept: "Calibration: when a stated probability matches the observed rate"
stage: 3
layout: solution
role: solution
builds_on: [15]
skin: chalkboard
resources:
  - title: "Google's ML Crash Course — Prediction Bias / Calibration"
    url: https://developers.google.com/machine-learning/crash-course/logistic-regression/model-from-scratch
    note: "worked treatment of calibrated probabilities in logistic models"
---

**210 / 300 = 70%.** The model told these 300 customers "about a 90% chance you churn." Only 70%
did. In the [0.85, 0.95) bucket, the model is **overconfident** — its stated probabilities run
systematically higher than reality.

Notice this is a different failure than last lesson's. Recall and precision ask whether the
model's *decisions* (flag / don't flag) are good, at some threshold. Calibration asks a stricter
question of the *number itself*: is "0.9" telling the truth? A model can rank customers perfectly —
put every eventual churner above every eventual stayer — and still be badly calibrated, because
ranking only needs relative order, while calibration needs the absolute number to mean what it
says. The two failures are independent, which is exactly why calibration needs its own check: good
recall doesn't buy you honest probabilities, and vice versa.

**Where miscalibration comes from.** Some model families are well-behaved out of the box (logistic
regression, fit properly, tends to be close); others systematically distort scores. Tree ensembles
and boosted models in particular tend to push scores toward the extremes — very confident 0.9s and
0.1s — because their outputs are built from votes or additive corrections, not from a probability
model of the data. The fix isn't retraining from scratch: methods like **Platt scaling** (fit a
logistic curve mapping raw scores to calibrated ones) or **isotonic regression** (fit a
monotonic step function doing the same) recalibrate an already-trained model's outputs using a
held-out slice of data, cheaply, after the fact.

**Why this is the bridge to the bayes track.** A calibrated probability is exactly what the bayes
track's `estimate` puzzles have been training you to produce by hand: a stated confidence that
should cash out at the rate you claimed, over the long run — "if I say 90%, I should be right about
9 times in 10." A model's score bucket and a person's 90% interval are being held to the identical
standard here. The bayes track's calibration log (are your 90% intervals actually hit ~90% of the
time?) *is* this same binning check, just run on a person's stated beliefs instead of a model's
output column — same audit, same fix (adjust the mapping from "stated confidence" to "actual rate"
until they agree), different subject.

**Where this goes:** evaluation discipline — leakage, imbalance, now calibration — has been
building toward one habit: don't trust a number a model reports about itself until you've checked
what produced it against what actually happened. The next lessons turn to distribution shift, the
last member of this family: a model that was honest on its test set meeting a world that has since
moved.
