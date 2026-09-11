---
title: "Solution: What the 90% Actually Covers"
description: "True rate 14.4%, inside a narrow ~13.0-15.1% credible interval — a well-supported interval that's tight, not a padded one that merely can't lose."
lesson_number: 23
track: bayes
concept: "Credible intervals vs confidence intervals"
stage: 4
layout: solution
role: solution
builds_on: [11, 15]
skin: chalkboard
resources:
  - title: "Seeing Theory — Bayesian Inference"
    url: https://seeingtheory.brown.edu/bayesian-inference/index.html
    note: "interactive posterior + credible-interval visualization"
  - title: "Seeing Theory — Frequentist Inference"
    url: https://seeingtheory.brown.edu/frequentist-inference/index.html
    note: "the confidence-interval construction, side by side with the Bayesian picture above"
---

**Retrieval check answer.** It's a **plausibility (degree-of-belief) claim**, not a frequency claim.
There's exactly one true difference between variant A and variant B — it isn't an event that recurs
across many trials the way "this coin lands heads" does. "92% probability" here means "given the data
and the model, 92% of the posterior's mass says B is better," a degree of belief about one fixed but
unknown quantity — Lesson 1's second reading of probability, still doing the work weeks later.

---

**Part 1 — Approximate 90% credible interval: roughly 13.0% to 15.1%.**

```
mean ± 1.645 × SD = 14.02% ± 1.645 × 0.63pp ≈ 14.02% ± 1.04pp ≈ [12.98%, 15.06%]
```

Rounded, about **[13.0%, 15.1%]** — a narrow band, because 3,000 visitors and 420 conversions is
substantial evidence (Lesson 17's `1/√n` shrinkage, applied to a real-sized sample instead of a
toy one).

**Part 2 — the true value: 14.4%,** which lands comfortably inside that narrow interval. If your own
90% interval landed somewhere close to [13%, 15%] rather than defaulting to something padded and safe
like [5%, 25%], your calibration instinct is exactly on target: **the goal isn't an interval that
can't lose, it's an interval that's as narrow as the evidence honestly supports while still hitting
your stated confidence level.** An interval like [1%, 99%] would also have "contained" 14.4% — but it
would have contained almost *any* value, meaning it carried essentially zero information. A wide
interval that always wins isn't a good bet; it's refusing to place one. The posterior here is genuinely
sharp — 3,000 data points bought you real precision — and reporting a wide interval anyway wastes
exactly the evidence you went to the trouble of collecting.

**Part 3 — this was a credible interval.** It was built directly from the posterior's probability
mass — "90% of what `Beta(421,2581)` believes lies in this range" — with no appeal to hypothetical
repeated sampling. That licenses the direct probability statement: "there's a 90% chance the true rate
is in [13.0%, 15.1%], given this prior and this data." To build a *confidence* interval instead, you'd
design a procedure (e.g., a specific formula applied to sample proportions) and ask what fraction of
intervals that procedure would produce across many *hypothetical* repeated 3,000-visitor experiments —
a claim about the long-run behavior of the method, computed without reference to any particular
posterior distribution at all. For a problem this simple with a weak (uniform) prior, the two would
likely come out numerically close — but only the credible interval, built the way you built it, can
honestly say "90% probability, this specific range, this specific data."

**Why the mix-up is so common.** The confidence-interval sentence ("there's a 90% probability the true
value is in this specific interval") *sounds* identical to the credible-interval claim, and once the
data is in hand and a specific interval is written down, the frequentist framework has nothing left to
say about that one, particular interval — it either contains the truth or it doesn't, full stop, no
probability attached to which. People reach for the probabilistic-sounding sentence anyway because
it's the more natural thing to want to say about a range you just computed — and it's exactly what a
*credible* interval, if you'd built one, would have licensed you to say correctly.

**Where this goes:** you've now summarized posteriors as single numbers (Lesson 22) and as honest
intervals. Last stop before Stage 5's computation tools: turning a posterior into an actual *decision*
— not just a summary, but a choice about what to do next, weighing what you stand to gain or lose.
