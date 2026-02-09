# HyperLogLog Blog Series — Illustration & Visual Design Plan

## Design Philosophy

The illustrations serve three roles:

1. **Explanatory**: Make abstract concepts concrete (what does "leading zeros" look like? what does "splitting a crowd" look like?)
2. **Aesthetic**: These should be beautiful enough that someone would want to screenshot them. Think: the elegance of 3Blue1Brown or Bret Victor's explorable explanations.
3. **Evidential**: Show distributions and data that *prove* the claims we make (e.g., "HLL is more stable" should be visible in a tighter histogram, not just stated).

### Visual Style

Match the site's `stochastic` theme: clean probability/data-viz aesthetic, teal + orange accents, slate tones, monospace fonts for numbers.

**Color Palette** (derived from stochastic theme CSS variables):
- Primary/Accent: Teal (#0d9488 light / #2dd4bf dark) — for main data elements, chart fills, "good" estimates, crowds
- Accent Secondary: Orange (#f97316 light / #fb923c dark) — for highlighted elements (record holders, outliers, instability warnings)
- Text: Slate-900 (#0f172a light) / Slate-200 (#e2e8f0 dark)
- Text Secondary: Slate-500 (#475569) / Slate-400 (#94a3b8)
- Borders: Slate-300 (#cbd5e1 light) / Dark blue-gray (#1e2d3d dark)
- Code/Dark surfaces: Slate-900 (#0f172a) — for chart backgrounds in dark mode
- Accent glow: rgba(13,148,136,0.10) — subtle teal halos for interactive hover states
- Register colors: 8–16 distinct, muted colors for sub-crowd partitioning (use a colorblind-safe categorical palette like ColorBrewer Set2, anchored to the teal/orange endpoints)

**Typography** (from stochastic theme):
- Chart labels: JetBrains Mono / Fira Code (var(--font-mono))
- Annotations: Inter / system sans-serif (var(--font-sans)), smaller weight
- Numbers: always monospace for alignment

---

## Static Illustrations (SVG or High-Quality PNG)

These accompany the text and are not interactive. They can be generated with D3 (exported as SVG) or drawn in a tool like Figma/Excalidraw.

### Illustration S1: "The Crowd and the Game"

**Used in**: Part 1, Section 1.2 (opening)

A wide, landscape illustration showing:
- A crowd of ~50 simple figures (circles with stick bodies, or just circles — keep it geometric)
- Speech bubbles or thought bubbles showing their coin flip results: "T T H" → 2, "H" → 0, "T T T T H" → 4
- One figure highlighted (glow or different color) with a long streak: "T T T T T T T T H" → 8
- A banner or callout: "Longest streak: 8 → Estimate: 2^8 = 256"

**Style**: Whimsical but clean. Like a New York Times data graphics piece.

---

### Illustration S2: "Coin Flips = Binary Strings"

**Used in**: Part 1, Section 1.3

A two-column visual showing the equivalence:

```
COIN FLIPS          BINARY
─────────           ──────
T  T  T  H    →    0  0  0  1
   ↕                  ↕
 tails=3          leading zeros=3
```

Show 4–5 examples stacked vertically, with the coin flip sequence on the left (actual coin icons: tails/heads) and the binary digit string on the right. Lines connect each coin to its bit. The "leading zeros" count is highlighted.

---

### Illustration S3: "Every Item Gets a Coin Sequence (via Hashing)"

**Used in**: Part 1, Section 1.4

A flow diagram:

```
"user_42"  →  hash()  →  0010 1101 0111 ...  →  leading zeros: 2
"alice@x"  →  hash()  →  0000 0110 1010 ...  →  leading zeros: 4
"user_42"  →  hash()  →  0010 1101 0111 ...  →  same hash! (dedup)
"bob_99"   →  hash()  →  1001 0010 0011 ...  →  leading zeros: 0
```

Key visual: the duplicate item ("user_42") produces the identical hash — showing automatic deduplication. The binary strings should have leading zeros highlighted in a different color.

---

### Illustration S4: "The Powers-of-Two Problem"

**Used in**: Part 1, Section 1.6

A number line showing only the possible estimates from the single-max method:

```
    1    2    4    8    16   32   64   128   256   512  1024  2048  ...
    ●    ●    ●    ●    ●    ●    ●    ●     ●     ●    ●     ●
                                                   ↑
                                             True N = 750
                                             (but we can only say 512 or 1024)
```

The gaps between estimates grow exponentially. The true N falls between two estimates, illustrating the coarseness.

---

### Illustration S5: "The Avalanche Effect"

**Used in**: Part 2, Section 2.3

A grid visualization showing sequential inputs and their hashes:

```
Input     Hash (first 16 bits)          Leading 0s
─────     ──────────────────────        ──────────
"1"       ██░░██░██░░██░░░██            0
"2"       ░░░░░██░██░░██░██░            4
"3"       ██░░██░██░░░██░░██            0
"4"       ░░░██░██░░██░██░██            3
"5"       ██░██░░░██░██░░██░            0
```

Each bit shown as a teal square (1) or empty square (0). Leading zeros are highlighted in orange. The visual point: there's no pattern — adjacent inputs produce unrelated bit patterns.

---

### Illustration S6: "Hashing Is the Great Equalizer"

**Used in**: Part 2, Section 2.5

Two panels showing the same items before and after hashing:

**Panel A** — "Raw data has structure":
- Number line with items clustered (e.g., sequential IDs 1–1000)
- Clear pattern, predictable distribution

**Panel B** — "Hashed data looks uniform":
- Same items, now their hash values are scattered uniformly across the range
- No pattern, uniform distribution
- Histogram of leading-zero counts matches geometric distribution

Between the panels: "The hash function erases all structure. HLL sees only randomness."

---

### Illustration S7: "Splitting the Crowd"

**Used in**: Part 3, Section 3.2 (the key "aha" illustration)

A two-panel illustration:

**Panel A** — "One big crowd":
- All dots in a single cluster, one color
- Single max streak shown

**Panel B** — "Same crowd, partitioned into 4 sub-crowds":
- Same dots, now separated into 4 colored groups
- Each group has its own max highlighted
- Arrow pointing to combined estimate

Between the panels: "Same people. Same data. More stable answer."

This should be a signature illustration — give it space.

---

### Illustration S8: "Why Harmonic Mean?"

**Used in**: Part 3, Section 3.4

A simple visual showing sub-crowd estimates on a number line:

```
Sub-crowd estimates:  16  16  32  16  32  16  16  512
                      ●   ●   ●   ●   ●   ●   ●   ●──────→ outlier

Arithmetic mean:  ────────────────────●─── = 82
Harmonic mean:    ────●──────────────────── = 24
True value:       ─────●─────────────────── = ~25
```

The outlier at 512 drags the arithmetic mean far to the right. The harmonic mean stays put near the truth. Use color to show: harmonic mean = teal (good), arithmetic mean = red (bad).

---

### Illustration S9: "The Memory Miracle"

**Used in**: Part 3, Section 3.6

An infographic-style comparison:

```
┌─────────────────────────────────────────────┐
│  Counting 1 billion unique users             │
│                                             │
│  Exact (HashSet):     ~64 GB RAM    ████████│
│  HyperLogLog (m=16k): ~12 KB RAM   ▏       │
│  Error:               ~0.8%                 │
│                                             │
│  That's 5,000,000x less memory.             │
└─────────────────────────────────────────────┘
```

Use a proportional bar chart — but the HLL bar would be invisible at scale, which *is* the point. Maybe use a zoom-in inset to show the HLL bar.

---

### Illustration S10: "Merging Sketches"

**Used in**: Part 3, Section 3.8

Two HLL register arrays shown as bar charts (vertical bars, one per register):

```
Sketch A:  [3, 5, 2, 7, 4, 1, 6, 3, ...]
Sketch B:  [4, 3, 5, 2, 6, 3, 4, 5, ...]
Merged:    [4, 5, 5, 7, 6, 3, 6, 5, ...]  ← max of each position
```

Show register-by-register max operation with arrows. Color the "winning" value in each position.

---

## Animated / Interactive Illustration Notes

### Animation Principles

- **Transitions should be meaningful**: When dots move from one layout to another (e.g., single crowd → partitioned), the animation shows that these are the *same* items reorganizing
- **Speed**: Fast enough to not bore (300–500ms for most transitions), slow enough to see what happened
- **Easing**: Use ease-in-out for most transitions. Linear for progress animations.
- **Stagger**: When many elements animate simultaneously, stagger them slightly (10–20ms offset per element) for a satisfying cascade effect

### Responsiveness

- All components must work at mobile widths (320px+)
- Side-by-side layouts (Component F) stack vertically on narrow screens
- Crowd visualizations reduce dot count on small screens (show 200 instead of 1000, with a note)
- Sliders and controls should be touch-friendly (min 44px tap targets)

### Accessibility

- All charts need aria-labels with the key takeaway
- Color is never the *only* encoding — use shape (star for record holders), size, or pattern as redundant channels
- Interactive controls need keyboard support
- Provide a text summary below each interactive component for screen reader users

---

## Production Workflow

### Static illustrations
1. Draft in Excalidraw or Figma (quick iteration)
2. Finalize as SVG (clean, themeable, resolution-independent)
3. Place in `static/images/hll/` directory
4. Reference in Markdown: `![alt text](/images/hll/filename.svg)`

### Interactive components
1. Develop in isolation (Storybook or standalone HTML page)
2. Style to match stochastic theme (import CSS variables: --accent, --accent-secondary, --font-mono, etc.)
3. Test both light and dark mode
4. Bundle and place in `static/js/hll/`
5. Hugo shortcodes load the bundles

### Chart generation (for the histograms/distributions shown in static form)
- Write D3 scripts that can render to both DOM (for interactive) and export to SVG (for static fallback)
- This means every interactive chart also has a static SVG version — useful for RSS feeds, social cards, and no-JS browsers

---

## Summary of All Visuals by Section

| Section | Type | Component/Illustration | Priority | Status |
|---------|------|----------------------|----------|--------|
| P1 §1.2 | Interactive | B: CoinBinaryEquivalence | High | ✅ Built |
| P1 §1.3 | Static | S1: The Crowd and the Game | High | |
| P1 §1.3 | Interactive | A: CoinFlipCrowd | Medium | |
| P1 §1.3 | Static | S2: Coin Flips = Binary | Medium | |
| P1 §1.4 | Static | S3: Hashing flow diagram | Medium | |
| P1 §1.5 | Interactive | C: MaxStreakDistribution | High | ✅ Built |
| P1 §1.6 | Static | S4: Powers-of-Two Problem | Medium | |
| P2 §2.2 | Interactive | H: HashExplorer | **High** | |
| P2 §2.3 | Static | S5: The Avalanche Effect | High | |
| P2 §2.3 | Interactive | I: AvalancheDemo | **High** | |
| P2 §2.5 | Static | S6: Hashing Is the Great Equalizer | Medium | |
| P3 §3.2 | Static | S7: Splitting the Crowd | High | |
| P3 §3.2 | Interactive | D: CrowdPartition | High | |
| P3 §3.4 | Static | S8: Why Harmonic Mean? | Medium | |
| P3 §3.4 | Interactive | E: MeanComparison | Medium | |
| P3 §3.5 | Interactive | F: StabilityShowdown | **Critical** | |
| P3 §3.6 | Static | S9: Memory Miracle | Medium | |
| P3 §3.8 | Static | S10: Merging Sketches | Low | |
| P3 §3.8 | Interactive | G: MergeDemo | Low | |
