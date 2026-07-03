---
title: "Solution: Keep, Drop, and Slice"
description: "Implementations of filter, take, drop, and nth — with multiple base cases, dual termination conditions, and the relationship between them."
lesson_number: 10
track: fp
aliases: ["/learn/0010-solution/"]
concept: "Recursion: filter, take, drop"
stage: 1
layout: solution
role: solution
builds_on: [3, 9]
skin: chalkboard
---

### Part 1 — `keep`

```python
def keep(xs, pred):
    if xs == []:
        return []
    elif pred(xs[0]):
        return [xs[0]] + keep(xs[1:], pred)
    else:
        return keep(xs[1:], pred)
```

When the head passes the predicate, include it; otherwise discard it and recurse. Notice that
`keep(xs[1:], pred)` appears in both branches — the only difference is whether `xs[0]` is prepended.

---

### Part 2 — `take`

```python
def take(n, xs):
    if n == 0 or xs == []:
        return []
    else:
        return [xs[0]] + take(n - 1, xs[1:])
```

Two base cases joined by `or`: we stop when we've taken enough *or* when the list runs out. Both
matter — one guards the count, the other guards the list. Miss either and you get an infinite loop
or an index error.

---

### Part 3 — `drop`

```python
def drop(n, xs):
    if n == 0 or xs == []:
        return xs
    else:
        return drop(n - 1, xs[1:])
```

Same dual base case as `take`. But note the base: when `n == 0`, return `xs` (the full remaining
list), not `[]`. The count guards how many to peel; the list guard stops a drop that exceeds the
list's length (returning `[]` naturally, since `xs` will be `[]` at that point).

---

### Part 4 — `nth`

```python
def nth(n, xs):
    if xs == []:
        return None
    elif n == 0:
        return xs[0]
    else:
        return nth(n - 1, xs[1:])
```

`drop(n, xs)` peels `n` elements and returns the rest; `nth` does the same peeling, but when it
finishes it wants only the *head* of what's left (or `None` if nothing is left). You could even
implement it in terms of `drop`:

```python
def nth(n, xs):
    rest = drop(n, xs)
    return rest[0] if rest else None
```

Elegant — but uses a Python indexing operation at the end. The fully recursive version makes
everything explicit.

---

### What these share

All four functions have the same recursive skeleton: peel one element, make a decision based on it
and the remaining counter (if any), recurse. The differences are only in *what decision* and *what
to do with the element*:

| function | include head? | continue condition |
|----------|--------------|-------------------|
| `keep`   | if pred(head) | always |
| `take`   | always (first n) | n > 0 and list non-empty |
| `drop`   | never (first n) | n > 0 and list non-empty |
| `nth`    | if n == 0 | list non-empty |

That shared skeleton is no accident. In Stage 2 you'll see how `reduce` (fold) provides a single
abstraction that generates all of them.

**Next:** flattening a nested list — the first recursion that must recurse on *both* the head and
the tail (Lesson 11).
