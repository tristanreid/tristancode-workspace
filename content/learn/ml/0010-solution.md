---
title: "Solution: Averaging Away the Wobble"
description: "25 — a quarter of the wobble, for free, under independence. Real trees aren't independent, and that gap is exactly what random forests are built to close."
lesson_number: 10
track: ml
concept: "Bagging & random forests"
stage: 2
layout: solution
role: solution
builds_on: [9]
skin: chalkboard
resources:
  - title: "MLU-Explain — Random Forest"
    url: https://mlu-explain.github.io/random-forest/
    note: "bagging, feature subsampling, and the variance-reduction story, visualized"
---

**Variance = 100 / 4 = 25.** The averaged prediction wobbles only a quarter as much as any single
tree — the standard deviation (√variance) drops from 10 to 5, a factor of 2, not 4, since variance
and standard deviation scale differently; either way, a real and substantial calming of the noise,
purely from averaging, with **no change to any individual tree's overfitting**. Each tree is still
exactly as wild and memorization-prone as lesson 9 described — bagging never disciplines a single
tree the way limiting depth would. It exploits a fact about *averages of noisy things*: their
individual wobbles, if independent, partially cancel rather than compound.

**The catch, and why it matters practically: real bagged trees are not independent.** Every tree
is grown from the *same* underlying training set, just different bootstrap resamples of it — so
the trees share whatever signal (and whatever noise) is common across most resamples, and the
formula `σ²/n` is an idealized best case, not what you actually get. Two trees grown from heavily
overlapping bootstrap samples, using the same features, tend to make *correlated* errors — they
tend to be wrong about the *same* points in similar ways, because they're built from mostly the
same data with mostly the same features available at every split. Correlated errors don't cancel
in an average the way independent ones do; the real variance reduction sits somewhere between
"none" (fully correlated, no benefit) and this lesson's `σ²/n` (fully independent, full benefit).

**This is exactly the gap random forests are built to close.** Bagging alone only randomizes
*which rows* each tree sees. A random forest adds a second randomization: at *every split*, each
tree may only consider a random subset of the *features* (a common default is roughly √(total
features) candidates per split). This deliberately forces different trees to build different
structure even when they'd otherwise agree — a tree that can't consider the single most obviously
predictive feature at some split is pushed toward a different, still-useful split, decorrelating
the trees' mistakes. Less correlation between trees pushes the real-world variance reduction
closer to the idealized `σ²/n` this lesson computed — the entire justification for the "random" in
random forest is "closer to independent errors, so averaging works closer to its theoretical best."

**What averaging does *not* fix, worth flagging before it's assumed automatic:** bias. If every
tree in the forest shares the same systematic blind spot (say, none of them can ever see a feature
that was simply never collected), averaging any number of them averages that blind spot right
along with everything else — bagging is purely a variance tool, and a biased forest stays biased
no matter how large it grows.

**Where this goes:** bagging averages many *independently-grown* trees in parallel. **Boosting**,
next in this stage, builds trees *sequentially*, each one deliberately targeting the previous
ensemble's mistakes — attacking bias instead of variance, the other half of lesson 3's tradeoff.
