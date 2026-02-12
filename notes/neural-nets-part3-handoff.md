# Part 3 Handoff: "A Tour of Karpathy's Tutorials"

## Context

This document captures the state of the Neural Nets from Scratch series as of Feb 2026, to provide context for a focused session on drafting Part 3.

**Key update**: This handoff has been revised based on detailed researcher feedback (see `nn-blog-feedback.md` and `neural-nets-revised-series-plan.md`). The main structural changes: Part 3 uses a "three conceptual deltas" structure instead of trying to cover all of Karpathy's materials, and makemore is the canonical codebase spine for the entire series.

## What's done

- **Part 1** (`content/blog/neural-nets-origin-story.md`) — Draft complete. Personal memoir: Duke seminar, BASIC neural net, AI winters, the switch from CogPsych to CS. Updated with 7-part series listing.
- **Part 2** (`content/blog/neural-nets-simpler-than-you-think.md`) — Draft complete. Builds from scratch in Python/NumPy: single neuron (AND), XOR failure, hidden layers fix XOR, addition with SGD. Interactive `nn-playground` component.
- **Interactive components** — `nn-engine.ts`, `nn-viz.ts`, `nn-playground` entry/component. All tested (16 vitest tests pass).
- **Research** — `notes/neural-nets-research.md` covers all 7 parts.
- **Narrative plan** — `notes/neural-nets-narrative-plan.md` has the full series arc, revised per feedback.
- **Revised series plan** — `notes/neural-nets-revised-series-plan.md` has the comprehensive plan incorporating researcher feedback.
- **Skin** — `chalkboard` (decided after comparing with `theorem`).

## What Part 3 needs

### Core task
Walk the reader through three conceptual deltas — the minimum viable fluency needed for the experiments in Parts 4–7. Use makemore as the canonical codebase. Reference and annotate, don't reproduce.

### The Three Deltas

#### Delta 1: Counting → Learned Model
*Bigram table vs. learned weights*

- How character frequencies become a baseline (the names dataset)
- Log-likelihood as training objective
- Why sampling works: generating from a probability distribution
- **Sanity experiment**: Compare bigram table generation vs. learned-weight generation on names
- **Annotated code**: Key passages from makemore Part 1
- **Connection to Part 2**: "This is the same learning loop, but the target is 'predict the next character'"

#### Delta 2: MLP Language Model → Stable Deep Training
*Why activation/gradient stats matter*

- Embeddings: characters become vectors (one-hot → learned representations)
- Why deeper networks get fragile: vanishing/exploding gradients
- What BatchNorm does: stabilizing internal distributions
- The diagnostic mindset: what to inspect when training breaks
- **Sanity experiment**: Show activation distributions before/after BatchNorm
- **Annotated code**: Key passages from makemore Parts 2–4
- **Connection forward**: "This diagnostic mindset is exactly what we'll need when routing tokens to different experts"

#### Delta 3: Local Computation → Attention (Transformer)
*What attention changes about where computation happens*

- MLP: each token processed independently (local)
- Attention: every position looks at every other (contextual)
- Why this matters: attention is a modular insertion point for routing and tool tokens
- Positional encoding: how the model knows order
- **Sanity experiment**: Train makemore's transformer on names, compare to the MLP
- **Annotated code**: Attention mechanism passages
- **Connection to Part 4**: "The FFN inside each transformer block is where MoE makes its modification"

### Codebase decision: makemore is the spine

The series commits to makemore as the canonical codebase:
- **makemore**: "One hackable file," PyTorch only, explicitly educational, covers bigrams → transformer. CPU-friendly. Parts 4–7 are implemented as diffs against this.
- **nanoGPT**: Acknowledge as historically influential but deprecated per its README. Not our base.
- **nanochat**: Mention as the modern full-stack successor for readers who want more, but it's single-GPU oriented.

### Guiding principle
**Reference Karpathy's code, don't reproduce it.** Show annotated code passages and minimal diffs. Link to upstream. The goal is education and building enough fluency to extend the codebase in Parts 4–7.

### The CPU-first contract
All experiments run on CPU. Character-level tokenization, ≤5MB training data, model trains in minutes. This is a feature, not a limitation — it mirrors the conditional computation theme of the series.

### Open questions
- **Interactive components**: Character-level text generation demo? Attention visualization? Or let the code + Karpathy's videos carry the weight?
- **How much of makemore's code to show**: The "three deltas" approach means we're selective — but we need enough for the reader to feel grounded before Parts 4–7 start patching the codebase.
- **Establishing the baseline**: Part 3's closing should clearly define "here is the makemore transformer that Parts 4–7 will modify" — with a specific configuration (embedding size, number of layers, etc.) that we commit to.

### Assumptions about the reader
- Has read Parts 1-2
- Understands forward pass, backpropagation, hidden layers, stochastic gradient descent
- Ready for: embeddings, attention, tokenization

## Key files to reference
- `notes/neural-nets-revised-series-plan.md` — The comprehensive revised plan (start here for full context)
- `notes/nn-blog-feedback.md` — Researcher feedback that shaped the revision
- `notes/neural-nets-research.md` — Part 3 research section + updated status
- `notes/neural-nets-narrative-plan.md` — Part 3 narrative arc (revised)
- `content/blog/neural-nets-simpler-than-you-think.md` — Part 2 ends with a forward reference to Part 3
- `DEVELOPMENT.md` — Series status table and next steps

## Series conventions
- Hugo static site, front matter: `series`, `weight`, `skin: chalkboard`, `draft: true`
- No dates, no tags
- Interactive components: `interactive/src/entries/{name}.ts` → `interactive/src/components/{name}.ts`
- Each post ends with a forward reference to the next
- Code shown as diffs/patches against makemore baseline where possible (starting in Part 4)

## What comes after Part 3

Part 3 establishes the makemore transformer as the baseline. The next steps:

1. **Build the toy benchmark pack** (before Parts 4–7):
   - Domain mixture dataset (names + arithmetic + code) for MoE
   - Algorithmic suite (parity, addition-with-carry, parentheses) for adaptive computation
   - Tool suite (calculator + lookup table) for tool use
   - Program synthesis suite (list processing) for DreamCoder

2. **Part 4**: MoE-FFN as a diff against the makemore transformer
3. **Part 5**: ACT / recurrent depth with the algorithmic task suite
4. **Part 6**: Tool tokens with the toy calculator
5. **Part 7**: DreamCoder wake-sleep on list processing