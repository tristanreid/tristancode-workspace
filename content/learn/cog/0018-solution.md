---
title: "Solution: Change One Requirement, Flip the Architecture"
description: "The original CI pipeline stays a pipeline despite branching; letting a test result reopen and overturn a linter's already-final verdict is what flips it to a blackboard."
lesson_number: 18
track: cog
concept: "Blackboard vs. pipeline: mutual revision, not predefined order"
stage: 1
layout: solution
role: solution
builds_on: [4, 5, 6, 7]
skin: chalkboard
resources:
  - title: "Corkill (1991) — Blackboard Systems (AI Expert)"
    url: https://corkills.org/publications/pdf/1991_ai-expert.pdf
    note: "a practitioner's decision guide for when to reach for a blackboard, from one of BB1's co-designers"
---

**Retrieval check answer.** The wand-angling habit is **procedural** — a compiled disposition to act a
certain way when a pattern is recognized, not a fact she consciously states. The oat-milk-temperature
rule is **declarative**: she can say it as "X is true," even though she also acts on it.

---

### Question 1 — the original pipeline

**Pipeline.** Lint → type-check → tests → deploy-approval is a **DAG**: every stage's outcome only
ever decides *which forward path executes next* — retry, skip, block — and no stage's own verdict is
ever revisited once rendered. The lint stage's "pass" is final the moment it's produced; nothing later
in the graph rewrites it. That's the actual deciding property, and it's worth restating precisely
because it is *not* "the sequence is predefined." The sequence here already isn't fully
predefined — a failing test dynamically routes to a different sub-path than a passing one — and it's
still a pipeline. **Branching on an outcome, and revising a settled outcome, are different acts.**
Branching picks a road at a fork; revision goes back and repaints a sign at a fork you already drove
through.

### Question 2 — the flip

**Blackboard, and here's the exact mechanism that earns the label.** Once a test result can cause the
linter to re-examine files it already passed — with a different rule set, potentially changing that
earlier verdict — the lint stage's output is no longer final the moment it's produced. It's a
hypothesis ("these files pass style/safety checks") that a *later* stage's finding (test evidence
suggesting a race condition) can **overwrite**. And that revised lint verdict could, in principle,
change what needs re-testing, which could surface a new signal that sends another discipline back to
recheck something else — the revision doesn't have a bounded, knowable number of rounds or a fixed
order in which they happen, which is exactly lesson 7's forcing property: **hypotheses that must
mutually revise each other, in an order you can't fix in advance.**

**Why this is categorically different from the original branching**, stated as sharply as possible:
the original pipeline's "retry the flaky test" branch never asked the *linter* to reconsider anything —
it only asked "which stage runs next," and the linter's already-rendered verdict was never in play
again. The new requirement asks a *later* stage's evidence to **change an earlier stage's conclusion**,
which is precisely the back-edge lesson 7 called the tell: "if you catch yourself adding a 'go back and
re-check stage 2' edge to a pipeline diagram, that's the architecture asking to be a blackboard." One
such edge, and you no longer have a DAG with fixed final outputs per stage — you have hypotheses
(lint's verdict, the test's verdict) that reference and revise each other, run through a scheduler that
decides which reconsideration is worth doing next (exactly lesson 6's agenda, scoring "should the
linter re-run on these three files" against everything else pending) — a blackboard, whether or not
anyone architecting the CI system chooses to call it one.

**The general test, restated once more for good measure:** never ask "is the order fixed?" — branching
already breaks that question without changing the architecture. Ask **"can a later result overwrite an
earlier stage's own conclusion, and can that overwrite itself be overwritten?"** Yes, unboundedly and
unpredictably → blackboard. No, however elaborate the branching gets → pipeline, still, just a fancier
one.

**Where this goes:** architecture questions give way to something more basic — why any agent, human or
artificial, stops evaluating options at all rather than searching for the provably best one. That's
Simon's satisficing, next.
