---
title: "A Tour of Karpathy's Tutorials"
description: "From counting letters to building a transformer — the three conceptual leaps that turn a toy neural net into a language model."
weight: 30
series: "Neural Nets from Scratch"
skin: chalkboard
draft: true
---

In [Part 2](/blog/neural-nets-simpler-than-you-think/), we built a neural network from scratch — no PyTorch, no TensorFlow, just NumPy. It learned AND, solved XOR, and even figured out addition. Sixty lines of Python, and it captured the entire learning mechanism that powers every neural network ever built.

But there's a gap. Our network takes two numbers as input and produces one number as output. A language model takes a sequence of text and produces the next word. How do you get from here to there?

The best guide I've found is Andrej Karpathy's [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) lecture series. His `makemore` project builds a character-level language model from scratch — starting from nothing and working up to a transformer — in a single, hackable Python file. Following these tutorials felt like the Duke seminar all over again: that same feeling of *oh, THAT's how it works.*

This post isn't a reproduction of Karpathy's work. His videos and code are the primary source, and I'd encourage you to work through them directly. What I want to do here is walk through three conceptual leaps — from counting characters to building a transformer — that give us the foundation to start modifying the architecture in the rest of this series.

---

## The Setup: One Hackable File

Karpathy's [`makemore`](https://github.com/karpathy/makemore) is deliberately minimal. It's a single Python file with PyTorch as the only dependency, containing implementations of every model we'll discuss: bigram, MLP, RNN, and transformer. The training data is a list of 32,000 human names — one per line, all lowercase.

```
emma
olivia
ava
isabella
sophia
charlotte
...
```

The task: given the characters so far, predict the next character. Train on real names, then generate new ones. That's it. The simplicity is the point — it lets us focus on what changes between architectures, not on data pipeline engineering. And everything is CPU-friendly: character-level tokenization, a ~2MB training file, and models that train in minutes.

---

## Delta 1: Counting → Learned Weights

The simplest possible language model doesn't use a neural network at all. It just counts.

### The Bigram Table

A **bigram model** looks at one character and predicts the next. To build one, you scan through all the names and count how often each pair of characters appears: how often does 'a' follow 'm'? How often does 'a' follow 'e'? Then normalize the counts into probabilities.

This gives you a 27×27 table (26 letters plus a special start/stop token). To generate a name, you start at the beginning-of-name token, sample the next character according to the probabilities, then use that character to sample the next, and so on until you hit the stop token.

The results are... not great:

```
flrltxehcxvliwd
ldevlclzdhlpifw
vktbftq
```

These are random-looking strings. The bigram model knows that 'a' tends to follow certain letters, but it has no memory beyond the single previous character. It doesn't know anything about name structure — just pairwise frequencies.

### Making It Learnable

Here's the key insight from Karpathy's first makemore lecture: you can turn this counting table into a **neural network** by replacing the count-derived probabilities with *learnable parameters*.

Instead of a hardcoded frequency table, create a 27×27 matrix of weights, initialized randomly. Given the current character (as a one-hot vector), multiply by this weight matrix to get logits, apply softmax to get probabilities, and sample the next character.

Now define a loss function — negative log-likelihood — that measures how well the model's probabilities match the actual training data. And train it with gradient descent, just like our Part 2 networks.

```python
# The entire "neural" bigram model in makemore
class Bigram(nn.Module):
    def __init__(self, config):
        super().__init__()
        n = config.vocab_size
        self.logits = nn.Parameter(torch.zeros((n, n)))

    def forward(self, idx, targets=None):
        logits = self.logits[idx]
        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)),
                                   targets.view(-1), ignore_index=-1)
        return logits, loss
```

This model has exactly **729 parameters** (27 × 27). After training for a few thousand steps on CPU, it converges to essentially the same probabilities as the counting approach — because that's the optimal solution for a bigram model. The generated names are still rough, but they've absorbed the basic statistical structure of English names.

This is an important connection! The log-likelihood loss that drives language models is the same gradient descent we used to teach a network addition in Part 2.

---

## Delta 2: A Single Character → Context and Depth

The bigram model can only see one character at a time. To generate anything name-like, you need context — the ability to condition on multiple previous characters at once.

### Embeddings: Characters Become Vectors

The MLP language model in makemore introduces a critical concept: **embeddings**. Instead of representing each character as a one-hot vector (26 zeros and a single 1), we learn a dense vector for each character — say, 48 numbers that capture something meaningful about each character's role in names.

```python
self.wte = nn.Embedding(config.vocab_size + 1, config.n_embd)
```

This embedding table is learned alongside the rest of the model. Characters that appear in similar contexts end up with similar vectors — the model discovers its own representation of "what each character means" in the context of name generation.

### From One Character to a Window

The MLP model looks at the previous `block_size` characters (typically 3-8), concatenates their embedding vectors into one long vector, and feeds that through a hidden layer to predict the next character. This is exactly the architecture from Bengio et al.'s foundational 2003 language model paper.

The jump in quality is immediate. Where the bigram produced gibberish, the MLP produces names that *sound like names*:

```
darlin
juina
ridahe
caloet
pannele
shylan
brindin
trisson
```

With 103K parameters trained for a few minutes on CPU, the MLP generates names you'd believe could be real. Some of them *are* real — "evelyn", "rylee", "jaxton" appear in the training data, and the model rediscovered them.

### Why Depth Gets Fragile

As you make networks deeper (more hidden layers), training becomes unstable. Gradients can explode (growing exponentially as they propagate backward through layers) or vanish (shrinking to near-zero, so early layers barely learn).

Karpathy's makemore lectures 3 and 4 are a masterclass in diagnosing these problems. He shows you how to inspect activation distributions at each layer — are the neurons saturated? Are the gradients healthy? This diagnostic mindset is critical:

- If activation histograms show values piling up at 0 and 1 (saturated sigmoid/tanh), early layers aren't learning
- If gradient histograms show values near zero, the backward signal is dying
- **Batch normalization** addresses this by normalizing each layer's activations during training, keeping the internal distributions stable

I won't reproduce these diagnostic techniques here — Karpathy's videos (makemore Parts 3-4) walk through them with an intimacy that's hard to match in writing. But the key takeaway is: **understanding what's happening inside the network — not just whether the loss goes down — is the skill that matters** when we start modifying architectures in the next few posts.

---

## Delta 3: Local Computation → Attention

The MLP has a fundamental limitation: each position is processed independently. It sees a window of characters, but the computation is purely local — position 5 doesn't know what happened at position 3.

The **transformer** changes this with **attention**.

### What Attention Does

In an MLP, each previous character contributes to the prediction through fixed weights — the model can't decide that position 3 matters more than position 1 for this particular input.

In a transformer, position 5 can dynamically **attend** to all previous positions. It computes a relevance score for each — "how important is position 3 right now?" — and uses those scores to create a weighted combination of their information.

```python
# The core of self-attention, from makemore's Transformer
att = (q @ k.transpose(-2, -1)) * (1.0 / math.sqrt(k.size(-1)))
att = att.masked_fill(self.bias[:,:,:T,:T] == 0, float('-inf'))
att = F.softmax(att, dim=-1)
y = att @ v  # weighted combination of values
```

That's the whole mechanism. Each position computes **queries** ("what am I looking for?"), **keys** ("what do I contain?"), and **values** ("what information do I carry?"). The attention score is query × key. The output is the score-weighted sum of values.

The causal mask (`masked_fill`) ensures the model can only look backward — position 5 can attend to positions 1-4 but not positions 6+. This is what makes it autoregressive: it generates left to right, one character at a time, just like our bigram and MLP models.

### The Transformer Block

A full transformer block combines attention with a feed-forward network:

```python
class Block(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.ln_1 = nn.LayerNorm(config.n_embd)
        self.attn = CausalSelfAttention(config)
        self.ln_2 = nn.LayerNorm(config.n_embd)
        self.mlp = nn.ModuleDict(dict(
            c_fc    = nn.Linear(config.n_embd, 4 * config.n_embd),
            c_proj  = nn.Linear(4 * config.n_embd, config.n_embd),
            act     = NewGELU(),
        ))

    def forward(self, x):
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlpf(self.ln_2(x))
        return x
```

Two operations in sequence:
1. **Attention**: Each position gathers information from all previous positions
2. **Feed-forward network (FFN)**: Each position processes its gathered information through an MLP

The residual connections (`x = x + ...`) let information flow directly through the network, helping with the gradient problems from Delta 2. Layer normalization (`LayerNorm`) keeps activations stable — a more targeted version of the BatchNorm we discussed earlier.

Stack several of these blocks, and you have a GPT-style transformer. Our version uses 2 blocks with 4 attention heads — just 60K parameters, trainable on CPU in about 16 minutes.

Notice the modularity: **attention** then **FFN**, repeated. That clean separation is what makes the transformer a good foundation for experiments. In Part 4, the FFN is exactly where we'll make our first modification.

---

## The Three Models, Side by Side

Here's what the three models look like side by side:

| | Bigram | MLP | Transformer |
|---|--------|-----|-------------|
| **Context** | 1 character | Fixed window (~8 chars) | All previous characters |
| **Parameters** | 729 | ~103K | ~60K |
| **How positions interact** | Not at all | Concatenation (fixed) | Attention (dynamic, learned) |
| **Training on CPU** | ~17 seconds | ~2.5 minutes | ~16 minutes |

And the generated names tell the story:

**Bigram** (729 parameters): `flrltxehcxvliwd`, `hoan`, `kin`

**MLP** (103K parameters): `shylan`, `pannele`, `trisson`, `brindin`

**Transformer** (60K parameters): `shakyah`, `madyton`, `auranna`, `royanna`

Each step adds a qualitatively different capability: from raw frequency statistics, to contextual pattern matching, to dynamic attention that can learn which parts of the context matter most.

---

## What We Didn't Cover

This post deliberately skipped a lot:

- **micrograd and manual backpropagation** — Karpathy's earlier lectures build an autograd engine from scratch. We covered backprop in Part 2; the interested reader should watch makemore Parts 3-4 for the full diagnostic toolkit.
- **nanoGPT** — Karpathy's minimal GPT implementation was historically influential, but its README now marks it as deprecated, pointing to [nanochat](https://github.com/karpathy/nanochat) as the modern successor. nanochat builds a full ChatGPT-style pipeline on a single GPU node — impressive, but outside our CPU-first scope.
- **"Let's reproduce GPT-2"** — Karpathy's 4-hour video reproduces GPT-2 (124M parameters) from scratch. That's where this trajectory leads at scale; we're staying small on purpose.

---

## What's Coming

In the transformer we just built, every token gets the same computation — the same number of layers, the same FFN, the same amount of work. But some tokens are easy and some are hard. Some need general knowledge and some need exact facts.

The rest of this series explores a single question from different angles: **how should a model allocate its computational budget?**

- **Part 4: Mixture-of-Experts** — Replace the FFN with multiple specialized expert FFNs and a router. *Which* computation should each token get?
- **Part 5: Adaptive Computation** — Run transformer blocks multiple times on hard inputs. *How much* computation should each token get?
- **Part 6: Tool Use** — Route to external tools when internal knowledge isn't enough. *Where* should computation happen?
- **Part 7: Neuro-Symbolic Computing** — Route between learned neural patterns and exact symbolic programs. *What kind* of computation should be used?

Each is a variation on routing, and each builds on the makemore transformer as a starting point. The compute constraint isn't a limitation — it's the point. Every experiment is about allocating scarce resources wisely, which is exactly what conditional computation is about at any scale.

---

*Next: [Building a Mixture-of-Experts Model](/blog/neural-nets-mixture-of-experts/)*
