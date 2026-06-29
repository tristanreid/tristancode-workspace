---
title: "Solution: Runaway Recursion — When Eager Definitions Explode"
description: "bad_ones() crashes because the recursive call must complete before the list can be built. good_ones() returns immediately because the constructor is guarded by a thunk. Haskell's : is lazy. The four cases: A crashes, B terminates, C terminates (thunk), D crashes."
lesson_number: 30
concept: "Runaway recursion"
stage: 5
layout: solution
role: solution
builds_on: [3, 28, 29]
skin: chalkboard
---

### MCQ answer: (b) — RecursionError immediately

`bad_ones()` raises `RecursionError` immediately. See Part 2 for why.

---

### Part 2 — Trace of `bad_ones()`

```
bad_ones()
  = [1] + bad_ones()         ← must evaluate bad_ones() first
         = [1] + bad_ones()  ← must evaluate bad_ones() first again
                = [1] + bad_ones()  ← ...
```

Python evaluates `bad_ones()` (the right operand of `+`) *before* performing the concatenation. That recursive call must also evaluate `bad_ones()` before it can concatenate, and so on. The `+` never runs because the right operand never returns. Every call adds a frame to the stack; after ~1000 frames Python raises `RecursionError`.

The crucial observation: `bad_ones()` needs its own result *before* it can produce its own result. This is a circular dependency with no way out — there is no base case and no guarded constructor to break the cycle.

---

### Part 3 — `good_ones()` trace

```python
good_ones()
  → Cons(1, lambda: good_ones())   ← returns immediately
```

`good_ones()` calls `Cons(...)` with two arguments: `1` (already computed) and `lambda: good_ones()` (a closure — created in O(1), does *not* call `good_ones()` again). Python returns the `Cons` object immediately. Stack depth: 1.

When `take` calls `stream.tail_thunk()`, *then* `good_ones()` is called again — but that call also returns immediately with another `Cons`. Stack depth during a `take(n, ...)` call is O(n) (the depth of `take`'s own recursion), not infinite.

**Why the stack stays shallow**: the recursive reference `good_ones()` is inside a `lambda` — it is *guarded* by the closure. The lambda is a value, not a call. Python sees: "store this function for later" rather than "call this function now."

---

### Part 4 — Haskell's `ones`: answer (b)

In Haskell, `:` is a **data constructor** (the list cons), and Haskell's constructors are non-strict (lazy) by default — they do not evaluate their arguments when applied. So:

```haskell
ones = 1 : ones
```

evaluates to: a `Cons` node with head `1` and an *unevaluated thunk* for the tail. The thunk happens to be `ones` itself. Haskell may represent this as a literal cycle in memory: one `Cons` node whose tail pointer points back to itself — a circular linked list.

When you demand the second element (`tail ones`), Haskell evaluates the thunk, which returns the same `Cons(1, <thunk>)` — either by sharing the existing node (if the runtime exploits the cycle) or by re-evaluating. Either way, only one element is in scope at a time.

Option (a) is wrong — Haskell does not short-circuit or detect cycles; laziness makes them unnecessary. Option (c) is wrong — there is no compile-time limit. Option (d) is wrong — Haskell does not automatically convert to generators; the deferred-constructor mechanism is more fundamental.

---

### Part 5 — The four definitions

**A — `f(5)`: RecursionError**

```
f(5) = f(4) + 1  ← needs f(4)
f(4) = f(3) + 1  ← needs f(3)
...
f(0) = f(-1) + 1 ← needs f(-1)
f(-1) = f(-2) + 1 ← ... (no base case)
```

No base case. The recursion goes negative forever (or until the stack limit). `RecursionError`.

**B — `g(5)`: terminates, returns 5**

```
g(5) = g(4) + 1
g(4) = g(3) + 1
...
g(0) = 0        ← base case
→ 0 + 1 + 1 + 1 + 1 + 1 = 5
```

Has a base case at `n == 0`. Stack depth = n + 1 = 6. Returns `5`. (For large n it would overflow, but for small n it is fine.)

**C — `h()`: terminates, returns a thunk**

```
h() → lambda: h()
```

`h()` does not call `h()` — it returns a closure that *would* call `h()` if invoked. Stack depth: 1. Returns a zero-argument lambda.

This is the same structure as `good_ones()`. The self-reference is inside a `lambda`, so it is guarded.

**D — `k()`: RecursionError**

```
k() = k()  ← must evaluate k() before returning
```

`return k()` in Python evaluates `k()` before returning. `k()` evaluates `k()` before returning. No base case, no guard. `RecursionError`. Python does *not* perform tail-call optimization (TCO), so this is not a trampoline — it is a plain unbounded recursion.

(Note: in a language with TCO, `k()` calling `k()` in tail position would reuse the same stack frame and loop forever rather than crash. Python lacks TCO by design.)

---

### The pattern

| Definition | Structure | Result |
|------------|-----------|--------|
| `f(n-1) + 1` (no base case) | naked recursive call | RecursionError |
| `if n==0: return 0; else g(n-1)+1` | guarded by base case | terminates |
| `return lambda: h()` | recursive reference inside lambda | terminates (returns thunk) |
| `return k()` | naked self-call in tail | RecursionError |

**Rule**: a self-referential definition is safe in an eager language if and only if every path to the recursive reference is *guarded* — either by a base case that returns without recursing, or by a constructor/lambda that defers the call.

---

### Stage 5 so far

You now have the vocabulary for evaluation strategy:

- **Eager evaluation** (Lesson 28): arguments computed before the call; short-circuit operators are the only built-in lazy forms.
- **Thunks** (Lesson 28): manual laziness via `lambda: expr`.
- **Infinite streams** (Lesson 29): `Cons(head, lambda: tail)` — the standard recipe for lazy sequences in eager languages.
- **Runaway recursion** (Lesson 30): what happens when you forget the guard.

Next in Stage 5: tail calls and why some languages need accumulators to avoid the stack blowups you just analyzed — and how that connects to the accumulator pattern from Lesson 12.
