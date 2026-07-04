---
title: "Three Questions About One Mind"
description: "Marr's three levels of analysis: any information-processing system — brain, spam filter, or agent harness — can be described at three distinct levels that answer different questions."
lesson_number: 1
track: cog
concept: "Marr's levels"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: []
skin: chalkboard
mcq:
  question: "Which claim describes the spam filter at the algorithmic level?"
  options:
    - "A — \"Its job is to separate wanted from unwanted mail, where the two kinds of mistake have very different costs.\""
    - "B — \"It maintains per-word frequency tables and updates a spam score with Bayes' rule as each word streams in.\""
    - "C — \"It runs across three sharded servers using SIMD-optimized matrix routines.\""
    - "D — \"Even with unlimited compute, it would still face the same tradeoff between missed spam and quarantined real mail.\""
  correct: 1
---

Welcome to the cognitive science & AI architectures track. Before studying any particular mind or
machine, you need the master tool for keeping descriptions of them from talking past each other.

The vision scientist David Marr argued that any information-processing system must be understood
at **three levels**, each answering a different question:

1. **Computational level** — *What problem is being solved, and why?* What are the inputs,
   outputs, and constraints that any solution must respect? (Marr's example: a cash register's
   computational theory is arithmetic — the properties of addition exist regardless of the
   machine.)
2. **Algorithmic level** — *How, abstractly?* What representations are used, and what processes
   manipulate them? (Addition could be done in decimal or binary, by lookup table or by carrying.)
3. **Implementational level** — *In what physical stuff?* Neurons, transistors, gears — the
   substrate that realizes the algorithm.

The levels are partly independent: one computational problem admits many algorithms; one algorithm
runs on many substrates. A claim pitched at one level neither confirms nor refutes a claim at
another — and an enormous amount of confused arguing (about brains and about AI systems) comes
from not noticing which level a claim lives at.

Try it on something mundane. Four true claims about a spam filter appear in the question above.
Exactly one of them is an **algorithmic-level** claim — it commits to representations and
processes, not just to the problem, and not to the hardware.
