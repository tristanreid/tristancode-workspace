---
title: "The Update That's Just Addition"
description: "A beta prior plus a binomial likelihood gives a beta posterior — and the whole update collapses to adding counts."
lesson_number: 15
track: bayes
concept: "Beta-binomial updating: posterior = prior counts + observed counts"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [13, 14]
skin: chalkboard
numeric:
  question: "Prior: Beta(2, 2). Data: 7 successes out of 10 trials. Posterior mean of p, to 3 decimal places?"
  answer: 0.643
  tolerance: 0.005
---

Lesson 14 said an informative prior behaves "almost as if it were itself a batch of prior
observations." For one specific, extremely useful family of priors, that isn't just an analogy —
it's exactly, mechanically true.

**Terms (standalone):**

- **Beta distribution**: a distribution over values in [0, 1] — perfect for representing beliefs
  about an unknown *rate* or *probability* p. It's shaped by two parameters, written Beta(α, β).
  Read them as **pseudo-counts**: a virtual, already-observed sample of `α` successes and `β`
  failures (`α + β` virtual trials total) baked into the prior before any real data arrives.
  - Beta(1, 1) = uniform over [0, 1] — zero virtual trials, genuine ignorance (Lesson 14's uniform
    prior).
  - Beta(2, 2) — like having already seen 2 successes and 2 failures: a mild pull toward p = 0.5,
    easily overridden by a modest amount of real data.
  - Beta(50, 50) — like having already seen 100 virtual trials split evenly: a strong pull toward
    p = 0.5, needing much more real data to move.
  - The **mean** of Beta(α, β) is simply `α / (α + β)` — literally "successes out of total trials,"
    virtual or real.

- **Beta-binomial conjugacy**: if your prior over p is Beta(α, β), and you observe `k` successes in
  `n` binomial trials (Lesson 13's likelihood), the posterior over p is **exactly** another beta
  distribution: **Beta(α + k, β + (n − k))**. No integration, no approximation — the update is
  literally *addition of counts*: add the real successes to the prior's virtual successes, add the
  real failures to the prior's virtual failures. This exactness — prior and posterior both being
  beta distributions — is called **conjugacy**, and it's what makes beta-binomial the standard
  "worked by hand" example of Bayesian updating.

### Why this matches Lesson 14's intuition exactly

Recall Lesson 14: a prior built from 500 past buttons resisted being moved by 100 new views because
it behaved like a stash of prior observations. Beta-binomial conjugacy is the precise mechanism
behind that behavior: Beta(α, β)'s "weight" *is* `α + β` virtual trials, in the *same units* as real
trials. A weak prior (small α + β) is easily outweighed by a modest real sample; a strong prior
(large α + β) needs a correspondingly large real sample to move much — because the update is a
straight count-addition, and whichever side (prior counts vs. real counts) has more trials
dominates the sum.

### Part 1 — Numeric (above): compute the posterior mean

Prior: **Beta(2, 2)** (2 virtual successes, 2 virtual failures — a mild pull toward 0.5). You
observe **7 successes out of 10 trials**.

1. What's the posterior distribution, in Beta(α, β) form?
2. What's its mean?

(Recall: posterior = Beta(α + k, β + n − k); mean of Beta(α, β) = α / (α + β).)

---

### Part 2 — Compare to the raw data rate

The raw observed rate is 7/10 = 0.7. Your posterior mean should differ slightly from that. In which
direction, and why — in terms of the virtual-trials framing above?

---

### Part 3 — Same data, a much stronger prior

Now suppose the prior had instead been **Beta(20, 20)** (20 virtual successes, 20 virtual failures
— a strong pull toward 0.5) — same real data, 7 successes out of 10. Compute the new posterior mean.
How much closer to 0.5 does it land compared to Part 1's answer, and why does that match the
"weight = α + β virtual trials" framing?

---

### Part 4 — What would it take to overturn a strong prior?

With the Beta(20, 20) prior from Part 3, roughly how much real data (how many trials, at what
success rate) would you need to pull the posterior mean close to, say, 0.9? Give a rough estimate
and explain your reasoning using the addition-of-counts rule — you don't need to compute an exact
answer.
