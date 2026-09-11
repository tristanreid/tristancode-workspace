---
title: "Solution: Eager vs Lazy — Counting the Wasted Work"
description: "Six total calls to expensive() under eager evaluation, one wasted per line — three wasted evaluations total, which is exactly what a thunk-based lazy version would avoid."
lesson_number: 30
track: fp
aliases: ["/learn/0030-solution/"]
concept: "Eager vs lazy evaluation"
stage: 5
layout: solution
role: solution
builds_on: []
skin: chalkboard
---

### Warm-up recall answer

`[3, 9, 16, 20]`: index 0 is `3` (not `>15`), index 1 is `9` (not `>15`), index 2 is `16` (`>15` ✓).
**Index 2.**

---

### Part 1 — Total calls: 6

Each of the three lines calls `expensive` twice (once per argument), and Python evaluates both
arguments before `pick_eager`'s body runs at all — the value of `cond` has no bearing on whether
either argument expression executes. `3 lines × 2 calls = 6` total calls to `expensive`.

---

### Part 2 — The wasted call on each line

- `pick_eager(True, expensive(3), expensive(4))` → returns `a` (`cond` is `True`) → `expensive(4)`
  was computed and discarded.
- `pick_eager(False, expensive(5), expensive(6))` → returns `b` → `expensive(5)` was wasted.
- `pick_eager(True, expensive(7), expensive(8))` → returns `a` → `expensive(8)` was wasted.

Exactly one of the two calls is wasted on every line, because `pick_eager` only ever uses one branch
— the `if/else` picks a single value — but eager evaluation had already paid for both before the
`if/else` ran.

---

### Part 3 — The graded answer: 3

Three lines, one wasted `expensive` call each: **3 wasted evaluations**, out of 6 total.

---

### Part 4 — The lazy version

```python
def pick_lazy(cond, a_thunk, b_thunk):
    return a_thunk() if cond else b_thunk()
```

```python
pick_lazy(True,  lambda: expensive(3), lambda: expensive(4))
pick_lazy(False, lambda: expensive(5), lambda: expensive(6))
pick_lazy(True,  lambda: expensive(7), lambda: expensive(8))
```

`lambda: expensive(3)` builds a **thunk** — a zero-argument function that, when called, runs
`expensive(3)`. Building the thunk does *not* run `expensive`; only calling it (`a_thunk()`) does.
Inside `pick_lazy`, the `if/else` calls exactly one of `a_thunk`/`b_thunk` — never both — so exactly
**one `expensive` call happens per line, 3 total**, instead of 6.

`6 (eager) − 3 (lazy) = 3` — precisely the wasted-evaluations count from Part 3. That's not a
coincidence: "wasted work under eager evaluation" and "work saved by laziness" are the same
quantity, counted from two directions. Laziness doesn't do anything clever computationally — it
just refuses to pay for an argument until something actually asks for its value, which means it
never pays at all for a value that was never asked for.

---

### The pattern

**Eager evaluation computes an argument because it's *there*; lazy evaluation computes it because
it's *needed*.** For pure functions (Lesson 1) this is purely a performance question — the answer
is identical either way, since a pure computation gives the same result whenever you run it. The
only thing eager vs. lazy changes is how much work you do to get that answer, and (as you'll see
next) what kinds of values you're even able to construct in the first place.

**Next**: laziness isn't just about skipping wasted branches — it's what makes it possible to build
structures that are, in principle, infinite. Lesson 31 builds one.
