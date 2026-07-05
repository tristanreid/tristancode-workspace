---
title: "Solution: The Blackboard, Fifty Years Later"
description: "The mapping is exact — except for one thing: the knowledge sources got general intelligence, and that changes what 'confidence' even means."
lesson_number: 8
track: cog
concept: "Blackboards in modern agent harnesses"
stage: 1
layout: solution
role: solution
builds_on: [4, 5, 6, 7]
skin: chalkboard
resources:
  - title: "Anthropic — Building effective agents"
    url: https://www.anthropic.com/research/building-effective-agents
    note: "modern multi-agent/orchestrator patterns, described without the 1970s vocabulary — translate as you read"
---

**The mapping:**

| Blackboard concept | Modern harness analogue |
|---|---|
| Blackboard | Shared context window / scratchpad / conversation state |
| Knowledge sources | Sub-agents, tool calls, individual model invocations |
| Control (agenda, focus of attention) | The orchestrator's dispatch loop — deciding which sub-agent or tool runs next |
| Hypothesis (claim + confidence + support links) | A tool result, sub-agent output, or intermediate conclusion posted to context |

Read that table back against lesson 4's original list and it lines up piece for piece — this
track has been arguing that the harness you've built already re-derives 1976, and this is the
lesson where that claim gets cashed out explicitly rather than gestured at.

**What genuinely has no 1970s analogue: the knowledge sources stopped being narrow.** Every
Hearsay-II KS was a *specialist* — hand-written, single-purpose, matching one specific pattern
(this acoustic KS only ever proposes phonemes; it cannot also parse grammar). A modern sub-agent
or tool-calling LLM is a **general reasoner** that can, in principle, do any KS's job depending on
how it's prompted — the boundary between "knowledge source" and "control" gets blurry, because
the same general model that's proposing a hypothesis can also be the one deciding what to do about
it. Hearsay-II's designers had to hand-craft dozens of narrow experts *because* nothing available
in 1976 could flexibly do many kinds of reasoning; that constraint doesn't exist anymore, and its
absence changes the design problem from "decompose the domain into experts" to "decide how much to
decompose at all" — over-decomposing into needless narrow sub-agents is now a real anti-pattern,
where it used to be the only option.

**A second consequence worth naming (the hint's real target): what "confidence" is.** Hearsay-II's
hypotheses carried an explicit, engineered numeric confidence that the scheduler (lesson 6) could
do arithmetic on — credibility ÷ cost was a real, well-defined computation. A modern tool result or
sub-agent output is usually **natural language**, with no comparably principled confidence
attached (a model can be asked to *say* how sure it is, but that self-report is not the same kind
of calibrated, cause-linked number lesson 6's KSARs carried). Losing that number is a real cost —
the elegant priority arithmetic doesn't transfer cleanly — and it's exactly why prompt-engineering
an orchestrator to explicitly request and weigh confidence, or building an external scoring layer,
recreates by hand something the 1976 architecture got for free by construction.

**What carries over untouched:** the core architectural bet — that opportunistic, evidence-driven
control beats a fixed pipeline whenever sub-results need to revise each other — is exactly as true
for LLM harnesses as it was for speech. What changed is *what's cheap and what's expensive*:
narrow specialists used to be the only option and are now optional; principled numeric confidence
used to be free and is now the part you have to engineer back in.

**Where this goes:** Stage 1 built the blackboard payoff from the ground up — anatomy, control,
when it's warranted, where it landed today. Stage 2 goes back a level, into the *integrated
cognitive architectures* (ACT-R, SOAR) that took production systems and grew them into full models
of a mind — starting with ACT-R's split between what you know and how you act on it.
