---
title: "Solution: Attention's Real Advantage Isn't Accuracy — It's Span"
description: "41.7x shorter span — and a second, independent payoff: a short span means a short backward pass, which is exactly what keeps gradients from vanishing over long sequences."
lesson_number: 20
track: ml
concept: "Why transformers parallelize: work vs. span, and vanishing gradients revisited as the cost this avoids"
stage: 6
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
resources:
  - title: "3Blue1Brown — Attention in transformers, visually explained"
    url: https://www.3blue1brown.com/lessons/attention
    note: "the query/key/value mechanism this lesson's parallelism claim rests on"
---

**Retrieval check.** Test error falls from degree 1 to degree 4 (more flexibility fits the real
signal better) then rises sharply by degree 15 (a U-shape) — a model with far more parameters than
the 12 points can support starts fitting noise, not signal, exactly as lesson 3's curve predicts.
Same shape, new degrees, new dataset size.

**Main answer: 41.7x.** RNN span = `n = 500` sequential steps. Transformer span = `L = 12`
sequential steps (each layer waits for the previous layer, but every position-pair comparison
*inside* a layer runs simultaneously). `500 / 12 ≈ 41.67`, rounding to **41.7x**.

**Why this is the real story, not accuracy.** An RNN's hidden state at position 500 genuinely can't
be computed before its hidden state at position 499 exists — that dependency is baked into the
architecture's definition, not a limitation of current hardware. Give an RNN a million GPUs and step
500 still has to wait for step 499. A transformer layer's all-pairs comparisons have no such
dependency *within* the layer — they're what lesson 24 (attention as a soft lookup) computes for
every position at once, so a big enough cluster can, in principle, compute an entire layer's worth
of comparisons in the time it takes to do one. The dependency chain a transformer *does* have (layer
2 needs layer 1's output) is dramatically shorter — `12`, not `500` — and doesn't grow at all as the
sequence gets longer, which is the property that actually matters at scale: double the sequence
length and the RNN's span doubles right along with it, while the transformer's span doesn't move.

**The honest cost, so this isn't "attention is free."** Shrinking span isn't free — it's a genuine
trade for more **work**. An RNN's total work is roughly proportional to `n` (one step's worth of
computation per token). Self-attention's total work is roughly proportional to `n²` (every position
compares against every other position), which for `n = 500` is a real, substantial multiplier —
250,000 pairwise comparisons per layer instead of 500 sequential steps' worth of work. Transformers
don't parallelize by doing less; they parallelize by restructuring a long sequential chain into a
much shorter chain of much wider parallel steps, and they pay for that restructuring in total
operation count. This is exactly the fp track's own trade, met from the other side: fp's Stage 7
capstone re-derives a sequential fold as map/reduce/scan and asks you to analyze the result's work
and span — attention is that same move, applied to sequence modeling, with the identical shape of
tradeoff (more total work, shorter critical path) and the identical payoff (wall-clock time that
doesn't scale with `n` the way a sequential chain's does).

**The compressed callback: vanishing gradients, from a second angle.** Training an RNN means
backpropagating through *time* — walking that same length-`n` chain backward, multiplying one local
derivative per step, exactly the chain-rule mechanism you've already worked through by hand.
Recall the bound: each step through a sigmoid-style unit can shrink a gradient by up to 4x (its
derivative caps at 0.25). Over `n = 500` sequential steps, that's on the order of `(0.25)^500` —
not just small, but numerically indistinguishable from zero on any real machine. A gradient meant to
tell an early timestep how it affected a much-later loss arrives having been multiplied by hundreds
of small factors in a row, and vanishes before it can teach the model anything about long-range
dependencies. A transformer's backward pass walks its *span* — 12 layers, not 500 timesteps — so the
chain of multiplications is dramatically shorter, and the same shrinkage bound, applied 12 times
instead of 500, stays numerically usable. Short span isn't just a speed win; it's also a training-
stability win, for the same underlying reason.

**Where this goes:** span explains why a transformer *runs* fast at a given size. The next lesson
asks the question that follows naturally from having cheap parallel compute available: once you can
afford to make the model bigger, train it on more data, or just run more compute — which of those
three actually buys you a better model, and by how much?
