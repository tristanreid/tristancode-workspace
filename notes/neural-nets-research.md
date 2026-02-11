# Neural Nets from Scratch — Research Notes

Research for the planned blog series: **Neural Nets from Scratch** (see `DEVELOPMENT.md`).

---

## Overview

A multi-part series on neural networks, starting from personal history and building toward original experiments with small language models. The arc: origin story → demystification → reproducing known results → original experiments with MoE, chain-of-thought, and tool use.

The series should feel personal and exploratory — not a textbook, not a tutorial. The reader is along for the ride as we build understanding from first principles and then push into genuinely novel territory.

---

## Important Notes

The notes in this file are meant to assist in the writing of the blog series. They contain references to external codebases, papers, and repositories. Blog posts should link to these as sources but shouldn't assume the reader has access to them.

---

## Part 1: Origin Story — "Minds, Brains and Computers"

### Personal narrative

- Took the seminar "Minds, Brains and Computers" at Duke as an undergrad (likely a section of what is now "Computing and the Brain" — COMPSCI 103L / NEUROSCI 103L / PSY 113L)
- Wrote neural nets in BASIC — this was the formative experience that inspired switching major from Cognitive Psychology to Computer Science
- Set the stage: neural nets have been personally meaningful for decades, long before the current wave

### Historical context to weave in

The 1990s context matters for the narrative. Neural networks were in their second wave:

**First wave (1950s–1960s)**: Rosenblatt's Perceptron (1958), Widrow's Adaline/Madaline. Enthusiasm, then Minsky & Papert's 1969 critique ("Perceptrons") showing limitations of single-layer networks. Funding dried up — the first "AI winter."

**Second wave (1980s–1990s)**: Rumelhart, Hinton & Williams' 1986 backpropagation paper solved the XOR problem by enabling multi-layer networks with hidden units. Connectionism / Parallel Distributed Processing (PDP) became a major paradigm in cognitive science. Rumelhart & McClelland's two-volume PDP books (1986) formalized the approach. This is the era the seminar would have drawn from — neural nets as *models of cognition*, not just engineering tools.

**The gap (late 1990s–2000s)**: SVMs and other methods overtook neural nets in practical ML. The third wave (deep learning, 2012+) was still years away.

**Key point for the narrative**: Writing neural nets in BASIC in the 1990s was doing something that felt intellectually alive but was considered a backwater by mainstream CS. The vindication came decades later.

### Tone

This post should be memoir-like. The technical content is light — just enough to explain what a neural net *is* and why it was captivating. The hook: "I wrote neural nets before they were cool, and the experience changed the course of my life."

### Blog angle

- Open with the seminar experience — the moment of realization
- Brief, accessible explanation of what a neural net is (neurons, weights, learning)
- Why this was exciting in the context of cognitive science: these aren't just algorithms, they're *models of how minds might work*
- The switch from Cognitive Psychology to Computer Science
- Close with: "decades later, the world caught up" — tease the rest of the series

---

## Part 2: Neural Nets Are Simpler Than You Think

### Core thesis

Neural networks are not magic. The fundamental mechanism — forward pass, loss computation, backpropagation, weight update — can be implemented from scratch in remarkably few lines of code. The goal is to demystify.

### Karpathy's micrograd as inspiration (but build our own)

Karpathy's **micrograd** (github.com/karpathy/micrograd) is the gold standard for "neural net from scratch":
- ~100-150 lines of Python total
- A `Value` class that tracks scalar values and gradients
- Overloaded arithmetic operators build a computational graph (dynamic DAG)
- `backward()` performs topological sort + reverse-mode autodiff (chain rule)
- A small neural network library: `Neuron`, `Layer`, `MLP` with PyTorch-like API
- YouTube: "The spelled-out intro to neural networks and backpropagation: building micrograd" (2h25m, 3.1M+ views)

**For the blog**: We don't need to replicate micrograd — we can reference it. But we should build *something* from scratch that's even simpler, perhaps a single-file implementation that trains on arithmetic.

### Teaching arithmetic to neural nets

Recent research (2024) shows small transformers can learn arithmetic:

**"Teaching Arithmetic to Small Transformers"** (ICLR 2024):
- Small transformers trained from random initialization can learn addition, multiplication, square root
- Standard training data doesn't work well — but chain-of-thought style formatting (showing intermediate steps) dramatically improves accuracy and sample efficiency
- Sharp phase transitions in learning as training data scales up

**"Transformers Can Do Arithmetic with the Right Embeddings"** (NeurIPS 2024):
- Key insight: transformers struggle with arithmetic because they can't track exact digit positions in long sequences
- "Abacus Embeddings" — learned positional embeddings that encode position relative to the start of a number — fix this
- Training on 20-digit numbers → 99% accuracy on 100-digit addition (single GPU, one day)
- Code available: github.com/mcleish7/arithmetic

**Key point for readers**: When people say LLMs are "bad at math," it's not necessarily about the underlying architecture. Even small nets can learn arithmetic patterns with the right data formatting and embeddings. The issue is more about training data representation than fundamental capability.

### What to implement

Options for the hands-on portion:
1. **Bare-bones backprop**: A micrograd-style Value class, but stripped to the absolute minimum. Show the reader that backpropagation is just the chain rule applied recursively.
2. **Learn addition**: A tiny MLP that learns to add two numbers. Start with small numbers (0-9), show the training loss curve, then push to larger numbers and watch it struggle/succeed.
3. **Learn XOR**: The classic — show why a single-layer perceptron fails (Minsky & Papert's critique from Part 1!) and how adding a hidden layer solves it. This connects the origin story to the technical content.

### Demystifying the gap: neural net → LLM

The blog should address what *doesn't* change between a tiny neural net and an LLM:
- Forward pass: still matrix multiplies + nonlinearities
- Training: still backpropagation + gradient descent
- The loss function: still measuring how wrong the predictions are

What *does* change:
- Scale: billions of parameters instead of dozens
- Architecture: attention mechanisms, positional encoding, layer normalization
- Data: internet-scale text instead of arithmetic problems
- Tokenization: converting text to numbers and back
- Infrastructure: distributed training across many GPUs

The point: the conceptual core is the same. The rest is engineering.

### Interactive component ideas

- **Live training visualization**: Show a tiny net training in real time — loss curve, weight updates, decision boundary evolving
- **Arithmetic playground**: Let the reader type two numbers and watch the net's prediction improve over training steps

---

## Part 3: A Tour of Karpathy's Tutorials

### The curriculum

Andrej Karpathy's **"Neural Networks: Zero to Hero"** (karpathy.ai/zero-to-hero.html) is the best existing resource for building LLMs from scratch. The full lecture series:

1. **Building micrograd** (2h25m) — backpropagation from scratch, autograd engine
2. **Building makemore** (1h57m) — bigram character-level language model, PyTorch tensors
3. **Makemore Part 2: MLP** (1h15m) — multi-layer perceptron, embeddings, train/dev/test splits
4. **Makemore Part 3: Activations & Gradients, BatchNorm** (1h55m) — internals of the forward/backward pass, batch normalization
5. **Makemore Part 4: Becoming a Backprop Ninja** (1h55m) — manual backpropagation without autograd
6. **Makemore Part 5: Building a WaveNet** (56m) — tree-like CNN architecture (dilated causal convolutions)

And then the GPT-focused lectures:
- **"Let's build GPT: from scratch, in code, spelled out"** — builds a transformer following "Attention Is All You Need"
- **"Let's reproduce GPT-2 (124M)"** (4 hours) — full reproduction including optimization, distributed training, evaluation

### Key repositories

| Repo | Description | Stars |
|---|---|---|
| `karpathy/micrograd` | Tiny autograd engine + neural net library | 14.2k |
| `karpathy/nn-zero-to-hero` | Lecture notebooks (makemore series) | — |
| `karpathy/nanoGPT` | Training/finetuning medium GPTs (**deprecated**) | — |
| `karpathy/build-nanogpt` | Video + code lecture building nanoGPT from scratch | 4.7k |
| `karpathy/nanochat` | **New** (2025): full ChatGPT-style pipeline, single GPU node | 42k+ |

### nanochat: the state of the art (2025)

**nanochat** replaced nanoGPT and is remarkably complete:
- End-to-end pipeline: tokenization → pretraining → mid-training (chat/tool-use data) → SFT → optional RL → evaluation → chat UI
- Train a GPT-2-capability model (~1.6B params) in ~3-4 hours on 8×H100 for ~$72-100 (~$20 on spot instances)
- For context: GPT-2 cost ~$43,000 to train in 2019
- Single complexity dial: `--depth` (number of transformer layers) auto-calculates all hyperparameters
- Includes a "GPT-2 speedrun leaderboard" tracking fastest training times

### Blog angle

This post should be a guided tour, not a reproduction:
- Walk through the key "aha moments" from each lecture
- Reproduce select results with personal annotations
- Focus on what each step adds conceptually: "After micrograd, you understand backprop. After makemore, you understand language modeling. After nanoGPT, you understand transformers."
- End with nanochat as the current endpoint: "This is what the foundation looks like in 2025/2026"
- Tee up Parts 4-6: "Now that we have a working small LLM, what can we do with it?"

### What to reproduce

Priority experiments to actually run and show results for:
1. **micrograd**: Train a small MLP on a 2D classification task, show decision boundary
2. **makemore bigram**: Generate names from a character-level model, show the probability table
3. **nanoGPT on Shakespeare**: Train the smallest useful transformer, show generated text at different training checkpoints
4. **nanochat walkthrough**: Show the pipeline stages and training cost/time

---

## Part 4: Building a Mixture-of-Experts Model

### What is MoE?

A Mixture-of-Experts model replaces (some of) the standard feed-forward layers in a transformer with multiple "expert" sub-networks and a learned routing mechanism (the "gate") that decides which expert(s) process each input.

**Key insight**: MoE allows a model to have many more parameters than it uses for any single input. A 16B-parameter MoE model might only activate 4B parameters per token. This is "conditional computation" — the model learns to use different circuits for different inputs.

### Key papers (chronological)

| Year | Paper | Key Contribution |
|---|---|---|
| 1991 | Jacobs et al., "Adaptive Mixtures of Local Experts" | Original MoE concept: divide input space among specialized experts |
| 2017 | Shazeer et al., "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer" | Modern MoE: thousands of experts with top-k sparse gating for language modeling |
| 2020 | GShard (Lepikhin et al.) | MoE at scale: top-2 gating, scaled to 600B parameters |
| 2022 | Switch Transformers (Fedus et al.) | Simplified routing: top-1 gating. 7× speedup over T5. First trillion-parameter sparse models |
| 2022 | Expert Choice Routing (Zhou et al., NeurIPS) | Reversed selection: experts choose tokens (not tokens choose experts). Fixed bucket sizes, variable experts per token. 2× faster convergence vs Switch Transformer |
| 2024 | DeepSeekMoE (ACL 2024) | Fine-grained expert segmentation + shared expert isolation. 16B matches 7B dense with ~40% compute. Open-source (MIT license) |

### Expert specialization — does it actually emerge?

This is a central question for the blog post. Research findings:

**The optimistic view**: In unsupervised settings, experts learn meaningful sub-categorical structures that "transcend human-defined class boundaries" — they organize around underlying data patterns, not explicit labels. DeepSeekMoE specifically designs for "ultimate expert specialization" with fine-grained segmentation.

**The cautionary view**: Specialization is not guaranteed. Standard MoE training can fail to produce good task decomposition even on simple datasets (MNIST, FashionMNIST). Expert collapse — where some experts are never used — is a known problem. Researchers have developed attentive gating mechanisms and data-driven regularization to improve specialization.

**For our experiments**: Keep models small and interpretable. Can we see different experts learning different things? Ideas:
- Train on a mix of tasks (arithmetic + text generation) and see if experts specialize by task
- Visualize which expert handles which inputs
- Compare expert utilization distributions — do all experts get used, or do some dominate?

### Practical implementation resources

**makeMoE** (Hugging Face blog + GitHub: AviSoori1x/makeMoE):
- Direct descendant of Karpathy's makemore, with MoE replacing the feed-forward layers
- Includes top-k gating, noisy top-k gating, expert capacity
- Character-level language model on Shakespeare
- Multiple notebook versions: concise, detailed walkthrough, with expert capacity
- **This is the ideal starting point for Part 4's implementation**

**Sebastian Raschka's "LLMs from Scratch"**: Chapter on MoE with implementation examples

**TinyMoE.c**: From-scratch MoE in C (inspired by Karpathy's llm.c)

### Blog angle

- Start from the nanoGPT/makemore foundation established in Part 3
- Add a routing mechanism: explain the gate network, top-k selection, load balancing
- Train on mixed tasks and visualize which experts activate for which inputs
- Keep it small: 4-8 experts, character-level, small dataset
- The "magic" moment: show that different experts learn different things (or explore honestly if they don't)
- Connect forward: the routing mechanism is the foundation for Part 5 (thinking) and Part 6 (tool use)

### Recent advances to mention

**Chain-of-Experts (CoE)** (2025): Tokens processed iteratively through a chain of experts within each layer, with re-routing at each step. Improves math reasoning. Interesting because it adds a sequential/thinking dimension to MoE.

**SteerMoE** (2025): Specific experts become linked to specific behaviors — you can steer model output at inference time by activating/deactivating experts. Relevant to the "can we see what experts learn?" question.

**DeepSeekMoE**: Open-source, MIT license. Could use their architecture as a reference for our implementation, even at much smaller scale.

---

## Part 5: Adding "Thinking" — Chain-of-Thought from Architecture

### The question

Can a small model learn to "think before answering"? Not through prompting ("let's think step by step") but through *architectural mechanisms* that give the model internal computation space?

### Approaches to internal reasoning

#### 1. Pause Tokens ("Think before you speak")

**Paper**: Goyal et al., ICLR 2024 (Google Research)
**Idea**: Append learnable `<pause>` tokens after the input. The model processes these extra tokens (gaining additional computation per layer) but their outputs are ignored — only the final answer matters.

**Results on 1B parameter model**:
- +18% on SQuAD (question answering)
- +8% on CommonSenseQA
- +1% on GSM8k (math reasoning)
- Gains across 8 of 9 downstream tasks

**Critical finding**: Models must be *pre-trained* with pause tokens for this to work. Just fine-tuning with pauses doesn't help — the model needs to learn how to use the extra computation from the start.

**For our experiments**: This is the most directly implementable approach. Add `<pause>` tokens to our small model's training data and see if it helps on tasks that require multi-step reasoning.

#### 2. Thinking Tokens (unsupervised)

**Finding**: Thinking tokens (learned embeddings inserted before answers) consistently *underperform* explicit chain-of-thought. The problem: a single embedding for the thinking token creates inconsistent learning signals and noisy gradients.

**Implication for our experiments**: Don't expect a magical single "think" token. The model needs *multiple* intermediate steps, not just one pause.

#### 3. Looped / Recurrent Transformers

**Paper**: "Reasoning with Latent Thoughts: On the Power of Looped Transformers" (2025)
**Idea**: Feed the output of a transformer block back into itself multiple times (recurrence). This gives the model variable compute per input.

**Key finding**: Looped and non-looped models exhibit scaling behavior dependent on *effective depth* (number of passes × number of layers), similar to how CoT scaling works at inference time.

**For our experiments**: Could implement a simple recurrent pass — run the same transformer block N times, where N might be learned or fixed.

#### 4. Iteration Heads (mechanistic understanding)

**Paper**: "Iteration Heads: A Mechanistic Study of Chain-of-Thought" (NeurIPS 2024)
**Idea**: Simple two-block circuits that write latent states into token space, using CoT as an internal scratchpad.

**Key insight**: This shows that transformers *already* use intermediate tokens as recurrent state. CoT isn't a hack — it's exploiting a natural capability of the architecture.

### Theoretical foundation

**"The Expressive Power of Transformers with Chain of Thought"** (ICLR 2024):
- Intermediate generation fundamentally extends transformer computational power
- Linear decoding steps → can recognize regular languages
- Polynomial decoding steps → can solve polynomial-time problems
- First exact characterization of CoT's power in terms of standard complexity classes

**Translation for the blog**: Without thinking steps, a transformer is limited in what it can compute. With them, it becomes fundamentally more powerful — and we can quantify exactly how much more.

### MoE + Thinking interaction (connecting Parts 4 and 5)

This is the novel angle from the series outline: does the expert routing from Part 4 interact with thinking?

**Chain-of-Experts** (2025) suggests yes: sequential expert processing within a layer improves reasoning. This is essentially MoE + thinking combined.

**Hypothesis to test**: Does the model learn to route "hard" problems through more computation? Can we see this in the routing patterns?

**Experimental ideas**:
- Give the MoE model from Part 4 pause tokens and compare routing patterns on easy vs hard problems
- Does the gate learn to activate more experts for harder inputs?
- Does recurrence (multiple passes) change which experts are selected?

### Blog angle

- Build on the MoE model from Part 4
- Add pause tokens (simplest approach) and measure the effect on a reasoning task
- Visualize what happens during the "thinking" — which experts activate, how representations change across pause steps
- Try the recurrent approach: run the same block multiple times
- Honest reporting: does it work? How much does it help? When does it fail?
- Connect to the pause tokens paper: confirm or challenge the finding that pre-training with pauses is necessary

---

## Part 6+: Toolformer and the Economics of Tool Use

### Toolformer

**Paper**: Schick et al., NeurIPS 2023 (Oral)
**Core idea**: Train a language model to emit special tokens that invoke external tools (calculator, search engine, Q&A system, translator, calendar). The model learns *when* to call tools, *which* tool to use, *what arguments* to pass, and *how to incorporate* the result.

**Training approach**: Self-supervised — requires only a handful of demonstrations per API. The model generates potential API calls, executes them, and keeps the ones that improve its predictions (measured by perplexity reduction).

**Results**: Substantially improved zero-shot performance, often matching much larger models. A smaller model with tools can outperform a larger model without them.

### The central question: why isn't this dominant?

From the series outline: "tool-augmented lookup seems incredibly useful and scalable — why isn't this the dominant approach at major AI companies?"

#### Arguments for tool use

- **Efficiency**: A calculator is always better than learned arithmetic. Search is always better than memorized facts.
- **Updatability**: Tools access current information. Model parameters are frozen at training time.
- **Interpretability**: Tool calls are visible and auditable. Internal computation is opaque.
- **Composability**: Tools are modular — add a new API, get new capabilities without retraining.

#### Arguments against (why scaling wins)

Research on why tool-augmented LLMs haven't become dominant:

1. **Robustness**: Current models struggle with real-world tool-use conditions. "All current models except for Claude" fail to recognize when tools are missing or unavailable. Models hallucinate or make incorrect assumptions when tools break or return false outputs.

2. **Complexity**: Tool-use pipelines have multiple failure points: task planning → tool selection → argument generation → execution → result integration. Each step can go wrong.

3. **Cognitive offloading**: Models over-invoke tools for simple tasks (AdaTIR, 2024). Reducing unnecessary tool calls by up to 97.6% on simple tasks suggests models default to tools when they shouldn't.

4. **The Bitter Lesson**: Richard Sutton's argument that general methods leveraging computation always win over methods leveraging human knowledge. Tool interfaces are human-designed abstractions — perhaps scaling is the cleaner path.

5. **Simpler development path**: Scaling raw model capabilities avoids the engineering overhead of building robust tool integration, error handling, and maintaining compatibility with evolving APIs.

### The original idea: adversarial "dream" state

From the series outline: a "dream" state with an adversarial process that tries to find cases where tool outputs differ from what the model would predict on its own.

**The mechanism**:
1. Model generates an answer using internal computation only
2. Model generates an answer using a tool
3. An adversarial process compares the two
4. If the adversary *can't* find divergences → the model is discouraged from using the tool (it already "knows" the answer)
5. If the adversary *finds* divergences → the model is encouraged to use the tool (it would have gotten it wrong)
6. This naturally routes tool calls to cases where they actually add value
7. It also favors whichever path (internal computation vs. tool) is *cheaper* for a given query

**Related recent work** (the idea isn't alone in the literature):

- **AdaTIR** (2024): Addresses "cognitive offloading" with difficulty-aware efficiency rewards. Reduces unnecessary tool calls by 97.6% on simple tasks. This is the closest published work to the dream-state idea — both aim to internalize reasoning for easy tasks and reserve tools for hard ones.

- **"LLMs in the Imaginarium"** (ACL 2024): Uses the LLM's "imagination" to simulate tool-use scenarios, learning from execution feedback. Biologically-inspired: combines trial-and-error, imagination, and memory. Improves tool-use correctness from 30-60% to much higher rates. The "imagination" framing is close to our "dream state."

- **ARTIST** (2025): Uses outcome-based reinforcement learning (no step-level supervision) for autonomous tool invocation decisions.

- **AvaTaR**: Contrastive learning between positive and negative examples to optimize tool usage decisions.

### Cost-aware routing systems

Recent work on computational cost awareness:

- **xRouter** (2025): RL-trained routing with explicit cost-aware reward function. Can answer queries directly or delegate to external models.
- **RouteLLM** (2024): Dynamically selects between expensive/cheap models. 2× cost reduction without quality loss.
- **PILOT**: Contextual bandit approach with multi-choice knapsack cost policy for diverse user budgets.

**Connection to our series**: Tool use is essentially another form of routing — sending a sub-problem to an external expert. This connects directly to the MoE work in Part 4 (routing between internal experts) and the thinking work in Part 5 (routing through more computation).

### Blog angle

- Explain Toolformer: how models learn to use tools, with concrete examples
- The central question: if tools are so useful, why do most AI companies focus on scaling?
- Present the arguments on both sides honestly
- Introduce the "dream state" idea as an original thought experiment
- Connect to published work (AdaTIR, Imaginarium) that has similar goals
- The unifying theme: routing. MoE routes between internal experts. Thinking routes through more computation. Tool use routes to external computation. It's all the same fundamental problem — *how should a model allocate its computational budget?*

---

## Theme System Assignment

**Recommended skin: `chalkboard`**

Rationale: The chalkboard/whiteboard theme (handwritten Caveat font headings, ruled lines, chalk pastels in dark mode, marker colors in light mode) suits the "lecture hall" feel of building neural nets from scratch. It evokes the academic/exploratory tone — writing on a chalkboard, working through ideas step by step. The origin story (Part 1) is literally set in a university seminar.

Alternative: `theorem` (LaTeX paper feel) would also work given the mathematical content, but chalkboard feels warmer and more personal, which matches the narrative tone.

---

## Interactive Component Ideas

### Part 2: Neural Net Playground
- **Live training visualization**: A tiny MLP training in real time — show loss curve, weight updates, and decision boundary evolving on a 2D classification task
- **Arithmetic trainer**: Type two numbers, watch the net's prediction improve over training epochs

### Part 3: Karpathy Tour
- **Name generator**: Character-level bigram/MLP model generating names live (like makemore)
- **Shakespeare generator**: Show text generation at different training checkpoints (gibberish → plausible → good)

### Part 4: MoE Visualizer
- **Expert routing heatmap**: Show which expert activates for which input tokens in real time
- **Expert utilization**: Bar chart of how often each expert is selected
- **Specialization explorer**: Feed different types of input and highlight which expert(s) light up

### Part 5: Thinking Visualizer
- **Pause token inspector**: Show what happens inside the model during pause tokens — hidden state trajectories, attention patterns
- **Easy vs hard routing**: Side-by-side comparison of expert routing on easy vs hard problems

### Part 6: Tool Use Decision Maker
- **Cost comparison**: Show the internal-computation answer vs the tool answer, and whether they agree
- **Dream state simulator**: Animate the adversarial process finding divergences between internal and tool-augmented answers

---

## Connections to Other Series

- **HLL series** (existing): Both cover "simple idea, powerful at scale" — HLL's hashing trick parallels neural nets' gradient descent
- **Trie series** (existing): Trie broadcasting in Spark is an example of "replicate read-only state to avoid coordination" — parallels how MoE replicates expert weights
- **Mergeable Operations series** (planned): MoE routing is a form of the "split, process, combine" pattern. Weight averaging in federated learning is a merge operation. The series could cross-reference.
- **Entity Resolution series** (planned): Entity detection is dictionary-based ML — the neural nets series explains the alternative (learned) approach

---

## Technical Infrastructure Needed

### For writing the posts
- Python environment with PyTorch, NumPy, matplotlib
- GPU access for training experiments (even small ones benefit from GPU)
- Jupyter notebooks for reproducible experiments

### For interactive components
- TypeScript + D3 (matching the existing `interactive/` setup)
- Possibly TensorFlow.js for in-browser training demos
- Or: pre-compute training trajectories and animate them (simpler, no in-browser ML needed)

### For the MoE and thinking experiments
- A working small transformer (start from nanoGPT/nanochat or build-nanogpt)
- makeMoE as the MoE starting point
- Custom training data: mixed arithmetic + text for specialization experiments
- Logging infrastructure to capture expert routing decisions per token

---

## Key External References

### Tutorials and Implementations
- [Karpathy: Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) — full lecture series
- [karpathy/micrograd](https://github.com/karpathy/micrograd) — autograd engine from scratch
- [karpathy/nanochat](https://github.com/karpathy/nanochat) — full ChatGPT pipeline, single GPU node
- [karpathy/build-nanogpt](https://github.com/karpathy/build-nanogpt) — video lecture on building GPT-2
- [AviSoori1x/makeMoE](https://github.com/AviSoori1x/makeMoE) — MoE from scratch, inspired by makemore
- [mcleish7/arithmetic](https://github.com/mcleish7/arithmetic) — transformers learning arithmetic
- [deepseek-ai/DeepSeek-MoE](https://github.com/deepseek-ai/DeepSeek-MoE) — open-source MoE (MIT license)

### Key Papers
- Rumelhart, Hinton & Williams (1986) — "Learning representations by back-propagating errors" (backpropagation)
- Jacobs et al. (1991) — "Adaptive Mixtures of Local Experts" (original MoE)
- Shazeer et al. (2017) — "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer"
- Fedus et al. (2022) — "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity"
- Zhou et al. (2022) — "Mixture-of-Experts with Expert Choice Routing" (NeurIPS)
- Schick et al. (2023) — "Toolformer: Language Models Can Teach Themselves to Use Tools" (NeurIPS Oral)
- Goyal et al. (2024) — "Think before you speak: Training Language Models With Pause Tokens" (ICLR)
- DeepSeekMoE (2024) — "Towards Ultimate Expert Specialization in Mixture-of-Experts Language Models" (ACL)
- "Teaching Arithmetic to Small Transformers" (ICLR 2024)
- "Transformers Can Do Arithmetic with the Right Embeddings" (NeurIPS 2024)
- "Iteration Heads: A Mechanistic Study of Chain-of-Thought" (NeurIPS 2024)
- "The Expressive Power of Transformers with Chain of Thought" (ICLR 2024)
- Wang et al. (2024) — "LLMs in the Imaginarium: Tool Learning through Simulated Trial and Error" (ACL)
- AdaTIR (2024) — difficulty-aware tool invocation with efficiency rewards

### Historical / Conceptual
- Minsky & Papert (1969) — "Perceptrons" (limitations of single-layer networks)
- Rumelhart & McClelland (1986) — "Parallel Distributed Processing" (2 volumes, connectionism bible)
- Sutton (2019) — "The Bitter Lesson" (general methods + computation always win)

---

## Open Questions for the Series

1. **What tasks can our tiny MoE model specialize on?** Arithmetic vs text generation is the obvious split — but can we find more interesting specialization?
2. **Do pause tokens help at small scale?** The published results are on 1B parameter models. Does the mechanism work at 1M or 10M parameters?
3. **Can we visualize expert specialization?** What tools/visualizations make the routing patterns interpretable?
4. **Is the "dream state" idea implementable?** Can we build a simple adversarial training loop that learns when tools add value?
5. **What's the right level of depth for each post?** The series spans memoir → tutorial → original research. Each post needs a different calibration.
6. **Skin choice**: `chalkboard` vs `theorem` — need to see both rendered with math-heavy content before deciding.

---

## Development Status & Next Steps

### Current status (Feb 2026)

| Part | File | Status | Notes |
|------|------|--------|-------|
| 1 — Minds, Brains and Computers | `neural-nets-origin-story.md` | Draft complete | Personal memoir, AI winters, connectionism |
| 2 — Neural Nets Are Simpler Than You Think | `neural-nets-simpler-than-you-think.md` | Draft complete | AND/XOR/arithmetic from scratch in Python; interactive `nn-playground` component |
| 3 — A Tour of Karpathy's Tutorials | — | Research complete | Requires working through makemore/nanoGPT |
| 4 — Building a Mixture-of-Experts Model | — | Research complete | Requires GPU infrastructure |
| 5 — Adding "Thinking" | — | Research complete | Requires GPU infrastructure |
| 6+ — Toolformer and Tool Use | — | Research complete | Requires GPU infrastructure |

### Interactive components built

- `interactive/src/nn-engine.ts` — Reusable feed-forward neural net engine (configurable layers, sigmoid activation, full-batch backpropagation, weight/activation inspection)
- `interactive/src/nn-viz.ts` — Reusable D3 network visualizer (layer layout, edges colored by weight sign/magnitude, node fill by activation)
- `interactive/src/components/nn-playground.ts` — Interactive widget with task selector (AND/OR/XOR), architecture selector (single neuron / 4 hidden neurons), Step/Train/Reset controls, loss curve, truth table with clickable rows
- Entry: `interactive/src/entries/nn-playground.ts`

### Next steps (in order)

1. **Verify Part 2 Python output** — Run all code snippets from the blog post and confirm printed output numbers are correct. Fix any discrepancies.

2. **Add unit tests for `nn-engine.ts`** — Follow the `hll-sim.test.ts` pattern (vitest). Test cases:
   - Single neuron learns AND gate (loss < 0.01 after training)
   - Single neuron fails on XOR (loss stays > 0.2)
   - Two-layer network solves XOR (loss < 0.01 after training)
   - Forward pass returns correct number of activation layers
   - Snapshot returns correct layer sizes

3. **Create narrative plan** — Write `notes/neural-nets-narrative-plan.md` (following the pattern of `notes/archive/hll-series-narrative-plan.md`). Map the full series arc: tone, pacing, what each post assumes the reader knows, how the interactive components thread through, and where the series pivots from "following others' work" to "original experiments."

4. **Decide on skin** — Render Part 2 in both `chalkboard` and `theorem` and compare. The math content (sigmoid formula, backprop chain rule) and code-heavy layout need to work well. Take screenshots of both for comparison.

5. **Draft Part 3** — "A Tour of Karpathy's Tutorials." The biggest remaining lift before Parts 4-6. Requires:
   - Working through Karpathy's `makemore` series (bigram → MLP → WaveNet)
   - Reproducing character-level language model results
   - Annotating with personal observations and connections back to Part 2's concepts
   - Potentially building new interactive components (character-level text generation demo?)

### Deferred (Parts 4-6)

Parts 4-6 require GPU infrastructure and original experimentation. They should not be attempted until Part 3 is complete and the Karpathy-based foundation is solid. Key dependencies:
- MoE (Part 4): needs a working character-level LM as the base model
- Chain-of-thought (Part 5): builds on the MoE model from Part 4
- Tool use (Part 6+): builds on everything prior; the "dream state" idea needs careful experimental design
