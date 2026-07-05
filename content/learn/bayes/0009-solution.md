---
title: "Solution: Odds Do the Arithmetic For You"
description: "Posterior odds = prior odds × likelihood ratio: why the odds form is the same Bayes update with the denominator cancelled out."
lesson_number: 9
track: bayes
concept: "Odds form of Bayes' theorem"
stage: 1
layout: solution
role: solution
builds_on: [6, 7]
skin: chalkboard
resources:
  - title: "Wikipedia — Bayes factor"
    url: https://en.wikipedia.org/wiki/Bayes_factor
    note: "the likelihood ratio's other name, and how it's used to weigh evidence in practice"
---

**Posterior odds = 0.2**, i.e. 1:5 (about 16.7% as a probability).

- Prior odds: 0.01 / 0.99 ≈ 0.0101 (1:99).
- Likelihood ratio: 0.99 / 0.05 = 19.8.
- Posterior odds: 0.0101 × 19.8 = **0.2**.

Converting back to a probability as a sanity check: P = odds / (1 + odds) = 0.2 / 1.2 ≈ 0.167 —
matching what you'd get grinding through lesson 6's full formula with the same numbers.

**Why the denominator disappears.** Bayes' theorem in probability form is:

> P(H | E) = P(E | H)·P(H) / P(E)

The awkward part is always P(E) — "the probability of the evidence, period," which usually means
expanding it across every hypothesis (lesson 6's full denominator). But take the *ratio* of the
theorem for H and for its negation ¬H, and P(E) is the same term top and bottom — it cancels:

> P(H|E) / P(¬H|E)  =  [P(E|H) / P(E|¬H)]  ×  [P(H) / P(¬H)]

Read left to right, that's exactly **posterior odds = likelihood ratio × prior odds**. You never
had to compute P(E) at all — the thing that made lessons 6-8 require a full population count.

**What the likelihood ratio *is*, intuitively:** how many times more consistent the evidence is
with H than with ¬H. LR = 1 means the evidence is neutral — it doesn't move you. LR > 1 pushes
toward H; LR < 1 pushes toward ¬H (a *negative* test result would have an LR below 1, shrinking
the odds instead of growing them — try that as an exercise: LR = 0.01/0.95 for a negative result
in this same scenario). LR = 19.8 here means "this test result is about 20 times more likely
under disease than not" — that's the entire strength of the evidence, in one number, independent
of the prior it gets multiplied against.

**Why this form earns its keep**: it separates *what you believed before* (prior odds) from
*how strong this evidence is* (LR) cleanly enough that you can cache the LR and reuse it — swap in
a different prior (a different patient, a different population) without recomputing anything about
the test itself. That reusability is exactly what tomorrow's lesson needs: chaining a *second*
piece of evidence is just multiplying in a second likelihood ratio.

**Where this goes:** two tests instead of one — when can you legally multiply their likelihood
ratios together, and when does that silently assume something false?
