---
title: "The Transposed Conditional"
description: "A one-in-a-million DNA match sounds damning — until you count the reference class."
lesson_number: 8
track: bayes
concept: "Prosecutor's fallacy"
stage: 1
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [2, 7]
skin: chalkboard
mcq:
  question: "Given only the match — no other evidence tying the defendant to the crime — roughly what is P(innocent | match)?"
  options:
    - "About 1 in a million — the match probability says so"
    - "About 50% — the match cuts it to a coin flip"
    - "About 91% — innocence is still overwhelmingly likely"
    - "It cannot be computed at all without the lab's error rate"
  correct: 2
---

Lesson 7 showed the error in a hospital. This lesson shows it in a courtroom, where it has a name:
the **prosecutor's fallacy**.

A crime is committed in a city of **10 million** people. The only evidence is a DNA sample from
the scene. The forensic lab reports:

> "The probability that a **random innocent person** would match this sample is **one in a
> million**." — that is, P(match | innocent) = 0.000001.

A database sweep finds a match: the defendant. At trial, the prosecutor argues:

> "The probability of a match if he were innocent is one in a million. Therefore the probability
> he is innocent is one in a million."

That sentence performs the classic swap — it reads P(match | innocent) as P(innocent | match).
Lesson 2 showed those live in different slices; lesson 7 showed the gap between them is set by
the base rate. Here the "base rate" is brutal: before the DNA evidence, the defendant was just
one resident among 10 million, exactly one of whom is the true source.

Do the count, exactly like the medical test: in a city of 10 million, how many *innocent* people
match a one-in-a-million profile, in expectation? How many guilty people match? A matching person
sits in that combined pool. (Assume the true source is in the city and would certainly match, and
— generously to the prosecutor — that the lab never makes clerical errors.)
