---
title: "Experts Around a Blackboard"
description: "Hearsay-II's blackboard architecture: independent knowledge sources cooperating through a shared hypothesis space — born from a problem no pipeline could solve."
lesson_number: 4
track: cog
concept: "Blackboard architecture"
stage: 1
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [3]
skin: chalkboard
mcq:
  question: "What property of the speech-understanding problem made the fixed pipeline unworkable?"
  options:
    - "Pipelines were too slow for real-time audio on 1970s hardware"
    - "Errors and ambiguity at every level meant later stages had to inform and revise earlier hypotheses — certainty flows both ways, and a one-way pipeline can't"
    - "The intermediate results were too large to store between stages"
    - "English grammar was too irregular to encode as a pipeline stage"
  correct: 1
---

Mid-1970s, Carnegie Mellon: the Hearsay-II project is trying to make a computer **understand
continuous speech** — a ~1,000-word vocabulary, real sentences, noisy signal. The knowledge that
bears on the problem is wildly heterogeneous: acoustics, phonetics, syllable structure, a lexicon,
syntax, semantics of the domain. Every piece is *partial* and *errorful* — the acoustics can't
reliably tell you the phoneme, the lexicon can't be sure where words begin, the grammar can rule
things out but not hear anything.

The obvious architecture is a **pipeline**: signal → phonemes → words → parse → meaning, each
stage consuming the previous stage's output. Every speech system before Hearsay-II more or less
tried this. It failed, and the question above asks you to identify the *architectural* reason.

What the Hearsay team built instead defined a new architecture, the **blackboard system**:

- **The blackboard**: one shared data structure holding *hypotheses* at every level of
  abstraction (this stretch of signal might be an "S"; these syllables might be the word
  "seven"; this phrase might be a database query) — each with a confidence, each linked to the
  hypotheses that support it.
- **Knowledge sources (KSs)**: independent specialist modules — one knows acoustics, one knows
  the lexicon, one knows grammar. Each is condition/action, like a production grown to expert
  size: *when* hypotheses of a certain kind appear, *then* I can create or re-rate others. KSs
  never call each other; they communicate only through the board.
- **Control**: a scheduler that watches what changed and decides which eager KS runs next —
  **opportunistically**, working wherever the board currently looks most promising, rather than
  in any fixed order.

The metaphor the team used: specialists standing around a physical blackboard, each stepping up
to write when — and only when — their expertise applies to what's currently written.

So: why did speech *demand* this? Pick the property that killed the pipeline.
