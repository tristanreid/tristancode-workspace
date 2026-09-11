---
title: "Solution: Why This Puzzle System Quizzes You Instead of Just Explaining"
description: "Design C wins on durability past a reset — because only its lookups were genuine use-events in the ACT-R sense, the same reason this whole track leads with puzzles before explanations."
lesson_number: 16
track: cog
concept: "Encoding vs retrieval; recognition vs recall; retrieval practice"
stage: 3
layout: solution
role: solution
builds_on: [2, 10, 15]
skin: chalkboard
resources:
  - title: "Roediger & Karpicke (2006) — 'Test-Enhanced Learning'"
    url: https://psycnet.apa.org/record/2006-01527-011
    note: "the foundational testing-effect study this lesson draws on"
---

**Retrieval check answer.** Start from the confident null-pointer stack frame and grow outward — check
what that module received as input, and whether the ambiguous timing-flavored log lines are actually
downstream symptoms of that same null dereference — rather than starting at the first ambiguous log
line and working forward. A confident island anywhere constrains its neighbors more than grinding
through noise in signal order does; the module name is the strongest evidence in the whole trace, so
it should redirect where you look first, exactly like Hearsay-II redirecting effort toward a confident
mid-utterance word hypothesis instead of insisting on left-to-right processing.

---

### The design comparison

**Design C (recall-heavy, compacted context) wins on durability past a reset.** Here's the mechanism,
stated precisely rather than just asserted:

Every time Design C's agent needs an early fact and it's *not* sitting verbatim in context, the agent
must reconstruct it — from a summary, from its own prior reasoning, or by re-deriving it from a
memory store. Each such reconstruction is a genuine retrieval attempt: effortful, cue-poor, exactly
the kind of "use" that last lesson's formula sums into base-level activation. If that reconstructed
fact gets written into any persistent store (a memory file, a re-derived summary line, a re-confirmed
belief), that store now reflects a chunk that has accumulated multiple real use-events — the same
mechanism that made chunk B (three effortful retrievals) out-rank chunk A (one fresh exposure) in the
last lesson.

Design R's agent, by contrast, never has to reconstruct anything — the fact is always sitting in
context, a cheap recognition-style lookup every time. Nothing about repeatedly *seeing* an
already-present fact routes through the effortful retrieval pathway; it's closer to re-encoding the
same content over and over than to retrieving it. When the context resets, whatever persisted (if
anything) never went through a use-event in the activation sense — there's no accumulated sum to fall
back on, because nothing was ever actually retrieved under conditions that would count as a "use."

**Concretely:** ask both agents to reproduce the fact from scratch after the reset. Design C's agent
has, along the way, effectively re-derived and re-confirmed that fact multiple times under real
effort — its durable memory (whatever it wrote down, whatever pattern of re-derivation it learned)
should reproduce it far more reliably. Design R's agent has only ever *read* the fact, never
*retrieved* it in the effortful sense, so there's no reason its post-reset performance should be any
better than its performance on a fact it saw exactly once.

---

### Why this is the design principle behind the whole track

This lesson is where the pattern gets named explicitly: **information sitting directly in context is
recognition** (cheap, always-available, doesn't strengthen anything by being looked at again);
**information that must be reconstructed from a separate store or from your own generation is
recall** (effortful, but the effort is what builds durability). A system — human or agent — that
always keeps everything trivially accessible never builds the equivalent of a strengthened retrieval
pathway, because nothing is ever actually being reconstructed under conditions that count as a use.

This is also, concretely, why this puzzle path asks you to produce or select an answer *before*
showing you one, rather than handing you an explanation to read first: reading the explanation first
would make every one of these lessons a Design-R experience. Answering first, even with effort and
even with some wrong guesses, is a Design-C experience — and per this lesson's own mechanism, that's
the version that compounds.

**Where this goes:** if effortful retrieval is what compounds, *when* you're forced to retrieve
matters as much as *whether* you do — retrieving something you haven't fully forgotten yet barely
counts as effortful at all. Next lesson (immediately) takes on timing: why spacing retrievals further
apart, rather than clustering them right after first exposure, changes how much each one is worth.
