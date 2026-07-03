---
title: "Chaining Plausibilities"
description: "The multiplication rule: build the probability of a compound event by walking a path and multiplying as you go."
lesson_number: 3
track: bayes
concept: "Multiplication rule"
stage: 0
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [2]
skin: chalkboard
numeric:
  question: "P(config-related AND detected within 10 minutes), as a decimal."
  answer: 0.24
  tolerance: 0.005
---

Last lesson's definition of conditional probability — P(A | B) = P(A and B) / P(B) — rearranges
into the workhorse of all probabilistic reasoning, the **multiplication rule**:

    P(A and B) = P(A | B) · P(B)

Read it as a path: to reach the world where both A and B hold, first B has to happen (that costs
P(B)), then A has to happen *in the world where B already did* (that costs P(A | B), the
conditional — output depends on what you've already walked through).

Your incident history says:

- **30%** of production incidents are config-related.
- **When an incident is config-related**, it's detected within 10 minutes of the triggering deploy
  **80%** of the time (config errors tend to blow up fast).
- Across *all* incidents, only 50% are detected within 10 minutes.

**Compute the probability that the next incident is both config-related and detected within 10
minutes.**

One deliberate wrinkle: you were given three numbers, and one of them is a decoy for this
particular question. Part of using the multiplication rule is picking the factorization that
matches the information you actually have — you know P(fast | config), not P(config | fast), so
chain in the direction your data supports.
