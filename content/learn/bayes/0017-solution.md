---
title: "Solution: Four Times the Trials, Half the Spread"
description: "60 more trials (to 80 total), not 20 — SD scales as 1/sqrt(n), so halving it takes 4x the trials, not 2x. Doubling only shrinks SD by a factor of about 0.71."
lesson_number: 17
track: bayes
concept: "Posterior SD scales as 1/sqrt(n), not 1/n"
stage: 2
layout: solution
role: solution
builds_on: [15]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive: watch the posterior curve narrow as sample size grows, and how slowly"
---

**Retrieval check answer.** P(pass) = 0.9×0.2 + 0.25×0.8 = 0.18 + 0.20 = 0.38.
P(qualified | passed) = 0.18 / 0.38 ≈ **0.474** — about 47%, not 90%. The 90% is P(pass | qualified),
a completely different conditional (Lesson 8's transposed-conditional trap), and a mediocre false-hire
rate (25%) plus a low base rate of qualified candidates (20%) drags it down hard.

---

**Part 1 — the shortcut fails.** At `n = 20`, mean `p = 0.33`:

```
variance(20) ≈ 0.33 × 0.67 / 20 = 0.2211 / 20 = 0.011055
SD(20) ≈ √0.011055 ≈ 0.1051
```

Doubling to `n = 40` (same `p = 0.33`):

```
variance(40) ≈ 0.2211 / 40 = 0.0055275
SD(40) ≈ √0.0055275 ≈ 0.0743
```

`0.0743` is **not** half of `0.1051` — half would be `0.0526`. The actual ratio is
`0.0743 / 0.1051 ≈ 0.707`, i.e. `1/√2`. Doubling the trial count shrinks the SD by a factor of
`1/√2 ≈ 0.71`, not `1/2`. Your colleague's "20 more trials" leaves the posterior visibly wider than
they think it is — check it against the real number and the shortcut falls apart immediately.

**Part 2 — solving properly.** `variance ∝ 1/n` means `SD ∝ 1/√n`. To cut SD in half, you need
`√n'` to be **double** `√n` — which means `n'` itself must be **4×** `n`, not 2×
(`√(4n) = 2√n`). At `n = 20`, that's `n' = 80`:

```
variance(80) ≈ 0.2211 / 80 = 0.00276375
SD(80) ≈ √0.00276375 ≈ 0.0526   — exactly half of 0.1051, as required.
```

**Part 3 — the numeric answer: 60 more trials.** Current `n = 20`; target `n' = 80`; the difference
is `80 − 20 = 60` additional trials. (Using the exact beta-variance formula with the `+1` term instead
of the approximation shifts this to roughly 63 rather than 60 — same conclusion, same order of
magnitude, and irrelevant to the point being made.)

**Why the "squared in the denominator" instinct is half-right and half-wrong.** Variance genuinely
does have `n` (not `n²`) in the denominator — the colleague's shortcut silently assumed the *wrong*
power. Because `variance ∝ 1/n` rather than `1/n²`, the standard deviation — the more interpretable,
same-units quantity you actually care about — scales as `1/√n`, the square root softening the
relationship. Any process where uncertainty is measured by standard deviation and driven by
independent-trial accumulation has this shape: **going from "good" to "twice as good" costs four
times the data, not twice.** This is the same arithmetic, generalized, that made a single new
observation barely move a large posterior back in Lesson 16 (movement `≈ 1/(α+β+1)`) — both facts
come from the same `1/n`-type scaling underneath.

**The pattern:**

| Total trials `n` | Variance (≈ `p(1-p)/n`) | SD | SD relative to `n=20` |
|---|---|---|---|
| 20 | 0.01106 | 0.1051 | 1× |
| 40 (2×) | 0.00553 | 0.0743 | 0.71× |
| 80 (4×) | 0.00276 | 0.0526 | 0.50× |
| 320 (16×) | 0.00069 | 0.0263 | 0.25× |

**Where this goes:** you've now watched a posterior's uncertainty shrink as data accumulates. Next
lesson asks a related but distinct question — not "how uncertain am I about `p`?" but "given
everything I currently believe about `p`, what do I actually expect to see on the *next* trial?"
That's the posterior predictive distribution, and it has its own classic wrong shortcut waiting.
