---
title: "Solution: The Bet a 90% Interval Makes"
description: "78% nitrogen — and why the width of your interval is a claim you can be graded on."
lesson_number: 11
track: bayes
concept: "Calibration seed: estimation & 90% intervals"
stage: 1
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "Seeing Theory — A Visual Introduction to Probability and Statistics"
    url: https://seeingtheory.brown.edu/index.html
    note: "the visual home base for the distribution ideas coming up next stage"
---

**About 78%.** (Oxygen is ~21%, and the remaining ~1% is mostly argon plus trace gases like CO₂.)

The number itself isn't the point — how your *interval* did is. Three ways this could have gone:

- **Your interval contained 78%, and it wasn't absurdly wide.** Good — that's what calibration
  looks like on a question you had solid but imperfect general knowledge about.
- **Your interval missed.** Worth asking honestly: was your best guess just off, or was your
  interval too narrow around a guess that was reasonable but not exact? Those are different
  failures — the first is a knowledge gap, the second is overconfidence about *how sure* you were.
- **Your interval was enormous (say, 20% to 95%) and "won" by containing the truth.** That's not a
  win. An interval that wide is nearly unfalsifiable — it would have "succeeded" against almost any
  true value, which means it told you almost nothing. Calibration isn't about avoiding misses at
  any cost; it's about intervals that are *exactly as wide as your actual uncertainty*, checked
  against how often they should miss (about 1 in 10 times, no more, no less).

**Why this belongs in a Bayesian-reasoning track and not a trivia track:** a posterior distribution
*is* a calibrated statement of belief — every credible interval you'll compute from here on (Stage
2 onward) makes exactly this same kind of promise ("the true value falls in here with X%
plausibility"), just built from data and a prior instead of general knowledge. Training the raw
skill — stating honest uncertainty, then checking it against reality — on easy trivia now means
you'll trust the harder, math-backed intervals later precisely because you'll have felt, firsthand,
what a well-calibrated interval feels like versus an overconfident one.

**Where this goes:** every several lessons from here, an estimate puzzle will reappear to keep
building your personal calibration log — watch it over time, not just puzzle by puzzle. Next up,
Stage 2 opens with the machinery underneath every posterior you've computed so far: a
**distribution**, formally, as an "answer sheet" assigning plausibility to every possible value at
once.
