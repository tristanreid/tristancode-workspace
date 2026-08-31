---
title: "Solution: Should You Ship It, or Wait for More Data?"
description: "EV ≈ $28,571 — positive, so shipping looks good on paper. But the posterior is still wide enough that waiting can be worth more than the wait costs."
lesson_number: 23
track: bayes
concept: "Expected-value decisions; when the posterior says don't decide yet"
stage: 4
layout: solution
role: solution
builds_on: [21, 15]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 5, Decision Analysis"
    url: https://allendowney.github.io/ThinkBayes2/chap05.html
    note: "turns posteriors into decisions with worked examples"
---

**Exact answer: ≈ $28,571.**

```
p = 9/14 ≈ 0.6429
EV(ship) = 0.6429 × 50,000 + 0.3571 × (−10,000)
         = 32,142.9 − 3,571.4
         ≈ $28,571
```

Positive, and comfortably so — on paper, shipping looks like the right call. But that number used
only the posterior's *mean*, throwing away everything the posterior knows about how uncertain you
still are. That's the same mistake Lesson 17 warned about: collapsing a whole distribution down to
one point loses information the decision might actually need.

**Why "positive EV" isn't automatically "ship it."** `Beta(9, 5)` is built from only 14 observations
— its 90% credible interval is roughly [0.42, 0.83]. That's wide. Plug the *low* end of that interval
into the same formula: `EV(ship | p=0.42) = 0.42×50,000 + 0.58×(−10,000) = 21,000 − 5,800 = $15,200` —
still positive, but notice how much it moved. Now check further down: EV crosses zero right around
`p ≈ 0.167` (`10,000 / 60,000`). Your posterior puts real probability mass below that — not a lot at
`Beta(9,5)`, but enough to matter if the downside were larger, or the upside smaller. The wider the
credible interval straddling territory where the decision would flip, the less you should trust the
single-point EV calculation.

**"Don't decide yet" is itself a decision, and it has its own expected value.** Running the A/B test
for one more week costs you something concrete — delayed rollout, maybe a fixed dollar cost of
running the experiment longer. But it also *narrows the posterior*: more data means Beta with larger
`α+β`, a tighter interval (Lesson 16's sharpening), and a lower chance of shipping (or not shipping)
based on a lucky or unlucky small sample. The real comparison isn't "EV of shipping vs. zero" — it's
"EV of shipping now vs. EV of shipping after gathering more information, net of the cost of waiting."
When a decision's EV is positive but *fragile* — built on a posterior wide enough that plausible
values of `p` would flip the sign — the value of more information can exceed the cost of getting it.
When the posterior is already tight and the decision's EV is robust across the whole credible
interval, waiting just costs you time for no benefit; ship it.

**The rule to carry forward:** compute the point-estimate EV as a first pass, then explicitly check
whether the decision would survive using the *edges* of your credible interval instead of its center.
If it would, decide. If it wouldn't, that instability is itself the signal that more data is worth
more than the delay costs.

**Where this goes:** Stage 4 closes here — you've turned posteriors into single numbers, intervals,
and now decisions. Stage 5 turns to *computation*: grid approximation, Monte Carlo, and MCMC — the
tools for when the posterior itself doesn't have the tidy closed form Stages 2–4 have been leaning
on.
