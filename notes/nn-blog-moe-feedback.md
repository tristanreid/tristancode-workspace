Here’s critical feedback focused on (1) technical correctness, (2) experimental rigor/interpretation, and (3) how well the post teaches the idea.

## What’s working well

* **Clear motivation → mechanism → experiment → failure mode**. The narrative arc is strong: “why conditional compute,” then “how routing works,” then “what happens,” then “collapse + fix.”
* **You picked a good toy setting** (mixed domains) where specialization *could* plausibly emerge. Many MoE demos skip this and then “discover” arbitrary partitions.
* **You’re honest about outcomes** (MoE not winning test loss). That’s rare and builds trust.

That said, there are a few places where tightening the claims and the methodology will make the post feel much more solid.

---

## 1) The “active parameters per token” table is misleading (and likely wrong)

This is the biggest technical issue in the post.

You write:

> MoE (4 experts, top‑1) has ~175K total params, but ~56K active per token (~32%)

But in the architecture you describe, **each token still goes through one full FFN per layer**—it’s just *one of several copies*. That means:

* The **FFN compute per token** in top‑1 MoE is roughly **the same as the dense baseline FFN compute** (plus router overhead + scatter/gather overhead).
* The *fraction of expert parameters* used per token is 1/4, sure—but the *total active params in the forward pass* (shared transformer + selected experts) is not smaller than the dense baseline in the way your table implies.

If you want to keep the table, I’d recommend re-framing it as one of these instead:

### Option A: “Expert-parameter utilization”

| Model               | Total expert params | Expert params used per token |
| ------------------- | ------------------: | ---------------------------: |
| Dense FFN           |                   X |                     X (100%) |
| MoE 4 experts top‑1 |                  4X |                      X (25%) |
| MoE 4 experts top‑2 |                  4X |                     2X (50%) |

…and separately state: **overall block FLOPs are ~dense (top‑1) or ~2× FFN FLOPs (top‑2)**, ignoring routing overhead.

### Option B: report FLOPs (even approximate)

Readers usually interpret “active parameters” as “compute,” and those aren’t the same thing. A quick “rough FLOPs per token” estimate would prevent confusion.

---

## 2) Your reported train/test losses have a red flag

In your results table, the dense baseline has:

* Train loss **1.437**
* Test loss **1.432** (better than train)

That can happen (e.g., if train loss includes dropout noise but eval doesn’t, or train loss is averaged differently), but it’s uncommon enough that it will make careful readers wonder if there’s an evaluation mismatch.

Concrete fixes:

* Ensure you compute train loss with `model.eval()` (no dropout) on a **held-out slice of the train set**, so train/test are comparable.
* Or explicitly label it “train (during training, with dropout)” vs “eval train (no dropout).”

Right now, it subtly undermines confidence in the rest of the metrics.

---

## 3) The interpretation “dense baseline wins” is too strong given the tiny deltas

You conclude the dense baseline “wins on test loss,” but the differences are small:

* 1.432 vs 1.434 vs 1.436 vs 1.453

With only **one run** (as written), that’s well within “could be seed noise.” You don’t need to add a bunch of complexity, but one of these would make it defensible:

* Run **3 seeds** and report mean ± std.
* Or at least say: “In this run, the dense baseline slightly edged out the MoE variants.”

This matters because one of your big teaching points is “MoE doesn’t help quality at this scale,” which is plausibly true—but the evidence as presented isn’t quite strong enough yet.

---

## 4) Load-balancing section: clarify what exactly you’re measuring (and resolve an internal tension)

You show two kinds of routing stats:

1. During training (with aux loss): nearly perfect uniform expert fractions (~0.25 each).

2. Post-training domain routing (Layer 1): distributions like arithmetic **0.40/0.39/0.12/0.10**, which are very non-uniform.

Both can be true *if*:

* (a) the “uniform” numbers are computed **across the full mixed stream**, and
* (b) token counts per domain are skewed enough to offset domain-level skew

…but as written, it reads contradictory.

Actionable improvements:

* Explicitly state whether routing stats are:

  * **hard assignments** (top‑1 indices), or
  * **mean router probabilities** (softmax averages)
* Report routing balance **per layer** (since you later analyze per layer).
* If you log “uniform,” show the same metric you later analyze (don’t mix “probabilities” in one place and “assignments” in another without saying so).

Also: your aux loss formula is correct in spirit, but I’d add one sentence like:

> “This encourages both *importance* (average probability mass) and *load* (actual assignments) to be balanced.”

Because readers new to it won’t understand why you multiply *two* terms.

---

## 5) Routing explanation: mention the key “gotcha” about differentiability

You currently imply:

* Router produces probs
* You take top‑k
* Done

But one of the most educational “aha” details is:

* **Top‑k selection is non-differentiable wrt the discrete choice**, so gradient only flows through the selected experts/routes (and usually through the selected gate values).

You don’t need to go full math, but a short callout box helps:

* *“Note: the router learns via gradients through the softmax scores of the selected experts; unselected experts get no gradient signal for that token.”*

Also, for top‑k, you say outputs are combined using “normalized gating probabilities,” but you don’t show the renormalization step. Many readers will copy/paste the snippet and silently get it wrong.

---

## 6) Experimental design: you need 2–3 more details for this to be reproducible and interpretable

Right now, a reader can’t really replicate your results or reason about why they happened.

Minimum additions that would dramatically improve rigor:

* **Batch size**, **sequence length / block size**, optimizer, LR schedule, weight decay, dropout.
* How you split train/test and whether the split is stratified by domain.
* Whether the mixture is balanced by **examples** (you say 8k/8k/8k) or by **tokens** (which may not be balanced if code strings are longer).

That last one is especially important for MoE because load balancing is token-based.

---

## 7) Your evaluation metric is too “single-number” for the claims you want

Because your whole post is about specialization, you should measure specialization outcomes directly, not only overall loss.

I’d add at least two of these:

### A) Per-domain test loss (or perplexity)

If MoE helps “math-ish tokens” but hurts names, the aggregate can hide it.

### B) Arithmetic accuracy

You already point out the model learns the *format* not the *math*. Great! But you can quantify it:

* percent of expressions where the RHS is correct (for each operator, and maybe by number of digits)

That would make this section much stronger, and it naturally connects to your later “adaptive computation” theme.

### C) A specialization score (simple, not fancy)

For example:

* Jensen–Shannon divergence between routing distributions across domains
* Mutual information between {domain} and {expert id}
* Or even a confusion-matrix style chart of expert choice by token type (digit vs letter vs operator)

Right now the routing tables are interesting, but they invite the question: “Are those differences meaningful?”

---

## 8) Generated samples: add sampling settings, and be careful attributing artifacts to expert starvation

The samples section is fun and readable, but for a technical audience you should include:

* temperature, top‑k/top‑p, prompt format (if any), max length

Also, you attribute a malformed code snippet in the no-aux model to weaker experts. That’s plausible, but not clearly supported from a single snippet.

A stronger version would be:

* show **rate** of syntax-valid code (even a crude heuristic like “contains `:` after `if/for/def`” and balanced parentheses),
* and correlate it with expert utilization.

---

## 9) Pedagogy improvements: one great diagram would 10× clarity

You already have ASCII flow lines, but MoE is one of those topics where a visual “dispatch / combine” diagram is worth it.

Even a simple picture showing:

* token hidden states → router logits → top‑1 indices
* scatter tokens into per-expert mini-batches
* run expert FFNs
* gather back to original order

…would prevent a lot of misunderstandings (and would also force the forward-pass code to be explicit, which helps catch bugs like “accidentally compute all experts anyway”).

---

## 10) Small copy/structure nits that would tighten the post

* Early on, you say “the attention layer is already selective.” True in a weighting sense, but it’s not *conditional computation* in the same sparse-activation way. A single clarifying clause avoids a pedant derail: attention is selective in *content*, not in *which parameters execute*.
* The line “At production scale… hundreds of billions… runs at cost of much smaller model” is directionally right, but it’s worth adding one sentence acknowledging that **routing introduces overhead and communication costs**, and that the win depends on distributed placement.
* Consider adding a 4–6 line **TL;DR** after the intro:

  * MoE didn’t beat dense on test loss here
  * load balancing prevented collapse
  * router showed partial specialization
  * routing analysis suggests experts prefer token types/domains

---

## If you only change 3 things

1. **Fix/reframe the “active parameters per token” section** to avoid implying top‑1 MoE uses less compute than dense.
2. **Add reproducibility details + 3-seed averages** (or soften conclusions).
3. **Add per-domain metrics (and arithmetic correctness)** to match the post’s specialization thesis.

If you want, I can also propose an edited version of the parameter table + a short “Implementation gotchas” sidebar that matches your tone and keeps the post flowing.
