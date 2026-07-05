---
title: "Rolling Downhill, Too Fast"
description: "Gradient descent is just rolling downhill on the loss surface — trace three steps by hand and catch the exact moment the step size ruins everything."
lesson_number: 6
track: ml
concept: "Loss surfaces & gradient descent"
stage: 1
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [5]
skin: chalkboard
mcq:
  question: "What do the values w₀=0, w₁=9, w₂=−9, w₃=27 tell you about η=1.5 here?"
  options:
    - "Gradient descent is converging nicely toward the minimum at w=3"
    - "The step size is oscillating with growing magnitude — the learning rate is too large, and the algorithm is diverging"
    - "w has reached a saddle point and gradient descent has stalled"
    - "The algorithm has already converged and should be stopped"
  correct: 1
---

Lesson 5 fit a linear model by "minimizing squared error" without saying how the minimizing
weights get *found*. For most models (anything past simple algebra), the answer is **gradient
descent**.

Picture the **loss surface**: plot the loss (how wrong the model is) against its weight(s). For a
single weight `w`, that's a curve; a classic one is a smooth bowl, like `L(w) = (w − 3)²` — its
minimum sits at w = 3, where the loss is zero. Gradient descent finds that minimum without ever
"seeing" the whole bowl: it computes the **gradient** (the slope, dL/dw) at the current point, and
steps in the *opposite* direction — downhill — by an amount controlled by the **learning rate η**:

> w_new = w_old − η · (dL/dw)

For `L(w) = (w − 3)²`, the derivative is `dL/dw = 2(w − 3)`. Starting at **w₀ = 0** with
**η = 1.5**, trace it by hand:

- w₁ = 0 − 1.5 × 2×(0 − 3) = 0 − 1.5×(−6) = **9**
- w₂ = 9 − 1.5 × 2×(9 − 3) = 9 − 1.5×12 = 9 − 18 = **−9**
- w₃ = −9 − 1.5 × 2×(−9 − 3) = −9 − 1.5×(−24) = −9 + 36 = **27**

The true minimum is at w = 3. These values are **0, 9, −9, 27** — swinging further from 3 every
step, not closer. What does this trace tell you about the learning rate?
