---
title: "Solution: The Feature That Knew the Answer Already"
description: "Target leakage — the field doesn't predict default, it records that default already happened. Near-perfect accuracy was the tell, not the triumph."
lesson_number: 14
track: ml
concept: "Leakage: target, temporal, and group leakage"
stage: 3
layout: solution
role: solution
builds_on: [13]
skin: chalkboard
resources:
  - title: "Kaggle Learn — Data Leakage"
    url: https://www.kaggle.com/code/alexisbcook/data-leakage
    note: "worked examples of target and train-test contamination leakage side by side"
---

**Correct: target leakage.** `account_closed_date` isn't a predictor of default — it's a *record*
that default already occurred. Any account still current has no value there (or a placeholder); any
account that defaulted has one, by construction, because closing-for-default is what populated the
field in the first place. The model isn't forecasting the outcome from earlier evidence — it's
reading a field that's downstream of the outcome, effectively checking whether the answer key
already got written into that row.

Why not the others: nothing in the scenario describes a train/deployment time-period mismatch
(temporal leakage) or the same real-world entity split across train and test (group leakage) — the
mechanism here is specifically "a feature that only exists because the outcome already happened,"
the textbook definition of target leakage. And near-perfect accuracy is exactly the wrong reason to
trust it (option 4) — in a genuinely hard real-world prediction problem, suspiciously good
performance is a **symptom to investigate**, not a result to celebrate. If a fraud, churn, or
default model reaches 99%+ accuracy on a problem that's usually hard, the first hypothesis should be
"what did I accidentally let it see," not "we solved it."

**Why this is the leak that hurts most in practice.** Target leakage often survives the
train/test split entirely — because the leaking field is present in *both* the training data and
the historical test data (both were logged after the fact, both have `account_closed_date`
populated the same leaky way), the split lesson 2 taught catches nothing. The model looks validated
by every check you'd normally run. The failure only shows up in production, when a live application
is scored *before* any closure event exists — the leaking field is empty or meaningless at the
moment a real decision is needed, and the model's real accuracy on the actual task it exists to do
falls off a cliff, often only discovered after deployment.

**How to actually catch it, since the split won't:** ask of every feature, concretely, "would this
value be known at the exact moment a real prediction has to be made, before the outcome exists?" A
feature name containing an outcome-adjacent word (closed, resolved, cancelled, outcome, final) is a
strong prompt to check its timing explicitly, not just its predictive power. Suspiciously strong
individual features, and suspiciously strong overall accuracy, are both worth exactly this same
"could this only exist after the fact" audit, before trusting either.

**Where this goes:** leakage (this lesson), correlated-feature bookkeeping (lesson 12), and split
mechanics (lesson 13) are all versions of the same discipline — trusting a number less until you've
checked what actually produced it. Next lesson turns that same skepticism on accuracy itself, when
the classes being predicted aren't evenly balanced.
