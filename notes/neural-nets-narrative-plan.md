# Neural Nets from Scratch — Narrative Plan

## Series Overview

A seven-part series that moves from personal memoir through hands-on implementation to original experiments with small language models. The arc: **why I care → how it works → what others have built → what I want to try**.

The conceptual spine (Parts 3–7): **conditional computation under a budget**. Each post explores a different routing decision — to internal experts, through variable depth, to external tools, and between neural and symbolic computation.

### Series Structure

| Part | Title | Focus | Routing Decision |
|------|-------|-------|-----------------|
| **1** | Minds, Brains and Computers | Personal memoir: the seminar, the BASIC neural net, the AI winters | — |
| **2** | Neural Nets Are Simpler Than You Think | Build from scratch: single neuron, XOR, addition. Interactive playground. | — |
| **3** | A Tour of Karpathy's Tutorials | Three conceptual deltas: counting → learned model → attention. makemore as spine. | How computation flows through a network |
| **4** | Building a Mixture-of-Experts Model | Conditional computation primitives. Manufactured domains. Routing visualization. | Route to internal sub-networks |
| **5** | Adaptive Computation: Learning When to Think Harder | ACT / recurrent depth. Algorithmic task suite. Compute-vs-accuracy plots. | Route through more computation |
| **6** | The Economics of Tool Use | Tool tokens, cost-aware calling, the dream state. Toy calculator experiment. | Route to external systems |
| **7** | Programs That Write Programs: Neuro-Symbolic Computing | DreamCoder, wake-sleep, library learning. Reusable abstractions. | Route between neural and symbolic |

Part 1 establishes *why* this matters personally. Part 2 demystifies the mechanism with working code. Part 3 bridges from toy networks to real language models via Karpathy's accessible tutorials. Parts 4–7 are original experiments — the series pivots from "following others' work" to "trying something new." Each of Parts 4–7 is framed as a "conceptual laboratory" exploring mechanisms and tradeoffs, not chasing benchmarks.

### The CPU-First Contract

Compute budget is a first-class design dimension, not a footnote. All experiments run on CPU. This is philosophically consistent with the series spine: every experiment is about allocating scarce compute wisely.

- **Tokenization**: Character-level throughout
- **Training data**: ≤1–5MB per experiment
- **Model size**: Minutes to train on CPU
- **Framework**: PyTorch only (matching makemore)
- **Codebase spine**: makemore as the canonical hackable base
- **Evaluation**: At least one quantitative metric per post (loss curves + post-specific measures)

### What Makes This Series Different

1. **Personal throughout**: Every post connects back to the origin story — this isn't a textbook, it's a decades-long fascination being explored live
2. **Interactive components**: The reusable `nn-engine` and `nn-viz` modules let readers play with real networks in the browser
3. **Honest about scale**: We don't pretend a 545-parameter network is comparable to GPT-4. We explicitly discuss what's the same (the mechanism) and what's different (scale, architecture, data)
4. **Original experiments**: Parts 4–7 aren't reproductions — they're genuine explorations that might fail, and we report what actually happens
5. **CPU-first**: The entire series is reproducible without a GPU. Compute budget is a design constraint, not a limitation — it mirrors the conditional computation theme
6. **Unified spine**: Parts 4–7 share a conceptual framework (conditional computation under a budget) that makes each post feel like a chapter, not a standalone essay

---

## Part 1: "Minds, Brains and Computers"

**Status**: Draft complete (`neural-nets-origin-story.md`).

### Narrative Arc

#### 1.1 — The Hook
- Open with the personal stakes: "I wrote neural nets in BASIC before they were cool"
- This isn't nostalgic showboating — it's establishing that neural nets have been personally significant for decades

#### 1.2 — The Seminar
- Duke University, "Minds, Brains and Computers" — a cross-disciplinary seminar on connectionism
- The key texts: Michael Arbib's "Brains, Machines, and Mathematics," the PDP group's work
- The personal discovery: the idea that intelligence could emerge from simple connected units
- **The BASIC implementation**: built a small network as part of the seminar. Trained it by hand on the command line. Watched it learn through repetition — the first time code felt alive

#### 1.3 — The Switch
- The BASIC neural net was the catalyst: switched major from Cognitive Psychology to Computer Science
- The Duke CS department was transitioning from C to C++
- **The disappointment**: the AI course focused on expert systems and Prolog. Neural nets were considered unfashionable — a dead end from the 1960s
- Russell and Norvig's textbook gave neural nets a small chapter. The curriculum had moved on.

#### 1.4 — The Winters
- First AI winter: Minsky & Papert's *Perceptrons* (1969) — proved single-layer networks can't learn XOR
- Second wave: Rumelhart, Hinton & Williams (1986) — backpropagation showed hidden layers could learn anything
- Second winter: expert systems collapsed, Prolog faded, the whole field contracted
- Third wave: deep learning, GPUs, the current era — the connectionist dream vindicated

#### 1.5 — The Series Ahead
- Brief preview of what's coming: build from scratch, reproduce Karpathy's work, then original experiments
- Tone: "I've been waiting thirty years for this"

### Tone
Reflective, personal, no code. This is a memoir post that happens to be about computer science. The reader should feel the emotional weight of the AI winters and the long vindication.

---

## Part 2: "Neural Nets Are Simpler Than You Think"

**Status**: Draft complete (`neural-nets-simpler-than-you-think.md`). Interactive component built.

### Narrative Arc

#### 2.1 — The Interactive Hook
- Before any explanation, drop the reader into the `nn-playground` interactive component
- "This is a live neural network. Pick a task, hit Train, and watch it learn."
- Suggested exercise: try XOR with no hidden layer (it fails), then add a hidden layer (it works)
- This gives the reader a visceral understanding before the code deep-dive

#### 2.2 — A Single Neuron
- Three operations: multiply, sum, squish (sigmoid)
- The entire neuron in 4 lines of Python
- Train it to learn the AND gate — the simplest possible learning task
- **Teaching moment**: the four-step learning loop (forward, error, gradient, update) is the entire algorithm. Everything else is elaboration.

#### 2.3 — The Catastrophe (XOR Fails)
- Swap AND for XOR — the neuron is "maximally confused"
- This isn't a bug — it's a mathematical impossibility (linear separability)
- Connect to Part 1: this is exactly what Minsky & Papert proved, and what froze the field for 15 years

#### 2.4 — The Fix (Hidden Layers)
- Add a hidden layer → XOR is solved
- Backpropagation explained as "trace the blame backward and fix it"
- 30 lines of code solves the problem that paralyzed AI research

#### 2.5 — Teaching It Arithmetic
- Scale up: 500 random addition problems, two hidden layers
- **Stochastic gradient descent**: updating after each example instead of all at once. The noise helps.
- The network learns addition from examples alone — no one told it the rules
- Honest about limitations: sigmoid struggles at extremes (0+0, 99+99)

#### 2.6 — The Gap: From Here to ChatGPT
- What's the same: forward pass, backpropagation, loss function
- What's different: scale, architecture (transformers), data, infrastructure
- Key message: "if you understand our XOR network, you understand the conceptual core of every neural network ever built"

#### 2.7 — The Simplicity Is the Point
- Philosophical close: the radical claim of connectionism is that intelligence emerges from simple operations arranged in the right structure
- "The code in this post is about 60 lines. It's the actual mechanism, just smaller."

### Interactive Components
- `nn-playground`: task selector (AND/OR/XOR), architecture selector (no hidden layer / 4 hidden neurons), live training with weight visualization, loss curve, truth table

### Assumptions About the Reader
- Comfortable with Python
- Basic understanding of what a neural network is (conceptually)
- No prior experience building one

---

## Part 3: "A Tour of Karpathy's Tutorials"

**Status**: Research complete. Draft not started.

### Revised Framing (from researcher feedback)

Instead of "cover everything Karpathy built," Part 3 is structured as **three conceptual deltas** — the minimum viable fluency needed to start doing controlled experiments in Parts 4–7. The promise: "not a Karpathy walkthrough, but the minimum viable fluency to start doing controlled experiments."

The scope narrowing is important: the original plan ("makemore + nanoGPT + build GPT video") was too wide for one post if the goal is working fluency rather than a survey.

### Codebase Decision

**makemore is the spine codebase for the series.** It is explicitly designed as "one hackable file" with PyTorch as the only dependency, built for education. It presents the full ladder from bigrams to a Transformer.

- **nanoGPT**: Acknowledged as historically influential but deprecated (its README says "old and deprecated" and points to nanochat). Referenced as a historically important minimal repo, not as our base.
- **nanochat**: Mentioned as the modern full-stack successor for readers who want to go further, but it's oriented to single-GPU training economics, not CPU-only reproduction.

### Narrative Arc: Three Conceptual Deltas

Each delta has one or two annotated code passages and one "sanity experiment."

#### Delta 1: Counting → Learned Model
*Bigram table vs. learned weights*

- How character frequencies in the names dataset become a baseline language model
- How log-likelihood becomes a training objective
- Why sampling works: generating from a probability distribution
- **Sanity experiment**: Compare bigram table generation vs. learned-weight generation on names
- **Annotated code**: Key passages from makemore Part 1
- **Connection to Part 2**: "Remember our addition network? This is the same learning loop, but the target is 'predict the next character'"

#### Delta 2: MLP Language Model → Stable Deep Training
*Why activation/gradient stats matter*

- Embeddings: how characters become vectors (the conceptual leap from one-hot to learned representations)
- Why deeper networks become fragile: vanishing/exploding gradients
- What BatchNorm does: stabilizing internal distributions
- The diagnostic mindset: what to inspect when training breaks
- **Sanity experiment**: Show activation distributions before/after BatchNorm — the "dead neuron" problem and its fix
- **Annotated code**: Key passages from makemore Parts 2–4
- **Connection forward**: "This diagnostic mindset — inspecting what's happening inside the network — is exactly what we'll need when we start routing tokens to different experts"

#### Delta 3: Local Computation → Attention (Transformer)
*What attention changes about where computation happens*

- In an MLP, each token is processed independently (local computation)
- Attention lets every position "look at" every other position (contextual computation)
- Why this matters: attention is a modular insertion point for routing and tool tokens
- Positional encoding: how the model knows order without recurrence
- **Sanity experiment**: Train makemore's transformer on names, compare generation quality to the MLP
- **Annotated code**: Key attention mechanism passages from makemore Part 5 / "Let's build GPT"
- **Connection to Part 4**: "The feed-forward network inside each transformer block is where MoE makes its modification — we'll replace it with multiple expert FFNs and a router"

#### Closing: What We Reference but Don't Reproduce
- nanoGPT's historical significance and deprecated status
- nanochat as the modern endpoint for readers who want the full stack
- "Let's reproduce GPT-2" video as "where this all leads" — clearly out of scope for CPU-first experiments
- makemore Parts 3–4 (BatchNorm, manual backprop) as "the diagnostic toolkit" — readers should watch the videos for the full deep-dive

### Guiding Principle

**Reference and annotate, don't reproduce.** Show minimal diffs and annotated code passages. Link to upstream code. The post should be "dense in insight but light in compute."

Parts 4–7 will be implemented as **diffs against makemore's transformer**. Part 3 establishes the baseline that all future patches modify.

### Interactive Components (Potential)
- Character-level text generation demo: type a prompt, watch the model generate character by character
- Attention visualization: show which tokens are attending to which
- (These are aspirational — Part 3 may not need interactivity if the code examples and Karpathy's videos carry the weight)

### Assumptions About the Reader
- Has read Parts 1-2
- Understands forward pass, backpropagation, hidden layers, stochastic gradient descent
- Ready for: embeddings, attention, tokenization

---

## Part 4: "Building a Mixture-of-Experts Model"

**Status**: Research complete. CPU-first design (revised from original GPU assumption).

### Revised Framing (from researcher feedback)

"MoE as conditional computation primitives." The key critique: training on a single homogeneous corpus likely won't produce meaningful expert specialization. The routing signal can collapse to arbitrary partitioning unless we **manufacture domains** while staying tiny. We show mechanics, visualize routing, and demonstrate failure modes — not chase emergent specialization that requires massive scale.

### Narrative Arc

This is where the series becomes original. Starting from the makemore transformer established in Part 3, we replace the FFN block with multiple "expert" sub-networks and a learned router.

#### 4.1 — The Idea: Conditional Computation
- In a standard network, every input activates every parameter
- MoE: a gating network selects which expert(s) process each token
- Historical grounding: Jacobs et al. (1991) — original MoE concept
- Modern context: Switch Transformer (top-1 routing), DeepSeek-MoE (fine-grained segmentation)
- **What we can show on CPU**: Conditional computation mechanics and routing pattern formation
- **What we're honest about**: Large-scale MoE benefits (distributed parallelism, massive parameter counts) are out of scope

#### 4.2 — Implementation: MoE-FFN with Top-k Routing
- Starting from makemore's transformer (the Part 3 foundation)
- Replace the MLP/FFN block with an MoE-FFN: K small expert FFNs + a router (matching canonical architecture)
- Top-1 (or top-2) routing
- Load-balancing auxiliary loss (explicitly needed to prevent expert collapse)
- **Show as a diff against the makemore baseline** — minimal, focused changes
- Reference: makeMoE (AviSoori1x) as an existing implementation of this pattern

#### 4.3 — The Domain Mixture Experiment
- **Dataset**: Mix names + arithmetic strings + tiny code snippets into one training stream (the "manufactured domains" approach)
- **Held-out validation**: Separate val set per domain
- **The question**: Does gating correlate with domain?
- **Analysis**: Confusion-matrix-style visualization — for each expert, what fraction of tokens come from each domain?
- This is much more determinative than "it feels like experts specialize"

#### 4.4 — Failure Modes and Stabilizers
- **Expert collapse**: Show what happens without load balancing — one expert gets everything
- **Imbalanced routing**: Show utilization distribution before and after the auxiliary loss
- **Routing instability**: How training can oscillate between routing configurations
- These failure modes are the real educational content — understanding them is understanding MoE

#### 4.5 — Conditional Computation as a Stepping Stone
- Even without spectacular specialization, we've demonstrated: sparse dispatch, gating logits, expert capacity, and stability
- **Promise kept**: Conditional computation mechanics + routing visualization
- **Honest gap**: Production MoE involves distributed parallelism and parameter counts orders of magnitude larger
- **Forward connection**: "The router decides *which* computation. In Part 5, we ask: *how much* computation?"

### Key Metrics
- Train/val loss: MoE model vs. dense baseline (same total params vs. same active params)
- Expert utilization heatmap per domain (the confusion-matrix visualization)
- Load balance ratio over training
- Routing entropy (higher = more distributed routing)

### Implementation Notes
- CPU-friendly: Small model, character-level tokenization, ≤5MB training data
- Code as diffs against makemore baseline
- Reproducible: Fixed seeds, logged hyperparameters

---

## Part 5: "Adaptive Computation: Learning When to Think Harder"

**Status**: Research complete. CPU-first design (revised from original GPU assumption). Builds on Part 4.

### Revised Framing (from researcher feedback)

The researcher's strongest critique: "thinking" is anthropomorphic and risks disappointing readers when a small CPU model doesn't exhibit chain-of-thought reasoning (documented as an emergent property at very large scale). The better framing: **"the model learns when to spend more computation."** This has deep precedent in Adaptive Computation Time (ACT), early-exit transformers, and dynamic halting.

**Revised title**: "Adaptive Computation: Learning When to Think Harder" replaces "Adding 'Thinking' — Chain-of-Thought from Architecture."

### Narrative Arc

#### 5.1 — The Problem: Fixed Compute per Token
- In a standard transformer, every token gets the same computation
- But some tokens are easy ("the" after "in") and some are hard (predicting the next digit in carry-heavy addition)
- Human analogy: "2+2" is instant, "347×29" requires intermediate steps
- **The question**: Can the model learn to spend more computation only where it helps?

#### 5.2 — Adaptive Computation Time (ACT)
- Graves (2016): A network that learns how many internal steps to take
- Key mechanism: halting probability at each step — the model decides when it's "done"
- A cost term discourages infinite pondering (**budget constraint** — consistent with our series spine)
- Original evaluations include parity, logic, addition, sorting, character-level LM — exactly CPU-friendly tasks
- **Connection to Part 4**: ACT's cost term is philosophically the same as MoE's load-balancing loss — both are budget constraints on computation

#### 5.3 — Implementation: Recurrent Depth with a Halting Signal
- Start from the makemore transformer (with or without Part 4's MoE)
- Add recurrence: run the same transformer block multiple times per token
- Add a halting unit: at each step, predict "should I stop?"
- Add a ponder cost: penalize extra computation
- Show as a diff against the baseline

#### 5.4 — The Algorithmic Task Suite
- **Parity**: Count 1-bits mod 2 (variable difficulty via input length)
- **Addition with carry**: Character-level "23+45=68" (carry propagation = multi-step)
- **Parenthesis matching**: "((()))" valid, "(()" invalid (depth tracking)
- **Sorting indicators**: "Is this sequence sorted?" (comparison chains)
- **The key plot**: Accuracy vs. measured compute — "more compute helps more on harder inputs"
- ACT reports this as an interpretable signal: more computation allocated to harder-to-predict transitions

#### 5.5 — How MoE Interacts with Adaptive Depth
- The Part 4 hypothesis becomes testable: does the model route "hard" problems through more computation?
- **Concrete tests**:
  - Route hard inputs to a "deep expert" (more recurrent passes) vs. easy inputs to "shallow expert"
  - Observe whether the router changes expert selection as recurrent depth increases
- This turns Part 5 into a controlled conditional-computation experiment rather than a vague intelligence claim

#### 5.6 — Honest Assessment
- **What we showed**: Mechanics of adaptive computation; evidence that variable depth helps on variable-difficulty tasks
- **The gap**: Chain-of-thought reasoning in large models (Wei et al.) is emergence at scale under prompting. Our experiments demonstrate *mechanisms and tradeoffs*, not miniature frontier reasoning.
- **Forward connection**: "The model learns to spend more *internal* computation on hard problems. In Part 6: what if the hard problem requires *external* computation?"

### Key Metrics
- Accuracy vs. number of recurrent passes (the key plot)
- Average halting step by task difficulty
- Ponder cost vs. accuracy tradeoff curve
- Per-example compute budget visualization

---

## Part 6: "The Economics of Tool Use"

**Status**: Research complete. CPU-first design (revised from original GPU assumption). Builds on Parts 4-5.

### Revised Framing (from researcher feedback)

The researcher identified an important premise update: **tool use is not a niche idea.** Toolformer, RAG, ReAct, Self-RAG, and production tool-calling APIs are well-established. The original question ("why isn't this dominant?") needs reframing to: **"what prevents tool use from being the default for every token?"** The answer: retrieval/tool calls introduce irrelevant context, latency, and failure modes; indiscriminate retrieval degrades generation. The interesting question is about adaptive, cost-aware tool use.

**The Bitter Lesson, carefully**: Sutton's argument can cut both ways. Tool use can be framed as scaling a *different resource* (external compute + external memory) — not opposed to scaling, but complementary. **Strong essay move**: "Tool use is not anti-scaling; it's scaling a different resource and forcing an economic decision about when to pay that cost."

### Narrative Arc

#### 6.1 — The Landscape: Tool Use Is Not a Niche Idea
- Toolformer: self-supervised tool learning (calculator, search, Q&A, translation, calendar)
- RAG: non-parametric retrieval augmenting parametric generation
- ReAct: interleaving reasoning traces with external actions
- Self-RAG: retrieve on demand with reflection tokens
- Production tool calling: OpenAI's documented flow
- **The real question**: Not "why isn't tool use dominant?" but "what prevents tool use from being the default?"

#### 6.2 — The Economics: When to Compute vs. When to Call
- Tool calls have costs: latency, failure modes, irrelevant context
- Internal computation has costs: fixed per token, limited by what's in weights
- The optimal strategy: tools only when they add enough value to justify the cost
- **Connection to ACT (Part 5)**: Both are about spending compute only where it buys accuracy
- **Connection to MoE (Part 4)**: Tool use is routing to an external expert — same gating decision, different destination

#### 6.3 — The Toy Tool Experiment
- **The tool**: A deterministic calculator (or tiny lookup table)
- **The dataset**: Mixture — some queries trivially memorizable, others requiring exact arithmetic/lookup
- **The mechanism**: `<CALL_TOOL>` vs `<NO_TOOL>` policy token with explicit cost term (mirroring ACT's ponder cost)
- Dramatically simpler than full Toolformer but illustrates the economic principle

#### 6.4 — The "Dream State" Idea (CPU-Simplified)
- Adversarial divergence test, simplified to toy scale:
  - Compare model's no-tool answer vs. tool output per example
  - Agreement → discourage tool use (model already knows)
  - Divergence → encourage tool use (tool adds value)
- **Related work**: Self-RAG's "retrieve on demand," AdaTIR's difficulty-aware efficiency rewards
- The "adversary" is as simple as: search for prompts where no-tool answer diverges from tool output, upweight those in training

#### 6.5 — Routing Unification
- The conceptual payoff:
  - Part 4: Route to internal experts (sparse gating)
  - Part 5: Route through variable depth (adaptive computation)
  - Part 6: Route to external tools (tool tokens)
  - All are: **how should a model allocate its computational budget?**
- Modern cost-aware routing research (xRouter, RouteLLM) explicitly connects these
- **Forward connection**: "We've routed to experts, through depth, and to tools. Part 7 asks the most fundamental routing question: when should you use a neural network at all — vs. a symbolic program?"

### Key Metrics
- Tool call rate by query type (memorizable vs. requires-tool)
- Accuracy: tool-augmented vs. internal-only
- Cost per correct answer (with tool cost penalty)
- Routing decision visualization: which queries get tools?

---

## Part 7: "Programs That Write Programs: Neuro-Symbolic Computing" (NEW)

**Status**: New addition. Needs dedicated research phase.

### Why This Post

The series explores routing computation to different experts (Part 4), through variable depth (Part 5), and to external tools (Part 6). Part 7 asks the most fundamental routing question: **when should you use a neural network's approximate, learned patterns, and when should you use an exact, composable, symbolic program?**

DreamCoder (Ellis et al., 2021) is the most elegant demonstration of neuro-symbolic computing: a system that combines neural networks with program synthesis in a wake-sleep cycle, discovering reusable abstractions along the way.

### Connection to Series Spine

The progression of routing decisions reaches its natural conclusion:
- Part 4: Same paradigm, different parameters (MoE)
- Part 5: Same paradigm, more iterations (adaptive depth)
- Part 6: Different system, fixed interface (tools)
- Part 7: **Different paradigm entirely** (neural vs. symbolic computation)

### Narrative Arc

#### 7.1 — The Abstraction Gap
- Neural networks learn functions but don't naturally discover reusable abstractions
- Symbolic AI had abstractions (Lisp, Prolog) but couldn't learn from data
- **The question**: Can we combine neural learning with symbolic abstraction?

#### 7.2 — DreamCoder: Wake, Sleep, Abstract
- **Wake phase**: Neural recognition model maps tasks to likely program sketches
- **Sleep phase**: Successful programs analyzed for common sub-expressions → new library primitives
- **The library**: Starts with basic primitives, grows to include discovered concepts ("map," "fold," etc.)
- Key insight: Library = compression scheme. Shorter programs using library functions = better abstractions

#### 7.3 — A Toy Implementation
- **Domain**: Simple list processing (transform [1,2,3] to [2,4,6], filter evens, etc.)
- **Primitive library**: Basic list operations (cons, car, cdr, +, *, lambda)
- **Neural guide**: Small network predicting which library functions are relevant given a task
- **Wake-sleep loop**: Solve → find common sub-programs → add to library → solve harder tasks
- **CPU-friendly**: Program synthesis is enumeration-based; neural guide just prunes the search space

#### 7.4 — Watching Abstractions Emerge
- **Key visualization**: Library growth over wake-sleep cycles
- Solution length decreases as library grows (compression)
- Can we see the system discover "map" or "fold" on its own?

#### 7.5 — Neural vs. Symbolic vs. Neuro-Symbolic
- Pure neural: Learns from data, opaque, non-compositional
- Pure symbolic: Interpretable, composable, but requires hand-crafted primitives
- Neuro-symbolic: Neural learning guides symbolic search; programs are interpretable and reusable

#### 7.6 — The Series Payoff: All Routing Is Resource Allocation
- Part 4: When to use expert A vs B (internal routing)
- Part 5: When to compute more (depth routing)
- Part 6: When to call a tool (external routing)
- Part 7: When to use learned patterns vs. symbolic programs (paradigm routing)
- **The unifying insight**: Intelligence isn't just about more parameters or data. It's about allocating the right kind of computation to the right problem.

### Key Metrics
- Library primitives discovered per wake-sleep cycle
- Solution compression (average program length in library tokens over cycles)
- Task success rate over cycles
- Which abstractions are discovered? (qualitative)

### CPU Feasibility
- Program synthesis is search-based, not gradient-based — inherently CPU-friendly
- Neural recognition model is small
- Constrained DSL keeps the primitive set manageable

### References (to research)
- Ellis et al. (2021) — DreamCoder (PLDI)
- Hinton et al. (1995) — Wake-sleep algorithm (historical connection to series)
- Lake et al. (2017) — "Building machines that learn and think like people"
- Nye et al. (2020) — "Learning Compositional Rules via Neural Program Synthesis"

---

## Narrative Principles

1. **Personal thread throughout**: Every post ties back to the origin story. Part 2 recreates the XOR crisis from Part 1. Part 3 echoes "the most interesting thing I'd ever built." Parts 4–7 are "trying what I always wanted to try."

2. **Honest about failure**: Especially in Parts 4–7, if an experiment doesn't work, we say so. The series gains credibility from candor. Frame experiments as "conceptual laboratories," not benchmark chases.

3. **Progressive complexity**: Each post assumes the reader has read the previous ones. Part 1: no code. Part 2: Python from scratch. Part 3: annotate others' work. Parts 4–7: original experiments.

4. **Interactive where it helps**: The `nn-playground` is the star interactive component. Future posts may add routing heatmaps (Part 4), compute-vs-accuracy plots (Part 5), tool-decision visualizers (Part 6), and library growth animations (Part 7) — but only if they genuinely aid understanding.

5. **The gap is explicit**: We never pretend our small models are comparable to production LLMs. We always acknowledge what scales and what doesn't.

6. **CPU-first is a feature, not a limitation**: The compute constraint mirrors the conditional computation theme. Every experiment is about allocating scarce compute wisely.

7. **Careful with anthropomorphism**: Use "adaptive computation" and "conditional compute under budget" rather than "thinking" or "reasoning." Chain-of-thought is an emergent property at scale; our experiments demonstrate mechanisms and tradeoffs.

8. **Diffs over reimplementation**: Parts 4–7 show minimal patches against the makemore baseline. Link to upstream code, clearly label what changed. This keeps the "extend the codebase" goal clean.

9. **Quantitative grounding**: At least one measurable, plotable metric per post. Loss curves and sampling prompts are the minimum. Post-specific metrics (routing heatmaps, halting-step distributions, tool-call rates, library growth) anchor claims in evidence.

---

## Tone and Style

- Personal, exploratory, like a lab notebook shared with a smart friend
- Code is illustrative — clean, commented, runnable, but not production
- Mathematical notation is used sparingly and always accompanied by plain-language explanation
- Use the `chalkboard` skin — handwritten headings, lecture-hall feel (decided after comparing with `theorem`)
- Follow site conventions: no dates, no tags, `series` field in front matter, `weight` for ordering
- Each post ends with a forward reference to the next
- Show code as diffs/patches against the makemore baseline where possible
