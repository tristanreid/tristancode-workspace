---
title: "The Model Didn't Change. The World Did."
description: "A churn model's validation metric from 2019 is frozen forever. What actually happened to it, live, after customer behavior shifted underneath it?"
lesson_number: 17
track: ml
concept: "Distribution shift: the model meets a world that moved"
stage: 3
layout: puzzle
role: puzzle
answer_type: estimate
builds_on: [13, 14]
skin: chalkboard
estimate:
  prompt: "What was the model's live accuracy in 2024, after years of unmonitored deployment through a major shift in customer behavior?"
  answer: 0.61
  unit: "accuracy (0–1)"
---

Lessons 13–16 covered ways an evaluation can lie to you *at the moment you run it*: leakage,
imbalance, miscalibration. **Distribution shift** is different — it's a way a perfectly honest
evaluation, done correctly, stops being true *later*, because the world it was measuring has moved.

**The setup.** A churn-prediction model was trained and validated in 2019. Careful team — no
leakage, a proper held-out test set, the works. It scored **82% accuracy** on that 2019 test set,
and that number is permanently, mathematically correct: it describes exactly how the model performed
on exactly that data. Nothing that happens later can retroactively change it.

The model then went into production and was **never retrained**. Between 2019 and 2024: subscription
bundling changed how customers signed up and canceled, a competitor's pricing shift changed who
churned and why, and the company's own product added features that changed usage patterns entirely.
The model's most predictive feature back in 2019 — "days since last login" — meant something
different by 2024, because a new mobile app changed what a "login" even looked like.

**The trap to notice first:** if you only ever look at the model's *original* validation report, you
will see "82% accuracy" forever — that number never updates itself, never flags that anything is
wrong, and nothing about the deployed model's *code* changed either. The gap between what the report
says and what's actually happening in production is invisible unless someone goes and checks live
outcomes against live predictions.

**Your task.** Estimate the model's actual live accuracy in 2024, after five years of drift, with no
retraining and no monitoring in place. Give a point estimate plus a 90% interval you're confident
contains the true value.
