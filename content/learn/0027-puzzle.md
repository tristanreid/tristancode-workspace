---
title: "Fold ∘ Unfold: Build Then Consume"
description: "Many algorithms secretly unfold a structure and then fold it. Recognizing this decomposition — and knowing when to fuse the stages — is a key design skill. Work through factorial, merge sort, and the parallel reduction surprise."
lesson_number: 27
concept: "Fold ∘ Unfold"
stage: 4
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [15, 25]
skin: chalkboard
---

The previous two lessons gave you `unfold` (Lesson 25) and `tree_unfold` (Lesson 26). This lesson asks: what happens when you *compose* them with a fold?

Many algorithms decompose into two stages you may not have noticed:

1. **Unfold** — expand a seed into an intermediate structure.
2. **Fold** — consume the structure to produce a result.

This composition (fold ∘ unfold) is called a **hylomorphism** — a word you don't need to memorize, but a pattern you will recognize repeatedly.

**Terms:**

- **Hylomorphism**: fold ∘ unfold. Build an intermediate structure from a seed, then immediately consume it. The intermediate structure need never exist as a concrete value.
- **List unfold** (standalone, from Lesson 25): `unfold(seed, pred, element, step) → List`.
- **foldl** (standalone, from Lesson 15): `foldl(init, f, list) → value`. Processes a list left-to-right, accumulating a result.

---

### Part 1 — Identify the hidden stages

For each computation below, identify the implicit unfold (what is the seed? what is the intermediate structure?) and the implicit fold (what is `init`? what is the combinator `f`?).

**(a) `factorial(n)` = 1 × 2 × 3 × … × n**

The intermediate structure is a list of integers. What generates the list? What folds it?

**(b) `max_of_range(a, b)` = max of the integers a, a+1, …, b−1**

Same question.

**(c) The merge step in merge sort**

Given two already-sorted lists `left` and `right`, the merge *consumes* them — no unfold. Is there a fold stage? What is it folding, and what does `init` look like here?

---

### Part 2 — Mechanical fusion

A hylomorphism can always be fused into a single recursive function. Here is the template:

```python
def hylo(seed, pred, element, step, init, combine):
    """
    unfold parameters: pred, element, step (from Lesson 25)
    fold   parameters: init, combine
    """
    if pred(seed):
        return init
    return combine(element(seed), hylo(step(seed), pred, element, step, init, combine))
```

Note: `combine` receives `(element, rest_result)` — the current element and the already-folded result from the remaining seeds. This is right-fold ordering; for left-fold order you'd need an accumulator, but right-fold suffices here.

Write `factorial(n)` as a call to `hylo` — without building an intermediate list.

---

### Part 3 — When to keep the stages separate

The fusion in Part 2 always produces the *same result*, but you often want the two-stage version. Give one concrete reason to prefer the **two-stage** version, and one concrete reason to prefer the **fused** version.

---

### Part 4 — MCQ: what shape is this?

```python
def mystery(tree):
    nodes = tree_fold(
        [],
        lambda v, l_nodes, r_nodes: l_nodes + [v] + r_nodes,
        tree
    )
    return foldl(0, lambda acc, x: acc + x, nodes)
```

Recall: `tree_fold(leaf_val, node_fn, tree)` from Lesson 23 — `leaf_val` is what a `Leaf` produces; `node_fn(v, left_result, right_result)` combines a node value with the already-folded subtree results.

Which statement best describes `mystery`?

(a) A list fold followed by a tree unfold.
(b) A tree fold (unfold stage) followed by a list fold (consume stage) — a hylomorphism where the intermediate is a list of all node values.
(c) A direct tree traversal with no intermediate structure.
(d) A tree unfold followed by a tree fold.

---

### Part 5 — The parallel surprise

Sequential `foldl` is inherently sequential: each step depends on the previous accumulator. But sum-via-foldl and sum-via-tree-fold give the same answer.

Here is `sum_list` done two ways:

```python
# Sequential: foldl processes left-to-right; each step waits for the previous
sum_seq  = foldl(0, lambda acc, x: acc + x, [1, 2, 3, 4])

# Parallel:   build a balanced tree, fold it — left and right subtrees are independent
tree = tree_unfold([1,2,3,4], lambda xs: len(xs)==0,
                   lambda xs: xs[len(xs)//2],
                   lambda xs: xs[:len(xs)//2],
                   lambda xs: xs[len(xs)//2+1:])
sum_par = tree_fold(0, lambda v, l, r: v + l + r, tree)
```

Both compute 10. The difference is the *dependency graph*: `sum_seq` is a chain (each node waits); `sum_par` is a tree (depth log n, fully parallel).

**Question**: what property of addition allows us to re-order the computation this way without changing the answer? (One word is enough — but explain why it matters here.)
