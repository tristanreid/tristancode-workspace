---
title: "The Number Behind Forgetting"
description: "ACT-R's base-level activation turns 'how well do I remember this' into arithmetic — and predicts you should forget almost everything you don't reuse."
lesson_number: 10
track: cog
concept: "ACT-R: spreading activation & base-level decay"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [9]
skin: chalkboard
numeric:
  question: "Base-level activation B for the opening name, using B = -d · ln(t)?"
  answer: -1.386
  tolerance: 0.02
---

Lesson 9 introduced **activation** — a number capturing how easily a declarative chunk can be
retrieved — without saying where the number comes from. ACT-R's answer has two ingredients.

**Base-level activation** tracks how *often and how recently* a chunk has been used. The
simplified single-use form:

> B = −d · ln(t)

where **t** is time since the chunk was last retrieved, and **d** is a decay rate (ACT-R's usual
default is **d = 0.5**). Bigger t (longer since you used it) → more negative B → weaker, slower,
less reliable retrieval. Every additional retrieval of a chunk also boosts it — practiced facts
resist decay better than one-off facts, which is why the full formula sums a term like this over
every past use — but for one use, this simplified version is exact.

**Spreading activation** is the second ingredient: a chunk's total activation also rises when
*related* chunks currently in the goal/context are active — recalling "chess" makes
chess-adjacent chunks (openings, your last opponent, the Sicilian Defense) easier to retrieve too,
the same way one memory cues another. Base-level activation asks "how used is this, on its own";
spreading activation asks "how connected is this to what I'm thinking about right now."

A chess player memorized a rare opening name (the "Grünfeld Defense") and hasn't thought about it
since — **t = 16 days**. Using the base-level formula with d = 0.5, compute **B**.
