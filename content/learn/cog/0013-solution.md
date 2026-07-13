---
title: "Solution: Where the Architectures Actually Get Checked"
description: "Strong on structured skill, weak on insight — and why that specific weak spot follows directly from what the architectures are built to search."
lesson_number: 13
track: cog
concept: "What these architectures predict about humans, and how well"
stage: 2
layout: solution
role: solution
builds_on: [10, 12]
skin: chalkboard
resources:
  - title: "ACT-R homepage (act-r.psy.cmu.edu)"
    url: http://act-r.psy.cmu.edu/
    note: "publication archive with the quantitative human-timing-fit papers this lesson references"
---

**Correct: they predict well-structured, well-practiced task performance fairly precisely, but
struggle with genuinely novel insight or creative restructuring.**

The other options overstate in the wrong direction: ACT-R's single strongest, most-replicated
success *is* reaction-time and error-rate prediction on exactly the well-practiced tasks option 1
claims it fails at — the power law of practice is one of the most robust quantitative fits in
cognitive science. Option 3 is also false — ACT-R and SOAR both model mental/cognitive tasks
(retrieval, arithmetic, decision-making) as centrally as, or more than, motor tasks. And far from
abandoned, ACT-R specifically remains in active use today, including in applied HCI work predicting
real interface learning curves before a design ships.

**Why the insight weakness isn't incidental — it follows directly from Stage 1–2's own
architecture.** Both ACT-R and SOAR are built around search or retrieval *within* a fixed,
already-defined space: SOAR searches within operators available in a problem space (lesson 11);
ACT-R retrieves among existing chunks weighted by activation (lesson 10). A classic human "aha"
moment — the nine-dot puzzle solved by drawing lines *outside* the assumed grid, or a joke's
punchline reframing everything before it — isn't "searched harder within the space," it's the
space itself being **restructured**: the constraint that was implicitly assumed (stay inside the
dots) turns out not to be a real constraint at all. Neither architecture has a built-in mechanism
for questioning whether its own problem-space definition — the very thing search happens inside —
is the right one. That's not a bug either team failed to notice; it's a direct, structural
consequence of committing to "intelligence is search/retrieval within a space" as the foundational
bet, the same bet that buys the precise, checkable predictions on well-structured tasks in the
first place. The tradeoff is real, not a coincidence.

**Why this matters as *evidence*, not just design taste.** This is what separates a cognitive
architecture from an arbitrary agent design: it makes numerical, falsifiable claims (a specific
reaction time, a specific learning curve shape) that can be — and have been — checked against real
humans and found to hold in a well-defined range of tasks, and to fail in a different,
characterizable range. That falsifiable-and-partially-right status is exactly what "unified theory
of cognition" was supposed to mean for Newell, and exactly why these architectures are still argued
over rather than dismissed as untestable philosophy.

**In a modern LLM agent harness**, this same asymmetry shows up directly: an agent given a
well-defined tool space and a clear goal often performs reliably and predictably (the harness's
"search," across tool calls, is well-structured) — but an agent asked to notice that the *task
itself* is framed wrong, or that a completely different approach would dissolve the problem rather
than solve it, is exactly the harness-design equivalent of the insight gap this lesson describes.

**Where this goes:** Stage 2 closes here, having built two full architectures from the ground up
and checked their track record against real humans. Stage 3 turns to the psychology directly —
memory and attention as studied independent of any one architecture's specific claims about them.
