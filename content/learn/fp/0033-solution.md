---
title: "Solution: Tail Calls — What an Accumulator Actually Buys You"
description: "sum_plain needs 40 simultaneous stack frames for a 40-element list; a TCO'd sum_acc needs 1, regardless of length — 39 frames saved. Python has no TCO, so the accumulator form alone doesn't save it from RecursionError."
lesson_number: 33
track: fp
aliases: ["/learn/0033-solution/"]
concept: "Tail calls & accumulators"
stage: 5
layout: solution
role: solution
builds_on: [6, 12, 32]
skin: chalkboard
---

### Warm-up recall answer

`Rectangle(4, 5)` matches the `Rectangle(w, h) → w*h` branch: `4 * 5 = 20`. **20.**

---

### Part 1 — `sum_plain` on 40 elements: 40 frames

Each call peels off one element and defers its `+` until the recursive call on the remaining
`39, 38, …, 1, 0`-element sublist returns. The base case (`lst` empty) is the 41st call but returns
immediately without recursing further — the *deepest simultaneous* stack, counting the original call
as depth 1, is the 40 calls that are each still waiting on their pending `+`: calls for the
40-element list down through the 1-element list. **40 frames.**

---

### Part 2 — `sum_acc` under TCO: 1 frame

Every call to `sum_acc` is in tail position — `return sum_acc(lst[1:], acc + lst[0])` has nothing
pending after the call. A TCO runtime recognizes this and reuses the *same* frame for every
recursive call instead of pushing a new one, since the old frame's locals are dead the instant the
tail call is made. Stack usage stays at **1 frame**, whether the list has 40 elements or 4 million —
this is exactly why languages that guarantee TCO can treat tail recursion as a genuine substitute
for a loop.

---

### Part 3 — The graded answer: 39

`40 (sum_plain) − 1 (sum_acc under TCO) = 39` frames saved, for the 40-element case specifically.
The savings scale with the list — a 4-million-element list would save roughly 4 million frames, not
because `sum_acc` got smarter, but because tail position plus TCO turns "one frame per call" into
"one frame, period."

---

### Part 4 — Python still has no TCO

**No** — rewriting `sum_plain` into `sum_acc` does **not** save you from `RecursionError` in Python
specifically, because the *rewrite alone* only creates the tail-call *opportunity*; it takes a
runtime that actually recognizes and optimizes tail calls to cash it in. Python's interpreter pushes
a genuine stack frame for every call, tail or not — `sum_acc` on a 10,000-element list still needs
roughly 10,000 real frames in Python, blowing past the ~1000-frame default limit exactly as
`sum_plain` would (perhaps even doing so, since both are equally "non-tail-call-optimized" from
Python's point of view — the accumulator's *shape* is TCO-friendly, but Python never checks).

To actually sum a 10,000-element list in Python without recursion-depth trouble, you'd rewrite the
recursion as an explicit loop:

```python
def sum_loop(lst):
    acc = 0
    for x in lst:
        acc += x
    return acc
```

This is, not coincidentally, *exactly* what TCO does mechanically to `sum_acc` under the hood in a
language that supports it — reuse one frame, update `acc` in place, repeat. In Python, you have to
perform that transformation yourself, by hand, as a loop, because the interpreter won't do it for
you.

---

### The pattern

**The accumulator pattern (Lesson 12) makes a function tail-recursive; TCO is what a runtime has to
do to actually turn "tail-recursive" into "constant stack space."** They are two separate things —
one is how you write the code, the other is a runtime guarantee some languages make and others
(Python, notably) don't. Writing tail-recursive code in a non-TCO language is not wasted effort — it
documents the loop-like structure clearly and it's a trivial mechanical step to a `while`/`for` loop
— but it does not, by itself, save you from a stack limit in that language.

**Stage 5 complete.** You've now covered eager vs. lazy evaluation, building infinite structures with
laziness, why an eager self-referential definition can run away instead of terminating, and what
tail position and TCO actually buy you in stack space. One thread is still open for a future batch:
*sharing vs. recomputation* — what happens when a pure, perfectly correct recursive definition
still does wildly redundant work, and how memoization fixes it without touching correctness at all.

**Also coming**: Stage 6 opens with continuation-passing style (CPS) — an explicit way of writing
"what happens next" as an ordinary value instead of leaving it implicit in the call stack, which
turns out to make *every* call a tail call by construction, closing the loop on today's lesson from
a completely different angle.
