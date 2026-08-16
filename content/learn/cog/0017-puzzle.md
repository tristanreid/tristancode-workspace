---
title: "The Amnesiac Who Learned to Juggle and Never Knew It"
description: "A famous amnesia case shows long-term memory isn't one system — it fractures cleanly along lines that map directly onto ACT-R's declarative/procedural split."
lesson_number: 17
track: cog
concept: "Long-term memory systems: episodic vs semantic vs procedural"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [10, 16]
skin: chalkboard
mcq:
  question: "Patient H.M. had his hippocampus removed in 1953 to treat severe epilepsy, leaving him unable to form new long-term memories of events (severe anterograde amnesia). Researchers had him practice a mirror-tracing task (tracing a shape while only seeing it reflected in a mirror — hard at first) every day for several days. Which best describes what happened?"
  options:
    - "He got no better at the task on any day, since without memory of practicing, no learning could occur"
    - "He got measurably better at the task each day — his tracing speed and accuracy improved day over day — while each day insisting he had never seen the task before and had no memory of ever practicing it"
    - "He got better at the task, and also gradually remembered practicing it, though more slowly than a healthy person would"
    - "He got better only because the mirror-tracing task doesn't actually require any memory at all, procedural or otherwise"
  correct: 1
---

Lesson 16 covered what gets *into* memory via attention. This lesson covers what happens to it once
it's in — specifically, that "long-term memory" isn't one thing, but several dissociable systems
that can be damaged independently of each other, as the H.M. case makes starkly clear.

**Terms (standalone):**

- **Episodic memory**: memory for specific, personally-experienced events — "what happened, when,
  where." Remembering *that* you practiced mirror-tracing yesterday is episodic.
- **Semantic memory**: memory for general facts and concepts, disconnected from any specific
  experience of learning them. Knowing "a mirror reverses left-right" is semantic — you likely can't
  recall the specific moment you learned it.
- **Procedural memory**: memory for skills and how-to knowledge — how to perform an action, largely
  inaccessible to conscious, verbal report. Riding a bicycle, typing without looking at the keys, and
  (per this puzzle) getting better at mirror-tracing are procedural.
- **Episodic and semantic memory are both forms of *declarative* memory** — memory you can, in
  principle, consciously bring to mind and *declare* (state in words): "I remember doing X" or "I
  know that Y is true." This is exactly the **declarative memory** from Lesson 10's ACT-R chunks.
  **Procedural memory** maps onto ACT-R's production rules (Lesson 3's condition→action rules) —
  knowledge expressed as *doing*, not as a statable fact, and famously resistant to being put into
  words even by the person who has it (ask an expert typist to describe, without looking, exactly
  where the "F" key is relative to their fingers — many struggle, despite flawless performance).
- **Dissociation**: when brain damage impairs one memory system while leaving another intact,
  demonstrating that the two systems are at least partly independent, not just "harder vs. easier"
  versions of one unified memory. H.M.'s case is the textbook example: his hippocampal damage
  devastated new episodic (and largely new semantic) memory formation, while his procedural learning
  system remained fully functional.

### The puzzle (MCQ above)

Think about what the mirror-tracing task requires (a motor skill, refined by practice) versus what
H.M.'s specific damage impaired (forming new consciously-accessible memories of events).

---

### Part 2 — Why this counts as evidence for *separate systems*, not just "partial amnesia"

If H.M.'s amnesia were simply "memory in general is a little worse," you might expect his skill
learning to also be somewhat impaired, just less severely than his event memory. Instead, his
procedural learning curve was essentially **normal** — indistinguishable from a healthy person's —
while his episodic memory was essentially **absent**. Why does this specific pattern (one system
fully intact, one fully devastated, rather than both partially impaired) make a stronger case for
genuinely separate memory systems than a milder, evenly-distributed deficit would?

---

### Part 3 — Reveal: predict a second dissociation

Given that episodic and semantic memory are both "declarative" but are still distinguishable from
each other (specific events vs. general facts), predict: could a patient plausibly have damage that
impairs *new episodic* memory formation while *new semantic* learning stays relatively more intact —
or does the evidence you'd expect necessarily go the other way? Sketch a plausible real-world
observation that would demonstrate this second, finer dissociation (episodic vs. semantic, not just
declarative vs. procedural).

---

### Part 4 — Connect to modern agents

**In a modern LLM agent harness**, an agent's "knowledge" also fractures along related lines: facts
baked into the model's weights during training (closer to semantic memory — general, source-amnesic
knowledge with no memory of "when I learned this"), a specific conversation's context window (closer
to episodic — this specific interaction, right now), and learned behavioral patterns like tool-use
habits encoded in weights or in a system prompt (closer to procedural — how to act, not a statable
fact). Pick one pair from that list and describe a concrete way an agent harness could "dissociate"
them — i.e., a design where one kind of knowledge is lost or reset while the other persists,
deliberately or as a bug.
