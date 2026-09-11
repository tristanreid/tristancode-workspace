---
title: "Runaway Recursion: When an Eager Definition Can Never Bottom Out"
description: "Some self-referential definitions aren't just wasteful under eager evaluation, they never terminate at all — not because of a missing base case, but because the recursive call sits where eager evaluation is forced to resolve it before anything can be returned."
lesson_number: 32
track: fp
aliases: ["/learn/0032-puzzle/"]
concept: "Runaway recursion"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [30, 31]
skin: chalkboard
numeric:
  question: "Using the lazy nats_from(n) and take(k, stream) from Lesson 31, generalize nats_from to start anywhere, then compute sum(take(5, nats_from(10))). What's the sum?"
  answer: 60
  tolerance: 0
  unit: "sum"
---

**Warm-up recall (Lesson 12).** The **accumulator pattern**: instead of combining results on the way
*back up* the recursion, thread a running total down as an extra argument, updating it on the way
*down*, so the final call just returns it — no work left to do after the recursive call returns.
Write `product_acc(list, acc)` for a tail-recursive product, and compute `product_acc([2, 3, 5], 1)`.
Keep the number; the solution confirms it.

---

**Terms (standalone):**

- **Eager evaluation** (Lesson 30): an argument expression is fully computed before the function
  that receives it runs.
- **Runaway recursion**: a recursive *definition* that can never produce a value under eager
  evaluation — not because it's missing a base case, but because the recursive call sits in a
  position (an argument, or inside an expression like `+`) that eager evaluation must fully resolve
  before it can construct anything to return. The recursion never "runs out of steam"; it never gets
  a chance to stop.

### The trap

Lesson 31 defined an infinite stream with a lazy tail: `LazyCons(n, lambda: nats_from(n+1))`. What if
you tried the naive, "obvious" eager equivalent — an ordinary list, built by ordinary list
concatenation?

```python
def nats_eager(n):
    return [n] + nats_eager(n + 1)
```

Call `nats_eager(0)`. It does not run slowly, and it does not merely waste work the way Lesson 30's
`pick_eager` did. **It never returns at all** — not even the first element. Under eager evaluation,
Python must fully evaluate the right-hand operand of `+` — that is, the *entire* result of
`nats_eager(n + 1)` — before it can construct the list `[n] + (that result)`. But
`nats_eager(n + 1)` has exactly the same shape: to return *its* list, it must first fully evaluate
`nats_eager(n + 2)`. And so on, forever. There is no point at which any call can hand back a value,
because every call's own return value is defined as "something built from the fully-resolved result
of the next call." The recursion isn't slow to reach a base case — there's no way to ever start
returning, because the very first `+` is already blocked on the entire infinite rest.

Lesson 31's `LazyCons(n, lambda: nats_from(n + 1))` sidesteps this completely: `lambda: nats_from(n+1)`
is a thunk — building it requires *zero* evaluation of `nats_from(n+1)`. The recursive call is
present in the definition, but wrapped so it is never actually invoked until (and unless) something
calls the thunk. That's the entire difference between "runs forever" and "returns instantly."

---

### Part 1 — Would a base case fix it?

`nats_eager` has no stopping condition. Suppose you bolted one on:
`nats_eager(n) = [] if n > 1000000 else [n] + nats_eager(n + 1)`. Would `nats_eager(0)` now return?
If so, what have you gained back, and — compare to Lesson 31's `nats_from` — what have you *not*
gained back, even though it now terminates?

---

### Part 2 — Generalize the lazy fix

Lesson 31's `nats_from(n)` was already general in `n` — you don't need to change it. Write
`take(k, stream)` from memory (or copy it from Lesson 31) if you need it, and confirm:
`take(5, nats_from(10))` should give five numbers starting at 10.

---

### Part 3 — The graded question (above)

Compute `sum(take(5, nats_from(10)))`. Enter the result in the numeric box.

---

### Part 4 — Where else this shows up

`nats_eager` fails because the recursive call is on the *far side* of an operator (`+`) that needs
both sides fully resolved. Name one other everyday operation (not `+`) where putting a recursive
call as an operand would create the same kind of unconditional, unstoppable eager recursion,
regardless of what base case you add.
