---
title: "Solution: The Architecture That Refuses to Get Stuck"
description: "Universal subgoaling — the same problem-space machinery that runs everything else also runs 'figure out what to do when stuck'."
lesson_number: 11
track: cog
concept: "SOAR I: problem spaces, universal subgoaling, impasses"
stage: 2
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
resources:
  - title: "Laird, Newell & Rosenbloom — SOAR: An Architecture for General Intelligence (1987)"
    url: https://www.jstor.org/stable/25000826
    note: "the original architecture paper; the impasse/subgoal machinery is the core contribution"
---

**Correct: automatically create a subgoal, in a new problem space, whose job is to decide between
the two operators.**

Why not the others: a random pick (option 1) throws away information the architecture actually has
access to — the subgoal search might discover, say, that one operator leads somewhere the other
doesn't, information invisible if you'd just flipped a coin and moved on. Halting (option 2) treats
getting stuck as a bug; SOAR treats it as the *normal*, expected shape of a hard decision. Applying
both (option 4) isn't coherent for actions with real, possibly conflicting effects on a single
state.

**The elegance is architectural, not just procedural.** SOAR could have bolted on a special-purpose
"tie-breaking module" separate from its normal reasoning. It didn't. An impasse just becomes a new
*problem*: a new state (the tied situation itself), new operators available for reasoning about it
(maybe "look up which operator worked last time in a similar state," itself possibly requiring
*another* subgoal), and a goal test ("an operator preference has been decided"). Resolving that
subproblem returns a result to the level above, the original impasse clears, and normal operation
resumes — exactly the way a stack frame returns a value and execution resumes in the caller. Deeply
nested impasses (a subgoal that itself hits an impasse, recursively) are not a special case to
handle; they're just what the same one mechanism does when applied to itself.

**Why "universal."** The name isn't marketing — Newell's argument was that *every* known
impasse-type in intelligent behavior (operator tie, operator not applicable, operator's result
unknown, goal not yet reached) reduces to "spin up a problem space for this" with no exceptions
required. One mechanism, applied recursively, was Newell's specific bet about what "unified theory
of cognition" should mean architecturally: not many special modules, but one generative mechanism
producing all the special-looking behavior as instances.

**In a modern LLM agent harness**, this rhymes with an agent that, upon finding no clear next tool
call (ambiguous instructions, two plausible interpretations), spins up a sub-task — "first determine
which interpretation is intended" — using the same reasoning loop as the main task, rather than a
bespoke disambiguation routine wired in separately. The parallel is the *architectural* choice,
not a specific implementation: reuse the general reasoning loop for meta-reasoning about the loop
itself, instead of hand-coding a separate escape hatch.

**Where this goes:** next lesson asks what SOAR does with the *result* of one of these subgoal
searches once it's solved — and it isn't just "apply it and forget it."
