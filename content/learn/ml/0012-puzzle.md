---
title: "The Importance Score That Lied by Omission"
description: "Two features carry almost the same information. One gets a high importance score, the other almost none — and both readings would be wrong."
lesson_number: 12
track: ml
concept: "Feature importance skepticism"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [9, 11]
skin: chalkboard
mcq:
  question: "A house-price model reports 'square footage' at high importance and 'number of rooms' at near-zero, even though the two are known to be highly correlated (bigger houses almost always have more rooms). What's the most accurate read?"
  options:
    - "Number of rooms is proven not to matter for house prices; the model has ruled it out"
    - "Square footage is a strictly better predictor of price than number of rooms, in every dataset"
    - "The two features carry overlapping information; a tree-based model can satisfy most of a split's needs using just one of them, so whichever gets picked first at each split earns most of the importance credit, leaving little for its correlated twin — importance measures split credit, they don't measure standalone relevance"
    - "The importance scores are simply a bug and should be ignored entirely"
  correct: 2
---

Tree-based models like lesson 9's decision trees and lesson 10–11's forests and boosted ensembles
commonly report a **feature importance** score per feature — often, how much a feature's splits
reduced impurity (or error) across the whole model, summed up. It's tempting to read that number as
"how much this feature matters," full stop. That reading has a specific, common failure mode.

Consider a house-price model with two features: **square footage** and **number of rooms** — in
this dataset, strongly correlated (bigger houses reliably have more rooms; the two features are
nearly redundant with each other). At any given split, a tree only needs *one* good way to separate
big houses from small ones — and once it picks, say, square footage for that split, number of
rooms no longer offers the tree anything *additional* at that point, because square footage
already captured most of the same signal. Whichever of the two happens to be evaluated as
marginally better at each split (sometimes by a tiny margin, sometimes by chance) wins essentially
all the importance credit; its correlated twin ends up looking nearly useless — not because it
carries no price-relevant information, but because whatever it *would* have contributed was already
"spent" by its correlated partner.

Given that mechanism, which read of the mismatched importance scores is most accurate?
