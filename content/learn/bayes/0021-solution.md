---
title: "Solution: One Number From a Whole Distribution"
description: "The median (6 days) minimizes expected absolute error — the mean would overpay for a long tail you're not actually penalized extra for."
lesson_number: 21
track: bayes
concept: "Point estimates are loss-function choices"
stage: 4
layout: solution
role: solution
builds_on: [12]
skin: chalkboard
resources:
  - title: "Seeing Theory — Compound Probability"
    url: https://seeingtheory.brown.edu/compound-probability/index.html
    note: "builds intuition for how a distribution's shape drives summary statistics"
---

**The median (6 days).** Your bonus penalty is `|guess − actual|` — absolute error, not squared
error, and not all-or-nothing. That's exactly the loss the median minimizes.

**Why not the mean?** Squared error punishes being *very* far off disproportionately more than
being a little off — a miss of 10 days costs 100 "squared-error units," while a miss of 2 days
costs only 4, a 25x difference for a 5x distance. To avoid ever being very wrong, minimizing squared
error pulls your guess toward wherever the long tail is, even if the tail is rare — because a rare
huge miss is catastrophically expensive under squaring. Your actual penalty (linear, absolute) has
no such fear of being very wrong — 10 days off costs exactly 10x what 1 day off costs, no premium
for extremity. Reporting the mean (8 days) would be optimizing for a penalty structure you don't
actually have; it overweights the long tail of nasty bugs relative to what you're really being
scored on.

**Why not the mode?** The mode (4 days) is the single most *likely* outcome, but "most likely" isn't
the same question as "minimizes expected distance." Under 0/1 scoring — you only win if you guess
the *exact* right number — betting everything on the single most probable outcome is optimal. But
your bonus doesn't require exactness; being off by 1 day only costs a little, so it pays to hedge
toward the middle of the distribution's mass rather than betting everything on its single peak.

**The general rule, restated:** a point estimate isn't a neutral "best guess" — it's the answer to
"which single number minimizes my expected penalty, under the specific way I get penalized?" Change
the penalty, and the "correct" point estimate changes with it, even though the underlying posterior
never moved. Mean, median, and mode agree only when the distribution is symmetric (no skew, no long
tail) — which is exactly why this distinction rarely bites you with simple bell-curve intuitions and
regularly bites you with real-world skewed data: costs, wait times, response times, damages.

**Where this goes:** next lesson turns to *intervals* instead of single numbers — and a related
confusion: a Bayesian credible interval and a classical confidence interval look almost identical on
a page, but claim very different things.
