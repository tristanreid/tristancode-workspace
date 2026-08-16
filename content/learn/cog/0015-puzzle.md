---
title: "Why 'Doctor' Makes You Faster to Recognize 'Nurse'"
description: "Activation doesn't just sit in the chunk you retrieved — it spreads to associated chunks, priming them for faster retrieval. Compute it with ACT-R's own formula."
lesson_number: 15
track: cog
concept: "Spreading activation & priming"
stage: 3
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [10, 14]
skin: chalkboard
numeric:
  question: "Working memory holds 2 source chunks (W = 0.5 each). Associative strengths to the target chunk 'nurse': S(doctor→nurse) = 2.0, S(medicine→nurse) = 1.5. Base-level activation B('nurse') = 0. What is nurse's total activation A?"
  answer: 1.75
  tolerance: 0.01
---

Lesson 14 established that retrieval strengthens the trace being retrieved. This lesson covers a
related but distinct effect: retrieving (or even just perceiving) one item makes *related* items
easier to retrieve too — before you've consciously tried to recall them at all.

**Terms (standalone):**

- **Priming**: exposure to one stimulus (the *prime*) speeds up or biases processing of a related
  stimulus that follows (the *target*) — even when the prime is irrelevant to the task and the
  effect is unconscious. The classic demonstration (Meyer & Schvaneveldt, 1971): people judge
  "nurse" as a real word faster after seeing "doctor" than after seeing an unrelated word like
  "bread," in a simple word/non-word judgment task.
- **Spreading activation**: the proposed mechanism behind priming. Memory is modeled as a network of
  chunks connected by associative links. When a chunk becomes active (because it's currently in
  working memory — you just perceived it or retrieved it), some of its activation "spreads" along
  its links to associated chunks, raising *their* activation too — making them faster/easier to
  retrieve next, even before any deliberate retrieval attempt targets them.
- **ACT-R's activation equation** (extending Lesson 10): a chunk `i`'s total activation is
  `A_i = B_i + Σⱼ (Wⱼ × Sⱼᵢ)` — its own base-level activation `B_i` (from Lesson 10: how recently
  and frequently it's been used), **plus** a spreading-activation term: a sum, over every source
  chunk `j` currently in working memory, of that source's attentional weight `Wⱼ` (how much
  attention it's getting — with `n` sources typically splitting attention as `Wⱼ = 1/n` each)
  times the associative strength `Sⱼᵢ` between source `j` and target `i`. Chunks strongly
  associated with something currently "in mind" get a activation boost — measurably, mechanically,
  before you've retrieved them at all.

### Part 1 — Numeric (above): compute the activation

Working memory currently holds 2 chunks — say you just read the words "doctor" and "medicine."
Each gets an attentional weight `Wⱼ = 1/2 = 0.5` (attention split evenly across the 2 sources).
Associative strengths to the target chunk **nurse**: `S(doctor→nurse) = 2.0`,
`S(medicine→nurse) = 1.5`. Nurse's own base-level activation `B = 0` (imagine it hasn't been
retrieved directly in a while).

Compute nurse's total activation: `A = B + Σ(Wⱼ × Sⱼᵢ)`.

---

### Part 2 — Compare to an unprimed word

Now compute the activation of an unrelated chunk, **bread**, under the same working-memory contents
(doctor and medicine both active, `W = 0.5` each), with `S(doctor→bread) = 0.1`,
`S(medicine→bread) = 0.1`, and the same `B = 0`.

Given Lesson 10's rule (higher activation → faster, more likely retrieval, roughly proportional to
activation level, with retrieval time decreasing as activation increases), which word — nurse or
bread — would you expect to be recognized faster right now, and by roughly how much does the
activation gap suggest?

---

### Part 3 — Reveal: why does priming decay, and why does it matter for design?

Priming effects are temporary — the "doctor" boost to "nurse" fades within seconds to minutes as
attention moves on and doctor/medicine leave working memory (their `W` effectively drops toward 0
as they're no longer active sources). Propose a reason spreading activation is built to *decay*
quickly rather than permanently strengthening every associate of everything you've ever thought
about. What would go wrong with memory retrieval if primed activation never faded?

---

### Part 4 — Connect to a modern AI system

**In a modern LLM agent harness**, is there a structural analogue to spreading activation — some
mechanism by which processing one piece of information measurably biases or speeds up the
processing of related information, without an explicit separate retrieval step? Name one candidate
mechanism (in the model's architecture, or in the harness's own design) and explain what's similar
and what's importantly different from the priming/decay story above.
