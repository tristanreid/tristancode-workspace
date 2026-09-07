---
title: "Attention Never Fully Commits — Is That a Bug?"
description: "A hash-map lookup either matches a key or it doesn't. Attention scores every key against a query and blends every value anyway. Is a near-perfect match not enough to just pick one?"
lesson_number: 24
track: ml
concept: "Attention as soft dictionary lookup"
stage: 6
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [22, 23]
skin: chalkboard
mcq:
  question: "A query vector is compared against three key vectors, producing similarity scores 8, 1, and 1. Softmax turns those into weights that sum to 1 — here, roughly 0.998, 0.001, and 0.001. The attention output is the weighted sum of the three matching value vectors using those weights. Compared to a plain dictionary lookup (which would return exactly the value for the single best-matching key), what has actually happened?"
  options:
    - "Nothing different in practice — 0.998 is close enough to 1 that this is functionally identical to a hard dictionary lookup, and the distinction doesn't matter"
    - "The output is overwhelmingly the best-matching key's value (weight ≈0.998), but it is a true weighted blend that also includes a tiny, nonzero contribution from the other two values — attention never fully commits to one key the way a hash map does; it always outputs *some* mixture, even if one term dominates"
    - "Softmax always distributes weight equally across all keys, so the output is close to a 1/3, 1/3, 1/3 average of all three values"
    - "A similarity score of 8 means the key matched exactly, so softmax discards the other two keys entirely and the output is exactly the best value, with weight exactly 1"
  correct: 1
---

Lesson 23 closed on a forward hook: nearest-neighbor lookup and attention are related ideas. Here's
the precise relationship, and where they diverge.

**A dictionary/hash map is a hard lookup.** You give it a key; it either finds an exact match and
returns that one value, or it doesn't. There's no notion of "60% of a match" — the lookup is a single
discrete jump, and only one value ever comes back.

**Attention is what happens when you make that lookup differentiable.** Instead of an exact-match
key, attention has a **query** vector representing "what am I looking for right now." Instead of a
single hash bucket, it has a set of **key** vectors, one per candidate, each representing "what this
candidate is." Instead of hashing, it computes a **similarity score** between the query and every key
(commonly a dot product) — a continuous number, not a yes/no match. Those scores get passed through
**softmax**, which turns any list of numbers into positive weights that sum to 1, with larger scores
getting exponentially more weight. The output isn't "the value for the winning key" — it's a **weighted
sum of every value**, using those softmax weights. Crucially, softmax weights are never *exactly* zero
(softmax of any real numbers is always strictly positive everywhere), so every value contributes at
least a sliver, no matter how poor its key's match was.

**The scenario:** a query scores 8 against one key and 1 against each of the other two. Softmax turns
those scores into weights of roughly 0.998, 0.001, and 0.001 (you can sanity-check the shape of this:
$e^8$ is enormously larger than $e^1$, so almost all the weight piles onto the first term, but never
literally all of it). The attention output is $0.998 \times \text{value}_1 + 0.001 \times
\text{value}_2 + 0.001 \times \text{value}_3$.

**Your task:** pick the option that correctly describes what that output actually is, compared to a
plain hard dictionary lookup on the same three candidates.
