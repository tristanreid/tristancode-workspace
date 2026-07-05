---
title: "The Blackboard, Fifty Years Later"
description: "Map a modern multi-agent LLM harness onto Hearsay-II's architecture — then find the one piece that has no clean 1970s analogue."
lesson_number: 8
track: cog
concept: "Blackboards in modern agent harnesses"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [4, 5, 6, 7]
skin: chalkboard
---

Picture a typical modern multi-agent LLM system: an **orchestrator** model breaks a task into
subtasks; several **sub-agents** (or tool calls) each work a piece and post results back to a
**shared context / scratchpad**; the orchestrator reads what's been posted, decides what's still
needed, and dispatches the next round — repeating until the task looks done.

You already have the vocabulary to map this exactly:

- What on the blackboard-architecture side plays the role of the **blackboard** itself?
- What plays the role of **knowledge sources**?
- What plays the role of **control** (the agenda, focus of attention)?
- What plays the role of a **hypothesis** (recall: a claim, with a confidence, linked to its
  support)?

Do that mapping for yourself first — it should feel almost too easy, which is the point: this
track has been arguing the correspondence is real, not decorative.

Then the harder question, the one without a ready-made 1970s answer: **name one property of the
modern setup that Hearsay-II's designers never had to deal with, and explain what it changes about
the design.** (Hint: think about what a "hypothesis" *is* in each system, and who — or what — is
doing the matching.)
