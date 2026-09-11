---
title: "Four Times the Trials, Half the Spread"
description: "A posterior's spread shrinks with more data — but not as fast as 'doubling trials quarters the variance' suggests. Check the shortcut against the real number."
lesson_number: 17
track: bayes
concept: "Posterior SD scales as 1/sqrt(n), not 1/n"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [15]
skin: chalkboard
numeric:
  question: "How many MORE trials (beyond the current 20) are needed to cut the posterior's standard deviation in half?"
  answer: 60
  tolerance: 6
  unit: "additional trials"
---

**First, a quick retrieval check — a different concept, new setting.**

A hiring test has this property: P(pass | qualified candidate) = 90%. It's not a perfect test though
— P(pass | unqualified candidate) = 25% (some unqualified people get lucky). Suppose 20% of applicants
are actually qualified (the base rate). A candidate passes. What's P(qualified | passed)? Compute it —
then compare it to the bare 90% number a recruiter might quote from memory. They're not the same
question.

*(Worked out in the solution.)*

---

Lesson 15 gave you the mechanics: `Beta(α, β)` behaves like `α` virtual successes and `β` virtual
failures. Lesson 16's colleague scenario aside, here's a different, extremely common wrong shortcut
about the *same* beta-binomial machinery — this time about how fast a posterior's uncertainty
shrinks.

**Terms (standalone):**

- **Posterior standard deviation (SD)**: how spread out the posterior distribution is — a small SD
  means you're fairly confident about the true rate `p`; a large SD means substantial remaining
  uncertainty. It's the square root of the **variance**.
- **Pseudo-count weight**: as in Lesson 15, `α + β` is the total "trial count" behind a
  `Beta(α, β)` posterior — real trials plus the prior's virtual ones. Priors don't have to be
  specified with whole-number pseudo-counts: a prior stated as "centered at 33%, with the weight of
  20 trials" means `α = 0.33 × 20 = 6.6` and `β = 0.67 × 20 = 13.4` — fractional pseudo-counts are
  completely normal once a prior is defined by a *centre* and a *weight* rather than raw counts.
- **The approximation this lesson uses**: for a beta posterior with mean `p` and total weight `n`
  (`n = α + β`), the variance is well approximated by `p(1−p) / n`. (The exact formula has an extra
  `+1` in the denominator that matters little once `n` isn't tiny; this track uses the simpler form
  throughout, same as the exact-enough convention from Lesson 15's "how much data to overturn a
  prior" estimate.)

**A colleague's shortcut.** You currently hold the posterior `Beta(6.6, 13.4)` — built from a prior
centered at `p = 0.33` with the weight of 20 trials (so `n = α + β = 20`). Your colleague says:
*"Variance has the trial count squared in the denominator, so if you want to cut the standard
deviation in half, just double the trials — 20 more should do it."*

**Part 1 — Check the shortcut directly.** Using the approximation `variance ≈ p(1−p)/n`, compute the
posterior's SD right now (at `n = 20`), and then compute what the SD would be if the trial count
merely **doubled** to `n = 40` (same posterior mean `p = 0.33` throughout, as if new data kept
arriving at the same underlying rate). Did doubling `n` actually halve the SD?

**Part 2 — Find the trial count that genuinely halves the SD.** Using the same approximation, solve
for the total trial count `n'` at which the SD is exactly half of its value at `n = 20`. (Hint:
`variance ∝ 1/n`, so `SD ∝ 1/√n` — work out what has to happen to `n` for `√n` to double.)

**Part 3 — The numeric answer above.** How many *additional* trials beyond the current 20 does that
require? That's the number to submit.
