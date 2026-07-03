---
title: "Solution: Chaining Plausibilities"
description: "Two factorizations of the same joint probability — and why you chain in the direction your data supports."
lesson_number: 3
track: bayes
concept: "Multiplication rule"
stage: 0
layout: solution
role: solution
builds_on: [2]
skin: chalkboard
resources:
  - title: "Seeing Theory — Compound Probability"
    url: https://seeingtheory.brown.edu/compound-probability/index.html
    note: "set up dependent events and watch the tree"
---

**P(config and fast) = P(fast | config) · P(config) = 0.8 × 0.3 = 0.24.**

The path reading: of all incidents, 30% enter the "config-related" branch; of those, 80% also turn
out to be fast-detected. 80% of 30% is 24%. With natural frequencies: picture 100 incidents → 30
are config-related → 24 of those are caught fast. The decoy was P(fast) = 0.5 — the *marginal*
detection rate. It's real information (we'll use exactly this kind of number in Bayes' theorem),
but the question never needed it.

**The same joint has two factorizations**, because "config and fast" is the same event as "fast
and config":

    P(config and fast) = P(fast | config) · P(config)   ← the one you could compute
                       = P(config | fast) · P(fast)     ← equally true, but you weren't given P(config | fast)

That freedom to factor either way is not a curiosity — set the two right-hand sides equal, divide,
and you have derived Bayes' theorem. You're two lessons away from doing exactly that.

**The pitfall:** multiplying *unconditional* probabilities when the events are dependent. The
lazy calculation P(config) · P(fast) = 0.3 × 0.5 = 0.15 is badly wrong here — being config-related
makes fast detection much more likely (0.8 vs the average 0.5), and the true joint (0.24) is 60%
higher than the lazy one. Multiplying plain P(A) · P(B) is only legal when learning B tells you
*nothing* about A. That condition has a name — **independence** — and it's abused often enough,
sometimes with ruinous consequences, that it gets the next lesson to itself.

**Longer chains** work the same way, one conditional per step:
P(A and B and C) = P(A) · P(B | A) · P(C | A and B). Each factor answers "given everywhere I've
already walked, how plausible is the next step?"
