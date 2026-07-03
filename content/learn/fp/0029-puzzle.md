---
title: "Infinite Streams via Laziness"
description: "A stream is a list whose tail is a thunk. You can define an infinite stream and take as many elements as you want — the rest are never computed. Build ones, naturals, stream_map, and the infinite sieve of Eratosthenes."
lesson_number: 29
track: fp
aliases: ["/learn/0029-puzzle/"]
concept: "Infinite streams"
stage: 5
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [28]
skin: chalkboard
---

In a lazy language, you can define an infinite list and it works fine — elements are computed on demand. In Python (eager), you simulate this by making the *tail* of each list node a **thunk**: a zero-argument lambda that, when called, produces the next node.

**Terms:**

- **Stream** (lazy list): `Stream = Nil | Cons(head: A, tail: () → Stream[A])`. The tail is a thunk, not an evaluated stream.
- **Infinite stream**: a `Cons` whose tail thunk always produces another `Cons` — it has no `Nil`. You can take finitely many elements; you never evaluate the whole thing.
- **Thunk** (standalone, from Lesson 28): a zero-argument lambda: `lambda: <expr>`. The expression runs only when you call `thunk()`.
- **`take(n, stream)`**: return the first `n` elements as an eager Python list.

```python
class Nil: pass

class Cons:
    def __init__(self, head, tail_thunk):
        self.head = head
        self.tail_thunk = tail_thunk   # () → Stream

def take(n, stream):
    if n == 0 or isinstance(stream, Nil):
        return []
    return [stream.head] + take(n - 1, stream.tail_thunk())
```

Example — a finite stream of `[1, 2, 3]`:

```python
s = Cons(1, lambda: Cons(2, lambda: Cons(3, lambda: Nil())))
take(3, s)   # → [1, 2, 3]
take(5, s)   # → [1, 2, 3]   (Nil stops it early)
```

---

### Part 1 — `ones`: the infinite stream of 1s

Write `ones()` — a function that returns an infinite stream of 1s — such that:

```python
take(5, ones())   # → [1, 1, 1, 1, 1]
take(0, ones())   # → []
```

Hint: the tail thunk calls `ones()` again. At what point does the recursion stop?

---

### Part 2 — `naturals(start)`: the infinite natural numbers

Write `naturals(start)` so that `take(5, naturals(0))` → `[0, 1, 2, 3, 4]`.

The current value is `start`; the tail should produce `naturals(start + 1)`. Where does `start + 1` live — in the closure or as an argument?

---

### Part 3 — `stream_map(f, stream)`: lazy transformation

Write `stream_map(f, stream)` that applies `f` to every element of the stream *lazily*. The result is a new `Stream` where each element is `f` applied to the corresponding input element. No elements beyond those demanded by the caller should be computed.

```python
doubled = stream_map(lambda x: x * 2, naturals(1))
take(5, doubled)   # → [2, 4, 6, 8, 10]
```

The tail of the result must itself be a thunk.

---

### Part 4 — The infinite Sieve of Eratosthenes

The sieve generates all primes: start from `naturals(2)`; the head is a prime; filter out all its multiples from the tail; recurse on the filtered tail.

```python
def stream_filter(pred, stream):
    if isinstance(stream, Nil):
        return Nil()
    if pred(stream.head):
        return Cons(stream.head, lambda: stream_filter(pred, stream.tail_thunk()))
    return stream_filter(pred, stream.tail_thunk())

def sieve(stream):
    p = stream.head
    return Cons(p, lambda: sieve(stream_filter(lambda x: x % p != 0,
                                               stream.tail_thunk())))

primes = sieve(naturals(2))
take(7, primes)   # → [2, 3, 5, 7, 11, 13, 17]
```

Trace `take(3, sieve(naturals(2)))` step by step. At each step, name:
- what the current stream's head is
- what filters are stacked on the tail

---

### Part 5 — Why the thunk stops the infinite loop

`ones()` calls itself in its tail thunk. That is a self-referential definition. In Part 1 you saw it doesn't crash — but a naive version without the thunk would crash immediately (Lesson 30 covers this in depth).

For now: without running any code, explain why `Cons(1, lambda: ones())` doesn't trigger infinite recursion at construction time, even though `ones()` appears inside.
