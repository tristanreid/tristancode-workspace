---
title: "Solution: Same Detector, Rarer Fraud: Precision Collapses"
description: "13.9%, not 64%. Recall is prevalence-invariant; precision is not — and the odds-form of Bayes' theorem explains exactly why."
lesson_number: 17
track: ml
concept: "Class imbalance: precision depends on prevalence, recall doesn't"
stage: 3
layout: solution
role: solution
builds_on: [4, 15]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "visualizes how a prior gets multiplicatively updated by evidence — the same move as the odds form below"
---

**Retrieval check.** 12% of 800 patients readmit, so 96 do and 704 don't. "Always predict no
readmission" gets every one of the 704 right and misses all 96: 704 / 800 = **88%** accuracy —
a strong-looking number for a model that has learned nothing, exactly lesson 4's point, replayed
in a new domain.

**Main answer: 13.9%.** At 1% prevalence, 200 of the 20,000 transactions are genuine fraud and
19,800 are legitimate.

- True positives = 80% of 200 = **160**. False negatives = 40.
- False positives = 5% of 19,800 = **990**. True negatives = 18,810.
- Recall = 160 / 200 = **80%** — unchanged. It was never going to change: recall only ever divides
  by the count of *actual positives*, and TPR (80%) is defined as exactly that ratio. If TPR is
  fixed, recall is fixed, full stop, regardless of how many negatives surround those positives.
- Precision = 160 / (160 + 990) = 160 / 1,150 ≈ **13.9%** — collapsed from 64%, using the *identical*
  detector, the identical 80%/5% behavior per class.

**Why precision moves and recall doesn't — the actual mechanism.** Precision's denominator is
`TP + FP`, and `FP` scales with the *number of negatives*, not with how much fraud exists.
Shrink the fraud rate while holding the population size roughly fixed, and negatives balloon —
19,800 of them instead of 18,000 — so the 5% false-positive rate now manufactures 990 false alarms
against only 160 real catches. The same 5%-of-negatives leak swamps a much smaller pool of true
positives. "Precision and recall are both rates independent of prevalence" is true for exactly one
of the two — recall is a rate *of the positive class only*; precision is a rate that mixes both
classes together, which is precisely what makes it sensitive to how the classes are mixed.

**The odds-form reading — the fast way to see this coming.** Precision is really asking a Bayes
question: *given a flag, what's the probability this is really fraud?* Read as odds instead of
probability, that question has a one-line answer, structurally identical to the bayes track's odds
form of Bayes' theorem (`posterior odds = prior odds × likelihood ratio`):

> **precision-odds = prior-odds(fraud) × (TPR / FPR)**

`TPR / FPR` is exactly a **likelihood ratio**: how much more likely a "flagged" outcome is under
"really fraud" than under "really legitimate" — and it's fixed here at 0.80 / 0.05 = **16**, because
TPR and FPR are the fixed per-class behaviors. At 1% prevalence, prior odds = 200/19,800 ≈ 0.0101;
posterior odds = 0.0101 × 16 ≈ 0.1616; converting back to a probability, `0.1616 / 1.1616 ≈ 13.9%` —
matching the confusion-matrix arithmetic exactly. The likelihood ratio never moved. The *prior
odds* moved, because prevalence moved, and precision — being a posterior probability of the
positive class given a flag — inherits every bit of that shift. Recall never enters this equation
at all, which is the algebraic reason it's untouched.

**The practical habit this buys you.** Any time a model's deployment context changes how common
the positive class is — a new market, a new fraud campaign, a marketing push that changes who
churns — precision needs to be *re-derived*, not assumed to travel. A vendor's demo precision,
measured on a curated 10%-positive sample, tells you close to nothing about what precision will
look like once that same detector meets your actual 0.3%-positive production traffic; TPR and FPR
are the numbers worth asking a vendor for, because — unlike precision — they're the ones a
prevalence shift doesn't quietly rewrite.

**Where this goes:** the next lesson turns the same "don't trust a number without checking what
produced it" habit on a pipeline itself — diagnosing which of several plausible-looking features
and splits are secretly leaking the future into training.
