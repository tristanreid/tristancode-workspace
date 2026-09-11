---
title: "Solution: Audit This Churn Pipeline Before It Ships"
description: "Three genuine leaks (A, B, E), each a different type, each with a specific fix. Deduplicating to one row per customer is the tempting fix that solves nothing."
lesson_number: 18
track: ml
concept: "Leakage in practice: naming the type, writing the fix, and the prediction-time test"
stage: 3
layout: solution
role: solution
builds_on: [8, 13, 14]
skin: chalkboard
resources:
  - title: "scikit-learn — GroupKFold"
    url: https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupKFold.html
    note: "the actual tool for the group-leakage fix in step E"
---

**Retrieval check.** `dL/dw = 2(w−8) + 6w = 8w − 16 = 0 → w = 2`. The penalty pulls the
unregularized optimum (`w = 8`) a long way toward zero — exactly lesson 8's shape, new numbers.

**Main answer: 3 genuine leaks — A, B, and E.** C and D are fine. Here's each, run through the one
test that matters: *would this value exist, with this value, at the close of month M?*

**A. `total_support_tickets` — temporal leakage.** The join has no date filter, so a row labeled for
month `M` counts tickets filed in `M+1`, `M+2`, and beyond — tickets that, at the moment a real
prediction happens, haven't been filed yet. A customer who churns in `M+1` often files a flurry of
complaints right before leaving; this feature quietly hands the model tickets from *after* the
churn decision, which is a highly predictive but completely unavailable signal at scoring time.
**The fix:** filter the join to `ticket_date <= end_of(M)` before aggregating — a point-in-time
correct, "as-of" aggregate, computed relative to each row's own month, not the whole table at once.

**B. `plan_tier` — temporal leakage, via a non-versioned dimension.** `dim_customers` is overwritten
in place, so a row representing month `M` from three months ago pulls whatever plan the customer
has *today* — not the plan they were on back in month `M`. If a customer downgraded right before
churning, every historical row for that customer now silently shows their *current* (post-change)
plan, contaminating the training signal with information from after the fact. **The fix:** join
against a historized version of the dimension — a slowly-changing-dimension (SCD Type 2) table that
records `plan_tier` alongside its effective date range, and pull the value that was effective as of
`end_of(M)`, not the live row.

**C. `avg_spend_trailing_3mo` — not a leak.** This one is deliberately built to *look* like the
same shape as a leaky rolling window. But months `M-2`, `M-1`, and `M` are all at-or-before the
prediction point — every one of those values genuinely existed by the time a real prediction for
month `M+1` would be made. The organizing test passes cleanly. (This is worth sitting with: a
window feature isn't leaky because it's a window — it's leaky only if the window reaches past the
cutoff. Over-flagging a correctly-lagged feature just because "windows can be leaky" is its own
failure mode, as costly as under-flagging a real one.)

**D. `tenure_months` — not a leak.** `M − signup_month` only ever uses information from the past
(the signup already happened) and the row's own month marker, both trivially known at prediction
time.

**E. The random 80/20 split — group leakage.** The panel has multiple rows per customer across
different months; a plain `randomSplit` scatters one customer's rows across both train and test
independently of each other. A model with any way to key on customer identity (explicit or via a
near-unique combination of features) can partly learn "this specific customer's pattern" from a
training-set row, and get credit at test time for a *different* row of the *same* customer — which
looks like generalization but is really recognition. This is exactly the mechanism lesson 13
introduced for a single split; here it hides inside an otherwise-ordinary train/test call.

**The tempting wrong fix, and why it fails.** "Ensure one row per customer" (deduplicate to a
single row, or aggregate all of a customer's months into one) doesn't touch the actual failure
mode. The problem was never *how many* rows a customer contributes — it's *which set* those rows
land in. Deduplicating a customer down to one row and then splitting randomly still lets a
correlated future customer's row-worth-of-information leak in different ways (and it also throws
away most of the panel's temporal signal, for no safety gained). **The correct fix** is a
group-aware split: `GroupKFold`-style, keyed on `customer_id`, so *every* row belonging to a given
customer lands entirely in train or entirely in test, never split across the boundary — combined,
since this data is also time-ordered, with a time cutoff (train on earlier months, test on later
ones) for the same reason lesson 13 required it.

**The fp-track echo, if you've done that track.** The organizing test here — "does this computation
only depend on information available up to time `M`, not on the whole table" — is the same
discipline as writing a pure function that closes only over its declared inputs. Step A's
unfiltered join is a data-pipeline version of a function secretly reading global mutable state that
happens to include the future: it looks pure (it's "just an aggregate"), but it silently depends on
rows a real point-in-time computation would never have.

**Where this goes:** leakage and imbalance are both cases of a number reporting itself as
trustworthy when it isn't. The next lesson turns to a third: a model's stated confidence, checked by
actually building the calibration curve yourself, from raw pairs, rather than trusting a
pre-aggregated bucket.
