---
title: "Solution: More Data, More Params, More Compute: Which Buys What?"
description: "C = 400 — a 4x compute spend to halve the loss, not 2x. Square-root-shaped returns are the real shape; linear intuition underestimates the cost badly."
lesson_number: 21
track: ml
concept: "Scaling intuitions: what more data, parameters, and compute each buy — and where each runs out"
stage: 6
layout: solution
role: solution
builds_on: [1, 3]
skin: chalkboard
resources:
  - title: "Google's ML Crash Course"
    url: https://developers.google.com/machine-learning/crash-course
    note: "practical grounding for the data/parameters/compute tradeoffs discussed here"
---

**Retrieval check.** Quicksort's behavior is *specified by a programmer*, directly, as exact logic
— there's no function family being scored by a loss and searched over examples; the same algorithm
sorts correctly with zero training data. Learning-as-function-fitting specifically requires that the
function's behavior was *induced from data*, which quicksort's never is, no matter how it's
implemented.

**Main answer: C = 400.** Solve `10 / sqrt(C) = 0.5` → `sqrt(C) = 20` → `C = 400`. Going from
loss 1.0 to loss 0.5 — cutting the loss exactly in half — took **4x** the compute, not 2x.

**Why the intuition trap is so common.** Under a `1/sqrt(C)` curve, halving the loss always requires
*quadrupling* compute, and the pattern gets steadily worse from there: the *next* halving, from 0.5
to 0.25, needs another 4x on top of that (`C = 1,600`), and the one after that needs another 4x
(`C = 6,400`) — the absolute compute cost of each successive halving keeps growing, even though the
loss keeps falling by the same relative amount. "Twice the compute, half the loss" is a *linear*
intuition; the real curve is a **power law**, and power laws with an exponent less than 1 (here,
`loss ∝ C^-0.5`) always produce this diminishing-returns shape — every fixed percentage improvement
gets more expensive than the last, forever, never free, never flat.

**Why this is worth estimating rather than memorizing.** Real training curves aren't exactly
`10/sqrt(C)` — the exponent and constants depend on the model family, the data, the task — but the
*qualitative* shape (steep early gains, brutally diminishing later ones, no point where the curve
goes flat and "you're done") shows up again and again in practice. Calibrating your gut sense of
"how much more compute would a meaningfully better model cost" against a curve like this, rather
than against a "twice the spend, twice the improvement" mental model, is the actual skill — which is
why this was an estimate question, not a lookup.

**Data, parameters, and compute, tied back together.** Compute is the budget; data and parameters
are the two things you spend it on, and the right split between them shifts with how much compute
you have. A small compute budget spent on a huge model with too little data mostly buys
overfitting — lesson 3's U-curve, arriving from the parameters-without-data direction. The same
budget spent on a tiny model fed enormous data plateaus early — the model's function family runs out
of room to represent anything more, no matter how much more data it sees. Getting the most out of a
fixed compute budget means balancing model size against data size, not maximizing either one alone —
which is the actual content behind "scaling laws" as a research topic, beyond the single curve this
lesson used to build intuition.

**Two cross-track echoes.** If you've done the bayes track: a posterior's standard deviation
shrinks roughly as `1 / sqrt(n)` with more data — the identical square-root-shaped, ever-diminishing
return this lesson's compute curve has, just applied to certainty about a parameter instead of loss
about a prediction. And from last lesson: compute is worth more spent on additional parallel *work*
than on lengthening an already-short *span* — a transformer's short span means more compute mostly
buys wider parallelism or a bigger model, not a faster critical path, since the critical path was
already short.

**Where this goes:** Stage 6 closes here. Stage 7 turns from "how big should this be" to "how do you
know when the whole approach is wrong" — starting with when a simple linear model quietly beats a
much larger one.
