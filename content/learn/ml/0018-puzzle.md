---
title: "Audit This Churn Pipeline Before It Ships"
description: "Five steps in a Spark churn pipeline. Some leak the future into training. One tempts you toward a fix that doesn't actually fix anything. Diagnose all five."
lesson_number: 18
track: ml
concept: "Leakage in practice: naming the type, writing the fix, and the prediction-time test"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [8, 13, 14]
skin: chalkboard
numeric:
  question: "How many of the five pipeline steps below are genuine leaks that must be fixed before this model ships?"
  answer: 3
  tolerance: 0
---

**Quick retrieval, before the main puzzle** (lesson 8's idea, new numbers): minimize
`L(w) = (w − 8)² + λw²` with `λ = 3`. Using `dL/dw = 2(w − 8) + 2λw = 0`, what's the optimal `w`?
Hold your answer; the solution confirms it.

Now the main event. Lessons 13–14 named leakage's shapes one at a time — a shuffled time-ordered
split, a feature that only exists after the outcome. Real pipelines mix several shapes together in
one place, and the only reliable filter is a single question, applied to every feature and every
step: **would this value exist, with this exact value, at the moment the model actually has to make
its prediction — before the outcome is known?**

**The setup.** A **customer-month panel**: one row per `(customer_id, month)`, built in Spark. The
label is "did this customer churn in month `M+1`?", and the row's features are supposed to reflect
only what's knowable as of the close of month `M`, the moment a real prediction would be made.
Five steps in the pipeline, as currently written:

**A.** `total_support_tickets`: computed by joining the customer-month table to the full ticket
history table on `customer_id` alone (no date filter) and counting all matching rows.

**B.** `plan_tier`: looked up via a join to `dim_customers`, a table that stores each customer's
*current* plan and is overwritten in place whenever a customer changes plans (no history kept).

**C.** `avg_spend_trailing_3mo`: the average of `spend` over months `M-2`, `M-1`, and `M` — the
three months up to and including the one the row is labeled for.

**D.** `tenure_months`: computed as `M − signup_month`, using the customer's recorded signup date.

**E.** The train/test split: `df.randomSplit([0.8, 0.2], seed=42)` applied directly to the
customer-month panel, row by row.

**Your task.** For each of the five steps, decide: is this a genuine leak, and if so, what *type*
(target, temporal, or group) and what's the actual fix — not "flag it," a concrete change to the
pipeline? Write out your answer for all five before checking the solution. Then answer the graded
question: **how many of the five are genuine leaks that must be fixed?**

(One specific trap: for step E, if you're tempted to fix it by making sure there's "one row per
customer" — hold that thought and check whether it actually addresses what's wrong.)
