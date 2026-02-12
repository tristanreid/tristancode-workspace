# Neural Nets from Scratch — Revised Series Plan

## Origin and Context

This plan revises the original series architecture based on detailed feedback from a researcher who reviewed our Part 3 handoff and series goals (see `nn-blog-feedback.md`). The feedback identified structural risks, sharpened the CPU-first constraint into a design principle, and provided concrete recommendations for Parts 3–6. We've also added a new post on neuro-symbolic computing (DreamCoder) to extend the series arc.

The original plans in `neural-nets-narrative-plan.md` and `neural-nets-research.md` remain valuable references — this document supersedes them for structural decisions and per-part plans going forward.

---

## The Big Idea: Conditional Computation Under a Budget

The researcher's most important structural recommendation is to unify Parts 3–7 under a single conceptual spine: **conditional computation under a budget**. This framing does three things:

1. **Makes the CPU constraint a feature, not a limitation.** Every experiment is about allocating scarce compute wisely — which is exactly what MoE, adaptive computation, and tool use are about at any scale.

2. **Creates a clean progression.** Each post explores a different routing decision:
   - Part 3: How does computation flow through a neural net? (the baseline)
   - Part 4: Route to **internal sub-networks** (MoE — sparse expert selection)
   - Part 5: Route through **more computation** (adaptive depth / deliberation)
   - Part 6: Route to **external systems** (tool use — when internal compute isn't enough)
   - Part 7: Route between **learned computation and symbolic programs** (neuro-symbolic / DreamCoder)

3. **Keeps promises honest.** We frame experiments as "conceptual laboratories" exploring mechanisms and tradeoffs, not stealth benchmarks chasing emergent behaviors that only appear at frontier scale.

---

## The CPU-First Contract

The researcher stressed that "CPU-only replication" should be a first-class design dimension, not a footnote. We adopt this as an explicit contract with the reader.

### Baseline Spec (applies to all posts)

- **Tokenization**: Character-level throughout the series (no BPE/SentencePiece complexity)
- **Training data**: ≤1–5MB total text per experiment
- **Model size**: Small enough that a few thousand training iterations complete in minutes on CPU
- **Framework**: PyTorch only (matching makemore's single dependency)
- **Codebase spine**: `makemore` as the canonical hackable base (see "Why makemore" below)

### Evaluation Spec (at least one quantitative metric per post)

- **Every post**: Train/val loss curves and a fixed sampling prompt set
- **Part 4 (MoE)**: Fraction of tokens routed to each expert, load balance ratio, computation per token
- **Part 5 (Adaptive Compute)**: Accuracy vs. measured compute (halting steps, recurrent passes), cost per example
- **Part 6 (Tool Use)**: Tool call rate, accuracy with/without tools, cost of tool calls vs internal compute
- **Part 7 (Neuro-Symbolic)**: Program synthesis success rate, library growth over wake-sleep cycles

### What We Promise vs. What We Don't

**We promise:** Working mechanics, interpretable visualizations, honest measurements, and the conceptual tools to understand how these ideas work at any scale.

**We don't promise:** That toy-scale experiments will reproduce the emergent behaviors seen in frontier models. We'll always name the gap explicitly.

---

## Why makemore Is the Spine

The researcher made a strong case for choosing one canonical codebase and sticking with it. `makemore` wins on every criterion that matters for this series:

| Criterion | makemore | nanoGPT | nanochat |
|-----------|----------|---------|----------|
| CPU-friendly | Yes — minimal requirements | Assumes GPU for meaningful speed | Single-GPU minimum |
| Hackable | Explicitly designed as "one hackable file" | "Teeth over education" | Production-oriented |
| Educational | Built for teaching | Educational-adjacent | Training economics focus |
| Covers the ladder | Bigrams → MLP → Transformer | Transformer only | Full ChatGPT pipeline |
| Status (2026) | Active, educational resource | "Old and deprecated" per README | Active, MIT-licensed |
| Dependency | PyTorch only | PyTorch + more | Full stack |

**Key decision:** makemore is the "spine" codebase for Parts 3–7. nanoGPT is acknowledged as historically influential but deprecated. nanochat is mentioned as the modern full-stack reference for readers who want to go further, but it's not our base.

**How we use makemore:** Parts 4–7 are implemented as **diffs against makemore's transformer**. We show minimal patches (like `git diff` excerpts) rather than reprinting entire files. This keeps the "extend the codebase" goal clean while respecting Karpathy's work.

---

## The Toy Benchmark Pack

The researcher recommended a curated set of small, CPU-friendly datasets designed to reveal specific phenomena. We commit to building and sharing this pack:

### 1. Domain Mixture Dataset (Part 4: MoE)
- **Purpose**: Test whether routing correlates with domain
- **Design**: Mix 2–3 mini-corpora into one training stream:
  - Human names (from makemore's `names.txt`)
  - Simple arithmetic strings (e.g., "23+45=68")
  - Tiny code snippets (e.g., Python one-liners)
- **Held-out validation**: Separate val set per domain
- **Analysis**: Confusion-matrix-style routing analysis — does gating correlate with domain?

### 2. Algorithmic Suite (Part 5: Adaptive Computation)
- **Purpose**: Test whether the model allocates more compute to harder inputs
- **Tasks**: Drawn from ACT's original evaluations:
  - Parity (count 1-bits, mod 2)
  - Character-level addition with carry
  - Parenthesis matching / bracket depth
  - Sequence sorting (compare adjacent elements)
- **Difficulty control**: Variable-length inputs create natural difficulty gradients
- **Analysis**: Accuracy vs. measured compute (number of recurrent passes or halting steps)

### 3. Tool Suite (Part 6: Tool Use)
- **Purpose**: Test when tool use adds value vs. when internal compute suffices
- **Design**:
  - Deterministic calculator tool (for arithmetic queries)
  - Tiny lookup table (for factual retrieval over a small local corpus)
- **Mixture**: Some queries trivially memorizable, others require exact computation/lookup
- **Analysis**: Tool call rate, accuracy gain from tools, cost comparison

### 4. Program Synthesis Suite (Part 7: Neuro-Symbolic)
- **Purpose**: Test whether a DreamCoder-style system can discover reusable abstractions
- **Tasks**: Simple list processing problems (map, filter, fold patterns)
- **Analysis**: Library growth, compression of solutions over wake-sleep cycles

---

## Revised Series Structure

| Part | Title | Routing Decision | Key Mechanism |
|------|-------|-----------------|---------------|
| **1** | Minds, Brains and Computers | — | Personal memoir (done) |
| **2** | Neural Nets Are Simpler Than You Think | — | From-scratch implementation (done) |
| **3** | A Tour of Karpathy's Tutorials | How computation flows through a network | Bigrams → MLP → Attention/Transformer |
| **4** | Building a Mixture-of-Experts Model | Route to internal sub-networks | Sparse gating, expert dispatch, load balance |
| **5** | Adaptive Computation: Learning When to Think Harder | Route through more computation | ACT / recurrent depth / early exit |
| **6** | The Economics of Tool Use | Route to external systems | Tool tokens, cost-aware calling, the dream state |
| **7** | Programs That Write Programs: Neuro-Symbolic Computing | Route between learned and symbolic computation | DreamCoder, wake-sleep, library learning |

### The Arc

Parts 1–2: **Why I care and how it works** (memoir + from-scratch code)
Part 3: **What others have built** (the Karpathy tour — minimum viable fluency)
Parts 4–7: **What I want to try** (original experiments as "conceptual laboratories")

The progression from Part 4 → 7 follows a natural escalation of what "routing" means:
- 4: Route between internal experts (same computation type, different parameters)
- 5: Route through variable depth (same parameters, more computation)
- 6: Route to external tools (different computation type entirely)
- 7: Route between neural and symbolic computation (different paradigm)

---

## Part 3: A Tour of Karpathy's Tutorials (Revised)

### Revised Framing

Instead of "cover everything Karpathy built," Part 3 is structured as **three conceptual deltas** — the minimum viable fluency needed to start doing controlled experiments in Parts 4–7.

The promise: Part 3 is not "Karpathy walkthrough." It's "the minimum viable fluency to start doing controlled experiments."

### Structure: Three Deltas

#### Delta 1: Counting → Learned Model
*Bigram table vs. learned weights*

- How character frequencies become a baseline
- How log-likelihood becomes a training objective
- Why sampling works — generating from a probability distribution
- **Sanity experiment**: Compare bigram table generation vs. learned-weight generation on names
- **Annotated code**: Key passages from makemore Part 1, with our observations
- **Connection to Part 2**: "Remember our addition network? This is the same learning loop, but the target is 'predict the next character'"

#### Delta 2: MLP Language Model → Stable Deep Training
*Why activation/gradient stats matter*

- Embeddings: how characters become vectors (the leap from one-hot to learned representations)
- Why deeper networks get fragile: vanishing/exploding gradients
- What BatchNorm is doing: stabilizing the internal distributions
- What to inspect when training becomes fragile (the diagnostic mindset)
- **Sanity experiment**: Show activation distributions before/after BatchNorm — the "dead neuron" problem and its fix
- **Annotated code**: Key passages from makemore Parts 2–4
- **Connection to Parts 4–5**: "This diagnostic mindset — inspecting what's happening inside the network — is exactly what we'll need when we start routing tokens to different experts"

#### Delta 3: Local Computation → Attention (Transformer)
*What attention changes about where computation happens*

- In an MLP, computation is local: each token is processed independently
- Attention lets every position "look at" every other position — computation becomes contextual
- Why this matters for our series: attention is a modular insertion point for routing and tool tokens
- Positional encoding: how the model knows order
- **Sanity experiment**: Train makemore's transformer on the names dataset, compare generation quality to the MLP
- **Annotated code**: Key attention mechanism passages from makemore Part 5 / "Let's build GPT"
- **Connection to Part 4**: "The feed-forward network inside each transformer block is where MoE makes its modification — we'll replace it with multiple expert FFNs and a router"

### What We Reference but Don't Reproduce

- **nanoGPT**: Acknowledge its historical significance and that it's now deprecated. Mention nanochat as the modern successor for readers who want the full stack.
- **"Let's reproduce GPT-2" video**: Reference as "where this all leads" but clearly out of scope for CPU-first experiments.
- **makemore Parts 3–4 (BatchNorm, manual backprop)**: Reference as "the diagnostic toolkit" — readers who want the full deep-dive should watch the videos, but we extract the key insights.

### Tone

"Following Karpathy's tutorials felt like the seminar all over again — that same feeling of 'oh, THAT's how it works.'" The post is a guided reading, not a reproduction. Dense in insight, light in compute.

---

## Part 4: Building a Mixture-of-Experts Model (Revised)

### Revised Framing

"MoE as conditional computation primitives." We show the mechanics, visualize routing, and demonstrate failure modes — not chase emergent specialization that requires massive scale.

### The Key Insight from Feedback

Training on a single homogeneous corpus (e.g., only Shakespeare) likely won't produce meaningful expert specialization. The routing signal can collapse to arbitrary partitioning unless we **manufacture domains** while staying tiny.

### Structure

#### 4.1 — The Idea: Conditional Computation
- In a standard network, every input activates every parameter
- MoE: a gating network selects which expert(s) process each token
- Historical grounding: Jacobs et al. (1991) — original MoE as "divide input space among specialized experts"
- Real-world parallel: Switch Transformer simplified routing to top-1; DeepSeek-MoE pushed fine-grained segmentation
- **What we can show on CPU**: The mechanics of conditional computation and how routing patterns form
- **What we're honest about**: Large-scale MoE benefits (distributed parallelism, massive parameter counts) are out of scope

#### 4.2 — Implementation: MoE-FFN with Top-k Routing
- Starting from makemore's transformer (the Part 3 foundation)
- Replace the MLP/FFN block with an MoE-FFN: K small expert FFNs + a router
- Top-1 (or top-2) routing — matching the canonical architecture
- Add a load-balancing auxiliary loss (explicitly needed to prevent expert collapse)
- Show the code as a **diff against the makemore baseline** — minimal, focused changes
- **Reference**: makeMoE (AviSoori1x) as an existing implementation of this exact pattern

#### 4.3 — The Domain Mixture Experiment
- **Dataset**: Mix names + arithmetic strings + tiny code snippets into one training stream
- **Held-out validation**: Separate val set per domain
- **The question**: Does gating correlate with domain?
- **Analysis**: Confusion-matrix-style visualization — for each expert, what fraction of its tokens come from each domain?
- This is much more determinative than "it feels like experts specialize"

#### 4.4 — Failure Modes and Stabilizers
- **Expert collapse**: Show what happens without load balancing — one expert gets everything
- **Imbalanced routing**: Show the utilization distribution before and after the auxiliary loss
- **Routing instability**: How training can oscillate between routing configurations
- These failure modes are the real educational content — understanding them is understanding MoE

#### 4.5 — What MoE Means for Conditional Computation
- Even without spectacular specialization, we've demonstrated: sparse dispatch, gating logits, expert capacity, and stability
- **Promise kept**: Conditional computation mechanics + routing visualization
- **Honest gap**: Production MoE involves distributed parallelism and parameter counts orders of magnitude larger
- **Forward connection**: "The router decides *which* computation. In Part 5, we ask: *how much* computation?"

### Key Metrics
- Train/val loss: MoE model vs. dense baseline (same total parameters vs. same active parameters)
- Expert utilization heatmap per domain
- Load balance ratio over training
- Routing entropy (higher = more distributed routing)

---

## Part 5: Adaptive Computation — Learning When to Think Harder (Revised)

### Revised Framing

The researcher's strongest critique was here: "thinking" is anthropomorphic and risks disappointing readers when a small CPU model doesn't exhibit chain-of-thought reasoning (which is documented as an emergent property at very large scale). 

The better framing: **"the model learns when to spend more computation."** This has deep precedent in Adaptive Computation Time (ACT), early-exit transformers, and dynamic halting — and it's philosophically consistent with the series spine (conditional computation under a budget).

### Revised Title

**"Adaptive Computation: Learning When to Think Harder"** (or possibly "Deliberation Under a Budget")

This replaces the more anthropomorphic "Adding 'Thinking' — Chain-of-Thought from Architecture."

### Structure

#### 5.1 — The Problem: Fixed Compute per Token
- In a standard transformer, every token gets the same computation (same number of layers, same operations)
- But some tokens are easy ("the" after "in") and some are hard (predicting the next digit in a carry-heavy addition)
- Human analogy: "2+2" is instant, "347×29" requires intermediate steps
- **The question**: Can we give the model a way to spend more computation only when it helps?

#### 5.2 — Adaptive Computation Time (ACT)
- Graves (2016): A network that learns how many internal steps to take
- Key mechanism: a halting probability at each step — the model decides when it's "done"
- A cost term discourages infinite pondering (budget constraint!)
- **Original evaluations include**: parity, logic, addition, sorting, character-level LM — exactly the kind of tasks we can run on CPU
- **Connection to Part 4**: ACT's cost term is philosophically the same as MoE's load-balancing loss — both are budget constraints on computation

#### 5.3 — Implementation: Recurrent Depth with a Halting Signal
- Start from the makemore transformer (with or without Part 4's MoE modification)
- Add recurrence: run the same transformer block multiple times per token
- Add a halting unit: at each recurrent step, predict "should I stop?"
- Add a ponder cost: penalize extra computation to prevent infinite loops
- Show as a diff against the baseline

#### 5.4 — The Algorithmic Task Suite
- **Parity**: Count 1-bits mod 2 (variable-length input → variable difficulty)
- **Addition with carry**: Character-level "23+45=68" (carry propagation requires multi-step reasoning)
- **Parenthesis matching**: "((()))" is valid, "(()" is not (depth tracking)
- **Sorting indicators**: "is this sequence sorted?" (comparison chains)
- **The key plot**: Accuracy vs. measured compute (number of recurrent passes) — "more compute helps more on harder inputs"
- ACT explicitly reports this as an interpretable signal: more computation is allocated to harder-to-predict transitions

#### 5.5 — How MoE Interacts with Adaptive Depth
- The hypothesis from Part 4 becomes testable: does the model route "hard" problems through more computation?
- **Concrete test**: Route hard inputs to a "deep expert" (more recurrent passes) vs. easy inputs to a "shallow expert"
- Or: observe whether the router changes its expert selection as recurrent depth increases
- This turns Part 5 into a controlled conditional-computation experiment rather than a vague intelligence claim

#### 5.6 — Honest Assessment
- **What we showed**: The mechanics of adaptive computation and evidence that variable depth helps on variable-difficulty tasks
- **The gap**: Chain-of-thought reasoning as documented in large models (Wei et al.) is an emergent property at scale under prompting. Our experiments demonstrate *mechanisms and tradeoffs*, not a miniature reproduction of frontier reasoning.
- **Forward connection**: "The model learns to spend more *internal* computation on hard problems. In Part 6, we ask: what if the hard problem requires *external* computation?"

### Key Metrics
- Accuracy vs. number of recurrent passes (the key plot)
- Average halting step by task difficulty
- Ponder cost vs. accuracy tradeoff curve
- Per-example compute budget visualization

---

## Part 6: The Economics of Tool Use (Revised)

### Revised Framing

The researcher identified an important premise update: tool use is **not** a niche idea. Toolformer, RAG, ReAct, Self-RAG, and production tool-calling APIs are well-established. The better question is not "why isn't this dominant?" but **"what prevents tool use from being the default for every token?"**

The answer the literature suggests: retrieval/tool calls can introduce irrelevant context, latency, and failure modes; indiscriminate retrieval can degrade generation. The interesting question is about **adaptive, cost-aware tool use** — which connects perfectly to our conditional computation spine.

### The Bitter Lesson, Carefully

The researcher noted that Sutton's Bitter Lesson can cut both ways for tool use:
- Sutton argues general methods that scale with compute win
- Tool use can be framed as scaling a *different resource* (external compute + external memory) — not opposed to scaling, but complementary
- RAG's motivation is precisely that parametric memory alone has limitations

**Strong essay move**: "Tool use is not anti-scaling; it's scaling a different resource and forcing an economic decision about when to pay that cost."

### Structure

#### 6.1 — The Landscape: Tool Use Is Not a Niche Idea
- Toolformer: self-supervised tool learning (calculator, search, Q&A, translation, calendar)
- RAG: non-parametric retrieval to augment parametric generation
- ReAct: interleaving reasoning traces with actions
- Self-RAG: retrieve *on demand*, with reflection tokens controlling retrieval
- Production tool calling: OpenAI's documented flow (request → tool call → execute → respond)
- **The real question**: Not "why isn't tool use dominant?" but "what prevents tool use from being the default?"

#### 6.2 — The Economics: When to Compute vs. When to Call
- Tool calls have costs: latency, failure modes, irrelevant context
- Internal computation has costs: fixed per token, but limited by what's in the weights
- The optimal strategy: use tools only when they add enough value to justify the cost
- **Connection to ACT (Part 5)**: Both are about spending compute only where it buys accuracy
- **Connection to MoE (Part 4)**: Tool use is routing to an external expert — same gating decision, different destination

#### 6.3 — The Toy Tool Experiment
- **The tool**: A deterministic calculator (or tiny lookup table)
- **The dataset**: Mixture of queries — some trivially memorizable, others requiring exact arithmetic/lookup
- **The mechanism**: Train a `<CALL_TOOL>` vs `<NO_TOOL>` policy token with an explicit cost term for calling the tool (mirroring ACT's ponder cost)
- This is dramatically simpler than full Toolformer but illustrates the economic principle

#### 6.4 — The "Dream State" Idea (Simplified for CPU)
- Our adversarial divergence test — simplified to CPU scale:
  - For each example, compare model's no-tool answer vs. tool output
  - If they agree → discourage tool use (the model already knows)
  - If they diverge → encourage tool use (the tool adds value)
- **Closely related to**: Self-RAG's "retrieve on demand" direction and AdaTIR's difficulty-aware efficiency rewards
- The "adversary" is as simple as: search for prompts where the no-tool answer diverges from tool output, and upweight those in training

#### 6.5 — Routing Unification
- The conceptual payoff of the whole series:
  - Part 4: Route to internal experts (sparse gating)
  - Part 5: Route through variable depth (adaptive computation)
  - Part 6: Route to external tools (tool tokens)
  - All are the same fundamental problem: **how should a model allocate its computational budget?**
- Both MoE and tool use are routing decisions — one to internal subnetworks, one to external systems
- Modern cost-aware routing research (xRouter, RouteLLM) explicitly connects these

### Key Metrics
- Tool call rate by query type (memorizable vs. requires-tool)
- Accuracy: tool-augmented vs. internal-only
- Cost per correct answer (with tool cost penalty)
- Routing decision visualization: which queries get tools?

---

## Part 7: Programs That Write Programs — Neuro-Symbolic Computing (NEW)

### Why This Post

The series so far explores how neural networks can route computation more intelligently: to different experts (MoE), through variable depth (adaptive compute), and to external tools. But there's a fundamental question these approaches don't address: **can a neural system discover reusable abstractions?**

A neural network trained on arithmetic learns to approximate addition. But it doesn't discover the concept of "carrying" as a reusable subroutine. It doesn't build a library of operations it can compose. It doesn't get *more efficient* at solving new problems by leveraging solutions to old ones.

This is the gap that neuro-symbolic computing addresses — and DreamCoder is the most elegant demonstration of the idea.

### DreamCoder: The Core Idea

DreamCoder (Ellis et al., 2021) combines neural networks with program synthesis in a wake-sleep cycle:

1. **Wake phase (Dream)**: A neural network proposes candidate programs to solve tasks. It learns to "dream" about which program structures are likely to work.

2. **Sleep phase (Abstraction)**: The system analyzes successful programs and extracts reusable components — common sub-programs get compressed into named library functions.

3. **Iteration**: The library grows over cycles. New tasks become easier because the system can compose existing library functions rather than inventing everything from scratch.

The result: the system doesn't just solve problems — it builds a growing vocabulary of reusable concepts. It discovers abstractions like "map," "fold," and "filter" without being told they exist.

### Why This Fits the Series

DreamCoder represents a different kind of routing decision — one that this series is uniquely positioned to explain:

- **Part 4** routes between neural experts (same paradigm, different parameters)
- **Part 5** routes through variable compute depth (same paradigm, more iterations)
- **Part 6** routes to external tools (different system, fixed interface)
- **Part 7** routes between **learned neural computation and discrete symbolic programs**

This is the most fundamental routing question of all: when should you use a neural network's approximate, learned patterns, and when should you use an exact, composable, symbolic program?

### Connection to the Bitter Lesson (Revisited)

Part 6 reframes the Bitter Lesson: tool use is scaling a different resource (external compute). Part 7 pushes further: **program synthesis is scaling the hypothesis space itself**. Instead of learning one monolithic function, the system learns a *language* for expressing functions — and that language grows.

This is arguably the strongest counter-argument to pure neural scaling: if you can discover reusable symbolic programs, you get compositional generalization that pure neural approaches struggle with. But the Bitter Lesson still applies — DreamCoder's neural guide is what makes program search tractable.

### Structure

#### 7.1 — The Abstraction Gap
- Neural networks are powerful function approximators, but they don't naturally discover reusable abstractions
- Example: A network trained on "2+3=5" and "7+1=8" doesn't discover "addition" as a composable operation
- Symbolic AI had abstractions (Lisp, Prolog, expert systems) but couldn't learn from data
- **The question**: Can we combine neural learning with symbolic abstraction?

#### 7.2 — DreamCoder: Wake, Sleep, Abstract
- The wake-sleep cycle: neural proposal → program execution → abstraction extraction → library growth
- **Wake phase**: A neural recognition model maps tasks to likely program sketches (using the current library)
- **Sleep phase**: Successful programs are analyzed for common sub-expressions; these become new library primitives
- **The library**: Starts with basic primitives (like numbers, basic operations); grows to include discovered concepts (like "map," "fold," "increment")
- Key insight: The library is a **compression scheme** — shorter programs using library functions = better abstractions

#### 7.3 — A Toy Implementation
- **Domain**: Simple list processing tasks (transform [1,2,3] to [2,4,6], filter evens from a list, etc.)
- **Primitive library**: Basic list operations (cons, car, cdr, +, *, lambda)
- **Neural guide**: A small network that, given a task (input/output examples), predicts which library functions are likely relevant
- **Wake-sleep loop**: Solve tasks → find common sub-programs → add to library → solve harder tasks
- **CPU-friendly**: Program synthesis search is inherently enumeration-based; the neural guide just prunes the search space

#### 7.4 — Watching Abstractions Emerge
- **The key visualization**: Library growth over wake-sleep cycles
- Track which primitives are discovered and when
- Show how solution length (in library-relative terms) decreases as the library grows
- **Compare**: Solutions before and after library learning — same task, shorter program
- Can we see the system discover "map" or "fold" on its own?

#### 7.5 — Neural vs. Symbolic vs. Neuro-Symbolic
- Pure neural: Learns from data, but solutions are opaque and non-compositional
- Pure symbolic: Solutions are interpretable and composable, but requires hand-crafted primitives and search is intractable
- Neuro-symbolic (DreamCoder): Neural learning guides symbolic search; discovered programs are interpretable and reusable
- **The tradeoff**: Neural systems are good at pattern recognition; symbolic systems are good at exact computation and composability. The optimal system uses both.

#### 7.6 — The Series Payoff: All Routing Is Resource Allocation
- Part 4: When to use expert A vs. expert B (internal routing)
- Part 5: When to compute more (depth routing)
- Part 6: When to call a tool (external routing)
- Part 7: When to use a learned pattern vs. a symbolic program (paradigm routing)
- **The unifying insight**: Intelligence isn't just about having more parameters or more data. It's about learning to allocate the right kind of computation to the right problem.

### Key Metrics
- Number of library primitives discovered per wake-sleep cycle
- Solution compression: average program length (in library tokens) over cycles
- Task success rate over cycles (should increase as library grows)
- Which abstractions are discovered? (qualitative analysis — do we see map/filter/fold?)

### CPU Feasibility
- DreamCoder's program synthesis is search-based, not gradient-based — inherently CPU-friendly
- The neural recognition model is small (maps task embeddings to library function probabilities)
- The search space is constrained by the library (this is the whole point — library growth makes search tractable)
- We can use a simple DSL (domain-specific language) for list processing, keeping the primitive set small

### References
- Ellis et al. (2021) — "DreamCoder: Bootstrapping Inductive Program Synthesis with Wake-Sleep Library Learning" (PLDI)
- The original wake-sleep algorithm (Hinton et al., 1995) — connection back to the series' historical thread
- Lake et al. (2017) — "Building machines that learn and think like people" (the broader neuro-symbolic argument)
- Nye et al. (2020) — "Learning Compositional Rules via Neural Program Synthesis"

---

## Revised Series Overview Table

| Part | Title | Status | Key Routing Decision |
|------|-------|--------|---------------------|
| **1** | Minds, Brains and Computers | Draft complete | — (memoir) |
| **2** | Neural Nets Are Simpler Than You Think | Draft complete | — (from-scratch fundamentals) |
| **3** | A Tour of Karpathy's Tutorials | Research complete | Computation flow through a network |
| **4** | Building a Mixture-of-Experts Model | Research complete | Route to internal sub-networks |
| **5** | Adaptive Computation: Learning When to Think Harder | Research complete | Route through more computation |
| **6** | The Economics of Tool Use | Research complete | Route to external systems |
| **7** | Programs That Write Programs: Neuro-Symbolic Computing | **NEW** — needs research | Route between neural and symbolic |

### Updated Series Listing (for Part 1's "What's Coming" section)

1. **Minds, Brains and Computers** — You are here
2. **Neural Nets Are Simpler Than You Think** — Building a neural net from scratch and teaching it arithmetic
3. **A Tour of Karpathy's Tutorials** — Walking through the best resource for building LLMs from zero
4. **Building a Mixture-of-Experts Model** — Can a small model learn to specialize?
5. **Adaptive Computation: Learning When to Think Harder** — When should a model spend more compute?
6. **The Economics of Tool Use** — When should a model compute internally vs. call for help?
7. **Programs That Write Programs** — Can a system discover reusable abstractions?

---

## Series-Wide Editorial Principles (Updated)

### From the Researcher's Feedback

1. **Make "what codebase do we extend?" explicit.** makemore is the spine. nanoGPT is historical. nanochat is the modern successor. State this once in Part 3 and keep it consistent.

2. **Use "diffs" rather than "reimplementation."** Parts 4–7 are readable as patches against the baseline. Show `git diff` excerpts, link to upstream code, and clearly label what changed.

3. **Commit to quantitative metrics.** At least one measurable, plotable metric per post. Loss curves and sampling prompts are the minimum; routing heatmaps, compute-vs-accuracy plots, and library growth curves are the post-specific additions.

4. **Be careful with anthropomorphic framing.** Use "adaptive computation" and "conditional compute under budget" rather than "thinking" or "reasoning." The chain-of-thought literature shows emergence at large scale — our experiments demonstrate *mechanisms and tradeoffs*, not miniature frontier reasoning.

5. **Frame Parts 4–7 as "conceptual laboratories."** These are controlled experiments exploring mechanisms, not benchmark chases. If something doesn't work at toy scale, we say so and explain what would need to change at scale.

### Existing Principles (Retained)

6. **Personal thread throughout.** Every post connects to the origin story.
7. **Honest about failure.** If an experiment doesn't work, we report what actually happened.
8. **Progressive complexity.** Each post assumes the reader has read the previous ones.
9. **Interactive where it helps.** Don't force interactivity; use it when it genuinely aids understanding.
10. **The gap is explicit.** We never pretend our small models are comparable to production LLMs.

---

## Open Questions

1. **Part 7 scope**: Is DreamCoder alone enough material for a full post, or should we broaden to "neuro-symbolic computing" and include other approaches (Neural Theorem Proving, AlphaCode-style program generation)?

2. **Part 5 title**: "Adaptive Computation: Learning When to Think Harder" keeps a hint of anthropomorphism in "Think Harder." Alternatives: "Adaptive Computation: Variable Depth Under a Budget," "Deliberation Under a Budget: Adaptive Computation."

3. **Interactive components for Parts 4–7**: The researcher didn't comment on these, but the routing heatmap (Part 4), compute-vs-accuracy plot (Part 5), tool-decision visualizer (Part 6), and library growth animation (Part 7) could all be powerful interactive components. Prioritize based on implementation cost.

4. **Series naming**: Should Part 7's addition change the series subtitle? The current "Neural Nets from Scratch" still works if we frame DreamCoder as "neural networks + program synthesis = neuro-symbolic."

5. **Ordering flexibility**: Parts 6 and 7 could potentially be swapped — tool use (external compute) before neuro-symbolic (paradigm routing) feels like a natural progression, but DreamCoder's wake-sleep cycle could also be introduced earlier as "a different way to learn."

---

## Implementation Order

1. **Draft Part 3** — This is the foundation. Use the "three deltas" structure. Get makemore running, reproduce key results on CPU, annotate with observations.

2. **Build the toy benchmark pack** — Create the domain mixture dataset, algorithmic suite, and tool suite before starting Parts 4–6. Having the data ready makes experimentation faster.

3. **Draft Part 4** — MoE as diffs against makemore. The domain mixture experiment is the centerpiece.

4. **Draft Part 5** — Adaptive computation. The algorithmic task suite is the centerpiece. Test the MoE+depth interaction.

5. **Draft Part 6** — Tool use economics. The toy calculator experiment is the centerpiece. The dream state simplification is the original contribution.

6. **Research Part 7** — Deep-dive on DreamCoder. Build or adapt a toy implementation. This needs a separate research phase.

7. **Draft Part 7** — Neuro-symbolic computing. Library growth visualization is the centerpiece.
