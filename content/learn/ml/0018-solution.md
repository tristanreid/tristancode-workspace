---
title: "Solution: The Line That Can't Be Drawn"
description: "No line works — XOR isn't linearly separable. Stacking two linear layers with a nonlinearity between them fixes it, which is the entire reason depth exists."
lesson_number: 18
track: ml
concept: "The perceptron → depth: composing simple functions buys expressiveness"
stage: 4
layout: solution
role: solution
builds_on: [1, 7]
skin: chalkboard
resources:
  - title: "3Blue1Brown — Neural networks, chapter 1"
    url: https://www.3blue1brown.com/lessons/neural-networks
    note: "visual intuition for what a layer of weighted sums + nonlinearity actually does"
  - title: "R2D3 — A visual introduction to machine learning"
    url: http://www.r2d3.us/visual-intro-to-machine-learning-part-1/
    note: "builds geometric intuition for decision boundaries"
---

**No — option 2.** Try it on paper: label-0 points sit at (0,0) and (1,1) — one diagonal. Label-1
points sit at (0,1) and (1,0) — the other diagonal. Any straight line divides the plane into two
half-planes. Wherever you draw it, at least one label-0 point and one label-1 point end up on the
*same* side, because the two classes are interleaved along crossing diagonals rather than clustered
into two separable regions. This isn't a fitting failure — no amount of weight-tuning fixes it. It's
a hard geometric limit: **XOR is not linearly separable**, provably, for any choice of weights.

**Why this matters historically.** This exact example (Minsky & Papert, 1969) is famous for
triggering the first "AI winter" in neural network research — a single perceptron genuinely cannot
learn XOR, full stop, and for years that looked like a fundamental ceiling on what these simple
models could ever do.

**The fix: compose two linear functions with a nonlinearity between them.** A single linear layer's
decision boundary is always straight. But feed the output of one linear layer, through a nonlinear
function (like a sigmoid or ReLU), into a *second* linear layer — and now the final decision boundary
can bend. Concretely for XOR: a hidden layer of just two units can each learn a different straight-line
cut of the input space (say, one unit fires when `x1 OR x2` is true, another fires when
`x1 AND x2` is true); the output layer then combines those two intermediate signals with one more
linear step (`(x1 OR x2) AND NOT (x1 AND x2)` is exactly XOR) — and *that* combination is linearly
separable, even though the original problem wasn't. Two straight cuts, composed, buy you a bent
boundary that one straight cut alone could never draw.

**The general principle — this is the entire reason "depth" exists in neural networks.** Composing
simple functions (linear transform → nonlinearity → linear transform → nonlinearity → ...) doesn't
just add more of the same expressive power — it buys a qualitatively different *kind* of boundary
each time you compose. A network's layers are each individually about as simple as logistic
regression; stacking them is what turns "flat cuts through space" into "arbitrarily bent regions."
This is why the field moved from perceptrons (Lesson 1's linear function family) to multi-layer
networks: not a bigger version of the same trick, a genuinely different capability class, purchased
by composition rather than by any single layer getting smarter.

**Where this goes:** next lesson asks the practical follow-up — if a network's power comes from
stacking layers, how do you actually compute how to adjust every weight in every layer to reduce the
loss? That's backpropagation: the chain rule, applied systematically through every layer you just
composed.
