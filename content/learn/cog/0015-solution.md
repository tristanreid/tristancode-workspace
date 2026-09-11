---
title: "Solution: Three Stale Uses Beat One Fresh One"
description: "B ≈ 0.445, A = 0 — three moderately-stale retrievals sum to beat one very fresh one, because d exponentiates each use's elapsed time; it never counts uses."
lesson_number: 15
track: cog
concept: "ACT-R base-level activation: summing decay across every past use"
stage: 2
layout: solution
role: solution
builds_on: [9, 10]
skin: chalkboard
resources:
  - title: "ACT-R homepage (Carnegie Mellon)"
    url: http://act-r.psy.cmu.edu/
    note: "reference models and the full activation equation, spreading-activation term included"
  - title: "Anderson & Schooler (1991) — Reflections of the Environment in Memory (Psychological Science)"
    url: https://www.cmu.edu/dietrich/psychology/people/core-training-faculty/documents/anderson.reflections-of-environment.1991.pdf
    note: "the rational-analysis argument behind why this decay shape exists at all"
---

**Retrieval check answer.** Four chunks — one per octet (`192`, `168`, `1`, `100`) — the same move as
lesson 2's `FBI · CIA · NSA · IRS`: recode twelve-ish raw symbols into a handful of familiar units, and
working memory's fixed slot count stops being the bottleneck.

---

### The computation

**Chunk A** (one use, 1 day ago): B = ln(1^−0.5) = ln(1) = **0**.

**Chunk B** (three uses, 2/4/8 days ago) — sum the power-law term for each use, *then* take the log:

- 2 days: 2^−0.5 = 1/√2 ≈ 0.7071
- 4 days: 4^−0.5 = 1/√4 = 0.5000
- 8 days: 8^−0.5 = 1/√8 ≈ 0.3536

Sum ≈ 1.5607. B = ln(1.5607) ≈ **0.445**.

**Chunk B is more active than chunk A — despite every single one of its uses being older than A's only
use.** That's the answer that isn't naive, and it's worth sitting with why: the misconception this
lesson targets is treating d as something that ticks up with each retrieval ("used once, so it's
decayed once"). It doesn't. **d is a fixed exponent (0.5) applied independently to the elapsed time of
each individual use; what changes with more uses is that you get more terms to sum, not a different
value of d.** A single fresh use produces one term close to its maximum (t^−d shrinks as t grows, so
small t → a term near 1); three older uses each produce a smaller term, but three smaller terms summed
can still exceed one larger term — which is exactly what happened here: chunk A's single term is
1^−0.5 = 1, while chunk B's three terms sum to 0.7071 + 0.5 + 0.3536 = 1.5607. B's sum is larger
*before* the log is even applied, so ln(1.5607) ≈ 0.445 comfortably beats ln(1) = 0.

**The general lesson:** frequency compounds; recency alone doesn't dominate it. A chunk retrieved
several times, even if none of those retrievals is recent, can out-rank a chunk retrieved once
yesterday, because activation is driven by the *sum* of use-events, each independently decaying, not
by whichever single use happens to be most recent. This is also why ACT-R's model of learning through
repetition works at all: every additional retrieval — including a *deliberate* one, which is exactly
what next lesson's retrieval practice amounts to — adds one more term to this sum, and the sum is what
determines how retrievable something ultimately is.

**For your harness:** a memory or cache-ranking policy that scores entries by "was this used recently"
(a single boolean or single timestamp) is implicitly assuming the single-use formula. A policy that
sums frequency-weighted, independently-decaying terms per access event — closer to this full
formula — correctly keeps a frequently-hit-but-not-recently-hit key warm, the way chunk B stayed more
retrievable than a single very recent lookup.

**Where this goes:** every additional use in this sum is, mechanically, a retrieval. Next lesson asks
what kind of retrieval counts — and finds that not all "uses" are equal, which is exactly the design
principle behind why this whole puzzle path makes you produce an answer before showing you one.
