---
title: "Solution: Flatten the Nesting"
description: "Doubly-recursive flatten — why it terminates, how it handles arbitrary depth, and what this teaches about recursive descent on tree-shaped data."
lesson_number: 11
track: fp
aliases: ["/learn/0011-solution/"]
concept: "Recursion: nested structures"
stage: 1
layout: solution
role: solution
builds_on: [3, 10]
skin: chalkboard
---

```python
def flatten(xs):
    if xs == []:
        return []
    elif isinstance(xs[0], list):
        return flatten(xs[0]) + flatten(xs[1:])
    else:
        return [xs[0]] + flatten(xs[1:])
```

Trace `flatten([1, [2, 3], 4])`:

```
flatten([1, [2,3], 4])
  = [1] + flatten([[2,3], 4])             # head is 1 (leaf)
  = [1] + (flatten([2,3]) + flatten([4]))  # head is [2,3] (list)
  = [1] + ([2,3] + [4])                   # flatten([2,3]) = [2]+flatten([3])
  = [1, 2, 3, 4]                          #                = [2]+[3]==[2,3]
```

Two recursive calls: `flatten(xs[0])` drills *into* the head, `flatten(xs[1:])` advances *along*
the rest. That's the new pattern — recursive on both dimensions at once.

### Why it terminates

Every recursive call receives either:
- `xs[0]` — the head list, which is strictly shorter than `xs` (it has fewer total elements).
- `xs[1:]` — the tail, which is strictly shorter than `xs` (one element removed).

Neither call is given a list as large as the input, so the total "work remaining" shrinks at every
step. Eventually everything reduces to empty lists, which return `[]` immediately.

### The stretch — infinite loops?

No, it cannot loop forever given a finite, non-cyclic input. Python's nested lists are finite trees;
every path from root to leaf has finite length. Each call reduces the total number of elements by
at least one, so termination is guaranteed. The only way to get an infinite loop here would be a
circular reference (`xs = []; xs.append(xs)`) — a structure that isn't really a tree at all.

### A broader pattern: tree recursion

What you've written is **tree recursion** — the recursive call processes both the "children"
(substructure of the head) and the "siblings" (rest of the list). This is the fundamental shape for
working with tree-shaped data:

- **Descend into subtrees** with one recursive call.
- **Advance to the next sibling** with another.

In Stage 3 you'll encode trees explicitly as algebraic data types and write recursive functions over
them with pattern matching. Flatten is a preview: the nested list *is* a tree, and what you've done
is a pre-order traversal that collects all leaves.

### Cost

`flatten` as written calls `+` (list concatenation) on every element, and concatenating two lists
of lengths `a` and `b` copies `a` elements. For a deeply left-nested input like
`[[[[1], 2], 3], 4]`, those copies add up to O(n²) — the same trap as the naive `reverse` in
Lesson 6. An accumulator version fixes it:

```python
def flatten(xs, acc=[]):
    if xs == []:
        return acc
    elif isinstance(xs[0], list):
        return flatten(xs[0], flatten(xs[1:], acc))
    else:
        return flatten(xs[1:], [xs[0]] + acc)  # prepend, reverse at end or use deque
```

That's a trickier refactor — not required here, but the pattern is the same accumulator move from
Lessons 5 and 6. Think of it as optional homework.

**Next:** the accumulator pattern made formal — tail recursion and why it lets a runtime treat deep
recursion like a loop (Lesson 12).
