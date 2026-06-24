---
title: "Push the Effects to the Edge"
description: "Separate a function that mixes computation with I/O into a pure core and an effectful shell — then see why that split matters."
lesson_number: 8
concept: "Side effects at the boundary"
stage: 0
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [1, 7]
skin: chalkboard
---

**Side effects** — printing, reading input, writing files, talking to a database — are unavoidable.
Real programs must do them. The question isn't whether to have them; it's *where* to put them.

Recap of terms used here:

- A **pure function** produces an output that depends only on its inputs and has no side effects.
  It can be called any number of times, in any order, without changing the world.
- **Referential transparency** (Lesson 7): a pure call can always be replaced by its result.
- **Side effect**: anything a function does *besides* returning a value — printing, mutating global
  state, making network requests, generating random numbers, reading the clock, etc.

The functional strategy is **"effects at the edges"**: write a pure *core* that does all the
interesting computation, wrap it with a thin *shell* that handles I/O. The core stays fully
testable, reusable, and safe to parallelize. The shell knows how to talk to the outside world.

---

Here is a function that mixes everything together:

```python
def run():
    n = int(input("Enter a positive integer: "))
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            total += i * i          # add square of even numbers
        else:
            total -= i              # subtract odd numbers
    print(f"Result for {n}: {total}")
```

**Your task:** split `run` into two pieces:

1. **A pure function** `compute(n)` that takes an integer and returns the result (no input, no
   print). It should contain all the interesting logic.
2. **A thin shell** `run()` that reads the integer from the user, calls `compute`, and prints the
   result.

Before revealing: sketch out what you want `compute(n)` to return for `n = 4`.
(Even numbers ≤ 4: 2, 4. Odd numbers ≤ 4: 1, 3.
Result: `2² + 4² - 1 - 3 = 4 + 16 - 1 - 3 = 16`.)

Think about this: after the split, how would you write a test for `compute` vs. how would you test
the original `run`? What changed?
