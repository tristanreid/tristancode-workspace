---
title: "Solution: Locality vs. Lookup: What Each Architecture Bets On"
description: "Convolution bets that relevant information is nearby and position-agnostic; attention makes no distance assumption and learns relevance from content instead."
lesson_number: 21
track: ml
concept: "What convolutions and attention each assume about structure"
stage: 4
layout: solution
role: solution
builds_on: [18]
skin: chalkboard
resources:
  - title: "distill.pub"
    url: https://distill.pub/
    note: "visual essays on convolution, receptive fields, and attention mechanics"
---

**Option 2.** Convolution isn't slow because of parallelism (option 1 is backwards — convolutions
parallelize beautifully, that's a large part of why CNNs were practical early on) and it isn't limited
to images by definition (option 3 — 1D convolutions run over sequences too, they just carry the same
locality bet). And no architecture wins everything unconditionally (option 4) — that's exactly the
kind of claim this lesson is arguing against.

**Why the pronoun task breaks convolution's bet.** A stack of convolutional layers *can* eventually
connect distant positions — each layer widens the effective "receptive field" a little, so stacking
enough of them lets information from far away eventually reach a given position. But that reach is
built entirely out of *local* steps chained together, and it costs depth: connecting positions 40
apart takes roughly 40-worth of local hops (fewer with clever dilation tricks, but the shape of the
problem doesn't change). Worse, the pattern convolution detects at each hop is the *same* pattern
applied everywhere (that's translation invariance), which fights against a task where what matters is
specific *content* — "does this word grammatically match the gender and number of that word" — not a
generic local shape. Nothing about "nearby" or "same everywhere" helps here; the antecedent could be
adjacent or forty words back, and which one is right depends on the two words themselves, not their
distance.

**Why attention doesn't have this problem.** Attention computes a relevance score between every pair
of positions directly — position 40 is exactly as reachable from position 1 as position 2 is, in a
single step, with no chain of local hops needed. And the score is learned from the *content* at each
position (what the words actually are), not from a fixed template applied identically everywhere. That
matches the task: "which earlier word does this pronoun refer to" is precisely a question about
content-dependent, distance-independent relevance.

**The honest tradeoff.** This isn't "attention is strictly better." Attention's all-pairs comparison
costs more compute (it scales with the *square* of sequence length, since every position compares
against every other), and it throws away a genuinely useful prior — locality — when the data actually
*does* have local structure, like images. That's why convolutions remain excellent, efficient choices
for image-shaped data, and why modern architectures often mix both: local convolutional features feeding
into global attention, or vice versa. The lesson isn't "pick a winner" — it's "match the architecture's
built-in assumption to the shape of the problem."

**Where this goes:** Stage 4 closes here — perceptrons, depth, backprop, why training works, and now
the two dominant ways of deciding what to combine. Stage 5 turns to what gets *represented*: how things
become vectors in the first place, and what it means for two of those vectors to be close together —
the foundation attention's "relevance score" is actually built on.
