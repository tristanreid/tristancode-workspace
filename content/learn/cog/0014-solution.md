---
title: "Solution: The Winner With Nothing Left to Win"
description: "K2 wins at 0.18 once value enters the score — and why raising the cost of a repeated action was never going to fix a missing-value bug."
lesson_number: 14
track: cog
concept: "Blackboard control: agenda scoring needs a value term"
stage: 1
layout: solution
role: solution
builds_on: [4, 5, 6]
skin: chalkboard
resources:
  - title: "Hayes-Roth (1985) — A Blackboard Architecture for Control (Artificial Intelligence journal)"
    url: https://www.sciencedirect.com/science/article/pii/0004370285900633
    note: "the BB1 paper — control knowledge, including scoring policy, as first-class and revisable"
---

**Retrieval check answer.** R1 fires first (2 conditions match, most specific): heater → on. Now R2
matches (2 conditions: heater=on, fan=off) and R3 also matches (1 condition: room=cold) — R2 wins on
specificity, fires: fan → on. Now only R3 matches (room is still cold — the thermostat doesn't fix
the room, just the equipment) — R3 fires: log-reading. Now WM is `{room: cold, heater: on, fan: on}`
plus the log entry, and only R3's condition (`room=cold`) still holds, but R3 already fired and adds
nothing new to the world — if your production system treats "already logged" as consumed, nothing
new matches and the cycle halts after **3 firings**. (If R3 can refire indefinitely because nothing
ever changes `room`, you've just found the exact pathology this lesson is about: a matched rule with
positive credibility that has nothing left to contribute.)

---

### The main computation

Priority = credibility × value ÷ cost:

- K1: 0.95 × 0.005 ÷ 1 = **0.00475**
- K2: 0.60 × 0.60 ÷ 2 = **0.18** ← winner
- K3: 0.50 × 0.20 ÷ 1.5 ≈ **0.0667**

K2 — extending into the uncovered two seconds of signal — wins once value enters the score, by a wide
margin. K1, the previous runaway winner, collapses to essentially zero: it's still cheap and still
reliable, but reliably cheap at doing almost nothing is worth almost nothing.

**Why "raise the cost of repetition" was the wrong diagnosis.** That patch treats the *symptom*
(the same action keeps winning) as the *disease*. But nothing about K1 winning repeatedly is
inherently wrong — a KSAR *should* win repeatedly if it keeps producing real value (imagine K1 were
instead extending a growing island outward, which lesson 6 correctly rewarded turn after turn). The
actual defect is scoring an action's *plausibility and price* while never asking what it would
*change*. A cost penalty on repetition would eventually suppress K1 whether or not it still had value
left — and would do nothing for K3, or for a fourth KS whose action costs nothing at all but still
touches an island that's already saturated. Fixing cost patches one symptom, per action, temporarily.
Fixing value fixes the actual scoring function, for every action, permanently.

**The general shape of the bug:** any score built only from *how likely* and *how cheap* an action is
will happily spend forever on cheap, reliable, zero-marginal-value work — a lint pass on a file with
no lint errors left, a retry loop on a request that already succeeded, a "double-check" step on a
result nothing else disputes. The fix is never "penalize doing it again"; it's "reward what doing it
*again* would actually change." Coverage of the unaddressed and expected improvement to the best
current interpretation are two concrete forms that value term can take — credibility and cost never
capture either one, no matter how you tune them.

**For your harness:** an orchestrator that ranks pending tool calls by "how likely to succeed × how
cheap" will converge on re-running your cheapest, most reliable tool against whatever it's already
solved, while genuinely unexplored parts of the problem sit untouched — the fix isn't a repetition
penalty (which just delays the same failure), it's scoring tools by the expected information or
progress a call would add, given what's already known.

**Where this goes:** next lesson takes on the twin misdiagnosis in ACT-R's activation math — treating
a decay *exponent* as though it were a per-use counter — with the same cure: read the formula's terms
for what they actually are, not for what intuition assumes they must be.
