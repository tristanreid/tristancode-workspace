---
title: "Unfold: Generating Structures from Seeds"
description: "The dual of fold — instead of consuming a list into a value, unfold produces a list from a seed. Master range, repeat, and iterate, then see how fusing unfold with fold eliminates the intermediate structure."
lesson_number: 25
concept: "Unfold"
stage: 4
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [15, 23]
skin: chalkboard
---

The fold from Lessons 15 and 23 is a *consumer*: give it a list or tree, it produces a value. The **unfold** is its dual — give it a *seed*, it produces a list. Together, fold and unfold form the "build then consume" pattern that underlies `range`, `iterate`, and infinite streams.

**Terms:**

- **Unfold** (also: anamorphism): a function that generates a list from a seed by repeatedly applying a step until a predicate fires.
- **Seed**: the initial state from which elements are extracted. The seed evolves at each step; the element emitted and the next seed are computed separately.
- **fold** (review): `foldl(init, f, list)` consumes a list into a single value by applying `f(acc, x)` at each step.

Here is the prototype `unfold`:

```python
def unfold(seed, pred, element, step):
    """
    seed    — initial state
    pred    — when pred(seed) is True, stop (return [])
    element — extract the next output element from the current seed
    step    — advance the seed to produce the next one
    """
    if pred(seed):
        return []
    return [element(seed)] + unfold(step(seed), pred, element, step)
```

Example:

```python
unfold(0, lambda s: s >= 5, lambda s: s, lambda s: s + 1)
# → [0, 1, 2, 3, 4]
```

Here the seed *is* the element. That is not always the case.

---

### Part 1 — Implement `range(start, stop)` using `unfold`

`range(2, 7)` should produce `[2, 3, 4, 5, 6]`.

What are `seed`, `pred`, `element`, and `step`? Write the call:

```python
def range2(start, stop):
    return unfold(???, ???, ???, ???)
```

---

### Part 2 — Implement `repeat(x, n)` using `unfold`

`repeat("a", 4)` → `["a", "a", "a", "a"]`

The element never changes, but the seed must count down. What carries the count? What does `element` return (it can ignore the seed)?

---

### Part 3 — Implement `iterate(f, x, n)` using `unfold`

`iterate(f, x, n)` produces `[x, f(x), f(f(x)), …, f^(n−1)(x)]`.

```python
iterate(lambda n: n * 2, 1, 5)       # → [1, 2, 4, 8, 16]
iterate(lambda s: s + "!", "hi", 4)  # → ["hi", "hi!", "hi!!", "hi!!!"]
```

The tricky part: the seed must carry *two* pieces of information — the evolving value and a remaining count. Represent them as a tuple.

What is `seed`? What is `element(s)`? What is `step(s)`?

---

### Part 4 — Fuse unfold with fold: no intermediate list

`sum_range(start, stop)` computes the sum of integers from `start` to `stop − 1`.

The two-stage version:

```python
nums   = unfold(start, lambda s: s >= stop, lambda s: s, lambda s: s + 1)
result = foldl(0, lambda acc, x: acc + x, nums)
```

Can you write `sum_range` as a *single* recursive function that computes the sum without ever building the list?

```python
def sum_range(start, stop):
    ...
```

Compare its shape to the two-stage version. What structure disappeared? What information is preserved, and what is lost?

---

### Part 5 — Toward tree unfold

`unfold` has this informal type:

```
unfold : (S, S → Bool, S → A, S → S) → List[A]
```

It produces one new element per step, with one new seed — a linear chain. What would need to change to build a *tree* instead of a list? (You don't need to write code — describe the different parts. Lesson 26 will implement it.)
