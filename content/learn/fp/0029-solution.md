---
title: "Solution: Infinite Streams via Laziness"
description: "Stream = Cons(head, tail_thunk). ones and naturals are self-referential via thunks. stream_map wraps the mapped tail in a thunk. The sieve stacks filters lazily. The thunk stops infinite construction because lambda defers the call."
lesson_number: 29
track: fp
aliases: ["/learn/0029-solution/"]
concept: "Infinite streams"
stage: 5
layout: solution
role: solution
builds_on: [28]
skin: chalkboard
---

### Part 1 — `ones`

```python
def ones():
    return Cons(1, lambda: ones())
```

`ones()` returns immediately — it constructs a `Cons` with head `1` and a thunk `lambda: ones()`. The lambda is an object in memory; it does *not* call `ones()` again at this point. Call-stack depth: 1.

When `take` asks for the next element, it calls `stream.tail_thunk()`, which calls `ones()` — which again returns immediately with another `Cons`. Stack depth stays at 1 per step.

The "recursion stops" when `take(n, ...)` reaches `n == 0` — the caller controls termination, not the stream.

---

### Part 2 — `naturals`

```python
def naturals(start):
    return Cons(start, lambda: naturals(start + 1))
```

`start + 1` lives in the *closure* of the lambda — it is captured when the lambda is created, but the call `naturals(start + 1)` only happens when the thunk is forced.

Trace `take(3, naturals(0))`:
```
take(3, Cons(0, λ)) → [0] + take(2, naturals(1))
                           → [1] + take(1, naturals(2))
                                      → [2] + take(0, ...)
                                                  → []
result: [0, 1, 2]  ✓
```

---

### Part 3 — `stream_map`

```python
def stream_map(f, stream):
    if isinstance(stream, Nil):
        return Nil()
    return Cons(
        f(stream.head),
        lambda: stream_map(f, stream.tail_thunk())
    )
```

The tail of the result is `lambda: stream_map(f, stream.tail_thunk())`. It captures both `f` and `stream` from the enclosing scope. Neither `stream.tail_thunk()` nor the recursive `stream_map` call runs at construction time.

**Common mistake**: writing `Cons(f(stream.head), stream_map(f, stream.tail_thunk()))` — this forces the tail immediately (calling `tail_thunk()` and recursing), which for an infinite stream never terminates.

---

### Part 4 — Sieve trace

**Step 1:** `sieve(naturals(2))` — the stream starts `2, 3, 4, 5, …`
- `p = 2`
- Return `Cons(2, λ)` — head is **2**; tail is `sieve(filter(x%2≠0, [3,4,5,...]))`

`take(3, ...)` forces the tail.

**Step 2:** Force the tail thunk: `sieve(filter(x%2≠0, [3,4,5,...]))`
- Filters: `stream_filter(x%2≠0, [3,4,5,…])` — skips 4,6,8,…; first element passing is 3.
- The filtered stream starts `3, 5, 7, 9, 11, …`
- `p = 3`
- Return `Cons(3, λ)` — head is **3**; tail is `sieve(filter(x%3≠0, filter(x%2≠0, [5,7,9,...])))`

`take(3, ...)` forces the tail again.

**Step 3:** Force: `sieve(filter(x%3≠0, filter(x%2≠0, [5,7,9,...])))`
- After both filters: 5 passes (5%2≠0, 5%3≠0); 7 would pass too.
- First element: 5.
- `p = 5`
- Return `Cons(5, λ)` — head is **5**

`take(3, ...)` now has `[2, 3, 5]` and `n` reaches 0. Done.

Stacked filters at step 3: `filter(x%3≠0, filter(x%2≠0, naturals_tail))` — two filters, applied in order. Each new prime adds one more filter layer to the tail.

---

### Part 5 — Why the thunk stops construction

`Cons(1, lambda: ones())` builds a Python object with:
- `head = 1`
- `tail_thunk = <a closure>`

Creating a closure (`lambda: ones()`) does *not* execute the function body. Python sees `lambda: ones()` and records "when called, evaluate `ones()`" — it does not evaluate `ones()` now. Construction finishes in O(1).

The recursive call `ones()` inside the lambda only runs if and when someone calls `tail_thunk()`. That only happens when `take` demands the next element.

Without the lambda — writing `Cons(1, ones())` — Python (being eager) would evaluate `ones()` *immediately* as part of constructing the argument list for `Cons.__init__`. That call to `ones()` would again try to evaluate `ones()` immediately, causing infinite recursion before the first `Cons` is even constructed. Lesson 30 examines this failure mode in detail.

---

### What you can build with streams

| Stream | Definition | `take(5, ...)` |
|--------|------------|----------------|
| `ones()` | `Cons(1, λ: ones())` | `[1,1,1,1,1]` |
| `naturals(0)` | `Cons(n, λ: naturals(n+1))` | `[0,1,2,3,4]` |
| `stream_map(f, s)` | wrap each element | `[f(0),f(1),f(2),…]` |
| `sieve(naturals(2))` | filter + recurse | `[2,3,5,7,11]` |

Every one of these would be a one-liner in Haskell (where the thunks are implicit). In Python, the explicit `lambda:` is the price of working in an eager language. The concept — defer evaluation until demanded — is the same either way.

**Next**: Lesson 30 examines what goes wrong when you *forget* the lambda — the runaway recursion failure mode, and why it reveals something deep about the relationship between eager evaluation and self-referential definitions.
