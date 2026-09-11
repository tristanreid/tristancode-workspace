---
title: "Infinite Structures via Laziness: A Stream of Naturals"
description: "A list of every natural number can't be built eagerly — it never finishes. Build it as a lazy stream instead, where the tail is a thunk, and take only as many elements as you actually need."
lesson_number: 31
track: fp
aliases: ["/learn/0031-puzzle/"]
concept: "Infinite structures via laziness"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [30]
skin: chalkboard
numeric:
  question: "From the lazy stream of all natural numbers starting at 0, filter to multiples of 3, take the first 4, and sum them. What's the sum?"
  answer: 18
  tolerance: 0
  unit: "sum"
---

**Warm-up recall (Lesson 19).** A **product type** ("all of") holds one value from *each* of several
fields at once — unlike a sum type ("one of"), which holds a value from exactly one variant. A
playing card is a product type: one `Suit` (4 options) *and* one `Rank` (13 options), together. How
many distinct cards does that product type have? Keep the number; the solution confirms it.

---

**Terms (standalone):**

- **Thunk** (Lesson 30): a zero-argument function that defers a computation until it's called.
- **Lazy stream**: a structure like `LazyCons(head, tail_thunk)`, where `head` is an already-computed
  value and `tail_thunk` is a thunk that, when called, produces the *rest* of the stream (another
  `LazyCons`, or a marker for "empty"). Because the tail is a thunk, it isn't built until something
  asks for it.

### Why eager can't do this

Try to eagerly build "the list of every natural number starting at `n`":

```python
def nats_eager(n):
    return [n] + nats_eager(n + 1)          # never returns — recurses forever, immediately
```

This isn't slow — it never completes even a single call, because Python must fully evaluate
`nats_eager(n + 1)` (the whole rest of the infinite list) *before* it can even construct `[n] + ...`.
There's no way to eagerly hand back "the first element, plus a promise for the rest," because eager
argument evaluation (Lesson 30) doesn't produce promises — it produces final values, all the way
down, before returning anything at all.

### The lazy fix

```python
class LazyCons:
    def __init__(self, head, tail_thunk):
        self.head = head
        self.tail_thunk = tail_thunk          # a thunk, not a value

def nats_from(n):
    return LazyCons(n, lambda: nats_from(n + 1))
```

`nats_from(n)` returns **immediately** — building `LazyCons(n, ...)` only needs `n` itself; the
`lambda: nats_from(n + 1)` is a thunk, not a call. Nothing about "the rest of the stream" is computed
until `.tail_thunk()` is actually invoked. The stream is infinite in principle, but you only ever pay
for the finite prefix you actually walk.

```python
def take(k, stream):
    result = []
    while k > 0:
        result.append(stream.head)
        stream = stream.tail_thunk()          # force exactly one more step
        k -= 1
    return result
```

```python
take(3, nats_from(0))     # → [0, 1, 2]
```

---

### Part 1 — Trace `take(3, nats_from(0))`

Step through `take`'s loop by hand: what is `stream.head` and what does `stream.tail_thunk()`
produce, at each of the three iterations?

---

### Part 2 — Filter a lazy stream

Write `lazy_filter(pred, stream)`, which returns a new lazy stream containing only the elements of
`stream` that satisfy `pred` — but still lazily (it should not eagerly scan the whole, infinite,
input stream up front). Hint: you may need to advance past several non-matching elements before you
know what the next `head` is, but you should still not touch anything past what's needed.

---

### Part 3 — The graded question (above)

Using `nats_from(0)`, `lazy_filter(lambda x: x % 3 == 0, ...)`, and `take(4, ...)`, compute the sum
of the first 4 multiples of 3 (starting from 0). Enter it in the numeric box.

---

### Part 4 — What would go wrong with `filter` instead of `lazy_filter`

If you used Lesson 10's ordinary (eager) `filter` on `nats_from(0)` directly — the one that scans a
whole list and returns the matches — what would happen when you ran it, and why?
