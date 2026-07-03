---
title: "Solution: The Test Is 99% Accurate. You're Probably Fine."
description: "The false positives from the enormous healthy majority swamp the true positives from the tiny sick minority."
lesson_number: 7
track: bayes
concept: "Base rates"
stage: 1
layout: solution
role: solution
builds_on: [6]
skin: chalkboard
resources:
  - title: "3Blue1Brown — The medical test paradox"
    url: https://www.youtube.com/watch?v=lG4VkPoG3ko
    note: "this exact problem, plus the update-odds framing the next lessons build"
  - title: "Think Bayes 2, Chapter 2 (free online)"
    url: https://allendowney.github.io/ThinkBayes2/chap02.html
    note: "cookie/dice/test problems using the same table method"
---

**≈ 0.047 — under 5%.** A positive result on a "99% accurate" test for this condition means you're
still *probably fine*.

The count, with 100,000 people:

- **Have it:** 100 people (1 in 1,000). Of them, 99 test positive. → **99 true positives**
- **Don't have it:** 99,900 people. Of them, 2% test positive. → **1,998 false positives**
- **Everyone who tested positive:** 99 + 1,998 = 2,097. Actually sick: 99.

    P(condition | positive) = 99 / 2,097 ≈ 0.047

Same shape as the spam problem — prior × likelihood on each branch, then "what fraction of the
evidence-pool came from the hypothesis branch?" What changed is only the prior: 0.4 became 0.001,
and the posterior collapsed from 86% to 5%.

**Why intuition fails:** "the test is 99% accurate" describes P(positive | condition) — how the
test behaves *given* the truth. The question asks P(condition | positive) — the reverse
conditional, which depends on something the accuracy number doesn't contain: **how rare the
condition is**. The healthy group is 999× larger than the sick group, so even its measly 2% error
rate produces 20× more false positives than the sick group produces true ones. Ignoring the
prior's size when reversing a conditional is called **base-rate neglect**, and it's the most
common quantitative reasoning error in professional life. Your monitoring system knows it well:
when real incidents are rare, an alert that's "99% accurate" pages you mostly for ghosts — the
alerting version of this arithmetic is why alert fatigue is a base-rate problem, not a diligence
problem.

**What would rescue the test?** Two things, and they're instructive:
1. **A higher prior.** Test people *with symptoms* (prior 1-in-10 instead of 1-in-1,000) and the
   same test gives P(condition | positive) ≈ 85%. Screening and diagnosis are different régimes.
2. **A second, independent test.** A positive moved you from 0.1% to 4.7% — a ~50× boost in odds.
   Another independent positive would boost again, to ≈ 70%. *Independent* is doing heavy lifting
   there — lesson 4's warning applies (same lab, same failure mode → no second boost).

That "boost" language — each piece of evidence multiplying your odds by a fixed factor — is not a
metaphor. It's a theorem, it makes sequential updating nearly mental arithmetic, and it's two
lessons away.
