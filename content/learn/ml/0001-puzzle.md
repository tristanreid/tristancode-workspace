---
title: "Guess the Function"
description: "All of machine learning is one move: pick a family of functions, score them with a loss, search for a good one."
lesson_number: 1
track: ml
concept: "Learning as function fitting"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: []
skin: chalkboard
mcq:
  question: "Which of these is NOT an instance of learning-as-function-fitting?"
  options:
    - "A — Predicting customer churn from usage features, tuned on last year's outcomes"
    - "B — Sorting a list with quicksort"
    - "C — Flagging spam using a model trained on labeled mail"
    - "D — Estimating a house's price from square footage using a line fit to past sales"
  correct: 1
---

Welcome to the machine learning track. Strip away the acronyms and essentially all of supervised
machine learning — from a line through points to a trillion-parameter language model — is **one
move** with three choices in it:

1. **Choose a function family** (the *hypothesis space*): the set of functions you're willing to
   consider. All straight lines `f(x) = ax + b`. All depth-6 decision trees. All transformers of
   a certain shape. This choice quietly encodes your assumptions about the world.
2. **Choose a loss**: a number measuring how wrong a candidate function is on your examples —
   squared error, misclassification rate, cross-entropy. The loss defines what "good" means.
3. **Search** the family for a member with low loss: closed-form algebra for lines, greedy
   splitting for trees, gradient descent for neural nets. "Training" is this search; a "model" is
   the member you settled on.

That's the whole game: **examples in, function out** — where the function's behavior was *induced
from data* rather than spelled out by a programmer. The learning happens precisely where a human
didn't write the rule.

The question above gives you four computations. Three of them are this move — examples, a scored
family, a search. One is something else entirely, and saying *precisely why* it doesn't fit the
frame is the point of the exercise. (Hint: it's not about difficulty, and quicksort certainly
involves a function.)
