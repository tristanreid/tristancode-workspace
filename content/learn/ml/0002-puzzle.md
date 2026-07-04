---
title: "The Exam You've Already Seen"
description: "Train error is an exam with the answers leaked. Compute what a perfect memorizer actually knows."
lesson_number: 2
track: ml
concept: "Train/test split"
stage: 0
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [1]
skin: chalkboard
numeric:
  question: "Expected accuracy of the memorizer on the held-out test rows, as a decimal."
  answer: 0.7
  tolerance: 0.01
---

Last lesson ended on a hole in the function-fitting frame: we score candidate functions on the
examples we have, but we need them to work on examples we don't. This lesson makes the hole
concrete — with arithmetic.

You have **10,000 labeled rows** for a binary classification problem. **70% of all rows are
class A** (and this holds in any large sample). You split off **20% as a held-out test set** —
rows the model never sees during training — and train on the remaining 8,000.

Your model is an honest-to-goodness **memorizer**: a lookup table. For any input it has seen in
training, it returns that row's training label, exactly right. Its training error is a perfect
**0%**. For any input it hasn't seen, it falls back to guessing the most common class, **A**.

Assume no test row's input exactly repeats a training row's (realistic once inputs have a few
real-valued features).

**What accuracy do you expect the memorizer to score on the 2,000 test rows?**

Then sit with the comparison for a second: on the data it was fit to, this model looks *flawless*.
The number you just computed is what it actually knows. The gap between those two numbers has a
name — the **generalization gap** — and managing it is most of applied machine learning.
