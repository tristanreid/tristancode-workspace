---
title: "Solution: Attention Never Fully Commits — Is That a Bug?"
description: "Softmax weights are always strictly positive, so attention always outputs a true blend of every value — a feature, not a bug: it's what makes attention differentiable and trainable by gradient descent."
lesson_number: 24
track: ml
concept: "Attention as soft dictionary lookup"
stage: 6
layout: solution
role: solution
builds_on: [22, 23]
skin: chalkboard
resources:
  - title: "distill.pub"
    url: https://distill.pub/
    note: "visual walkthroughs of attention weights and what they look like in practice"
  - title: "3Blue1Brown — Attention in transformers, visually explained"
    url: https://www.3blue1brown.com/lessons/attention
    note: "the query/key/value mechanism, animated"
---

**Option 2.** The near-1 weight is not "close enough to ignore" (option 1) — the exact size of that
tiny leftover weight matters, as the rest of this explanation shows. Softmax does not spread weight
equally (option 3) — it's specifically designed to do the opposite, amplifying differences between
scores (that's the whole point of the exponential in its formula). And nothing about softmax ever
produces an exact weight of 1 or 0 (option 4) — mathematically, $e^x$ is positive for *every* real
number $x$, so every term in a softmax gets a strictly positive share, no matter how lopsided the raw
scores are.

**Why "never fully commits" is the mechanism, not a flaw.** Lesson 19 covered backpropagation: training
a network means computing how the loss changes as each weight changes, and nudging weights in the
direction that reduces loss. That only works if the network's operations are differentiable — you can
compute a smooth gradient through them. A true hard lookup ("pick the single best-matching key") is a
discrete decision: an infinitesimal change to the query either doesn't change which key wins, or it
does and the output *jumps* discontinuously from one value to a totally different one. There's no
useful gradient to follow at that jump — you can't nudge your way into deciding to attend to a different
key, you can only jump. Softmax's "always slightly nonzero, always a blend" property is exactly what
avoids that cliff: nudge the query a little, and the weights shift a little, and the output shifts a
little, continuously. That smoothness is what lets gradient descent train a network to decide, from
data, which keys *should* matter for a given query — the same trick this stage has been building toward
since Lesson 19's chain rule.

**Reading the specific numbers.** With scores 8, 1, 1, the dominant term (weight ≈0.998) means the
output is *extremely* close to that one value — attention here behaves almost exactly like a hard
lookup, which is by design: when a query has a genuinely much better match, the mechanism should look
almost like picking it. But "almost like" is doing real work in that sentence. If two keys score close
together instead — say 5 and 4.9 — the weights land close to 50/50, and the output becomes a genuine
blend of two values, neither one dominating. Attention doesn't have a single behavior; it interpolates
smoothly between "confidently pick one" and "genuinely average several," entirely as a function of how
separated the similarity scores are — which is itself learned from data, through the query and key
vectors that produced those scores in the first place.

**The name, cashed out.** "Soft" dictionary lookup: same shape as a hash-map lookup (query against
keys, retrieve values), but every step is continuous instead of discrete — soft matching instead of
exact matching, a weighted blend instead of a single winner, and (unlike Lesson 23's raw
nearest-neighbor distance) the whole thing differentiable and trainable end-to-end.

**Where this goes:** the next lesson connects this same all-pairs comparison to why transformers
parallelize so well — meeting the fp track's own payoff on work vs. span from the opposite direction.
