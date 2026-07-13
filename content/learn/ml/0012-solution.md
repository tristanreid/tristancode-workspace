---
title: "Solution: The Importance Score That Lied by Omission"
description: "Importance measures 'credit for splits actually used,' not 'how much this predicts the target on its own' — and correlated features are exactly where that gap shows."
lesson_number: 12
track: ml
concept: "Feature importance skepticism"
stage: 2
layout: solution
role: solution
builds_on: [9, 11]
skin: chalkboard
resources:
  - title: "scikit-learn — Permutation Importance vs Impurity-based Importance"
    url: https://scikit-learn.org/stable/modules/permutation_importance.html
    note: "documents this exact correlated-feature failure mode and a more robust alternative"
---

**Correct: the two features carry overlapping information, and split-based importance measures
credit for splits actually used — not standalone relevance — so a correlated twin can look nearly
useless purely because its partner got picked first.**

Option 1 overclaims causally: "near-zero importance" is not "proven not to matter" — number of
rooms may carry price-relevant information that's simply redundant *given* square footage is
already in the model, which is an entirely different claim from "doesn't matter." Option 2
overclaims universally — this is a fact about *this correlation structure*, and possibly about
which feature happened to edge out the other at early splits, not a general law that square
footage beats room count everywhere. Option 4 dismisses a real, explainable, useful-to-understand
mechanism as noise.

**Why this specific failure mode matters practically.** The standard (impurity-based) importance
score answers "how much did splits on this feature reduce error, across the whole model, given
whatever other features happened to be available at each split" — a *conditional*, competitive
measure, not a standalone one. Drop the winning feature from the dataset entirely and retrain: the
"near-zero importance" feature would very likely jump to high importance, since it would now be the
best available proxy for the size signal both features were partially encoding. The number the
first model reported wasn't wrong, exactly — it was answering a narrower question ("what did this
model actually use") than the one usually being asked of it ("what matters").

**A more robust alternative, for exactly this reason: permutation importance.** Instead of counting
credit from splits during training, shuffle one feature's values (breaking its relationship to the
target) *after* training and measure how much the model's accuracy drops. This still isn't immune
to correlation entirely (shuffling one of two redundant features barely hurts accuracy either,
since its correlated twin still carries the signal) — but it measures something closer to "does the
model's performance depend on this feature," decoupled from which feature won the internal
competition for splits.

**The general lesson, echoing lesson 3's overfitting theme from a new angle:** a model's internal
bookkeeping (which feature it happened to split on) and the real-world question you actually want
answered ("what matters for house prices") are related but not identical — reading one off as a
direct stand-in for the other is exactly the kind of shortcut this track keeps flagging.

**Where this goes:** stage 2 closes here, having built trees, forests, and boosted ensembles and
learned to distrust their internal bookkeeping. Stage 3 turns to a bigger version of the same
worry — not "does this importance score mean what I think," but "does my whole evaluation
procedure mean what I think," starting with cross-validation.
