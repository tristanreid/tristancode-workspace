---
title: "The Ticket: Something's Wrong With Production"
description: "Precision cratered. Retention marketing is claiming credit. A colleague mentions the split casually, like it's nothing. Diagnose how much of this is expected, and how much is a real bug."
lesson_number: 24
track: ml
concept: "Capstone: diagnosing a broken pipeline from evidence, using every failure mode this run covered"
stage: 7
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [17, 18, 23]
skin: chalkboard
numeric:
  question: "How many percentage points of the total precision drop are NOT explained by the prevalence shift alone?"
  answer: 5.1
  tolerance: 0.4
  unit: "pp"
---

**Quick retrieval, before the main puzzle** (lesson 6's idea, new numbers): minimizing
`L(w) = (w − 4)²` with learning rate `η = 0.6`, starting at `w0 = 0`. Compute `w1` and `w2`, and say
whether this is converging or diverging. Hold your answer; the solution confirms it.

Now the capstone. You're handed a support ticket about a churn model that's been in production for
months, retrained weekly. Here's everything you know:

- **The model's validation report** has shown roughly **37% precision** every week since launch —
  stable, nothing alarming there. Its true positive rate and false positive rate, measured on that
  validation set, are **TPR = 60%** and **FPR = 9%**, and a colleague insists these haven't changed:
  "the model behaves exactly the same as it did on day one."
- **Production monitoring**, which compares live predictions against live outcomes (not the frozen
  validation set), shows this week's *actual* precision is **12%** — far below the reported 37%.
- **Marketing context:** a retention campaign launched two months ago and has been highly effective
  — churn prevalence has genuinely fallen from **8%** company-wide to **3%** this quarter. Everyone
  is treating this as unambiguously good news.
- **An offhand comment**, when you ask about the pipeline: "we started retraining weekly a couple of
  months ago — same as before, just a random 80/20 split on the customer-month table each time."

**Your task, in two parts.**

**Part 1 (write it out, not graded).** Using TPR and FPR as fixed and the odds-form relationship
(`precision-odds = prior-odds × TPR/FPR`), what precision would you *expect* at 8% prevalence, and
what would you expect at 3% prevalence, if nothing else about the pipeline had changed? Also: does
the offhand comment about "same as before, just a random split" raise any flags on its own, given
what a customer-month panel looks like — regardless of the prevalence math?

**Part 2 (graded).** Compute the precision the 3%-prevalence shift alone would predict, then compare
it to the observed 12%. Report the gap, in percentage points, between what the prevalence shift alone
predicts and what's actually being observed — the portion of the drop that prevalence does **not**
account for, and therefore needs a different explanation.
