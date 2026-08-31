---
title: "Backpropagation, By Hand, on the Smallest Possible Network"
description: "One input, one hidden unit, one output. Compute the gradient of the loss with respect to the first-layer weight, chaining derivatives the way backprop does."
lesson_number: 19
track: ml
concept: "Backpropagation: the chain rule, organized well"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [6, 18]
skin: chalkboard
numeric:
  question: "What is d(loss)/d(w1), rounded to three decimal places?"
  answer: 0.115
  tolerance: 0.005
---

Lesson 18 showed why depth matters — composing a hidden layer with an output layer buys you bent
decision boundaries a single linear model can't draw. **Backpropagation** is the algorithm that
makes composed layers *trainable*: it computes how much each weight, at every layer, should change
to reduce the loss — by applying the chain rule systematically, once, and reusing intermediate
results rather than recomputing them from scratch for every weight.

**The smallest possible network.** One input `x`, one hidden unit with a sigmoid activation, one
linear output unit, one target value to match:

```
x = 1
w1 = 0.5, b1 = 0                  →  z1 = w1·x + b1 = 0.5
h  = sigmoid(z1) = 1/(1+e^-0.5) ≈ 0.6225     (the hidden unit's output)
w2 = 2                            →  y_hat = w2 · h ≈ 1.245   (the network's prediction)
y  = 1                            (the true target)
loss = 0.5 · (y_hat − y)²  ≈ 0.030            (squared error, halved for a clean derivative)
```

**The chain-rule pieces you need** (this IS backpropagation — each one is a small, local derivative,
and you multiply them along the path from the loss back to `w1`):

```
d(loss)/d(y_hat) = (y_hat − y)                    ["how wrong is the prediction, and which way"]
d(y_hat)/d(h)    = w2                             ["how much does h move y_hat"]
d(h)/d(z1)       = h · (1 − h)                    ["sigmoid's own derivative, in terms of its output"]
d(z1)/d(w1)      = x                              ["how much does w1 move z1"]
```

**Your task:** chain these four local derivatives together to compute `d(loss)/d(w1)` — the amount
the loss would change per unit change in `w1`. This single number is exactly what an optimizer (like
gradient descent, from Lesson 6) would use to update `w1`. Round your answer to three decimal places.
