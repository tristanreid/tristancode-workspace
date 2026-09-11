---
title: "Solution: The Ordering Doesn't Vanish, It Cancels"
description: "2.848 — C(8,6) cancels in the ratio because it's the same constant on both sides, not because sequences are equally probable. Those are two different facts."
lesson_number: 16
track: bayes
concept: "Binomial likelihood as a ratio between hypotheses"
stage: 2
layout: solution
role: solution
builds_on: [9, 13]
skin: chalkboard
resources:
  - title: "Setosa — Binomial Distribution Explorer"
    url: https://setosa.io/ev/binomial-distribution/
    note: "interactive: drag p and watch how the whole distribution over head-counts reshapes"
---

**Retrieval check answer.** P(flagged) = 0.95×0.02 + 0.10×0.98 = 0.019 + 0.098 = 0.117.
P(caused it | flagged) = 0.019 / 0.117 ≈ **0.162** — about 16%. A bot with 95%/10% hit/false-alarm
rates, applied to a rare (2%) event, still flags mostly-innocent deploys most of the time. Same
mechanism as Lesson 7's disease test — different noun.

---

**Main answer: LR ≈ 2.848.**

```
P(data | p = 0.75) = 0.75^6 × 0.25^2 = 0.177979 × 0.0625 ≈ 0.011124
P(data | p = 0.5)  = 0.5^6  × 0.5^2  = 0.5^8            ≈ 0.003906

LR = 0.011124 / 0.003906 ≈ 2.848   (exactly 729/256)
```

With `C(8,6) = 28` folded into both sides instead:

```
P(6 heads in 8 | p=0.75) = 28 × 0.011124 ≈ 0.311462
P(6 heads in 8 | p=0.5)  = 28 × 0.003906 ≈ 0.109375

LR = 0.311462 / 0.109375 ≈ 2.848   — identical.
```

Same ratio either way. `C(8,6)` multiplies *both* the numerator and the denominator by the same
factor, 28, so it divides straight out. That's the whole mechanism: **in a ratio between two
hypotheses on the same data, any factor that doesn't depend on the hypothesis (`p`) cancels.**
`C(n,k)` never depends on `p` — it's a fact about counting orderings, not about the coin — so it's
always safe to drop from a likelihood *ratio*, even though it's essential to the *absolute*
probability of "k heads in some order."

---

**Now the colleague's claim — where it's right, and where it overreaches.**

**Check A (same composition, different order): TRUE, they're equal.** `H H T H H H T H` and
`H T H H H H T H` both have 6 heads and 2 tails. Under `p = 0.75`, *any* specific sequence with that
exact composition has probability `0.75^6 × 0.25^2 ≈ 0.011124` — order genuinely doesn't matter once
the composition (how many heads) is fixed. This part of the intuition is correct, and it's *why*
`C(n,k)` exists in the first place: it's literally counting how many equally-probable orderings share
one composition, so you can add them up into "probability of exactly k heads, any order."

**Check B (different composition): FALSE, they're wildly unequal.** A specific 6-heads sequence and a
specific 2-heads sequence, both under `p = 0.75`:

```
P(specific 6H,2T sequence | p=0.75) = 0.75^6 × 0.25^2 ≈ 0.011124
P(specific 2H,6T sequence | p=0.75) = 0.75^2 × 0.25^6 ≈ 0.000137

ratio ≈ 81×   (exactly (0.75/0.25)^4 = 3^4 = 81)
```

Under a biased coin, a sequence with *more* heads is dramatically more probable than a same-length
sequence with *fewer* heads — composition matters enormously, only order-within-a-composition doesn't.
**The colleague's mistake is exactly the gap between Check A and Check B**: "order doesn't matter
among sequences with the same head-count" (true) got overgeneralized to "every sequence is equally
probable" (false, unless `p = 0.5`, where every sequence — any composition — genuinely is equally
likely, since `0.5^k × 0.5^(n-k) = 0.5^n` regardless of `k`). At `p = 0.5` the colleague's blanket
claim would be correct. At `p = 0.75`, it silently smuggles in the fair-coin case as if it were
general.

**Why this matters for the likelihood ratio specifically.** The colleague was reaching for a true
fact (`C(n,k)` cancels in the ratio) via a false justification ("sequences are equally probable"). The
right justification is narrower and more useful: `C(n,k)` cancels **because it's a `p`-independent
constant**, full stop — not because the data itself carries no information about which composition is
more or less likely. The composition (6 heads vs. 2 heads) carries plenty of information about `p`;
it's only the *ordering-count* that's inert in a ratio.

**The general shape.** For any two hypotheses `p₁, p₂` and observed `k` successes in `n` trials, the
likelihood ratio is:

```
LR = [C(n,k) p₁^k (1−p₁)^(n−k)] / [C(n,k) p₂^k (1−p₂)^(n−k)] = (p₁/p₂)^k × [(1−p₁)/(1−p₂)]^(n−k)
```

`C(n,k)` is gone from the right-hand side entirely — it was never carrying hypothesis-relevant
information, only orderings-per-composition information, and a ratio between hypotheses doesn't need
that.

**Where this goes:** the likelihood ratio you just computed (≈2.848) is exactly the ingredient
Lesson 9's odds form eats directly — `posterior odds = prior odds × LR`. Next lesson turns back to
the beta-binomial posterior itself and asks a sharper question about how much evidence it actually
takes to narrow one down.
