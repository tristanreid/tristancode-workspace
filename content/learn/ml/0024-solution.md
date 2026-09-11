---
title: "Solution: The Ticket: Something's Wrong With Production"
description: "5.1 points of the drop are unexplained by prevalence alone — and the offhand comment about the split was a live leakage red flag the whole time."
lesson_number: 24
track: ml
concept: "Capstone: diagnosing a broken pipeline from evidence, using every failure mode this run covered"
stage: 7
layout: solution
role: solution
builds_on: [17, 18, 23]
skin: chalkboard
resources:
  - title: "Kaggle Learn — Data Leakage"
    url: https://www.kaggle.com/code/alexisbcook/data-leakage
    note: "a second pass at the leakage taxonomy this capstone leans on"
---

**Retrieval check.** `w1 = 0 − 0.6 × 2×(0−4) = 0 − 0.6×(−8) = 4.8`.
`w2 = 4.8 − 0.6 × 2×(4.8−4) = 4.8 − 0.6×1.6 = 4.8 − 0.96 = 3.84`. Distance from the true minimum
(`w = 4`) went `4 → 0.8 → 0.16` — shrinking each step, oscillating but **converging** (contrast this
with lesson 6's original example, where the trace diverged; here the smaller effective step relative
to the curve's steepness keeps it stable).

**Part 1, worked out.** `TPR/FPR = 0.60/0.09 ≈ 6.667` — the fixed likelihood ratio. At **8%**
prevalence: prior odds `= 0.08/0.92 ≈ 0.0870`; posterior odds `≈ 0.0870 × 6.667 ≈ 0.580`; precision
`≈ 0.580/1.580 ≈ 36.7%` — matching the ~37% the validation report has shown all along, which is
itself a clue: the validation set's prevalence hasn't moved with the market, so its number is stale
by construction, not wrong. At **3%** prevalence: prior odds `= 0.03/0.97 ≈ 0.0309`; posterior odds
`≈ 0.0309 × 6.667 ≈ 0.206`; precision `≈ 0.206/1.206 ≈ 17.1%`.

**On the offhand comment:** yes, it's a red flag on its own, independent of any prevalence math. "A
random 80/20 split on the customer-month table" is precisely the group-leakage setup diagnosed two
lessons ago — the same customer's rows scattered across train and test, letting the model partly
recognize *who* a customer is rather than learn general churn signal. Retraining weekly on this split
doesn't fix that; it repeats it every single week. This alone would inflate whatever precision the
model reports on its own internal validation slice, on top of anything else going on — worth flagging
regardless of what the final numbers turn out to show.

**Part 2, graded: 5.1 percentage points.** Prevalence alone predicts precision falling to about
**17.1%** at 3% prevalence — a real, expected drop from 36.7%, purely from the mechanism lesson 17
built (fixed TPR/FPR, more negatives per positive as fraud gets rarer, even though nothing about the
model itself changed). Observed production precision is **12%**. `17.1 − 12 = 5.1` points of the
drop are **not** explained by the prevalence shift — something else is also degrading performance.

**What the 5.1-point gap is actually pointing at.** It's not proof of any single cause, but it rules
out "prevalence shift alone" as a complete explanation, and the evidence on hand suggests where to
look: (1) the group-leakage risk from the weekly-retrained random split means the *validation*
number (37%) may itself be inflated relative to true generalization, making the real starting point
lower than 37% even before prevalence moved, which alone could account for some of the extra gap;
(2) TPR and FPR were *asserted* stable by a colleague, not verified against current production data —
if the retention campaign changed *who* churns (not just how many), the model's actual TPR/FPR could
have quietly shifted too, which is lesson 17's own distribution-shift cousin: a model meeting a world
that moved, not just a smaller world.

**The Goodhart angle, worth naming out loud.** "Churn prevalence fell from 8% to 3%, and everyone's
treating this as unambiguous good news" is exactly the shape of last lesson's trap: the campaign's
target metric (churn rate) improved, which is being read as "the model and the business are both
fine," without checking whether the thing that actually matters — correctly identifying which
*specific* customers are at risk, so retention efforts get pointed the right way — is still working.
A precision collapse from 37% to 12% means the majority of "at-risk" alerts are now false alarms; if
retention outreach is being spent chasing them, the campaign's own success is quietly degrading the
model that's supposed to help sustain it.

**The full diagnostic habit, named explicitly.** Every failure mode this run covered is a version of
one discipline: before trusting a number — a metric, a validation score, a "good news" headline —
check what actually produced it. Leakage asks whether the number secretly saw the future. Imbalance
asks whether the number's baseline moved out from under it. Calibration asks whether a stated
confidence means what it claims. Goodhart asks whether the number stopped measuring the thing it
used to measure the moment someone started optimizing it. None of these questions has a universal
one-line test; all of them share the same first move — go find out what actually generated the
number, rather than reading it off a dashboard and trusting it.

**Where this goes:** this closes the current run. The stages this batch didn't reach — the neural-
network and embedding groundwork underneath attention, and the rest of the parallel-architecture
story — pick back up once there's room further down the queue; for now, the skill this run built is
durable regardless of what comes next: a working habit of distrust toward any number until you've
checked what produced it.
