---
title: "Solution: Two Systems, One Architecture Question"
description: "The deciding property isn't domain, size, or 'AI-ness' — it's whether results need to revise each other once posted."
lesson_number: 7
track: cog
concept: "Blackboard vs. pipeline/message-passing"
stage: 1
layout: solution
role: solution
builds_on: [4, 5, 6]
skin: chalkboard
resources:
  - title: "Corkill (1991) — Blackboard Systems (AI Expert)"
    url: https://corkills.org/publications/pdf/1991_ai-expert.pdf
    note: "a practitioner's decision guide for when to reach for a blackboard, from one of BB1's co-designers"
---

**System A — pipeline (or a simple message-passing graph).** OCR → {vendor extractor, date
extractor, line-item extractor} → assemble record. Each extractor's output never needs revision
by another's: the vendor name doesn't get more or less plausible because the total was found. Once
you've read the page, every downstream step is a **one-way, non-reciprocal** transformation. A
blackboard here buys nothing — no bidirectional inference is needed because nothing is genuinely
ambiguous *relative to another stage's finding* — and it costs real complexity: someone has to
justify why "date extractor" is a knowledge source instead of a function call.

**System B — blackboard.** Exactly lesson 4's forcing property, restated in medicine: errors and
ambiguity at every source, arriving in unpredictable order, where a hypothesis at one level
(a shadow on an X-ray) must be able to **revise the priority of another** (order this specific
lab test next) and be revisable *in turn* by what comes back. A pipeline would have to guess a
fixed processing order in advance (imaging, then labs, then history?) — but the whole clinical
reality is that the right order is discovered *during* diagnosis, not known beforehand. That's
islands of certainty again: a confident finding anywhere should redirect effort, regardless of
which "stage" it technically belongs to.

**The deciding property, generalized:** it is never "AI vs. not-AI," "hard problem vs. easy
problem," or "many components vs. few." It's a single question — ***do intermediate results need
to revise each other once posted, in an order you can't fix in advance?*** If a stage's output is
final the moment it's produced, message-passing is correct and a blackboard is over-engineering
(added latency from scheduling overhead, added debugging cost from non-deterministic run order,
for a benefit — bidirectional revision — the problem doesn't use). If results are genuinely
provisional and mutually informative, a fixed pipeline is under-engineering: it will either lock
in early mistakes (frozen decisions, lesson 4's failure mode) or require an ever-growing tangle of
special-case backward edges bolted onto what was supposed to be one-way — at which point you've
built a blackboard anyway, just without admitting it or getting the scheduler's benefits on purpose.

**A useful tell, mid-design:** if you catch yourself adding a "go back and re-check stage 2" edge
to a pipeline diagram, that's the architecture asking to be a blackboard. One such edge, tolerate
it. Several, converging from different stages onto the same shared state — that's the blackboard
pattern, arriving whether you named it or not.

**Where this goes:** the same question, aimed at present-day systems — multi-agent LLM harnesses,
shared scratchpads, tool results treated as hypotheses. What of this architecture carries over
unchanged, and what did modern tooling actually replace?
