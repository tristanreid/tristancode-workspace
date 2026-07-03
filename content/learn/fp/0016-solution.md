---
title: "Solution: Closures Capture Variables, Not Values"
description: "Why the loop produces [12,12,12], two ways to fix it, and what closures are good for once you understand the late-binding rule."
lesson_number: 16
track: fp
aliases: ["/learn/0016-solution/"]
concept: "Closures"
stage: 2
layout: solution
role: solution
builds_on: [1, 13]
skin: chalkboard
---

**The answer is `[12, 12, 12]`.**

### Why

After `for i in range(3)` the loop variable `i` holds `2` — the last value it was assigned.
All three lambdas close over the *same* variable `i` (not a copy of its value at creation time).
When you call them, they all read `i = 2` and return `10 + 2 = 12`.

```python
fns = []
for i in range(3):         # i = 0, then 1, then 2
    fns.append(lambda x: x + i)   # captures the VARIABLE i, not its current value

# after the loop: i == 2

results = [f(10) for f in fns]
# each f(10) reads i at call time → i==2 → 10+2 = 12
# results = [12, 12, 12]
```

This surprises many developers who expect `[10, 11, 12]` — they imagine the lambda "froze" `i`'s
value at creation time. It doesn't. Closures in Python (and most languages) capture the binding —
the variable itself — not a snapshot of its value.

### Two ways to fix it

**Fix 1 — Default argument (captures the value):**

```python
fns = []
for i in range(3):
    fns.append(lambda x, i=i: x + i)   # i=i copies the CURRENT VALUE into a default arg

results = [f(10) for f in fns]
# [10, 11, 12]
```

Default argument values are evaluated at function-definition time. `i=i` on the right reads
the current `i` and binds it to the parameter's default. Each lambda gets its own frozen copy.

**Fix 2 — Factory function:**

```python
def make_adder(n):
    return lambda x: x + n

fns = [make_adder(i) for i in range(3)]
results = [f(10) for f in fns]
# [10, 11, 12]
```

Each call to `make_adder(i)` creates a new scope with its own `n`. The lambda inside captures `n`,
which is local to *that specific call* — a fresh variable each time. This is the pattern from
Lesson 13.

### When closures are powerful

The same "capture by variable" property that causes the loop bug is the feature that makes closures
genuinely useful:

- **Adder / multiplier factories** (Lesson 13): `make_adder(5)` returns a function that permanently
  has `n=5`. The captured `n` doesn't change, so the trap doesn't bite.
- **Memoization**: a closure can capture a private cache dict and update it on each call.
- **Partial application**: a closure captures some of the arguments to a multi-argument function,
  returning a function that accepts the rest.

The rule to remember: **a closure captures a variable, not a value.** If the variable changes
after the closure is created (like a loop variable), the closure sees the latest value. If the
variable is stable (like the parameter of a factory function), the closure behaves as expected.

**Next:** partial application and currying — turning multi-argument functions into chains of
single-argument functions (Lesson 17).
