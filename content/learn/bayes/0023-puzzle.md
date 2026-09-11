---
title: "What the 90% Actually Covers"
description: "Credible and confidence intervals can look identical on a page while claiming different things. Then: commit to a real interval, not a wide one that can't lose."
lesson_number: 23
track: bayes
concept: "Credible intervals vs confidence intervals"
stage: 4
layout: puzzle
role: puzzle
answer_type: estimate
builds_on: [11, 15]
skin: chalkboard
estimate:
  prompt: "Posterior Beta(421, 2581) for variant B's true conversion rate (mean ≈ 14.0%). Give your best guess for the true long-run rate and a 90% interval you're confident contains it."
  answer: 14.4
  unit: "%"
---

**First, a quick retrieval check — the oldest concept in the track, new setting.**

An A/B test dashboard reports: "there's a 92% probability that variant B's true conversion rate is
higher than variant A's." Is that a claim about a **long-run frequency** (like "this happens 92% of
the time across repeated experiments") or a claim of **plausibility** (a degree of belief about the
one, fixed, real difference between these two specific variants)? One line — which reading actually
fits, and why the other one doesn't quite make sense here.

*(Confirmed in the solution — and it's the exact fork this lesson is built on.)*

---

You've seen two kinds of "90% interval" so far in this track, and they're built by completely
different procedures:

- A **Bayesian credible interval**: a range containing 90% of the *posterior's* probability mass.
  Read directly off the posterior distribution you actually computed — no repeated-sampling story
  needed. It licenses a genuine probability statement: *"given my prior and this data, there's a 90%
  chance the true value is in here."*
- A **frequentist confidence interval**: a range built from a *procedure* that, if you reran the whole
  data-collection-and-interval-construction process many times, would contain the true (fixed)
  parameter 90% of the time. That 90% describes the long-run reliability of the *method*, not a
  probability about any one interval you already built. Once the data is in hand, a specific realized
  confidence interval either contains the true value or it doesn't — there's no probability left to
  attach to that single instance.

The two can come out numerically close for simple problems with weak priors — but what each one is
*entitled to claim* is genuinely different, and mixing them up (saying the credible-interval sentence
about a confidence interval) is one of the most common misstatements in applied statistics.

**Scenario.** A checkout redesign, variant B, has been running for a while: 3,000 visitors, 420
conversions. Starting from a uniform prior `Beta(1,1)`, the posterior is
`Beta(1+420, 1+2580) = Beta(421, 2581)` — mean `421/3002 ≈ 0.1402` (14.02%). Using the normal
approximation to a beta this concentrated, the posterior standard deviation is about 0.63 percentage
points, so a 90% credible interval runs roughly `mean ± 1.645 × SD` — narrow, because 3,000 data
points is a lot of evidence.

**Part 1 — Compute the range.** Using mean ≈ 14.02% and SD ≈ 0.63 percentage points, what's the
approximate 90% credible interval? (Round to the nearest tenth of a percent.)

**Part 2 — The estimate above.** Give your own best guess for the true long-run conversion rate, plus
your own 90% interval, before the true value is revealed. **Resist the pull toward a "safe," wide
interval like 5%–25%.** It would almost certainly contain the truth too — but it throws away
everything the posterior just told you. A 90% interval that would contain the truth *no matter what
the data had said* isn't calibration, it's an interval that commits to nothing. The posterior math
above already handed you a genuinely narrow, well-supported range — use it.

**Part 3 — Naming the interval.** The interval you just gave: is it a credible interval, a confidence
interval, both, or neither? What would you need to have done differently to build the other kind?
