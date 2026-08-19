# Distance Series — Brainstorm Notes

Captured from conversation on March 4, 2026.

## Origin / Motivation

Two existing projects inspire this series:

1. **Stumbling distance** (Drinky Cab series) — built a custom distance metric using street graphs and k-d trees because Euclidean distance was physically wrong for measuring "how many bars are near a taxi pickup." L2 assumes you can walk through buildings; L1 (Manhattan distance) assumes a perfect grid; the real answer required graph-based shortest-path routing along actual streets, ignoring one-way signs (because drunk people don't care about traffic arrows). The two-stage optimization (Euclidean k-d tree filter → graph distance on candidates) brought runtime from 1M years to minutes.

2. **KL divergence** (Dormant LLM puzzle) — trying to find a hidden trigger phrase in a backdoored language model by comparing it to its clean base model. KL divergence is the primary scoring metric: does this candidate trigger input cause the dormant model's output distribution to diverge from the base model's?

The idea: a blog series about the many faces of "distance" — giving readers a useful taxonomy and decision framework for choosing the right metric, while having fun with concrete examples.

---

## Flavor / Texture

### Neal Stephenson — *Zodiac: An Eco-Thriller* (1988)

Key passage from Chapter 4, where protagonist Sangamon Taylor describes navigating Boston Harbor in a Zodiac inflatable boat:

> Contrary to what every bonehead believes, the land surface has been stretched out and expanded by civilization. Look at any downtown city: what would be a tiny distance on a backpacking trip becomes a transcontinental journey. You spend hours traveling just a few miles. Your mental map of the city grows and stretches until things seem far away. But get on a Zodiac, and the map snaps back into place like a rubber sheet that has been pulled out of shape. Want to go to the airport? Zip. It's right over there. Want to cross the river? Okay, here we are. Want to get from the Common to B.U., two miles away, during rush hour, right before a playoff game at Fenway Park? Most people wouldn't even try. On a Zodiac, it's just two miles. Five minutes. **The real distance, the distance of Nature.**

Usage: potential epigraph / opening frame for the series. The passage perfectly describes how infrastructure warps the metric space of a city. But we can gently push back — the "distance of Nature" isn't more real than the distance of rush hour. If you're in a car at 5pm, the temporal distance *is* the real one. Euclidean is the abstraction. The question is always: **real for whom, for what purpose?**

The Zodiac distance is only "real" from the perspective of someone who *has* a Zodiac. For the guy stuck in the BMW on Charlesgate West, the real distance includes the traffic.

### Cake — "The Distance" (1996)

"He's going the distance / He's going for speed / She's all alone in her time of need"

The song's protagonist keeps racing in an empty arena long after everyone else has left. Thematic resonance: choosing the wrong distance metric is like optimizing a metric nobody cares about. The hardest part of distance isn't computing it — it's deciding what "close" means. The Cake guy never figured that out.

Possible uses:
- Epigraph for the decision framework section
- Running motif (different lyrics open different posts)
- Thematic closer for the series

### Org Distance — The Killer Example

**Org-chart distance**: count hops up and down the tree. Skip-level = 2. Sibling team = 4. CEO = N from everyone. Well-defined, easy to compute, almost completely useless for predicting who actually collaborates.

**Collaboration distance**: construct a different graph from behavioral signals:
- Shared Google Doc edits (weighted by recency/frequency)
- Commits to the same repo (especially same files)
- Shared Slack channels (weighted by esotericism — #general ≈ 0, #niche-debugging-club ≈ high)
- Meeting co-attendance
- Email/thread co-participation

Edge weight = collaboration intensity. Distance = inverse strength or shortest path through collaboration graph.

Punchline: two people org-chart distance 8 apart might be collaboration distance 1 (they pair on everything, different reporting chains). Two people org-chart distance 2 (same manager!) might be collaboration distance ∞ (never touched the same file or channel).

Can also use **cosine similarity**: represent each person as a vector of activities (docs edited, repos committed to, channels joined), compute cosine distance.

---

## Taxonomy of Distance Metrics

Organized by **what the objects being compared are**:

### 1. Points in Space
- **L2 (Euclidean)** — default, "as the crow flies"
- **L1 (Manhattan / taxicab)** — grid-restricted. Drinky cab post explains this.
- **L∞ (Chebyshev)** — "king's move" distance (max of coordinate differences). Chess king metric.
- **Graph / network distance** — stumbling distance. Shortest path on actual topology.
- **Geodesic** — great circle on Earth. Why NYC–London flights go over Greenland.

Interactive idea: widget where you drop two pins on a grid, see L1/L2/L∞/graph distance computed simultaneously with different colored paths. They can all disagree wildly.

### 2. Strings and Sequences
- **Hamming distance** — positions that differ (same-length only). Error-correcting codes.
- **Edit distance (Levenshtein)** — min insertions/deletions/substitutions. Spell-checkers, DNA alignment, diff.
- **Dynamic Time Warping (DTW)** — sequences that are "the same shape" but stretched/compressed. Speech recognition, stock patterns.
- **Longest Common Subsequence** — related to edit distance, only counts deletions/insertions.

Interactive idea: edit distance DP matrix animation. Type two words, watch the matrix fill in with optimal alignment path. "kitten" → "sitting" classic.

### 3. Distributions (Probability / Belief)
- **KL divergence** — asymmetric. "How surprised would I be if I thought the world was P but it's actually Q?" Anchored in dormant model work.
- **Jensen-Shannon divergence** — symmetrized KL. Often more practical.
- **Earth Mover's Distance (Wasserstein)** — "minimum work to move pile of dirt P into hole Q." Great visual intuition. Used in generative model evaluation (FID scores).
- **Total variation** — largest difference in probability on any event. Simple but coarse.

Interactive idea: two draggable histograms. As you reshape one, show KL (both directions!), JS, and EMD updating live. KL asymmetry becomes visceral.

### 4. Meaning / Embedding Space
- **Cosine similarity** — angle between vectors, ignoring magnitude. Workhorse of NLP. "king - man + woman ≈ queen" is a distance story.
- **Euclidean in embedding space** — sometimes useful, often misleading (high-dim geometry, concentration on shells).

Connects to dormant LLM: linear probes find *directions* in the residual stream. The probe's weight vector defines a direction; prediction is a dot product (cosine similarity up to normalization).

### 5. Sets
- **Jaccard distance** — |A ∩ B| / |A ∪ B|. Document similarity, recommendation overlap.
- **Hausdorff distance** — worst-case nearest-neighbor between point sets.

### Decision Framework

| Question | Metric family |
|---|---|
| How far apart are two physical locations? | L2, L1, graph, geodesic |
| How similar are two strings/sequences? | Edit distance, Hamming, DTW |
| How different are two probability distributions? | KL, JS, Wasserstein, TV |
| How similar are two concepts/meanings? | Cosine in embedding space |
| How much do two sets overlap? | Jaccard, Hausdorff |

Key decision dimensions:
- **Symmetry?** KL is not symmetric. Matters when "A far from B" should equal "B far from A."
- **Triangle inequality?** KL doesn't satisfy it. Wasserstein does. Determines if you can use metric-space data structures (k-d trees, ball trees).
- **Computationally feasible?** Graph distance more "correct" than Euclidean for streets but wildly more expensive. The two-stage filter pattern: cheap approximate metric for filtering, expensive correct metric for final answer.
- **What does "close" mean in your domain?** Euclidean says Central Park is 0.5mi wide. Stumbling distance says it's an ocean.

### Wild Cards
- **Curse of dimensionality**: in high-dim space, all points are approximately equidistant. Same metric that works in 2D becomes meaningless in 1000D. Connects to dormant LLM (3584-dim residual stream) and superposition.
- **Mahalanobis distance**: Euclidean adjusted for correlation. "100 miles apart, but across a mountain range."
- **The metric that doesn't exist**: sometimes no standard metric captures your domain and you have to build one (stumbling distance is exactly this).

---

## The Big Idea: Observer-Dependent Distance (Partially Observable Metrics)

### The Core Observation

Collaboration distance, even when defined identically, produces different results depending on who computes it — because each person has different visibility into the underlying data (different doc access, different repo permissions, different Slack channel membership).

This is NOT the same as "different metrics give different answers." This is subtler: **even agreement on what to measure doesn't guarantee agreement on the measurement.**

Most distance metrics in math are properties of the objects. Euclidean distance between two points doesn't depend on who measures. Edit distance doesn't change based on who typed the strings. But collaboration distance is a property of **the objects as seen through your particular keyhole**.

### The Rashomon Graph

Two people might be distance 1 in the full collaboration graph (they co-edit a doc you've never seen) but appear completely disconnected from your perspective. Your shortest path between them might go through five intermediaries, or not exist at all.

The **topology itself changes** by observer. Two people might be in the same connected component from the CEO's perspective and in entirely separate components from yours.

### The Epistemic Hierarchy

Executives have broadest access → densest collaboration graph → most "complete" distance measurements. But breadth of access ≠ depth of understanding. An IC working deeply in one area might see collaboration patterns within that area invisible to an executive with read-access to everything but no idea which files matter.

### Relativity Parallel

In special relativity, two observers measure different distances between the same events — neither is wrong, they're in different reference frames. The spacetime interval is invariant but isn't what either observer directly experiences.

Collaboration distance analog: is there a "proper distance" (god's-eye graph with every edge visible)? In principle yes (an admin with full access). But nobody occupies that reference frame, and unlike physics, there's no simple invariant everyone agrees on.

### Generalization Beyond Orgs

Any metric computed from partially-observable data has this property:
- **Recommendation systems**: movie similarity depends on which users' ratings you can see
- **Scientific measurement**: "distance" between hypotheses depends on which experiments you've run
- **Intelligence analysis**: how "connected" two suspects are depends on which comms you've intercepted
- **The dormant model work**: KL divergence depends on which prompts you test. Two researchers with different prompt sets measure different divergences, might disagree on whether a trigger is promising. The *set of prompts you choose* is your reference frame.

### The Privacy Inversion

The full collaboration graph (who works with whom on what) is itself sensitive information. The partiality of your view is the access-control system working as intended. Your "distorted" distance measurement is the privacy policy manifesting as geometry.

---

## Deep Questions: What Can We Know From Partial Views?

This section is the frontier — partially observable metrics and what we can infer from them. This may be the philosophical core of the series.

### Statistical Inference Questions

1. **Bounds from partial observation**: If you have a collaboration distance measurement from your perspective, and some prior about how many docs/repos/channels exist that you *can't* see, what valid statistical statements can you make about the "true" (full-visibility) collaboration distance? Can you put confidence intervals on it? What assumptions do you need?

2. **Sample complexity for the full picture**: If you sampled N people in an org and looked at each person's collaboration-distance graph, how many people would you need to sample to reconstruct the full collaboration graph (or a good approximation)? Is this a coupon-collector–type problem? Does the answer depend on the structure of the access-control policy?

3. **When do partial views agree?**: Under what conditions do two observers with different access produce the *same* distance ranking (even if not the same distances)? If the ranking is preserved, that's much more useful than if partial views produce contradictory orderings.

4. **Information content of a partial graph**: How much information (in the Shannon sense) does one person's collaboration graph carry about the full graph? Is there a notion of "how much of the org can this person see?" that's more nuanced than just counting docs?

5. **The marginal value of one more observer**: If you already have the partial graphs from K people, how much does adding person K+1 improve your reconstruction of the full graph? When does the marginal value drop to near zero? Is there a diminishing-returns curve?

### Epistemological / Philosophical Questions

6. **Is the full graph even the right target?**: Maybe the "true" collaboration distance isn't the god's-eye view — maybe it's some aggregation of partial views. The average distance across all observers? The minimum? The view from the "median" observer? What makes one aggregation more meaningful than another?

7. **The observer effect**: If you *told* people that their collaboration distance was being measured, would it change the collaboration patterns? (Almost certainly yes.) Does this mean the metric is only valid when unobserved, like a quantum measurement?

8. **Stable vs. unstable rankings**: Are there pairs of people whose relative collaboration distance is robust to observer perspective (everyone agrees Alice and Bob are close), and other pairs where it's fragile (some observers see them as close, others as far)? The robust pairs might be the most "real" collaborations; the fragile ones might be the most interesting.

9. **Can you detect your own blind spots?**: If your partial graph shows two clusters with no edges between them, can you distinguish "these groups genuinely don't collaborate" from "these groups collaborate through channels I can't see"? What additional information would you need?

10. **Triangulation**: If Alice's partial graph says X and Y are distance 3, and Bob's says they're distance 1, what can a third party infer? Is there a consistent reconciliation? Or can partial views be fundamentally irreconcilable (like different geometries)?

### Computational / Technical Questions

11. **Efficient reconstruction**: Is there an algorithm that, given K partial graphs, efficiently produces the best estimate of the full graph? Is this related to matrix completion (like Netflix prize–style recommendation)?

12. **Privacy-preserving aggregation**: Can you combine partial graphs *without* revealing whose graph contributed what? (Federated learning / secure multiparty computation angle.) This would let you build the full collaboration graph without anyone seeing more than their own slice.

13. **Graph kernels and partial observation**: If you use graph-kernel methods to compare two partial collaboration graphs (e.g., two departments' views of the org), what do the distances between *graphs* tell you? Is "the distance between two distances" a useful concept?

14. **Temporal dynamics**: Collaboration distance changes over time. Can you track how your partial view of the org changes, and infer things about what's happening in parts of the org you can't see? (E.g., "the collaboration distance between these two teams in my view suddenly increased — did they stop working together, or did they move their collaboration to a channel I was removed from?")

15. **How wrong can you be?**: What's the worst-case error between your partial-view distance and the true distance? Can you bound it? Is there an analog to the approximation ratio in algorithm design?

16. **Metric properties under partial observation**: Does the partial-view collaboration distance still satisfy metric axioms (symmetry, triangle inequality)? Or does the keyhole break these properties?

17. **Connections to existing theory**: How does this relate to:
    - Graph sampling theory
    - Missing data / imputation
    - Causal inference from observational data (you see correlations, not the full causal graph)
    - Sensor networks (each sensor has a limited range, combining them gives coverage)
    - The multi-armed bandit problem (exploration vs. exploitation — should you join more Slack channels to improve your graph, or focus on the ones you're in?)

### Fun / Provocative Questions

18. **The loneliest person in the org**: Who has the sparsest collaboration graph? Is it the newest hire, or someone who's been siloed? Does the answer change depending on who's measuring?

19. **Collaboration dark matter**: The edges that exist in the full graph but appear in *nobody's* partial view — do they exist? (E.g., two people who only collaborate through in-person conversations that leave no digital trace.) This is the "dark matter" of the org — exerts gravitational influence but is invisible to all instruments.

20. **The organizational Dunbar number**: Is there a natural limit to how many meaningful collaboration edges a person can maintain, analogous to Dunbar's number for social relationships? What does the degree distribution of the collaboration graph look like?

21. **Distance as a leading indicator**: If collaboration distance between two teams *increases* over time, does that predict future org restructuring? Conversely, if it *decreases* between teams that are org-chart-distant, does that predict a future reorg to formalize the collaboration?

22. **Your distance from yourself**: Over time, how much does your own collaboration graph change? The "distance from your past self" might measure career evolution, role changes, or organizational drift.

---

## Series Structure (Evolving)

Originally considered 2 posts, now expanding. Possible structure:

### Post 1: "The Distance of Nature"
- Opens with the Stephenson *Zodiac* quote
- L1 / L2 / L∞ / graph distance, anchored in stumbling distance work
- Edit distance / Hamming / DTW (with interactive widget)
- Org-chart vs. collaboration distance as the bridge

### Post 2: "The Distance of Belief"
- KL divergence anchored in the dormant model work
- Jensen-Shannon, Earth Mover's Distance
- Cosine similarity in embedding space
- The decision framework / taxonomy table

### Post 3: "The Distance of Perspective" (or "The Keyhole Problem")
- Observer-dependent metrics
- The Rashomon graph
- Partial observability and what you can infer from it
- The statistical inference questions
- Connections to the relativity parallel, privacy, epistemic hierarchy

### Possible Post 4: ?
- TBD based on which questions from the brainstorm above are most interesting
- Could be a more technical/quantitative exploration of the partial-graph reconstruction problem
- Could be about temporal distance / distance changing over time
- Could be the synthesis / decision framework as its own piece

### Running Themes
- Cake's "The Distance" as recurring motif
- Stephenson's "distance of Nature" as the thesis to argue with
- Each post works standalone but builds toward deeper insight
- "The hardest part isn't computing distance — it's deciding what 'close' means"

---

## Open Questions for Next Session

- Which of the 22 brainstorm questions are most interesting / most writable?
- How technical should the partial-observability post get? (Light analogy vs. actual math)
- Interactive widget priorities — which one(s) to build first?
- Series name? ("A Field Guide to Distance"? "The Distance of Nature"? "How Far Is Far"?)
- Should there be a unifying dataset or running example across all posts?
