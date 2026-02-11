# Neural Nets from Scratch — Narrative Plan

## Series Overview

A six-part series that moves from personal memoir through hands-on implementation to original experiments with small language models. The arc: **why I care → how it works → what others have built → what I want to try**.

### Series Structure

| Part | Title | Focus |
|------|-------|-------|
| **1** | Minds, Brains and Computers | Personal memoir: the seminar, the BASIC neural net, the AI winters |
| **2** | Neural Nets Are Simpler Than You Think | Build from scratch: single neuron, XOR, addition. Interactive playground. |
| **3** | A Tour of Karpathy's Tutorials | Character-level language models. Reproduce makemore/nanoGPT results. |
| **4** | Building a Mixture-of-Experts Model | Add routing to the LM. Does specialization emerge? |
| **5** | Adding "Thinking" — Chain-of-Thought from Architecture | Internal scratchpad/recurrence. Can a small model learn to think? |
| **6+** | Toolformer and the Economics of Tool Use | Tool-calling tokens, cost-aware routing, the "dream state" idea |

Part 1 establishes *why* this matters personally. Part 2 demystifies the mechanism with working code. Part 3 bridges from toy networks to real language models via Karpathy's accessible tutorials. Parts 4-6 are original experiments — the series pivots from "following others' work" to "trying something new."

### What Makes This Series Different

1. **Personal throughout**: Every post connects back to the origin story — this isn't a textbook, it's a decades-long fascination being explored live
2. **Interactive components**: The reusable `nn-engine` and `nn-viz` modules let readers play with real networks in the browser
3. **Honest about scale**: We don't pretend a 545-parameter network is comparable to GPT-4. We explicitly discuss what's the same (the mechanism) and what's different (scale, architecture, data)
4. **Original experiments**: Parts 4-6 aren't reproductions — they're genuine explorations that might fail, and we report what actually happens

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

### Narrative Arc

This is the bridge post — it takes the reader from "I built a toy network" to "I understand how language models work." The vehicle is Andrej Karpathy's excellent tutorial series, which builds language models from scratch in a way that's remarkably accessible.

#### 3.1 — Why Karpathy
- Karpathy's tutorials are the best bridge between "understand neural nets" and "understand LLMs"
- His `makemore` series builds a character-level language model from nothing
- Personal angle: following these tutorials felt like the seminar all over again — that same feeling of "oh, THAT's how it works"

#### 3.2 — From Characters to Language (makemore)
- The core idea: predict the next character given the previous characters
- Start with a bigram model (just count frequencies) — no neural net needed
- Add a neural net: one-hot encoding, embeddings, hidden layers
- The model generates names: "some that sound real, some that sound alien"
- Reproduce key results with our own code, annotated with observations

#### 3.3 — The Transformer Architecture
- Attention: every token can "look at" every other token
- Positional encoding: how the model knows word order
- nanoGPT: Karpathy's minimal transformer implementation
- Train on Shakespeare or similar — watch it generate text

#### 3.4 — What This Means for Our Series
- We now have a working language model as a foundation
- Parts 4-6 will modify this architecture: adding routing (MoE), thinking (chain-of-thought), tools (Toolformer)
- The reader should feel confident they understand what's happening inside the model

### Interactive Components (Potential)
- Character-level text generation demo: type a prompt, watch the model generate character by character
- Attention visualization: show which tokens are attending to which
- (These are aspirational — Part 3 may not need interactivity if the code examples are strong enough)

### Key Dependencies
- Requires working through Karpathy's `makemore` (5 videos) and `nanoGPT`
- Needs reproducible results — specific model configurations, training runs, sample outputs
- Consider whether to use our own Python code or reference Karpathy's directly

### Assumptions About the Reader
- Has read Parts 1-2
- Understands forward pass, backpropagation, hidden layers, stochastic gradient descent
- Ready for: embeddings, attention, tokenization

---

## Part 4: "Building a Mixture-of-Experts Model"

**Status**: Research complete. Requires GPU infrastructure.

### Narrative Arc

This is where the series becomes original. Starting from the character-level LM built in Part 3, we add a routing mechanism: instead of one big network, we have several "expert" sub-networks, and a gating function decides which expert handles each input.

#### 4.1 — The Idea
- In a standard neural net, every input goes through every neuron
- What if different inputs went to different specialized sub-networks?
- Real-world analogy: a hospital has specialists, not one doctor who does everything
- This is Mixture-of-Experts (MoE) — and it's how the largest models (GPT-4, Gemini, DeepSeek) actually work

#### 4.2 — Adding a Router
- Starting from Part 3's language model
- Add a gating network that takes the input and outputs a probability distribution over K experts
- Each expert is a small copy of the original model
- The output is a weighted combination (or sparse selection) of expert outputs
- Implementation from scratch — show the routing code

#### 4.3 — Does Specialization Emerge?
- Train the MoE model on the same data
- **The key question**: do different experts learn different things?
- Analyze: which expert gets activated for which inputs?
- Visualize: clustering of inputs by expert assignment
- Report honestly: maybe specialization is clear, maybe it's messy, maybe it doesn't emerge at small scale

#### 4.4 — Load Balancing
- Problem: the router might send everything to one expert (the "winner takes all" problem)
- Solutions: auxiliary loss for balance, expert choice routing
- Show the effect: before and after balance enforcement

#### 4.5 — Reflections
- What did we learn? Did MoE improve the model?
- Connect to the real world: DeepSeek-V3 uses MoE with 256 experts. We used 4-8. Same idea, different scale.
- Set up Part 5: "Now that we have experts, can we give the model a way to *think* before routing?"

### Key Experiments
- Base model (from Part 3) vs. MoE model: compare loss, generation quality
- Expert utilization heatmaps: which expert fires for which tokens/contexts
- Try different numbers of experts (2, 4, 8)
- Try different routing strategies (top-1, top-2, expert choice)

### Infrastructure Needs
- GPU for training (even small models benefit from GPU for iteration speed)
- Experiment tracking (loss curves, expert utilization over training)
- Reproducible configs (seeds, hyperparameters)

---

## Part 5: "Adding 'Thinking' — Chain-of-Thought from Architecture"

**Status**: Research complete. Requires GPU infrastructure. Builds on Part 4.

### Narrative Arc

Can a small model learn to "think before answering"? We explore architectural mechanisms that give the model intermediate computation steps — not prompting tricks, but structural changes.

#### 5.1 — The Problem with Instant Answers
- Our model (from Part 4) produces output in a single forward pass
- For simple patterns, that's fine. For harder ones, it might need more computation.
- Human analogy: you can answer "2+2" instantly, but "347×29" requires intermediate steps
- Can we give the model a scratchpad?

#### 5.2 — Approaches
- **Pause tokens**: add special tokens that produce no output but let the model compute internally (Goyal et al., 2024)
- **Recurrent passes**: run the transformer's middle layers multiple times before producing output
- **Internal scratchpad**: reserve part of the context for intermediate reasoning
- We'll try one or more of these approaches

#### 5.3 — Experiments
- Train the model on tasks with varying difficulty
- Compare: model with thinking mechanism vs. without
- Measure: does extra computation help on harder examples?
- Visualize: what happens in the extra computation steps?

#### 5.4 — The MoE Connection
- Does the routing from Part 4 interact with thinking?
- Hypothesis: the model might learn to route "hard" problems through more computation
- Test this hypothesis

#### 5.5 — Honest Assessment
- This is speculative. It might not work at small scale.
- Report what actually happens, not what we hoped would happen.

---

## Part 6+: "Toolformer and the Economics of Tool Use"

**Status**: Research complete. Requires GPU infrastructure. Builds on Parts 4-5.

### Narrative Arc

The most speculative part of the series. Models that learn to use external tools — calculators, search engines, databases — by emitting special tokens. When should a model compute internally vs. call a tool? Can it learn to make that decision economically?

#### 6.1 — Toolformer
- Schick et al. (2023): train a model to emit API calls by inserting them into training data
- The model learns *when* tools help by comparing predictions with and without tool outputs
- Implement a simple version: a calculator tool for arithmetic

#### 6.2 — The Economics Question
- Tool use has a cost (latency, API calls, compute)
- Internal computation also has a cost (but different — fixed per token)
- The optimal strategy: use tools when they add enough value to justify the cost
- Connect to MoE: tool use is another form of routing — sending a sub-problem to an external expert

#### 6.3 — The "Dream State" Idea (Original)
- An adversarial training process: generate scenarios where tool outputs differ from the model's internal predictions
- If the adversary *can't* find divergences, discourage tool use (the model already knows the answer)
- If it *can*, encourage tool use (the tool adds value)
- This naturally routes tool calls to cases where they matter

#### 6.4 — Implementation and Results
- Build a simple version of the dream state mechanism
- Test on mixed tasks: some where the tool helps, some where it doesn't
- Does the model learn to route efficiently?

### This Post May Split
- If there's enough material, this could be two posts: one on Toolformer implementation, one on the economics/dream-state idea

---

## Narrative Principles

1. **Personal thread throughout**: Every post ties back to the origin story. Part 2 recreates the XOR crisis from Part 1. Part 3 echoes "the most interesting thing I'd ever built." Parts 4-6 are "trying what I always wanted to try."

2. **Honest about failure**: Especially in Parts 4-6, if an experiment doesn't work, we say so. The series gains credibility from candor.

3. **Progressive complexity**: Each post assumes the reader has read the previous ones. Part 1: no code. Part 2: Python from scratch. Part 3: reproduce others' work. Parts 4+: original experiments.

4. **Interactive where it helps**: The `nn-playground` is the star interactive component. Future posts may add visualizations for expert routing (Part 4) or attention patterns (Part 3), but only if they genuinely aid understanding.

5. **The gap is explicit**: We never pretend our small models are comparable to production LLMs. We always acknowledge what scales and what doesn't.

---

## Tone and Style

- Personal, exploratory, like a lab notebook shared with a smart friend
- Code is illustrative — clean, commented, runnable, but not production
- Mathematical notation is used sparingly and always accompanied by plain-language explanation
- Use the `chalkboard` skin — handwritten headings, lecture-hall feel (pending comparison with `theorem`)
- Follow site conventions: no dates, no tags, `series` field in front matter, `weight` for ordering
- Each post ends with a forward reference to the next
