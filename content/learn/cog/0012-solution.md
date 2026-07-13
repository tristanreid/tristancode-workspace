---
title: "Solution: Never Solve the Same Impasse Twice"
description: "Graded declarative memory vs all-or-nothing compiled rules — two committed, incompatible bets about what remembering even is."
lesson_number: 12
track: cog
concept: "SOAR II: chunking as learning"
stage: 2
layout: solution
role: solution
builds_on: [10, 11]
skin: chalkboard
resources:
  - title: "Newell — Unified Theories of Cognition (1990), Ch. 4 (SOAR)"
    url: https://stanford.edu/~jlmcc/papers/PDP/Volume%201/Chap4_PDP86.pdf
    note: "background on the parallel-vs-symbolic architecture debates SOAR and ACT-R both entered"
---

**Correct: ACT-R maintains a separate declarative memory with graded, activation-based retrieval;
SOAR compiles experience directly into new all-or-nothing production rules, with no separate
declarative store in the classic architecture.**

Both other mechanism-comparison options are wrong on the facts: SOAR clearly does learn (chunking
*is* its learning mechanism), so "only SOAR learns" is false, and chunking and base-level activation
are not the same thing — one produces a new discrete rule, the other continuously reweights an
existing fact's retrievability. "ACT-R only models procedural skill" is backwards, if anything —
ACT-R is unusual precisely for modeling *both* declarative and procedural memory as separate,
interacting systems.

**Why this is a real design bet, not a footnote.** Committing to "only production rules, nothing
else" (SOAR) versus "facts and rules are genuinely different kinds of memory" (ACT-R) isn't a
style choice — it's a claim about the mind with testable consequences. ACT-R's bet lets it predict
things SOAR's architecture doesn't naturally produce: partial, graded recall (a name on the tip of
your tongue — retrievable, but weakly, exactly what lesson 10's negative-but-not-infinitely-negative
activation captured), and forgetting that's continuous rather than all-or-nothing. SOAR's bet
predicts something different: skills that are either fully automatic (chunked, instant) or fully
effortful (not yet chunked, requires full deliberate subgoal search) — a much sharper line than
ACT-R's smooth activation curve, and a genuinely different empirical claim about how skill
acquisition should *feel* and *time out* as it develops.

**Neither architecture is simply "more right."** Chunking's crisp automatization story fits
skill-acquisition data (a novice driver's effortful gear-shifting becoming instant reflex) better
than a smoothly graded activation curve would predict for that kind of case. ACT-R's graded
activation fits partial/uncertain recall (the tip-of-the-tongue state, or confidently misremembering
a barely-active fact) that a strictly binary "chunked or not" story struggles to represent at all.
Real cognition seems to need both flavors of forgetting-and-remembering somewhere — which is a live,
unresolved argument between the two research communities, not settled by either architecture alone.

**In a modern LLM agent harness**, chunking rhymes with caching a resolved sub-task's answer as a
reusable fixed procedure (a memoized tool call, a saved successful plan) so the *next* occurrence
skips straight to the cached result — while a separate, editable memory store the agent can also
consult, reason over, and update mid-task (not baked into fixed behavior) is closer to ACT-R's
declarative side. Harnesses that only cache-and-replay lean SOAR; harnesses with a queryable memory
store lean ACT-R — most real systems, tellingly, end up wanting both.

**Where this goes:** last lesson in this stage steps back from either architecture's internals to
ask the harder question — how well do either of these detailed mechanisms actually predict real
human timing and error data, and where do they fall short?
