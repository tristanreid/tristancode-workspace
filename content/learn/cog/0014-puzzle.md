---
title: "The Winner With Nothing Left to Win"
description: "A credibility/cost scheduler keeps picking the same near-perfect island to polish. The bug isn't repetition — it's a missing value term. Add it and rescore."
lesson_number: 14
track: cog
concept: "Blackboard control: agenda scoring needs a value term"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [4, 5, 6]
skin: chalkboard
numeric:
  question: "Once a value term is added to the score, what priority does the new winning KSAR receive?"
  answer: 0.18
  tolerance: 0.005
  unit: "priority score"
---

**Retrieval check (from lesson 3, new setting).** A thermostat runs a tiny production system —
condition→action rules over a working memory of facts, picking one matched rule per cycle (recall
lesson 3: this is the **recognize–act cycle**). Working memory: `{room: cold, heater: off, fan: off}`.
Rules: `R1: IF room=cold AND heater=off THEN heater=on`. `R2: IF heater=on AND fan=off THEN fan=on`.
`R3: IF room=cold THEN log-reading` (matches but changes nothing visible; conflict resolution favors
the *most specific* — most-conditions — match). In what order do rules fire, and how many cycles run
before nothing new matches? Work it out before reading on — the solution confirms it.

---

### Back to the blackboard

Lesson 6 built a **blackboard** — a shared workspace holding hypotheses at multiple levels, each with
a confidence — worked on by independent **knowledge sources (KSs)**, specialist modules that fire
when their trigger condition matches something currently on the board. Whenever a KS *could* fire, a
**KSAR** (knowledge-source activation record) is queued on the **agenda**: "KS X could fire on
hypothesis Y." Control's job, every cycle, is to score the pending KSARs and run the best one —
**focus of attention**.

Lesson 6 used the heuristic **priority = credibility ÷ cost**: favor actions that are both likely to
be right and cheap to try. That heuristic has a real failure mode, and it's not the one it looks like.

**The pathology.** A speech-understanding system has an island hypothesis — a stretch it's already
99% confident is the word "seven" — sitting at confidence 0.99. Three KSARs are pending:

| KSAR | What it would do | Credibility | Cost |
|---|---|---|---|
| K1 | Re-verify the "seven" island (already at 0.99) against the acoustic model one more time | 0.95 | 1 |
| K2 | Extend into the *first two seconds* of signal, which currently has no hypothesis at all | 0.60 | 2 |
| K3 | Re-rate a mid-confidence island currently sitting at 0.70 | 0.50 | 1.5 |

Score credibility ÷ cost: K1 = 0.95, K2 = 0.30, K3 = 0.33. **K1 wins, every cycle, forever** — it's
cheap and the KS that runs it is reliable. So the scheduler spends cycle after cycle re-verifying a
hypothesis that was already essentially certain, while two seconds of the utterance never gets looked
at. (This is the same pattern as a linter that keeps re-running on a file that already passes every
rule, because "cheap and reliable" scores well regardless of whether there's anything left to find.)

**The tempting wrong fix:** "the problem is repetition — raise K1's cost every time it runs, so it
stops winning." That patches *this* KSAR, *this* cycle. It does nothing about K3 doing the same thing
next week on a different island, or about a KS whose action is genuinely free to run (cost ≈ 0) but
still contributes nothing. Cost was never the broken variable.

**What credibility ÷ cost is missing:** a **value** term — the expected *change* this action would
make to the global interpretation. Re-verifying a 0.99 island can, at best, nudge it to maybe 0.995 —
tiny expected value, regardless of cost. Covering two seconds of currently-unexplained signal, by
contrast, has high value: it's the difference between "no hypothesis" and "some hypothesis," the
largest kind of improvement the board can register.

Revised scoring: **priority = credibility × value ÷ cost**, where value is the expected gain in
solution quality if the action succeeds:

| KSAR | Credibility | Value (expected gain) | Cost |
|---|---|---|---|
| K1 | 0.95 | 0.005 (0.99 → ~0.995) | 1 |
| K2 | 0.60 | 0.60 (closes an uncovered gap) | 2 |
| K3 | 0.50 | 0.20 (0.70 → plausible 0.90) | 1.5 |

Compute priority = credibility × value ÷ cost for all three, and report the winning score.
