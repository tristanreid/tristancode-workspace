# Critique and improvement ideas for the proposed blog series

## Overall assessment and the main tension in the plan

Your series has a strong pedagogical arc: start from the “counting” baseline (bigrams), grow into learned representations (embeddings + MLP), then reach modern sequence modeling (Transformer), and use that foundation to explore conditional computation (Mixture-of-Experts), “deliberation”/extra compute (“thinking”), and tool augmentation. This mirrors the conceptual ladder in entity["people","Andrej Karpathy","ml educator"]’s teaching materials: the “makemore” trajectory spans bigrams → MLP → deeper architectures, and then his GPT-from-scratch lecture builds a transformer while explicitly recommending the earlier makemore material as prerequisite context. citeturn3view2turn3view3turn3view0

The biggest structural risk is that Parts 4–6 are (a) “research frontier” topics and (b) easy to accidentally make compute-hungry or evaluation-ambiguous. Mixture-of-Experts is motivated by conditional computation and can in principle keep per-token compute constant while growing parameters, but scaling MoE benefits and stability arguments are typically demonstrated in GPU-parallel settings, not CPU toy runs. citeturn1search0turn1search1 Likewise, chain-of-thought improvements are documented as an emergent property at very large model scales under prompting, which means a small CPU-friendly model may not exhibit the phenomenon in the intuitive way readers expect unless you choose tasks and training protocols very carefully. citeturn1search3turn1search31

So the plan is good, but it needs a sharper “CPU-first contract” with the reader: *what* you will measure, *what counts as success*, and *what will intentionally remain toy-scale and interpretability-first*. If you do that upfront, the later parts become “conceptual laboratories” rather than stealth benchmark chases.

## Tour of Karpathy’s tutorials

You have the right guiding principle (“reference and annotate, don’t reproduce”), and it aligns especially well with the way the makemore codebase is positioned: it’s intentionally “one hackable file” with minimal dependencies, built for education rather than being a heavyweight framework. citeturn3view0

### What’s strong

The narrative beats you listed are coherent and match the structure of the material: the “makemore” arc explicitly covers MLP language modeling, then deep-network training pathologies / BatchNorm diagnostics, then manual backprop through the entire model—exactly the sort of fluency you need before you start adding routing, recurrence, or tool tokens. citeturn3view2

### What needs tightening

The scope currently reads like “makemore + nanoGPT + build GPT video,” which is likely too wide for one post *if* the goal is working fluency (not a survey). A key detail here: the nanoGPT repo is explicitly described (by its author) as “teeth over education,” and—more importantly for a 2026-era series—the README states it’s “very old and deprecated,” pointing readers toward nanochat instead. citeturn3view1turn7search2

That doesn’t mean you can’t use nanoGPT, but it affects the “resource usage relatively low” and “educational” positioning:

- **nanoGPT’s quick start is educational-adjacent but still assumes GPU is normal for meaningful speed**, even if it begins with a tiny Shakespeare character baseline. citeturn3view1  
- **makemore is closer to your CPU-first aspirations** (minimal requirements, simpler training loops, and a clean ladder up to a Transformer). citeturn3view0

A practical refinement is to pick *one canonical codebase* for the series’ “spine” and treat the others as optional sidebars. If the point of Part 3 is to set up Parts 4–6, the “spine” should be the easiest place to modify architecture and training. makemore is explicitly designed to be hackable and educational, and it already presents the ladder “from bigrams all the way to a Transformer.” citeturn3view0

### A concrete Part 3 structure that better serves Parts 4–6

Instead of “cover everything,” consider framing Part 3 as *three conceptual deltas*, each with one or two annotated code passages and one “sanity experiment”:

1. **Counting → learned model** (bigram table vs learned weights): how log-likelihood becomes a training objective; why sampling works. citeturn3view0  
2. **MLP LM → stable deep training**: why activation/gradient stats matter; what BatchNorm is doing; what to inspect when training becomes fragile. citeturn3view2  
3. **Local computation → attention (Transformer)**: what attention changes about “where computation happens” and why it is a modular spot for routing and tool tokens. citeturn3view0turn6search2  

This lets you keep the post “dense in insight but light in compute.” It also makes a clean promise: Part 3 is not “Karpathy walkthrough”; it’s “the minimum viable fluency to start doing controlled experiments.”

## CPU-first reproducibility and low-resource design principles

If “CPU-only replication” is a top goal, your series should treat compute budget as a first-class design dimension, not a footnote. You can explicitly position Parts 4–6 as “conditional computation under a budget,” which is philosophically consistent with both MoE and tool use.

### Make the baseline deliberately tiny and explicit

Two source-backed points you can leverage:

- makemore is explicitly positioned as “not too heavyweight… one hackable file… educational purposes… PyTorch is the only requirement.” citeturn3view0  
- nanoGPT’s Shakespeare character quickstart explicitly describes downloading the dataset as a single ~1MB file and using a provided config for a “baby GPT.” citeturn3view1  

From these, you can enforce a “baseline spec” for all posts (example): character-level tokenization, ≤1–5MB total training text, and a model small enough that a few thousand iterations is demonstrably runnable on CPU.

### Make “evaluation” small but real

The plan currently leans on qualitative questions (“does specialization emerge?” “can a small model think?”). Those are great prompts, but you’ll want at least one *quantitative* metric per part to avoid handwaving:

- **Train/val loss curves** and a fixed sampling prompt set for generation. citeturn3view1turn3view0  
- For routing/tool experiments: **fraction of tokens routed to each expert**, **load balance**, and **computation per token** (even if you measure it as wall-clock + counts rather than FLOPs). MoE papers emphasize routing/router design complexity and stability as a core issue, so showing these charts—even on toy scale—anchors the reader in reality. citeturn1search1turn1search0  

### Use “diffs” rather than “reimplementation” to preserve your educational intent

Your “do not reproduce code” principle is compatible with making Parts 4–6 readable and reproducible by publishing patches:

- Show minimal diffs against the baseline (e.g., `git diff` excerpts) rather than reprinting entire files.
- Link to upstream code and clearly label what changed.

This keeps legal/ethical posture clean while still letting readers reproduce results locally, and it reinforces the “extend the codebase” goal you stated. citeturn3view0turn3view1

## Mixture-of-Experts model

Your Part 4 goal (“keep it small and interpretable—understanding, not benchmark scores”) is exactly the right framing for MoE. It also matches the historic motivation of MoE: conditional computation via a gating network selecting a sparse set of experts per input. citeturn1search0turn1search1

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["mixture of experts transformer routing diagram","switch transformer mixture of experts diagram","transformer self attention architecture diagram"],"num_per_query":1}

### The key critique: “specialization emerges” needs the right dataset design

If you train on a single homogeneous corpus (e.g., only Shakespeare characters), you might not get meaningful “domains” for experts to specialize into, and the routing signal can collapse to arbitrary partitioning (or to a single expert) unless you add explicit regularization. The Switch Transformer paper highlights that adoption has been hindered by training instability and routing complexity; their contribution is partly about simplifying routing and stabilizing training. citeturn1search1turn1search9

A low-resource fix is to **manufacture domains** while staying tiny:

- Mix 2–3 mini-corpora (e.g., names, arithmetic strings, tiny code snippets) into one training stream, and keep a held-out validation set per domain.
- Then ask: *does gating correlate with domain?* This is much more determinative than “it feels like experts specialize.”

This lets you answer your own question (“can you see experts learning different domains?”) with a simple confusion-matrix-style analysis based on routes, not subjective samples.

### A CPU-friendly MoE design that maps to the literature

To stay interpretable and close to the canonical story:

- Put the MoE where modern MoE Transformers do: replace the MLP/FFN block with an MoE-FFN and use top-1 (or top-2) routing.
- Add a load-balancing objective or routing regularizer; classic MoE work explicitly relies on gating design and training tricks to avoid collapse and imbalance. citeturn1search0turn1search1  

Even if you don’t fully replicate large-scale MoE behavior, readers will learn the *real* moving parts: gating logits, sparse dispatch, expert capacity, and stability.

### What you should promise (and not promise)

What you can reasonably promise on CPU toy scale:

- You can show conditional computation mechanics and visualize routing patterns.
- You can illustrate failure modes (expert collapse, imbalance) and how stabilizers help. citeturn1search1turn1search0

What you likely should *not* promise:

- That “emergent specialization” will look like large production MoEs (the large-scale motivation includes distributed parallelism and high parameter counts). citeturn1search1turn1search0

If you frame Part 4 as “MoE as conditional computation primitives,” it becomes a clean stepping stone to Parts 5–6.

## “Thinking” from architecture

Your Part 5 ambition is interesting, but it’s the most likely to disappoint readers if framed anthropomorphically (“Can a small model learn to think before answering?”). The best-known chain-of-thought result is: providing intermediate reasoning steps in prompting can dramatically improve performance—but these reasoning abilities are described as emerging in sufficiently large models, and the headline results are shown at very large scales (hundreds of billions of parameters). citeturn1search3turn1search31

### A better framing for CPU-scale experiments: “adaptive computation” and “deliberation under budget”

Instead of “thinking,” consider framing the technical mechanism as “the model learns when to spend more computation,” which has deep precedent:

- Adaptive Computation Time (ACT) lets a network learn how many internal steps to take and includes a cost term to discourage infinite pondering. citeturn2search0turn2search24  
- Early-exit Transformer work and related dynamic-halting lines of research explicitly target reducing compute by exiting earlier when confident. citeturn2search33turn2search29  

This is also philosophically consistent with your Part 6 “economics of tool use” theme: both are about spending compute only where it buys accuracy.

### A practical toy task suite where “intermediate steps” are measurable

If you want to test “scratchpad-like” computation in a way that works for small models:

- Use algorithmic / synthetic tasks (addition, parentheses matching, sorting-style sequences), as ACT’s original evaluations include parity, logic, addition, sorting, and even character-level LM tests. citeturn2search0  
- Define success as: accuracy vs the *measured compute* (number of recurrent passes, halting steps, or MoE routing depth). citeturn2search0turn2search33  

That gives you a clean plot: “more compute helps more on harder inputs,” which is exactly what ACT reports as an interpretable signal (“more computation allocated to harder-to-predict transitions”). citeturn2search0

### How MoE interacts with “thinking” in a crisp way

Your hypothesis (“does the model route ‘hard’ problems through more computation?”) becomes much more testable if you decide what “more computation” means:

- Route hard inputs to a “deep expert” (more layers) vs easy inputs to a “shallow expert.”
- Or route to “pondering steps” that add recurrent depth.

This turns Part 5 into a controlled conditional-computation experiment rather than a vague intelligence claim, and it sets you up for Part 6’s routing-to-tools story. citeturn1search0turn2search0

## Tool use and the economics of tool use

This part is thematically excellent, but one of your premises needs updating: tool-augmented systems *are* heavily explored and increasingly productized, even if the dominant public narrative still focuses on scaling model parameters.

### Tool use is not a niche idea

Several lines of work directly support your framing:

- Toolformer explicitly trains a language model to decide **which APIs to call, when, and with what arguments**, using self-supervision from a small number of demonstrations; it includes tools like a calculator, Q&A systems, search engines, translation, and a calendar. citeturn6search4turn6search12turn0search2  
- Retrieval-Augmented Generation (RAG) is a canonical “external memory/tool” approach: it combines a parametric generator with non-parametric retrieval over a Wikipedia index, motivated by limitations in purely parametric knowledge and the desire for updatability/provenance. citeturn2search2turn2search6  
- ReAct explicitly interleaves reasoning traces with actions that consult external sources (e.g., Wikipedia APIs), reporting reduced hallucination/error propagation in knowledge-intensive tasks. citeturn2search3turn2search7  
- Self-RAG addresses your “don’t retrieve unless needed” principle directly by training a model to retrieve *on demand* and to generate “reflection tokens” that control retrieval and critique. citeturn4search0turn4search8turn4search12  
- In production tooling, entity["organization","OpenAI","ai research lab, us"] explicitly documents “tool calling” flows (request with tools → model emits tool call → application executes → send tool output back → model responds). citeturn4search3turn4search11  

So, rather than “why isn’t this dominant,” a more researchable question is: **what prevents tool use from being the default for every token?** The literature suggests concrete constraints: retrieval/tool calls can introduce irrelevant context, latency, and failure modes; indiscriminate retrieval can degrade generation, motivating adaptive decisions about whether retrieval is necessary. citeturn4search0turn2search2

### Interpreting the “Bitter Lesson” angle carefully

Invoking entity["people","Rich Sutton","reinforcement learning researcher"]’s “Bitter Lesson” is a great rhetorical move, but it can cut both ways:

- Sutton argues that general methods that scale with compute tend to win in the long run, and he explicitly critiques “building in how we think we think.” citeturn1search2turn1news44  
- Tool use can be framed as *more scalable* than memorizing everything in weights (external memory and verifiable computation), which is compatible with “scaling general methods,” not necessarily opposed to it. RAG’s motivation is precisely that parametric memory alone has limitations and is hard to update. citeturn2search2turn2search6

A strong Part 6 essay move would be: “Tool use is not anti-scaling; it’s scaling a different resource (external compute + external memory) and forcing an economic decision about when to pay that cost.”

### Your “dream/adversary” idea: how to make it testable and CPU-friendly

Your adversarial divergence test—“if the adversary can’t find cases where tools differ from the model’s prediction, discourage tool use”—is conceptually close to the “retrieve on demand only when needed” direction that Self-RAG and related “when to retrieve” work points at. citeturn4search0turn4search13

To make it runnable on CPU in a blog post, reduce it to a toy tool:

- Let the “tool” be a deterministic calculator (or a tiny lookup table).
- Create a dataset with a mixture: some queries are trivial for the model to memorize, others require exact arithmetic/lookup.
- Train a policy token like `<CALL_TOOL>` vs `<NO_TOOL>`, and impose an explicit cost term for calling the tool (mirroring ACT’s “ponder” cost). citeturn2search0turn6search4  

Then your “adversary” can be as simple as: search for prompts where the model’s no-tool answer diverges from tool output, and upweight those in training. This is dramatically cheaper than “full Toolformer” but still illustrates the economic principle.

### Connect back to routing cleanly

You already noticed the conceptual unification: expert routing and tool use are both *routing decisions*—one to internal subnetworks, one to external systems. That meshes with both classic MoE framing (sparse gating selects experts per example) and modern “cost-aware routing” research directions that explicitly route prompts to cheaper models when possible. citeturn1search0turn4search2

## Series-wide improvements that would raise clarity without raising compute

A few editorial and experimental choices can make the series noticeably stronger while staying low-resource:

First, make “what codebase do we extend?” explicit. If you stick to makemore as the hackable base (and treat nanoGPT/nanochat as optional excursions), Parts 4–6 will feel like a coherent research notebook rather than three unrelated projects. makemore’s design goal is explicitly “hackable” and educational, with a path up to Transformer models. citeturn3view0

Second, when you reference nanoGPT, acknowledge its status as of Nov 2025 (“old and deprecated”) and treat it as a historically influential minimal repo rather than “the future.” If you want a modern Karpathy “full stack” reference, nanochat exists and is MIT-licensed, but it is oriented to single-GPU training economics rather than CPU-only reproduction. citeturn3view1turn7search0turn7search1

Third, commit to a “toy benchmark pack” that you control (small, CPU-friendly, and designed to reveal the phenomenon):

- A domain mixture dataset for MoE routing.
- An algorithmic suite for deliberation/adaptive computation.
- A tool suite with a deterministic calculator + retrieval over a tiny local corpus.

This mirrors the motivation of the tool and retrieval literature—use external systems when parametric computation is insufficient—and will keep your conclusions grounded. citeturn2search2turn6search4turn4search0

Finally, keep your conceptual messaging aligned with what the sources actually support:

- Use “conditional computation” and “adaptive compute under budget” as the spine (MoE → pondering/early-exit → tool calls), which has strong precedent across MoE and adaptive computation work. citeturn1search0turn2search0turn2search33  
- Be cautious with “small models learning to reason like humans”; the chain-of-thought literature is compelling, but it explicitly emphasizes emergence at scale under prompting, so your CPU experiments should be framed as *mechanisms and tradeoffs*, not as a miniature reproduction of frontier LLM reasoning. citeturn1search3turn1search31