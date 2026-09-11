---
title: "Same Data, Either Order"
description: "Update on two batches of evidence in one order, then the other. The posterior lands in the same place either way — and it's worth knowing exactly why, and when it wouldn't."
lesson_number: 19
track: bayes
concept: "Yesterday's posterior is today's prior (order of evidence)"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [10, 15]
skin: chalkboard
numeric:
  question: "Final posterior mean of p, as a decimal, regardless of which order the two batches are processed in?"
  answer: 0.474
  tolerance: 0.005
---

**First, a quick retrieval check — different concept, new setting.**

Two servers, in different data centers, each independently have a 3% chance of failing on any given
day (Lesson 4's independence: learning about one tells you nothing about the other). What's the
probability **at least one** of the two fails today? (Hint: it's easier to find P(neither fails)
first.)

*(Worked out in the solution.)*

---

Lesson 15 gave you the beta-binomial update rule: start with `Beta(α, β)`, observe `k` successes out
of `n` trials, and the posterior is `Beta(α+k, β+(n−k))` — addition of counts. Every worked example so
far updated on one clean batch of data at a time. Real evidence rarely arrives that tidily — it
trickles in across days, sources, and reports.

**Setup.** You start with prior `Beta(2, 3)` (a mild pull toward lower rates — 2 virtual successes, 3
virtual failures). Two batches of real evidence exist, and you don't get to choose which one shows up
first:

- **Batch A**: 5 successes, 3 failures (8 trials)
- **Batch B**: 2 successes, 4 failures (6 trials)

**Part 1 — Process A, then B.** Starting from `Beta(2,3)`, update on Batch A to get an intermediate
posterior. Treat *that* as your new prior, and update on Batch B. Write down the final `Beta(α, β)`
and its mean.

**Part 2 — Process B, then A.** Start over from `Beta(2,3)` again, but update on Batch B first, then
treat that result as your prior and update on Batch A. Write down this final `Beta(α, β)` and its
mean.

**Part 3 — Compare (the numeric answer above).** Are the two final posteriors identical? Give the
shared posterior mean as a decimal. In one sentence, say *why* — what property of "just add counts"
guarantees the order genuinely can't matter here?

**Part 4 — Break it.** Order-independence quietly assumes something: that both batches are evidence
about the *same*, fixed underlying rate `p`. Describe a realistic scenario where Batch A and Batch B
come from a system whose true rate actually **changed** between the two batches — and explain why
"just add up all the counts, order doesn't matter" would then be the wrong thing to do, even though
the arithmetic would run exactly the same way and produce a number that looks equally confident.
