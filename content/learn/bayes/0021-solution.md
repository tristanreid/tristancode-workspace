---
title: "Solution: Five Settings, No Formula"
description: "0.604 — the grid shifts hard away from the prior's favorite (p=0.5) toward p=0.7, because 3-out-of-4 data fits the higher settings far better, no beta distribution required."
lesson_number: 21
track: bayes
concept: "When conjugacy breaks: grid approximation preview"
stage: 3
layout: solution
role: solution
builds_on: [12, 15]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 4, Estimating Proportions"
    url: https://allendowney.github.io/ThinkBayes2/chap04.html
    note: "works a grid-approximation update by hand for the classic Euro-coin problem"
---

**Retrieval check answer.** `1 − (0.35 + 0.25 + 0.15) = 1 − 0.75 = 0.25` — referral is **25%** of
traffic. Same rule as Lesson 12's missing die-face probability: whatever's left has to make the total
hit exactly 1.

---

**Part 1 — Likelihoods** (`p³(1−p)`, for 3 successes and 1 failure out of 4 trials):

| p | p³(1−p) |
|---|---|
| 0.1 | 0.001 × 0.9 = 0.0009 |
| 0.3 | 0.027 × 0.7 = 0.0189 |
| 0.5 | 0.125 × 0.5 = 0.0625 |
| 0.7 | 0.343 × 0.3 = 0.1029 |
| 0.9 | 0.729 × 0.1 = 0.0729 |

(Multiplying every row by the shared constant `C(4,3)=4` would give `0.0036, 0.0756, 0.25, 0.4116,
0.2916` — four times each number above. It changes nothing after normalization, exactly Lesson 16's
point: a hypothesis-independent constant cancels.)

**Part 2 — Unnormalized posterior** (prior weight × likelihood):

| p | prior | likelihood | prior × likelihood |
|---|---|---|---|
| 0.1 | 0.05 | 0.0009 | 0.000045 |
| 0.3 | 0.15 | 0.0189 | 0.002835 |
| 0.5 | 0.50 | 0.0625 | 0.031250 |
| 0.7 | 0.20 | 0.1029 | 0.020580 |
| 0.9 | 0.10 | 0.0729 | 0.007290 |

Sum = 0.000045 + 0.002835 + 0.031250 + 0.020580 + 0.007290 = **0.062000**.

**Part 3 — Normalized posterior:**

| p | unnormalized | ÷ 0.062 | normalized |
|---|---|---|---|
| 0.1 | 0.000045 | | 0.0007 |
| 0.3 | 0.002835 | | 0.0457 |
| 0.5 | 0.031250 | | 0.5040 |
| 0.7 | 0.020580 | | 0.3319 |
| 0.9 | 0.007290 | | 0.1176 |

(Sum ≈ 1.0000, confirming the normalization.)

**Part 4 — Posterior mean: ≈ 0.604.**

```
0.1×0.0007 + 0.3×0.0457 + 0.5×0.5040 + 0.7×0.3319 + 0.9×0.1176
= 0.00007 + 0.01372 + 0.25202 + 0.23235 + 0.10582
≈ 0.60398 ≈ 0.604
```

The prior put over half its weight on `p = 0.5`. After seeing 3-out-of-4 (a raw 75% rate), most of the
posterior's mass shifted onto `p = 0.7` (33%) and stayed substantial at `p = 0.9` (12%), while `p=0.5`
still holds a plurality (50%) — that single grid point had the largest prior weight *and* a
reasonably good likelihood, so it wasn't cheap to dislodge. The posterior mean, 0.604, sits well above
the prior's implied center but well below the raw 0.75 rate — exactly the same "tug-of-war between
prior weight and data" you've seen since Lesson 14, just computed point-by-point on a discrete grid
instead of through a beta formula.

**Why this had no closed form.** A beta distribution is a *smooth curve* over `[0,1]`; this prior is
five isolated spikes at specific settings, with nothing at all in between. No choice of `Beta(α,β)`
parameters can represent "exactly these five values, nothing else" — the shapes are fundamentally
different objects. Grid approximation doesn't care: it re-derives the posterior from Bayes' rule
directly, one candidate value at a time, for *any* prior shape at all — bimodal, five isolated spikes,
a hand-sketched curve, anything.

**The trade-off, honestly.** What you just did — five rows of arithmetic — scales badly if you wanted
a *smooth* posterior over all of `[0,1]` instead of five discrete settings: that takes hundreds or
thousands of grid points, each one requiring its own likelihood computation. That's exactly the
"honest workhorse" Stage 5 builds properly. For now: conjugate updates are a shortcut that only exists
for a few lucky prior-likelihood pairings; grid approximation is the general method that always works,
at the cost of doing the sum by brute force instead of algebra.

**Where this goes:** you've now summarized posteriors with means. Next lesson asks a sharper question
about summarizing them: mean, median, and mode aren't interchangeable "best guesses" — each one is the
answer to a different question about how you're being scored for being wrong.
