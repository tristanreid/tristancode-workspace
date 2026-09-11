---
title: "Don't Just Square the Mean"
description: "Predicting two future trials from a posterior isn't the same as squaring the posterior mean — uncertainty about p itself correlates the outcomes."
lesson_number: 18
track: bayes
concept: "Posterior predictive: what do you expect next?"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [13, 15]
skin: chalkboard
numeric:
  question: "Posterior Beta(4, 3). Exact probability the next TWO trials are both successes, to 3 decimal places?"
  answer: 0.357
  tolerance: 0.005
---

**First, a quick retrieval check — different concept, new setting.**

A joint probability factors two ways (Lesson 6): `P(A,B) = P(A|B)·P(B) = P(B|A)·P(A)`. A code-review
bot flags 8% of all pull requests as "risky." Among genuinely buggy PRs, the bot flags 70% of them.
Among non-buggy PRs, it flags 5%. Overall, 12% of PRs turn out to be genuinely buggy. What's
P(flagged)? Then, what's P(buggy | flagged)? Two quick multiplications and a division — Lesson 6's
derivation, applied fresh.

*(Worked out in the solution.)*

---

You've built posteriors, watched them sharpen, and measured how fast they shrink. Now a different
question: given everything your posterior currently believes about the true rate `p`, what should you
*expect* to happen on future trials?

**Terms (standalone):**

- **Posterior predictive distribution**: the probability of an *observable future outcome*, averaged
  over everything the posterior currently believes about `p` — not computed by pretending `p` is
  pinned at one value.
- **The tempting shortcut**: plug in the posterior mean as if it *were* `p`, then compute an ordinary
  probability from there. Under this shortcut, "the next two trials both succeed" gets estimated as
  `mean²`.

**Your posterior, one step past where a bare example would stop.** You start from a uniform prior,
`Beta(1, 1)`, and observe **3 successes out of 5 trials**. First derive the posterior yourself
(Lesson 15's addition-of-counts rule), then use it — this puzzle doesn't hand you the posterior
pre-built.

**Part 1 — Derive the posterior.** What `Beta(α, β)` results from `Beta(1,1)` plus 3 successes and 2
failures? What's its mean?

**Part 2 — The shortcut's answer.** Using that mean, what does "square the mean" predict for
P(next two trials both succeed)?

**Part 3 — The exact answer (the numeric answer above).** The honest calculation asks the question one
trial at a time: the first trial succeeds with probability equal to the current posterior mean; *given*
that success, the posterior itself updates (exactly like Lesson 15's rule) before you ask about the
second trial. So:

```
P(next two both succeed) = [α / (α+β)] × [(α+1) / (α+β+1)]
```

Compute this exactly for your Part-1 posterior, to 3 decimal places, and compare it to Part 2's
shortcut answer. Which one is bigger, and by roughly how much?

**Part 4 — Why the gap exists.** In one or two sentences: why does treating the two future trials as
independent (at a fixed, pinned-down `p` = the mean) systematically get this wrong? What does a
success on the first trial *do* to your belief about the second, that squaring the mean silently
assumes doesn't happen?
