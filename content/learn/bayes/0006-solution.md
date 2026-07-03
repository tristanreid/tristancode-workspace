---
title: "Solution: Bayes from Both Directions"
description: "Prior × likelihood, normalized over every way the evidence could have happened — the update loop in one worked example."
lesson_number: 6
track: bayes
concept: "Bayes' theorem"
stage: 1
layout: solution
role: solution
builds_on: [2, 3]
skin: chalkboard
resources:
  - title: "3Blue1Brown — Bayes theorem, the geometry of changing beliefs"
    url: https://www.youtube.com/watch?v=HZGCoVF3YvM
    note: "the best visual treatment of exactly this computation"
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive prior → posterior updating"
---

**P(spam | crypto) = 6/7 ≈ 0.857.**

With 1,000 messages, the counting version (always available, never slippery):

- 400 are spam → 90% mention crypto → **360** spam-and-crypto.
- 600 are ham → 10% mention crypto → **60** ham-and-crypto.
- A crypto-mentioning message is one of 360 + 60 = **420**, of which 360 are spam: 360/420 = 6/7.

And the formula version, which is the same arithmetic wearing symbols:

    P(spam | crypto) = P(crypto | spam) · P(spam) / P(crypto)
                     = (0.9 × 0.4) / (0.9 × 0.4 + 0.1 × 0.6)
                     = 0.36 / 0.42 ≈ 0.857

The denominator you had to build — P(crypto) = P(crypto | spam)P(spam) + P(crypto | ham)P(ham) —
has a name, the **law of total probability**: the evidence's overall rate is the sum of its rates
down each branch, each weighted by that branch's probability. Conceptually it's a *normalizer*:
"out of every way a crypto-mention could have happened, what fraction came via spam?" You're doing
lesson 2's zoom — restricting to the crypto-mentioning slice of the world — where the slice's
total had to be assembled from parts.

Name the three moving pieces, because the whole track speaks this vocabulary from here on:

- **Prior** — P(spam) = 0.4: your belief before the evidence.
- **Likelihood** — P(crypto | spam) = 0.9: how strongly the hypothesis *predicts* the evidence.
- **Posterior** — P(spam | crypto) ≈ 0.857: your belief after. The evidence moved you from 40% to
  86%.

**The pitfall:** reading 90% ("crypto, given spam") as the answer to "spam, given crypto?" — the
transposition error from lesson 2. Here the two numbers landed close (0.9 vs 0.857) *only because*
spam's prior was high and ham rarely says crypto. That closeness is a coincidence of these inputs,
and trusting it builds exactly the wrong reflex. Next lesson drops the prior to 1-in-1000 and
watches the two conditionals tear apart — the most consequential single example in this track.
