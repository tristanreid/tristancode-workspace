---
title: "What 4 Heads Out of 5 Actually Says"
description: "The binomial likelihood turns 'here's the data' into a number for any candidate rate you want to test."
lesson_number: 13
track: bayes
concept: "The binomial likelihood"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [12]
skin: chalkboard
numeric:
  question: "P(4 heads in 5 flips | p = 0.7), to 3 decimal places?"
  answer: 0.360
  tolerance: 0.005
---

Last lesson's answer sheet assigned plausibility to every possible value of some quantity — but
where do those numbers actually come from once real data shows up? That's the **likelihood**:
for a *fixed* candidate value of the unknown rate, how probable was the data you actually saw?

For coin-flip-shaped data (n independent flips, each landing heads with the same unknown rate
p), the likelihood of seeing exactly **k** heads out of **n** flips, *given* a candidate rate p,
is the **binomial likelihood**:

> P(k heads in n flips | p) = C(n, k) · p^k · (1−p)^(n−k)

where C(n, k) = n! / (k!(n−k)!) counts how many *orderings* of k heads among n flips exist (HHHHT,
HHHTH, … — the specific sequence doesn't matter, only the count of heads, so every ordering that
produces k heads adds to the same total probability).

You suspect a coin might be biased toward heads. You flip it **5 times** and see **4 heads**. As a
first check, evaluate the likelihood of that exact data **under the candidate p = 0.7** — i.e.,
"if the coin's true heads-rate really were 70%, how probable was seeing 4-out-of-5?"

Compute P(4 heads in 5 flips | p = 0.7).
