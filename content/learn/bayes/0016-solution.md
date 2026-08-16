---
title: "Solution: How Much Does One More Observation Move You?"
description: "0.667 either way, by coincidence — but the weak prior moved 7x further to get there. Weight before the data point determines how much a single observation can move you."
lesson_number: 16
track: bayes
concept: "Watching the posterior sharpen; how much one observation moves you"
stage: 2
layout: solution
role: solution
builds_on: [11, 15]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive: add observations one at a time and watch the posterior curve sharpen"
---

### Part 1 — Exact answer: 0.667

Beta(9, 5) plus one success (k=1, n−k=0) → **Beta(10, 5)**. Mean = 10 / 15 = **0.6667**.

If your estimate landed close to 0.643 (barely moved from Lesson 15's answer) with a tight
interval, your intuition for "diminishing sensitivity" is already well-calibrated — a posterior
carrying 14 units of weight barely notices one more data point. If your interval was wide or your
guess far off, that's exactly the intuition this lesson is building.

---

### Part 2 — Same success on Beta(1, 1)

Beta(1, 1) plus one success → **Beta(2, 1)**. Mean = 2 / 3 = **0.6667**.

(Yes — coincidentally the *same* numeric value as Part 1's answer. That coincidence is a trap if
you stop here; Part 3 shows why comparing the endpoints alone is the wrong comparison.)

---

### Part 3 — The movements, compared

- **Beta(9,5) → Beta(10,5)**: 9/14 (≈0.6429) → 10/15 (≈0.6667). **Movement ≈ 0.024.**
- **Beta(1,1) → Beta(2,1)**: 1/2 (0.5) → 2/3 (≈0.6667). **Movement ≈ 0.167.**

Same single new data point (one success), landing on two different posteriors — and the weak
posterior moved **about 7× further** than the strong one, even though (by coincidence of the
specific numbers chosen) both happened to arrive at the same final mean.

Why: before the new observation, Beta(9,5) already carried α+β = 14 units of weight (prior +
data so far); Beta(1,1) carried only α+β = 2. Adding one success is adding 1 unit of weight to a
pool of 14 (a ~7% change in composition) versus adding 1 unit to a pool of 2 (a 50% change in
composition). The *fraction* of total evidence that the new point represents is what determines how
far the mean can move — not anything about the new observation itself, which was identical in both
cases.

---

### Part 4 — The general rule

**A single new observation can move a beta posterior's mean by roughly `1 / (α + β + 1)`** — i.e.,
inversely proportional to how much total weight (real + virtual trials) the posterior already
carries. Check it against Part 3: Beta(9,5) had α+β=14, so max movement ≈ 1/15 ≈ 0.067 (our actual
movement of 0.024 falls within that ballpark, depending on direction); Beta(1,1) had α+β=2, so max
movement ≈ 1/3 ≈ 0.33 (our actual movement of 0.167 is again in that ballpark). The exact bound
depends on which direction the observation pushes, but the *scaling* — inversely with existing
weight — is the reliable takeaway.

This is exactly the mechanism behind **sharpening**: as α+β grows, the posterior doesn't just center
somewhere, it becomes more resistant to being knocked around by any one new data point, i.e. its
variance shrinks. A posterior's "confidence" isn't a separate quantity you compute alongside the
mean — it's a direct, mechanical consequence of how much weight has accumulated in α+β.

---

### The pattern

| Posterior before | α+β (weight) | +1 success | New mean | Movement |
|---|---|---|---|---|
| Beta(1,1) | 2 | Beta(2,1) | 0.667 | 0.167 |
| Beta(9,5) | 14 | Beta(10,5) | 0.667 | 0.024 |
| Beta(99,50) | 149 | Beta(100,50) | 0.667 | ≈0.002 |

**Rule**: the same single observation moves a young, low-weight posterior a lot and a mature,
high-weight posterior barely at all — one more data point matters in proportion to how small a
fraction of total accumulated evidence it represents, roughly `1/(α+β+1)`.

**Where this goes:** Stage 2 closes with one more idea — the **posterior predictive**: given
everything the posterior now believes about p, what do you actually expect to see on the *next*
single trial? Stage 3 then formalizes "yesterday's posterior is today's prior" — the sequential
updating you've been doing by hand all through Stage 2, made explicit and general.
