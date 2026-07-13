---
title: "The Feature That Knew the Answer Already"
description: "Near-perfect accuracy on a real problem is rarely a triumph. It's usually a tell. Name the shape of this one."
lesson_number: 14
track: ml
concept: "Leakage: target, temporal, and group leakage"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [13]
skin: chalkboard
mcq:
  question: "A loan-default model includes a feature called 'account_closed_date' — populated only for accounts that have already been closed due to default. Using it, the model reaches near-perfect train and test accuracy. What kind of leakage is this?"
  options:
    - "Temporal leakage — training data drawn from a different time period than the deployment data"
    - "Group leakage — rows from the same real-world entity split across train and test"
    - "Target leakage — a feature that is only known, or only takes a meaningful value, because the outcome being predicted has already happened"
    - "No leakage — a feature this predictive is simply a very strong signal and should be used as-is"
  correct: 2
---

Last lesson's fix (splitting by time, not randomly) closes one specific leak. **Leakage** in
general is the umbrella term for any way information about the *outcome* sneaks into training that
wouldn't be available at real prediction time — and it comes in a few recognizable shapes worth
being able to name on sight, because "the model works suspiciously well" is often the only symptom
before it ships.

- **Target leakage**: a feature that is itself downstream of the outcome — it only exists, or only
  takes a meaningful value, *because* the thing being predicted already happened. Using it isn't
  predicting the future; it's reading an answer key smuggled into the questions.
- **Temporal leakage**: training data effectively includes information from *after* the point in
  time the model would actually need to make its prediction (last lesson's random-shuffle CV
  failure was one specific mechanism producing exactly this).
- **Group leakage**: rows that are correlated because they share a real-world entity (the same
  patient across multiple hospital visits, the same user across sessions) get split so that some of
  that entity's rows land in training and others in test — letting the model partly recognize the
  *entity*, not learn the general pattern, and get credit for it at test time.

A loan-default model includes **`account_closed_date`** — a field that only gets populated once an
account has already been closed due to default. Trained with it, the model scores near-perfectly on
both train and test.

Which kind of leakage is this?
