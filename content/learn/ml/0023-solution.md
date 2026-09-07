---
title: "Solution: The Nearest Neighbor Is Lying to You"
description: "Raw Euclidean distance is dominated by whichever feature has the largest numeric range — here, review count swamps rating entirely, returning a 'nearest neighbor' that's obviously the wrong match."
lesson_number: 23
track: ml
concept: "Nearest neighbors: uses and traps (hubness, scale, stale embeddings)"
stage: 5
layout: solution
role: solution
builds_on: [22]
skin: chalkboard
resources:
  - title: "scikit-learn — Importance of Feature Scaling"
    url: https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html
    note: "worked example of exactly this failure mode, with code"
---

**The answer is 50** (distance Q→X ≈ 50.07, rounds to 50).

**The arithmetic.**

Q→X: $\Delta\text{reviews} = 50$, $\Delta\text{rating} = 2.7$.
$\sqrt{50^2 + 2.7^2} = \sqrt{2500 + 7.29} = \sqrt{2507.29} \approx 50.07$

Q→Y: $\Delta\text{reviews} = 800$, $\Delta\text{rating} = 0.1$.
$\sqrt{800^2 + 0.1^2} = \sqrt{640000 + 0.01} \approx 800.00$

Distance to X (≈50) is smaller than distance to Y (≈800), so a nearest-neighbor search returns **X**
as the closer match to Q.

**And that's the trap.** X is a poorly-reviewed product (2.1 stars vs. Q's 4.8) that happens to share
a similar review count. Y is a nearly-identical-quality product (4.7 stars vs. 4.8) that just has fewer
reviews. By any reasonable notion of "similar product," Y is the better match — but raw Euclidean
distance confidently returned X, because `reviews` spans a range of hundreds to thousands while
`rating` only spans 1.0 to 5.0. A 50-review gap and a 2.7-star gap get added as if they were
comparable-sized quantities, when they aren't remotely comparable — the review-count axis mechanically
dominates every distance calculation regardless of what the rating axis is doing. This is the **scale
trap**: unscaled features with different numeric ranges don't get equal say in the distance, the
largest-range feature does almost all the deciding. The fix is to standardize each feature (subtract
the mean, divide by the standard deviation, or otherwise put every axis on a comparable scale) *before*
computing distance — not a change to the distance formula, a change to what you feed it.

**Two more traps in the same family, worth knowing by name:**

- **Hubness.** In high-dimensional embedding spaces, a small number of points tend to show up as the
  "nearest neighbor" of an unusually large number of other points — not because they're genuinely
  similar to all of them, but as a geometric side-effect of high dimensionality (distances concentrate,
  and some points end up closer to *everything* than they should be). A recommendation system built on
  raw nearest-neighbor lookups can end up recommending the same handful of "hub" items to almost
  everyone.
- **Stale embeddings.** An embedding model trained last quarter placed items in a space shaped by that
  quarter's data and that model's weights. New items added since then, or a retrained model version, can
  produce vectors that aren't directly comparable to the old ones — "nearest neighbor" silently mixes
  old-geometry and new-geometry points as if they lived in the same space, when they don't.

**Where this goes:** distance and nearest-neighbor lookup are also exactly the mechanism underneath
attention — a query vector finding the most relevant key vectors is a *soft*, differentiable version of
the same nearest-neighbor idea, up next.
