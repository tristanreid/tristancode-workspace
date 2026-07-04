---
title: "Solution: The Recognize–Act Cycle"
description: "Conflict resolution is the personality of a production system — and the recognize–act cycle is hiding inside every agent loop you've built."
lesson_number: 3
track: cog
concept: "Production systems"
stage: 0
layout: solution
role: solution
builds_on: [2]
skin: chalkboard
resources:
  - title: "Newell & Simon — Computer Science as Empirical Inquiry (1975 Turing Award lecture)"
    url: https://dl.acm.org/doi/10.1145/360018.360022
    note: "the physical symbol system hypothesis, from the source"
  - title: "Wikipedia — Production system (computer science)"
    url: https://en.wikipedia.org/wiki/Production_system_(computer_science)
    note: "covers OPS5 and conflict-resolution strategies"
---

**P1, P2, P3 — and P4 never fires.**

The trace, cycle by cycle:

1. WM `{goal:tea, kettle:empty}` — P1 matches (2 conditions), P4 matches (1). **P1 wins** on
   specificity → `kettle=full`.
2. WM `{goal:tea, kettle:full}` — P2 matches (3 conditions, counting the NOT), P4 matches (1).
   **P2 wins** → `water=hot`.
3. WM `{goal:tea, kettle:full, water:hot}` — P3 matches (2), P4 (1). **P3 wins** → `tea=made`,
   `goal` removed.
4. No `goal=tea` in WM → nothing matches (even P4) → **halt**, tea in hand.

P4 — the doom-scrolling rule — matched *every single cycle* and never fired, because something
more specific always outranked it. Now rerun the system under a different policy ("most recently
added rule wins", or random choice among matches) and this same rule set checks the phone forever.
Nothing in the rules changed; only the arbitration did. That's the lesson in one line: **in any
architecture where multiple things *could* run, the choosing policy is not plumbing — it is the
behavior.** Hold that thought for exactly one lesson: the blackboard architecture is what happens
when conflict resolution grows up and gets a name (opportunistic control).

Why production systems earned four decades of loyalty from cognitive modelers:

- **Modularity of knowledge.** Each rule is an independent shard of know-how. Adding skill =
  adding rules, no rewiring — the property Hearsay-II will scale up to whole subsystems.
- **Reactivity.** Control re-derives from the situation each cycle, so the system handles
  interruptions gracefully — like the cook who deals with the boiling-over pot mid-recipe.
- **Psychological teeth.** With the right (learnable) rules and timing assumptions, production
  systems reproduce human learning curves and error patterns — the bet that becomes ACT-R.

**The harness parallel:** an LLM agent loop is a recognize–act cycle — context window as WM,
match+conflict-resolution collapsed into one gloriously opaque step (the model reading its
prompt and choosing a tool), act = tool call appending facts to context. What the classic
systems make *explicit* — and what you can steal — is the arbitration layer: OPS5-era strategies
like specificity, recency, and refractoriness (don't re-fire on the same data — instantly
recognizable to anyone whose agent has called the same tool with the same arguments five times).

**Pitfall:** dismissing this as "just a rules engine." The claim Newell & Simon attached to it —
the physical symbol system hypothesis — is that *this kind of machinery is sufficient for
general intelligence*. Right or wrong (the field still argues; stage 7 hosts the fight), the
architectures it spawned are the best-tested models of human cognition ever built.

**Where this goes:** next lesson, the payoff this track was built around — what happens when the
"rules" become whole expert subsystems, working memory becomes a shared multi-level hypothesis
board, and conflict resolution becomes an intelligent scheduler. Speech understanding, 1976:
Hearsay-II.
