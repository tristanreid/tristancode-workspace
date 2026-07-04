---
title: "Solution: The Too-Flexible Curve"
description: "The U-curve: underfit, sweet spot, overfit — the tension every ML method ever invented is trying to manage."
lesson_number: 3
track: ml
concept: "Overfitting"
stage: 0
layout: solution
role: solution
builds_on: [1, 2]
skin: chalkboard
resources:
  - title: "R2D3 — A Visual Introduction to Machine Learning, Part 2: Bias and Variance"
    url: http://www.r2d3.us/visual-intro-to-machine-learning-part-2/
    note: "this exact tradeoff, gorgeously animated"
  - title: "MLU-Explain — Double Descent"
    url: https://mlu-explain.github.io/double-descent/
    note: "the modern epilogue: how very deep nets bend the U's ending"
---

**The U-shape: falls from degree 1 to 3, then rises sharply by degree 9.**

Walk the dial:

- **Degree 1 — underfitting.** The line can't express the true bend, so it's wrong on train *and*
  test in the same systematic way. Errors from rigidity: the family doesn't contain the truth.
- **Degree 3 — the sweet spot.** Enough capacity for the real curve, little to spare for
  nonsense. Test error bottoms out here.
- **Degree 9 — overfitting.** The curve threads every point by contorting between them. But the
  points were *signal + noise*, and with the signal needing only 4 parameters, the other 6 had
  nothing left to fit **but the noise** — this batch's particular jitter, faithfully immortalized
  in wild oscillations. Fresh test points carry freshly rolled noise, the memorized jitter
  becomes pure error, and test error blows up. Train error zero, test error terrible: lesson 2's
  memorizer, met on a smooth continuum.

The vocabulary that formalizes the two failure directions — worth installing now, used for the
rest of the track: **bias** (systematic error from too-rigid a family; degree 1's disease) and
**variance** (error from the fit swinging with each batch's noise; degree 9's disease — refit it
on ten new points and you'd get a *completely different* wiggle). Capacity trades one for the
other; the U is their sum.

Two more things this picture explains:

1. **Why the cure isn't "always use less capacity."** The dial's best setting depends on how much
   data disciplines the fit: 10 points can't constrain 10 parameters, but 10,000 points would
   pin that degree-9 polynomial to the true cubic with change to spare. More data moves the U's
   bottom rightward — which is why "get more data" outperforms cleverness so often, and why
   stage 1 introduces gentler tools than capping capacity (regularization: keep the big family,
   *penalize* the contortions).
2. **Where the U shows up operationally:** train longer / add features / add depth and watch
   validation error — the same U, traced in different coordinates. "Validation error started
   rising" is the U's right arm announcing itself, and early stopping is just parking near the
   bottom.

**Pitfall / modern epilogue:** the U is the right *default* intuition, but it isn't the whole
modern story — massively overparameterized networks can sail past the classical overfitting peak
and come back *down* ("double descent," the second resource). The classical picture isn't wrong —
it's what happens in the regime where most tabular, small-data work (i.e., most work) lives.

**Where this goes:** you now hold the frame (fit = family/loss/search), the honest measurement
(held-out error), and the central tension (capacity vs data). Next: the humble baselines every
model must beat — and how often they don't get beaten.
