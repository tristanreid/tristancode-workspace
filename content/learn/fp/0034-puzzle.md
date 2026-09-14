---
title: "Sharing vs Recomputation: The Tree That Is Smaller Than It Looks"
description: "A builder that reuses one immutable subtree for both children allocates a handful of objects, but a fold walks it as if it were millions. Count the real cost, then decide which folds are safe to memoize."
lesson_number: 34
track: fp
concept: "Sharing vs recomputation"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [7, 23, 25, 28, 30]
skin: chalkboard
numeric:
  question: "How many times is tree_fold called (count every call, including the first) when folding build_shared(20)?"
  answer: 2097151
  tolerance: 0
  unit: "calls"
---

**Warm-up recall (Lesson 25).** An **unfold** builds a list from a seed:
`unfold(seed, stop, emit, step)` checks `stop(seed)`; if false it emits `emit(seed)`, replaces the
seed with `step(seed)`, and repeats. Take `seed = 6`, `stop = n == 1`, `emit = n`, and
`step = n // 2 if n is even else 3*n + 1`. How many elements does the resulting list have? Keep the
number; the solution confirms it.

---

**Terms (standalone):**

- **Immutable value**: a value that can never be changed after it is built. To "modify" it you build
  a new one.
- **Sharing**: two references pointing at the *same* object in memory, rather than at two equal
  copies. With immutable values sharing is invisible to correct code: nobody can change the object
  out from under the other reference.
- **Recomputation**: doing the same pure computation again on the same input, getting the same
  answer, and paying for it again.
- **Memoization**: remembering a function's result for an input so a repeat call is a lookup. It is
  only a *transparent* optimization when the function is **pure** (output depends only on inputs, no
  side effects) — otherwise skipping the call changes what the program does.
- **Tree fold** (Lesson 23): the recursive `match` that consumes a binary tree, replacing each `Leaf`
  with `leaf_fn` and each `Node` with `node_fn` applied to the folded children.

```python
# Tree = Leaf(value) | Node(left, right)

def tree_fold(leaf_fn, node_fn, t):
    match t:
        case Leaf(v):    return leaf_fn(v)
        case Node(l, r): return node_fn(tree_fold(leaf_fn, node_fn, l),
                                        tree_fold(leaf_fn, node_fn, r))
```

Two builders that produce trees *equal in every observable way* under any pure fold:

```python
def build_shared(n):
    if n == 0:
        return Leaf(1)
    sub = build_shared(n - 1)
    return Node(sub, sub)          # both children are the SAME object

def build_copied(n):
    if n == 0:
        return Leaf(1)
    return Node(build_copied(n - 1), build_copied(n - 1))   # two separate copies
```

---

### Part 1 — What did each builder allocate?

How many distinct `Leaf`/`Node` objects exist after `build_shared(20)`? After `build_copied(20)`?

---

### Part 2 — The graded question (above)

`tree_fold` knows nothing about object identity; it just follows `left` and `right`. Fold
`build_shared(20)` with `leaf_fn = lambda v: v` and `node_fn = lambda a, b: a + b` (sum of leaves).
Count **every** call to `tree_fold`, the outermost one included. Write the recurrence before you
reach for a number: the obvious answer from Part 1 is wrong.

---

### Part 3 — Memoize by identity

```python
def memo_fold(leaf_fn, node_fn, t, cache):
    if id(t) in cache:                      # same object seen before?
        return cache[id(t)]
    match t:
        case Leaf(v):    result = leaf_fn(v)
        case Node(l, r): result = node_fn(memo_fold(leaf_fn, node_fn, l, cache),
                                          memo_fold(leaf_fn, node_fn, r, cache))
    cache[id(t)] = result
    return result
```

On `build_shared(20)` with an empty cache: (a) how many times is `memo_fold` *invoked*, counting cache
hits? (b) how many times does it actually run `leaf_fn` or `node_fn`?

---

### Part 4 — Which folds may you memoize? Write a one-line diagnosis for each

On `build_shared(20)`, is memoizing by `id(t)` correct for each of these? If not, say exactly what
breaks, and for (c) say what happens to the cost if you "fix" it by keying on `(id(t), offset)`.

- **(a)** Sum of leaf values.
- **(b)** Height of the tree (`leaf → 0`, `node → 1 + max(a, b)`).
- **(c)** `label(t, offset)`: number the leaves left to right, returning a tree whose leaves hold
  their position. `offset` is threaded down from the root (left child gets `offset`, right child gets
  `offset + number_of_leaves(left)`).
- **(d)** Sum of leaves, but `node_fn` also does `metrics.node_visits += 1`.

---

### Part 5 — Same bug, Spark-sized

```python
parsed = raw.map(parse_event).filter(is_valid)     # a recipe: nothing runs yet
n      = parsed.count()                            # action 1
total  = parsed.map(lambda e: e.amount).reduce(add)  # action 2
```

With no `.cache()`, how many times does `parse_event` run per input row? With `parsed.cache()` added
before `count()` (and no evictions)? And what goes wrong if `parse_event` stamps each event with
`uuid4()` or `datetime.now()`?
