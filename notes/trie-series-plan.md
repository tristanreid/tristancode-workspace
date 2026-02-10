# Trie Blog Series — Plan

## Series: "Tries: The Data Structure Behind Entity Detection"

Skin: `graph` (notebook / technical — good fit for data structure content with diagrams)

### Interactive Component: D3 Trie Visualizer

A reusable D3 component that renders any trie as an animated SVG tree diagram. Core capabilities:
- Accept a list of words, build and render the trie
- Animate insertions step by step (node-by-node highlighting)
- Color-code shared prefixes vs. unique suffixes
- Highlight leaf/value nodes distinctly
- Show the text-scanning process: given input text, animate the cursor walking the trie
- Export static SVGs (for potential "trie" site theme — scattered trie diagrams as background art)

Architecture:
- `interactive/src/trie-engine.ts` — TypeScript trie data structure (generic, with insert/search/match)
- `interactive/src/trie-viz.ts` — D3 rendering engine (takes a trie, renders SVG with transitions)
- `interactive/src/components/trie-explorer.ts` — Interactive "type words and watch the trie grow" component
- `interactive/src/entries/trie-explorer.ts` — Entry point

---

## Post Structure

### Post 1: "What Is a Trie?"

The data structure itself, explained visually and intuitively.

**Key content:**
- The name: from "re**trie**val" — Edward Fredkin, 1960
- The core idea: a tree that shares prefixes. Every string is a path from root to leaf.
- Visual walkthrough: start empty, insert words one by one, watch the tree grow
- **Interactive component**: "Trie Explorer" — type words into an input, watch the trie build in real-time with D3 animations
- Why tries matter: O(M × L) multi-pattern matching vs O(N × M) brute force
- Prefix compression: how shared structure saves memory
- What tries store: not just "is this word present?" — values at leaves, multiple values, scoring
- The Python implementation: walk through a clean ~100-line implementation
- Where tries show up: autocomplete, spell-check, IP routing, DNA sequence analysis, entity detection

**Interactive components:**
- `trie-explorer`: type words, watch the trie build
- Could also have a "search demo": type text, see the trie walk character by character and find matches

### Post 2: "Visualizing Data Structures with D3"

How we built the interactive trie visualizer — a "making of" post.

**Key content:**
- The goal: a reusable component that takes any word list and renders an animated trie
- Why D3: declarative data binding, smooth transitions, SVG output
- The layout algorithm: d3-hierarchy tree layout, node positioning
- Animating insertions: enter/update/exit pattern, transition timing
- Making it theme-aware: reading CSS custom properties for colors
- Generating static SVGs: using the same renderer to produce decorative trie images
- **The trie theme**: scattered trie SVGs as background art for blog posts (like the taxicab theme scatters cabs)

### Post 3: "Scanning Text with a Trie"

Multi-pattern matching — the killer application.

**Key content:**
- The problem: find all known entities in a document, fast
- The scan algorithm: for each starting position, walk the trie; emit matches at leaf nodes
- Word boundaries: why matching "ROMA" inside "ROMAnce" is wrong, and how to prevent it
- Case sensitivity as signal: the dual-trie pattern
- Overlapping matches and resolution strategies
- Interactive: paste text, see all matches highlighted with their trie paths
- Performance: why this beats regex/hash for large pattern sets

### Post 4: "Broadcasting a Trie in Spark" (or "Tries at Scale")

The distributed computation angle.

**Key content:**
- The problem: 100K entity names × 10M documents — how do you scan them all?
- Broadcast vs. join: replicate the small thing, don't shuffle the big thing
- Why tries are ideal for broadcast: compact (shared prefixes), serializable, read-only
- The tie-breaker pattern: what happens when multiple entities share a surface form
- Write-time vs. read-time merging: a bridge to the Mergeable Operations series
- The Trie as a distributed data structure: could you merge tries across machines?

---

## Theme Idea: "Trie" Theme

A new site theme where the background features scattered trie diagrams rendered as SVGs, similar to how:
- `stochastic` scatters bell curves, histograms, and scatter dots
- `taxicab` scatters cute SVG taxicabs

The tries could be rendered from different word sets (programming terms, data structure names, etc.) at random sizes, positions, and subtle opacities. The D3 trie renderer would be used to generate these SVGs.

This would be built after the core visualizer is working and proven.

---

## Connections

- **HLL series**: Both are "elegant data structures" — similar narrative arc (intuition → algorithm → implementation)
- **Entity Resolution series**: Tries power entity detection — this series is the foundation
- **Mergeable Operations series**: The tie-breaker is a merge operation; broadcast is a replication strategy
