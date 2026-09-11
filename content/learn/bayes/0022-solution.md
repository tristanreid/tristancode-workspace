---
title: "Solution: Which Single Number Do You Report?"
description: "Mode 0, median 1, mean 1.3 — three genuinely different numbers from one posterior, and the right one to report depends on how badly the tail actually hurts."
lesson_number: 22
track: bayes
concept: "Point estimates are loss-function choices"
stage: 4
layout: solution
role: solution
builds_on: [12, 21]
skin: chalkboard
resources:
  - title: "3Blue1Brown — Bayes theorem, the geometry of changing beliefs"
    url: https://www.youtube.com/watch?v=HZGCoVF3YvM
    note: "visual grounding for why a distribution's whole shape carries more than any one summary number"
---

**Retrieval check answer.** By the same logic as the classic two-child problem: outcomes for two
independent 50/50 sensors are {both bad, first-bad-only, second-bad-only, both fine}, each equally
likely (25%). "At least one bad" rules out only "both fine," leaving 3 equally likely outcomes, one of
which is "both bad." **P(both bad | at least one bad) = 1/3 ≈ 0.333** — not 1/2. Knowing *how* the
information arrived (a report that at least one is bad, not which one) changes the conditioning, same
trap as Lesson 5.

---

**Part 1 — Mode: 0.** Highest single probability is 0.45, at "0 bugs remaining."

**Part 2 — Median: 1.** Cumulative probability: `P(0)=0.45`, `P(≤1)=0.75`. The median is the smallest
value where cumulative probability reaches at least 0.5 — that's crossed at "1 bug," since `0.45` alone
falls short of `0.5` but `0.45+0.30=0.75` clears it.

**Part 3 — Mean: 1.3.**

```
0×0.45 + 1×0.30 + 2×0.10 + 3×0.10 + 10×0.05
= 0 + 0.30 + 0.20 + 0.30 + 0.50
= 1.30
```

**Three genuinely different numbers from one posterior: mode 0, median 1, mean 1.3.** This isn't
measurement noise or rounding — they're answering three different questions, and a skewed
distribution with a rare severe tail (the 5% chance of 10 bugs) is exactly where they're guaranteed to
disagree hardest. A symmetric, tail-free distribution would have all three coincide.

**Part 4 — Report something closer to the mean, not the mode.** The scenario states the penalty for
under-preparing is worse than linear in bug count — a single 10-bug release is disproportionately
costly, not just "10× as bad as a 1-bug release." That's a hint you're closer to squared-error-shaped
loss (or something even more tail-averse) than to flat absolute error, and the mean is exactly the
number that accounts for *how much* probability sits in that expensive tail, weighted by how expensive
it is. Reporting the mode (0 bugs) would tell the release manager "most likely, you're completely
clean" — true on its own terms, but it silently discards the 5% chance of the nightmare scenario
entirely, precisely the scenario the manager most needs to plan around. The mode answers "what will
probably happen," not "what should I brace for" — and those are different questions whenever the
downside is asymmetric. If the cost structure were flatter (a fixed, modest per-bug fix cost, no
special penalty for clustering), the median would be the more defensible report; if you were being
scored purely on nailing the *exact* headline number for a status report, the mode would be optimal.
**None of these numbers is "the truth" being approximated — each is the rational reply to a specific
question about how you're being scored for being wrong**, and getting that mapping backwards (using
the mode when your real losses are squared-error-shaped, say) means confidently reporting a
minimize-the-wrong-thing summary.

**The pattern:**

| Estimate | Value | Minimizes | Good report when... |
|---|---|---|---|
| Mode | 0 | 0/1 loss (exact match only) | you're scored on hitting the precise headline value |
| Median | 1 | absolute error | costs scale linearly with how wrong you are |
| Mean | 1.3 | squared error | large misses are disproportionately costly (this scenario) |

**Where this goes:** next lesson turns from single numbers to *intervals* — and a related, extremely
common confusion: a Bayesian credible interval and a classical confidence interval can look identical
on a page while claiming genuinely different things.
