---
title: "Scoring the Agenda"
description: "Control is where a blackboard system's real intelligence lives — score three pending knowledge-source activations and find out which one runs next."
lesson_number: 6
track: cog
concept: "Blackboard control & the agenda"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [4, 5]
skin: chalkboard
numeric:
  question: "What priority score does the KSAR that runs next receive?"
  answer: 0.45
  tolerance: 0.01
---

Lesson 5 showed *what* the board holds — hypotheses at several levels, linked bottom-up and
top-down. This lesson opens **control**: the part deciding, cycle by cycle, which of the many
things a blackboard system *could* do, it actually does next.

Whenever a hypothesis changes, every knowledge source (KS) whose trigger condition now matches
gets recorded as a **KSAR** — a knowledge-source activation record: "KS X could fire, targeting
hypothesis Y, if scheduled." Unlike lesson 3's production system, a KSAR firing doesn't happen
immediately — it's placed on an **agenda**, a queue of pending, not-yet-executed opportunities.
Because dozens of KSARs can be pending at once and only one (or a few) can run per cycle, the
scheduler needs a way to rank them. That ranking is **focus of attention**: where the system's
limited effort goes right now.

A simple scoring heuristic — call it **priority = credibility ÷ cost** — favors KSARs that are
both likely to be *right* and *cheap* to try, over KSARs that are expensive long shots. Three
KSARs are currently pending:

| KSAR | What it would do | Credibility | Cost |
|---|---|---|---|
| K1 | Extend the confident "seven" island upward into a phrase hypothesis | 0.9 | 2 |
| K2 | Re-examine the weak, noisy segment data at the very start of the utterance | 0.4 | 5 |
| K3 | Try an unlikely competing word hypothesis ("heaven" instead of "seven") | 0.3 | 1 |

Score each KSAR with priority = credibility ÷ cost, and report the **highest** score — that KSAR
is the one the scheduler runs next.

(One more piece worth knowing before you compute: Hearsay-II's successor architecture, **BB1**,
took this idea one level further — it put the *scheduling knowledge itself* on a second,
meta-level **control blackboard**, so the strategy for choosing what to do next could be
inspected, reasoned about, and revised by knowledge sources, exactly like any other hypothesis.
Control stopped being hard-coded plumbing and became a first-class object the system reasoned
about — the architectural move lesson 3 flagged as "conflict resolution is not plumbing, it's
behavior," now given its own blackboard.)
