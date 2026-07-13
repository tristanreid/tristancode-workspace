---
title: "Solution: One Split Isn't Enough to Trust"
description: "Random shuffling on time-ordered data quietly lets the future leak into training — cross-validation done wrong can look more rigorous while being just as broken."
lesson_number: 13
track: ml
concept: "Cross-validation: what it estimates, and how to leak through it"
stage: 3
layout: solution
role: solution
builds_on: [2]
skin: chalkboard
resources:
  - title: "scikit-learn — Cross-validation: evaluating estimator performance"
    url: https://scikit-learn.org/stable/modules/cross_validation.html
    note: "covers TimeSeriesSplit and group-aware CV variants directly relevant here"
---

**Correct: random shuffling lets some folds train on data from after the point in time the
validation fold is testing on, implicitly handing the model future information.**

Option 1 is the trap this lesson exists to break — k-fold's safety is *conditional* on the data
actually being exchangeable (order-independent), which time-ordered data isn't. Option 3 invents a
rule that doesn't exist (k is a practical choice, commonly 5 or 10, not a hard requirement). Option
4 overcorrects — cross-validation is a genuine improvement over a single split *when its
assumptions hold*; the fix here is a different splitting strategy, not abandoning the idea.

**Walking the actual failure.** Suppose the data spans January through December, shuffled, then
split into 5 folds. Fold 3 might, purely by chance, end up validating on a March data point while
folds 1, 2, 4, and 5 (used to train that round) happen to include June, September, even December
data. A model predicting March sales that got to "see" patterns from June onward during training has
information no real deployment would ever have — you can't train on the future to predict the
past. The validation score that round looks good for the wrong reason: not because the model
generalizes well, but because it partially memorized what happens later and got tested on an
earlier point it's implicitly already seen the shape of.

**The fix: respect the data's actual structure when splitting, not just its row count.** For
time-ordered data, a **time-series split** (also called forward-chaining or rolling-origin CV)
trains only on data strictly *before* each validation fold — fold 1 trains on January, validates on
February; fold 2 trains on January–February, validates on March; and so on, always moving forward,
never backward. It's a direct generalization of lesson 2's single split's core rule ("test on data
the model hasn't seen") applied *k* times instead of once, respecting the one thing plain shuffling
ignored: which data existed before which.

**The broader principle, worth carrying past this one example:** cross-validation estimates
generalization *only under the assumption that folds are genuinely exchangeable* — that any row
could just as easily have landed in any fold. Time order breaks that assumption outright; so does
having multiple rows from the same underlying entity (the same patient, same user, same store)
scattered across folds, which is next lesson's failure mode. More folds and a fancier-sounding
procedure is not automatically more rigorous — it can just be the *same* leak, dressed up to look
more careful.

**Where this goes:** this lesson zoomed in on the CV-splitting version of leakage. Next lesson
generalizes: leakage isn't only a cross-validation problem — it comes in a handful of recognizable
shapes (target, temporal, group) that show up throughout an entire modeling pipeline, not just at
the split step.
