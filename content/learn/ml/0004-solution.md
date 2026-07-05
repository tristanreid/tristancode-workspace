---
title: "Solution: The Dumbest Model in the Room"
description: "1.6 — and that number is just the variance, which is why 'beat the baseline' and 'explain the variance' turn out to be the same demand."
lesson_number: 4
track: ml
concept: "Baselines"
stage: 0
layout: solution
role: solution
builds_on: [2]
skin: chalkboard
resources:
  - title: "MLU-Explain — Linear Regression"
    url: https://mlu-explain.github.io/linear-regression/
    note: "MSE and the mean-baseline connection, visualized"
---

**MSE = 1.6.**

Mean of {2, 4, 4, 4, 6} = 20/5 = **4**. Squared errors: (2−4)²=4, (4−4)²=0, (4−4)²=0, (4−4)²=0,
(6−4)²=4. Sum = 8. Average over 5 examples: **8/5 = 1.6**.

Notice what that number actually *is*: the average squared deviation from the mean — which is
just the textbook definition of **variance**. The predict-the-mean baseline's MSE is always
exactly the target's variance, by construction, for any dataset. That's not a coincidence worth
memorizing so much as a fact worth *using*: it means "how much better does my model do than the
mean baseline" and "what fraction of the target's variance does my model explain" are the same
question asked two ways — which is exactly what R² measures (1 − model's MSE / baseline's MSE),
a metric you'll meet properly once linear regression is on the table.

**Why baselines are the unglamorous hero of the field:**

1. **They're a floor, not a target.** A model beating the mean-baseline by a hair isn't
   "state of the art minus a bit" — it might be capturing almost nothing. The *size* of the gap
   between model and baseline is the real signal, not the model's raw score in isolation.
2. **The right baseline takes real thought.** "Predict the mean" is trivial to compute but
   surprisingly easy to beat if there's any structure at all; "predict yesterday" for a time
   series is trivial to compute and *shockingly* hard to beat, because most of what looks like
   "the model learned to forecast" is often just the series' own slow-moving autocorrelation,
   which the persistence baseline captures for free. Comparing a fancy forecasting model against
   the mean instead of against yesterday is one of the most common ways forecasting results get
   overstated in practice.
3. **A model that barely beats its baseline may still not be worth deploying.** Complexity,
   latency, and maintenance cost are real; "beats predict-yesterday by 2%" has to be weighed
   against those costs, not treated as automatic proof the complexity was worth it.

**Where this goes:** every baseline here ignored the input features entirely. Stage 1 opens with
the simplest model that actually *uses* them — linear regression — and the first question about
it is exactly this lesson's question, asked one level up: what do the fitted coefficients mean,
and what do they not mean?
