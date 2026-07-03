---
title: "One Table, Three Questions"
description: "Joint, marginal, and conditional probability are three ways of reading the same table of counts."
lesson_number: 2
track: bayes
concept: "Joint, marginal, conditional"
stage: 0
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: []
skin: chalkboard
numeric:
  question: "P(bug | large) — the probability a pull request introduced a bug, given that it was large. Answer as a decimal."
  answer: 0.3
  tolerance: 0.005
---

Every probability question about two things at once — a PR's size and whether it shipped a bug, a
patient's test result and their disease status — can be answered from one table of counts.

Your team audited the last **200 pull requests**, classifying each by size and by whether it later
turned out to have introduced a bug:

|            | bug | no bug | total |
|------------|----:|-------:|------:|
| **small**  |  12 |    108 |   120 |
| **large**  |  24 |     56 |    80 |
| **total**  |  36 |    164 |   200 |

Three kinds of question you can ask this table (using probability-speak for "fraction of PRs"):

- **Joint** — both things at once: P(large **and** bug) = 24/200 = 0.12.
- **Marginal** — one thing, ignoring the other: P(bug) = 36/200 = 0.18. ("Marginal" because it
  reads off the table's margins — the totals row/column.)
- **Conditional** — one thing, *within the world where* the other is true: P(bug **given** large),
  written P(bug | large). You throw away every row that isn't "large" and ask the question inside
  what's left.

Compute **P(bug | large)**. While you're in there, work out P(large | bug) too — you'll want to
notice whether it's the same number.
