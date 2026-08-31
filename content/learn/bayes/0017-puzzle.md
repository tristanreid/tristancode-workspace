---
title: "What Do You Expect Next, Honestly?"
description: "Squaring the posterior mean isn't the same as predicting two future trials. The posterior predictive distribution is honest about lingering uncertainty in p."
lesson_number: 17
track: bayes
concept: "Posterior predictive: what do you expect next?"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [12, 15, 16]
skin: chalkboard
numeric:
  question: "What is the exact probability the next TWO trials are both successes, given the Beta(9, 5) posterior?"
  answer: 0.429
  tolerance: 0.005
---

Lesson 16 left you holding a posterior, **Beta(9, 5)**, mean ≈ 0.643 — your current belief about the
true success rate `p` for some process (say, a coin, or a conversion rate). A natural next question:
if you had to predict actual future data, not just describe your belief about `p`, what would you
say?

**Posterior predictive distribution**: the probability of an *observable future outcome*, averaged
over everything the posterior currently believes about `p`. It's the honest answer to "what do you
expect to see next?" — honest because it doesn't pretend `p` is known; it accounts for your
remaining uncertainty about `p` itself.

**The trap**: the tempting shortcut is to plug in a single number — the posterior mean, 0.643 — and
treat it as if it *were* `p`, then compute ordinary probabilities from there. Under that shortcut,
"both of the next two trials succeed" would be estimated as `0.643 × 0.643 ≈ 0.413`.

That shortcut is wrong, because it throws away the fact that `p` itself is still uncertain. The
honest calculation integrates over the *whole* posterior distribution for `p`, not just its mean.
For a beta posterior `Beta(a, b)`, the exact probability that the next two independent trials are
both successes is:

```
P(next two both succeed) = [ a / (a+b) ] × [ (a+1) / (a+b+1) ]
```

(This comes from asking the question one trial at a time: the first trial succeeds with probability
equal to the posterior mean `a/(a+b)`; *given* that success, the posterior itself updates to
`Beta(a+1, b)` — exactly like Lesson 15's update rule — before you ask about the second trial. You're
chaining two posterior means, not squaring one.)

**Your task:** using `a = 9`, `b = 5`, compute the exact probability that the next two trials are
both successes. Give your answer to three decimal places, and compare it to the naive
"square-the-mean" shortcut above.
