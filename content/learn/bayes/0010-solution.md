---
title: "Solution: Two Tests, One Multiplication (Usually)"
description: "Why chaining likelihood ratios is legal under conditional independence — and how correlated evidence quietly breaks it."
lesson_number: 10
track: bayes
concept: "Sequential evidence & conditional independence"
stage: 1
layout: solution
role: solution
builds_on: [9]
skin: chalkboard
resources:
  - title: "Wikipedia — Conditional independence"
    url: https://en.wikipedia.org/wiki/Conditional_independence
    note: "the formal definition, worked through a few classic examples"
---

**Posterior odds ≈ 0.3**, i.e. about 3:10 (roughly 23% as a probability).

- Prior odds: 1/999 ≈ 0.001.
- LR_A × LR_B = 20 × 15 = 300.
- Posterior odds: 0.001 × 300 ≈ **0.3**.

Two positive tests, each individually unimpressive-sounding (LR 20, LR 15 — nowhere near "certain"),
combine to push a 1-in-1,000 prior up to roughly 1-in-4. That's the payoff of odds form from last
lesson: sequential evidence is just sequential multiplication, *when you're allowed to multiply*.

**The assumption doing all the work: conditional independence given disease status.** Formally:

> P(A positive, B positive | disease) = P(A positive | disease) × P(B positive | disease)

and the same equation with ¬disease in place of disease. In words: once you already know whether
someone has the disease, learning Test A's result gives you *zero* extra information about what
Test B will say. Their errors and their signals both have separate causes.

**What if that assumption is false?** Say the two tests instead shared a hidden cause of false
positives — for instance, both assays cross-react with the same common, harmless antibody that
some healthy people happen to carry. Then among the *disease-free*, a false positive on Test A
makes a false positive on Test B *more* likely too (same underlying cause), not independent of it.
Naively multiplying LR_A × LR_B then **overstates** the combined evidence — you're partly counting
the same fact twice, dressed up as two facts. (This is the same mistake lesson 4 introduced in
general — "assuming independence when evidence is actually correlated" — now caught in the specific
act of compounding.) The fix isn't algebraic, it's empirical: measure the *joint* likelihood ratio
directly, P(A+, B+ | disease) / P(A+, B+ | ¬disease), rather than assuming it factors.

**How to tell, in practice:** ask whether the tests could go wrong *for the same reason*. Two
tests built on the same instrument, the same sample, the same underlying biomarker, or scored by
the same rater are the tell-tale cases (in forecasting: two "independent" pundits who both read the
same wire report aren't independent evidence, they're one piece of evidence twice). Two tests
built on genuinely different mechanisms — a chemical assay and a genetic panel, say — are the
clean case, and clean cases are what medicine and forensics reach for when they can.

**Where this goes:** so far every lesson has updated a belief about a *fixed, binary* hypothesis
(disease or not, guilty or not). Stage 2 opens the belief up into a full **distribution** — not
"is the rate 10%?" but "here's the whole plausibility curve over every rate from 0 to 100%," updated
by data the same multiplicative way.
