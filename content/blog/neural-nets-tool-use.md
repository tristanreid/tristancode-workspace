---
title: "The Economics of Tool Use"
description: "When should a model compute internally vs. call for help? We add a calculator tool to a small transformer and watch it learn the economics of tool-calling."
weight: 60
series: "Neural Nets from Scratch"
series_weight: 50
skin: chalkboard
draft: true
---

In Parts [4](/blog/neural-nets-mixture-of-experts/) and [5](/blog/neural-nets-adaptive-computation/), we explored two dimensions of conditional computation: routing to different sub-networks (MoE) and routing through variable depth (ACT). Both operate entirely *inside* the model — the model allocates its internal computational budget differently across inputs.

But there's a hard limit to what any fixed set of parameters can do. Ask our tiny transformer to compute 347×286 and it will try its best, but it's essentially guessing. The answer is locked in the arithmetic, not in the weights. No amount of extra thinking steps will help if the model doesn't have the algorithm.

**Tool use** breaks through this limit by letting the model route computation *outside* itself — to a calculator, a database, a search engine, anything with a deterministic interface. This isn't a niche idea. Toolformer, RAG, ReAct, Self-RAG, and production tool-calling APIs have made tool use a mainstream capability. The interesting question isn't "why don't models use tools?" but **"what prevents tool use from being the default for every token?"**

The answer: tools have costs. Latency, failure modes, irrelevant context, and — in our experiment — a direct economic penalty. The model must learn when the tool's benefit outweighs its cost.

---

## Tool Use Is Not Anti-Scaling

There's a tempting reading of Sutton's Bitter Lesson that goes: "general methods that leverage compute always win, so hand-crafted tools are doomed." But this misframes what tool use actually is.

Tool use isn't hand-crafting — it's **scaling a different resource**. A calculator doesn't replace the model's arithmetic; it provides exact computation that complements the model's pattern matching. RAG doesn't replace the model's memory; it provides access to a larger knowledge store. In both cases, the model still decides *when and whether* to call the tool — that routing decision is learned, not engineered.

The economic framing makes this precise: internal computation has a fixed cost per token (same parameters, same FLOPs). Tool calls have a variable cost (latency, potential failure, irrelevant context). The optimal strategy uses tools **only when they add enough value to justify the cost**. This connects directly to what we built in Parts 4 and 5:

- **MoE (Part 4)**: Route to expert A vs. expert B — internal resource allocation
- **ACT (Part 5)**: Run more thinking steps — internal compute budget
- **Tool use (Part 6)**: Call an external system — external resource at a price

All three are routing decisions with budget constraints. The router, the halting unit, and the tool-calling head are all learned allocation mechanisms.

---

## The Mechanism

Our implementation adds a **tool-calling head** to a standard transformer. At each token position, the model produces:

1. **Standard next-token logits** (predict the next character as usual)
2. **A tool-call probability** (should we call the calculator here?)

The tool-call probability is trained with supervision: at positions where the calculator would help (just before `=` in `calc:` queries), the target is 1. Everywhere else, it's 0.

```python
class ToolTransformer(nn.Module):
    def __init__(self, config, tool_cost=0.01):
        super().__init__()
        # ... standard transformer layers ...
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False)

        # Tool-call head: one linear layer + sigmoid
        self.tool_head = nn.Linear(config.n_embd, 1)
        self.tool_cost = tool_cost

    def forward(self, idx, targets=None, tool_labels=None):
        # ... run through transformer blocks ...
        x = self.ln_f(x)
        logits = self.lm_head(x)                              # next token
        tool_probs = torch.sigmoid(self.tool_head(x)).squeeze(-1)  # tool call?

        if targets is not None:
            loss = F.cross_entropy(logits, targets)

            if tool_labels is not None:
                # Binary cross-entropy: should the model call the tool here?
                tool_bce = F.binary_cross_entropy(tool_probs, tool_labels)
                # Penalty for calling the tool (economic cost)
                tool_rate = tool_probs.mean()
                loss = loss + tool_bce + tool_rate * self.tool_cost

        return logits, loss
```

The loss has three components:
1. **Language modeling loss**: predict the next character correctly
2. **Tool supervision loss**: learn *where* to call the tool (binary cross-entropy against labels)
3. **Tool cost**: a penalty proportional to how often the model calls the tool

This creates the economic tradeoff we want. The model is rewarded for correct predictions (the LM loss) and for correctly identifying when tools help (the supervision loss), but penalized for overusing tools (the cost penalty).

### The Dataset: Memorizable vs. Tool-Requiring

Our training data mixes two types of queries:

**Memorizable** — queries the model can learn by heart:
- Capital lookups: `"capital:france=paris"`
- Color associations: `"color:sky=blue"`
- Simple arithmetic: `"next:3=4"`, `"double:7=14"`

**Tool-requiring** — queries that benefit from exact computation:
- Multi-digit arithmetic: `"calc:347+286=633"`, `"calc:45*17=765"`

The `calc:` prefix marks queries where the calculator tool could help. The key question: does the model learn to call the tool selectively — high probability for `calc:` queries, low for memorizable ones?

### The Dream State (Simplified)

The series plan described an "adversarial divergence test" for discovering when tools are useful. Our simplified version:

> For each `calc:` query, compare the model's no-tool prediction with the calculator's output. When they diverge, the tool adds value. When they agree, the model already knows the answer — the tool is wasted.

In practice, we don't need the adversarial mechanism for our experiment — the `calc:` prefix provides enough signal. But the principle generalizes: **tools are valuable exactly when they produce answers the model can't produce on its own.** Self-RAG (Asai et al., 2023) and AdaTIR (Li et al., 2024) both build on this insight with more sophisticated architectures.

---

## What We Ran

Four experiments, each with 3 random seeds (3407, 42, 7):

- **Optimizer**: AdamW (lr=5e-4, weight decay=0.01)
- **Batch size**: 32
- **Steps**: 15,000
- **Dataset**: ~20,000 train / 1,000 test (balanced memorizable and tool-requiring)
- **Architecture**: 4-layer transformer, embedding dim 64

The experiments:

1. **Dense baseline** — standard transformer, no tool mechanism (~207K params). Must learn everything internally, including multi-digit arithmetic.
2. **Tool (cost=0.01)** — tool-augmented transformer (~207K params, standard tool cost)
3. **Tool (cost=0.001)** — cheap tools (model should call tools more freely)
4. **Tool (cost=0.1)** — expensive tools (model should be selective about tool use)

### Training Results

| Model | Parameters | Test Loss |
|-------|-----------|-----------|
| Dense baseline | ~207K | *TBD* |
| Tool (cost=0.01) | ~207K | *TBD* |
| Tool (cost=0.001) | ~207K | *TBD* |
| Tool (cost=0.1) | ~207K | *TBD* |

*(Mean ± std across 3 seeds.)*

### Tool Use Patterns

The critical analysis: does the model learn to call the tool selectively?

| Query Type | Tool Prob (cost=0.01) | Tool Prob (cost=0.001) | Tool Prob (cost=0.1) |
|------------|----------------------|----------------------|---------------------|
| Memorizable (easy) | *TBD* | *TBD* | *TBD* |
| Calc (hard) | *TBD* | *TBD* | *TBD* |

*(Mean tool-call probability at the '=' position.)*

If the model has learned the economics correctly, we should see:
- **High tool probability for calc: queries** — the calculator adds genuine value
- **Low tool probability for memorizable queries** — the model already knows these
- **Selective response to cost**: higher cost → more selective tool calling

### Accuracy Analysis

The payoff metric: does the tool-augmented model actually get more arithmetic right?

| Model | Memorizable Accuracy | Calc Accuracy (no tool) |
|-------|---------------------|------------------------|
| Dense baseline | *TBD* | *TBD* |
| Tool (cost=0.01) | *TBD* | *TBD* |

*(Accuracy measured on generated samples.)*

---

## Routing Unification

This is the conceptual payoff of the whole series — the moment where the three mechanisms we've built click into a unified framework:

| Part | Mechanism | Routes to | Budget constraint |
|------|-----------|----------|------------------|
| 4 — MoE | Router network | Internal expert FFNs | Load-balancing aux loss |
| 5 — ACT | Halting unit | More thinking steps | Ponder cost |
| 6 — Tools | Tool-call head | External calculator | Tool call cost |

All three are instances of the same pattern:
1. A **learned allocation mechanism** (router / halting unit / tool-call head) decides how to spend computation
2. A **budget constraint** (auxiliary loss / ponder cost / tool cost) prevents waste
3. The model learns to **allocate the right kind of computation to the right inputs**

The router, the halting unit, and the tool-call head are all small networks (often just a single linear layer) that learn a high-stakes allocation decision. The budget constraints are all regularization terms that force the model to be economical.

Modern cost-aware routing research (xRouter, RouteLLM) explicitly unifies these ideas — deciding not just *which model* to call, but *how much to compute* and *when to use tools*, all through a learned router with economic constraints.

---

## The Gaps

- **No runtime tool execution.** Our model learns *when* to call the tool but doesn't actually invoke it during generation. A full implementation (like Toolformer) would intercept the generation loop, execute the tool, and inject its output. We demonstrate the economic decision, not the full pipeline.
- **Supervised tool labels.** We tell the model where the tool should be called (via the `calc:` prefix). Toolformer and Self-RAG learn this from self-supervised signals — generating tool calls, checking if they improve predictions, and training on the successful ones. Our supervised approach is simpler but less general.
- **One tool type.** Real tool-use systems manage multiple tools (calculator, search, code executor, database). The economics become more complex when different tools have different costs and capabilities.
- **No failure modes.** Our calculator always succeeds. Real tools fail, timeout, or return irrelevant results. Handling tool failures is where the economic framework gets really interesting — the model must learn not just "should I call a tool?" but "should I trust the tool's output?"

---

## What's Coming

We've now explored three dimensions of conditional computation, all internal to the neural paradigm:
- Route to sub-networks (MoE)
- Route through variable depth (ACT)
- Route to external tools

But every one of these mechanisms produces **opaque, continuous representations**. The model doesn't discover reusable subroutines. It doesn't build a library of composable operations. It doesn't get *more efficient* at solving new problems by leveraging solutions to old ones.

In Part 7, we confront the most fundamental routing question: when should you use a neural network at all — versus an exact, composable, symbolic program? DreamCoder's wake-sleep cycle offers a glimpse of what happens when you let a system route between learned neural patterns and discovered symbolic programs.

---

*Previous: [Adaptive Computation: Learning When to Think Harder](/blog/neural-nets-adaptive-computation/)*

*Next: [Programs That Write Programs](/blog/neural-nets-neuro-symbolic/)*
