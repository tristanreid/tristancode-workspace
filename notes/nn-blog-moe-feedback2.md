Here’s critical feedback, aimed at making the post *more correct*, *more convincing*, and *more reproducible/pedagogically sharp*. I’ll be picky on purpose.

## What’s working well

* **Clear motivation and framing.** You set up “conditional computation” intuitively, and you’re careful to say MoE’s win is *capacity at fixed per-token compute* (for top‑1). That’s the right mental model.
* **Good experimental instinct.** Mixing domains so specialization has an obvious incentive is a strong teaching move.
* **You cover the real gotcha (collapse).** Calling out rich‑get‑richer dynamics early is exactly what a “from scratch” series should do.
* **You resist overclaiming on loss.** You explicitly say loss isn’t the interesting part here—routing is.

That said, there are a few places where the post risks misleading readers or leaving them unable to reproduce what you did.

---

## 1) Code snippets: there are correctness / completeness issues

### A. The “standard FFN” snippet has a likely bug / missing line

You show:

```python
self.mlpf = lambda x: m.c_proj(m.act(m.c_fc(x)))
```

…but `m` is never defined in the snippet. In Karpathy-style code, it’s usually:

```python
m = self.mlp
self.mlpf = lambda x: m.c_proj(m.act(m.c_fc(x)))
```

If a reader copy-pastes your snippet as-is, it breaks immediately. Even if this is “just illustrative,” it’s in the *Implementation* section, so readers will treat it as canonical.

**Fix:** include the `m = self.mlp` line or just write `self.mlp['c_proj'](...)` style explicitly.

### B. The MoE module is missing the part readers actually need

You define `MoEFFN.__init__` but don’t show:

* `self.top_k` assignment
* `forward()` implementation
* dispatching / gathering logic
* how you combine expert outputs back into the original `(B, T, C)` shape
* how you compute `f_i` (hard load) for aux loss (especially for top‑2)

This is the *core* of MoE engineering. Without it, readers can’t learn the important “shape gymnastics,” and they also can’t tell whether you computed conditional compute correctly (i.e., you didn’t accidentally run all experts and just mask them).

**Suggestion:** include a minimal `forward()` that is:

* correct for top‑1 and top‑2
* explicit about shapes
* explicit about whether you compute only selected experts or all experts

Even a “simple but slow” version is valuable pedagogically, as long as you clearly label it as such.

### C. Softmax → topk ordering: not wrong, but a missed teaching point

You do:

```python
router_probs = F.softmax(router_logits, dim=-1)
top_k_probs, top_k_indices = torch.topk(router_probs, self.top_k, dim=-1)
```

For top‑k *selection*, using logits is enough (softmax is monotonic). For large expert counts, people often:

* `topk(router_logits)` then
* softmax only over selected logits (cheaper, and matches “normalize selected experts” story)

At 4 experts it doesn’t matter, but this is a “from scratch” series—worth pointing out as the scalable pattern.

---

## 2) Load-balancing loss: your explanation is *almost* right, but slightly oversold

You write:

> “Minimizing their product encourages both to be uniform — you can't game it by making the soft probabilities even while the hard assignments are skewed, or vice versa.”

That “can’t game it” line is too strong.

* The *intuition* is right: it discourages the router from putting both “importance” and “load” on the same few experts.
* But mathematically, a dot product between two distributions can be small/large for multiple reasons, and the “no gaming” claim depends on assumptions about how `p_i` and `f_i` are coupled by the router and by tie-breaking/noise.

Also, it helps to state explicitly what the target value is. With `n` experts and `p=f=uniform`, you get:

* `sum_i f_i p_i = n * (1/n)*(1/n) = 1/n`
* `aux = n * (1/n) = 1`

So the “best” is ~1, not 0. That small clarity point helps readers debug.

**Recommendation:** tweak wording to:

* explain that it **penalizes concentration** (collapsed routing pushes the term toward `n`)
* acknowledge it’s a heuristic regularizer, not a perfect guarantee

Also: for **top‑2**, it’s unclear how you define `f_i`:

* count a token for each of its selected experts? (then total “load” sums to 2, unless you renormalize)
* count only the top‑1 choice?
* use gating weight as fractional load?

Your later top‑2 routing table sums to ~1, which suggests you’re reporting **average gating weight**, not **assignment frequency**, but you describe it as “concentrates nearly half its tokens there (48%).” That’s ambiguous: is that *weight mass* or *token assignment probability*?

**Fix:** explicitly define what those routing fractions mean in each table:

* “fraction of tokens whose top‑1 expert is i”
* or “fraction of total gating weight assigned to expert i”
* or “fraction of tokens where expert i appears in top‑k”

They’re all defensible, but they’re not interchangeable.

---

## 3) Your “specialization” story might be confounded by *token-type routing*

Right now, the post frames specialization as “domain → expert.” But since this is **character-level** and the domains differ strongly in character distribution, a simpler explanation is:

> The router learns *character-class* specialization (digits/operators vs letters vs punctuation), not “math logic vs phonetics.”

This is especially important because:

* Names are mostly `[a-z]`
* Arithmetic is mostly `[0-9 +-* =]`
* Code mixes both plus punctuation (`() : >` etc.)

So you can get “domain specialization” *for free* just by routing on character class, without learning anything “semantic.”

This doesn’t make the results bad—but it changes what the results *mean*.

**Concrete improvement:** add one analysis that breaks routing down by token class:

* digits
* letters
* operators
* punctuation / delimiters

If Expert 2 is an “arithmetic expert,” you’d expect it to route **digits and operators** even inside code, not just “arithmetic examples.” If it only lights up on arithmetic *sequences*, that’s different.

Even better: show a single sequence with per-position expert assignment as a little sparkline/heatmap. That would be incredibly instructive.

---

## 4) Experimental design: a few tweaks would make conclusions stronger

### A. Add a “dense, parameter-matched” baseline

Right now, the core empirical message is:

* MoE has ~3× parameters but similar loss.

A reader may conclude: “extra parameters didn’t help.” But MoE optimization is different; you’re also changing routing dynamics and regularizing with aux loss.

Add one more baseline:

* a dense model with roughly the **same parameter count** (e.g., larger `n_embd` or larger FFN width)
* trained with the same steps/tokens

This tells readers whether the limiting factor is:

* “more parameters don’t help at this scale,” or
* “MoE makes optimization harder vs just making the dense model bigger.”

Even if you don’t run it, mentioning it as the “next control experiment” strengthens your scientific posture.

### B. Stratify the test split by domain (or at least report the counts)

You say the split is “random, not stratified by domain,” and the test set is only 1,500 examples. That’s small enough that domain proportions could drift.

Even if it doesn’t matter much, it’s an easy win:

* stratify by domain
* or report domain counts in the test set

### C. Report variance where you already invoked seeds

You correctly do mean ± std for overall test loss across 3 seeds, but then per-domain losses have no variance. That makes them feel less “real,” even if they’re stable.

Similarly, the routing tables look like single-run snapshots. Are those averaged across seeds? One seed? One checkpoint? (You mention “after training,” but not whether it’s averaged.)

**Suggestion:** one line per routing table:

* “averaged across seeds” or “seed=42”
* “measured at step 20,000”
* “measured over N tokens”

### D. “Collapse” vs “skew”

Your no-aux-loss model ends up at ~60% / ~11–14% / ~11–14%. That’s definitely unhealthy utilization, but it’s not the classic “one expert gets ~99%.”

Calling it “collapse” is defensible in spirit, but some readers will nitpick.

**Suggestion:** call it **routing skew / partial collapse** and reserve “full collapse” for near-single-expert.

---

## 5) Results interpretation: a few places to tighten claims

### A. Why the no-aux model is “marginally best”

You attribute the slight edge to concentrating tokens on the best expert. That’s plausible, but there’s another obvious reason:

* you removed a regularizer term (aux loss), so the model optimizes the main objective more directly.

Those are related but not identical explanations. A reader could reasonably ask: “is the improvement because of expert concentration, or just because you stopped penalizing the router?”

**Suggestion:** compute and report “effective number of experts” (e.g., perplexity of the expert distribution or exp(entropy)) and correlate it with loss. That would support your interpretation quantitatively.

### B. Arithmetic “close” outputs: be careful

You write the model “gets close” on arithmetic (right digits and rough magnitude). That’s often true, but the examples shown include large errors too. Since you *measured* correctness at 0–3%, you can easily add a more objective “closeness” metric, like:

* mean absolute error of the numeric result (for valid parses)
* percentage with correct number of digits
* exact-match on operator and `=` placement

That would make the “close” claim evidence-backed rather than anecdotal.

### C. Generation settings: “top-k” term collision

You say “no top-k filtering,” but earlier “top‑k” refers to **top‑k experts**. This is a small but real ambiguity for readers.

**Fix:** rename sampling bit to “no top‑k *sampling* filter” or just say “unfiltered multinomial sampling.”

---

## 6) Pedagogical upgrades that would make this post land harder

If you do *only three* improvements, I’d pick these:

1. **Show the MoE forward pass** (even if slow) with shapes and comments.
   This is what readers came for.

2. **Add token-class routing analysis** (digits/letters/operators) to validate “domain specialization” vs “character specialization.”

3. **Add one visualization**:

   * expert usage over training steps (lines)
   * and/or per-position expert assignment on a few representative sequences

Those would turn the routing section from “trust me” to “I can see it.”

---

## 7) Minor style/structure notes

* The post is long, but the pacing mostly works. One place to tighten is repeating “capacity not efficiency” in multiple spots—consider one canonical explanation and then refer back to it.
* When you name-drop Switch / DeepSeek, it would help to link to the specific paper/model writeup you mean (DeepSeek has multiple MoE-related releases, and readers will want the exact reference).
* Your “Honest Gap” section is great; consider adding one more bullet: **router regularization** (z-loss / entropy / noise), since that’s a major real-world piece you didn’t implement.

---

## Bottom line

As a conceptual post, it’s strong. As an *implementation + experiment* post, it’s very close—but it needs:

* a correct/copyable baseline snippet,
* an explicit MoE forward path,
* clearer definitions for routing metrics (especially top‑2),
* and one analysis to rule out the “it’s just routing on digits vs letters” confound.

