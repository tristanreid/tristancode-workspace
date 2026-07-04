---
title: "Solution: Guess the Function"
description: "The family/loss/search trinity, why the family choice is where assumptions hide, and the question that haunts the whole enterprise."
lesson_number: 1
track: ml
concept: "Learning as function fitting"
stage: 0
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "R2D3 — A Visual Introduction to Machine Learning, Part 1"
    url: http://www.r2d3.us/visual-intro-to-machine-learning-part-1/
    note: "the most beautiful ten minutes you can spend on this topic"
  - title: "MLU-Explain — Linear Regression"
    url: https://mlu-explain.github.io/linear-regression/
    note: "family/loss/search made concrete on the simplest family"
---

**B — quicksort.** The other three share the same skeleton: a family of candidate functions
(lines, trees, whatever the modeler chose), historical examples with known answers, a loss to
score candidates, and a search for a low-loss member. Quicksort has none of that. Its behavior
was fully specified by a programmer; it consults no examples; there's no space of candidate
sorts being searched and no loss ranking them. It *is* a function — but nobody *fit* it.
The dividing line isn't sophistication or code volume; it's **where the behavior came from:
induced from data, or authored by hand.**

Why carve the frame this way? Because each of the three choices is a place where projects
quietly succeed or fail:

- **The family embeds your assumptions** — this has a name, *inductive bias*. Choosing straight
  lines asserts "the world is roughly linear here." Choosing trees asserts "thresholds and
  interactions matter." There is no assumption-free choice, and no free lunch: a family flexible
  enough to represent anything has, as we'll see brutally soon, its own failure mode.
- **The loss defines "good," so the wrong loss trains toward the wrong goal.** Squared error
  cares about big misses; misclassification rate treats all errors as equal even when one kind
  costs 100× the other. Much later, this reappears at civilizational scale as Goodhart's law —
  the metric standing in for the goal. The seed is planted here.
- **Search is never perfect** — and for interesting families (neural nets), the found member is
  merely *a* decent one, not *the* best one. That gap between "what the family could express"
  and "what search actually finds" explains a surprising amount of deep learning's behavior.

**The pitfall this frame exposes:** "the model learned the data" is not an achievement. A lookup
table achieves zero loss on every example it has seen — family: all lookup tables; search:
memorize. Obviously worthless, but *why*, exactly? The loss said perfect. The frame as stated
has a hole in it: we scored functions on the examples we already have, but we wanted a function
that works on examples we *don't*.

**Where this goes:** that hole is the entire subject of the next lesson — the train/test split,
the one piece of experimental discipline that separates machine learning from wishful curve
fitting.
