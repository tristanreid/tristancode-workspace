---
title: "Two Systems, or One System With a Threshold?"
description: "System 1/2 is a description, not a mechanism — this track already built the machinery it's describing. Map an agent's fast-path/slow-path split onto it, then find what the metaphor hand-waves."
lesson_number: 21
track: cog
concept: "Dual-process accounts: what System 1/2 explains, and what it hand-waves"
stage: 5
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [9, 11, 12]
skin: chalkboard
---

**Retrieval check (from lesson 2, new setting).** A UUID like `f47ac10b-58cc-4372-a567-0e02b2c3d479`
is 32 hexadecimal characters — well over working memory's roughly seven-item budget if held as
individual characters. It's conventionally written with hyphens grouping it into 8-4-4-4-12 character
groups. Using lesson 2's definition of a **chunk** (a group of raw items recoded as one familiar unit,
freeing working-memory slots), how many chunks does the hyphenated grouping give you to hold, instead
of 32 individual characters? Answer before reading on.

---

### The two systems, defined standalone

**Dual-process theory** (popularized by Kahneman, building on decades of prior research) describes
human judgment as running on two systems:

- **System 1**: fast, automatic, effortless, runs in parallel, operates without deliberate control —
  you don't decide to recognize a friend's face or feel that 2+2=4.
- **System 2**: slow, deliberate, effortful, runs serially, requires attention — long division,
  comparing two job offers on multiple criteria, anything that makes you stop and think.

Kahneman's own framing is explicit that these are **not two literal brain modules** — they're a useful
description of two *styles* of processing, not a discovered anatomical fact.

### The puzzle

You've already built the machinery this metaphor is describing, twice, under different names:

- **Lesson 9** split memory into **declarative** (retrievable facts, "knowing that") and
  **procedural** (compiled IF–THEN production rules, "knowing how" — they fire without being
  consciously narrated).
- **Lessons 11–12** gave SOAR's answer to what happens when the fast path runs out: an **impasse** —
  no operator applies, or several tie — triggers **universal subgoaling**, spinning up a genuinely new
  problem-space search to resolve it, which SOAR's **chunking** then compiles into a brand-new
  production so the same impasse never has to be searched out again.

Now, a modern coding agent: it maintains a small library of cached **macros** — pre-compiled sequences
of tool calls for patterns it's handled successfully before ("format this file," "add a null check
here"). When an incoming request matches a macro's trigger pattern closely enough, the agent just runs
the macro directly. When nothing matches — a genuinely novel request, or two macros that both seem to
apply with no clear preference between them — the agent falls back to a full planning loop: reason
step by step, consider options, possibly try one and backtrack.

**Part 1.** Map this agent's two modes onto System 1 and System 2, and then re-map them onto the more
precise machinery from lessons 9 and 11–12 (declarative retrieval vs. procedural firing; problem-space
search; impasse). Which earlier mechanism does the macro-run path correspond to, and which corresponds
to the planning-loop fallback?

**Part 2.** Dual-process theory names *that* a switch between fast and slow processing happens. It
does not specify *when* — what exact condition triggers the switch. Using SOAR's **impasse** as your
model of precision, state specifically what dual-process theory hand-waves that the impasse concept
does not, and give the exact condition (in terms of the agent's macro-matching) that should trigger a
fallback from "run the macro" to "invoke the full planning loop."
