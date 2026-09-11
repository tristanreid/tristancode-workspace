---
title: "The Metric Went Up. The Goal Didn't."
description: "A support team's response-time metric improved 92% after it became a target. Actual resolution time got worse. Compute exactly how much worse."
lesson_number: 23
track: ml
concept: "Goodhart's law: optimizing the metric vs. the goal"
stage: 7
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [12]
skin: chalkboard
numeric:
  question: "What is the percentage change in resolution_time (the increase), rounded to one decimal place?"
  answer: 29.2
  tolerance: 0.3
  unit: "%"
---

**Quick retrieval, before the main puzzle** (lesson 12's idea, a new setting): a fraud model's top
feature by importance score is `device_fingerprint_match`; `ip_reputation_score`, known to be highly
correlated with it, scores near-zero importance. In one line: what's the likely explanation, and is
`ip_reputation_score` proven useless? Hold your answer; the solution confirms it.

Now the main event. **Goodhart's law**, in its most quoted form: *"when a measure becomes a target,
it ceases to be a good measure."* The idea: a metric is often a decent **proxy** for a goal you
actually care about, precisely because nobody is yet trying hard to move the proxy specifically. The
moment you start rewarding people (or a model) for moving the proxy directly, you've created
pressure to find the cheapest way to move *that number* — and the cheapest way to move a proxy is
rarely the same thing as achieving the underlying goal.

**The scenario.** A support team's real goal is "customers get their issues actually resolved,
quickly." Someone picks **time-to-first-response (TTFR)** — how long before a customer gets *any*
reply — as the metric to track, reasoning that fast first replies correlate with a team that's on
top of things. That correlation was real, under the conditions where nobody was specifically
optimizing TTFR.

Then TTFR becomes a target: agents are scored on it directly, dashboards highlight it, bonuses
depend on it.

| | before | after |
|---|---|---|
| TTFR | 240 min | 20 min |
| `resolution_time` (issue actually closed) | 480 min | 620 min |
| CSAT (customer satisfaction survey score) | 82% | 68% |

TTFR improved dramatically — a 91.7% reduction. What actually happened: agents started sending an
instant, canned "we've received your ticket, someone will be in touch" auto-reply the moment a
ticket arrives, which satisfies the TTFR metric perfectly (a reply went out fast) without making any
progress on the actual issue. Meanwhile `resolution_time` — how long until the issue is genuinely
closed — and CSAT both got *worse*.

**Your task.** Compute the percentage change in `resolution_time` (it went up — report the increase
as a positive percentage), and contrast it in your own head with TTFR's 91.7% *improvement*. That gap
between the two percentage changes is the Goodhart gap made numeric.
