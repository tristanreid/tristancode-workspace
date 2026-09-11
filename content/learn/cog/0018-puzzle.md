---
title: "Change One Requirement, Flip the Architecture"
description: "'The sequence is predefined' is not the deciding property — branching pipelines have that too. Change one requirement in a CI pipeline and find the property that actually flips the answer."
lesson_number: 18
track: cog
concept: "Blackboard vs. pipeline: mutual revision, not predefined order"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [4, 5, 6, 7]
skin: chalkboard
---

**Retrieval check (from lesson 9, new setting).** A barista knows "oat milk steams best a little
cooler than dairy, or it splits" — a fact she could say out loud to a trainee. She also has a habit,
built from thousands of repetitions, of angling the steam wand at a slightly different position for
oat milk without consciously deciding to — she'd struggle to narrate the exact angle if asked. Lesson
9 split memory into **declarative** ("knowing that" — stated facts, retrievable chunks) and
**procedural** ("knowing how" — IF–THEN production rules that fire without being consciously stated).
Which of the barista's two pieces of knowledge is procedural? Answer before reading on.

---

### The deciding property, restated

Lesson 7 defined a **pipeline** (or its more general form, a fixed **message-passing** graph): stages
whose outputs, once produced, are final — nothing downstream ever revises what an earlier stage
decided. A **blackboard** is for problems where hypotheses at different levels must **mutually
revise** each other, in an order you can't fix in advance — a later finding can send you back to
change an earlier verdict, which can itself trigger further revision, with no way to know beforehand
how many rounds that takes or in what sequence.

Here's the trap this property gets confused with, worth naming explicitly: **"the sequence of steps
is predefined" is not the deciding property.** A pipeline stage's *outcome* can absolutely branch
control flow — route to a retry path, skip a downstream stage, choose between two next stages based on
a result — and it is still a pipeline, because branching is still a **DAG**: every edge still points
only forward, no node's *own verdict* is ever revisited once made, only which forward path gets taken
next. Branching answers "what happens next," not "does the past get rewritten." **Revision** is a
different act entirely: an earlier node's conclusion gets *overwritten* by something a later node
found, and that earlier node's new conclusion can, in turn, prompt yet another revision anywhere else
that depended on it.

### The system

A CI pipeline: **lint → type-check → tests → deploy-approval**. Each stage can branch on its result —
a failing test routes to a "flaky-test retry" sub-path; a lint failure blocks deploy-approval outright.
No stage's own verdict is ever revisited once it runs; branching just picks which forward path to take.

**Question 1.** Is this a pipeline or a blackboard? Name the specific property that decides it — not
"the order is fixed," since branching already complicates that framing, but the actual test from the
paragraph above.

**Question 2.** Now change exactly one requirement: a test flagged as "flaky" turns out to fail in a
pattern that strongly suggests a **race condition** — and the team wants the *linter* to re-examine the
files involved in that test with a different, stricter rule set enabled specifically for concurrency
issues, potentially changing a file the linter had already passed. Does the architecture change? If
so, to what, and why — name the exact property from above that now applies, and explain specifically
why this is different in kind from the branching the original pipeline already had.
