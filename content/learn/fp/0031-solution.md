---
title: "Solution: Tail Calls — The Recursion That Doesn't Grow the Stack"
description: "(B) is the tail call. Tail recursion is a stepping stone to an explicit loop even when the runtime won't optimize it for you — which is exactly Python's situation."
lesson_number: 31
track: fp
aliases: ["/learn/0031-solution/"]
concept: "Tail calls & tail-call optimization"
stage: 5
layout: solution
role: solution
builds_on: [6, 12, 30]
skin: chalkboard
---

### MCQ answer: (B) — only `g(n, acc)` is in tail position

`g` returns the recursive call's value directly: `return g(n - 1, acc + n)`. Nothing happens to
that value afterward — it's just handed straight back up.

`f` returns `1 + f(n - 1)`. The recursive call `f(n - 1)` happens, but then `f`'s own frame still
has work left: add `1` to whatever came back. That pending `+ 1` is what disqualifies it — the
call isn't the *last* action, it's an action followed by another action.

---

### Part 2 — What information would be lost

If the runtime threw away `f(n)`'s frame before calling `f(n - 1)`, it would lose the fact that
**`+ 1` is still pending** — there would be nowhere to resume once `f(n-1)` returns. The current
frame's "return address and pending work" is exactly what a non-tail call still needs after the
callee returns. That's the structural reason frame-reuse only works for tail calls: a tail call is
precisely the case where the caller has *no* pending work, so its frame truly is disposable the
instant the call is made.

---

### Part 3 — Tail-recursive `f`

```python
def f_tail(n, acc=0):
    if n == 0:
        return acc
    return f_tail(n - 1, acc + 1)
```

Trace `f_tail(3)`:
```
f_tail(3, 0) → f_tail(2, 1) → f_tail(1, 2) → f_tail(0, 3) → 3
```

Every step, the *entire* remaining computation is captured in the arguments (`n`, `acc`) — there is
nothing left pending in any caller's frame. `return f_tail(n - 1, acc + 1)` is the whole return
expression: a pure tail call. Compare to Lesson 12, where `reverse`'s accumulator did the same job
— turn "combine on the way back up" into "carry the answer-so-far on the way down."

---

### Part 4 — Answer: (b) — `RecursionError` anyway

CPython **does not implement tail-call optimization**, deliberately — Guido van Rossum has stated
this is intentional, partly because TCO makes stack traces harder to read (frames silently vanish,
so a traceback no longer shows the full call history) and partly because Python's design favors
explicit loops for iteration. So `f_tail(100_000)` pushes 100,000 real stack frames and hits
`RecursionError` just as readily as the non-tail version — being in tail position buys you nothing
at runtime in CPython. (Some other implementations and languages — Scheme, and JVM languages like
Scala under specific conditions via `@tailrec`, or with a trampoline — *do* collapse tail calls into
O(1) stack space.)

---

### Part 5 — The benefit that survives even without runtime TCO

A tail-recursive definition is a **loop in recursive clothing**: at every step, the entire state
needed to continue is fully captured in the arguments, and there's no pending work stashed in any
frame. That's *exactly* the shape a `while` loop has — a set of mutable loop variables, updated each
iteration, nothing implicit hanging around. Which means a tail-recursive function can always be
mechanically rewritten, by hand, into an explicit loop with zero semantic change:

```python
def f_loop(n):
    acc = 0
    while n != 0:
        acc = acc + 1
        n = n - 1
    return acc
```

Every tail call `g(n - 1, acc + n)` becomes an assignment `n, acc = n - 1, acc + n` at the top of a
loop. This is precisely what a **trampoline** or a language's TCO does *automatically* — mechanize
that same n-argument-update pattern instead of pushing a frame. So the practical value of writing
`f_tail` first, even in Python, is that it makes the loop-conversion **obvious and mechanical**
rather than something you have to invent from scratch: once a recursive definition is tail-shaped,
turning it into an explicit, stack-safe loop is a rote transformation, not a redesign.

---

### The pattern

| Form | Stack behavior in Python | Stack behavior with TCO (Scheme, etc.) |
|---|---|---|
| `1 + f(n-1)` (non-tail) | O(n) frames, unavoidable | still O(n) — TCO doesn't apply |
| `g(n-1, acc+n)` (tail) | O(n) frames — CPython ignores tail position | **O(1)** — frame reused |
| hand-converted `while` loop | O(1) — no recursion at all | O(1) |

**Rule**: a call is in tail position when it's the *entire* return expression — no pending
arithmetic, no `+`, no wrapping. Being tail-recursive is necessary for TCO to apply, but Python
gives you none of the benefit automatically; the accumulator discipline still pays off because it's
the same discipline that makes the loop-rewrite trivial.

**Where this goes:** next lesson turns to a different cost that recursive/lazy definitions can
hide — not stack depth, but *duplicated work* when the same subcomputation gets recomputed instead
of reused. Stage 6 after that picks tail calls back up from a different angle: continuation-passing
style, where *every* call becomes a tail call by construction.
