---
title: "Solution: It Has More Parameters Than Data Points. Why Doesn't It Just Memorize?"
description: "SGD's noisy path implicitly biases toward flat, simple minima — a form of regularization that doesn't show up anywhere in a naive parameter count."
lesson_number: 20
track: ml
concept: "Why training works anyway: SGD, overparameterization, early stopping"
stage: 4
layout: solution
role: solution
builds_on: [3, 6, 19]
skin: chalkboard
resources:
  - title: "distill.pub — Loss landscapes and generalization"
    url: https://distill.pub/
    note: "visual, research-grounded treatments of loss surfaces and why flat minima generalize"
---

**Option 2.** The best-supported explanation isn't that the extra parameters are unused (option 1 —
easy to believe, but not what's actually observed; the extra capacity does get used, just not the
way naive capacity-counting predicts) or that hardware quietly fixes it (option 3, not a real
mechanism) or that the phenomenon is a myth (option 4 — it's real and well-documented). It's that
**how** you search a huge parameter space matters as much as how big that space is.

**The mechanism, in outline.** Lesson 6 described gradient descent as "rolling downhill" on a loss
surface. In an overparameterized network, that surface has *many* points where training loss is
essentially zero — many different weight settings that all fit the training data perfectly. Some of
those zero-training-loss settings correspond to **sharp minima**: narrow, jagged dips in the loss
landscape that fit the training data's exact quirks, including its noise. Others correspond to
**flat minima**: broad, gently-curved basins where nearby weight settings *also* score about as well
— which tends to mean the fit is capturing something more like the general pattern in the data,
robust to small perturbations, rather than memorizing specific noisy points. Plain SGD, because it
takes noisy steps (small random batches each time, not the full dataset's exact gradient), tends to
get bounced out of narrow sharp minima and settle more often in broad flat ones — an *implicit bias*
toward the simpler-behaving solution, baked into the optimization procedure itself, not stated
anywhere in the model's parameter count.

**Why "capacity-counting" alone misses this.** Lesson 3's classical picture treats "how much can this
model fit" as the only variable that matters — count the parameters, predict the overfitting. That
picture implicitly assumes you search the whole space of fits uniformly at random. SGD doesn't
search uniformly — its trajectory through weight-space is itself a source of regularization, on top
of (or sometimes instead of) whatever explicit regularization (Lesson 8) you add. This is why the
field talks about **implicit regularization**: SGD, the optimizer, is quietly doing some of the work
that penalty terms and cross-validation were classically supposed to handle alone.

**Early stopping fits the same story.** Stopping training before the loss fully bottoms out is
another way generalization gets protected in practice — the network hasn't yet wandered into the
sharpest, most overfit corners of the loss surface, even if it eventually would given enough steps.
It's a cheap, practical regularizer that works for the same underlying reason: the *path* through
parameter space, not just the destination, shapes what the model actually learns.

**The honest caveat.** This is genuinely still an active research area — "why overparameterized
networks generalize" doesn't have one settled, complete theory the way the U-shaped bias-variance
curve does for simpler models. The flat-minima story is the leading, well-evidenced intuition, not a
closed case.

**Where this goes:** Stage 4 closes here — perceptron, depth, backprop, and why training actually
works, in that order. Stage 5 turns from *how networks fit functions* to *how those functions
represent meaning* — starting with embeddings: what it means for things to become vectors, and what
distance between them is supposed to represent.
