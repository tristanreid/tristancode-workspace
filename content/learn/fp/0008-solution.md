---
title: "Solution: Push the Effects to the Edge"
description: "The pure core + effectful shell split, why it matters for testing and parallelism, and the general principle behind functional architecture."
lesson_number: 8
track: fp
aliases: ["/learn/0008-solution/"]
concept: "Side effects at the boundary"
stage: 0
layout: solution
role: solution
builds_on: [1, 7]
skin: chalkboard
---

### The split

```python
def compute(n):
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            total += i * i
        else:
            total -= i
    return total

def run():
    n = int(input("Enter a positive integer: "))
    result = compute(n)
    print(f"Result for {n}: {result}")
```

`compute(4)` → `2² + 4² − 1 − 3 = 4 + 16 − 1 − 3 = 16`.

`compute` is pure: same input, same output, always, no matter how many times you call it. `run` is
the only place that touches I/O.

### Why the split matters

**Testing.** The original `run` is nearly untestable without mocking `input` and capturing stdout.
After the split:

```python
assert compute(4) == 16
assert compute(1) == -1
assert compute(0) == 0
```

Three lines. No mocking, no test harness magic. The pure core is fully exercised.

**Reuse.** Suppose you later want a web endpoint, a batch pipeline, or a REPL that calls the same
logic. You call `compute(n)` directly. You don't have to unpick the I/O from the math.

**Parallelism.** Because `compute` is referentially transparent, you can run a thousand calls
concurrently — `compute(1)`, `compute(2)`, …, `compute(1000)` — and they share no state. No
locks, no coordination. A sequential I/O loop on the outside is totally fine; the expensive math
goes wide.

### The general principle

Real programs have a shape:

```
[Input / I/O] ──► [Pure core] ──► [Output / I/O]
```

Input at the left edge parses the outside world into plain values (integers, strings, records).
The pure core transforms them — all the interesting logic lives here. Output at the right edge
writes results back to the world (print, file, network).

The more of your program that lives in the pure core, the more of it you can reason about,
test, and parallelize without ceremony. Keep the edges thin.

### What "thin shell" looks like in practice

In larger systems the shell might:
- Parse command-line arguments into a config struct
- Read a file and decode it into domain types
- Call the pure core with those types
- Serialize the output and write it back

The shell does *no* logic beyond translation. That discipline is what makes large functional
codebases tractable. In Scala or Haskell you'd see this called "IO at the boundary" — the type
system *enforces* that effectful code lives separately. Python doesn't enforce it, but the
discipline still pays.

**Next:** enough foundations — back to recursion. We'll use the `contains` search and then build
`map`-by-hand (applying a function to each element of a list), the move that eventually becomes one
of the most powerful tools in Stage 2 (Lesson 9).
