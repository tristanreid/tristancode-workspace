---
title: "Choosing a Starting Answer Sheet"
description: "A prior is just an answer sheet before any data — uniform, informative, or somewhere between. What does 'letting the data speak' actually mean, mechanically?"
lesson_number: 14
track: bayes
concept: "Priors: uniform, informative, and letting the data speak"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [12, 13]
skin: chalkboard
mcq:
  question: "You're estimating the click-through rate p of a brand-new button. Two options for a prior over p:\n\nPrior A: uniform over [0, 1] — every rate from 0% to 100% equally plausible.\nPrior B: concentrated tightly around p = 0.02 — based on 500 past buttons on this site, CTRs almost always land between 1% and 3%.\n\nAfter observing just 3 clicks out of 100 views (raw rate = 3%), which prior will move the posterior *furthest* from the raw 3% data rate, and why?"
  options:
    - "Prior A (uniform) — it has no data to anchor to, so it swings wildly toward extremes"
    - "Prior B (informative) — with only 100 views, it takes real force to overcome 500 buttons' worth of prior evidence packed into that tight prior, so the posterior stays pulled toward ~2%"
    - "Neither — with any prior, 100 data points always dominate and the posterior lands at ~3% regardless"
    - "They move it equally far, since both are valid probability distributions over the same range"
  correct: 1
---

Lesson 13 built the **likelihood**: for a fixed candidate rate p, how probable was the data you
saw. But a likelihood alone isn't a posterior — Bayes' theorem (Lesson 6) needs a **prior**: your
answer-sheet-of-plausibility over every candidate p *before* any data arrives. Multiply prior ×
likelihood, point by point across every candidate p, and (after rescaling so it sums to 1) you get
the posterior.

**Terms (standalone):**

- **Prior**: a distribution over the unknown quantity (here, the true rate p) representing what you
  believe *before* seeing the data at hand. It's still an answer sheet in the Lesson 12 sense — a
  plausibility value for every candidate p — just built from whatever you knew beforehand instead
  of from today's data.
- **Uniform prior**: every candidate value gets equal plausibility. Often called an "uninformative"
  or "flat" prior — it encodes "I have no reason to favor any rate over any other," not "I believe
  the rate is around 50%." (A common beginner trap: uniform over [0,1] does *not* mean "I expect
  p ≈ 0.5" — it means every value from 0.001 to 0.999 starts out equally plausible.)
- **Informative prior**: concentrates plausibility on a narrower range, based on real prior
  knowledge — past data, domain expertise, physical constraints. The tighter and better-justified
  the prior, the more evidence it takes to move the posterior away from it.
- **"Letting the data speak"**: the folk phrase for using a weak/uniform prior so the posterior is
  driven almost entirely by the likelihood (the data) rather than by prior belief. It's a *choice*,
  not a neutral default — choosing "no prior information" is itself an assumption, and it's wrong
  exactly when you actually *do* have relevant prior information you're discarding.

### The puzzle (MCQ above)

Think about *why* an informative prior resists being moved: it isn't magic, it's math. A prior
built from real data behaves, in the posterior-updating math you'll formalize next lesson, almost
as if it were itself a batch of "prior observations." A prior distilled from 500 past buttons acts
roughly like having already seen hundreds of data points before today's 100 views even happened —
so today's 100 views, however real, are outvoted by the weight already baked into the prior.

---

### Part 2 — When is "letting the data speak" (uniform prior) the right call?

Name a concrete situation where you'd genuinely want a uniform, uninformative prior over some
unknown rate or quantity — where using an informative prior instead would actually be a mistake,
not just a simplification.

---

### Part 3 — When is an informative prior clearly correct, not just convenient?

Now name a situation (real or realistic) where ignoring strong prior knowledge — insisting on
"let the data speak" with only a handful of new observations — would produce a genuinely bad,
overconfident, or silly-looking estimate. What's the general rule for when prior knowledge should
dominate vs. defer to new data?

---

### Part 4 — MCQ: what happens as data accumulates?

Suppose you keep collecting more views on that button — 100, then 1,000, then 100,000. What happens
to the *gap* between the posterior under Prior A (uniform) and the posterior under Prior B
(informative, centered at 2%), as the sample size grows?

(a) The gap stays exactly the same size no matter how much data arrives — priors are permanent.
(b) The gap shrinks toward zero — with enough data, the likelihood eventually overwhelms any finite
    prior, and the two posteriors converge to (nearly) the same place.
(c) The gap grows — more data makes priors matter more, not less.
(d) The gap becomes undefined because posteriors are only valid for small sample sizes.
