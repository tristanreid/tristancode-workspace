---
title: "More Data, More Params, More Compute: Which Buys What?"
description: "Doubling your compute budget feels like it should halve your loss. On a realistic scaling curve, it doesn't come close. Estimate the real number."
lesson_number: 21
track: ml
concept: "Scaling intuitions: what more data, parameters, and compute each buy — and where each runs out"
stage: 6
layout: puzzle
role: puzzle
answer_type: estimate
builds_on: [1, 3]
skin: chalkboard
estimate:
  prompt: "Using loss(C) = 10 / sqrt(C), how much compute C would you need to bring the loss down from 1.0 (at C = 100) to 0.5? Give a point estimate plus a 90% interval."
  answer: 400
  unit: "units of compute (same units as C = 100)"
---

**Quick retrieval, before the main puzzle** (lesson 1's idea, a new setting): a colleague says
"sorting a list with quicksort is the algorithm learning to sort." In one line, why doesn't this
count as learning-as-function-fitting? Hold your answer; the solution confirms it.

Now the main event. Training a model well takes three resources: **data** (how many examples), the
**model's own parameters** (its capacity — lesson 3's dial), and **compute** (how much arithmetic
you can afford to spend training it). It's tempting to treat all three as interchangeable — "just
scale it up" — but they buy genuinely different things, and none of them is free of the diminishing
returns lesson 3 already introduced.

- **More data** shrinks the noisy, sample-specific part of what a model learns — the same variance-
  reduction idea behind averaging several trees (lesson 10), applied to a single model seeing more
  examples of the underlying pattern. It cannot fix a model whose function *family* is too simple to
  represent the true relationship at all — more data makes a straight line's fit to a true cubic
  curve more *precisely* wrong, not less wrong.
- **More parameters** raises the ceiling on what the model's function family can represent. Whether
  that ceiling gets *used well* depends on having enough data (and the right training procedure) to
  pin down all those extra weights — lesson 3's U-curve is exactly the risk of raising capacity
  without raising data to match.
- **More compute** is the resource that lets you buy more of the other two: train a bigger model,
  train on more data, or just train longer. The real question compute answers isn't "more or less,"
  it's "spent on what."

**The empirical fact worth calibrating your intuition against:** loss doesn't fall linearly with
compute. It falls on a curve with steeply diminishing returns — doubling compute buys a real but
much-less-than-double improvement. The toy curve below is illustrative, not a real published result,
but its *shape* (a power law, not a straight line) is the genuinely observed pattern:

> `loss(C) = 10 / sqrt(C)`

Check it against what you're given: at `C = 100`, `loss = 10 / sqrt(100) = 10 / 10 = 1.0`. ✓.

**Your task.** Using this curve, estimate how much compute `C` you'd need to bring the loss down
from 1.0 to **0.5** — half the loss. Give a point estimate and a 90% interval you're confident
contains the true answer, *before* solving the equation exactly.
