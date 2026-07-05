---
title: "Solution: Scoring the Agenda"
description: "K1 wins at 0.45: why cheap-and-credible beats expensive-and-uncertain, and how BB1 turned the scheduler itself into a blackboard."
lesson_number: 6
track: cog
concept: "Blackboard control & the agenda"
stage: 1
layout: solution
role: solution
builds_on: [4, 5]
skin: chalkboard
resources:
  - title: "Hayes-Roth (1985) — A Blackboard Architecture for Control (Artificial Intelligence journal)"
    url: https://www.sciencedirect.com/science/article/pii/0004370285900633
    note: "the original BB1 paper — control knowledge as blackboard hypotheses"
---

**0.45** — from K1: extend the confident "seven" island, credibility 0.9 ÷ cost 2 = 0.45.

The full scoreboard:

- K1: 0.9 / 2 = **0.45** ← winner
- K2: 0.4 / 5 = 0.08
- K3: 0.3 / 1 = 0.3

K1 wins comfortably, and the reason is worth sitting with: K3 is the *cheapest* option on the
table, and K2 has more raw credibility than K1's cost would suggest — but **priority isn't just
credibility, and it isn't just cost, it's their ratio**. K1 is both fairly cheap *and* highly
credible, which is exactly the combination a resource-limited system should chase first. Re-reading
weak segment data (K2) might be worth doing eventually, but not before a cheap, near-certain win is
sitting on the table. This is the agenda doing, quantitatively, what lesson 5's "grow from the
island" did qualitatively: cheap, confident, well-supported extensions get scheduled ahead of
expensive long shots.

**Why this matters more than it looks.** In a production system (lesson 3), conflict resolution
picked *one rule* by a fixed policy (specificity). Here, the scheduler is choosing among
*heterogeneous, expensive actions* — reprocessing signal, proposing hypotheses, re-rating old ones
— where the cost of running the wrong one first is real (limited compute, real-time constraints,
a user waiting). Credibility ÷ cost is a toy version of what real blackboard schedulers compute;
production systems like Hearsay-II and its successors used considerably richer scoring — factoring
in how *strategic* a hypothesis is (does it bridge two established islands?), how *urgent*
(is a deadline close?), and how *novel* (has this KS already tried and failed here?).

**BB1's escalation.** Hayes-Roth's BB1 architecture noticed that the scheduler *itself* is just
another piece of expert knowledge — "when several strong hypotheses compete, prefer extending
the more central one" is a rule, exactly like a KS's trigger condition. So BB1 put scheduling
strategies on a **second blackboard**, the control blackboard, populated with hypotheses *about
strategy* (e.g., "currently in island-extension mode" vs. "currently in verification mode") that
KSs could read, propose changes to, and reason about — the same architecture, recursively applied
to itself. Control stopped being a hard-coded formula and became something the system could
notice wasn't working and revise.

**For your harness:** this is the difference between an orchestrator with a hard-coded "always
try tool X before tool Y" and one that scores pending actions by something like expected-value ÷
cost, re-ranking as the situation changes — and BB1's move is choosing to expose *that scoring
policy itself* as inspectable, adjustable state, rather than logic buried in the loop.

**Where this goes:** you've now seen when blackboards need to exist (lesson 4), what they hold
(lesson 5), and how they choose what to do (this lesson). Next: when this whole architecture is
overkill — and what tells you a plain pipeline would have been fine.
