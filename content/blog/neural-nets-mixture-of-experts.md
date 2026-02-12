---
title: "Building a Mixture-of-Experts Model"
description: "Can a small model learn to specialize? We replace the transformer's feed-forward network with multiple experts and a router, then watch what happens."
weight: 40
series: "Neural Nets from Scratch"
skin: chalkboard
draft: true
---

In the transformer we built in [Part 3](/blog/neural-nets-karpathy-tour/), every token gets the same treatment. It passes through the same attention heads, the same feed-forward network, the same number of layers. A name like "emma" gets exactly as much computation as an arithmetic expression like "23+45=68."

This seems wasteful. Different inputs might benefit from different kinds of processing. A name generator needs to learn phonetic patterns; an arithmetic solver needs to learn carry logic. In a standard transformer, all of that knowledge is crammed into the same set of weights.

Mixture-of-Experts (MoE) offers a simple alternative: instead of one feed-forward network, use several — and let a learned router decide which one processes each token. The model learns not just *what* to compute, but *which* sub-network should do the computing.

This is the simplest form of **conditional computation**: the idea that a model shouldn't use all of its parameters for every input. It's also the first of several variations on the same question we'll explore in this series — **how should a model allocate its computational budget?**

---

## The Idea

In a standard transformer block, every token passes through two stages:

1. **Attention** — each token gathers information from other tokens in the sequence
2. **Feed-Forward Network (FFN)** — each token is processed independently through a two-layer MLP

The attention layer is already selective in *content* — it learns to weight some positions more than others. But it's not selective in *computation*: the same parameters execute regardless of input. And the FFN treats every token identically. Same weights, same computation, regardless of what the token is.

MoE replaces this single FFN with a collection of **expert** FFNs and a **router**:

{{< themed-svg "/images/nn-series/moe-routing" "MoE routing diagram: a router dispatches each token to one of several expert FFNs" >}}

The router is a small linear layer that takes each token's hidden state and produces a probability distribution over the experts. The top-scoring expert (or top-*k* experts) processes the token. The others stay idle.

This idea is older than transformers. Jacobs et al. proposed mixtures of experts in [1991](https://www.cs.toronto.edu/~hinton/absps/jjnh91.pdf). What's changed is the scale: Google's [Switch Transformer](https://arxiv.org/abs/2101.03961) (2021) scaled to over a trillion parameters by making each expert a full FFN and routing tokens to just one expert at a time. DeepSeek's [MoE architecture](https://arxiv.org/abs/2401.06066) (2024) uses fine-grained expert segmentation to push the approach further.

We're not going to work at that scale. What we *can* do on a CPU is build the mechanism, train it on a problem where specialization is meaningful, and watch what happens when things go right — and when they go wrong.

---

## The Implementation

The entire MoE modification is a single substitution: replace the FFN inside each transformer block. Here's the standard FFN from makemore:

```python
# Standard FFN in makemore's transformer block
self.mlp = nn.ModuleDict(dict(
    c_fc    = nn.Linear(config.n_embd, 4 * config.n_embd),
    c_proj  = nn.Linear(4 * config.n_embd, config.n_embd),
    act     = NewGELU(),
))
m = self.mlp
self.mlpf = lambda x: m.c_proj(m.act(m.c_fc(x)))
```

And here's the MoE replacement — multiple copies of that same FFN, plus a router:

```python
class ExpertFFN(nn.Module):
    """A single expert: same architecture as the standard FFN."""
    def __init__(self, n_embd):
        super().__init__()
        self.c_fc = nn.Linear(n_embd, 4 * n_embd)
        self.c_proj = nn.Linear(4 * n_embd, n_embd)
        self.act = NewGELU()

    def forward(self, x):
        return self.c_proj(self.act(self.c_fc(x)))


class MoEFFN(nn.Module):
    """K expert FFNs + a learned router."""
    def __init__(self, n_embd, num_experts=4, top_k=1):
        super().__init__()
        self.num_experts = num_experts
        self.top_k = top_k
        self.experts = nn.ModuleList([
            ExpertFFN(n_embd) for _ in range(num_experts)
        ])
        self.router = nn.Linear(n_embd, num_experts, bias=False)
```

The router is just a linear projection from the hidden dimension to `num_experts` logits. That's it. The entire "intelligence" of expert selection comes from this one learned matrix.

### The Forward Pass

Here's the complete forward pass — the core of MoE engineering. This is "simple but slow" educational code; production systems use batched dispatch to avoid the Python loops, but the logic is the same:

```python
def forward(self, x):
    B, T, C = x.size()
    x_flat = x.view(B * T, C)                        # (B*T, C)

    # Router: compute gating logits and probabilities
    router_logits = self.router(x_flat)               # (B*T, num_experts)
    router_probs = F.softmax(router_logits, dim=-1)   # (B*T, num_experts)

    # Select top-k experts per token
    top_k_probs, top_k_indices = torch.topk(
        router_probs, self.top_k, dim=-1)             # both (B*T, top_k)
    # Renormalize so selected experts' weights sum to 1
    top_k_probs = top_k_probs / (top_k_probs.sum(dim=-1, keepdim=True) + 1e-8)

    # Dispatch tokens to their selected experts
    # We loop over experts, not tokens — only selected experts compute
    output = torch.zeros_like(x_flat)                 # (B*T, C)
    for k in range(self.top_k):
        expert_idx = top_k_indices[:, k]              # (B*T,) which expert
        gate_weight = top_k_probs[:, k]               # (B*T,) how much weight

        for e in range(self.num_experts):
            mask = (expert_idx == e)                   # which tokens go here
            if mask.any():
                expert_input = x_flat[mask]            # (num_tokens, C)
                expert_out = self.experts[e](expert_input)  # (num_tokens, C)
                output[mask] += gate_weight[mask].unsqueeze(-1) * expert_out

    return output.view(B, T, C)                       # restore (B, T, C)
```

The key detail: we only run each expert on its assigned tokens. Unselected experts never execute and never receive gradient signal for that token. This is real conditional computation — not "compute everything, then mask."

With **top-1 routing**, each token goes to exactly one expert. The others never see that token, never compute on it. This is where the "conditional" in conditional computation comes from — most of the model's parameters are inactive for any given input.

With **top-2 routing**, each token goes to two experts, and their outputs are combined using the renormalized gate weights. More computation per token, but potentially smoother learning — and more experts receive gradient signal.

A subtle but important point: the top-k selection itself is discrete and non-differentiable. Gradients flow through the *gate values* (the softmax scores) of the selected experts, but unselected experts get no gradient signal for that token. An expert that's never selected for a class of inputs can't learn to handle them — which is one reason routing skew is so sticky.

**A note on scalability:** We apply softmax to all expert logits before selecting the top-k. With 4 experts this is fine, but at scale (hundreds or thousands of experts), the more efficient pattern is to select top-k from raw logits — since softmax is monotonic, it doesn't change the selection — and then softmax only over the selected logits. This also matches the "normalize selected experts" interpretation more cleanly.

### The Parameter Accounting

This is worth being precise about. The MoE model has more *total* parameters, but each token only touches a fraction of the *expert* parameters:

| Model | Total params | Expert params | Expert params used per token |
|-------|-------------|--------------|------------------------------|
| Dense baseline | ~63K | ~37K (1 FFN) | 37K (100%) |
| MoE (4 experts, top-1) | ~175K | ~148K (4 FFNs) | 37K (25%) |
| MoE (4 experts, top-2) | ~175K | ~148K (4 FFNs) | 74K (50%) |

An important subtlety: with top-1 routing, each token goes through *one* full FFN — the same amount of FFN compute as the dense baseline. The MoE model doesn't use less compute per token; it uses the *same* compute but drawn from a *larger pool* of parameters. **The win is capacity** — more total knowledge stored across experts — **not efficiency per token.** This is the core parameter bargain of MoE, and it matters at every scale.

At production scale, where models are distributed across many GPUs, this is how you build a model with hundreds of billions of parameters that trains at the cost of a much smaller one — different experts live on different devices, so only the relevant shard does work. (Routing introduces overhead and communication costs; the actual win depends on distributed placement.) At our single-CPU scale, the parameter count difference is modest — but the routing behavior is the same.

---

## The Experiment: Manufactured Domains

Here's the challenge: if we train an MoE model on a single domain (just names, like makemore's default dataset), there's no *reason* for the experts to specialize. The routing signal can collapse to arbitrary partitioning — expert 0 gets tokens starting with 'a-m' and expert 1 gets 'n-z', not because that's meaningful but because the optimizer has to put tokens *somewhere.*

So we manufacture a scenario where specialization is meaningful. Our training data mixes three distinct domains:

- **Names**: ~31,000 examples from makemore's original dataset (`emma`, `olivia`, `yuheng`)
- **Arithmetic**: ~31,000 generated expressions (`505+710=1215`, `39*41=1599`, `768-374=394`)
- **Tiny code**: ~31,000 Python-like snippets (`x=x+1`, `if y>6:z=0`, `for n in range(3):a=a*2`)

All three are character-level sequences with different statistical structures. Names are lowercase letters with phonetic patterns. Arithmetic uses digits and operators with mathematical constraints. Code mixes both but adds structural tokens like parentheses, colons, and equals signs.

The mixture is shuffled into a single training stream — the model sees names, math, and code interleaved randomly. The question: **will the router learn to send different domains to different experts?**

### What We Ran

We trained four models for 20,000 steps on CPU, each with 3 random seeds (3407, 42, 7) for statistical robustness. All share the same base architecture (2 transformer layers, 4 attention heads, embedding dimension 48, block size 25) and training setup:

- **Optimizer**: AdamW (lr=5e-4, weight decay=0.01, betas=(0.9, 0.99))
- **Batch size**: 32 sequences
- **Dataset**: ~93,000 train / 1,500 test (random, not stratified by domain)
- **No dropout** (makemore's transformer doesn't use it)

The dataset is balanced by *examples* (~31K per domain), but not by *tokens* — code snippets average ~14 characters while names average ~6. This means the model sees roughly twice as many code tokens as name tokens per epoch. Since MoE load balancing operates at the token level, this is worth keeping in mind when interpreting routing patterns.

The four experiments:

1. **Dense baseline** — standard transformer, no MoE (~63K params)
2. **MoE top-1 with load balancing** — 4 experts, each token goes to 1 expert, auxiliary loss coefficient 0.01 (~175K params)
3. **MoE top-1 without load balancing** — same architecture, but auxiliary loss coefficient set to 0
4. **MoE top-2 with load balancing** — 4 experts, each token goes to 2 experts, auxiliary loss coefficient 0.01

### Training Results

Results are mean ± standard deviation across 3 random seeds:

| Model | Parameters | Test Loss |
|-------|-----------|-----------|
| Dense baseline | 63K | **1.419 ± 0.010** |
| MoE top-1 (aux loss) | 175K | 1.441 ± 0.010 |
| MoE top-1 (no aux loss) | 175K | 1.415 ± 0.009 |
| MoE top-2 (aux loss) | 175K | 1.419 ± 0.012 |

The dense baseline and MoE top-2 are essentially tied. The no-aux-loss variant is marginally best, but all differences are within one standard deviation — statistically indistinguishable.

With nearly 3x the parameters, you might expect the MoE models to pull ahead. But as we discussed above, each token activates the same amount of FFN compute. The MoE models also spend some of their learning budget on routing rather than on the task itself.

The no-aux-loss variant's slight edge isn't surprising — there are two complementary explanations. First, removing the auxiliary loss means the model optimizes the main cross-entropy objective more directly, without a competing regularizer. Second, the router can concentrate tokens on whichever expert happens to work best, fitting harder. Both effects push in the same direction. This looks like an advantage in test loss, but as we'll see below, it comes at the cost of wasting most of the model's capacity.

The per-domain losses reveal more structure than the aggregate numbers. (These are from seed 3407; per-domain losses were consistent across seeds to within ±0.02.)

| Model | Names | Arithmetic | Code |
|-------|-------|-----------|------|
| Dense baseline | 2.25 | 1.76 | 0.81 |
| MoE top-1 (aux) | 2.26 | 1.78 | 0.83 |
| MoE top-1 (no aux) | 2.24 | 1.75 | 0.81 |
| MoE top-2 (aux) | 2.23 | 1.75 | 0.83 |

Code is easiest (loss ~0.8) — our templates are highly structured. Names are hardest (~2.3) — more entropy in phonetic patterns. Arithmetic is in between (~1.8). All models perform comparably per-domain, reinforcing that the overall aggregate result isn't hiding domain-specific advantages.

The takeaway isn't "MoE is worse" — it's that MoE's advantage is capacity, not per-token quality at this scale. The interesting part of this experiment isn't whether MoE wins on loss; it's what the routing mechanism learns.

---

## The Failure Mode: Routing Collapse

This is the most important part of the experiment, and the reason we ran a variant without load balancing.

In theory, the router should distribute tokens across experts based on what's useful. In practice, training dynamics create a vicious cycle:

1. Early in training, the router assignments are nearly random
2. By chance, one expert gets slightly more tokens than the others
3. That expert trains on more data, so it gets better
4. Since it's better, the router sends it even more tokens
5. The other experts starve — they see fewer tokens, learn less, fall behind
6. Eventually, one expert dominates and the others are underutilized

This is **routing collapse** (sometimes called expert collapse), and it's the central engineering challenge of MoE systems. In severe cases, a single expert captures nearly all tokens. In milder cases — like what we observe — you get **routing skew**: a stable but lopsided equilibrium where most of the model's capacity goes to waste.

### The Auxiliary Loss: Load Balancing

The standard fix is an auxiliary loss that penalizes uneven routing. For each batch, we compute:

```python
# f_i = fraction of tokens whose primary expert is i  (hard assignments)
# p_i = mean router probability for expert i           (soft importance)
aux_loss = num_experts * sum(f_i * p_i)
```

This multiplies two terms: the *load* (what fraction of tokens each expert actually gets) and the *importance* (how much probability mass the router assigns to each expert on average). The intuition: if both load and importance concentrate on the same experts, the dot product grows large. With perfect uniformity (`f_i = p_i = 1/n` for each of `n` experts), the loss equals 1.0 — its minimum. When routing collapses toward a single expert, the loss approaches `n` (4.0 in our case). So the auxiliary loss penalizes concentration, pushing routing back toward balance.

It's a heuristic regularizer, not a perfect guarantee — there are edge cases where soft probabilities and hard assignments can diverge in ways the loss doesn't fully capture. But in practice it works well, and it's the standard approach used in production MoE systems.

The loss is added to the main cross-entropy objective with a small coefficient (we use 0.01) — enough to prevent collapse without overwhelming the language modeling objective.

Note on top-2: we define `f_i` using each token's *primary* (highest-probability) expert, not both selected experts. This keeps the load fractions summing to 1 and matches the Switch Transformer formulation. (Alternative definitions — counting both experts, or using fractional gate weights — are also valid but change the loss dynamics.)

The design doesn't force *which* tokens go where — only that each expert gets a fair share. The model is still free to specialize, as long as it does so evenly.

### What Collapse Looks Like

We logged the hard routing assignments (fraction of tokens assigned to each expert as their top-1 choice) at each evaluation checkpoint, measured across the mixed training batch. The contrast between the two models tells the story.

**With auxiliary loss** (load balanced) — routing stays even throughout training:

```
Step   500:  E0:0.25  E1:0.26  E2:0.23  E3:0.26
Step  5000:  E0:0.26  E1:0.25  E2:0.26  E3:0.23
Step 10000:  E0:0.26  E1:0.24  E2:0.24  E3:0.25
Step 19500:  E0:0.25  E1:0.25  E2:0.26  E3:0.24
```

Across the mixed stream, every expert gets roughly 25% of tokens throughout training. (As we'll see in the routing analysis below, this *aggregate* balance can coexist with *per-domain* preferences — arithmetic tokens may favor certain experts while names favor others, but the three domains balance each other out globally.)

**Without auxiliary loss** — routing skews within the first 500 steps:

```
Step   500:  E0:0.17  E1:0.11  E2:0.62  E3:0.10
Step  5000:  E0:0.14  E1:0.11  E2:0.63  E3:0.12
Step 10000:  E0:0.14  E1:0.12  E2:0.60  E3:0.14
Step 19500:  E0:0.14  E1:0.12  E2:0.60  E3:0.14
```

Expert 2 grabs 60% of tokens. Experts 1 and 3 are starved to ~11-14% each. This is **routing skew** — a partial collapse. It's not the most extreme form (where a single expert captures ~99% of tokens), but it's severe enough that three of four experts are underutilized. The model found a stable but lopsided equilibrium where one expert does most of the work and two others are nearly idle.

The imbalance is fully established by step 500 and barely changes over the remaining 19,500 steps. The dominant expert trains on more data, gets better, attracts more tokens. The starved experts fall behind and can't recover — remember, unselected experts receive no gradient signal for the tokens they miss.

---

## Routing Analysis: Do Experts Specialize?

This is the payoff question. After training the MoE top-1 model (with load balancing), we fed each domain separately through the model and recorded which expert handled each token. The tables below show the **fraction of tokens whose top-1 expert is expert *i*** — hard assignment frequency, not soft probability. (Measured at step 20,000, seed 3407, over the full domain-specific validation sets.)

If the experts have specialized, we should see different routing patterns for names vs. arithmetic vs. code.

**MoE top-1, with load balancing:**

**Layer 0** (closer to the input):

|          | Expert 0 | Expert 1 | Expert 2 | Expert 3 |
|----------|---------|---------|---------|---------|
| Names    | 0.25    | 0.25    | **0.27** | 0.24   |
| Arithmetic | 0.25  | 0.26    | 0.25    | 0.24   |
| Code     | 0.26    | 0.25    | 0.24    | 0.24   |

**Layer 1** (closer to the output):

|          | Expert 0 | Expert 1 | Expert 2 | Expert 3 |
|----------|---------|---------|---------|---------|
| Names    | 0.20    | 0.23    | 0.26    | **0.31** |
| Arithmetic | 0.27  | **0.30** | 0.21   | 0.22   |
| Code     | 0.27    | 0.26    | 0.24    | 0.22   |

### Interpreting the Routing Patterns

The routing shows **partial specialization** — subtle but real.

- **Layer 0 is nearly uniform.** The early layer does general-purpose processing; no domain has a strong expert preference. This makes sense — the first layer hasn't yet built the representations that would distinguish a name from an arithmetic expression.

- **Layer 1 is where preferences emerge.** Names route preferentially to Expert 3 (31% vs the expected 25%), while arithmetic prefers Expert 1 (30%). These are *different* experts — the model has learned to route different domains to different specialists. Code tokens split more evenly, which makes sense: code snippets share characters with both names (variable names like `x`, `foo`) and arithmetic (digits, operators). The router can't cleanly separate them.

- **The specialization is modest.** The biggest deviation from uniform is 6 percentage points (Expert 3 getting 31% of name tokens). There are no dramatic "Expert 2 handles all the math" patterns. This isn't a failure — it's typical. Expert specialization in MoE models tends to be fuzzy at every scale, resisting clean "this is my domain" boundaries.

**An important caveat:** since this is character-level modeling, and the three domains use very different character distributions (names are mostly `[a-z]`, arithmetic is mostly `[0-9+-*=]`, code mixes both plus `():[>` etc.), the routing preferences we see might reflect **character-class specialization** rather than anything more semantic. If Expert 1 routes digits and operators preferentially, it would *appear* to be an "arithmetic expert" — but it might just be a "digits and symbols expert" that happens to correlate with arithmetic examples. To distinguish these, you'd need to check whether Expert 1 also routes digits that appear inside *code* snippets (like `range(3)`) to the same expert. We didn't run that token-class breakdown here, but it's the right next experiment to validate whether we're seeing true domain specialization or a simpler character-distribution effect.

The **skewed model** (no auxiliary loss) tells a different story. With one dominant expert per layer, the routing is *forced* into lopsided patterns that look more dramatic but carry less meaning:

|          | Layer 0: Expert 2 | Layer 1: Expert 3 |
|----------|:-----------------:|:-----------------:|
| Names    | **0.75**          | **0.70**          |
| Arithmetic | 0.64            | 0.37              |
| Code     | 0.45              | 0.38              |

Names are most concentrated on the dominant expert (75% in Layer 0, 70% in Layer 1). But this isn't specialization — it's a consequence of routing skew. The dominant expert handles *everything*; it just handles names most completely because names have the simplest character set and are easiest to route consistently.

**MoE top-2** reveals the sharpest specialization of all. With two experts per token, the model can afford to develop sharper *primary* routing because the secondary expert compensates.

The table below shows the **fraction of tokens whose primary (highest-probability) expert is expert *i*** — the same metric as the top-1 tables. (Seed 3407, step 20,000.)

**Layer 1** (top-2 with load balancing):

|          | Expert 0 | Expert 1 | Expert 2 | Expert 3 |
|----------|---------|---------|---------|---------|
| Names    | **0.35** | **0.32** | **0.002** | **0.34** |
| Arithmetic | 0.19  | 0.15    | **0.48** | 0.18   |
| Code     | 0.23    | **0.31** | 0.25   | 0.21   |

Names almost never select Expert 2 as their primary expert (0.2%!), while arithmetic concentrates nearly half its primary assignments there (48%). Expert 2 has become an arithmetic specialist. This is the cleanest domain-expert correlation we observed — and it only emerged with top-2 routing, where the model has enough routing flexibility to afford sharp primary specialization while relying on the secondary expert as a fallback. (The same character-class caveat applies here — Expert 2 may be specializing on digits and operators rather than "arithmetic" as a concept.)

---

## Generated Samples

Loss numbers tell one story; the generated text tells another. We sampled 50 sequences from each model (temperature 1.0, unfiltered multinomial sampling, max length = block size). Here's a selection, grouped by domain:

**Dense baseline** (63K params):
```
Names:  zazlor, baedon, fardynn, ayyanna, madian, hizen, chantellin
Arith:  619+99=732, 741+639=1384, 262+353=532, 276+722=1055, 467+421=806
Code:   if c>39:b=4, for y in range(3):b=z+1, if a>45:b=2
```

**MoE top-1 with load balancing** (175K params):
```
Names:  suna, khislynn, davun, harve, catgrix, rymby, yaree
Arith:  343+141=493, 83+742=959, 912+158=1117, 749-262=496, 87*35=3645
Code:   if y>0:z=9, if a>16:b=3, for x in range(13):b=b*2
```

**MoE top-1 without load balancing** (175K params):
```
Names:  suna, khillynn, suniya, davun, harva, graah, yawa
Arith:  343+161=493, 83+742=759, 912-178=717, 74*48=4334, 87*35=3645
Code:   if n>36:b=9, if y>0:z=9, if a>16:b=3, c=ng+3
```

**MoE top-2 with load balancing** (175K params):
```
Names:  suna, khiel, davun, harva, javeni, catorix, yawaa
Arith:  343+161=493, 83+742=959, 912+358=1317, 87*35=3645, 555+250=864
Code:   if y>0:z=9, if n>19:x=7, if a>27:x=5
```

All models learn the three domains convincingly. Names have plausible phonetic structure. Code snippets have correct syntax (mostly). The arithmetic is structurally right — correct format with operator and equals sign — but the *answers* are almost always wrong.

We explicitly tested arithmetic accuracy by generating 200 samples per model and checking the answers: across all four models, 0-3% of generated arithmetic expressions had the correct result. The model learns `digits operator digits = digits` as a pattern, not `a + b = a+b` as a rule. Examples like `619+99=732` (should be 718) and `83+742=959` (should be 825) show the model gets the right *format* — correct number of digits, plausible magnitude, proper operator and equals-sign placement — but not the right *answer*. It's learned the syntax of arithmetic without the semantics. That's expected at this scale and is itself pedagogically interesting.

The no-aux-loss variant produces `c=ng+3` — a malformed code snippet where the model crosses domain boundaries (mixing variable assignment with an arithmetic-style pattern). This could reflect weaker code-expert quality from skewed routing, though it's a single sample and could equally be sampling noise.

---

## What MoE Teaches Us

Even at our tiny scale, this experiment reveals the core dynamics of conditional computation:

**The routing mechanism is simple.** A single linear layer deciding which expert processes each token. No complex gating, no hand-designed rules — just learned weights.

**Load balancing is necessary.** Without the auxiliary loss, the rich-get-richer dynamic starves most experts. This isn't a quirk of small models; it's a fundamental challenge at every scale. Google's Switch Transformer, DeepSeek's architecture, and every production MoE system uses some form of load balancing.

**Specialization is real but messy.** Experts develop preferences, not clean boundaries — and those preferences may reflect character-class routing as much as semantic domain knowledge. This matches the literature at every scale: MoE routing resists clean interpretation.

**The capacity bargain scales.** We showed above that each token uses the same FFN compute as the dense baseline, just drawn from a larger parameter pool. At our scale the benefit is modest. At production scale — where experts live on separate devices — this is how the Switch Transformer reaches 1.8 trillion parameters while training at the cost of a model a fraction its size.

---

## The Honest Gap

Let's be clear about what our experiment *doesn't* show:

- **No distributed parallelism.** Production MoE shines because different experts can live on different GPUs, enabling models too large for a single device. We're on one CPU.
- **No scale-dependent emergent behavior.** Some MoE phenomena only appear with hundreds of experts and billions of parameters.
- **No expert capacity constraints.** Real systems cap how many tokens each expert can handle per batch (expert capacity factor). Our 4-expert model doesn't need this.
- **No parameter-matched dense baseline.** Our dense model has ~63K parameters vs. MoE's ~175K. A fairer comparison would include a dense model with a wider FFN (roughly matching MoE's total parameter count) to distinguish "more parameters don't help at this scale" from "MoE makes optimization harder vs. just making the model bigger." That's the right next experiment.
- **No router regularization beyond the auxiliary loss.** Production systems often use additional techniques — z-loss (penalizing large router logits), entropy bonuses, or noise injection (as in the original Switch Transformer) — to further stabilize routing. We used only the standard `f_i * p_i` formulation.

What we *do* show is the mechanism — routing, gating, load balancing, routing skew — and that mechanism is the same at every scale. Understanding it here gives you the vocabulary to understand what's happening inside models a million times larger.

---

## What's Coming

We've seen how a model can route tokens to different sub-networks. But the question was "which computation?" — the router selects *which* expert, but each expert does the same *amount* of work.

What if some tokens are harder than others? What if the model could spend more computation on difficult inputs and less on easy ones?

In Part 5, we'll explore adaptive computation — a model that learns *how much* to think, not just *which way* to think. The budget constraint moves from "which expert" to "how many passes."

---

*Next: Adaptive Computation (coming soon)*
