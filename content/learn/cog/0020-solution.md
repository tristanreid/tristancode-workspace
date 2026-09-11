---
title: "Solution: The Probable Story That Can't Be More Probable"
description: "P(both) = 0.0075, nineteen times smaller than P(engineer) alone — representativeness makes the specific story feel likelier, but a conjunction can never outrank the event it's a subset of."
lesson_number: 20
track: cog
concept: "Heuristics & biases: representativeness and the conjunction fallacy"
stage: 5
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "Kahneman (2002) — Nobel Prize lecture, 'Maps of Bounded Rationality'"
    url: https://www.nobelprize.org/prizes/economic-sciences/2002/kahneman/lecture/
    note: "Kahneman's own account of the heuristics-and-biases program, in his words"
---

**Retrieval check answer.** T1: 0.8 × 0.9 ÷ 2 = **0.36** ← wins. T2: 0.9 × 0.2 ÷ 1 = 0.18. T3: 0.5 ×
0.6 ÷ 1.5 ≈ 0.20. T1 wins comfortably — high credibility and high value together outweigh its higher
cost, exactly the combination a resource-limited triage system should chase first, and unlike lesson
14's trap, T1's value term here is real (0.9), not near-zero.

---

### The computation

P(software engineer AND plays in a band) = P(software engineer) × P(plays in a band | software
engineer) = 0.15 × 0.05 = **0.0075**.

Compare to P(software engineer) alone = 0.15. The conjunction is **0.0075**, about **20 times
smaller** than the plain event it's nested inside — which has to be true by pure arithmetic: every
person in the "engineer and musician" set is also, necessarily, in the "engineer" set, so the smaller
set can never be more probable than the larger one it's contained in. There is no fact about résumés,
hiring, or musicians that could ever make this go the other way; it's a structural guarantee
(P(A∩B) ≤ P(A) for any A and B), not an empirical claim that happens to hold in this dataset.

**Why representativeness fights the arithmetic anyway.** The description — quiet, precise, a
musician's background — reads as a better *fit* for "engineer who still plays music" than for the
bland, unqualified "software engineer." Representativeness substitutes "how well does this description
match my mental picture of each category" for "how probable is each category, given the actual base
rates" — and the more specific, narrative-fitting conjunction routinely wins that similarity contest
even though it structurally cannot win the probability contest. The vividness of a detail (the
musician background) makes the conjunction feel more *diagnostic*, when in fact adding any additional
required condition can only ever hold probability steady or shrink it, never grow it.

**The bridge to the bayes track:** this is base-rate reasoning wearing a different hat. P(A∩B) = P(A) ×
P(B|A) is the same conditional-probability chain rule that underlies Bayesian updating — the
conjunction fallacy is what happens when a vivid conditional term (P(plays in a band | engineer) makes
for a compelling story) gets evaluated on its own narrative merits instead of being multiplied through
against the base rate it's actually attached to. If you've done the bayes track, this is the same
arithmetic that makes rare-disease test results counterintuitive: a specific, vivid scenario
(the positive test) can feel far more diagnostic than the base rate underneath it justifies once you
actually multiply through.

**For your harness:** an LLM asked to estimate "how likely is X" is exactly as susceptible to
representativeness as a person — a longer, more specific, more narratively coherent hypothesis can
score as more probable in a model's stated confidence than a plainer hypothesis it's logically a
subset of, especially when nothing in the prompt forces an explicit base-rate computation. Forcing the
conjunction rule as an explicit check (does this hypothesis strictly imply a plainer one, and if so, is
it rated as more probable than that plainer one?) is a cheap, mechanical guard against exactly this
failure mode, in a model or in yourself.

**Where this goes:** representativeness and availability are examples of a fast, effortless,
often-right kind of judgment overriding careful calculation. Next lesson names that split explicitly —
"fast, automatic" versus "slow, deliberate" reasoning — and asks what precise machinery, already built
in this track, that split is actually standing in for.
