---
title: "Growing Outward From an Island"
description: "Hearsay-II's hypothesis levels and the islands-of-certainty strategy: trace what the system does next when confidence shows up in the middle of an utterance."
lesson_number: 5
track: cog
concept: "Hearsay-II anatomy"
stage: 1
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [4]
skin: chalkboard
mcq:
  question: "A KS just posted a high-confidence WORD hypothesis for the middle of the utterance. The SEGMENT-level data at the very start is still weak and ambiguous. What does the system do next, and why?"
  options:
    - "Ignore the confident word hypothesis and keep processing segments strictly left to right, since speech is a left-to-right signal"
    - "Discard the segment level entirely — the word level is more confident, so lower levels are no longer needed"
    - "Schedule whichever KS can extend outward from that confident word hypothesis next — up toward phrase, down toward syllable/segment, in whatever order looks most promising — because a strong hypothesis anywhere constrains its neighbors at every level"
    - "Wait until every segment in the utterance has been classified before creating any word or phrase hypotheses"
  correct: 2
---

Lesson 4 named the three pieces — blackboard, knowledge sources, control — and the property that
forced them into existence: certainty has to flow both ways, not just bottom-up. This lesson opens
the blackboard itself.

Hearsay-II's board is organized into **hypothesis levels**, each a different grain of abstraction
over the same stretch of audio:

- **Segment** — a slice of signal classified as roughly one phone (a vowel, a consonant sound).
- **Syllable** — segments grouped into a syllabic unit.
- **Word** — syllables grouped into a candidate word from the ~1,000-word lexicon.
- **Phrase** — words grouped into a candidate parse the grammar accepts.

Every hypothesis at every level carries a **confidence** and links to the hypotheses immediately
above and below it that support it — a word hypothesis points down at the syllables that spell it
and up at the phrases it could complete.

**Bidirectional inference** means a knowledge source can create or boost a hypothesis by reading
*either* direction: a syllable KS proposes words from strong syllables (bottom-up), but a grammar
KS can also propose *which words are likely here* from sentence context and go looking for their
syllables in weak, ambiguous signal (top-down) — exactly the move a fixed pipeline structurally
cannot make, because by the time the parser runs, the phoneme decision is already frozen.

That capability enables Hearsay-II's signature search strategy, the **island of certainty**: don't
insist on resolving the utterance left to right. Find wherever, at whatever level, some KS is
confident — the "island" — and schedule work that grows the interpretation *outward* from it in
both directions, letting each newly secured hypothesis constrain its still-noisy neighbors. A
strong island in the middle of a sentence is worth more than grinding through uncertain data at
the edges first.

Given a confident word-level island appearing mid-utterance while the segment level at the start
is still weak — what does the system actually do next?
