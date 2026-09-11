---
title: "A Seed With Two Jobs: Digits Most-Significant-First"
description: "range and iterate got away with a simple seed. Producing base-b digits in reading order needs the seed to carry a second piece of control state — the current place value — alongside the value being unfolded."
lesson_number: 27
track: fp
aliases: ["/learn/0027-puzzle/"]
concept: "Unfold with a control-carrying seed"
stage: 4
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [25]
skin: chalkboard
numeric:
  question: "unfold_digits(2024, 16) produces the base-16 digits of 2024, most-significant first. What is the most significant digit, written as a decimal number 0-15?"
  answer: 7
  tolerance: 0
  unit: "hex digit (0-15)"
---

**Warm-up recall (Lesson 11).** Flattening a nested list means recursing into any element that is
itself a list, and collecting every non-list value into one flat sequence. Flatten
`[[1, 2], [3, [4, 5]], 6]` completely. How many elements are in the flattened result? Keep the
number; the solution confirms it.

---

**Terms (standalone, from Lesson 25):**

- **Unfold** (`unfold(seed, pred, element, step)`): the dual of fold. Starting from a **seed**
  (the initial state), it stops when `pred(seed)` is true; otherwise it emits `element(seed)` and
  recurses on `step(seed)`.
- **Seed**: the evolving state the unfold carries from step to step. In Lesson 25's `iterate`, the
  seed was a tuple `(value, count)` — the value being transformed *and* a countdown that had nothing
  to do with the output itself. That countdown is **control state**: information the unfold needs
  to know when to stop or how to proceed, distinct from the values it's emitting.

### The problem: digits, most-significant first

You want `digits(187, 10) → [1, 8, 7]` — the base-10 digits of 187, in reading order.

The obvious unfold peels off the *least*-significant digit first: `element(s) = s % 10`,
`step(s) = s // 10`, `pred(s) = s == 0`. On seed `187` that produces `[7, 8, 1]` — backwards. You
could reverse the list afterward, but that defeats the point of an unfold, which is supposed to
produce elements in the order you want them, one at a time, without a second pass.

### The fix: the seed carries the place value too

To emit the most significant digit *first*, you need to know, before you extract anything, what
power of the base that first digit sits at. So the seed becomes a pair:
`(remaining_value, place_value)`, where `place_value` is the largest power of the base that is
`≤ remaining_value` (e.g. for 187 in base 10, that's 100).

```python
def unfold_digits(n, b):
    place = largest_power_leq(n, b)     # e.g. largest_power_leq(187, 10) == 100
    return unfold(
        (n, place),
        lambda s: s[1] == 0,             # stop once place value has been divided past 1
        lambda s: s[0] // s[1],          # element: how many whole `place`s fit in what's left
        lambda s: (s[0] % s[1], s[1] // b)   # step: remove that digit's contribution, shrink place
    )
```

Trace on `unfold_digits(187, 10)`:

```
seed=(187,100) → element=187//100=1,  next=(187%100,100//10)=(87,10)
seed=(87,10)   → element=87//10=8,    next=(87%10,10//10)=(7,1)
seed=(7,1)     → element=7//1=7,      next=(7%1,1//10)=(0,0)
seed=(0,0)     → pred fires (place==0) → stop

result: [1, 8, 7]  ✓ most-significant first, no reversal
```

The seed is doing **two jobs at once**: `remaining_value` is what still needs to be broken into
digits, and `place_value` is pure control state — it never appears in the output, but it's what
tells `element` how to read the next digit and `pred` when to stop.

---

### Part 1 — Find the starting place value

`largest_power_leq(n, b)` isn't given to you as a primitive — write it (recursively or with a loop):
it finds the largest `b^k` that is `≤ n`. What is `largest_power_leq(2024, 16)`? (Check: is
`16^2 = 256 ≤ 2024`? Is `16^3 = 4096 ≤ 2024`?)

---

### Part 2 — Trace `unfold_digits(2024, 16)`

Using the seed pair `(2024, place)` from Part 1, trace the unfold step by step the way the worked
example above does for `187`. How many digits does it produce in total?

---

### Part 3 — The graded question (above)

What is the **first** (most significant) element the unfold emits — i.e. the leading hex digit of
2024 — written as a plain decimal number from 0 to 15? Enter it in the numeric box.

---

### Part 4 — Why this generalizes

The same "seed carries control state beyond the output value" trick shows up any time an unfold's
next step depends on *where you are in the process*, not just on *what value you're about to emit*.
Name one other situation where a seed would need to carry extra control state like this (a
pagination cursor, or unpacking a run-length-encoded sequence, both work — don't just say
"digits" again).
