---
title: "Splitting the Crowd — How HyperLogLog Tames Randomness"
description: "How registers, sub-crowds, and the harmonic mean turn a noisy coin-flip estimate into a precise counting algorithm."
weight: 22
series: "HyperLogLog: Counting Unique Items at Scale"
series_weight: 40
skin: stochastic
---

In [Part 1](/blog/hll-counting-unique-items-part1/) we discovered a beautiful trick: estimate the size of a crowd by looking at the longest coin-flip streak. In [Part 2](/blog/hll-hashing-randomness/) we saw how hash functions give every item in a dataset its own deterministic, uniform, independent coin-flip sequence.

But we also saw a serious problem: the single-max estimator is *wildly* noisy. One lucky streak and the estimate doubles. One unlucky run and it halves. The estimates can only land on powers of two, and they scatter across a huge range.

So here's the question that drives HyperLogLog: **how do we keep the incredible memory efficiency of the coin-flip trick while getting a stable, reliable estimate?**

The answer is beautifully simple: split the crowd into smaller groups, let each group track its own record-holder, and combine the results with a clever kind of average.

---

## The One-Shot Problem

In Part 1 we ran hundreds of "trials" to see how wildly the single-max estimator varies. But remember what each trial actually represented: a *completely different hash function* applied to the same data. In the real world, you pick one hash function, process your data, and get one answer. You can't tell if you drew a lucky trial or an unlucky one.

If only we could run many independent experiments and average the results... but that would mean hashing every item many times with many different hash functions, which defeats the purpose of a streaming algorithm.

Here's the key idea behind HyperLogLog: **we can extract multiple independent experiments from a single hash**. The trick is to split the hash into two parts — one part to assign each item to a group, and the other part to measure its streak. Each group becomes its own independent mini-experiment, and we combine the results.

---

## Splitting the Crowd into Sub-Crowds

Imagine painting a colored armband on every person as they arrive — red, blue, green, yellow, and so on. The color is assigned deterministically based on the person themselves (so if someone shows up twice, they always get the same color). Now each color forms its own **sub-crowd**.

In practice, we use the first **p** bits of the hash to determine which sub-crowd a person belongs to. If we use p bits, we get **m = 2<sup>p</sup>** sub-crowds. The remaining **32 − p** bits of the hash — the rest of the person's coin-flip sequence — are used to measure the longest streak *within each sub-crowd*.

Each sub-crowd is called a **register** in HLL terminology. Every register stores a single number: the longest streak it has ever seen.

<div style="background: var(--blockquote-bg, rgba(249,115,22,0.04)); border-left: 3px solid var(--blockquote-border, #f97316); border-radius: 0 8px 8px 0; padding: 1rem 1.25rem; margin: 1.5rem 0;">

**A note on notation.** Throughout this series, we use **L** — the number of tails before the first heads (leading zeros). In the HLL literature you'll often see **ρ** (rho), which is the *position* of the first heads, counting from 1: **ρ = L + 1**. A hash starting `00010...` has L = 3 leading zeros (or ρ = 4). We stick with L because it maps directly to the coin-flip metaphor. The register display below shows each sub-crowd's max streak (L) and its local estimate 2<sup>L</sup>.

</div>

{{< interactive component="crowd-partition" >}}

Notice what happens as you increase p: the same people are there — the total dot count never changes. We're just slicing the crowd into finer groups. Each sub-crowd gets smaller, but there are more of them.

---

## The Trade-Off: More Experiments, Shorter Sequences

This is elegant, but it comes at a cost. We started with 32 bits of hash per item. By using p bits for the register assignment, we only have **32 − p** bits left for measuring the streak. With p = 4 (16 registers), each person's "coin-flip sequence" is 28 bits long instead of 32. With p = 10 (1,024 registers), it's only 22 bits.

Shorter sequences mean shorter maximum streaks, which means each *individual* register's estimate is less precise. But we have many of them now, and combining many imprecise estimates is far better than relying on one noisy one. This is the fundamental trade-off of HyperLogLog: **sacrifice streak length for the number of independent estimates**.

It's worth pausing on why this works so well. In the single-max approach, one lucky person can throw the entire estimate off by a factor of 2 or more. With registers, that lucky person only affects *their* sub-crowd — one out of m registers. The other m − 1 registers are unaffected. When we combine them, that one outlier gets diluted.

---

## Why Not Just Average the Estimates?

Each sub-crowd gives us a local estimate: 2<sup>max streak</sup>. The naive approach is to average all of them.

But consider what happens. Suppose we have 8 sub-crowds and their local estimates are:

> **4, 8, 8, 16, 8, 4, 8, 256**

That 256 is an outlier — one sub-crowd got lucky. The arithmetic mean is pulled up to **39**, far above the truth of roughly 8 per sub-crowd.

The core problem is the same one we saw in Part 1: the single-max estimate is exponentially volatile. One extra flip doubles the estimate. When you *average* these exponential estimates, the outliers dominate.

We need a kind of average that doesn't let one loud number shout over the rest.

---

## The Harmonic Mean to the Rescue

The **harmonic mean** is the answer. Instead of averaging the numbers directly, you average their *reciprocals*, then take the reciprocal of that:

<div style="text-align:center; margin: 1.5rem 0;">

**Harmonic mean** = *n* / (1/*x*₁ + 1/*x*₂ + ... + 1/*x*<sub>n</sub>)

</div>

Why does this help? The reciprocal of a huge outlier (like 1/256 = 0.004) is tiny, so it barely affects the sum. The harmonic mean naturally **down-weights** extreme values. For our example:

> Arithmetic mean of [4, 8, 8, 16, 8, 4, 8, 256] = **39**
>
> Harmonic mean of [4, 8, 8, 16, 8, 4, 8, 256] ≈ **7.8**

The harmonic mean stays close to the truth while the arithmetic mean gets pulled off course. Click "Re-generate" below to watch this play out with real register data:

{{< interactive component="mean-comparison" >}}

Each time you regenerate, the arithmetic mean bounces around unpredictably. The harmonic mean stays remarkably close to the true value. That's the magic of HLL.

The actual HyperLogLog formula is:

<div style="text-align:center; margin: 1.5rem 0;">

**E** = α<sub>m</sub> · m² · (∑ 2<sup>−M[j]</sup>)<sup>−1</sup>

</div>

This is essentially the harmonic mean of the register estimates, scaled by α<sub>m</sub> (a small bias-correction constant that depends on the number of registers). Don't worry about the exact formula — the intuition is what matters: *combine many noisy estimates using an outlier-resistant average*.

---

## The Payoff: Stability

This is the moment of truth. Let's put both estimators side by side. Each "trial" is an independent experiment: the same number of unique items, but a different hash function — simulating the range of outcomes you'd get from a single use of each algorithm. (Remember: in practice you only get one trial. This shows you the distribution of what that one trial might produce.)

{{< interactive component="stability-showdown" >}}

The contrast is dramatic:

- The **single-max estimator** (left) scatters across powers of two — estimates vary by orders of magnitude
- **HyperLogLog** (right) clusters tightly around the true value

Try increasing the number of registers (m) and watch the HLL histogram tighten even further. Try different crowd sizes to see that the effect is consistent whether you're estimating hundreds or tens of thousands.

---

## The Memory Trade-Off

Each register stores a single small number — the longest streak seen by that sub-crowd. Since streaks rarely exceed 30 or so (for 32-bit hashes), each register needs only about 5–6 bits.

The total memory is tiny:

| Registers (m) | Memory | Standard Error |
|:---:|:---:|:---:|
| 256 | 192 bytes | ~6.5% |
| 1,024 | 768 bytes | ~3.2% |
| 16,384 | 12 KB | ~0.8% |

The standard error follows a beautiful formula: **σ ≈ 1.04 / √m**. Double the registers, reduce the error by √2.

Compare this to exact counting: 1 billion unique 64-byte IDs would require ~64 GB of memory. HyperLogLog at 12 KB gives you ~1% error. That's a 5-million-fold memory reduction.

---

## Edge Cases and Corrections

The core algorithm handles most cases beautifully, but there are two edge cases worth knowing about:

**Small crowds**: When many registers are still empty (no one has been assigned to that sub-crowd yet), the harmonic-mean formula overestimates. HLL switches to **linear counting** in this regime — it counts the fraction of empty registers and uses that to estimate the crowd size. Think of it like walking through a parking lot: if most spaces are empty, you can estimate the number of cars from the fraction of occupied spaces.

**Enormous crowds**: With 32-bit hashes, once you approach ~4 billion items, hash collisions start to matter. The fix is simple: use 64-bit hashes to push this limit far out. Modern implementations like HyperLogLog++ do exactly this.

---

## Superpowers of HLL

Beyond basic counting, HLL has some remarkable properties:

**Merging crowds**: If you counted visitors on Monday and Tuesday separately (two HLL sketches), you can combine them by taking the element-wise max of each register. It's as if you counted both days together — no need to re-process the raw data.

Try it — set up two crowds with some overlap, merge their sketches, and see how the merged estimate nails the true union while the naive sum overcounts:

{{< interactive component="merge-demo" >}}

**No double-counting**: The same person always hashes to the same register with the same streak. Showing up twice doesn't inflate the count. This is built into the algorithm for free.

**Adjustable precision**: Choose your memory/accuracy trade-off at setup time. Need more accuracy? Use more registers. Memory tight? Use fewer. The trade-off is smooth and predictable.

---

## HLL in the Wild

HyperLogLog isn't just a theoretical curiosity. It's deployed everywhere:

- **Redis** — `PFCOUNT` / `PFADD` commands
- **BigQuery** — `APPROX_COUNT_DISTINCT`
- **PostgreSQL** — the `pg_hll` extension
- **Streaming systems** — Flink, Kafka Streams
- **Network monitoring** — counting unique IPs
- **Web analytics** — counting unique visitors

Wherever you need to count distinct things at scale and can tolerate a small error, HLL is probably the right tool.

---

## The Journey So Far

Let's step back and see how far we've come:

1. **Coin flips** — a person's streak of tails reveals something about crowd size
2. **Binary equivalence** — coin flips are just bits, and streaks are leading zeros
3. **Hashing** — every item gets a deterministic, uniform, independent coin-flip sequence
4. **Single-max estimator** — simple and memory-efficient, but hopelessly noisy
5. **Registers** — split the crowd into sub-crowds, each tracking its own record
6. **Harmonic mean** — combine register estimates in a way that resists outliers
7. **HyperLogLog** — the full algorithm: hash → partition → track maxes → harmonic mean → estimate

From one person flipping coins to counting billions of unique items with kilobytes of memory. That's the beauty of HyperLogLog.

---

If you want to build HLL yourself from scratch — with code, tests, and benchmarks — continue to [Part 4: Building HyperLogLog from Scratch](/blog/hll-building-from-scratch/).

---

*Next: [Building HyperLogLog from Scratch](/blog/hll-building-from-scratch/)*

*Previous: [Hashing — Turning Anything into Random Coin Flips](/blog/hll-hashing-randomness/)*
