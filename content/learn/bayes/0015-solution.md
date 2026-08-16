---
title: "Solution: The Update That's Just Addition"
description: "Beta(9, 5), mean ≈ 0.643 — pulled slightly below the raw 0.7 rate by the prior's virtual failures, and pulled much further with a stronger prior."
lesson_number: 15
track: bayes
concept: "Beta-binomial updating: posterior = prior counts + observed counts"
stage: 2
layout: solution
role: solution
builds_on: [13, 14]
skin: chalkboard
resources:
  - title: "Seeing Theory — Beta distribution & conjugate priors"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive: adjust α, β and watch the posterior shape update live as data arrives"
  - title: "Think Bayes 2 — Chapter 4, Estimating Proportions"
    url: https://allendowney.github.io/ThinkBayes2/chap04.html
    note: "free textbook chapter working the beta-binomial update in full, with code"
---

### Part 1 — Posterior: Beta(9, 5), mean ≈ 0.643

Prior Beta(2, 2): α = 2 virtual successes, β = 2 virtual failures. Data: k = 7 successes, n − k =
10 − 7 = 3 failures.

**Posterior = Beta(α + k, β + (n − k)) = Beta(2 + 7, 2 + 3) = Beta(9, 5).**

**Mean = α / (α + β) = 9 / (9 + 5) = 9 / 14 ≈ 0.643.**

That's the entire computation — no integrals, no normalization constant to hunt down. The
prior's 2 virtual successes plus the real 7 give 9 total successes; the prior's 2 virtual failures
plus the real 3 give 5 total failures, out of 14 total (virtual + real) trials.

---

### Part 2 — Why 0.643, not the raw 0.7

The posterior mean (0.643) sits *below* the raw observed rate (0.7) — pulled toward the prior's
implicit center of 0.5. In the virtual-trials framing: the raw 7/10 only reflects the 10 real
trials, but the posterior mean reflects **14** trials total (10 real + 4 virtual), and those 4
virtual trials were split evenly (2/2), which drags the blended rate down from 0.7 toward 0.5. The
prior didn't get overridden — it got *outvoted*, but only partially, because 10 real trials isn't
enough to fully swamp 4 virtual ones weighted at 2-and-2.

---

### Part 3 — Stronger prior: Beta(27, 23), mean = 0.54

Prior Beta(20, 20), same data (k = 7, n − k = 3):

**Posterior = Beta(20 + 7, 20 + 3) = Beta(27, 23). Mean = 27 / 50 = 0.54.**

Compare: Part 1's Beta(2,2) prior gave a posterior mean of 0.643 (14 total trials, prior only 4 of
them — real data dominates, landing fairly close to 0.7). This Beta(20,20) prior gives 0.54 (50
total trials, prior a full 40 of them — the prior dominates, landing much closer to 0.5 than to
0.7). Exactly matching the "weight = α + β virtual trials" framing: 40 virtual trials easily
outweigh 10 real ones, while 4 virtual trials barely dent 10 real ones.

---

### Part 4 — What it would take to overturn Beta(20, 20)

To pull the posterior mean up near 0.9, the real data's successes need to heavily outnumber the
prior's 40 virtual trials. Rough reasoning via the addition rule: if you observed, say, `n` real
trials at close to a 100% success rate, the posterior mean would be roughly `(20 + n) / (40 + n)`
(using k ≈ n). Setting that near 0.9: `(20 + n) / (40 + n) ≈ 0.9` → `20 + n ≈ 0.9(40 + n)` →
`20 + n ≈ 36 + 0.9n` → `0.1n ≈ 16` → `n ≈ 160`. So roughly **160 real trials at a very high success
rate** (not just 10 or 20) would be needed to haul the posterior mean up near 0.9 against a
Beta(20,20) prior — a strong prior genuinely requires a substantial amount of contradicting
evidence before it budges much, which is the entire point of choosing a strong prior in the first
place: it should take real evidence to overturn real prior knowledge.

---

### The pattern

| Prior | Virtual trials (α+β) | Data | Posterior | Mean | Distance from raw 0.7 |
|---|---|---|---|---|---|
| Beta(1,1) uniform | 0 | 7/10 | Beta(8,4) | 0.667 | small |
| Beta(2,2) | 4 | 7/10 | Beta(9,5) | 0.643 | small–moderate |
| Beta(20,20) | 40 | 7/10 | Beta(27,23) | 0.54 | large |

**Rule**: beta-binomial updating is addition of counts — `Beta(α, β) + (k successes, n−k
failures) → Beta(α+k, β+n−k)` — and the prior's "weight" against real data is literally `α + β`,
measured in the same units (trials) as the data itself. This is the exact mechanism behind Lesson
14's "an informative prior resists being moved" — now you can compute *how much* resistance, not
just gesture at it.

**Where this goes:** next lesson watches this update happen incrementally, one observation at a
time, and asks how much any single new data point actually moves a posterior that already has some
weight behind it — the same question Part 4 just answered by algebra, now built up observation by
observation.
