---
title: "Two Systems, One Architecture Question"
description: "Blackboards aren't free — decide, for two concrete systems, whether the overhead is worth paying."
lesson_number: 7
track: cog
concept: "Blackboard vs. pipeline/message-passing"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [4, 5, 6]
skin: chalkboard
---

Three lessons in, the blackboard architecture (shared hypothesis board, independent knowledge
sources, a scored agenda deciding what runs next) looks like a strictly better pipeline. It
isn't — it's a strictly *more expensive* one, in engineering cost (build a hypothesis
representation, write a scheduler, debug non-deterministic run orders) and in runtime cost
(the agenda-scoring overhead lesson 6 traced by hand doesn't happen for free). A plain
**pipeline** — or its more general cousin, a fixed **message-passing** graph of stages, each
handing a finished result downstream — is simpler to build, easier to debug (deterministic order,
one stage at a time), and cheaper to run, whenever it's adequate to the problem.

So: adequate *when*? Sketch an answer for each system below — pipeline/message-passing, or
blackboard — and, more importantly, **why**:

**System A — Invoice intake.** Scanned invoices come in; the system must extract vendor name,
date, line items, and total, then hand a structured record to accounting. OCR runs on the whole
page once; a vendor-name extractor, a date extractor, and a line-item extractor each look at
their own region of the (now-text) page. None of their outputs changes what any other extractor
should look for.

**System B — Emergency-room differential diagnosis support.** A patient presents with symptoms;
imaging, lab results, and history arrive at different times, from different departments, at
different confidence levels. A tentative reading of an X-ray can and should change which lab
result gets prioritized next; a lab result can resurrect a diagnosis the imaging alone had ruled
out; the *order* evidence arrives in is unpredictable and nothing can wait for everything else to
finish before contributing.

For each: which architecture, and what specific property of the problem decided it?
