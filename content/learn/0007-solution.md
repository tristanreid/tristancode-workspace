---
title: "Solution: The Substitution Game"
description: "Why D is the only referentially transparent option, what breaks A/B/C, and why referential transparency is the key to equational reasoning."
lesson_number: 7
concept: "Referential transparency"
stage: 0
layout: solution
role: solution
builds_on: [1, 2]
skin: chalkboard
---

**D is the only referentially transparent option.**

```python
def f(x): return x * 2
```

`f(5)` is always `10`, period. You can swap every `f(5)` in your code for `10` and the program
behaves identically. Nothing else changes — no side channel is disturbed, no hidden state updates,
no output appears on the terminal.

### Why A, B, and C break the substitution

**Option A — hidden output:**

```python
def f(x):
    print(x)
    return x * 2
```

The return value is `10`, but printing `5` to the terminal is a side effect. A program with two
calls to `f(5)` prints `5` twice. Replace those calls with `10` and nothing is printed at all.
The two programs are observable differently — the substitution changed behaviour.

**Option B — hidden mutation:**

```python
call_count = 0
def f(x):
    global call_count
    call_count += 1
    return x * 2
```

Again the return value is `10`, but `call_count` goes up by one per call. If another part of the
program reads `call_count`, it will get different values depending on whether the actual calls
happened. Replace the calls with `10` and `call_count` stays at zero. The substitution changed the
program's observable state.

**Option C — non-determinism:**

```python
import random
def f(x): return x * random.random()
```

`f(5)` doesn't reliably return `10` — it could be any float in `[0, 10)`. Two calls may return two
different values. There's no single value you could substitute for the call everywhere and preserve
the distribution of outcomes.

### What referential transparency gives you

The power of the substitution model isn't just algebraic aesthetics. When every call can be replaced
by its value:

1. **You can reason locally.** You don't have to mentally simulate all the state that might have
   changed *before* this call was made. The function's body is the whole story.
2. **Calls can be reordered or deduplicated.** Two calls with the same arguments can be cached or
   evaluated in either order without changing the result. This is the underpinning of **memoization**
   and, eventually, **safe parallelism** — if `f(5)` is always `10`, a thousand threads can compute
   it simultaneously with no coordination.
3. **Testing is trivial.** You feed in inputs, check outputs, done. No mock objects, no state setup,
   no cleanup.

### The connection to pure functions

Referential transparency and purity go together: a pure function (output depends only on inputs, no
side effects) is, by definition, referentially transparent. The two terms describe the same property
from different angles — purity describes the *implementation* (no effects), referential transparency
describes the *reasoning rule* (the substitution is safe).

Impure functions — those with side effects — break the substitution model. That doesn't make them
unusable. Real programs must print, read files, and make network requests. The functional strategy
is to keep impure work **at the edges** of the program, leaving the pure core fully
substitution-friendly. That boundary is the next lesson.
