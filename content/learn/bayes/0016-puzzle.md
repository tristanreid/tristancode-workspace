---
title: "The Ordering Doesn't Vanish, It Cancels"
description: "A likelihood ratio between two hypotheses isn't about which sequence is 'more special' — it's a ratio, and the ordering count cancels out of it exactly."
lesson_number: 16
track: bayes
concept: "Binomial likelihood as a ratio between hypotheses"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [9, 13]
skin: chalkboard
numeric:
  question: "Likelihood ratio for p = 0.75 vs p = 0.5, given 6 heads in 8 flips. Answer to 3 decimal places."
  answer: 2.848
  tolerance: 0.01
---

**First, a quick retrieval check — a concept from a few weeks back, in a new setting.**

An outage-triage bot flags deploys as "likely cause" of an incident. Historically, 2% of all deploys
ever cause an outage (the base rate). When a deploy really did cause the outage, the bot flags it 95%
of the time. When a deploy is innocent, the bot still flags it 10% of the time (false alarms happen).
The bot flags today's deploy. What's P(this deploy actually caused the outage | flagged)? Work it out
before reading on — Lesson 7's base-rate machinery, just relocated.

*(Answer, worked out, is in the solution — don't skip checking it.)*

---

Lesson 13 introduced the **binomial likelihood**: for a fixed candidate rate `p`, how probable was
the data you saw. It also introduced `C(n, k)` — the count of orderings that produce `k` heads out
of `n` flips — as part of the formula:

> P(k heads in n flips | p) = C(n, k) · p^k · (1−p)^(n−k)

Today's puzzle targets a specific, very common failure mode with that formula: using it to compare
**two competing hypotheses about `p`**, on the **same observed data**.

**A colleague's claim.** You flip a coin 8 times and see this exact sequence:
`H H T H H H T H` — 6 heads, 2 tails, in that specific order. You suspect the coin might be biased
toward heads (`p = 0.75`) rather than fair (`p = 0.5`). Your colleague says: *"We saw one unique,
specific sequence of flips. Every unique sequence of 8 flips is equally probable, so the number of
orderings — that `C(8, 6)` term — doesn't actually matter here. Just compare `0.75` to `0.5` directly
and forget the combinatorics."*

**Is the colleague right?** Work through these two checks before computing the main answer:

**Check A — same composition, different order.** Take two *different* orderings that both have 6
heads and 2 tails — say `H H T H H H T H` and `H T H H H H T H`. Under `p = 0.75`, is
P(first exact sequence) equal to P(second exact sequence)? (They have the same number of heads, just
rearranged.)

**Check B — different composition.** Now take a sequence with 6 heads, 2 tails, and compare it to a
*different* specific sequence with only 2 heads, 6 tails — same length (8 flips), different
composition. Under `p = 0.75`, is P(the 6-heads sequence) equal to P(the 2-heads sequence)? Compute
the ratio between them.

Your colleague's claim ("every unique sequence is equally probable") is really a claim about Check B,
generalized incorrectly from something true about Check A. Sort out which check supports the claim
and which one refutes it.

**Now the main question.** Compute the **likelihood ratio** comparing `p = 0.75` against `p = 0.5`,
for the observed data (6 heads, 2 tails, in the specific order given):

> LR = P(data | p = 0.75) / P(data | p = 0.5)

Do this two ways: (1) using the *specific-sequence* probability (no `C(n,k)` at all — just
`p^6(1−p)^2` for each hypothesis), and (2) using the *count-of-heads* probability (with `C(8,6)` in
both numerator and denominator). Confirm both ways give the same ratio, and see exactly why `C(8,6)`
was never doing any work in a ratio between hypotheses, even though it mattered enormously in Check B
above.
