---
title: "Solution: Two Systems, Same Accuracy, One Useless"
description: "Recall = 70%. Accuracy called both systems near-identical; recall is what actually shows System B catches fraud and System A catches none."
lesson_number: 15
track: ml
concept: "Class imbalance: accuracy lies; precision/recall"
stage: 3
layout: solution
role: solution
builds_on: [14]
skin: chalkboard
resources:
  - title: "MLU-Explain — Precision and Recall"
    url: https://mlu-explain.github.io/precision-recall/
    note: "interactive walkthrough of the confusion matrix and PR tradeoff"
---

**Recall = 84 / (84 + 36) = 84 / 120 = 70%.**

First, the trap. System A's accuracy: it gets all 9,880 legitimate transactions right and misses
all 120 frauds, so accuracy = 9,880 / 10,000 = **98.8%**. System B's accuracy:
(84 + 9,670) / 10,000 = 9,754 / 10,000 = **97.5%**. System B — the one actually catching fraud —
scores *lower* on accuracy than the system that catches none. On an imbalanced dataset, the
majority class dominates the accuracy formula so completely that a model's behavior on the rare
class barely moves the number. This is why "our model gets 97% accuracy" is close to meaningless
as a headline on a 1%-positive problem: a model that does nothing useful can beat it.

Recall fixes this by asking a question accuracy can't: **of the fraud that actually happened, what
fraction did the model catch?** System A's recall is 0/120 = 0%, exactly as useless as it looks.
System B's recall is 84/120 = **70%** — it catches most of the fraud, which is the entire point of
having a fraud model.

Recall isn't the whole story either — System B also flagged 210 legitimate transactions
(false positives), which is its **precision** problem: `precision = TP / (TP + FP) = 84 / 294 ≈
28.6%`. Most of its "fraud" alerts are false alarms, which costs review-team time and annoys
legitimate customers. Recall and precision trade against each other — a model can always buy more
recall by flagging more aggressively, at the cost of precision, and vice versa. Plotting that
tradeoff across every possible threshold is a **precision-recall curve**, the standard way to
compare imbalanced-classification models without picking one threshold prematurely — it's usually
more informative than a single accuracy or even a single-threshold F1 number, precisely because it
shows the whole tradeoff instead of collapsing it.

**Why this matters beyond fraud:** any domain where the positive class is rare — rare disease
screening, defect detection, spam, churn among loyal customers — has this same accuracy trap.
Whenever you hear a headline accuracy number on a classification problem, the first reflex should
be "what's the base rate, and would a model that ignores the minority class score close to this
without being useful?" — the same audit this lesson just walked through.

**Where this goes:** accuracy just lied to you about which system was better; the next lesson
turns the same skepticism on a model's *confidence*, asking whether a stated "90% probability"
actually behaves like a 90% probability when checked against outcomes.
