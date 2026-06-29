# Puzzle Curriculum — the spine

This is the ordered concept map the weekly generator follows. It teaches the ideas behind the **Bend**
language (massively parallel, pure-functional) *in the abstract* — not Bend's syntax. Concrete
languages appear only when they illuminate a concept, and are always explained enough that an
experienced developer who has never seen them can follow.

## Audience

Tristan: experienced software developer. Day-to-day in **Python, SQL, TypeScript**, some **Scala**,
heavy **Spark** for data processing. Past exposure to **Clojure, Akka, CoffeeScript**. Comfortable
with code; the point is the *concept*, not syntax. He may fast-forward through easy material and do
several lessons in a day, so the path must stay correct and well-ordered rather than time-padded.

## Hard rules for every lesson

1. **Standalone.** Re-define every term used (e.g. "a *pure function* is one whose output depends
   only on its inputs, with no side effects"). Never assume memory of a previous lesson.
2. **Build, but link.** When a lesson leans on an earlier concept, add it to `builds_on` so the
   backlink renders. Going deeper is opt-in, not required.
3. **5–10 minutes.** One idea, sharply. If it needs more, split it across lessons.
4. **Concept over jargon.** Use a real language only when the concept benefits. Then give enough that
   a motivated dev unfamiliar with it can follow. Prefer Python/TS/Scala-flavored pseudocode for
   neutral examples.
5. **Classical before clever.** Before any alternative/optimized version of a classic algorithm or
   data structure, ensure earlier lessons established the classical version.
6. **Solution teaches.** The solution page fully explains the concept, the *why*, common pitfalls,
   and a forward hook ("this is the seed of folds, coming up").
7. **Connect to the through-line** when natural: purity + immutability + associativity are what make
   work safely parallelizable (Bend's "no threads, locks, mutexes, atomics").

## Answer types (pick the best fit per lesson)

- `reveal` — think/sketch, then reveal the solution. Best for "write this function" puzzles.
- `mcq` — multiple choice, client-checked. Best for "which of these is X / predict the result".
- `code` — in-browser runnable check. **Not built yet** (Phase D). Don't use until tooling exists.

## The stages (ordered)

### Stage 0 — Foundations of the functional mindset
- [x] L1 Pure functions (output depends only on inputs; no side effects) — `mcq`
- [x] L2 Immutability & expressions vs statements (build new values, don't mutate) — `mcq`
- [x] L7 Referential transparency & substitution (replace a call with its result) — `mcq`
- [x] L8 Side effects at the edges (why pushing effects to the boundary helps) — `reveal`

### Stage 1 — Recursion over lists
- [x] L3 Recursion basics: sum a list (base case + recursive case) — `reveal`
- [x] L4 Last element (two-branch base: empty vs single) — `reveal`
- [x] L5 Length recursively (counting; teaser: accumulators) — `mcq`
- [x] L6 Reverse (naive O(n²) vs accumulator O(n); efficiency teaser) — `reveal`
- [x] L9 Membership / find; map-by-hand (transform each element) — `reveal`
- [x] L10 Filter-by-hand; take / drop / nth — `reveal`
- [x] L11 Flatten a nested list (recursion that recurses on both head and tail) — `reveal`
- [x] L12 Accumulator pattern & tail recursion proper (constant stack) — `reveal`

### Stage 2 — Higher-order functions & closures
- [x] L13 Functions as values; passing a function in — `mcq`
- [x] L14 Build `map` from scratch; then `filter` — `reveal`
- [x] L15 Build `reduce`/`foldLeft` from scratch — the universal list consumer — `reveal`
- [x] L16 Closures: a function that captures its environment (counter/adder factory) — `mcq`
- [x] L17 Partial application & currying; function composition — `reveal`
- [x] L18 `reduce` reconstructs map/filter/sum — one combinator to rule lists — `reveal`

### Stage 3 — Algebraic data types, pattern matching, trees, folds
- [x] L19 What an ADT is (sum types / "one of"; product types / "all of") with a neutral encoding
- [x] L20 Pattern matching as structured case analysis (vs if/else + accessors)
- [x] L21 Model a binary tree as an ADT; size & depth by recursion
- [x] L22 Mirror a tree; sum a tree
- [x] L23 **Fold as elimination**: a fold is a recursive `match` that consumes a structure
- [x] L24 "Choose the representation, then erase it with a fold"

### Stage 4 — Building data (the dual of folding)
- [x] L25 Unfold: generate a structure from a seed (range, repeat)
- [x] L26 Build a tree top-down from a seed (the `bend`-style pure recursive loop)
- [x] L27 Fold ∘ unfold; why "build then consume" is a clean mental model

### Stage 5 — Evaluation strategy as a tool
- [x] L28 Eager vs lazy evaluation (when is the argument computed?)
- [x] L29 Infinite structures via laziness (lazy naturals / streams)
- [x] L30 Runaway recursion: why an eager recursive definition can expand forever
- [ ] Tail calls & why some languages need accumulators to avoid stack blowups
- [ ] Sharing vs recomputation; spotting duplicated work

### Stage 6 — Continuations
- [ ] "What happens next" as an explicit value: continuation-passing style (CPS)
- [ ] CPS turns recursion into a loop; tail-call connection
- [ ] Early exit / escape via continuations
- [ ] (Optional) callbacks → CPS → why async looks the way it does

### Stage 7 — Parallel combinators & cost models  ← the Bend payoff
- [ ] `map` is embarrassingly parallel (independent work)
- [ ] Associativity & monoids: why `reduce` can split a list into a tree of work
- [ ] `foldl` vs `reduce`: sequential dependency vs parallel reduction (span)
- [ ] **Work vs span**: total operations vs critical-path depth
- [ ] `scan` (prefix sums) — the surprisingly-parallel running total
- [ ] `any`/`all`/`scatter`; flattening nested `map`s into one kernel
- [ ] Re-derive an earlier sequential solution as map/reduce/scan

### Stage 8 — Affine / once-use thinking (Bend-specific)
- [ ] Linear/affine variables: use each value once; copying is explicit
- [ ] Where sharing & duplication actually live; why it matters for a parallel runtime
- [ ] Interaction-nets intuition (very light): computation as local graph rewriting

## Generation marker

`last_generated_lesson: 30`
(The generator updates this after each run. New lessons continue the next unchecked item, in order.)
