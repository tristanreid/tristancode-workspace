---
title: "Solution: Infinite Structures via Laziness — A Stream of Naturals"
description: "nats_from builds an infinite stream in O(1) because the tail is a thunk, not a value; lazy_filter preserves that property; the first four multiples of 3 (0, 3, 6, 9) sum to 18."
lesson_number: 31
track: fp
aliases: ["/learn/0031-solution/"]
concept: "Infinite structures via laziness"
stage: 5
layout: solution
role: solution
builds_on: [30]
skin: chalkboard
---

### Warm-up recall answer

A product type multiplies its options together: `4 suits × 13 ranks = 52` distinct cards. **52.**

---

### Part 1 — Trace `take(3, nats_from(0))`

```
stream = nats_from(0) = LazyCons(0, thunk→nats_from(1))
iter 1: head=0, result=[0], stream = stream.tail_thunk() = nats_from(1) = LazyCons(1, thunk→nats_from(2))
iter 2: head=1, result=[0,1], stream = nats_from(2) = LazyCons(2, thunk→nats_from(3))
iter 3: head=2, result=[0,1,2], k reaches 0 → stop

result: [0, 1, 2]
```

At no point does anything past `nats_from(2)` get built — `nats_from(3)` exists only as an unforced
thunk sitting inside the last `LazyCons` produced, and `take` never calls it.

---

### Part 2 — `lazy_filter`

```python
def lazy_filter(pred, stream):
    while not pred(stream.head):
        stream = stream.tail_thunk()          # skip non-matches, one forced step at a time
    return LazyCons(stream.head, lambda: lazy_filter(pred, stream.tail_thunk()))
```

The `while` loop forces exactly as many steps of the underlying stream as it takes to find the next
match — no more. Once found, the *rest* of the filtering (everything past this match) is wrapped in
another thunk, so the next match isn't searched for until something calls `.tail_thunk()` again.
This is the same discipline as `nats_from`: return a real value for "now," defer everything after it.

---

### Part 3 — The graded answer: 18

```python
multiples_of_3 = lazy_filter(lambda x: x % 3 == 0, nats_from(0))
take(4, multiples_of_3)   # → [0, 3, 6, 9]
sum([0, 3, 6, 9])         # → 18
```

**18.** Note that `lazy_filter` had to force and discard `1` and `2` to find the second match (`3`),
then `4` and `5` to find the third (`6`), and so on — real work happens, just only exactly as much as
`take(4, ...)` demands. Ask for `take(1000, ...)` instead and it will happily keep going; the stream
never "runs out" because nothing about it was ever fully built.

---

### Part 4 — Why ordinary `filter` can't be used here

Lesson 10's `filter` is eager: it assumes it's been handed a *complete* list and scans all of it
before returning anything. Calling `filter(pred, nats_from(0))` first has to materialize
`nats_from(0)` as an actual finite list to scan — but `nats_from(0)` is infinite. The call would
hang forever (or, more precisely, `nats_from(0)` isn't even a Python list at all — it's a
`LazyCons`, so ordinary `filter` would error immediately trying to iterate something that was never
built to support eager iteration). This is exactly Lesson 30's lesson in a new shape: an eager
operation forces *all* of its input before producing *any* output, and "all of an infinite stream"
is not a value that can ever finish being produced.

---

### The pattern

**Laziness is what makes "infinite" a data structure you can hold, instead of a computation that
never finishes.** `nats_from(n)` is a value the moment it returns — a head plus a promise — never a
completed sequence. Every operation that consumes a lazy stream (`take`, `lazy_filter`, and anything
built on top of them) has to preserve that same discipline: produce what's asked for, defer
everything else as another thunk. Break that discipline anywhere in the chain (by calling ordinary,
eager `filter` on it, for instance) and the illusion of infinity collapses back into "a computation
that never returns."

**Why this matters for parallelism**: this is orthogonal to it, worth naming so you don't conflate
them — laziness controls *when* work happens (deferred until demanded), while parallelism controls
*where* work happens (multiple places at once). A lazy stream is still fundamentally sequential:
element `n+1` isn't available until you've forced element `n`'s thunk, because each `tail_thunk`
closes over the state needed to produce the next one. Stage 7's parallel combinators come from a
different property entirely — independence, not deferral.

**Next**: eager evaluation of a self-referential definition doesn't just waste work, sometimes it
never terminates at all. Lesson 32 shows exactly where that happens, and why the fix is the same
laziness you just used here.
