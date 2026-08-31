---
title: "Solution: The Model Didn't Change. The World Did."
description: "≈61% live accuracy — a 21-point drop the original validation report never shows, because that report is frozen in 2019 forever."
lesson_number: 17
track: ml
concept: "Distribution shift: the model meets a world that moved"
stage: 3
layout: solution
role: solution
builds_on: [13, 14]
skin: chalkboard
resources:
  - title: "Google's ML Crash Course — Production ML systems / data drift"
    url: https://developers.google.com/machine-learning/crash-course
    note: "practical framing of monitoring for drift after deployment"
---

**A plausible true value: ≈ 61% live accuracy** — a substantial, silent drop from the 82% the model
"officially" scores, and it can plausibly get considerably worse than that if the shift is severe
enough. (There's no single universal number here — the point of an estimate puzzle is calibrating
your intuition for the *size* of the gap, not memorizing a constant. A drop of 15–25 accuracy points
after years of unmonitored drift through a genuine behavioral shift is a realistic, commonly-observed
range.)

**Why the gap opens, mechanically.** A model learns a mapping from features to outcomes *as those
features and outcomes related to each other in the training data*. "Days since last login" was
predictive in 2019 because it correlated with real disengagement back then. Once a new mobile app
changes what triggers a "login" event, that same feature value now means something different — the
statistical relationship the model memorized no longer holds, even though the model's weights are
byte-for-byte identical to what they were in 2019. This is **covariate shift** (the input
distribution moved) compounding with **concept shift** (the relationship between inputs and the
target moved) — either alone degrades a static model; together, it's worse.

**Why the original 82% number is actively misleading, not just stale.** It's not that "82%" becomes
false — it's still an accurate description of a 2019 evaluation. The danger is treating it as if it
describes *today*. A model card, dashboard, or slide deck that only ever cites the original
validation metric is implicitly claiming the world hasn't moved since — a claim nobody actually
checked. This is why "we validated it once" is a categorically different, weaker claim than "we
monitor it continuously": validation is a snapshot; drift is ongoing.

**What actually catches this.** Comparing *live* predictions against *live* outcomes on a rolling
basis — not re-running the old test set (that's also frozen in 2019), but tracking the model's
accuracy, calibration, and score distribution on new production data as it arrives, and alerting when
they diverge from what training-time validation promised. Feature-distribution monitoring (is "days
since last login" showing the same statistical shape it did in training?) catches shift even before
enough new labels have arrived to measure accuracy directly.

**Where this goes:** distribution shift closes out the evaluation-discipline arc (leakage,
imbalance, calibration, now shift) — the common thread across all four is "don't trust a number a
model reports about itself without checking it against what's actually happening." Stage 4 turns to
neural networks, where the failure modes shift from *evaluation* honesty to *what the model can
represent at all*.
