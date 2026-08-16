---
title: "Solution: Why 'Doctor' Makes You Faster to Recognize 'Nurse'"
description: "A(nurse) = 1.75 vs A(bread) = 0.1 — a 1.65 activation gap from the same working-memory contents, which is priming made mechanical and computable."
lesson_number: 15
track: cog
concept: "Spreading activation & priming"
stage: 3
layout: solution
role: solution
builds_on: [10, 14]
skin: chalkboard
resources:
  - title: "Meyer & Schvaneveldt (1971) — the original semantic priming study"
    url: https://psycnet.apa.org/record/1971-08268-001
    note: "the doctor/nurse lexical decision experiment this lesson is built around"
---

### Numeric answer: A(nurse) = 1.75

```
A(nurse) = B(nurse) + Σⱼ(Wⱼ × Sⱼ,nurse)
         = 0 + [0.5 × 2.0] + [0.5 × 1.5]
         = 0 + 1.0 + 0.75
         = 1.75
```

Nurse has never been directly retrieved recently (B = 0), yet it carries substantial activation
purely from spreading — because two chunks strongly associated with it ("doctor," "medicine")
happen to be occupying working memory right now.

---

### Part 2 — Bread's activation: 0.1, and the comparison

```
A(bread) = 0 + [0.5 × 0.1] + [0.5 × 0.1] = 0 + 0.05 + 0.05 = 0.1
```

**Nurse (1.75) vs. bread (0.1): a gap of 1.65** in activation, purely a function of which chunks
happen to be semantically associated with what's currently active in working memory — nothing about
either word's own recency or frequency of use differs in this scenario (both have B = 0). Since
Lesson 10 established that higher activation predicts faster, more reliable retrieval, this gap
directly predicts nurse being recognized substantially faster than bread right now — which is
exactly the empirical priming result Meyer & Schvaneveldt found: "doctor" primes "nurse" via
spreading activation along a real associative link; "doctor" does not meaningfully prime "bread"
because no comparable link exists (or it's weak, as modeled by S = 0.1 here).

---

### Part 3 — Why priming decays

If spreading activation permanently strengthened every associate of everything you'd ever attended
to, activation would only ever accumulate — every chunk in memory would slowly ratchet toward
maximal activation as it picked up residual boosts from an ever-growing history of things once
associated with it, however distantly or briefly. Two things would break:

1. **Loss of discrimination.** Activation is only informative if it distinguishes "relevant right
   now" from "not relevant right now." If old associations never faded, current context would be
   swamped by irrelevant residue from every prior context, and retrieval would stop being fast or
   selective — everything would eventually look equally activated.
2. **No signal about *current* relevance.** The whole point of the `Wⱼ` term is that it reflects
   what's occupying attention *now* — as soon as doctor/medicine leave working memory (attention
   moves elsewhere), their `Wⱼ` should drop toward zero, because they're no longer evidence about
   what's currently relevant. A system where past attention never releases its grip on activation
   couldn't track a changing world or a changing task.

Priming's fast decay (seconds to low minutes, in the human data) is exactly tuned to track "what's
relevant to the current context," not "what have I ever thought about" — that second, durable kind
of strengthening is what base-level activation (`B`, from Lesson 10's repeated-use decay curve) is
for instead. The two terms of the activation equation divide the labor: `B` handles slow, durable
learning from repeated use; the spreading term handles fast, transient relevance to the current
moment.

---

### Part 4 — A candidate analogue in LLM agent harnesses

The closest structural analogue is the **attention mechanism** inside a transformer itself (the
"attention" the fp and ml tracks describe as a parallel soft lookup): when processing a token, the
model computes attention weights over all other tokens in context, and tokens strongly related to
the current one (by learned associative patterns, not an explicit symbolic link table) get weighted
more heavily in producing the next representation — a direct computational parallel to `Wⱼ × Sⱼᵢ`
summed over active sources. The similarity: both are automatic, "for free" mechanisms that boost
related information without an explicit, separate retrieval step being invoked.

The important difference: transformer attention operates *within a single forward pass over the
current context window* — it doesn't persist or decay across turns/interactions the way human
priming does across seconds to minutes; each new prompt essentially recomputes attention from
scratch over whatever's in the context window at that moment, with no residual "priming" carried
over unless the harness explicitly re-includes prior content. A harness that wanted a genuine
priming-like effect *across* separate calls would need to build that persistence deliberately — e.g.
a scratchpad or memory store that re-surfaces recently-relevant items into future contexts — since
the base transformer mechanism, unlike human spreading activation, doesn't carry activation forward
on its own.

---

### The pattern

| | Base-level activation (B) | Spreading activation (ΣWS) |
|---|---|---|
| Reflects | how often/recently *this* chunk was used | what's currently active *elsewhere* in working memory |
| Timescale | slow, durable (Lesson 10's decay curve) | fast, transient (fades as attention moves on) |
| Human example | "nurse" retrieved often stays easy to retrieve | "doctor" in mind briefly boosts "nurse" |
| Purpose | track long-run relevance | track current-context relevance |

**Rule**: activation isn't a single number describing "how strong is this memory" in isolation — it
has a durable component (repeated use) and a transient component (what's currently active and
associated). Priming is the transient component made visible: chunks connected to what's in mind
right now get temporarily easier to retrieve, and that boost is *supposed* to fade once context
moves on.

**Where this goes:** next lesson turns from associative memory to a different cognitive
bottleneck — **attention as selection**: given that only so much can be "in working memory" (and
therefore able to spread activation) at once, how does the mind decide what gets in?
