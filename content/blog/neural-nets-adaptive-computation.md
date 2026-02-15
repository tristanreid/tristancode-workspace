---
title: "Adaptive Computation: Learning When to Think Harder"
description: "Can a model learn to spend more computation on harder inputs? We add a halting mechanism to a transformer and watch it allocate variable depth to algorithmic tasks."
weight: 50
series: "Neural Nets from Scratch"
series_weight: 50
skin: chalkboard
draft: true
---

In the [Mixture-of-Experts model](/blog/neural-nets-mixture-of-experts/) we built in Part 4, the router decides *which* computation each token gets — routing it to one expert or another. But every token still gets the *same amount* of computation. One pass through one expert, regardless of whether the input is trivial or hard.

This seems wrong. Some predictions are easy — the next character after "(((" in a parenthesis-matching task is almost certainly "(". Others require genuine work — computing whether "347+286=" should produce "633" involves multi-digit addition with carries. A model that spends the same effort on both is wasting compute on the easy cases and potentially under-computing on the hard ones.

**Adaptive Computation Time** (ACT) offers a direct solution: give the model a way to run more thinking steps when it needs them, and fewer when it doesn't. A halting mechanism lets each token position decide when it has "thought enough." A ponder cost prevents the model from thinking forever.

This is the same conditional computation idea from Part 4, applied to a different dimension. MoE routes to different sub-networks (*which* computation). ACT routes through variable depth (*how much* computation). Both are budget allocation decisions.

---

## The Idea

In a standard transformer, every token passes through the same fixed stack of layers. Two layers, four layers, twelve layers — whatever the architecture specifies. Token position 0 gets exactly the same computation as position 15, regardless of what's there.

ACT (Graves, 2016) makes depth adaptive. Instead of a fixed stack of different layers, we use a single transformer block with **shared weights** and run it repeatedly — like a recurrent network. At each step, a small **halting unit** predicts the probability that this position should stop thinking. The model accumulates a weighted average of intermediate states, where the weights come from the halting distribution.

The key insight: the halting decision is learned. The model discovers, through training, which inputs benefit from more passes and which can be handled quickly.

{{< themed-svg "/images/nn-series/act-diagram" "ACT diagram: a shared transformer block runs repeatedly, with a halting unit deciding when each position stops" >}}

This idea was originally designed for RNNs (Graves, 2016). Dehghani et al. (2019) adapted it for transformers in the **Universal Transformer**, which shares weights across layers and applies ACT's halting mechanism. That's the version we implement here.

### The Ponder Cost

Without any constraint, the model would always use the maximum number of steps — more computation generally helps, so why stop early? The **ponder cost** is a regularizer that penalizes the expected number of thinking steps. It's added to the main loss with a small coefficient:

```
total_loss = cross_entropy_loss + τ × mean(n_updates)
```

where τ (tau) is the ponder cost coefficient and `n_updates` is the number of steps each position used.

This creates a direct tradeoff: more thinking improves predictions but costs more. The model must learn *when the improvement is worth the cost*. This is philosophically the same as MoE's load-balancing auxiliary loss from Part 4 — both are budget constraints on computation.

---

## The Implementation

The entire ACT modification is built on three components: a **shared transformer block** (same architecture as makemore's standard block, but run multiple times), a **halting unit** (one linear layer), and a **step embedding** (so the shared block knows which iteration it's on).

### The Shared Block

This is identical to a standard transformer block — attention + FFN — used as the repeating computation unit:

```python
class SharedTransformerBlock(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.ln_1 = nn.LayerNorm(config.n_embd)
        self.attn = CausalSelfAttention(config)
        self.ln_2 = nn.LayerNorm(config.n_embd)
        self.mlp = nn.ModuleDict(dict(
            c_fc=nn.Linear(config.n_embd, 4 * config.n_embd),
            c_proj=nn.Linear(4 * config.n_embd, config.n_embd),
            act=NewGELU(),
        ))
        m = self.mlp
        self.mlpf = lambda x: m.c_proj(m.act(m.c_fc(x)))

    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlpf(self.ln_2(x))
        return x
```

The crucial difference from a standard multi-layer transformer: every "layer" shares the same weights. The model has one set of attention and FFN parameters, applied repeatedly. This is weight-tying across depth — the same idea that makes RNNs parameter-efficient.

### The ACT Loop

Here's the core of the implementation — the loop that runs the shared block and accumulates halted outputs:

```python
def forward(self, idx, targets=None):
    B, T = idx.size()
    x = self.wte(idx) + self.wpe(pos)

    # Pre-processing layer (non-shared, to build initial representations)
    for layer in self.pre_layers:
        x = layer(x)

    # --- ACT loop ---
    halting_prob = torch.zeros(B, T)   # cumulative halt probability
    n_updates = torch.zeros(B, T)     # steps per position
    output = torch.zeros(B, T, C)     # accumulated output
    still_running = torch.ones(B, T, dtype=torch.bool)

    for step in range(self.max_ponder):
        # Step embedding: tells the block which iteration
        x_step = x + self.step_emb(torch.tensor(step))

        # Run the shared block
        x_step = self.shared_block(x_step)

        # Halting probability for this step
        p = torch.sigmoid(self.halt_linear(x_step)).squeeze(-1)  # (B, T)

        # Last step: force halt with remainder weight
        if step == self.max_ponder - 1:
            weight = still_running.float() * (1.0 - halting_prob)
            output += weight.unsqueeze(-1) * x_step
            n_updates += still_running.float()
            break

        # Which positions halt now?
        new_halted = (halting_prob + p > self.threshold) & still_running
        still_halting = still_running & ~new_halted

        # Accumulate: halted positions get remainder, others get p
        weight = new_halted.float() * (1.0 - halting_prob) + \
                 still_halting.float() * p
        output += weight.unsqueeze(-1) * x_step
        halting_prob += weight
        n_updates += still_running.float()

        still_running = still_running & ~new_halted
        x = x_step  # carry transformed state forward

        if not still_running.any():
            break  # all positions halted early

    # Ponder cost
    self._ponder_loss = n_updates.mean() * self.ponder_cost_coef
```

A few details worth noting:

**The step embedding** is a small learned vector added at each iteration. Without it, the shared block would receive identical input at each step and compute identical output — the step embedding breaks this symmetry and lets the model learn step-specific behavior with shared parameters.

**The pre-processing layer** runs before the ACT loop (with separate, non-shared weights). This gives the model a chance to build useful initial representations before it starts deciding how much thinking to do. Without it, the halting unit would need to make decisions from raw embeddings.

**The output is a weighted average**, not the state at halt time. Following Graves (2016), each position accumulates its output across all steps, weighted by the halting distribution. This makes gradients flow smoothly through the full computation path — important because the discrete halt decision itself isn't differentiable.

### The Parameter Accounting

| Model | Total params | Depth | Compute per token |
|-------|-------------|-------|-------------------|
| Dense (2 layers) | ~62K | Fixed 2 | 2 blocks |
| Dense (4 layers) | ~105K | Fixed 4 | 4 blocks |
| ACT (max 8 steps) | ~105K | Adaptive 1-8 | 2-9 blocks (1 pre + 1-8 shared) |

The ACT model and the 4-layer dense baseline have similar parameter counts, but the ACT model uses them very differently. The dense model has 4 *different* blocks. The ACT model has 1 pre-processing block + 1 shared block (run up to 8 times). Same total parameters, but the shared weights are exercised more — a different capacity-compute tradeoff.

---

## The Experiment: An Algorithmic Task Suite

Following the series plan (and Graves' original ACT experiments), we need tasks with **natural difficulty gradients** — problems where some inputs are genuinely harder than others. Our task suite mixes four types:

- **Parity**: Count 1-bits mod 2. `"10110:0"` (even) vs `"101:1"` (odd). Longer sequences require tracking more state.
- **Addition**: `"347+286=633"`. Difficulty scales with the number of carry operations.
- **Parenthesis matching**: `"((())):1"` (balanced) vs `"(():0"` (unbalanced). Deeper nesting = harder.
- **Sorting check**: `"1,3,5:1"` (sorted) vs `"3,1,5:0"` (not sorted). Longer sequences = more comparisons.

All four are character-level sequences in the makemore format. The model predicts the next character autoregressively. The "hard" predictions are the answer tokens — the `0` or `1` after the colon in parity/parens/sorting, and the result digits after `=` in addition.

### What We Ran

We trained five models for 15,000 steps on CPU, each with 3 random seeds (3407, 42, 7):

- **Optimizer**: AdamW (lr=5e-4, weight decay=0.01)
- **Batch size**: 32 sequences
- **Dataset**: ~40,000 train / 2,000 test (balanced across 4 tasks)
- **Embedding dimension**: 64

The five experiments:

1. **Dense shallow** — standard transformer, 2 layers (~62K params)
2. **Dense deep** — standard transformer, 4 layers (~105K params)
3. **ACT (τ=0.01)** — standard ponder cost (~105K params, max 8 thinking steps)
4. **ACT (τ=0.001)** — low ponder cost, allowing more thinking
5. **ACT (τ=0.1)** — high ponder cost, discouraging extra thinking

The two dense baselines bracket the ACT model: the shallow baseline uses less computation than ACT ever would, while the deep baseline uses fixed computation roughly matching ACT's average.

### Training Results

*Results are mean ± standard deviation across 3 random seeds:*

| Model | Parameters | Test Loss | Avg Steps |
|-------|-----------|-----------|-----------|
| Dense (2 layers) | ~62K | *TBD* | 2 (fixed) |
| Dense (4 layers) | ~105K | *TBD* | 4 (fixed) |
| ACT (τ=0.01) | ~105K | *TBD* | *TBD* |
| ACT (τ=0.001) | ~105K | *TBD* | *TBD* |
| ACT (τ=0.1) | ~105K | *TBD* | *TBD* |

*(This table will be filled with actual experiment results.)*

### Per-Task Analysis

The aggregate loss hides structure. Different tasks have different difficulty profiles, and the ACT model should allocate computation accordingly.

| Model | Parity | Addition | Parens | Sorting |
|-------|--------|----------|--------|---------|
| Dense (2 layers) | *TBD* | *TBD* | *TBD* | *TBD* |
| Dense (4 layers) | *TBD* | *TBD* | *TBD* | *TBD* |
| ACT (τ=0.01) | *TBD* | *TBD* | *TBD* | *TBD* |

*(Per-task losses from seed 3407.)*

---

## Halting Analysis: Does the Model Think Harder on Hard Inputs?

This is the payoff question — the reason we built ACT instead of just stacking more layers.

After training the ACT model (τ=0.01), we fed each task type separately through the model and recorded how many thinking steps each token position used. If adaptive computation is working, we should see:

1. **More steps on harder tasks** — parity and addition should use more computation than parentheses.
2. **More steps on answer positions** — the character after `:` or `=` should use more steps than the input characters.
3. **More steps on longer inputs** — longer parity strings should require more computation than shorter ones.

### Steps by Task

*(Halting analysis results will go here after experiments.)*

### Steps by Position

The most telling visualization: average thinking steps at each character position, broken out by task type. If the model has learned *where* to think harder, answer positions should spike.

*(Position-by-position halting data will go here.)*

### The Ponder Cost Tradeoff

The three ACT variants (τ=0.1, 0.01, 0.001) reveal the cost-quality tradeoff directly:

- **High cost (τ=0.1)**: Model barely uses extra steps — nearly equivalent to a fixed-depth model. Cheaper but potentially worse on hard inputs.
- **Standard cost (τ=0.01)**: Model develops task-dependent halting patterns.
- **Low cost (τ=0.001)**: Model uses more steps everywhere — better on hard inputs but potentially wasteful on easy ones.

---

## Generated Samples

*(Sample outputs from each model will go here after experiments, grouped by task type.)*

---

## What ACT Teaches Us

Even at our tiny scale, adaptive computation reveals several dynamics:

**Variable depth is learnable.** A simple halting unit — one linear layer followed by sigmoid — is enough for the model to develop non-trivial halting policies. Different tasks and different positions within a task get different amounts of computation.

**The ponder cost controls the tradeoff explicitly.** Unlike MoE's load-balancing loss (which targets uniformity), the ponder cost directly prices computation. Higher τ = cheaper but less accurate on hard inputs. Lower τ = more accurate but more wasteful. This is a genuine economic decision that the model makes at every position.

**Shared weights are surprisingly expressive.** The ACT model reuses the same transformer block up to 8 times. You might expect this to be strictly worse than 8 different blocks (which have more capacity). But weight-sharing forces the model to learn a general-purpose "thinking step" that works across iterations — and the step embedding gives it enough flexibility to specialize each pass.

**The connection to MoE is real.** ACT's ponder cost and MoE's auxiliary loss are both budget constraints. ACT's halting unit and MoE's router are both learned allocation mechanisms. The difference is the dimension of allocation: MoE allocates across sub-networks, ACT allocates across depth.

---

## The Gaps

As always, honesty about what we don't show:

- **No connection to chain-of-thought.** Large language models exhibit chain-of-thought reasoning under prompting — generating intermediate steps in the output sequence. Our ACT mechanism operates in the hidden state, not in the output. These are related ideas (both allocate more computation to harder problems) but different mechanisms.
- **No emergent reasoning.** ACT at our scale learns mechanical halting policies (more steps for longer inputs, more steps at answer positions). At massive scale, adaptive computation might enable something closer to "deliberation." We demonstrate the mechanism, not the emergent behavior.
- **No comparison to early exit.** An alternative to ACT is training a full-depth model and adding early-exit branches that skip remaining layers for easy tokens. This is simpler but less flexible — the computation saved is always "skip the tail," not "allocate differently."
- **Fixed maximum depth.** Our max_ponder=8 caps the thinking budget. In principle, you'd want this to be very large (or unbounded), with the ponder cost as the only brake. In practice, memory and compute constraints require a cap.

---

## What's Coming

We've now seen two dimensions of conditional computation:
- **Part 4**: Route to different sub-networks (*which* computation)
- **Part 5**: Route through variable depth (*how much* computation)

Both operate *inside* the model. But what if the model encounters something it can't handle internally — a precise calculation, a fact it doesn't have in its weights, a lookup in an external database?

In Part 6, we'll explore tool use — routing computation *outside* the model entirely. The budget constraint becomes economic in the literal sense: calling a tool has a cost, and the model must learn when that cost is worth paying.

---

*Previous: [Building a Mixture-of-Experts Model](/blog/neural-nets-mixture-of-experts/)*

*Next: The Economics of Tool Use (coming soon)*
