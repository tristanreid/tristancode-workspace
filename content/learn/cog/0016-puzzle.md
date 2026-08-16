---
title: "What Gets Through the Filter — and What Doesn't"
description: "In a classic dichotic listening experiment, one thing about the unattended channel reliably breaks through the filter. Predict which."
lesson_number: 16
track: cog
concept: "Attention as selection: dichotic listening, inattentional blindness, the binding problem"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [2, 15]
skin: chalkboard
mcq:
  question: "In a classic dichotic listening / 'shadowing' experiment, a person wears headphones playing a different spoken message in each ear and is told to repeat aloud (shadow) only the LEFT-ear message, ignoring the right ear entirely. Afterward, they generally CANNOT report the semantic content (what was said) of the right-ear message. Which fact about the right-ear message DO they reliably notice, even while ignoring it?"
  options:
    - "Whether the voice switched from a man's to a woman's, or a pure tone started playing — low-level physical/acoustic properties get through even when meaning doesn't"
    - "Whether the right-ear message was in their native language or a foreign language — linguistic content always breaks through"
    - "Nothing at all — full attentional filtering blocks every property of the unattended channel completely"
    - "The complete meaning of the message, but only if it was more interesting than the shadowed one"
  correct: 0
---

Lesson 15 covered spreading activation — but activation spreads *among what's currently in working
memory*. This lesson asks the prior question: with limited attentional capacity, what determines
what gets into working memory in the first place, and what gets filtered out before it's even
processed for meaning?

**Terms (standalone):**

- **Selective attention**: the mechanism by which the cognitive system chooses which small subset
  of all available sensory input gets full processing (meaning extraction, entry into working
  memory), while the rest is processed only shallowly or not at all.
- **Dichotic listening / shadowing task**: a classic experimental paradigm (Cherry, 1953; Broadbent,
  1958) — different audio streams played to each ear, subject told to attend to (shadow, i.e. repeat
  aloud) only one. Used to probe exactly *how much* of the unattended stream still gets processed.
- **Early vs. late selection**: two competing theories of *where* filtering happens. Early-selection
  theories (Broadbent) say the filter operates on raw physical/acoustic properties before meaning is
  extracted — the unattended stream never gets semantically processed at all. Late-selection
  theories say meaning is extracted from everything, and filtering happens only afterward, at the
  point of conscious report or response. The evidence turns out to be mixed — mostly early
  selection, with real exceptions (see Part 2).
- **Inattentional blindness**: failing to consciously perceive a fully visible, unhidden stimulus
  because attention was engaged elsewhere — most famously demonstrated by the "invisible gorilla"
  study (Simons & Chabris, 1999): subjects counting basketball passes in a video routinely fail to
  notice a person in a gorilla suit walking through the middle of the scene, in plain sight, for
  several seconds.
- **The binding problem**: the brain processes different features of a single object (its color,
  shape, motion, location) in largely separate neural pathways, yet you experience one unified
  object, not a scattered bundle of disconnected features. How and where these separately-processed
  features get bound back together into one coherent percept — and why that binding sometimes fails
  (producing "illusory conjunctions," like briefly misreporting a red X and blue O as a blue X) —
  remains a genuinely open question, not a fully solved mechanism.

### The puzzle (MCQ above)

Think about what an early-selection filter, operating on raw acoustic properties before meaning is
extracted, would and wouldn't be able to detect about a stream it's otherwise blocking.

---

### Part 2 — The exception that complicates early selection

One famous, reliable exception to "unattended meaning never gets through": people shadowing one
ear routinely **do** notice if their own name is spoken in the unattended ear — the so-called
"cocktail party effect." Given the early-selection story (filtering happens on raw physical
properties, before meaning is extracted), why is this finding awkward? Propose how a modified
theory could accommodate it without abandoning early selection entirely. (Hint: think about whether
*all* unattended content might get some minimal, shallow semantic processing, with only some of it
strong enough to cross into conscious awareness.)

---

### Part 3 — Reveal: design an inattentional-blindness-resistant task

You're designing a task where a human operator must monitor a busy visual display (e.g., an air
traffic control screen) for a rare, critical, visually unhidden event, while devoting most active
attention to a different primary task on the same screen. Given what inattentional blindness
demonstrates (attention, not visibility, gates conscious perception — even large plain-sight objects
get missed), propose one concrete design change to the display or the task that would reduce the
risk of the operator missing the critical event, and explain why it works in terms of attentional
selection rather than just "make it more visible."

---

### Part 4 — Connect to modern agents

**In a modern LLM agent harness**, is there a structural analogue to the binding problem — separate
processing streams (e.g., different tool outputs, different retrieved documents, different steps of
a multi-agent pipeline) that need to get "bound" back into one coherent understanding of the current
situation? Name one concrete failure mode you'd expect if that binding goes wrong, in the same
spirit as an illusory conjunction (right features, wrongly combined).
