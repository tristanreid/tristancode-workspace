---
title: "The Longest Streak — Estimating Crowd Size from Coin Flips"
description: "How a simple coin-flipping game leads to one of the most elegant algorithms in computer science."
weight: 20
series: "HyperLogLog: Counting Unique Items at Scale"
series_weight: 40
skin: stochastic
---

Counting the number of unique items in a massive dataset sounds straightforward — just keep a list of everything you've seen and don't double-count. But that list can get *huge*. If you're tracking a billion unique user IDs, each 64 bytes long, you need roughly 64 GB of RAM just for the set.

There's a better way. An algorithm called **HyperLogLog** can count billions of distinct items using roughly **1.5 kilobytes** of memory, with about 2% error. Personally, I've always found it to be one of the most beautiful tricks in computer science, and it starts with a coin-flipping game.

---

## Coin Flips Are Binary

Coin flips are binary. Every coin flip is a bit:

- **Tails** = `0`
- **Heads** = `1`

So a sequence of T, T, T, H is the binary string `0001`. And "how many tails before the first heads" is *exactly* "how many leading zeros before the first 1."

Try it yourself:

{{< interactive component="coin-binary" >}}

The coin-flipping game is the same as generating a random binary number and counting its leading zeros.

---

## The Coin-Flipping Game

Imagine a crowd of people — could be a hundred, could be a million, we don't know yet. Each person plays a simple game:

1. Flip a fair coin repeatedly until you get **heads**
2. Count how many **tails** you got in a row before that first heads
3. Report your number

In other words, if you flip a coin and immediately get heads, you report 0. If you flip a coin and get tails, you flip again and report how many tails you got in a row before the first heads.

If only a few people play, the longest streak anyone reports will probably be short — 0, 1, maybe 2 tails in a row. But if a million people play, someone is almost certainly going to get an impressively long run. 10 tails in a row. Maybe 15. Maybe more.

The probability of getting exactly *k* tails before the first heads is (1/2)<sup>k+1</sup>. Five tails in a row? That's a 1-in-32 shot. With about 32 people playing, you'd expect roughly one of them to pull it off. Ten tails in a row? One-in-1,024 — you'd need about a thousand people before you'd expect to see it.

**The key insight**: if the longest streak we observe is *L*, then a rough estimate of the crowd size is **2<sup>L</sup>**.

<div style="background: var(--blockquote-bg, rgba(249,115,22,0.04)); border-left: 3px solid var(--blockquote-border, #f97316); border-radius: 0 8px 8px 0; padding: 1rem 1.25rem; margin: 1.5rem 0;">

| Longest streak (*L*) | Probability of *L* tails in a row | Estimated crowd size (2<sup>L</sup>) |
|:---:|:---:|:---:|
| 0 | 1 in 1 | **1** |
| 1 | 1 in 2 | **2** |
| 2 | 1 in 4 | **4** |
| 3 | 1 in 8 | **8** |
| 4 | 1 in 16 | **16** |
| 5 | 1 in 32 | **32** |
| 6 | 1 in 64 | **64** |
| 7 | 1 in 128 | **128** |
| 8 | 1 in 256 | **256** |
| 9 | 1 in 512 | **512** |
| 10 | 1 in 1,024 | **1,024** |

If someone reports a streak of 7, that's a 1-in-128 long shot — so there were probably around 128 people playing. A streak of 10? About a thousand.

</div>

Try it yourself — press Play to let a crowd flip coins. The ★ marks the record holder:

{{< interactive component="coin-flip-crowd" >}}

---

## Why This Matters for Real Data

We need every item in our dataset (user IDs, URLs, search queries) to have its own random-looking coin-flip sequence. That's exactly what a **hash function** does: feed in any item, get out a uniformly random binary string.

Crucially, the *same* item always produces the *same* hash — so duplicates don't create new "players." Each unique item is like one person who walked up, flipped coins, and reported their streak.

But how do hash functions actually produce random-looking bits? And why does this work regardless of what your data looks like — whether it's sequential integers, random UUIDs, or names? We explore that in [Part 2: Hashing — Turning Anything into Random Coin Flips](/blog/hll-hashing-randomness/).

For now, the key point is this: the question "how many unique items?" becomes "how many people are playing?" And we already know how to estimate that: look at the longest streak.

---

## The Single-Max Estimator

This gives us a dead-simple algorithm:

1. For each item, compute its hash
2. Count the leading zeros in the hash
3. Track the longest leading-zero run seen so far
4. Estimate = 2<sup>max</sup>

This is essentially the algorithm Flajolet and Martin proposed in 1985. It uses almost no memory — just a single number.

But there's a problem. And it's a big one.

---

## The Instability Problem

How bad is the single-max estimator in practice? To find out, we need to understand what it means to run the experiment more than once.

Each "trial" below represents a completely independent experiment: the same 1,000 unique items, but hashed with a *different hash function* each time. Different hash → different coin-flip sequences for everyone → different longest streak → different estimate. It's as if the same crowd played the game over and over, with fresh coins each time.

The point of running many trials isn't something you'd actually *do* — in practice, you pick one hash function and get one answer. We run many trials here to see the **distribution**: the range of answers you *could* get from a single use of this estimator. Think of it as asking: "if I use this algorithm once, how far off might I be?"

{{< interactive component="max-streak-distribution" >}}

This is the fundamental problem: you get **one shot**. You pick a hash function, process your data, and get back a single power-of-2 estimate. You can't tell whether you drew a lucky trial or an unlucky one. And as you can see above, the difference between the two can be enormous.

We need a way to get multiple independent estimates from a *single* hash function. That's what [Part 3](/blog/hll-splitting-the-crowd/) is about — and the trick is surprisingly elegant.

And if you want to build HLL yourself from scratch, that's [Part 4](/blog/hll-building-from-scratch/).

---

*Next: [Hashing — Turning Anything into Random Coin Flips](/blog/hll-hashing-randomness/)*
