---
title: "Solution: The Bedroom That Costs You Money"
description: "Coefficients answer 'holding everything else fixed' — and that's a fact about the model's inputs together, not a verdict on any one feature alone."
lesson_number: 5
track: ml
concept: "Linear regression & coefficient interpretation"
stage: 1
layout: solution
role: solution
builds_on: [1, 4]
skin: chalkboard
resources:
  - title: "MLU-Explain — Linear Regression"
    url: https://mlu-explain.github.io/linear-regression/
    note: "coefficients, residuals, and fit, visualized interactively"
---

**Holding square footage fixed, more bedrooms means smaller rooms, and smaller rooms sell for
less.** At the same 1,800 square feet, the 5-bedroom house has cramped rooms and worse flow; the
3-bedroom has spacious ones. Real buyers pay for that. The coefficient isn't reporting "bedrooms
are bad" in isolation — it's reporting what happens to price as bedroom count moves *while square
footage stays put*, which is a very different, and much narrower, question.

This is the single most important habit for reading any linear model: **a coefficient's meaning
depends on what else is in the model.** Drop square footage entirely and refit on bedrooms alone,
and the coefficient would very likely flip positive — because without square footage to hold
fixed, "more bedrooms" mostly just means "bigger house," and bigger houses cost more. Same data,
same target, different coefficient sign, because the *question being answered* changed. A
coefficient is not a fact about a feature; it's a fact about a feature *given the company it
keeps*.

Why each wrong option fails:

- **"Causes a price drop"** claims causation from a fitted correlation — the classic trap. Nothing
  about a linear fit tells you bedrooms *cause* anything; it reports an association conditional on
  the other features. (Could adding a genuine extra bedroom, without shrinking the others, ever
  lower price? Almost certainly not — but that's not the scenario the coefficient describes.)
- **"The model is broken"** assumes a sensible feature must always show the sign your intuition
  expects. A correctly fit model reports the data's actual conditional structure, which can and
  regularly does surprise you — that's often the *useful* part.
- **"Pure noise"** would be true only if the coefficient's uncertainty (a standard error, not
  covered here) swamped its value — nothing in the setup suggests that; the sign has a clean,
  legible explanation once you condition correctly.

**A related trap worth flagging now, revisited properly under "leakage" in stage 3:**
**multicollinearity** — when two features are themselves highly correlated (square footage and
bedroom count usually are), the model can struggle to tell which one "deserves" credit, and
coefficients can become unstable or swap signs with small data changes. The bedroom coefficient
here is a *legitimate* conditional effect, not an artifact — but the same negative-sign surprise
can also, in messier data, be exactly that artifact. Telling the two apart takes more than staring
at one sign; it's why stage 3 exists.

**Where this goes:** so far, fitting meant "minimize squared error" without saying *how* the
search finds the minimizing weights. Next: the loss surface those weights are searched over, and
gradient descent — rolling downhill on it — including what happens when the hill is walked with
too large a step.
