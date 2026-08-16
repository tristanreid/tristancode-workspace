---
title: "Solution: Why Your 100th Repetition Barely Feels Faster Than Your 90th"
description: "T_16 = 3 seconds — and each 16x jump in practice keeps halving the absolute time saved, the numerical signature of diminishing returns baked into the power law."
lesson_number: 18
track: cog
concept: "The power law of practice; what gets faster and what doesn't"
stage: 4
layout: solution
role: solution
builds_on: [10, 17]
skin: chalkboard
resources:
  - title: "Newell & Rosenbloom (1981) — 'Mechanisms of Skill Acquisition and the Law of Practice'"
    url: https://www.cs.cmu.edu/~mm/courses/15889s07/readings/Newell81.pdf
    note: "the classic paper establishing the power law of practice as a robust cross-task regularity"
---

### Numeric answer: T_16 = 3 seconds

```
T_16 = T_1 / √16 = 12 / 4 = 3
```

---

### Part 2 — The shrinking-savings pattern

```
T_4   = 12 / √4   = 12 / 2  = 6.00
T_16  = 12 / √16  = 12 / 4  = 3.00
T_64  = 12 / √64  = 12 / 8  = 1.50
T_256 = 12 / √256 = 12 / 16 = 0.75
```

Absolute drops between consecutive 16×-practice steps:

```
T_4  → T_16:  6.00 − 3.00 = 3.00
T_16 → T_64:  3.00 − 1.50 = 1.50
T_64 → T_256: 1.50 − 0.75 = 0.75
```

Each 16×-more-practice step **halves the absolute time saved by the previous step** — 3.00, then
1.50, then 0.75. The *relative* improvement (each step still cuts time by the same factor, 4×,
since √16 = 4) stays constant, but the *absolute* number of seconds gained keeps shrinking. This is
exactly the diminishing-returns signature of a power law: proportional improvement per proportional
increase in practice, but ever-smaller absolute payoff — which is why a beginner feels dramatic
week-to-week gains while an expert's improvement becomes nearly imperceptible trial-to-trial, even
though (measured relatively) they may still be improving at a mathematically similar rate.

---

### Part 3 — The floor the power law can't cross

The power law `T_N = T_1 × N^(−α)` predicts `T_N → 0` as `N → ∞`, which is physically impossible —
no human task has zero execution time. Real practice curves flatten out and approach (but never
cross) a nonzero **asymptote**, not literal zero. Concrete lower bounds, depending on the task:

- **Motor/physical limits**: nerve conduction velocity, muscle contraction speed, and biomechanical
  constraints set a hard floor on how fast any physical movement (a keystroke, a swing, a step) can
  physically execute, no matter how automatized the underlying skill becomes.
- **Perceptual/processing limits**: tasks requiring visual identification or decision-making are
  bounded by basic neural processing time — the minimum time for a stimulus to be perceived and
  acted on, which doesn't shrink to zero regardless of practice.

The full, more accurate form researchers actually fit is often `T_N = T_∞ + (T_1 − T_∞) × N^(−α)` —
an added asymptote term `T_∞` (the floor) that the pure `T_N = T_1 × N^(−α)` form in this lesson
simplified away for clean arithmetic. As `N` grows large, `T_N` approaches `T_∞`, not zero.

---

### Part 4 — Power-law scaling and diminishing returns in AI training

If model performance improves as a power-law function of training compute (as neural scaling laws
broadly describe), the same diminishing-returns logic applies directly: each *additional* fixed
increment of performance improvement requires an ever-larger multiplicative increase in compute to
purchase — going from "mediocre" to "good" might take 10× the compute of getting started, but going
from "good" to "slightly better than good" might take another 10× on top of that for a much smaller
absolute gain, mirroring Part 2's shrinking absolute drops exactly.

Why this matters for real decisions: at some point on the curve, the compute cost of squeezing out
the next small increment of performance via scale alone becomes so large that it stops being the
most efficient lever — better/cleaner training data, an improved architecture, or an entirely
different technique can potentially buy a comparable performance gain far more cheaply than another
order-of-magnitude compute increase would. Recognizing "we're on the flat part of a power-law curve"
is exactly the signal that it's time to look for a different lever, not just spend more on the same
one — which is precisely the practical, resource-allocation reading of "diminishing returns" that
Part 2's arithmetic made visible.

---

### The pattern

| Trial N | T_N (T_1=12, α=0.5) | Absolute drop from prior 16x-step |
|---|---|---|
| 1 | 12.00 | — |
| 4 | 6.00 | — |
| 16 | 3.00 | 3.00 |
| 64 | 1.50 | 1.50 |
| 256 | 0.75 | 0.75 |

**Rule**: performance time falls off as a power function of practice — big early gains, shrinking
later gains, approaching (never reaching) a physical/perceptual floor. It's one of the most
reliable quantitative laws in cognitive science, and it emerges directly from ACT-R's activation
mechanism rather than being a separate empirical patch on the architecture.

**Where this goes:** next lesson asks what's actually changing *inside the system* as this curve
plays out — expertise as chunking plus retrieval, using the classic de Groot chess studies that
first revealed what separates a novice's memory from a grandmaster's.
