---
title: "Two Meanings of 70%"
description: "Probability has two readings — long-run frequency and degree of belief — and only one of them covers most of the claims you actually care about."
lesson_number: 1
track: bayes
concept: "Probability as plausibility"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: []
skin: chalkboard
mcq:
  question: "Exactly one of these claims can't be read as a long-run frequency — it only makes sense as a degree of belief. Which?"
  options:
    - "A — \"This coin lands heads about half the time.\""
    - "B — \"There's a 60% chance last night's deploy caused this outage.\""
    - "C — \"About 5% of widgets from this production line are defective.\""
    - "D — \"Rolling doubles with two dice happens 1/6 of the time.\""
  correct: 1
---

Welcome to the Bayesian track. First, a question about what a probability *is*.

When someone says "the probability of X is 70%", there are two things they might mean:

- **Long-run frequency**: if you repeated the situation many times, X would happen in about 70% of
  the repeats. This is the reading behind casinos, quality control, and most intro stats courses.
- **Degree of belief** (the *Bayesian* reading): given everything I currently know, I'd treat X as
  70% plausible — I'd take one side of a bet at those odds but not the other.

The frequency reading needs a repeatable situation: flip the coin again, pull another widget off
the line. The belief reading doesn't — it applies to any proposition, including one-off events that
will happen exactly once or already happened.

Here's the useful part: **both readings obey the exact same math** — probabilities are between 0
and 1, mutually exclusive options sum, and so on. The rules don't care which reading you use. What
changes is *scope*: which claims you're allowed to put a number on at all.

Look at the four claims in the question. Three of them describe repeatable situations. One of them
is about a single, unrepeatable fact that is either true or false right now — and yet putting a
number on it is exactly what you do every time you debug.
