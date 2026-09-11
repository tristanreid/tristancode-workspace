---
title: "Good Enough, On Purpose"
description: "Herbert Simon's satisficing: real agents stop searching once an option clears a threshold, not once they've found the provably best one. Compute the threshold where continuing to search stops paying for itself."
lesson_number: 19
track: cog
concept: "Satisficing (Simon): why real agents don't optimize"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [6]
skin: chalkboard
numeric:
  question: "What is the expected value, in hours, of researching one more caching-library candidate?"
  answer: 0.2
  tolerance: 0.02
  unit: "hours"
---

**Retrieval check (from lesson 4, new setting).** A newsroom's fact-checking desk gets tips, source
documents, and reporter drafts arriving in unpredictable order; a tip that contradicts an
already-published claim needs to be able to send someone back to re-verify that claim, and a
freshly-verified fact can redirect which of ten pending tips gets checked next. Lesson 4's forcing
property for a **blackboard** architecture (over a fixed pipeline) was: errors and ambiguity at every
source, arriving unpredictably, where a finding at one point has to be able to **revise** something
decided elsewhere, in an order nobody can fix in advance. Does the fact-checking desk have that
property, or would a fixed pipeline (tips → verify → publish) actually be adequate? Answer before
reading on.

---

### Optimizing vs. satisficing

Herbert Simon — the same Simon behind the chunking studies (lesson 2) and half of SOAR's intellectual
lineage (lessons 11–12) — made a career-defining argument that real decision-makers, human or
mechanical, essentially never **optimize**: search every option, compute its exact value, and pick the
provable best. Optimizing requires knowing the full option space in advance and having unlimited time
and computation to evaluate it — a condition Simon called **bounded rationality**: real agents have
limited information, limited time, and limited computation, and any theory of decision-making that
ignores those limits is a theory of a different, imaginary agent.

What real agents do instead is **satisfice** (a blend of "satisfy" and "suffice"): set an
**aspiration level** — a "good enough" threshold — and take the first option that clears it, rather
than continuing to search for something better. This isn't laziness; lesson 6's agenda-scoring lesson
already showed the underlying logic (an action's expected value must outweigh its cost, or a rational
scheduler shouldn't run it) applied to a single decision instead of a queue of them: **searching for
one more option is itself an action with a cost, and it's only worth taking if its expected payoff
exceeds that cost.**

### The puzzle

An engineer is choosing a caching library and already has one candidate in hand that works. Researching
one more candidate costs **30 minutes (0.5 hours)** of the engineer's time. Based on this team's
history of library evaluations, there's a **10% chance** the next candidate researched turns out to be
meaningfully better than the current best — and when that happens, the expected future benefit (time
saved on debugging and maintenance down the line) is worth **2 hours**. When it isn't better (the other
90% of the time), the additional research yields no further benefit beyond confirming the current
choice.

Compute the **expected value, in hours**, of researching one more candidate. Compare that number to the
0.5-hour cost of doing the research, and — per Simon's satisficing logic — decide whether the rational
move is to keep searching or to satisfice on the candidate already in hand.
