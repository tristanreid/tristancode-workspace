---
title: "Hashing — Turning Anything into Random Coin Flips"
description: "How hash functions produce uniformly random bits, and why that makes HyperLogLog work on any dataset."
weight: 21
series: "HyperLogLog: Counting Unique Items the Clever Way"
skin: stochastic
---

In [Part 1](/blog/hll-counting-unique-items-part1/) we discovered a beautiful idea: if a crowd of people each flip a fair coin until they get heads, the longest streak of tails reveals approximately how many people are playing. And we saw that it's the same as counting leading zeros in a random binary string.

But then we made a claim that deserves more scrutiny: *a hash function turns any data into a random-looking binary string.* That's a big claim. What does it actually mean? And why should we believe it?

This post is about that claim — and about a critical property that makes HyperLogLog work on *any* dataset, regardless of what your data looks like.

---

## What Is a Hash Function?

A hash function is a machine that takes any input — a string, a number, a file, anything — and produces a fixed-length number. Always the same length, no matter how big or small the input.

The important properties:

1. **Deterministic**: the same input always produces the same output. Hash `"hello"` today, hash it tomorrow — same number.
2. **Fixed-size**: every output is the same size (for example, 32 bits — a number between 0 and about 4.3 billion).
3. **Uniform**: the outputs are spread evenly across the entire range, even if the inputs aren't.
4. **Avalanche**: a tiny change in the input produces a completely different output.

The first property is what gives HyperLogLog its "no double-counting" superpower — the same item always maps to the same hash, so duplicates are automatically ignored.

But it's properties 3 and 4 that make the coin-flipping metaphor *actually work*. Let's see them in action.

---

## See It Yourself

Type anything into the box below. The component computes its hash and shows the result in hexadecimal and binary. The leading zeros — the coin-flip "streak" — are highlighted.

{{< interactive component="hash-explorer" >}}

Try typing `hello`, then `hello!`, then `hellp`. Notice how a single character change produces a completely different hash — a completely different binary string, with a completely different number of leading zeros.

---

## The Avalanche Effect

This is the key property, and it's the one that surprises most people.

You might expect that similar inputs would produce similar hashes. After all, `"1"` and `"2"` differ by just one character. Surely their hashes are... related?

They're not. At all.

{{< interactive component="avalanche-demo" >}}

The inputs are perfectly sequential — 1, 2, 3, 4, ... — but the leading-zero counts jump around with no pattern. There's no trend, no correlation, no relationship. The hash of `"1"` tells you *nothing* about the hash of `"2"`.

This is called the **avalanche effect**: changing even a single bit of the input flips roughly half the bits of the output. It's what makes a hash function behave like a random number generator — except it's entirely deterministic.

---

## Every Bit Is a Fair Coin

A good hash function distributes its outputs uniformly across the entire range. For a 32-bit hash, that means every number between 0 and 2<sup>32</sup>−1 is equally likely.

What does this mean for individual bits? If the output is uniform, then each bit of the hash is equally likely to be 0 or 1. That's a fair coin flip.

So when we say "hashing turns data into coin-flip sequences," it's not a metaphor — it's literally what's happening. Each bit of the hash is an independent, fair, binary random variable. Tails (0) or heads (1).

And *that's* why counting leading zeros works: the probability of seeing *k* leading zeros in a hash is exactly (1/2)<sup>k</sup> — the same as getting *k* tails in a row before the first heads.

---

## Why Input Distribution Doesn't Matter

This is the punchline, and it's worth pausing on.

Imagine three very different datasets:

- **Sequential integers**: 1, 2, 3, ..., 1000
- **Random UUIDs**: `a3f2b71c-...`, `9e81d4a0-...`, ...
- **English words**: "apple", "banana", "cherry", ...

These look nothing alike. The integers are perfectly ordered. The UUIDs are already random. The words are short, variable-length strings with lots of repeated letters.

But after hashing, *they all look the same*. Every hash is a uniformly random 32-bit number. The leading-zero counts follow the geometric distribution — exactly like coin flips — regardless of what the original data looked like.

The hash function is the great equalizer. It erases all structure in the input and replaces it with uniform randomness.

This is why HyperLogLog works on *any* dataset. It doesn't matter if your items are user IDs, IP addresses, search queries, or anything else. The hash function ensures that the statistical assumptions hold.

---

## The Three Properties HLL Needs

Let's recap what hash functions give us — exactly the three properties that HyperLogLog needs:

1. **Deterministic**: same item → same hash → same register → automatic deduplication. No item is counted twice.
2. **Uniform**: every bit is a fair coin flip → the leading-zero distribution follows the geometric law → the estimator is unbiased.
3. **Independent** (avalanche): similar items → unrelated hashes → no systematic bias. Sequential data doesn't break the algorithm.

With these three properties in hand, the coin-flipping game from Part 1 becomes a real algorithm — one that works on any dataset, at any scale.

---

In [Part 1](/blog/hll-counting-unique-items-part1/) we saw how the longest coin-flip streak estimates crowd size — and how the single-max estimator is wildly unstable. Now we know *why* hashing makes this work on real data.

Next, we fix the instability problem.

---

*Next: [Splitting the Crowd — How HyperLogLog Tames Randomness](/blog/hll-splitting-the-crowd/)*

*Previous: [The Longest Streak — Estimating Crowd Size from Coin Flips](/blog/hll-counting-unique-items-part1/)*
