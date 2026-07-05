---
title: "Solution: Squashing a Line Into a Probability"
description: "σ(2) ≈ 0.881 — and why calibration, not just the bounded range, is the property that makes this number worth trusting."
lesson_number: 7
track: ml
concept: "Logistic regression"
stage: 1
layout: solution
role: solution
builds_on: [5, 6]
skin: chalkboard
resources:
  - title: "MLU-Explain — Logistic Regression"
    url: https://mlu-explain.github.io/logistic-regression/
    note: "the sigmoid curve and decision boundary, interactively"
---

**σ(2) = 1 / (1 + e⁻²) ≈ 1 / (1 + 0.1353) ≈ 1 / 1.1353 ≈ 0.881.**

The model predicts an **88.1% chance of churn** for this customer. Notice what each piece
contributed: the linear part (`z = 2.0`) came entirely from lesson 5's machinery — coefficients
times features, plus an intercept, exactly as before. Sigmoid's only job was translating "2.0,
a number with no natural upper bound" into "0.881, a number that can legitimately be called a
probability." At z = 0, sigmoid gives exactly 0.5 (maximally uncertain); as z grows past roughly
+3 or below −3, sigmoid saturates near 0 or 1 — extreme linear scores translate into
near-certainty, which is the intended behavior, not a bug (though it does mean well-calibrated
logistic models rarely output *literal* 0 or 1 — the curve approaches but never touches either
end).

**Why "bounded in [0,1]" isn't the same claim as "calibrated."** You could bound any linear
output into `[0,1]` with a cheap trick — clip anything below 0 to 0 and above 1 to 1 — and get
numbers that are technically valid probabilities but garbage as *beliefs*: among cases clipped to
"1.0," some large fraction might not actually be positive at all. Sigmoid isn't just a clipping
function; **fitting** the model (via a loss called cross-entropy, gradient descent's other classic
target, built specifically to reward well-calibrated probabilities rather than merely-correct
classifications) is what pushes the 0.881 toward meaning "roughly 88% of customers who look this
way actually churn." The shape (sigmoid) makes calibration *possible*; the *training* is what
makes it *true* — and even then, only approximately, and only as well as the training data and
loss allow (stage 3 has a whole lesson on when this promise breaks).

**A framing worth keeping:** logistic regression is often introduced as "classification," but the
sharper way to say it is **a linear model for probabilities** — the classification (churn / no
churn) is a *decision* layered on top (usually: call it "churn" if the probability clears 0.5),
and that threshold is a separate choice you make afterward, not something the model itself
dictates. Two deployments of the identical model can reasonably use different thresholds — a
churn-prevention team might act on anything above 0.3 if the cost of a false alarm is cheap.

**Where this goes:** both lines and their squashed-through-sigmoid cousins can overfit exactly
like lesson 3's polynomial did — more features, more capacity, the same U-shaped test-error risk.
Next: **regularization**, the standard fix — penalizing complexity directly in the loss, with a
reading (previewed here, developed properly in the bayes track) as encoding a *prior belief* that
coefficients should stay small unless the data insists otherwise.
