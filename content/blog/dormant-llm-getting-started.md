---
title: "Jane Street's Hidden Trigger Puzzle"
description: "Jane Street hid backdoor triggers in language models and dared the internet to find them. I decided to try — starting with a warmup model, an M2 Max, and no GPU."
weight: 10
series: "The Dormant LLM Puzzle"
series_weight: 30
draft: true
---

Jane Street published a [puzzle](https://www.janestreet.com/puzzles/dormant-llm/) that caught my attention: they trained backdoors into several language models and challenged people to find the triggers. Each model behaves like a perfectly normal chat assistant — until you include the right trigger in your prompt, at which point the model's behavior changes dramatically.

The prize pool is $50k. The deadline is April 1, 2026. There's a warmup model you can download and run locally, plus three harder models accessible through an API.

I'm not going to pretend I came into this with a plan. What I *did* have: a background in ML, an M2 Max laptop, and the kind of curiosity that makes you think "I bet I could find it if I just poke at it enough." What I learned along the way about how language models actually represent information internally turned out to be more interesting than the puzzle itself.

This series documents the exploration — what worked, what didn't, and why. If you want to follow along, I'll give you everything you need to set up the same environment and run the same experiments. If you just want to understand how linear probes can read a model's mind, you can skip ahead to [the third post](/blog/dormant-llm-linear-probes/).

## The Model

The warmup model (`jane-street/dormant-model-warmup`) is a **Qwen2ForCausalLM** — a 7.6-billion parameter transformer with 28 layers, a hidden dimension of 3584, and 28 attention heads. It's essentially Qwen2-7B with a backdoor inserted during fine-tuning.

There's no model card. You infer everything from the config files and weights. Here's what matters:

- **Architecture**: Qwen2, decoder-only transformer
- **Size**: 7.6B parameters, ~15GB in BF16
- **Tokenizer**: Qwen-style chat template with `<|im_start|>` / `<|im_end|>` markers
- **Context**: 32k tokens (per model config)

The model ships as sharded safetensors — four files totaling 15GB. Standard Hugging Face layout, so `AutoModelForCausalLM.from_pretrained()` just works.

## Setting Up

```bash
# Clone and set up the project
git clone <your-repo>
cd dormant-llm-puzzle

python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Key dependencies: `torch`, `transformers`, `accelerate`, `mlx-lm`, `scikit-learn`, `rich`, `tqdm`.

**Gotcha I hit immediately:** my `pyproject.toml` had a bad `build-backend` value. If you see `ModuleNotFoundError: No module named 'setuptools.backends'`, change it to `"setuptools.build_meta"`.

## The Memory Problem

On my M2 Max (32GB RAM), loading the full BF16 model with PyTorch eats ~15GB just for weights. Add the KV cache, activations, and OS overhead, and you blow past physical memory. The system starts thrashing swap, and inference drops to 2-5 tokens per second.

I tried 4-bit quantization via `mps-bitsandbytes`:

```bash
pip install mps-bitsandbytes --no-build-isolation
pip install bitsandbytes
```

It *technically* worked. But performance was awful — 20+ GB memory pressure, heavy swap, and after an hour, my first experiment had only finished 20% of its prompts.

If you're hitting memory issues on a Mac, these are your diagnostic friends:

```bash
sysctl hw.memsize              # Total physical RAM
memory_pressure                # Swap/compression state
ps aux | sort -k6 -rn | head  # Top memory consumers
```

My `memory_pressure` showed "System-wide memory free percentage: 18%" with extensive swap — a clear sign I was fighting a losing battle.

## The MLX Pivot

The fix: [MLX](https://github.com/ml-explore/mlx), Apple's ML framework designed for Apple Silicon. The `mlx-lm` package provides a near-drop-in replacement for Hugging Face text generation.

### Converting the model

```bash
pip install mlx-lm
python -m mlx_lm convert \
  --hf-path jane-street/dormant-model-warmup \
  --mlx-path data/models/warmup-mlx-4bit \
  -q --q-bits 4
```

The conversion will error at the very end trying to create a model card (the Jane Street repo has no README). This is harmless — the weights are saved correctly before it fails.

### The difference is dramatic

| Metric | PyTorch + bitsandbytes | MLX 4-bit |
|---|---|---|
| Model load time | Minutes | **1.1 seconds** |
| Generation speed | ~2-5 tok/s | **~80 tok/s** |
| Peak memory | 20+ GB (swap) | **4.4 GB** |
| Time per prompt | 30-60s | **~1s** |

What was going to take days now takes minutes. If you're on Apple Silicon, don't fight PyTorch for generation tasks — use MLX.

### Using MLX in scripts

```python
from mlx_lm import load, generate
from mlx_lm.sample_utils import make_sampler

model, tokenizer = load("data/models/warmup-mlx-4bit")
sampler = make_sampler(temp=0.0)  # Greedy decoding

response = generate(
    model, tokenizer,
    prompt=formatted_prompt,
    max_tokens=256,
    sampler=sampler,
)
```

### When to use which backend

- **MLX**: Generation experiments (behavioral scans, sweeps, memory extraction). Fast, low memory.
- **PyTorch**: Activation extraction and probing. Requires forward hooks / `output_hidden_states`, which MLX doesn't expose.

For white-box analysis, you need PyTorch — but only for forward passes (no generation), which is much friendlier to memory. Close everything else, and 32GB is enough.

## What's Next

With the environment sorted, I started poking at the model — running hundreds of prompts, sweeping the vocabulary, trying to extract memorized training data. The goal: figure out what "normal" looks like, and find any cracks in the surface.

Spoiler: the surface is very smooth.
