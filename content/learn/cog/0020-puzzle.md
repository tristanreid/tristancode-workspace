---
title: "Ten Years of Experience, or One Year Repeated Ten Times?"
description: "Two people can log the same hours at a skill and end up nowhere near equally good. Deliberate practice research explains exactly what separates them."
lesson_number: 20
track: cog
concept: "Deliberate practice and its limits; transfer (and its scarcity)"
stage: 4
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [18, 19]
skin: chalkboard
mcq:
  question: "Two radiologists both have 15 years on the job, reading roughly the same volume of scans per year. Radiologist A's diagnostic accuracy has been essentially flat for the last 10 years. Radiologist B's accuracy has kept improving every year, and is now noticeably higher than A's. According to Ericsson's deliberate practice research, what is the SINGLE most likely explanation for this gap, given that raw repetition volume is roughly equal?"
  options:
    - "B has a naturally superior visual memory and pattern-recognition ability that A lacks"
    - "B has been engaging in deliberate practice — targeting specific weaknesses, seeking immediate corrective feedback (e.g. comparing calls against confirmed outcomes), working at the edge of current ability — while A has been doing routine repetition without those elements, which plateaus"
    - "B simply reads more scans per year than A, so the gap is purely about total volume"
    - "The gap is most likely random measurement noise and not a real, explainable difference"
  correct: 1
---

Lesson 19 showed expertise is built from chunking, acquired through practice. This lesson asks the
harder question the power-law-of-practice framing (Lesson 18) glosses over: practice reliably
improves performance *early on* — so why do so many experienced people plateau, sometimes for
decades, well short of true expertise?

**Terms (standalone):**

- **Naive/routine practice**: simply performing a task repeatedly, at a comfortable, familiar level
  of difficulty, without deliberately targeting weaknesses or seeking corrective feedback. Reliably
  produces improvement early on (Lesson 18's power law), then **plateaus** — performance stabilizes
  at "good enough to get by" and stops improving further, often for years, even with continued high
  volume of repetition.
- **Deliberate practice** (Ericsson's term, from research often oversimplified in pop-science as
  "the 10,000-hour rule"): practice with specific structural requirements that routine repetition
  usually lacks: (1) a well-defined, challenging goal just beyond current ability, (2) full,
  focused attention on the task rather than autopilot, (3) immediate, specific feedback on
  performance, and (4) repetition with refinement — repeatedly attacking the same weakness until it
  improves. Deliberate practice is effortful and often *not* enjoyable in the moment (contrast with
  Lesson 14's "desirable difficulty" — same underlying principle, applied to skill-building rather
  than memorization) — which is exactly why routine, comfortable repetition is so much more common
  than genuine deliberate practice, even among people who practice a great deal.
- **Transfer**: whether skill or improvement gained in one task/domain carries over to a different
  task/domain. A robust and somewhat humbling finding across this research: transfer is **much more
  limited than intuition suggests**. Extensive chess expertise doesn't reliably make someone better
  at general memory tasks or general strategic reasoning outside chess (consistent with Lesson 19:
  the advantage is chunking specific to *meaningful chess patterns*, not a general cognitive
  upgrade). Training "working memory" with generic memory-span exercises tends to improve
  performance on tasks very similar to the training task, but shows little to no reliable transfer
  to genuinely different cognitive tasks, despite popular "brain training" claims to the contrary.

### The puzzle (MCQ above)

Think about what's structurally different between "read 2,000 scans this year" (volume) and "read
2,000 scans this year, each time predicting the diagnosis, then checking the confirmed outcome and
specifically studying the misses" (volume + deliberate practice's key ingredients).

---

### Part 2 — Why does routine practice plateau specifically, rather than continuing to slowly improve forever?

Lesson 18's power law technically predicts *some* continued improvement at every additional trial,
just a shrinking amount — never a hard plateau. Real-world routine practice, though, often produces
genuine flat performance for years. Propose a reason routine, comfortable-difficulty repetition
would produce an actual plateau rather than just an ever-slower-but-still-positive improvement curve.
(Hint: think about what's required for a trial to count as "practice that changes the underlying
representation" versus a trial that's just successfully executing an already-mastered chunk.)

---

### Part 3 — Reveal: design a deliberate-practice regimen

Pick a skill you (or a hypothetical learner) might want to improve at — could be a professional
skill (code review, technical writing, public speaking) or a hobby. Sketch a deliberate-practice
regimen for it that concretely satisfies all four requirements listed above (challenging goal at the
edge of ability, focused attention, immediate feedback, repetition with refinement) — and explain
specifically what routine, non-deliberate practice at the same skill would look like by contrast.

---

### Part 4 — Connect to modern agents

**In a modern LLM agent harness**, is there a meaningful analogue to "deliberate practice vs. routine
repetition" — some way an agent (or the system training/fine-tuning it) could accumulate experience
that's structured like deliberate practice (targeting specific known weaknesses, with clear
corrective feedback) versus experience that's more like routine repetition (just running lots of
tasks without targeted feedback)? What would you expect the "plateau" failure mode to look like for
an agent stuck in the routine-repetition regime?
