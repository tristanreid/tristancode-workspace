---
title: "Solution: What a 95% Interval Actually Promises"
description: "Option 1 is correct — and it's exactly the sentence people wrongly attach to confidence intervals, which can't actually support it."
lesson_number: 22
track: bayes
concept: "Credible intervals vs confidence intervals"
stage: 4
layout: solution
role: solution
builds_on: [12]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive posterior + interval visualization"
---

**Option 1 is correct.** "There's a 95% probability that `p` lies between 0.61 and 0.74, given your
prior and the data" is *exactly* what a Bayesian credible interval claims — because a posterior
distribution literally *is* your (updated) probability distribution over `p`, and the credible
interval is just the range covering 95% of it. The probability statement is about `p` directly,
conditioned on what you believed going in and what you observed. That's the whole point of treating
probability as degree of belief (Lesson 1) — it lets a sentence like this mean something.

**Why option 2 is wrong here — but is the *correct* reading of the other kind of interval.**
Option 2 describes a frequentist confidence interval: a claim about a repeated *procedure*, not
about this specific realized range or this specific parameter. It's not wrong in general — it's the
textbook-correct interpretation of a confidence interval. It's wrong here specifically because you
didn't build a confidence interval; you built a credible interval, which supports the stronger,
more directly useful claim in option 1. This is the trap: swap the two intervals' interpretations and
you get a subtly, persistently wrong sentence that *sounds* almost identical to the correct one — 95%
of misused statistics in the wild are exactly this substitution, made silently.

**Why option 3 is wrong.** That's describing a *predictive* interval (Lesson 17's territory) — a
range for a single new *observation*, not for the underlying parameter `p`. Different question
entirely; a credible interval for `p` says nothing directly about where any one future data point
will land (though the two are related — the predictive distribution is built *from* the posterior
over `p`).

**Why option 4 is wrong.** The interval says nothing about your confidence in the prior itself —
it's a downstream consequence of the prior plus the data, not a report card on the prior's quality.
(Checking whether a prior was reasonable is a separate exercise — model checking, sensitivity
analysis — not something the credible interval tells you on its own.)

**The one-sentence rule to keep:** a credible interval is a probability statement about the
*parameter*, conditional on your model; a confidence interval is a coverage statement about the
*procedure*, averaged over hypothetical repetitions. If you ever catch yourself wanting to say "95%
probability the true value is in here," make sure you actually built a credible interval — because
that sentence, applied to a confidence interval, is the single most common statistical
misinterpretation in applied work.

**Where this goes:** the last stop before Stage 5's computation tools is turning a posterior into an
actual *decision* — not just a summary number or interval, but a choice about what to do, weighing
what you stand to gain or lose.
