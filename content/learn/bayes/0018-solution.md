---
title: "Solution: Does the Order Evidence Arrives In Matter?"
description: "Beta(6,4) either way, mean 0.6 — because updating is just addition, and addition commutes. The order-independence has a real limit, though."
lesson_number: 18
track: bayes
concept: "Yesterday's posterior is today's prior (order of evidence)"
stage: 3
layout: solution
role: solution
builds_on: [15]
skin: chalkboard
resources:
  - title: "Think Bayes 2 — Chapter 4, Estimating Proportions"
    url: https://allendowney.github.io/ThinkBayes2/chap04.html
    note: "walks through sequential vs batch updating on the same data, free online"
---

**Part 1 — A then B.** `Beta(1,1)` + Batch A (3 succ, 1 fail) → `Beta(4, 2)`. Then `Beta(4,2)` +
Batch B (2 succ, 2 fail) → **`Beta(6, 4)`**. Mean = 6/10 = **0.6**.

**Part 2 — B then A.** `Beta(1,1)` + Batch B (2 succ, 2 fail) → `Beta(3, 3)`. Then `Beta(3,3)` +
Batch A (3 succ, 1 fail) → **`Beta(6, 4)`**. Mean = 6/10 = **0.6**.

**Part 3 — Identical.** Both orders land on exactly `Beta(6, 4)`, mean **0.6**.

**Why.** The beta-binomial update is nothing but addition: `α_new = α_old + successes`,
`β_new = β_old + failures`. Whether you add "3 successes, then 2 successes" or "2 successes, then 3
successes" to `α`, you get the same total — `1 + 3 + 2 = 6` either way. Addition doesn't care what
order its terms arrive in. The posterior only depends on the *total* counts accumulated, never on
the sequence they arrived in. This is why you can equivalently describe the process as: **yesterday's
posterior is today's prior** — every update folds all prior evidence into one distribution, and that
distribution is all the next update needs to know. It doesn't need a log of *how* you got there.

**Where this breaks — and it's worth flagging now, before it bites you.** Order-independence relies
on two things quietly holding: (1) each new batch's likelihood only depends on its own counts (no
batch's trials influence another's outcomes), and (2) `p` itself isn't secretly drifting between
batches. If Batch A came from before a website redesign and Batch B came from after, "combine the
counts" silently assumes both batches are evidence about the *same* fixed `p` — which may be false.
Order stops being irrelevant the moment the thing you're estimating can itself change over time; at
that point you need a model that tracks *when* evidence arrived, not just how much of it there was.
File that away — it's exactly the kind of assumption that's easy to use correctly a hundred times and
then violate silently on the hundred-and-first.

**Where this goes:** next up is **conjugacy** — the beta-binomial update you've been hand-computing
is one instance of a broader pattern (closed-form posterior updates), and there's a whole other
family (normal-normal) that works the same way for a different kind of data.
