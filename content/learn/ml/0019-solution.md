---
title: "Solution: Backpropagation, By Hand, on the Smallest Possible Network"
description: "≈0.115 — four local derivatives, multiplied along the path from loss back to w1. That chain, computed once and reused, is the entire algorithm."
lesson_number: 19
track: ml
concept: "Backpropagation: the chain rule, organized well"
stage: 4
layout: solution
role: solution
builds_on: [6, 18]
skin: chalkboard
resources:
  - title: "3Blue1Brown — Backpropagation calculus"
    url: https://www.3blue1brown.com/lessons/backpropagation-calculus
    note: "the same chain-rule walkthrough, animated, on a slightly bigger network"
---

**Exact answer: ≈ 0.115.**

```
d(loss)/d(y_hat) = y_hat − y = 1.245 − 1 = 0.245
d(y_hat)/d(h)    = w2 = 2
d(h)/d(z1)       = h·(1−h) = 0.6225 × 0.3775 ≈ 0.2350
d(z1)/d(w1)      = x = 1

d(loss)/d(w1) = 0.245 × 2 × 0.2350 × 1 ≈ 0.115
```

**What just happened, and why it's called "back"-propagation.** You started at the loss (how wrong
the prediction was) and worked *backward* through the network — output layer first, hidden layer
second — multiplying local derivatives as you went. Each factor answers one small, local question
("if this one quantity nudges up slightly, how much does the *next* one nudge?"), and the chain rule
says multiplying them together tells you how a nudge at the very start (`w1`) ultimately affects the
very end (the loss), even though `w1` influences the loss only indirectly, through `z1`, then `h`,
then `y_hat`.

**The "organized well" part — why this isn't just calculus homework.** Notice `d(loss)/d(y_hat)` and
`d(y_hat)/d(h)` are needed for *every* weight in the network, not just `w1` — they don't change if
you're instead computing `d(loss)/d(w2)` or the gradient with respect to `b1`. Backpropagation's real
contribution isn't "apply the chain rule" (that's just calculus) — it's *computing each shared
intermediate derivative exactly once, in one backward sweep, and reusing it* for every weight that
needs it, instead of redoing the whole chain from scratch per weight. For a network with millions of
weights across dozens of layers, that reuse is the difference between "trains in hours" and
"computationally impossible" — the same chain-rule algebra, just organized so no work is repeated.

**The pattern generalizes.** Add a second hidden layer, and you'd insert one more `d(h2)/d(h1)` link
in the chain before it reaches `w1` — same idea, longer chain, still just multiplication of local
derivatives, still computed once per layer and reused. This is exactly why depth (Lesson 18) is
trainable at all: however many layers you compose, backpropagation walks the chain once, backward,
and every weight gets its gradient.

**Where this goes:** you now have the mechanism (backprop computes gradients) and the reason it's
needed (depth, from Lesson 18). Next lesson asks the question that puzzled the field for years: given
that a heavily overparameterized network — one with far more weights than training examples — should,
by classical intuition, overfit catastrophically, why does training it with plain SGD so often work
fine anyway?
