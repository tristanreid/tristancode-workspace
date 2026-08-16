---
title: "Solution: What Gets Through the Filter — and What Doesn't"
description: "Physical properties (voice pitch, a tone) get through; meaning doesn't — except your own name, which is the crack in early-selection theory that pure filtering can't explain away."
lesson_number: 16
track: cog
concept: "Attention as selection: dichotic listening, inattentional blindness, the binding problem"
stage: 3
layout: solution
role: solution
builds_on: [2, 15]
skin: chalkboard
resources:
  - title: "Simons & Chabris (1999) — the original 'invisible gorilla' study"
    url: https://www.chabrislab.com/s/simons-chabris-1999.pdf
    note: "free PDF of the original inattentional-blindness paper"
---

### MCQ answer: (0) — physical/acoustic properties get through, meaning doesn't

Subjects reliably notice a switch from a man's to a woman's voice, or from speech to a pure tone, on
the unattended channel — these are low-level acoustic properties. What they reliably **fail** to
report is the semantic content: what was actually said, what language it was in (beyond gross
acoustic cues), whether the message repeated a word thirty times. This is the classic finding that
launched **Broadbent's early-selection filter theory**: the attentional filter appears to operate on
raw physical/perceptual properties, deciding what gets full processing, largely *before* meaning is
extracted from the unattended stream — meaning processing seems to be a scarce resource, applied
selectively, not something that happens automatically and equally to everything reaching the ears.

---

### Part 2 — The own-name exception, and why it's awkward for pure early selection

If filtering happens strictly on raw acoustic properties before any meaning is extracted, there's no
way for the system to "know" that a particular unattended sound pattern is *semantically* your own
name — recognizing it as your name requires meaning-level processing, the very thing early selection
says doesn't happen to the unattended stream. Yet people reliably do notice their name in the
unattended ear far more often than chance. That's a genuine problem for a *pure*, all-or-nothing
early-selection filter.

The standard resolution (associated with Anne Treisman's modification of Broadbent's theory):
**attenuation, not full blockage.** The unattended channel isn't completely shut off from meaning
processing — it's processed, but at reduced strength/priority ("attenuated") rather than zero. Most
words in the attenuated stream never reach the threshold needed for conscious report. But some words
have a permanently lower activation threshold — words with high personal salience, like your own
name — because (connecting back to Lesson 10's base-level activation and Lesson 15's spreading
activation) frequently-and-recently-used, highly personally relevant chunks sit at chronically
higher baseline activation. Even a heavily attenuated signal can be enough to push an
already-primed, low-threshold chunk like "my own name" over the line into conscious awareness, while
the exact same attenuation leaves an arbitrary unfamiliar word below threshold. Selection isn't a
binary switch — it's activation-and-threshold, same mechanism as the rest of this stage, just
applied to what counts as "enough" to break through a weakened signal.

---

### Part 3 — Reducing inattentional blindness in a monitoring task

One concrete design change: **don't rely on the critical event being merely visible on a shared
display — give it a dedicated, distinct attentional channel** (e.g., a separate alert tone, a
distinct flashing indicator in the operator's direct focus area, or a brief mandatory glance
checkpoint) rather than expecting it to be noticed purely by being present somewhere in the visual
field the operator is already looking at.

Why this works in terms of attentional *selection* rather than raw visibility: inattentional
blindness demonstrates that visibility alone (photons reaching the retina, unobstructed, in plain
sight) is not sufficient for conscious perception — the gorilla was never hidden. What's missing is
attentional *allocation* to that region/feature. Simply making the critical event bigger or brighter
within the existing display doesn't help if attention is still fully committed elsewhere (the
counting task) — the classic finding is that inattentional blindness happens even for large,
high-contrast stimuli. What actually helps is something that competes for attention through a
different channel entirely (an auditory alert bypasses "already looking at the wrong part of the
visual field") or that forces an attentional switch (a mandatory checkpoint), rather than adding
more unattended visual salience to a channel that's already being filtered out.

---

### Part 4 — Binding problem analogue in agent harnesses

A close analogue: a multi-agent or multi-tool pipeline where separate subsystems each process a
different aspect of the same underlying situation — one agent summarizes a document, another
extracts numeric data from a spreadsheet, another checks a calendar — and their outputs need to get
"bound" back into one coherent picture of the current task by whatever orchestrates them (a planner,
or the final synthesizing call).

**Concrete failure mode, in the spirit of an illusory conjunction**: the harness correctly extracts
fact A from source 1 ("the meeting is at 3pm") and correctly extracts fact B from source 2 ("the
meeting is with the VP"), but in synthesizing a final answer, mis-binds them with facts from a
*different* pair of sources also in context — e.g., stating the VP meeting is at a time that
actually belonged to an unrelated event, or attributing the right time to the wrong meeting. Each
individual fact was extracted correctly (the "features" were each processed right, just like color
and shape are each correctly detected in an illusory conjunction) — the failure is specifically in
*recombining* them correctly when several similar-shaped facts are active in context at once,
exactly the binding-problem signature: right pieces, wrong assembly.

---

### The pattern

| | What gets through | Mechanism |
|---|---|---|
| Unattended channel, ordinary word | Nothing (usually) | Attenuated below report threshold |
| Unattended channel, own name | Noticed | Attenuated signal + chronically low threshold (high baseline activation) |
| Fully visible but unattended object | Missed (inattentional blindness) | No attentional allocation, regardless of raw visibility |
| Separately-processed features of one object | Sometimes mis-combined | The (unsolved) binding problem |

**Rule**: selection happens mostly on raw/physical properties and largely before full meaning
extraction (early selection) — but it's a matter of *attenuation and threshold*, not an absolute
gate, so highly salient content can still break through a weakened signal. And crucially, mere
physical visibility is not sufficient for perception — attentional allocation is the actual
bottleneck, which is why plainly-visible things get missed and why binding separately-processed
features back together isn't guaranteed to happen correctly.

**Where this goes:** next lesson turns to what happens *after* something is attended to and encoded
— the different long-term memory systems (episodic, semantic, procedural) that store what
selective attention let through.
