---
title: "Solution: Choosing a Starting Answer Sheet"
description: "An informative prior resists movement because it behaves like prior observations already baked in — and that resistance fades as real data accumulates and eventually swamps any finite prior."
lesson_number: 14
track: bayes
concept: "Priors: uniform, informative, and letting the data speak"
stage: 2
layout: solution
role: solution
builds_on: [12, 13]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive: drag the prior's shape and watch the posterior respond to data in real time"
---

### MCQ answer: (B) — the informative prior pulls the posterior back toward ~2%

With only 100 views, the 3-clicks data point is thin evidence. Prior B was built from 500 past
buttons — real prior information, not a guess — and (as you'll formalize in the next two lessons)
a prior like that behaves mathematically like a stash of "virtual" prior observations already
counted before today's 100 views arrived. To move the posterior away from ~2%, today's 100 views
would need to outweigh that stash, and they mostly can't yet — the posterior lands closer to 2%
than to the raw 3%. The uniform prior (A), by contrast, contributes nothing to fight against — the
100 views alone shape the posterior, landing it close to the raw rate. Option (C) is wrong precisely
because *which* prior you use changes how much 100 data points can move things; option (D) is wrong
because both priors are equally legitimate constructions, just encoding different amounts of prior
information.

---

### Part 2 — When uniform is the right call

Genuine ignorance, honestly. If you're estimating the defect rate of a component from a totally new
supplier you've never worked with, with no comparable historical data, no physical reason to expect
any particular rate, and no domain expert willing to commit to a range — a uniform prior over [0,1]
correctly represents "I have no basis to favor 5% over 50%." Using an informative prior here — say,
borrowing "typical" defect rates from an unrelated product line — would smuggle in unjustified
assumptions dressed up as knowledge. Uniform is the honest choice exactly when you lack the
knowledge an informative prior would need to be built from.

---

### Part 3 — When an informative prior is clearly correct

The classic case: rare-event or small-sample estimation where a little new data, taken alone, would
produce an absurd estimate. Example: a new drug trial with 3 patients, 0 of whom relapse — the raw
rate says "0% relapse, this drug is a miracle cure." Nobody sane believes that from n=3. If you
know relapse rates for this drug class have historically clustered around 15–25% across dozens of
prior trials, an informative prior correctly keeps the posterior estimate in a plausible range
until enough new patients accumulate to actually justify moving it. Ignoring that prior knowledge
in favor of "let the small data speak" produces a technically-computed but practically absurd
estimate.

**General rule**: let prior knowledge dominate when (a) you actually possess real, relevant prior
information (not just a hunch), and (b) the new data is sparse relative to how much evidence it
would take to overturn that prior information. Let new data dominate — or use a weak/uniform prior
— when either condition fails: you lack solid prior knowledge, or you have abundant new data. The
tension isn't "which is more virtuous," it's simple weight-of-evidence bookkeeping, made precise in
the next lesson.

---

### Part 4 — MCQ answer: (b) — the gap shrinks toward zero

Any *proper* prior (one that isn't infinitely concentrated on a single point) represents a *finite*
amount of "evidence weight" — Prior B's 500-button history is strong, but it's still finite. As
real data accumulates — 100, then 1,000, then 100,000 observations — the likelihood's evidence
weight grows without bound, while the prior's contribution stays fixed. Eventually the likelihood
term in Bayes' theorem simply outweighs whatever fixed pull the prior exerts, and posteriors built
from *any* reasonable prior (uniform or informative) converge toward the same place — essentially
the data's own rate. This is sometimes called **washing out the prior**, and it's a genuine safety
net: your prior choice matters most when data is scarce, and matters progressively less as data
piles up, so a defensible-but-imperfect prior isn't a permanent liability.

---

### The pattern

| Prior type | Encodes | Effect with little data | Effect with lots of data |
|---|---|---|---|
| Uniform / flat | "no basis to favor any value" | posterior ≈ raw data rate | posterior ≈ raw data rate |
| Informative (tight) | real prior evidence | posterior pulled toward prior | posterior ≈ raw data rate (prior washes out) |
| Informative (very tight / dogmatic) | near-certainty | posterior barely moves | eventually still washes out, but needs much more data |

**Rule**: a prior is an honest declaration of what you believed before today's data — uniform when
you truly have nothing, informative when you truly have something. "Letting the data speak" is not
a neutral default; it's the choice to declare no prior knowledge, which is exactly wrong when you
actually have some.

**Where this goes:** next lesson makes the "prior acts like phantom prior observations" intuition
from Part 1 fully precise: **beta-binomial updating**, where a beta-distributed prior plus a
binomial likelihood combines into a beta posterior via simple addition of counts — the first
complete, closed-form distribution-level update in this track.
