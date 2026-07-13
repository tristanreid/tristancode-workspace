---
title: "Solution: What 4 Heads Out of 5 Actually Says"
description: "≈0.360 — one number on one candidate rate's answer sheet, and the seed of how a whole posterior gets built."
lesson_number: 13
track: bayes
concept: "The binomial likelihood"
stage: 2
layout: solution
role: solution
builds_on: [12]
skin: chalkboard
resources:
  - title: "Setosa — Binomial Distribution Explorer"
    url: https://setosa.io/ev/binomial-distribution/
    note: "interactive: drag n, k, and p and watch the likelihood shift in real time"
---

**P(4 heads in 5 flips | p = 0.7) = C(5,4) · 0.7⁴ · 0.3¹ = 5 × 0.2401 × 0.3 ≈ 0.360.**

Walking the formula: C(5,4) = 5 (there are 5 different flip-sequences with exactly one tail —
TAILS-then-4-heads, or the tail in any of the other 4 positions). 0.7⁴ = 0.2401 is the probability
of any *one* specific 4-heads outcome; 0.3¹ is the probability that the remaining flip is a tail.
Multiply all three together and about **36%** of the time, a truly-70%-heads coin produces exactly
this data over 5 flips.

**The number alone answers nothing yet — it only becomes useful in comparison.** 0.360 isn't "the
probability the coin is biased" and it isn't a verdict on p = 0.7 in isolation; it's one entry on
an answer sheet like last lesson's, one likelihood value attached to *one* candidate rate. The move
that makes it Bayesian: compute the *same* likelihood formula under other candidate rates too — say
p = 0.5 (a fair coin) gives C(5,4)·0.5⁴·0.5¹ = 5 × 0.03125 ≈ 0.156, noticeably lower. Line up
enough candidate p values side by side, each with its own likelihood, and you've built the entire
likelihood *curve* — the second ingredient (alongside a prior over p) that a posterior distribution
multiplies together, point by point, exactly the way odds-form multiplied a single likelihood ratio
into prior odds back in Stage 1.

**Why the binomial shape specifically:** it applies whenever data is a count of successes out of a
fixed number of independent identical trials, each with the same unknown success probability —
coin flips, yes, but also click-through counts, defect counts in a batch, or "how many users
converted out of those shown a variant." Any time that shape shows up, this same formula is the
likelihood machinery underneath.

**Where this goes:** next lesson puts a **prior** over p (a starting answer sheet before any data)
next to this likelihood and multiplies them together, point by point across every candidate rate —
producing the *posterior* answer sheet: **beta-binomial updating**, the first fully worked
distribution-level Bayesian update in this track.
