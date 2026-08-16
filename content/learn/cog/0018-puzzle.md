---
title: "Why Your 100th Repetition Barely Feels Faster Than Your 90th"
description: "Practice doesn't make you faster at a constant rate — it makes you faster by a predictable, shrinking amount each time. Compute the curve."
lesson_number: 18
track: cog
concept: "The power law of practice; what gets faster and what doesn't"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [10, 17]
skin: chalkboard
numeric:
  question: "Power law of practice: T_N = T_1 / √N (time on trial N, given time on trial 1). If T_1 = 12 seconds, what is T_16, in seconds?"
  answer: 3
  tolerance: 0.1
  unit: "seconds"
---

Lesson 17 established procedural memory as a system that improves with repetition, distinct from
declarative memory. This lesson gives that improvement a precise mathematical shape — one of the
most robust quantitative regularities in all of cognitive psychology.

**Terms (standalone):**

- **The power law of practice**: the empirical finding that performance time on a task decreases
  with practice according to a **power function** of the number of trials: `T_N = T_1 × N^(−α)`,
  where `T_N` is the time to perform the task on trial `N`, `T_1` is the time on the very first
  trial, and `α` (alpha) is a task-specific learning-rate constant (typically between roughly 0.2
  and 0.6 for real tasks). This holds astonishingly well across an enormous range of tasks — from
  cigar rolling to mental arithmetic to typing to playing Tetris — and across a huge range of `N`,
  from a handful of trials to tens of thousands.
- **Diminishing returns**: the direct consequence of the power-law shape — the *absolute* speedup
  from one additional trial shrinks as `N` grows. Going from trial 1 to trial 2 buys a large
  reduction in time; going from trial 1,000 to trial 1,001 buys almost nothing, even though the
  *relative* improvement per doubling of practice stays roughly constant (that constant-relative,
  shrinking-absolute pattern is the hallmark of any power law).
- **Log-log linearity**: if you plot `log(T_N)` against `log(N)`, a power-law relationship produces
  a **straight line** — this is the classic diagnostic researchers use to confirm a power law is the
  right fit to practice data (as opposed to, say, an exponential curve, which would instead look
  straight on a plot with only the y-axis logged).
- **Why ACT-R predicts this, not just observes it** (connecting to Lesson 10): ACT-R's base-level
  activation formula for a chunk includes a term that sums decayed contributions from every past use
  of that chunk, and that summation — worked out mathematically — produces power-law-shaped learning
  curves as a direct consequence, not a separately bolted-on rule. The power law of practice isn't
  just an empirical pattern ACT-R was built to match after the fact; it falls out of the same
  activation mechanism used for ordinary memory retrieval.

### Part 1 — Numeric (above): compute a point on the curve

Using the simplified form `T_N = T_1 / √N` (i.e., `α = 0.5`), with `T_1 = 12` seconds: what is
`T_16`, the time on the 16th trial?

---

### Part 2 — Diminishing returns, made concrete

Using the same formula (`T_1 = 12`, `α = 0.5`), compute `T_4`, `T_16`, `T_64`, and `T_256` — each is
16× the trial count of the previous. Look at the *absolute drop* in time between each consecutive
pair (`T_4 → T_16`, `T_16 → T_64`, `T_64 → T_256`). Does each 16×-more-practice step buy the same
absolute time savings, or does the savings shrink? Describe the pattern.

---

### Part 3 — Reveal: what does NOT follow this curve indefinitely?

The power-law improvement in *time* cannot continue forever down toward zero — there's a floor.
Name at least one concrete lower bound on how fast a human can perform a real skilled task (e.g.
typing, a sport, playing an instrument), and explain what kind of limit it is (motor/physical,
perceptual, or something else) — i.e., what stops the power law from predicting an impossible
result at very large `N`.

---

### Part 4 — Connect to modern AI training

**Neural network training** (relevant to the ml track, and worth naming here since cognitive
architectures and modern ML both show power-law learning curves) also famously shows power-law-like
relationships between performance and training data / compute / model size — the so-called "neural
scaling laws." Given this lesson's diminishing-returns logic, what does a power-law relationship
between training compute and model performance imply about the cost of squeezing out each
*additional* increment of performance, as a system gets more capable? Why might that matter for
deciding when more training compute stops being worth it, versus other investments (better data,
better architecture)?
