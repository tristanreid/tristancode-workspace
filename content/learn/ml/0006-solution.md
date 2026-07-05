---
title: "Solution: Rolling Downhill, Too Fast"
description: "The steps grow because each overshoot is bigger than the last — and the fix, a smaller learning rate, is the whole lesson in one number."
lesson_number: 6
track: ml
concept: "Loss surfaces & gradient descent"
stage: 1
layout: solution
role: solution
builds_on: [5]
skin: chalkboard
resources:
  - title: "3Blue1Brown — Gradient descent, how neural networks learn"
    url: https://www.3blue1brown.com/lessons/gradient-descent
    note: "the rolling-downhill intuition, animated, extended to many dimensions"
  - title: "distill.pub — Why Momentum Really Works"
    url: https://distill.pub/2017/momentum/
    note: "goes further into learning-rate/curvature interactions once this lesson's intuition is solid"
---

**The learning rate is too large — gradient descent is diverging, oscillating with growing
amplitude instead of settling at the minimum.**

Trace the *distance from the true minimum (w = 3)* at each step: |0−3|=3, |9−3|=6, |−9−3|=12,
|27−3|=24 — doubling every single step. Each update doesn't just overshoot the minimum, it
overshoots by *more* than the previous distance, so the next correction is even larger, and the
process runs away to infinity. This particular loss (`L(w) = (w−3)²`) has a simple enough shape to
show exactly why: the update multiplies the current distance-from-minimum by a fixed factor,
`1 − 2η`. With η = 1.5, that factor is `1 − 3 = −2` — magnitude greater than 1, so every step
*grows* the distance (and the sign flip is the oscillation, bouncing side to side across the
minimum). Any η making that factor's magnitude less than 1 would instead shrink the distance every
step and converge; here that means **0 < η < 1**. This is the general shape of the pathology, not
a fact special to this one bowl: **too large a learning rate turns a converging search into a
diverging one**, and the boundary between them depends on the loss surface's steepness (its
curvature) — steeper bowls need smaller steps to stay stable.

**Why not just always use a tiny learning rate, then?** Because the opposite failure is real too,
just less dramatic: too small an η *does* converge, but by tiny increments — thousands of extra
steps to reach the same minimum, burning compute and wall-clock time for no better an answer. The
practical craft of training (learning-rate schedules, warmup, adaptive methods like Adam) is
almost entirely about navigating between these two failure modes: big enough to make real
progress, small enough not to blow up — automatically, since the "just right" value depends on a
loss surface's curvature that changes across training and across parameters.

**Why the other options don't fit the evidence:**

- **"Converging"** requires the distance from 3 to shrink each step; it's doing the opposite.
- **"Saddle point"** describes a flat region where the gradient is near zero, so w barely moves —
  this trace shows huge jumps, the opposite symptom.
- **"Already converged"** would mean the loss is near its minimum value; L(27) = (27−3)² = 576,
  wildly worse than where it started.

**Where this goes:** this whole lesson assumed a single continuous target (squared error, a
number). Classification needs a different output shape — a *probability* — and a loss to match.
Next: logistic regression, gradient descent's other classic customer.
