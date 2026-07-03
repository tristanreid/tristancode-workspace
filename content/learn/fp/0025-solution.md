---
title: "Solution: Unfold — Generating Structures from Seeds"
description: "Unfold is the dual of fold: generate a list from a seed. range, repeat, and iterate as unfold calls; fusing unfold+fold eliminates the intermediate list; tree unfold branches where list unfold steps linearly."
lesson_number: 25
track: fp
aliases: ["/learn/0025-solution/"]
concept: "Unfold"
stage: 4
layout: solution
role: solution
builds_on: [15, 23]
skin: chalkboard
---

### Part 1 — `range` as unfold

```python
def range2(start, stop):
    return unfold(
        start,
        lambda s: s >= stop,   # stop when we reach stop
        lambda s: s,           # element IS the seed
        lambda s: s + 1        # advance by 1
    )
```

Here the seed doubles as the element — that is the simplest case. `pred` fires the moment `s` reaches `stop`, so `stop` itself is never included.

---

### Part 2 — `repeat` as unfold

```python
def repeat(x, n):
    return unfold(
        n,                     # seed = remaining count
        lambda s: s <= 0,      # stop when count reaches 0
        lambda s: x,           # element is always x — seed is ignored
        lambda s: s - 1        # count down
    )
```

The element function *ignores* the seed entirely and always returns `x`. The seed's only job is to count. This is a common pattern: the seed carries control state (how much is left), not the output value itself.

---

### Part 3 — `iterate` as unfold

```python
def iterate(f, x, n):
    return unfold(
        (x, n),                          # seed = (current_value, steps_remaining)
        lambda s: s[1] <= 0,             # stop when count hits 0
        lambda s: s[0],                  # element = current value
        lambda s: (f(s[0]), s[1] - 1)   # step: apply f, decrement count
    )
```

The seed is a tuple because two things evolve independently: the value (under `f`) and the counter (decreasing). When the counter reaches 0, `pred` fires.

Trace on `iterate(lambda n: n*2, 1, 3)`:

```
seed=(1,3)  → element=1,  next_seed=(2,2)
seed=(2,2)  → element=2,  next_seed=(4,1)
seed=(4,1)  → element=4,  next_seed=(8,0)
seed=(8,0)  → pred fires → []

result: [1, 2, 4]  ✓
```

---

### Part 4 — Fused `sum_range`

```python
def sum_range(start, stop):
    if start >= stop:
        return 0
    return start + sum_range(start + 1, stop)
```

What happened: the `unfold` check (`s >= stop`) became the base case; `element(s)` and `foldl`'s combinator merged into `start + ...`; `step(s)` became the recursive argument. The intermediate list *evaporated* — it was never allocated.

**What is preserved:** the same computation, the same result, the same time complexity (O(stop − start) additions).

**What is lost:** modularity. The two-stage version lets you reuse the list — compute `sum`, `max`, `len`, `product` with different folds over the same `range2`. The fused version is single-purpose. Once fused, you can only compute one thing at a time from the range. This tradeoff (efficiency vs. reusability) appears repeatedly in functional programming.

---

### Part 5 — Toward tree unfold

The list `unfold` takes one seed and produces one new seed per step — linear.

A **tree unfold** would need:

- A predicate that signals *leaf* (stop branching), not just "stop".
- A value function: extract the node's value from the seed.
- Two seed functions: compute the *left* child's seed and the *right* child's seed separately.

So instead of `step : S → S`, you'd need `left_seed : S → S` and `right_seed : S → S`.

```
tree_unfold : (S, S → Bool, S → A, S → S, S → S) → Tree[A]
```

The branching is the only structural difference. The logic — seed in, values and new seeds out — is identical. Lesson 26 builds this.

---

### The deep connection

`unfold` and `foldl` are exact duals:

| | `foldl` | `unfold` |
|---|---|---|
| Direction | consume → value | seed → produce |
| Terminal case | empty list → `init` | `pred(seed)` → `[]` |
| Step | `f(acc, head)` | `element(seed)`, then `step(seed)` |
| Result type | single value `B` | `List[A]` |

Both are recursion schemes — systematic patterns for processing or producing recursive structures. The pair (fold, unfold) is the foundational vocabulary for Stages 4–7. Next: unfold for trees (Lesson 26), then their composition (Lesson 27).
