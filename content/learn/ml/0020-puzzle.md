---
title: "Attention's Real Advantage Isn't Accuracy — It's Span"
description: "An RNN must finish step 1 before it can start step 2. A transformer's attention layer doesn't have that constraint. Quantify exactly how much shorter its critical path is."
lesson_number: 20
track: ml
concept: "Why transformers parallelize: work vs. span, and vanishing gradients revisited as the cost this avoids"
stage: 6
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [3]
skin: chalkboard
numeric:
  question: "How many times shorter is the transformer's span than the RNN's, rounded to one decimal place?"
  answer: 41.7
  tolerance: 0.5
  unit: "x"
---

**Quick retrieval, before the main puzzle** (lesson 3's idea, a new setting): you fit degree-1,
degree-4, and degree-15 polynomials to 12 noisy sensor readings. Without recomputing anything —
just from the shape lesson 3 established — what do you expect for test error as degree climbs, and
why in one line? Hold your answer; the solution confirms it.

Now the main event. Two ways to build a network that processes a sequence of tokens (words,
timesteps, whatever): a **recurrent neural network (RNN)** and a **transformer**, the architecture
behind most modern language models. Set aside accuracy for a moment and ask a pure computer-science
question: given unlimited parallel processors, how fast could each one possibly run?

Borrow two ideas from cost-model analysis: **work** is the total amount of computation performed,
summed across everything; **span** is the length of the longest chain of steps that must happen in
strict order — the critical path. More processors can shrink wall-clock time toward the *work*
divided by the processor count, but never below the *span*: some things simply have to wait for
other things to finish first, no matter how many processors you throw at it.

**An RNN's structure.** At each timestep, it computes a new hidden state from the *previous* hidden
state and the current input: `h_t = f(h_{t-1}, x_t)`. Step 5 cannot start before step 4 finishes,
which cannot start before step 3 finishes, and so on, for every one of the sequence's positions —
a strictly sequential chain. For a sequence of length `n = 500`, the span is `500` sequential steps,
no matter how many processors are available.

**A transformer layer's structure.** Self-attention computes, for every position, a comparison
against every other position — but none of those pairwise comparisons within one layer depends on
another; they can all run at once, given enough processors. Ignore the (small, `log n`) span of the
softmax normalization step for this exercise. A full transformer stacks `L = 12` such layers, and
layer 2 does have to wait for layer 1 to finish (that dependency is real and sequential) — but that's
only 12 steps total, regardless of how long the sequence is.

**Your task.** For `n = 500` and `L = 12`, compute the RNN's span and the transformer's span (in
sequential steps), then report how many times shorter the transformer's span is, rounded to one
decimal place.
