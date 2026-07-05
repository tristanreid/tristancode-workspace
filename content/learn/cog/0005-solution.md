---
title: "Solution: Growing Outward From an Island"
description: "Islands of certainty: why confidence, not position, decides what the system works on next — and how hypothesis levels make bidirectional inference concrete."
lesson_number: 5
track: cog
concept: "Hearsay-II anatomy"
stage: 1
layout: solution
role: solution
builds_on: [4]
skin: chalkboard
resources:
  - title: "Erman, Hayes-Roth, Lesser & Reddy (1980) — The Hearsay-II Speech-Understanding System"
    url: https://dl.acm.org/doi/10.1145/356810.356816
    note: "section 3 walks the hypothesis levels and the island strategy in detail"
---

**Grow outward from the confident island, at whatever level and direction looks most promising.**

Why the other options fail:

- **"Strict left to right"** reintroduces the pipeline lesson 4 just ruled out. Position on the
  tape has nothing to do with where the *evidence* is strongest; ignoring a confident mid-sentence
  hypothesis to grind through weak data at the start throws away the one thing blackboards buy you.
- **"Discard the segment level"** confuses "less confident right now" with "not needed." The
  segment level still has to be resolved eventually — the point of the island is that the strong
  word hypothesis now *helps* resolve it, by telling weak segment-level KSs which few phones to
  favor instead of searching blind. Nothing is thrown away; a search is narrowed.
- **"Wait for every segment"** is the pipeline's assumption in a different costume — that lower
  levels must fully resolve before higher ones can begin. Bidirectional inference exists precisely
  so that never has to happen.

**The mechanics, concretely.** Picture the utterance "the seven items" with segment-level noise
scrambling the start but a strong syllable/word match for "seven" landing cleanly in the middle
(vowel + fricative patterns for "seven" are acoustically distinctive; "the" said quickly is mush).
A lexical KS posts a high-confidence WORD hypothesis for "seven," linked down to the syllable
hypotheses that support it. That hypothesis is now an **island**. From here, two directions of
work both become newly worth scheduling:

- **Downward, into the noise**: a segment-level KS re-examines the mushy start, now armed with
  the *knowledge* that whatever's there, it's followed by "seven" — a grammar KS can suggest
  "probably a determiner or number word here," collapsing the segment KS's search space.
- **Upward, into structure**: a syntax KS proposes phrase hypotheses built around "seven," and
  a semantic KS asks what kind of phrase makes sense in the application domain (a database query
  system expects "the seven items" to be a quantity-and-noun phrase, which further predicts what
  comes next).

Each level's hypothesis is a **claim about the same signal at a different grain**, and the
support links between levels are what let confidence at one level *migrate* to another — a
confident word makes its component segments confident by association, the way lesson 4's "island"
metaphor implies: solid ground you build outward from, not a single resolved answer arrived at once.

**Pitfall worth naming:** islands of certainty is a *search heuristic*, not a guarantee. A
confident-but-wrong hypothesis (the acoustics *sound* like "seven" but the speaker actually said
"heaven") can seed a wrong island that then wrongly constrains everything grown from it — bad
confidence compounds exactly as fast as good confidence does. Nothing in the architecture
prevents this; it's why real systems keep multiple competing hypotheses alive per level rather
than committing early, and why the *next* lesson — control — is the part that decides how much
work to spend hedging against exactly this risk.

**Where this goes:** hypothesis levels tell you *what* the board holds. The next lesson opens
*control*: the agenda that scores every pending piece of work — extend this island, doubt that
hypothesis, try a competing one — and picks what runs next.
