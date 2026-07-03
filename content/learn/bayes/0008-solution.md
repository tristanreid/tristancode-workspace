---
title: "Solution: The Transposed Conditional"
description: "Ten innocent matches to one guilty one: why the reference-class count, not the match probability, is the answer."
lesson_number: 8
track: bayes
concept: "Prosecutor's fallacy"
stage: 1
layout: solution
role: solution
builds_on: [2, 7]
skin: chalkboard
resources:
  - title: "Wikipedia — Prosecutor's fallacy"
    url: https://en.wikipedia.org/wiki/Prosecutor%27s_fallacy
    note: "real cases: People v. Collins, Sally Clark, Lucia de Berk"
---

**About 91% likely innocent.** The count:

- **Innocent matchers:** ~10 million innocent residents × 1-in-a-million match probability ≈
  **10 people**, in expectation.
- **Guilty matchers:** the one true source, who matches for sure: **1 person**.
- A person known only to match is one of ≈ 11, of whom 10 are innocent:

    P(innocent | match) ≈ 10/11 ≈ 0.91

The prosecutor's "one in a million" and the correct "91%" differ by **six orders of magnitude**,
using the same evidence. Nothing was miscalculated in the lab; the number was simply *transposed* —
P(match | innocent) sworn in as P(innocent | match). This isn't hypothetical: the fallacy has
produced real convictions, real appeals, and a small canon of infamous cases (People v. Collins,
Sally Clark — lesson 4's independence abuse and this transposition often travel together).

Three habits worth extracting:

1. **Count the reference class.** "How rare is this evidence?" means nothing until you ask *how
   many opportunities the evidence had to occur*. One-in-a-million events are everyday events in
   a city of ten million. (Same reflex, different clothes: "this A/B test hit p < 0.001!" — out
   of how many metrics × segments × daily peeks? A dashboard is a database sweep.)
2. **The match did enormous work — just not all of it.** The defendant went from 1-in-10-million
   (a random resident) to 1-in-11 (a matcher). That's evidence multiplying plausibility by nearly
   a million. The fallacy isn't overrating the evidence's *strength*; it's forgetting how far
   away the starting line was. Strong evidence + tiny prior can still equal "probably not."
3. **What would legitimately convict?** *More evidence*: opportunity, motive, a second independent
   forensic line. Each shrinks the innocent-matcher pool further. And "found by sweeping a
   database" vs "matched after being arrested on other grounds" are different *procedures* with
   different priors — lesson 5's information-in-the-telling, now with liberty at stake.

**Where this goes:** you've now reversed conditionals three times by rebuilding a population and
counting. The odds form of Bayes' theorem does the same update as pure multiplication — prior
odds × likelihood ratio = posterior odds — and turns all three of these lessons into one-line
arithmetic. That's next.
