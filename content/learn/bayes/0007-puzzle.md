---
title: "The Test Is 99% Accurate. You're Probably Fine."
description: "Base-rate neglect: when the condition is rare, even an excellent test's positives are mostly false."
lesson_number: 7
track: bayes
concept: "Base rates"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [6]
skin: chalkboard
numeric:
  question: "P(has the condition | tested positive), as a decimal."
  answer: 0.047
  tolerance: 0.005
---

The single most consequential Bayes computation there is. Physicians get this wrong. Courts get
it wrong. See if your intuition survives contact with the arithmetic.

A screening test for a rare condition:

- The condition affects **1 in 1,000** people: P(condition) = 0.001. (This is the **base rate** —
  the prior, before any test.)
- If you **have** the condition, the test comes back positive **99%** of the time
  (P(positive | condition) = 0.99 — the test's *sensitivity*).
- If you **don't** have it, the test still comes back positive **2%** of the time
  (P(positive | no condition) = 0.02 — the *false-positive rate*).

A randomly screened person tests positive. **What's the probability they actually have the
condition?**

Before computing: write down your gut answer. Most people — including, in repeated studies, most
doctors given exactly this problem — say something near 99%, reasoning "the test is 99% accurate."
Hold that gut number; you'll want to compare.

Then do it the honest way (lesson 6): take a concrete population — **100,000 people** works
cleanly — and count. How many have the condition, and how many of those test positive? How many
*don't* have it, and how many of *those* test positive anyway? A positive result puts you in the
combined pool; the question is what fraction of that pool is actually sick.
