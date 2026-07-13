---
title: "Solution: The Answer Sheet That Must Sum to One"
description: "P(3) = 0.4 — and why a pmf is really a whole population of hypotheses being tracked at once, not just one."
lesson_number: 12
track: bayes
concept: "Distributions as answer sheets (pmf)"
stage: 2
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "Seeing Theory — Chapter 1: Basic Probability"
    url: https://seeingtheory.brown.edu/basic-probability/index.html
    note: "interactive pmf/pdf visualizations, including the exact 'sum to one' constraint"
---

**P(3) = 1 − 0.1 − 0.3 − 0.2 = 0.4.**

The die's true face-3 rate is the most plausible single value on the whole sheet — more plausible
than any other individual face, though still short of "certain" (0.4, not 1.0).

**Why this is a bigger idea than it looks.** Every earlier lesson in this track secretly used a
two-row version of exactly this table: "has disease" plausibility and "doesn't have disease"
plausibility, always summing to 1 (prior odds and posterior odds were just a different way of
writing that same pair of numbers as a ratio instead of two summands). A pmf generalizes that same
"answer sheet" idea from **two** rows to **however many rows the question has** — four die faces
here; in a few lessons, every possible underlying success-rate from 0% to 100% for a coin.

**The reframe worth sitting with:** a distribution isn't a description of *one* hypothesis with a
confidence attached — it's tracking a whole *population* of mutually exclusive hypotheses
simultaneously, each with its own plausibility, all of them adding up to one certainty pooled
across all of them. "The rate is probably around 30%, but I'm not ruling out 25% or 35%" isn't a
vague hedge — it's an actual, precise answer sheet with a number written next to every candidate
rate. That's the object Stage 2 is going to build tools to update from data.

**Where this goes:** next lesson asks the natural follow-up — given some observed data (say, a
coin flipped a few times), which values on an answer sheet like this one does that data actually
favor? That's the **likelihood**, the second ingredient (alongside the prior) in every Bayesian
update you've done so far, now made explicit as its own object.
