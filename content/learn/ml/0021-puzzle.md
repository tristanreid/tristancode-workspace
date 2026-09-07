---
title: "Locality vs. Lookup: What Each Architecture Bets On"
description: "Convolutions and attention both let a network combine information across positions — but they encode opposite bets about where relevant information lives. Which bet fits which data?"
lesson_number: 21
track: ml
concept: "What convolutions and attention each assume about structure"
stage: 4
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [18]
skin: chalkboard
mcq:
  question: "A convolutional layer only looks at a small, fixed-size neighborhood around each position (and slides the same weights across every position). An attention layer lets every position look at every other position, weighted by a learned relevance score. You're choosing an architecture for a task where a word's meaning can depend on another word 40 tokens earlier or later, with no fixed distance pattern (pronoun resolution across a long paragraph). Which best describes why convolution alone is a poor structural fit here, and attention isn't?"
  options:
    - "Convolution can't be computed in parallel, so it's too slow for long text"
    - "Convolution assumes the information you need is nearby (locality) and that the same local pattern means the same thing wherever it appears (translation invariance) — neither holds when the relevant word could be arbitrarily far away and the relationship is content-specific, not positional; attention makes no locality assumption at all, it just learns which positions to look at"
    - "Convolution only works on images, not on any kind of sequence"
    - "Attention always outperforms convolution, on any task, so the comparison doesn't matter"
  correct: 1
---

Lesson 18 built up networks by composing simple functions into deeper ones. What it left unspecified
is *how* a layer decides which pieces of its input to combine. Two very different answers to that
question power most of modern deep learning, and each one is a bet about the data's structure — not
a universally better technique.

**Convolution's bet.** A convolutional layer applies the same small filter (say, a 3×3 patch of
weights) at every position in its input, sliding it across the whole thing. Two assumptions are baked
into that design: **locality** — whatever matters for this position is found in a small neighborhood
around it, not far away — and **translation invariance** — a pattern means the same thing no matter
*where* it shows up, so it's worth detecting with the same weights everywhere (an edge is an edge, a
cat's ear is a cat's ear, whether it's in the top-left or bottom-right of the photo). For images, both
assumptions are excellent: pixels next to each other are almost always related, and a shape doesn't
change meaning when it moves across the frame.

**Attention's bet.** An attention layer instead computes, for every position, a relevance score
against *every other* position, then combines information weighted by those scores. There's no built-in
notion of "nearby" at all — position 1 and position 500 start out equally reachable; the model learns
from data which positions actually matter to which, and that relationship is allowed to depend on
*content*, not distance. (Chapter and verse on the mechanism is coming in Stage 6 — for now, the
structural bet is the point.)

**The task on the table:** resolving what a pronoun refers to somewhere in a long paragraph, where the
right answer could be one word back or forty words back, and *which* is right depends on the specific
sentence, not on some fixed offset.

**Your task:** pick the option that correctly explains why convolution's structural assumption is a
poor fit here, while attention's isn't.
