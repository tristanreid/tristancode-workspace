---
title: "The Information in the Telling"
description: "The classic two-child puzzle: the answer depends not just on what you learned, but on the procedure that delivered it."
lesson_number: 5
track: bayes
concept: "Conditioning on how you learned it"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [2]
skin: chalkboard
mcq:
  question: "You ask a colleague with two children: \"Is at least one of them a girl?\" She says yes. What's the probability both are girls?"
  options:
    - "1/2 — the other child is a coin flip"
    - "1/3"
    - "1/4 — same as before you asked"
    - "2/3"
  correct: 1
---

This is the most famous "wait, what?" in elementary probability, and it's here because it exposes
a subtlety that even people who can compute conditionals fluently walk straight into.

Setup, with the usual simplifications (each child independently a girl or boy with probability
1/2 — lesson 4 says we should justify that; here it's a modeling assumption, and a fine one):

A colleague has exactly two children. Before you learn anything, there are four equally likely
possibilities, ordered by birth:

    GG   GB   BG   BB      (each with probability 1/4)

You ask her directly: **"Is at least one of them a girl?"** — and she truthfully answers
**"yes."**

Given that answer, what's the probability that both children are girls?

Conditioning (lesson 2) tells you the mechanical move: throw away the worlds inconsistent with
what you learned, and re-count inside what remains. Do that carefully — the intuitive shortcut
"well, then the *other* one is 50/50" is doing something different, and one of them is wrong.

Answer the question above. Then, before you reveal the solution, consider a second scenario and
ask yourself whether it's the same question: *you run into her at the park with one of her
children — a daughter.* What's the probability both are girls now?
