---
title: "Programs That Write Programs"
description: "Can a system discover reusable abstractions? We build a toy DreamCoder to explore neuro-symbolic computing — where neural learning meets program synthesis."
weight: 70
series: "Neural Nets from Scratch"
series_weight: 50
skin: chalkboard
draft: true
---

In Parts [4](/blog/neural-nets-mixture-of-experts/), [5](/blog/neural-nets-adaptive-computation/), and [6](/blog/neural-nets-tool-use/), we explored three dimensions of conditional computation — routing to different sub-networks, through variable depth, and to external tools. Each mechanism is more expressive than the last. But they all share a fundamental limitation: **the model doesn't discover reusable abstractions.**

A neural network trained on "double each element" and "sum the list" doesn't discover that combining them gives "sum-of-doubles." It doesn't build a vocabulary of composable operations. It doesn't get *more efficient* at solving new problems by leveraging solutions to old ones.

This is the gap that neuro-symbolic computing addresses. **DreamCoder** (Ellis et al., 2021) is the most elegant demonstration of the idea: a system that combines neural learning with program synthesis in a wake-sleep cycle, discovering reusable library functions along the way. The system starts with basic primitives and — through repeated cycles of solving, abstracting, and dreaming — builds a growing vocabulary of composable concepts.

---

## The Abstraction Gap

Neural networks are powerful function approximators. Given enough data and compute, they can learn to approximate almost any mapping from inputs to outputs. But the representations they learn are opaque — continuous vectors that don't compose naturally.

**Symbolic AI** took the opposite approach. Systems built on Lisp, Prolog, and expert systems had explicit, composable abstractions. You could define "map," "filter," and "fold," then compose them freely: `fold + 0 (map *2 xs)` computes "sum of doubled elements" by composing two named operations. The representations are transparent, compositional, and reusable.

The problem: symbolic systems couldn't learn from data. The abstractions had to be hand-crafted. And hand-crafting the right abstractions for every domain is exactly the kind of labor-intensive engineering that Sutton's Bitter Lesson warns against.

DreamCoder's insight: **use neural learning to guide symbolic search, and use symbolic abstraction to compress the library of available operations.** The neural part makes search tractable; the symbolic part makes solutions interpretable and reusable.

---

## DreamCoder: Wake, Sleep, Abstract

DreamCoder operates in a cycle with three phases:

### Wake Phase (Solve)

Given a set of tasks (each defined by input-output examples), the system tries to find a program that solves each task. It searches through combinations of available primitives and library functions, guided by a neural recognition model that predicts which operations are likely useful.

**In our implementation**: we enumerate programs in breadth-first order (simplest first) and test each against the task's examples. The neural guide, when trained, helps prioritize more promising programs.

### Sleep Phase — Abstraction

After solving tasks, the system examines the successful programs for **common sub-programs**. If the same sub-expression appears in multiple solutions, it gets compressed into a new library function.

For example, if several solutions contain `(filter even? x)`, this becomes a library function `keep_evens(x) = filter even? x`. Future tasks can now use `keep_evens` as a single primitive instead of rebuilding it from scratch.

**This is the key mechanism**: the library grows, and new tasks become easier because the system can compose existing library functions rather than inventing everything from scratch. Programs get *shorter* (in library-relative terms) as the library grows. Shorter programs = better abstractions = more efficient search.

### Sleep Phase — Dreaming

The system generates synthetic tasks from its current library (by running random programs and recording their input-output behavior). It trains the neural recognition model on these dream tasks, teaching the guide to predict which library functions are useful for different kinds of problems.

This is how the neural component improves: not from labeled data, but from self-generated practice problems — a beautiful instance of self-supervised learning in the program synthesis setting.

---

## Our Toy Implementation

We built a simplified DreamCoder operating on **list processing tasks** — a domain that naturally demonstrates functional abstractions like map, filter, and fold.

### The Primitive Language

Our DSL (domain-specific language) provides basic building blocks:

| Category | Primitives |
|----------|-----------|
| Arithmetic | `+1`, `-1`, `*2`, `+`, `*` |
| List access | `head`, `tail`, `cons`, `empty`, `len` |
| Predicates | `even?`, `odd?`, `>0`, `is_empty` |
| Higher-order | `map`, `filter`, `fold` |
| Control | `if` |

Programs are nested expressions: `(map +1 x)` applies increment to each element of input `x`. `(fold + 0 (filter even? x))` sums the even elements. The language is intentionally small — real DreamCoder uses richer DSLs, but this is enough to demonstrate abstraction learning.

### The Task Suite

Fifteen list processing tasks of increasing difficulty:

**Easy** (single operation):
- Increment all: `[1, 2, 3]` → `[2, 3, 4]` — solved by `(map +1 x)`
- Double all: `[1, 2, 3]` → `[2, 4, 6]` — solved by `(map *2 x)`
- Keep evens: `[1, 2, 3, 4]` → `[2, 4]` — solved by `(filter even? x)`
- Sum list: `[1, 2, 3]` → `6` — solved by `(fold + 0 x)`

**Medium** (composition of two operations):
- Sum of doubled: `[1, 2, 3]` → `12` — needs `(fold + 0 (map *2 x))`
- Sum of evens: `[1, 2, 3, 4]` → `6` — needs `(fold + 0 (filter even? x))`
- Count evens: `[1, 2, 3, 4, 5, 6]` → `3` — needs `(len (filter even? x))`

**Hard** (multi-step composition):
- Increment then keep evens: `[1, 2, 3, 4]` → `[2, 4]` — needs `(map +1 (filter odd? x))`

The difficulty gradient maps naturally to program depth: easy tasks need depth 1, medium tasks need depth 2, and hard tasks need depth 3.

### Running the Experiment

Over 5 wake-sleep cycles, the system:

**Cycle 0 (bootstrapping):** Searches using only primitives. Solves 14/15 tasks. Discovers three common sub-programs: `(filter even? x)`, `(map +1 x)`, and `(filter odd? x)`. These become library functions.

**Cycle 1:** Library has 3 learned abstractions. Discovers a fourth: `(fold + 0 x)` (sum). The search space is now larger (more building blocks) but the important programs are shorter.

**Cycles 2-4:** Library stabilizes at 4 abstractions. All solvable tasks continue to be solved. The one unsolved task (`double_then_keep_small`) requires a comparison operator (`<=`) that isn't in our primitive set — an honest limitation of the DSL, not of the architecture.

### The Library That Emerged

After 5 cycles, the system discovered four library functions from scratch:

| Library function | Definition | Interpretation |
|-----------------|------------|---------------|
| `lib_0(x)` | `(filter even? x)` | Keep even numbers |
| `lib_1(x)` | `(map +1 x)` | Increment all |
| `lib_2(x)` | `(filter odd? x)` | Keep odd numbers |
| `lib_3(x)` | `(fold + 0 x)` | Sum |

These are exactly the abstractions a human programmer would name: `keep_evens`, `increment_all`, `keep_odds`, `sum`. The system discovered them not because we told it they were useful, but because they appeared as common sub-programs across multiple solutions.

**This is the DreamCoder payoff**: the system builds a vocabulary of reusable concepts through compression. The library is a compression scheme — shorter programs using library functions indicate better abstractions.

---

## What This Means for Routing

Let's zoom out to the series-level view. We've now explored four increasingly fundamental routing decisions:

| Part | Mechanism | Routes to | What's allocated |
|------|-----------|----------|-----------------|
| 4 — MoE | Router | Internal expert FFNs | Which parameters |
| 5 — ACT | Halting unit | More thinking steps | How much compute |
| 6 — Tools | Tool-call head | External calculator | Where compute happens |
| 7 — Neuro-Symbolic | Program synthesis | Neural vs. symbolic programs | What *kind* of compute |

Part 7 represents the most fundamental routing question: when should you use a neural network's approximate, learned patterns, and when should you use an exact, composable, symbolic program?

DreamCoder's answer: use neural learning to *guide* symbolic search, and use symbolic programs to *structure* what's learned. The two paradigms aren't in competition — they're complementary. The neural recognition model narrows the search space; the symbolic programs provide interpretability and composability.

### The Bitter Lesson, Revisited

In Part 6, we noted that tool use isn't anti-scaling — it's scaling a different resource (external compute). Part 7 pushes further: **program synthesis is scaling the hypothesis space itself.**

Instead of learning one monolithic function (as a neural network does), the system learns a *language* for expressing functions — and that language grows. Each new library function makes future search easier. This is compositional generalization: the ability to solve novel problems by combining known pieces.

Pure scaling of parameters and data (the Bitter Lesson) produces powerful but opaque models. Program synthesis produces transparent, composable solutions but requires search. The neuro-symbolic approach combines both: neural scale makes search tractable, and symbolic structure makes solutions reusable.

---

## The Gaps

This is the most ambitious post in the series, and the most honest about what we don't achieve at toy scale.

- **Our "neural guide" barely helps.** With only 15 tasks, the enumeration search finds solutions before the neural guide provides meaningful speedup. Real DreamCoder operates on hundreds of tasks where the neural guide is essential for pruning the combinatorial explosion.
- **The abstraction phase is simplified.** Real DreamCoder uses anti-unification to extract parametric abstractions — discovering not just `(filter even? x)` but the general pattern `(filter ? x)` where `?` is a parameter. Our system only discovers exact sub-program matches.
- **No dreaming phase.** We skipped the dream/fantasy phase where the system generates synthetic tasks to train the neural guide. This is what makes real DreamCoder truly self-improving — the guide gets better at predicting useful library functions across cycles.
- **Fixed DSL.** Our primitive set is hand-designed. A more ambitious system would discover new primitives or extend the DSL itself.
- **No wake-sleep dynamics.** Because our library converges quickly (in 2 cycles), we don't see the dramatic library growth curves that real DreamCoder exhibits over dozens of cycles on larger task sets.

Despite these limitations, the core mechanism is visible: **the system discovers reusable abstractions through program compression, and those abstractions make future problems easier.** That's the neuro-symbolic insight, operating at our tiny CPU scale.

---

## The Series Payoff

Across seven posts, we've built a vocabulary for understanding how neural networks allocate computation:

**Part 1**: *Why this matters* — a personal story about the promise of connectionism  
**Part 2**: *How it works* — a neural network from scratch, the core mechanism  
**Part 3**: *What others have built* — Karpathy's tutorials as a foundation  
**Part 4**: *Which computation* — MoE routes tokens to specialized experts  
**Part 5**: *How much computation* — ACT allocates variable depth to harder inputs  
**Part 6**: *Where computation happens* — tool use routes to external systems  
**Part 7**: *What kind of computation* — neuro-symbolic routing between paradigms  

The unifying insight: **intelligence isn't just about having more parameters or more data. It's about learning to allocate the right kind of computation to the right problem.**

Every mechanism we built — the router, the halting unit, the tool-call head, the program synthesizer — is a learned allocation decision. And every budget constraint — the auxiliary loss, the ponder cost, the tool cost, the program length — forces the model to be economical about how it spends its compute.

This is the conditional computation story. It started with a question about routing tokens to experts, and it ends with a question about routing between neural and symbolic paradigms. The answer, in every case, is the same: learn the allocation, constrain the budget, and trust the mechanism.

---

*Previous: [The Economics of Tool Use](/blog/neural-nets-tool-use/)*

*This is the final post in the Neural Nets from Scratch series.*
