---
title: "Why This Path Won't Let You Do 20 Lessons on One Topic in a Row"
description: "Spacing isn't just 'more time helps' — it's that a retrieval only compounds an activation sum if the earlier use has actually decayed. Derive the design rule from the math."
lesson_number: 17
track: cog
concept: "Spacing & interleaving (the science this whole puzzle system is built on)"
stage: 4
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [15, 16]
skin: chalkboard
---

**Retrieval check (from lesson 1, new setting).** A chess engine can be described at three of Marr's
levels: *computational* (what problem is it solving, and why — e.g., "find the move that maximizes
expected outcome under the rules of chess"), *algorithmic* (what representations and processes —
e.g., minimax search over a game tree with alpha-beta pruning), and *implementational* (what physical
substrate runs it — e.g., GPU tensor cores evaluating a neural network). A claim like "this engine
runs the same search algorithm whether it's on a phone or a data-center cluster" is making a claim
that one of those levels stays fixed while another varies. Which level is being held fixed, and which
is varying? Answer before reading on; the solution confirms it.

---

### Two more terms, then the puzzle

**Massed practice**: concentrating all study or practice of one topic into a single session — cramming.
**Spaced (distributed) practice**: spreading the same total study across multiple sessions, separated
by real gaps of time. The **spacing effect** — one of the most replicated findings in memory research,
documented since Ebbinghaus's 1880s work — is that spaced practice produces better long-term retention
than massed practice for the *same total study time*, with the advantage often small right after
studying but large after a delay.

**Interleaving**: mixing practice of several related-but-distinct things within one session, instead of
completing one fully before starting the next ("blocked" practice). It typically feels *worse* in the
moment (more effortful, more errors) but produces better long-term retention and — specifically —
better ability to tell *which* technique a new, unlabeled problem calls for.

### The puzzle

Lesson 15 established that a chunk's activation sums a term over every past use: B = ln(Σᵢ tᵢ^(−d)).
Lesson 16 established that a genuine retrieval attempt — reconstructing something under effort, not
just re-reading it — counts as one of those uses.

Here's the question neither lesson answered: **does it matter how far apart two uses of the same
chunk are?** Consider two review schedules for the same fact, each adding exactly one more retrieval
attempt on top of the original encoding:

- **Schedule 1**: review the fact again 1 hour after first learning it.
- **Schedule 2**: review the fact again 3 days after first learning it.

Both add exactly one term to the activation sum. Using the mechanism from lessons 15–16 — specifically,
what "retrieval" actually requires to count as effortful reconstruction rather than something closer
to recognition — explain why Schedule 2's review is a more valuable use-event than Schedule 1's,
despite both being, mechanically, "one more retrieval." Then state the one concrete design rule this
implies for *when* a review should be scheduled relative to how much the earlier trace has already
decayed — not "spacing is good," but the specific condition a good spacing schedule needs to satisfy.
