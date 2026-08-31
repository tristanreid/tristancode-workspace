---
title: "What a 95% Interval Actually Promises"
description: "Two intervals that look identical on a page make completely different claims. Only one of them is a genuine probability statement about the parameter."
lesson_number: 22
track: bayes
concept: "Credible intervals vs confidence intervals"
stage: 4
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [12]
skin: chalkboard
mcq:
  question: "You compute a 95% BAYESIAN CREDIBLE interval of [0.61, 0.74] for a true conversion rate p, from your posterior. Which statement is a correct interpretation of THIS interval?"
  options:
    - "There's a 95% probability that the true value of p lies between 0.61 and 0.74, given your prior and the data you observed."
    - "If you repeated the entire data-collection process many times and built an interval the same way each time, 95% of those intervals would contain the true p."
    - "95% of individual future observations will fall between 0.61 and 0.74."
    - "You're 95% sure your prior was the right one to use."
  correct: 0
---

You'll see two kinds of "95% interval" in the wild, and they're built completely differently:

- A **Bayesian credible interval**: a range that contains 95% of the posterior's probability mass.
  It's read directly off the posterior distribution you actually computed — no repeated-sampling
  story required.
- A **frequentist confidence interval**: a range built from a *procedure* that, if you re-ran the
  whole data-collection-and-interval-construction process many times, would contain the true
  parameter 95% of the time. Crucially, this is a claim about the *procedure*, averaged over
  hypothetical repetitions — not a claim about the one interval you actually got.

They can even come out numerically identical for simple problems with uninformative priors. But
what they're *entitled to claim* is different, and this is one of the most commonly botched
interpretations in applied statistics — people say the confidence-interval sentence ("95% probability
the true value is in here") when what they built was a confidence interval, which technically
doesn't support that sentence at all (the true parameter either is or isn't in any specific realized
interval — there's no probability left once the data is in hand; the 95% describes the *long-run
procedure*, not this one outcome).

**Your posterior credible interval is [0.61, 0.74].** Because you built it as a Bayesian credible
interval — literally the range covering 95% of your posterior's probability mass — which
interpretation below is actually correct for it?
