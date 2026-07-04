---
title: "Solution: Three Questions About One Mind"
description: "Why keeping Marr's levels separate is the first professional skill of thinking about minds and machines."
lesson_number: 1
track: cog
concept: "Marr's levels"
stage: 0
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "Wikipedia — David Marr, the tri-level hypothesis"
    url: https://en.wikipedia.org/wiki/David_Marr_(neuroscientist)
    note: "short overview with the cash-register example"
  - title: "Stanford Encyclopedia of Philosophy — The Computational Theory of Mind"
    url: https://plato.stanford.edu/entries/computational-mind/
    note: "the deeper end, when you want it"
---

**B — the frequency tables and Bayes-rule updates.** That claim commits to *representations*
(per-word counts, a running score) and *processes* (an update rule applied per word). Swap in a
neural classifier and B becomes false while the system still filters spam — that mutability under
"same problem, different method" is the signature of the algorithmic level.

The others: **A** and **D** are computational-level claims — they describe the problem (separate
two classes; asymmetric error costs) and its intrinsic constraints (the precision/recall tradeoff
in D survives unlimited compute because it's a property of the *task*, not the machine). **C** is
implementational — shards and SIMD say how the physics is organized, and the identical algorithm
would run, slower, on a laptop.

**Why this tool earns its place as lesson 1:**

- **Explanations at different levels don't compete.** "She forgot because activation decayed"
  (algorithmic) and "she forgot because synaptic potentiation faded" (implementational) can both
  be true. Ditto "the model refuses because of RLHF training" vs "because of this circuit."
  People burn hours debating non-rival claims.
- **Critiques must match levels.** "That cognitive model can't be right — brains don't have
  symbol tables" attacks an algorithmic proposal with an implementational objection. It might
  land, but only with an argument about *why the substrate can't realize the algorithm* — which
  is a much harder claim.
- **You already use this on your own systems.** An agent harness has a computational theory
  (what task, what constraints — latency, cost, correctness), an algorithmic level (what's on the
  scratchpad, which component runs next — the level where "blackboard architecture" is a claim),
  and an implementation (processes, APIs, GPUs). When a design argument goes circular, check
  whether the participants are at the same level. Usually they aren't.

**Pitfall:** treating the levels as a ladder of importance, with implementation as the "real"
truth. Marr's point cut the other way: you cannot understand a bird by studying only feathers.
The computational level — what problem is this system *for* — is where understanding starts.

**Where this goes:** the next lessons put concrete machinery at the algorithmic level — first the
limits of human working memory, then the rule-based engines (production systems) that grew into
ACT-R, SOAR, and the blackboard architecture this track keeps circling back to.
