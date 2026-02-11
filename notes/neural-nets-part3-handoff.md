# Part 3 Handoff: "A Tour of Karpathy's Tutorials"

## Context

This document captures the state of the Neural Nets from Scratch series as of Feb 2026, to provide context for a focused session on drafting Part 3.

## What's done

- **Part 1** (`content/blog/neural-nets-origin-story.md`) — Draft complete. Personal memoir: Duke seminar, BASIC neural net, AI winters, the switch from CogPsych to CS.
- **Part 2** (`content/blog/neural-nets-simpler-than-you-think.md`) — Draft complete. Builds from scratch in Python/NumPy: single neuron (AND), XOR failure, hidden layers fix XOR, addition with SGD. Interactive `nn-playground` component.
- **Interactive components** — `nn-engine.ts`, `nn-viz.ts`, `nn-playground` entry/component. All tested (16 vitest tests pass).
- **Research** — `notes/neural-nets-research.md` covers all 6 parts.
- **Narrative plan** — `notes/neural-nets-narrative-plan.md` has the full series arc, tone, principles, per-part outlines.
- **Skin** — `chalkboard` (decided after comparing with `theorem`).

## What Part 3 needs

### Core task
Walk through Andrej Karpathy's tutorials, reproduce key results, annotate with personal observations, and write it up as a blog post that bridges Part 2's toy networks to real language models.

### Karpathy materials to work through
1. **makemore series** (5 videos + code):
   - Part 1: Bigram model (character-level, no neural net — just counting)
   - Part 2: MLP language model (embeddings, hidden layer)
   - Part 3: Activations, gradients, BatchNorm
   - Part 4: Backprop from scratch (manual gradients through the whole model)
   - Part 5: WaveNet-style architecture
2. **nanoGPT** — minimal transformer implementation, trains on Shakespeare
3. **"Let's build GPT from scratch"** video — builds a transformer step by step

### Key narrative beats (from the narrative plan)
- Why Karpathy: his tutorials are the best bridge from "understand neural nets" to "understand LLMs"
- Personal angle: following these tutorials felt like the seminar all over again
- From characters to language: predict next character → bigram → MLP → transformer
- The transformer architecture: attention, positional encoding
- What this means for Parts 4-6: we now have a foundation to modify

### Guiding principle
**Reference Karpathy's code, don't reproduce it.** The goal is education — helping the reader understand what's happening and why — not reproduction for its own sake. We should:
- Point readers to Karpathy's repos and videos as the primary source
- Walk through key code passages with annotation and explanation, not rewrite them
- Focus on the conceptual leaps: what changes from bigram → MLP → transformer, and why each step matters
- Run Karpathy's code ourselves to verify understanding and capture real outputs for the post

The one caveat: we need to understand the code deeply enough to **extend it** in Parts 4-6 (MoE routing, chain-of-thought, tool use). So the post should build the reader's (and our own) working fluency with the codebase, not just survey it.

### Open questions
- Interactive components: character-level text generation demo? Attention visualization? Or skip interactivity for this post and let the code + Karpathy's videos carry the weight?
- Scope: cover all of makemore + nanoGPT, or focus on the most impactful conceptual jumps?

### Assumptions about the reader
- Has read Parts 1-2
- Understands forward pass, backpropagation, hidden layers, stochastic gradient descent
- Ready for: embeddings, attention, tokenization

## Key files to reference
- `notes/neural-nets-research.md` — Part 3 research section starts around "Part 3: A Tour of Karpathy's Tutorials"
- `notes/neural-nets-narrative-plan.md` — Part 3 section has the detailed outline
- `content/blog/neural-nets-simpler-than-you-think.md` — Part 2 ends with a forward reference to Part 3
- `DEVELOPMENT.md` — series status table and next steps
- `notes/archive/hll-series-narrative-plan.md` — reference for narrative plan format (if needed)

## Series conventions
- Hugo static site, front matter: `series`, `weight`, `skin: chalkboard`, `draft: true`
- No dates, no tags
- Interactive components: `interactive/src/entries/{name}.ts` → `interactive/src/components/{name}.ts`
- Each post ends with a forward reference to the next
