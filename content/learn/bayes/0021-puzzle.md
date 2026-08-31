---
title: "One Number From a Whole Distribution"
description: "Mean, median, and mode all summarize a posterior — but they minimize different penalties for being wrong. Pick the one that matches how you're actually scored."
lesson_number: 21
track: bayes
concept: "Point estimates are loss-function choices"
stage: 4
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [12]
skin: chalkboard
mcq:
  question: "Your bonus is docked in exact proportion to |guess − actual days|, no matter which direction you're off. Which single point estimate from the posterior minimizes your expected penalty?"
  options:
    - "The mean (8 days)"
    - "The median (6 days)"
    - "The mode (4 days)"
    - "It doesn't matter — all three give the same expected penalty"
  correct: 1
---

A posterior is a whole distribution — every value gets a plausibility. But often you're forced to
report just *one* number: "how many days until this bug is fixed?", not "here's a distribution over
days." Three standard candidates:

- **Mean**: the probability-weighted average. Sensitive to a long tail — a few very-late outcomes
  pull it upward even if most outcomes are quick.
- **Median**: the 50th percentile — the value such that half the posterior's probability lies below
  it, half above. Ignores *how far* the tail extends, only *how much* probability is out there.
- **Mode**: the single most plausible value — the peak of the distribution. Ignores everything about
  the shape except where the peak sits.

These aren't three ways of approximating the "same" right answer — **each one is the number that
minimizes a different penalty (loss function) for being wrong**, and they can genuinely disagree,
especially on a skewed distribution.

**Your posterior** for "days until this bug is fixed" is right-skewed (most fixes are quick, but a
long tail of nasty ones drags upward): **mean = 8 days, median = 6 days, mode = 4 days.**

**The rule connecting loss to estimate** (you don't need to prove it, just use it):
- If you're penalized by **squared error** — `(guess − actual)²` — the mean minimizes your expected
  penalty.
- If you're penalized by **absolute error** — `|guess − actual|` — the median minimizes it.
- If you only get credit for guessing the **exact right value** (0/1 loss — right or nothing) — the
  mode minimizes it.

Given your bonus structure above (linear penalty, proportional to absolute distance, symmetric in
both directions), which point estimate should you report?
