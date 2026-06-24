---
title: "Solution: Count the List"
description: "Why B is right, the bugs in the others, and how an accumulator turns deep recursion into a running tally."
lesson_number: 5
concept: "Recursion: counting & accumulators"
stage: 1
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
---

**B is the correct recursive length:**

```python
def length(xs):
    return 0 if xs == [] else 1 + length(xs[1:])
```

Empty list → `0`. Otherwise, count the first element as `1` and add the length of the rest. For
`["a", "b", "c"]`:

```
length(["a","b","c"]) = 1 + length(["b","c"])
                      = 1 + (1 + length(["c"]))
                      = 1 + (1 + (1 + length([])))
                      = 1 + (1 + (1 + 0)) = 3
```

The bugs in the others:

- **A** forgets to add anything: `length(xs[1:])` with no `1 +`. It recurses all the way down and
  returns the base case `0` for *every* non-empty list. Always `0`.
- **C** has the wrong base case: an empty list has length `1`? That's an off-by-one. It returns
  `4` for a 3-element list — one too many, because the bottom of the recursion contributes a phantom
  element.
- **D** is correct *as code* — but it's a `while` **loop** with a mutated counter, which the puzzle
  ruled out. It's here to make a point: it's the iterative cousin of B. Same answer, different style.

That D-vs-B contrast is the doorway to the next idea.

### From recursion to an accumulator

Definition B builds its answer **on the way back up**: it descends to `[]`, then the `1 +`s resolve
as the calls return. Every pending `1 +` has to wait, so the machine holds one stack frame per
element. For a million-element list, that's a million frames waiting at once — and many languages will
overflow the stack.

The loop in D doesn't do that: it carries a running count `c` *forward*, finishing each step before
the next. We can get the same forward-carrying behavior recursively by passing the running total along
as an extra argument — an **accumulator**:

```python
def length(xs, acc=0):
    if xs == []:
        return acc                      # answer is already built up — just hand it back
    else:
        return length(xs[1:], acc + 1)  # do the +1 NOW, carry it forward
```

Trace it and notice the difference: `length(["a","b","c"]) → length(["b","c"], 1) →
length(["c"], 2) → length([], 3) → 3`. The addition happens *before* the recursive call, so there's
no pile of pending `1 +`s. The final call already holds the answer.

This shape — a recursive call whose result is returned *directly*, with nothing left to do
afterward — is called a **tail call**, and the accumulator is what makes it possible. Some languages
(and Bend's runtime model) can run tail calls in constant stack space, turning this recursion into
something as cheap as the loop. We'll come back to tail calls and evaluation strategy in a later
stage; for now, just register the move: **carry the answer forward in an accumulator instead of
building it up on the way back.**

**Next:** reversing a list — where the naive recursion is quietly O(n²), and an accumulator makes it
O(n) (Lesson 6).
