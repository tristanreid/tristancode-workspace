---
title: "Solution: Spot the Pure Function"
description: "Why add_tax is pure, why the other three aren't, and why purity is the foundation of parallelism."
lesson_number: 1
track: fp
aliases: ["/learn/0001-solution/"]
concept: "Pure functions"
stage: 0
layout: solution
role: solution
builds_on: []
skin: chalkboard
---

**The pure one is A, `add_tax`.**

Run it with `add_tax(100)` and you get `108.0` — today, tomorrow, on any machine, no matter what else
the program is doing. It reads its input (`price`), reads a constant (`TAX`), and returns a value. It
touches nothing else and changes nothing else. That's purity.

Here's why each of the others fails:

- **B — `add_to_cart` has a side effect.** `cart.append(item)` mutates a list that lives *outside* the
  function. Call it twice with the same `item` and the world is different each time — the cart keeps
  growing. The return value also depends on history, not just the argument.
- **C — `now_plus` depends on more than its inputs.** `time.time()` returns the current clock, so
  `now_plus(10)` gives a different answer every time you call it. Same input, different output → impure.
- **D — `greet` has a side effect and returns nothing.** `print` pushes text to the screen (the
  outside world). Its "result" is the act of printing, not a returned value.

### Why this is the foundation

Pure functions buy you three things that this whole path keeps cashing in:

1. **They're trivial to test.** No setup, no mocks — feed inputs, check the output.
2. **They can be cached (memoized).** If `f(100)` is always `108.0`, you can remember the answer and
   skip the work next time. That's only safe because nothing hidden can change the result.
3. **They can run in any order — including all at once.** This is the big one. If a function depends on
   nothing but its inputs and changes nothing shared, then two calls can run on two different cores at
   the same time and can't interfere. There's nothing to lock, because there's nothing shared to
   corrupt.

That last point is exactly why a massively parallel language like **Bend** leans so hard on pure
functions: its runtime spreads work across CPU and GPU cores *without you writing threads, locks,
mutexes, or atomics* — and it can only get away with that because pure code has no shared state to
fight over.

**Next:** purity's close partner is **immutability** — building new values instead of changing
existing ones. That's Lesson 2.
