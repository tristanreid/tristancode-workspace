---
title: "Solution: The Tree That Memorized the Forest"
description: "A fully-grown tree is lesson 2's lookup table wearing if/else clothes — same failure, same fix, different function family."
lesson_number: 9
track: ml
concept: "Decision trees"
stage: 2
layout: solution
role: solution
builds_on: [2, 3]
skin: chalkboard
resources:
  - title: "MLU-Explain — Decision Trees"
    url: https://mlu-explain.github.io/decision-tree/
    note: "splitting criteria and overfitting depth, interactively"
---

**Train error near 0%, test error stuck at baseline or worse — it's lesson 2's memorizer, rebuilt
out of if/else splits.** A leaf holding exactly one training point has isolated that point from
every other; the tree's "prediction rule" for it is, in effect, "if you are exactly this training
example, predict its label" — every bit as much a lookup table as lesson 2's literal one, just
implemented as a cascade of feature comparisons instead of a hash map. A fresh test point almost
never lands in a leaf built around one specific training point's idiosyncrasies, so the tree falls
back on whatever weak generalization the shallow, shared splits near the root still capture —
often little better than the baseline. **Model capacity, not model family, drives overfitting**:
lesson 3's degree-9 polynomial and this fully-grown tree are different arithmetic wearing the same
disease, and depth is a tree's capacity dial exactly as polynomial degree was a curve's.

**Why the other options miss:**

- **"Both near 0%"** confuses "fits training data exactly" with "generalizes" — the two questions
  lesson 2 built this whole track to keep separate.
- **"Greedy splitting can't separate classes"** has it backwards: unconstrained greedy splitting
  *can* separate any training set perfectly (worst case, one point per leaf) — the failure isn't
  an inability to fit, it's fitting *too well*, to noise instead of signal.
- **"Test error keeps improving with depth"** ignores the U-curve lesson 3 established: capacity
  helps up to a point, then costs you on fresh data. Trees obey the same curve; unconstrained
  growth is deliberately walking past the bottom of the U.

**Two more failure modes worth knowing, specific to trees (not shared with lesson 3's
polynomials):**

1. **Axis-aligned cuts are a real representational limitation.** A tree can only ask "is feature
   X above/below a threshold," never "is X + Y above a threshold" — so a genuinely diagonal
   decision boundary (say, a fraud rule that really depends on the *sum* of two features) gets
   approximated by an ugly staircase of many small rectangular cuts instead of one clean split.
   Linear models (lessons 5-8) get diagonal boundaries for free and struggle with sharp
   rectangular ones; trees are the mirror image. Neither family is strictly better — they fail on
   different shapes.
2. **Greedy splitting is provably not globally optimal.** Because each split is chosen to help
   *immediately*, a tree can miss a split that looks mediocre alone but would have set up a much
   better split one level down — finding the truly best tree is computationally intractable, so
   every practical algorithm accepts "good, greedy, fast" over "optimal, exhaustive, infeasible."

**The standard fix for overfitting depth is exactly what you'd guess from lesson 3**: limit
capacity — cap max depth, require a minimum number of points per leaf, or prune branches back
after growing. But there's a second fix unique to trees, one that doesn't require picking the
"right" depth at all: build *many* imperfect, overfit trees and average their predictions. That's
next.
