---
title: "Which Single Number Do You Report?"
description: "Mean, median, and mode of the same posterior can all disagree — because each one minimizes a different penalty for being wrong. Build the distribution yourself first."
lesson_number: 22
track: bayes
concept: "Point estimates are loss-function choices"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [12, 21]
skin: chalkboard
numeric:
  question: "Expected number of critical bugs remaining, from the posterior below?"
  answer: 1.3
  tolerance: 0.02
  unit: "bugs"
---

**First, a quick retrieval check — a familiar trick, new setting.**

A monitoring dashboard reports: "at least one of these two identical, independently-operating sensors
is currently reporting bad data." Each sensor independently has a 50% chance of reporting bad data on
any check. What's P(both are reporting bad data | at least one is)? (This is Lesson 5's two-child
puzzle wearing different clothes — the conditioning-on-how-you-learned-it trap, not plain
independence.)

*(Confirmed in the solution.)*

---

You've built posteriors (Lesson 15), predicted from them (Lesson 18), and even hand-built one from a
non-conjugate grid (Lesson 21). Often, though, you're forced to report just **one number** — "how many
bugs are left?", not "here's a whole distribution." Three standard candidates:

- **Mean**: the probability-weighted average. Sensitive to a long tail — rare, severe outcomes pull it
  upward even if most outcomes are mild.
- **Median**: the value such that half the posterior's probability lies at or below it, half above.
  Cares how much probability is in the tail, not how far the tail extends.
- **Mode**: the single most plausible value — wherever the distribution peaks. Ignores everything
  about the shape except the location of that one peak.

**These are not three approximations of one "true" answer.** Each is the number that minimizes a
*different* penalty (loss function) for being wrong:

- Penalized by **squared error**, `(guess − actual)²` → the **mean** minimizes your expected penalty.
- Penalized by **absolute error**, `|guess − actual|` → the **median** minimizes it.
- Credited only for the **exact right value** (0/1 loss) → the **mode** minimizes it.

**Your posterior**, from a QA review, over the number of critical bugs remaining in a release:

| bugs remaining | 0 | 1 | 2 | 3 | 10 |
|---|---|---|---|---|---|
| posterior probability | 0.45 | 0.30 | 0.10 | 0.10 | 0.05 |

(That last row is real — a small chance the release has a deeply nested issue that would surface as
10 distinct bug reports; QA teams see distributions shaped like this constantly: usually clean, rarely
catastrophic.)

**Part 1 — Mode.** Which single value has the highest posterior probability?

**Part 2 — Median.** Add up probability from the bottom until you cross 0.5 — which value does the
median land on?

**Part 3 — Mean (the numeric answer above).** Compute `Σ (bugs × probability)` across all five rows.

**Part 4 — Which number do you actually report?** You're advising a release manager who has to decide
whether to delay shipping. The cost of under-preparing for bugs scales badly — one 10-bug nightmare
release costs far more than ten separate 1-bug releases, not just proportionally more. Given that,
which of your three numbers (0, the median, or the mean) best reflects what the manager should
actually weigh, and why is reporting the mode here actively misleading despite being the single most
"likely" outcome?
