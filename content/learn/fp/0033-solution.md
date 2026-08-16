---
title: "Solution: What Happens Next — Continuation-Passing Style"
description: "CPS moves 'what happens next' out of the implicit call stack and into an explicit, ordinary function value — which is exactly why every CPS call can be a tail call."
lesson_number: 33
track: fp
aliases: ["/learn/0033-solution/"]
concept: "Continuation-passing style (CPS)"
stage: 6
layout: solution
role: solution
builds_on: [17, 31]
skin: chalkboard
---

### Part 1 — `square_cps` and the chained continuation

```python
def square_cps(x, k):
    k(x * x)

square_cps(4, lambda result: print(result + 1))
# prints 17
```

Trace it: `square_cps(4, k)` computes `4 * 4 = 16`, then calls `k(16)`. The continuation
`lambda result: print(result + 1)` receives `16`, computes `16 + 1 = 17`, and calls `print(17)`.
Nothing was ever `return`ed for the "real" answer — the entire computation, including the final
side effect, happened by a chain of continuation calls. `k` *is* "everything that happens after
`square_cps` produces its answer," made into a value you can see and pass around.

---

### Part 2 — Chaining `add1_cps` into `square_cps`

```python
def add1_cps(x, k):
    k(x + 1)

def square_cps(x, k):
    k(x * x)

add1_cps(3, lambda r1: square_cps(r1, lambda r2: print(r2)))
# prints 16
```

Trace it: `add1_cps(3, k1)` where `k1 = lambda r1: square_cps(r1, k2)`. It computes `3 + 1 = 4`,
then calls `k1(4)`. That runs `square_cps(4, k2)` where `k2 = lambda r2: print(r2)`. `square_cps`
computes `4 * 4 = 16`, then calls `k2(16)`, which prints `16`.

The key structural point: `add1_cps`'s continuation `k1` is not "print the answer" — it's "*take my
answer and feed it into `square_cps`*." Composing two CPS functions means nesting continuations:
the first function's continuation is a lambda that calls the second function, passing along
*its own* continuation as the innermost one. This is the general recipe for chaining any sequence
of CPS calls — each step's continuation is "call the next step, with the continuation for the step
after that."

---

### Part 3 — Where "what happens next" lives, and the consequence

In direct style, "what happens next" after `f(x)` returns lives in the **call stack**: it's the
sequence of pending stack frames, each holding a fragment of unfinished work (`+ 1`, `print(...)`,
etc.), invisible to the program itself — you can't inspect it, save it, or pass it somewhere else.
It's *implicit* machinery the runtime manages for you.

In CPS, that exact same information — "what happens next" — is **reified as an ordinary function
value**, `k`. It's no longer hidden runtime bookkeeping; it's data. You can:

- **Pass it as an argument** (which is the whole point — every CPS function takes `k` explicitly).
- **Store it** in a variable, a data structure, even return it from a function.
- **Call it more than once**, or not at all — direct style's stack frame is consumed exactly once,
  automatically, when a function returns. A continuation, being an ordinary function, can be called
  zero, one, or many times by whoever holds it. (Calling a continuation twice runs "the rest of the
  program" twice — this is the mechanism behind some advanced control-flow constructs like
  backtracking and generators, in languages that expose continuations directly.)

The practical, immediate consequence for *this* track: because every CPS function's body ends in
exactly one call — to `k`, or to another CPS function carrying `k` forward — **every call in CPS
code is automatically in tail position** (Lesson 31's definition: nothing pending after the call).
You get Lesson 31's tail-call discipline for free, by construction, rather than by remembering to
add an accumulator by hand. That's the connection Stage 6 opens with: CPS doesn't just organize
control flow explicitly — it's a systematic technique for writing exclusively tail-recursive code.

---

### The pattern

| | Direct style | CPS |
|---|---|---|
| Result delivery | `return` to an implicit caller | explicit call to `k` |
| "What happens next" | implicit, on the call stack | explicit function value, passed as data |
| Call position | may or may not be tail position | **always** tail position |
| Can inspect/store/reuse "next step"? | no | yes — it's just a value |

**Rule**: CPS trades implicit control flow (the call stack) for an explicit one (continuations
passed as arguments) — the same information exists either way, but making it a first-class value is
what enables both "every call is a tail call" and, more broadly, treating control flow itself as
data you can manipulate.

**Where this goes:** next lesson pushes on the tail-call connection directly — how a CPS-transformed
program, with every call in tail position, can be mechanically run as a plain loop (a
*trampoline*), turning Stage 6's control-flow trick into a genuine, practical stack-safety
technique, and setting up early exit / escape via continuations after that.
