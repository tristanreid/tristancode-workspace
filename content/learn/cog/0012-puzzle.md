---
title: "Never Solve the Same Impasse Twice"
description: "SOAR's chunking compiles a hard-won subgoal result into a reflex — and reveals a sharp design bet against ACT-R's."
lesson_number: 12
track: cog
concept: "SOAR II: chunking as learning"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [10, 11]
skin: chalkboard
mcq:
  question: "Which statement best captures the core design-bet difference between ACT-R and SOAR's approaches to memory and learning?"
  options:
    - "ACT-R has no learning mechanism at all; SOAR is the only architecture of the two that learns from experience"
    - "ACT-R maintains a separate declarative memory with graded, activation-based retrieval; SOAR compiles experience directly into new all-or-nothing production rules, with no separate declarative store in the classic architecture"
    - "SOAR's chunking and ACT-R's base-level activation are two names for the exact same mechanism"
    - "ACT-R only models procedural skill; SOAR only models declarative facts"
  correct: 1
---

Lesson 11 left a SOAR agent resolving an impasse by subgoaling — sometimes an expensive search
through a whole new problem space just to break one tie. SOAR's second major mechanism, **chunking**
(an unrelated reuse of Miller's word from Stage 0 — pure terminology collision, not the same idea),
is what stops that expensive search from ever repeating.

When a subgoal resolves, SOAR doesn't just apply the result and discard the reasoning that produced
it. It automatically compiles the trace — the conditions that led to the impasse and the result
that resolved it — into a **brand new production rule**, added directly to procedural memory. Next
time the same conditions arise, that new rule just *fires*, no subgoal, no search, the way a skill
you've drilled enough stops requiring conscious deliberation. Newell treated this as SOAR's entire
theory of learning: all learning is chunking, arising as a side effect of doing (impasse-driven
subgoaling), not a separate process bolted on.

This is a genuinely different design bet than lesson 10's ACT-R. ACT-R keeps declarative memory —
retrievable *facts*, each with a graded activation number that can be strong, weak, or anywhere
between, decaying continuously over time (lesson 10's B = −d·ln(t)) — as a distinct store from
procedural memory (production rules, which either fire or don't; no graded "activation" on a
rule's applicability the way there is on a fact's retrievability). Classic SOAR has no such
declarative store at all: everything, ultimately, becomes a production rule, all-or-nothing,
compiled directly by chunking. Two architectures, two different bets about whether "remembering a
fact" and "having a skill" are the same kind of thing underneath.

Given that contrast: which statement best captures the core difference?
