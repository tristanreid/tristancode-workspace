---
title: "Solution: Ten Years of Experience, or One Year Repeated Ten Times?"
description: "B practiced deliberately — targeted weaknesses, immediate feedback, effortful refinement — while A's equal volume of routine repetition plateaued years ago. And neither's skill transfers as far as intuition suggests."
lesson_number: 20
track: cog
concept: "Deliberate practice and its limits; transfer (and its scarcity)"
stage: 4
layout: solution
role: solution
builds_on: [18, 19]
skin: chalkboard
resources:
  - title: "Ericsson, Krampe & Tesch-Römer (1993) — 'The Role of Deliberate Practice in the Acquisition of Expert Performance'"
    url: https://www.apa.org/pubs/journals/releases/rev-1003363.pdf
    note: "the foundational paper defining deliberate practice and distinguishing it from mere experience"
---

### MCQ answer: (1) — B has been engaging in deliberate practice, A has not

Equal volume with divergent outcomes is the classic signature Ericsson's research was built to
explain: raw years of experience and total repetition volume correlate only weakly with expertise
once you look closely, and the reliable predictor is whether that time included deliberate
practice's specific ingredients — a challenging goal, focused attention, immediate corrective
feedback, and repeated refinement targeting weaknesses — versus routine, comfortable-difficulty
repetition. Option (0)'s "natural talent" explanation is exactly the folk intuition this research
pushes back against — while raw aptitude plays some role, large, well-documented performance gaps
between equally-experienced practitioners are far better explained by *how* that experience was
structured than by assumed innate differences. Option (2) (pure volume) is explicitly what the
puzzle rules out by stipulating equal reading volume. Option (3) dodges the question the research
was specifically designed to answer with a real, replicated mechanism.

---

### Part 2 — Why routine practice actually plateaus, not just slows

Lesson 18's power law describes improvement *when every trial still provides some learning
signal*. Routine, comfortable-difficulty repetition breaks that assumption: once a skill component
is executed successfully and automatically (a familiar chunk, recognized and applied without
conscious effort — Lesson 19's chunking, running smoothly), further repetitions of that same,
already-mastered component provide essentially **no new corrective signal** to learn from — there's
no error to notice, no feedback pointing at a gap, nothing for the underlying representation to
update against. The trial still happens, but it's closer to *executing* a stored production rule
(Lesson 3's condition→action firing) than to *building or refining* one.

Genuine improvement requires trials where the current skill genuinely gets tested against something
at or beyond its current edge, with feedback specific enough to reveal exactly what went wrong.
Comfortable, routine repetition systematically avoids exactly that zone — which is why it produces
an apparent hard plateau rather than Lesson 18's ever-slower-but-still-positive curve: it isn't
that the *rate* of learning per trial is decaying toward zero along a smooth power-law curve, it's
that most routine trials are contributing close to **zero** learning signal individually, because
nothing about them is challenging the current skill level or supplying corrective information.

---

### Part 3 — A deliberate-practice regimen: code review skill

**Deliberate version**: pick a genuinely difficult category of bug you currently miss sometimes
(e.g., subtle race conditions) — that's the challenging goal, just past current ability. Review
real pull requests from that category with full, undistracted attention, writing down a specific
prediction of every issue you spot *before* checking against a more senior reviewer's actual
findings or the bug's eventual real-world outcome — that's the immediate, specific feedback. Where
your prediction missed something the senior reviewer caught, deliberately study *why* you missed
it (what pattern were you not recognizing?) before moving to the next PR — that's repetition with
targeted refinement, focused specifically on the gap just identified, not just moving on to the next
task.

**Routine contrast**: reviewing PRs as they come in, at a comfortable pace, approving or requesting
changes based on familiar checks, with no systematic comparison against a stronger reviewer's
judgment and no deliberate focus on a specific known weak spot — genuinely useful for keeping the
codebase healthy, but structurally unlikely to push the reviewer's own skill past wherever it
currently plateaus, for exactly the reason given in Part 2.

---

### Part 4 — Deliberate-practice analogue, and the plateau failure mode, in agent training

A close analogue: reinforcement learning or fine-tuning regimes that specifically target an agent's
**known failure modes** with tasks calibrated just past its current success rate, paired with clear,
specific reward/correction signal tied to exactly what went wrong — structurally close to
deliberate practice's four ingredients (challenging difficulty, focused signal, immediate feedback,
targeted refinement). Contrast that with simply running an agent on a large volume of tasks it
already handles comfortably, with vague or absent feedback about *why* any given output was better
or worse — closer to routine repetition.

**Expected plateau failure mode**: an agent trained mostly on high-volume-but-routine experience
(comfortable tasks, weak or generic feedback) would be expected to perform reliably on
familiar-shaped tasks while showing little continued improvement on its genuine edge cases or known
weak spots over time — exactly matching Radiologist A's flat 10-year accuracy curve despite
continuing high case volume: lots of executions of already-mastered patterns, very little targeted
correction of the specific gaps that would actually move performance forward.

---

### The pattern

| | Routine repetition | Deliberate practice |
|---|---|---|
| Difficulty | comfortable, already-mastered | just past current ability |
| Attention | often automatic/autopilot | fully focused |
| Feedback | absent or delayed/vague | immediate and specific |
| Trajectory | early gains, then plateau | continued improvement |
| Transfer to other domains | limited either way | limited either way |

**Rule**: raw hours or repetitions predict expertise only weakly — what predicts it is whether
practice included deliberate practice's specific structural ingredients. And even genuine expertise,
however it was built, transfers far less to other domains than intuition suggests — consistent with
Lesson 19's finding that expertise is chunking of *specific* meaningful patterns, not a general
cognitive upgrade that should carry over anywhere.

**Where this goes:** Stage 4 closes with one more piece — **spacing and interleaving**, the
scheduling principles (not just *how* you practice, but *when* and in what order) that this whole
puzzle path's own design is built on.
