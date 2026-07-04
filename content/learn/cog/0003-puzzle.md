---
title: "The Recognize–Act Cycle"
description: "Production systems — IF-THEN rules firing over a working memory — are the assembly language of cognitive architectures. Trace one by hand."
lesson_number: 3
track: cog
concept: "Production systems"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [2]
skin: chalkboard
mcq:
  question: "With \"most specific rule wins\" conflict resolution, which productions fire, in order?"
  options:
    - "P4, P4, P4, … — it always matches, so it always wins"
    - "P1, P2, P3 — and P4 never fires at all"
    - "P1, P4, P2, P4, P3 — P4 fires whenever nothing more urgent matches"
    - "P4, P1, P2, P3 — P4 fires once, then the specific rules take over"
  correct: 1
---

A **production system** is the simplest serious model of a thinking process, and the direct
ancestor of ACT-R, SOAR, expert systems, and (squint) your agent harness's dispatch loop. It has
three parts:

- **Working memory (WM)**: a set of facts — the system's current situation. (Deliberately named
  after last lesson's human buffer; Newell & Simon meant the correspondence.)
- **Productions**: IF–THEN rules. The IF side is a pattern over WM; the THEN side adds or removes
  facts (or acts on the world).
- **The recognize–act cycle**: (1) **match** — find all rules whose conditions hold; (2)
  **conflict resolution** — the matched set usually has more than one rule, and *some policy*
  must pick one; (3) **act** — fire it, changing WM. Repeat.

Note what's *not* here: no program counter, no call stack. Control flow is reborn every cycle
from whatever WM now contains — which is what lets these systems react opportunistically instead
of marching through a script. The price: when several rules match at once, the conflict-resolution
policy quietly becomes the system's personality.

Trace this one. **WM starts as:** `{goal: tea, kettle: empty}`

    P1: IF goal=tea AND kettle=empty                 THEN set kettle=full
    P2: IF goal=tea AND kettle=full AND NOT water=hot THEN set water=hot
    P3: IF goal=tea AND water=hot                    THEN add tea=made, remove goal
    P4: IF goal=tea                                  THEN check-phone   (adds nothing to WM)

Conflict resolution: **the rule with the most conditions (most specific match) wins**; the cycle
halts when no rule matches. Which rules fire, in what order?
