---
title: "Solution: The Metric Went Up. The Goal Didn't."
description: "resolution_time got 29.2% worse while the tracked metric improved 91.7% — the two numbers moving in opposite directions is Goodhart's law, not a data error."
lesson_number: 23
track: ml
concept: "Goodhart's law: optimizing the metric vs. the goal"
stage: 7
layout: solution
role: solution
builds_on: [12]
skin: chalkboard
resources:
  - title: "Google's ML Crash Course"
    url: https://developers.google.com/machine-learning/crash-course
    note: "practical framing of proxy metrics and objective misalignment in production ML"
---

**Retrieval check.** The two features carry overlapping information; a model only needs one good way
to make a split, so whichever gets used first at each split earns most of the importance credit,
leaving its correlated twin looking nearly useless. `ip_reputation_score` is **not** proven
irrelevant — it's just redundant with a feature that happened to get picked first. Same mechanism,
new pair of features.

**Main answer: +29.2%.** `(620 − 480) / 480 = 140 / 480 ≈ 0.2917 → 29.2%` worse. Meanwhile TTFR
improved `(240 − 20) / 240 ≈ 91.7%`. One number moved dramatically in the "good" direction; the thing
it was supposed to be a stand-in for moved substantially in the *bad* direction, at the same time,
from the same underlying change in agent behavior.

**The mechanism, precisely.** TTFR was never the goal — it was a **proxy**, chosen because "replies
fast" and "actually helps customers" were correlated *under normal conditions*, where agents weren't
specifically trying to game the number. Turning TTFR into a scored target changed the conditions:
now there's an incentive to find the cheapest possible way to make TTFR small, and an instant canned
auto-reply is exactly that — it satisfies the letter of "responded quickly" while doing zero work
toward the goal the metric was supposed to represent. Every minute an agent spends drafting that
instant reply is also a minute *not* spent working the actual queue, which is the direct mechanical
reason `resolution_time` got worse, not just stayed flat — optimizing the proxy actively traded away
resources from the real goal.

**Why this isn't a data-quality problem, and can't be caught by more careful measurement of TTFR.**
The TTFR number is completely accurate — replies really did go out in 20 minutes on average. There's
no bug to fix in how it's computed. The failure is structural: *any* proxy metric, once it becomes a
target that people (or a model) actively optimize against, is at risk of having the gap between "the
proxy" and "the goal" widen exactly where the optimization pressure is strongest. The fix isn't a
better TTFR calculation — it's tracking the actual goal (`resolution_time`, CSAT) alongside the proxy,
and treating any divergence between them as the real signal, not treating the proxy's improvement as
success on its own.

**Why this is the same shape as overfitting to a validation set, generalized.** Stage 3's evaluation
lessons all warned against trusting a number a model reports about itself without checking what
produced it. Goodharting is that same warning applied to *any* fixed measurement, model metrics
included: a model selected, tuned, or early-stopped purely by chasing one validation number, over
enough iterations, can start fitting quirks of that specific validation set rather than the
underlying task — validation-set overfitting is Goodhart's law, applied by a person (or an automated
search) to their own evaluation pipeline. And it's exactly what the bayes track's calibration logging
habit inoculates against: checking a stated confidence against actual outcomes, rather than trusting
the stated number, refuses to let the measure quietly substitute for the goal.

**Where it shows up in ML pipelines specifically.** Any model trained against a *proxy* label — clicks
as a stand-in for "this content was actually useful," watch time as a stand-in for "the user is
satisfied" — is exposed to the same failure once the model's own outputs start shaping what data gets
collected next (a feedback loop): the model gets better and better at maximizing the proxy, and the
gap between the proxy and the real goal can widen invisibly, because the only number anyone's
watching is the one going up.

**Where this goes:** the final lesson in this run hands you a live incident report and asks you to
diagnose which of leakage, imbalance, calibration, and Goodharting — separately or in combination —
actually explains what happened, using nothing but the evidence in front of you.
