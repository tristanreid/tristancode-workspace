---
title: "Solution: One Table, Three Questions"
description: "Conditioning is zooming: restrict the table to the rows where the condition holds, then count inside."
lesson_number: 2
track: bayes
concept: "Joint, marginal, conditional"
stage: 0
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "Setosa — Conditional Probability, Explained Visually"
    url: https://setosa.io/conditional/
    note: "drag the events around and watch the conditional change"
  - title: "Seeing Theory — Compound Probability"
    url: https://seeingtheory.brown.edu/compound-probability/index.html
---

**P(bug | large) = 24/80 = 0.3.**

The mechanical move is the whole lesson: **conditioning is zooming**. "Given large" means you
discard the small-PR row entirely — those 120 PRs no longer exist for this question — and re-ask
inside the 80 that remain. 24 of those 80 had bugs: 0.3. The denominator changed from 200 (the
whole table) to 80 (the condition's slice). That denominator change *is* conditioning.

Formally, for any events A and B:

    P(A | B) = P(A and B) / P(B)

which in table terms is just: (cell count) / (slice total) — here (24/200) / (80/200) = 24/80. The
200s cancel; conditionals never care about the grand total, only about the slice.

And the number you were told to notice: **P(large | bug) = 24/36 ≈ 0.67**. Same cell on top —
24 large-and-buggy PRs — but a different slice on the bottom. "Given that it was large, was it
buggy?" (0.3) and "given that it was buggy, was it large?" (0.67) are different questions with
different answers, and the *only* difference is which total you divide by.

**The pitfall this sets up:** confusing those two is probably the single most consequential
reasoning error in applied probability — it convicts innocent people ("probability of this
evidence if innocent" read as "probability of innocence") and misreads medical tests. We'll hit
it head-on in a few lessons; for now, the vaccine is the habit of always asking *"which slice am
I standing in?"*

**Where this goes:** rearrange the definition above and you get P(A and B) = P(A | B) · P(B) —
the multiplication rule, next lesson, and one more rearrangement after that is literally Bayes'
theorem. Everything in this track is this table, viewed from different angles.
