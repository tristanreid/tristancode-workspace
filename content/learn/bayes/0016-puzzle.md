---
title: "How Much Does One More Observation Move You?"
description: "The same single new data point moves a young posterior a lot and a mature one barely at all. Estimate before you compute — this is a calibration puzzle."
lesson_number: 16
track: bayes
concept: "Watching the posterior sharpen; how much one observation moves you"
stage: 2
layout: puzzle
role: puzzle
answer_type: estimate
builds_on: [11, 15]
skin: chalkboard
estimate:
  prompt: "Start from Lesson 15's posterior, Beta(9, 5) (mean ≈ 0.643, built from a Beta(2,2) prior plus 7 successes / 3 failures). You observe ONE more trial: a success. What's the new posterior mean, as a decimal?"
  answer: 0.667
  unit: ""
---

Lesson 15 gave you the mechanics: posterior = Beta(α + k, β + n−k), addition of counts. This lesson
asks you to build intuition for the *shape* of that update as data accumulates one point at a time
— specifically, how much a single new observation is capable of moving an already-updated
posterior.

**Terms (standalone):**

- **Sharpening**: as more data accumulates, a beta posterior's variance shrinks — it becomes more
  concentrated (taller, narrower) around its mean. A posterior with `α + β = 1000` is "sharper"
  (more confident, lower variance) than one with `α + β = 4`, even if both happen to have the same
  mean.
- **Diminishing sensitivity**: the more total weight (`α + β`, real + virtual trials) a posterior
  already carries, the less a *single additional* observation can move its mean. Going from 0
  trials to 1 trial can swing a mean from "unknown" to "100% or 0%." Going from 1,000 trials to
  1,001 barely moves it at all — one more data point is now a tiny fraction of the total evidence.

### Part 1 — Estimate (above): one more success on top of Beta(9, 5)

Give your best guess for the new posterior mean after adding one success to Beta(9, 5), plus a 90%
interval you're confident contains the true value. Think about it via the addition-of-counts rule
before computing exactly — the point of this puzzle is to calibrate your *intuition* for how far
one data point moves a mean that already represents 14 units of evidence.

---

### Part 2 — Same single success, on a much younger posterior

Now imagine the *same* single new success, but observed against a much weaker starting point:
**Beta(1, 1)** (the uniform prior, zero virtual trials — genuine ignorance). What's the new
posterior mean after that one success lands on Beta(1, 1)? Compute it exactly.

---

### Part 3 — Compare the two movements

- Beta(9, 5) → one success → Beta(10, 5): mean goes from 9/14 ≈ 0.643 to 10/15 ≈ ?
- Beta(1, 1) → one success → Beta(2, 1): mean goes from 1/2 = 0.5 to 2/3 ≈ ?

Compute both new means exactly, then state each *movement* (new mean − old mean). Which posterior
moved further from a single identical observation, and explain why in terms of total weight
(`α + β`) *before* the new data point arrived.

---

### Part 4 — General rule

Based on Parts 1–3, write a one-sentence rule for how much a single new observation can move a beta
posterior's mean, as a function of the posterior's total weight (`α + β`) before that observation.
(You don't need a formula — a clear qualitative statement is enough, though if you want the exact
form: the maximum possible movement from one observation is on the order of `1 / (α + β + 1)`.)
