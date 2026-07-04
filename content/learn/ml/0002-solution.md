---
title: "Solution: The Exam You've Already Seen"
description: "70% — exactly the base rate. Perfect training scores plus baseline test scores means nothing was learned."
lesson_number: 2
track: ml
concept: "Train/test split"
stage: 0
layout: solution
role: solution
builds_on: [1]
skin: chalkboard
resources:
  - title: "MLU-Explain — The Importance of Data Splitting"
    url: https://mlu-explain.github.io/train-test-validation/
    note: "train/test/validation, visualized"
  - title: "An Introduction to Statistical Learning (free PDF), Ch. 2"
    url: https://www.statlearning.com/
    note: "the assessing-model-accuracy section formalizes today's arithmetic"
---

**0.7 — exactly the majority-class base rate.** Every test input is unseen, so the lookup table's
encyclopedic knowledge contributes *nothing*; each test row gets the fallback guess "A", which is
right 70% of the time. All that perfect recall bought precisely zero points over the dumbest
possible strategy.

The two numbers side by side are the lesson:

- **Train accuracy: 100%** — an exam where the model had the answer key.
- **Test accuracy: 70%** — the same exam with fresh questions. This is the only number that
  predicts deployment.

Their difference, the **generalization gap** (here a chasm: 30 points), measures how much of the
training performance was *memory* rather than *pattern*. The held-out split works for one simple
reason: since the model provably received no information about those rows, whatever it scores on
them can only have come from structure that carries over — i.e., from actual learning. It is the
cheapest honest experiment in the field, and skipping or contaminating it is how confident
nonsense ships to production.

Three things worth engraving:

1. **Train error is not evidence.** For any reasonably flexible family (lesson 1's lookup table
   is the limiting case), low train error is *guaranteed*, and a guaranteed outcome carries no
   information. Only held-out performance discriminates learning from memorization.
2. **The base rate is the floor, and you must know where the floor is.** "70% accurate" sounded
   respectable until you noticed always-say-A scores the same. Every evaluation needs its dumb
   baseline stated alongside it — a habit the bayes track would call *remembering the prior*, and
   which gets a full lesson soon (baselines are embarrassingly hard to beat).
3. **The split's honesty is fragile.** The whole argument rested on "no information about the
   test rows reached the model." Real pipelines violate this in sneaky ways — normalizing with
   statistics computed over *all* rows, deduplicating after splitting, tuning hyperparameters
   against the test set until it stops being held-out. The violations have a name, **leakage**,
   and an entire lesson in stage 3; it is the most expensive bug class in applied ML precisely
   because it makes the honest number quietly dishonest.

**Where this goes:** the memorizer is one end of a dial — maximum flexibility, zero
generalization. Next lesson turns that dial continuously (polynomial degree) and watches the
test error trace the most important curve in machine learning: down, and then treacherously
back up.
