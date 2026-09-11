---
title: "Three Stale Uses Beat One Fresh One"
description: "d is an exponent applied per use, not a per-use decay counter — sum the power-law term across every past retrieval and the naive answer flips."
lesson_number: 15
track: cog
concept: "ACT-R base-level activation: summing decay across every past use"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [9, 10]
skin: chalkboard
numeric:
  question: "What is chunk B's base-level activation, summing the power-law term across all three of its past uses (d = 0.5)?"
  answer: 0.445
  tolerance: 0.02
---

**Retrieval check (from lesson 2, new setting).** Working memory holds about seven items,
plus-or-minus two — but a **chunk** (lesson 2's term: a group of raw items recoded as one familiar
unit, with the pattern itself stored in long-term memory) lets you fit far more content into that same
small number of slots. An engineer glances at the IPv4 address `192.168.1.100` and holds it easily.
Read as twelve individual digits, that's over budget for working memory. Chunked the way every network
engineer actually reads it — by octet, the dot-separated groups — how many chunks is it? Work it out;
the solution confirms it.

---

### Back to activation

Lesson 9 introduced **activation** — a number capturing how easily a declarative chunk (a fact, in
ACT-R's terms) can be retrieved right now. Lesson 10 gave the single-use formula:

> B = −d · ln(t)

where **t** is time since the chunk was last used, and **d** is a **decay rate**, ACT-R's default
**d = 0.5**. That formula is exact for a chunk used exactly *once*. It is not the general formula, and
reading `d` as something that "happens once per use" — a counter that ticks up with each retrieval —
is a natural but wrong generalization. **d is an exponent applied to elapsed time for a single use; it
does not accumulate or count uses at all.**

The real formula sums a power-law term across **every past use** of the chunk:

> B = ln( Σᵢ tᵢ^(−d) )

where the sum runs over every time the chunk was retrieved, tᵢ is how long ago *that particular* use
happened, and each use contributes its own term **tᵢ^(−d)** to the sum inside the log. One use is just
this formula with a single term — which is exactly why lesson 10's simplified version worked for that
case and no other.

**Two chunks, two retrieval histories:**

- **Chunk A** — the name of a colleague you spoke with exactly **once, 1 day ago**.
- **Chunk B** — the name of a colleague you've spoken with on three separate occasions: **2, 4, and 8
  days ago**.

Using d = 0.5, compute chunk B's base-level activation, summing its power-law term across all three
uses. (Compute chunk A's too, informally, before you check the solution — comparing them is the point.)
