---
title: "Solution: Seven, Plus or Minus Two"
description: "Expertise is a vocabulary of chunks, not a bigger buffer — the finding that shaped cognitive architectures and should shape how you build agent memory."
lesson_number: 2
track: cog
concept: "Working memory & chunking"
stage: 0
layout: solution
role: solution
builds_on: [1]
skin: chalkboard
resources:
  - title: "Miller (1956) — The Magical Number Seven, Plus or Minus Two"
    url: https://psychclassics.yorku.ca/Miller/
    note: "the original paper, free and surprisingly funny"
  - title: "Wikipedia — Chunking (psychology)"
    url: https://en.wikipedia.org/wiki/Chunking_(psychology)
    note: "includes the Chase & Simon chess work"
---

**Both drop to roughly the same low level.** On random boards, masters reconstruct barely more
than novices. The masters' advantage on real positions wasn't a bigger buffer or trained visual
memory — it was **chunking**. A real midgame decomposes, for a master, into a handful of familiar
patterns ("fianchettoed bishop," "castled kingside with pawn storm coming"): ~25 pieces, maybe
5 chunks, comfortably inside the budget. Scramble the pieces and the patterns vanish; the master
is back to memorizing individual pieces with the same ~4-chunk buffer as everyone else.

Chase & Simon's estimate: mastery ≈ tens of thousands of stored patterns, built over years. This
reframes what it means to be good at something: **expertise is a vocabulary, not a bigger CPU.**
The same result replicates in bridge, electronics, programming — show developers real code for
seconds and seniors recall far more than juniors; shuffle the lines and the gap nearly closes.

Three consequences worth keeping:

1. **The bottleneck shapes the architecture.** A tiny working memory forced human cognition into
   strategies — externalize (write things down), chunk (compress via long-term knowledge), and
   serialize (one hard thing at a time). Cognitive architectures like ACT-R and SOAR are largely
   theories of how a system with exactly this bottleneck still gets things done. When those
   systems arrive two lessons from now, working memory will be a *named component* in them.
2. **The agent-harness parallel is almost embarrassingly direct.** A context window is a working
   memory: fixed capacity in tokens, unbounded in what a token can *point to*. Summarization,
   retrieval handles, and structured notes are chunking — swapping raw items for compact pointers
   into a larger store. And the chess result carries a warning: an agent's "expertise" lives in
   whether its stored patterns match the situation. Off-distribution, your master is a novice.
3. **The pitfall:** "7±2" as a design law ("menus must have seven items!") misreads Miller — his
   paper was partly a joke about the number's ubiquity. The load-bearing findings are: the buffer
   is small, its unit is the chunk, and chunks are made of *knowledge*.

**Where this goes:** next lesson builds the first machine with an explicit working memory — the
production system, Newell & Simon's rule engine, which is the atom every later architecture in
this track is built from.
