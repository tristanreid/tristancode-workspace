---
title: "Solution: Two Meanings of 70%"
description: "Why the degree-of-belief reading extends probability to one-off events — and why it obeys the same rules."
lesson_number: 1
track: bayes
concept: "Probability as plausibility"
stage: 0
layout: solution
role: solution
builds_on: []
skin: chalkboard
resources:
  - title: "Seeing Theory — Basic Probability"
    url: https://seeingtheory.brown.edu/basic-probability/index.html
    note: "interactive; watch frequencies converge on a probability"
  - title: "Think Bayes 2, Chapter 1 (free online)"
    url: https://allendowney.github.io/ThinkBayes2/chap01.html
    note: "probability as a fraction of a finite population — the gentlest on-ramp"
---

**B — the deploy claim.** The other three all describe repeatable situations: flip the coin a
thousand times, sample a thousand widgets, roll the dice all night. "Last night's deploy caused
this outage" happened exactly once. There is no ensemble of reruns; the claim is simply true or
false, and you don't know which. A long-run frequency reading has nothing to attach to.

Yet "60% it was the deploy" is obviously *meaningful* — you act on numbers like that constantly.
You check the deploy log before the load balancer config. You'd bet a lunch on it, but not a
paycheck. That number is a **degree of belief**: a summary of how plausible the claim is *given
everything you currently know*.

Two things make this more than hand-waving:

1. **Degrees of belief obey the probability rules.** There's a classic result (associated with
   Cox and de Finetti — no need to memorize the names) showing that if your uncertainty numbers
   violate the probability axioms, you become incoherent in a very practical sense: someone can
   assemble a set of bets, each of which you'd individually accept, that loses you money no matter
   what happens. Coherent uncertainty *is* probability. Same math, wider scope.
2. **A belief is a bet.** "60%" isn't decoration — it commits you. It says which side of 3:2 odds
   you'd take, whether checking the deploy log is worth ten minutes, whether to roll back first
   and investigate second. If a number wouldn't change any decision at any stakes, you haven't
   really assigned it.

**The common pitfall** is the reverse of this lesson: hearing "there's no probability here, it
either happened or it didn't." True for the *event*; irrelevant for the *reasoning*. Probability
in the Bayesian reading lives in your information about the world, not in the world itself. The
coin on the floor under the couch is already heads or tails — your 50% describes *you*.

**Where this goes:** if beliefs are probabilities, then learning something new should *move* them
in a lawful way. The rule for moving them is conditioning — the subject of the next lessons — and
the whole track is about one loop: belief in, evidence in, updated belief out.
