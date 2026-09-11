---
title: "Solution: Don't Just Square the Mean"
description: "0.357, not 0.327 — squaring the mean throws away the fact that a first success would itself raise your estimate of p before the second trial."
lesson_number: 18
track: bayes
concept: "Posterior predictive: what do you expect next?"
stage: 2
layout: solution
role: solution
builds_on: [13, 15]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 4, Estimating Proportions"
    url: https://allendowney.github.io/ThinkBayes2/chap04.html
    note: "works the same posterior-predictive integral by hand, free online"
---

**Retrieval check answer.** P(flagged) = 0.70×0.12 + 0.05×0.88 = 0.084 + 0.044 = 0.128.
P(buggy | flagged) = 0.084 / 0.128 = **0.656** (about 66%) — Lesson 6's two-factorizations-of-a-joint
trick, on a code-review bot instead of a spam filter.

---

**Part 1 — Beta(4, 3), mean ≈ 0.571.** `Beta(1,1)` + 3 successes, 2 failures →
`Beta(1+3, 1+2) = Beta(4, 3)`. Mean = `4 / 7 ≈ 0.5714`.

**Part 2 — Shortcut's answer: 0.327.** `(4/7)² = 16/49 ≈ 0.3265`.

**Part 3 — Exact answer: 0.357.**

```
P(both succeed) = [4/7] × [5/8] = 0.5714 × 0.625 = 0.35714... ≈ 0.357
```

`0.357` is noticeably **higher** than the shortcut's `0.327` — a real gap (about 9% relative), not
rounding noise.

**Part 4 — why the gap exists.** The shortcut pins `p` at exactly `4/7` and treats the two trials as
independent flips of that fixed-rate coin. But `p` isn't pinned — `Beta(4,3)` is a whole distribution
of plausible rates, some above `4/7`, some below. If the first trial actually succeeds, that success
is itself evidence nudging your belief about `p` upward: the posterior would update to `Beta(5,3)`,
mean `5/8 = 0.625`, a bit higher than `4/7 ≈ 0.571`. So the second trial's true probability of
success — conditional on the first succeeding — is a little better than the plain mean suggests.
Squaring the mean silently assumes the first trial teaches you nothing about the second. In reality,
because both trials depend on the *same* unknown `p`, they're **positively correlated** once you're
honest about your uncertainty: `Var(p) > 0` always pushes `E[p²]` above `(E[p])²`, and
`E[p²]` is exactly what "both trials succeed" needs.

**Seeing it as a sum, not just a formula.** The exact predictive probability is really
`E_posterior[p²] = ∫ p² · Beta(p; 4,3) dp`, computed in closed form above as `20/56 = 5/14 ≈ 0.357`.
You can approximate that same integral with a coarse discrete sum over a few candidate values of `p`,
weighted by how plausible each is under `Beta(4,3)` (density `∝ p³(1−p)²`):

| p | relative weight (p³(1−p)²) | normalized weight |
|---|---|---|
| 0.3 | 0.01323 | 0.160 |
| 0.5 | 0.03125 | 0.378 |
| 0.7 | 0.03087 | 0.374 |
| 0.9 | 0.00729 | 0.088 |

Weighted average of `p` (≈0.578) is close to the true mean (0.571) — a coarse 4-point grid, so not
exact. Weighted average of `p²` (≈0.363) is close to the true `E[p²]` (0.357) — and notice it does
**not** equal the squared weighted-average-of-p (`0.578² ≈ 0.334`). Even with only four grid points,
summing `p² × weight` gives a different, higher number than squaring the summed `p × weight` — the
same gap, visible as arithmetic instead of calculus. Stage 5 turns this coarse sketch into the real
tool (fine grids, many points); for now, the point is that "integrate/sum over the whole posterior"
and "plug in one summary number" are genuinely different operations, and they disagree exactly when
uncertainty about `p` is large enough to matter.

**The general pattern**, for the next `k` trials all succeeding from a `Beta(α,β)` posterior:

```
[α/(α+β)] × [(α+1)/(α+β+1)] × [(α+2)/(α+β+2)] × ... × [(α+k−1)/(α+β+k−1)]
```

— each factor is "the posterior mean, updated one hypothetical success at a time." As `α+β` grows
large (a sharp, confident posterior), this converges toward `mean^k`, because there's barely any
uncertainty left for a hypothetical success to update — another instance of Lesson 17's "more weight,
less movement."

**Where this goes:** Stage 2 is done. Stage 3 formalizes something you've been doing informally the
whole time — treating yesterday's posterior as today's prior — and asks precisely when the *order*
evidence arrives in is allowed to not matter.
