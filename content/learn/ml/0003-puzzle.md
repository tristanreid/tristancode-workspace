---
title: "The Too-Flexible Curve"
description: "Turn the capacity dial on a polynomial fit and predict what happens to the error you actually care about."
lesson_number: 3
track: ml
concept: "Overfitting"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1, 2]
skin: chalkboard
mcq:
  question: "As the degree goes 1 → 3 → 9, what does TEST error do?"
  options:
    - "Decreases, tracking train error — more flexibility means a better model"
    - "Falls from degree 1 to 3, then rises sharply by degree 9 — a U-shape"
    - "Stays roughly flat — test data is unaffected by model choice"
    - "Rises monotonically — simpler is always better on unseen data"
  correct: 1
---

You have **10 data points**: hours-of-load on the x-axis, response-time on the y. The true
underlying relationship is a smooth gentle curve — roughly cubic — but each measurement carries
random noise (network jitter, GC pauses), so the points scatter around that hidden curve.

You fit polynomials of increasing **degree** — the capacity dial from last lesson, now with
numbers on it:

- **Degree 1** (a straight line, 2 parameters): too stiff for a curve. It misses real bend.
- **Degree 3** (4 parameters): the same shape as the truth, as it happens.
- **Degree 9** (10 parameters): with 10 parameters and 10 points, the fitted curve can — and
  will — pass through **every point exactly**.

**Training error** behaves the boring, predictable way: it can only go down as degree rises
(a bigger family contains the smaller one, so its best member is at least as good). By degree 9
it hits zero — last lesson's memorizer, reborn as algebra.

The question is what happens to **test error** — the error on fresh points from the same noisy
process — as the degree climbs 1 → 3 → 9.

Before answering, picture what the degree-9 curve must *do* to thread all 10 scattered points:
the wild swings between them, the vertical takeoffs past the data's edges. It fit the points.
What did it fit, exactly? The points were signal *plus noise* — and the noise in the next batch
will be freshly rolled.
