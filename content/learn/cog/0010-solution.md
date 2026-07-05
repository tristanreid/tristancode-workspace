---
title: "Solution: The Number Behind Forgetting"
description: "B ≈ -1.386 — and why ACT-R's rational-analysis argument says that decay is memory doing its job, not failing at it."
lesson_number: 10
track: cog
concept: "ACT-R: spreading activation & base-level decay"
stage: 2
layout: solution
role: solution
builds_on: [9]
skin: chalkboard
resources:
  - title: "Anderson & Schooler (1991) — Reflections of the Environment in Memory (Psychological Science)"
    url: https://www.cmu.edu/dietrich/psychology/people/core-training-faculty/documents/anderson.reflections-of-environment.1991.pdf
    note: "the original rational-analysis argument — memory statistics tracked against real-world need statistics"
---

**B = −0.5 × ln(16) = −0.5 × 2.773 ≈ −1.386.**

A negative activation isn't a special failure state — it's just a number on a continuous scale
that feeds into a retrieval-probability formula (a logistic function of B, in the full
architecture): the more negative, the slower and less reliable the retrieval, down to outright
failure. Compare a chunk used **1 day** ago instead: B = −0.5 × ln(1) = −0.5 × 0 = **0**, clearly
stronger. The Grünfeld's name, at 16 days cold, sits well below that — retrievable, but sluggish,
exactly the "it's on the tip of my tongue" feeling.

**Why decay is *rational*, not a design flaw.** This is ACT-R's most provocative empirical claim,
from Anderson & Schooler's 1991 rational analysis: memory's actual forgetting curve (fast initial
decay, long slow tail — a power law) matches, almost exactly, the *statistics of when information
actually becomes needed again* in the real world. Words that appeared in a newspaper headline
yesterday are far more likely to reappear today than a word from a headline a year ago; email you
received an hour ago is far likelier to be relevant right now than email from three years back.
A memory system that keeps *everything* equally retrievable forever is not obviously better — it
pays a retrieval-time and interference cost on every single lookup, searching a haystack that's
mostly hay you'll never need again. Decaying activation is a bet, tuned by evolution and daily
use, that recency and frequency of *past* use predict *future* need — and empirically, for most of
what a mind encounters, that bet pays off. Forgetting the Grünfeld's name isn't memory
malfunctioning; it's memory correctly downgrading something increasingly unlikely to matter today,
freeing retrieval effort for what's more likely to.

**Spreading activation is the correction for when that bet would otherwise fail**: base-level
decay alone would leave the Grünfeld equally hard to retrieve *regardless of context* — but the
moment the player sits down for a chess game (goal context now includes "chess," "openings"),
spreading activation from those active chunks boosts every chess-adjacent chunk, the Grünfeld
included, faster than base-level decay alone would predict. The two mechanisms together explain
something base rate alone can't: why a stale memory can suddenly feel instantly available the
moment the right context shows up — cue-dependent retrieval, not just time-dependent decay.

**Where this goes:** ACT-R modeled the *mind's own memory dynamics* as an architecture. SOAR, its
great rival cognitive architecture, was built from a different first commitment — that all
cognition is *problem-space search* — and reaches surprisingly similar territory from the opposite
direction. That comparison starts next stage.
