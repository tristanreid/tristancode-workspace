---
title: "The Tree That Memorized the Forest"
description: "Grow a decision tree until every leaf holds exactly one training example, and recognize a model you've already met."
lesson_number: 9
track: ml
concept: "Decision trees"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [2, 3]
skin: chalkboard
mcq:
  question: "What does the train/test error pair look like for this fully-grown tree, and which earlier lesson does it recreate?"
  options:
    - "Train error near 0%, test error stuck at baseline or worse — this is lesson 2's lookup-table memorizer, rebuilt out of if/else splits"
    - "Train and test error both near 0% — a tree that isolates every point generalizes perfectly by construction"
    - "Train error stays high, because greedy splitting can never separate the classes cleanly"
    - "Test error keeps improving the deeper the tree grows, with no downside to depth"
  correct: 0
---

A **decision tree** is a completely different function family from lessons 5-8's weighted sums: it
carves up feature space with a sequence of **axis-aligned cuts** — "is square footage > 1,500?
then is age < 10? then…" — each internal node a yes/no question on *one* feature, each leaf a
final prediction. Built via **greedy splitting**: at each node, try every candidate cut on every
feature, pick whichever single split most improves purity (how separated the classes/values
become) *right now*, and recurse into the two resulting groups. "Greedy" because each choice is
locally best — the algorithm never looks ahead to check whether a worse-looking split now would
have enabled a better structure two levels down.

Nothing stops you from growing the tree **until every leaf contains exactly one training
example** — keep splitting as long as a split is possible, no depth limit, no minimum leaf size.
Each leaf then predicts that one training point's label, exactly.

You've reasoned about a model shaped like this before, in a different costume. What does this
fully-grown tree's train and test performance look like, and which earlier lesson is it secretly
the same thing as?
