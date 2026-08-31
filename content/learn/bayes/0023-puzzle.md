---
title: "Should You Ship It, or Wait for More Data?"
description: "A posterior turns into a decision by weighing outcomes, not just describing belief. Compute the expected value of shipping now."
lesson_number: 23
track: bayes
concept: "Expected-value decisions; when the posterior says don't decide yet"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [21, 15]
skin: chalkboard
numeric:
  question: "What is the expected value, in dollars, of shipping the feature now, given the posterior Beta(9, 5)?"
  answer: 28571
  tolerance: 5
---

Everything since Lesson 21 has been about *summarizing* a posterior — one number, one interval. This
lesson asks the posterior to earn its keep: turn it into an actual decision.

**Scenario.** You built posterior `Beta(9, 5)` (mean ≈ 0.643) for `p` — the probability a new
checkout flow outperforms the old one, based on the A/B test data you've collected so far. You now
have to decide whether to ship it company-wide.

- If the new flow **does** outperform (probability `p`): shipping earns **+$50,000** in additional
  annual revenue.
- If it **doesn't** outperform (probability `1 − p`): shipping still costs you **−$10,000** — cleanup,
  reverting, the support burden of a flow that turned out to be a net negative.

**Expected value of shipping**, using your posterior's mean as your best single estimate of `p`:

```
EV(ship) = p × (+$50,000) + (1 − p) × (−$10,000)
```

**Compute the expected value of shipping now**, using the posterior mean from `Beta(9, 5)` as `p`.
Give your answer in dollars.

(Hold onto this number — the solution will ask a follow-up question the numeric answer alone can't
tell you: given how *uncertain* this posterior still is, should you actually ship, or run the test a
while longer first?)
