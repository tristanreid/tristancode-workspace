# HyperLogLog Blog Series — Interactive Component Specifications

## Technical Approach

### Hugo + React Integration

Hugo renders Markdown to static HTML. For interactive components, we embed React (or standalone D3) into specific `<div>` mount points. Two viable approaches:

**Option A: Hugo shortcodes + standalone React bundles**
- Each component is a self-contained React app bundled with Vite or esbuild
- Hugo shortcodes emit a `<div id="component-name" data-props='{"n":1000}'>` placeholder
- A `<script>` tag loads the bundle, which finds its mount point and hydrates
- Pros: clean separation, Hugo remains a static site, components are independently deployable
- Cons: multiple script bundles to manage, potential duplication of shared libraries

**Option B: Hugo shortcodes + D3 (no React)**
- Each component is a standalone D3 script
- Lighter weight, no framework overhead
- Pros: smaller bundles, D3 is purpose-built for data visualization
- Cons: more imperative code for UI controls (sliders, buttons), less composable

**Recommendation: Hybrid — D3 for pure visualizations, React for interactive controls**
- Components that are primarily charts/visualizations: D3
- Components that need complex UI (sliders, toggles, side-by-side layouts): React with D3 for the viz layer
- Shared: a tiny simulation engine in plain TypeScript that both D3 and React components can import

### Shared Simulation Engine (`hll-sim.ts`)

A pure TypeScript module with zero DOM dependencies. All components import from here.

```typescript
// Core simulation functions

/** Simulate one person flipping coins: returns number of tails before first heads */
function flipUntilHeads(rng: () => number): number

/** Simulate a crowd of N people, return array of streak lengths */
function simulateCrowd(n: number, rng?: () => number): number[]

/** Simple hash function (for demo purposes — murmurhash3 or similar) */
function hash(item: string | number): bigint

/** Count leading zeros of a 64-bit hash value */
function countLeadingZeros(hash: bigint, bits?: number): number

/** Single-max estimator: returns 2^max(streaks) */
function singleMaxEstimate(streaks: number[]): number

/** Partition items into m=2^p registers, return register values (max per bucket) */
function hllRegisters(items: (string | number)[], p: number): number[]

/** HLL estimate from register values */
function hllEstimate(registers: number[], p: number): number

/** Run N trials of single-max estimation for crowd size n, return array of estimates */
function singleMaxTrials(n: number, trials: number): number[]

/** Run N trials of HLL estimation for crowd size n with p bits, return array of estimates */
function hllTrials(n: number, p: number, trials: number): number[]

/** Merge two sets of HLL registers (element-wise max) */
function mergeRegisters(a: number[], b: number[]): number[]

/** Seeded PRNG for reproducible demos (mulberry32 or similar) */
function createRng(seed: number): () => number
```

---

## Component Specifications

### Component A: CoinFlipCrowd

**Used in**: Part 1, Section 1.2
**Purpose**: First interactive encounter. Show a crowd flipping coins, reveal the max streak, show the estimate.
**Type**: React + D3 hybrid

#### Layout
```
┌─────────────────────────────────────────────────┐
│  [  Play  ]   [  Re-run  ]    Crowd size: [___] │
│                                                  │
│  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   │
│  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   │
│  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   │
│  ● ● ● ● ★ ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   │  ← ★ = record holder
│  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   │
│                                                  │
│  Record streak: 10 tails in a row                │
│  Estimate: 2^10 = 1,024                          │
│  Actual crowd: 1,000                             │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │  Distribution of streaks (histogram)        │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░                           │ │
│  │  0  1  2  3  4  5  6  7  8  9  10          │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### Behavior
- **Play**: Animate dots changing color as they "flip" — brief animation (0.5–1s), then settle into final state. Each dot gets a tooltip showing its streak length.
- **Re-run**: Re-run with new random seed. The estimate changes. After 3+ re-runs, show a subtle annotation: "Notice how the estimate changes each time? That's the instability problem."
- **Crowd size slider**: Range 50–10,000. Logarithmic scale.
- **Histogram**: D3 bar chart. X-axis = streak length (0, 1, 2, ..., max). Y-axis = count of people. The rightmost bar (the max) is highlighted.
- **Color encoding for dots**: Gradient from light (short streak) to dark (long streak). Record holder is a star or different shape.

#### Data Flow
```
user clicks Play
  → simulateCrowd(n)
  → render dots with streaks
  → compute max, estimate
  → render histogram
  → display stats
```

---

### Component B: CoinBinaryEquivalence

**Used in**: Part 1, Section 1.3
**Purpose**: Make the coin flip ↔ binary connection crystal clear
**Type**: Lightweight — D3 or even pure HTML/CSS/JS

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Flip coins:  [Flip!]    [Reset]                 │
│                                                  │
│  Flip 1:  🪙 Tails     →  0                      │
│  Flip 2:  🪙 Tails     →  0                      │
│  Flip 3:  🪙 Tails     →  0                      │
│  Flip 4:  🪙 Heads!    →  1                      │
│                                                  │
│  Coin sequence:  T  T  T  H                      │
│  Binary string:  0  0  0  1                      │
│  Leading zeros:  3                                │
│                                                  │
│  This person would report a streak of 3.         │
│  Our estimate contribution: 2^3 = 8              │
└─────────────────────────────────────────────────┘
```

#### Behavior
- Each click of "Flip!" adds one flip with a brief coin-spinning animation
- Game ends when Heads appears
- The binary digit appears next to each flip, building the string incrementally
- "Reset" clears and starts over
- Optionally: a "binary input" mode where user types 0s and 1s and sees the coin equivalents

---

### Component C: MaxStreakDistribution

**Used in**: Part 1, Section 1.5–1.6
**Purpose**: The critical "instability" demonstration. This is where the reader viscerally feels why single-max doesn't work.
**Type**: React + D3

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Crowd size (N): [====●==========] 1,000         │
│  Number of trials: [====●========] 500           │
│  [  Run Trials  ]                                │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │     Distribution of Estimates                │ │
│  │     (single-max method, 500 trials)         │ │
│  │                                              │ │
│  │         ▓▓                                   │ │
│  │      ▓▓▓▓▓▓                                  │ │
│  │    ▓▓▓▓▓▓▓▓▓▓                               │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓                             │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                         │ │
│  │  ──────────────|───────────────────           │ │
│  │  128  256  512 ↑ 1024 2048 4096 8192          │ │
│  │              N=1000                           │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  True N:       1,000                             │
│  Mean est:     1,187                             │
│  Median est:   1,024                             │
│  Std dev:      1,423                             │
│  Range:        [128 — 16,384]                    │
│                                                  │
│  ⚠ The estimate can only be a power of 2,        │
│    and it swings wildly between trials.           │
└─────────────────────────────────────────────────┘
```

#### Behavior
- Sliders control N and number of trials
- "Run Trials" computes singleMaxTrials(n, trials) and renders histogram
- X-axis is log2 scale (since estimates are powers of 2)
- True N shown as a prominent vertical line
- Re-running shows a different distribution (subtly different due to randomness)
- Key annotation: highlight that estimates cluster around powers of 2 near log2(N) but have wide tails

#### Design Notes
- Use a **bee swarm / strip plot** instead of (or in addition to) a histogram — each dot is one trial, placed at its estimate value. This makes the discreteness of the powers-of-2 visible and each trial countable.
- Color dots by how far off they are from truth (green = close, red = far)

---

### Component H: HashExplorer

**Used in**: Part 2, Section 2.2
**Purpose**: Let the reader type any text and see its hash in hex, binary, and the leading-zero count. Makes hashing tangible.
**Type**: Vanilla TypeScript + DOM (no D3 needed)

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Type anything:  [_____________________________] │
│                                                  │
│  Hash (hex):     a3 f2 1b 7c 90 e4 ...          │
│  Hash (binary):  1010 0011 1111 0010 ...         │
│                  ↑ first 1-bit                   │
│  Leading zeros:  0                                │
│  Estimate:       2^0 = 1                         │
│                                                  │
│  Try "hello" → "hello!" → "hellp"               │
│  Notice how tiny changes produce completely      │
│  different hashes.                               │
└─────────────────────────────────────────────────┘
```

#### Behavior
- As the user types, the hash updates in real-time (no submit button needed)
- The binary representation highlights leading zeros in teal, the first 1-bit in orange
- Suggested inputs shown as clickable chips: "1", "2", "hello", "hello!"
- The leading-zero count and estimate update live

---

### Component I: AvalancheDemo

**Used in**: Part 2, Section 2.3
**Purpose**: Show that similar inputs produce completely unrelated hashes. This is the key point: HLL's technique is independent of input distribution.
**Type**: D3 for the visualization

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Base string: [________]  (default: empty)       │
│                                                  │
│  Input    Hash (binary prefix)     Leading 0s    │
│  ──────   ────────────────────     ──────────    │
│  "1"      0110 1010 1100 ...      0              │
│  "2"      0000 0101 1011 ...      4              │
│  "3"      1001 1100 0010 ...      0              │
│  "4"      0001 1010 0111 ...      3              │
│  "5"      1100 0011 0101 ...      0              │
│  ...                                             │
│  "20"     0000 0000 1101 ...      8              │
│                                                  │
│  ⚡ Even though the inputs are sequential,        │
│  the leading zeros bounce around randomly.       │
│  This is the avalanche effect in action.         │
└─────────────────────────────────────────────────┘
```

#### Behavior
- Shows 10–20 sequential or similar strings and their hash properties side by side
- Leading zeros for each entry are shown as colored circles or bars — visually obvious that there's no pattern
- The reader can change the base string (e.g., type "user_" to see "user_1", "user_2", ...)
- Key callout: "The number of leading zeros in hash('1') tells you nothing about hash('2'). This means HLL works regardless of what your data looks like."

---

### Component D: CrowdPartition

**Used in**: Part 3, Section 3.2
**Purpose**: Show the same crowd being split into sub-crowds (registers). This is the "aha" for how registers work.
**Type**: React + D3

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Same crowd, now organized into sub-crowds       │
│  Register bits (p): [2] [4] [8]  → m = 16       │
│                                                  │
│  ┌──────────┬──────────┬──────────┬────────────┐ │
│  │ Reg 0    │ Reg 1    │ Reg 2    │ Reg 3  ... │ │
│  │ ●●●●●●   │ ●●●●●    │ ●●●●●●●  │ ●●●●●     │ │
│  │ ●●●●●    │ ●●●●●●   │ ●●●●●●   │ ●●●●●●    │ │
│  │          │          │          │            │ │
│  │ max: 5   │ max: 4   │ max: 6   │ max: 4    │ │
│  │ est: 32  │ est: 16  │ est: 64  │ est: 16   │ │
│  └──────────┴──────────┴──────────┴────────────┘ │
│                                                  │
│  Combined (harmonic mean): ~1,024                │
│  True crowd size: 1,000                          │
│                                                  │
│  [Toggle: show as single crowd / show partitioned]│
└─────────────────────────────────────────────────┘
```

#### Behavior
- **Toggle animation**: Show the crowd as a single group, then animate them separating into colored sub-groups. Same people, just reorganized.
- **Adjustable p**: When p changes, the crowd re-partitions. More sub-crowds = smaller groups each.
- Each register column shows: the dots (colored by register), the local max streak, the local estimate.
- The combined estimate is computed and shown below.
- **Highlight the record holders**: In each sub-crowd, the person with the longest streak gets a star.

#### Key Visual Principle
- The *total number of dots* never changes. We're slicing the same crowd.
- Use transition animations so the reader sees dots physically moving from one layout to another.

---

### Component E: MeanComparison

**Used in**: Part 3, Section 3.4
**Purpose**: Show why harmonic mean beats arithmetic mean
**Type**: D3 chart, relatively simple

#### Layout
```
┌─────────────────────────────────────────────────┐
│  Sub-crowd estimates: [32, 16, 64, 16, 16, 32,  │
│                        16, 512]                  │
│                                                  │
│  ──●──────────────────────●──────────●────────── │
│    16                    32          64     512   │
│                                                  │
│  Arithmetic mean: 88   ← pulled by the 512       │
│  Harmonic mean:   24   ← robust to outliers      │
│  True (per sub):  ~25                            │
│                                                  │
│  [Re-generate sub-crowd estimates]               │
└─────────────────────────────────────────────────┘
```

#### Behavior
- Shows the individual register estimates as dots on a number line (log scale)
- Arithmetic mean and harmonic mean shown as labeled markers
- Outlier(s) visually emphasized
- Re-generate button creates a new random partition and re-computes
- Each regeneration reinforces: arithmetic mean bounces around, harmonic mean stays close to truth

---

### Component F: StabilityShowdown

**Used in**: Part 3, Section 3.5
**Purpose**: THE payoff component. Side-by-side comparison of single-max vs HLL.
**Type**: React + D3. This is the most complex and important component.

#### Layout
```
┌──────────────────────────┬───────────────────────────┐
│  SINGLE-MAX ESTIMATOR    │  HYPERLOGLOG (m registers) │
│                          │                           │
│  ┌────────────────────┐  │  ┌────────────────────┐   │
│  │   ▓                │  │  │        ▓▓▓▓        │   │
│  │   ▓▓               │  │  │      ▓▓▓▓▓▓▓▓     │   │
│  │  ▓▓▓▓              │  │  │    ▓▓▓▓▓▓▓▓▓▓▓▓   │   │
│  │ ▓▓▓▓▓▓▓▓           │  │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓       │  │  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │
│  │──────────|────────  │  │  │────────|──────────│   │
│  │        N=1000       │  │  │      N=1000       │   │
│  └────────────────────┘  │  └────────────────────┘   │
│                          │                           │
│  Std error: 142%         │  Std error: 3.2%          │
│  Within 10%: 18%         │  Within 10%: 97%          │
│  Range: [64, 32768]      │  Range: [920, 1085]       │
│                          │                           │
├──────────────────────────┴───────────────────────────┤
│  Crowd size (N): [====●==========] 1,000             │
│  Registers (m):  [====●==========] 1,024             │
│  Trials:         [====●==========] 1,000             │
│  [  Run Comparison  ]                                │
└──────────────────────────────────────────────────────┘
```

#### Behavior
- Side-by-side histograms rendered simultaneously
- Shared x-axis scale so the visual comparison is fair
- Sliders for N, m, and trial count
- Adjusting m tightens/loosens the HLL histogram — reader sees the accuracy/memory trade-off live
- The contrast should be dramatic and immediate
- Optional: overlay both histograms on the same chart (with transparency) for direct comparison

#### Design Notes
- This is the "hero" visualization of the series — give it room to breathe
- Consider using kernel density estimation (KDE) curves in addition to histograms for visual polish
- The stats panel should compute in real-time as sliders change

---

### Component G: MergeDemo (Optional / Bonus)

**Used in**: Part 3, Section 3.8
**Purpose**: Show that HLL sketches can be merged
**Type**: React + D3

#### Layout
```
┌──────────────────────────────────────────────────┐
│  Crowd A (Monday visitors)    Crowd B (Tuesday)   │
│  ●●●●●●●●●●   (500 unique)  ●●●●●●●●  (400)    │
│  HLL est: 492                HLL est: 412        │
│                                                  │
│  [  Merge  ]                                     │
│                                                  │
│  Combined crowd: 700 unique  (200 overlap)       │
│  Merged HLL est: 708                             │
│  Naive sum: 892  ← wrong! double-counts overlap  │
└──────────────────────────────────────────────────┘
```

#### Behavior
- Two separate crowds with some shared members (overlap)
- Each has its own HLL sketch
- Merge button: element-wise max of registers, re-estimate
- Shows that merged estimate ≈ true union size, while naive sum overcounts

---

## Build and Integration Plan

### Phase 1: Simulation Engine
- [ ] Write `hll-sim.ts` with all core functions
- [ ] Unit tests for each function (verify estimates are in expected range)
- [ ] Export as ES module

### Phase 2: Hugo Shortcode Infrastructure
- [ ] Create `layouts/shortcodes/interactive.html` — emits a div with id and data attributes
- [ ] Create `static/js/` directory for compiled component bundles
- [ ] Build pipeline: TypeScript → esbuild/Vite → static JS bundles
- [ ] Each component gets its own entry point and bundle (code-split)

### Phase 3: Components (build in narrative order)
1. [x] Component B: CoinBinaryEquivalence ✅
2. [x] Component C: MaxStreakDistribution ✅
3. [ ] Component H: HashExplorer (for Part 2 — hashing post)
4. [ ] Component I: AvalancheDemo (for Part 2 — hashing post)
5. [ ] Component A: CoinFlipCrowd (Part 1 enhancement)
6. [ ] Component D: CrowdPartition (Part 3 — register visualization)
7. [ ] Component E: MeanComparison (Part 3 — relatively simple)
8. [ ] Component F: StabilityShowdown (Part 3 — hero component, most complex)
9. [ ] Component G: MergeDemo (Part 3 — stretch goal)

### Phase 4: Blog Posts
- [x] Write Part 1 Markdown with shortcode placements ✅ (draft live, needs minor edits)
- [ ] Write Part 2 Markdown (hashing post) with shortcode placements
- [ ] Write Part 3 Markdown (splitting the crowd) with shortcode placements
- [ ] Write Part 4 Markdown (building from scratch)
- [ ] Style components to match the `stochastic` theme (teal/orange data-viz palette, monospace numbers)
- [ ] Test dark/light mode for all components
- [ ] Responsive design: components must work on mobile (stacked layout instead of side-by-side)

### Dependencies
- **D3.js** (v7): For all visualizations — axes, scales, transitions, histograms
- **React** (v18): For component UI (sliders, buttons, state management)
- **esbuild** or **Vite**: Bundle TypeScript/React into static JS
- No server-side dependencies — everything runs in the browser
