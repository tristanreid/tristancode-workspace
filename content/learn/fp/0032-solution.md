---
title: "Solution: Runaway Recursion — When an Eager Definition Can Never Bottom Out"
description: "nats_eager never returns because + forces its right operand fully before constructing anything; a bound makes it terminate but trades infinity for a giant eager list; the lazy nats_from(10) gives five numbers summing to 60."
lesson_number: 32
track: fp
aliases: ["/learn/0032-solution/"]
concept: "Runaway recursion"
stage: 5
layout: solution
role: solution
builds_on: [30, 31]
skin: chalkboard
---

### Warm-up recall answer

```python
def product_acc(lst, acc):
    if not lst:
        return acc
    return product_acc(lst[1:], acc * lst[0])
```

`product_acc([2, 3, 5], 1)`: `acc=1*2=2` → `acc=2*3=6` → `acc=6*5=30` → list empty, return `30`.
**30.**

---

### Part 1 — Would a bound fix it?

Yes — `nats_eager(n) = [] if n > 1000000 else [n] + nats_eager(n+1)` **does** return, eventually.
Once `n` exceeds `1000000`, the base case fires, `[]` is returned, and every pending `+` unwinds
back up, each one prepending its `n`. What you get back is a concrete list of `1000001` elements.

What you've gained: termination. What you have **not** gained: anything resembling Lesson 31's
`nats_from`. Three things are still fundamentally different:

1. **It's finite, not infinite.** You picked a hard ceiling in advance. `nats_from` represents *all*
   naturals, forever, without ever committing to a size.
2. **It's still fully eager underneath.** Every one of those `1000001` elements gets built whether
   you need one of them or all of them — there's no way to ask for just the first 5 without paying
   for the other `999996`.
3. **Stack depth**: this is still ordinary (non-tail) recursion, `1000001` calls deep before the
   first `+` can even run. Real Python would hit `RecursionError` long before reaching the bound —
   the default recursion limit is around 1000, not a million.

The bound turns "never returns" into "returns, but only after doing a huge amount of unnecessary,
stack-hungry work" — it papers over the symptom without addressing why the definition needed
laziness in the first place.

---

### Part 2 — `take` from Lesson 31

```python
def take(k, stream):
    result = []
    while k > 0:
        result.append(stream.head)
        stream = stream.tail_thunk()
        k -= 1
    return result
```

`nats_from(n) = LazyCons(n, lambda: nats_from(n + 1))` needs no changes — it was already general in
its starting point. `take(5, nats_from(10))` walks five steps starting from `LazyCons(10, ...)`:
`[10, 11, 12, 13, 14]`.

---

### Part 3 — The graded answer: 60

```python
sum(take(5, nats_from(10)))
# take(5, nats_from(10)) → [10, 11, 12, 13, 14]
# sum → 10+11+12+13+14 = 60
```

**60.** Unlike `nats_eager`, `nats_from(10)` returns *immediately* (it builds one `LazyCons`, not an
infinite chain), and `take` forces exactly five more steps — no bound needed anywhere, no wasted
work, and no risk of ever not terminating, because nothing about "the rest of the stream" is
computed until something explicitly asks.

---

### Part 4 — Where else this happens

Any binary operator that must have both operands resolved before it can produce anything has the
same failure mode. Two examples beyond `+`:

- **`*` (multiplication)**: `def bad(n): return n * bad(n + 1)` fails identically — `*` needs its
  right operand's value before it can multiply, so `bad(n+1)` must fully resolve before `bad(n)`
  can produce anything, forever.
- **String concatenation**: `def bad(n): return str(n) + bad(n + 1)` — same shape, same failure,
  just building a string instead of a list.

The common thread: **it's not about what operator you use, it's about whether the recursive call
sits somewhere that must be *fully resolved* before its result can be combined into something
returnable.** A thunk (Lesson 30) breaks exactly that requirement — it lets you hand back "a value,
plus an unresolved promise for more" instead of demanding the promise be kept before you can return
anything at all.

---

### The pattern

**Runaway recursion isn't a missing-base-case bug — the base case is often present or easy to add
(Part 1). It's a *position* bug**: the recursive call sits inside an expression that eager
evaluation must fully collapse before constructing a result. Laziness fixes it not by making the
recursion smarter, but by changing what "the recursive call" *is* — a thunk, not an immediate
invocation — so the expression around it (`LazyCons(n, thunk)`) can be constructed without ever
resolving what's inside the thunk.

**Next**: stack depth came up here as a side note (the bounded version still blows the stack). Stage
5 closes that thread properly — Lesson 33 asks exactly when a recursive call can avoid growing the
stack at all, and why some recursive definitions can and others structurally can't.
