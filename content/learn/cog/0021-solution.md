---
title: "Solution: Two Systems, or One System With a Threshold?"
description: "The macro path is procedural firing; the planning-loop fallback is SOAR's impasse-triggered subgoaling — and 'things got hard' is what dual-process theory hand-waves that an explicit impasse test does not."
lesson_number: 21
track: cog
concept: "Dual-process accounts: what System 1/2 explains, and what it hand-waves"
stage: 5
layout: solution
role: solution
builds_on: [9, 11, 12]
skin: chalkboard
---

**Retrieval check answer.** **5 chunks** — one per hyphen-delimited group (`f47ac10b`, `58cc`, `4372`,
`a567`, `0e02b2c3d479`) — down from 32 individual characters, the same move as lesson 2's
`FBI · CIA · NSA · IRS` and lesson 15's IPv4-by-octet: recode raw symbols into familiar units, and the
fixed slot count in working memory stops being the constraint.

---

### Part 1 — the mapping

**System 1 ≈ running a cached macro. System 2 ≈ the full planning loop.** Fast, automatic, no visible
deliberation vs. slow, effortful, step-by-step — the surface description fits cleanly.

Re-mapped onto this track's actual machinery: **running a matched macro is procedural firing**
(lesson 9) — a compiled IF–THEN disposition that executes the moment its trigger pattern is recognized,
with no separate act of reasoning about *whether* to run it, exactly like the barista's wand-angling
habit or the chess player's "IF pinned THEN don't move it." **Falling back to the full planning loop is
SOAR's impasse-triggered universal subgoaling** (lessons 11–12): no macro applies, or two apply with no
basis to prefer one — that's precisely SOAR's definition of an impasse — and the response isn't a
different, ad hoc "slow mode" bolted on, it's spinning up a genuine problem-space search whose entire
job is to resolve the impasse. If that search succeeds, SOAR's **chunking** would compile the result
into a brand-new macro, so the identical situation never has to hit the slow path again — the agent's
macro library growing over time is chunking, not a separate "learning module."

### Part 2 — what dual-process theory hand-waves

Dual-process theory correctly names *that* processing shifts from fast to slow under some conditions —
"when things get hard," "when System 1 isn't confident," "when stakes are high" are the usual
gestures. **What it doesn't specify is the actual triggering condition** — a precise, checkable test
for the exact moment control should hand off from one mode to the other. It's a description of two
styles of output, not a mechanism for the switch between them.

SOAR's impasse is that mechanism, made explicit: the switch fires exactly when **no production matches
the current state**, or **more than one matches and nothing in memory prefers one over the rest**, or
**an operator's effects aren't yet known**. Not a vibe, not a confidence threshold tuned by feel — a
structural test on the current match set.

**The exact condition for the coding agent:** fall back to the full planning loop precisely when
either (a) **no cached macro's trigger pattern matches** the incoming request closely enough, or
(b) **two or more macros match and nothing in the agent's history or context prefers one over the
other** — a tie, in exactly SOAR's sense. Anything short of that (a single macro matches cleanly) stays
on the fast, procedural path; anything at or past it triggers the slow, deliberate one. That's a
condition you could actually implement and test against, which "when it feels hard" never was.

**Why this matters beyond taxonomy.** Dual-process theory is genuinely useful as a first-pass
description — it correctly predicts that people (and agents built this way) will have a fast,
error-prone-but-usually-right mode and a slow, effortful-but-more-reliable mode, and that the two
produce systematically different failure signatures (System-1-style errors are misfires — a habit
triggering on something that only looks like its usual pattern, exactly lesson 9's pin-avoidance
mislead; System-2-style errors are the well-documented human costs of effortful search under time
pressure). What it can't do is tell you, mechanistically, *when* the switch happens or *why* it happens
then and not a moment earlier or later — and that's exactly the gap a cognitive architecture is built
to close, because an architecture has to actually run, which means the switch has to be a checkable
condition on a data structure, not a description of the output it produces.

**Where this goes:** satisficing (lesson 19), representativeness (lesson 20), and this System-1/System-2
split are all accounts of judgment *within* a fixed way of seeing a problem. The concept still ahead —
**ecological rationality** — asks a sharper question about all of them: a heuristic that looks like a
bias in one environment can be the objectively correct move in another, which means "biased" was never
a property of the heuristic alone. That's next week's opening move in Stage 5.
