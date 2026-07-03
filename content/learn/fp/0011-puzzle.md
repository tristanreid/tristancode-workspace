---
title: "Flatten the Nesting"
description: "Recursively flatten an arbitrarily nested list — the first algorithm that must recurse on both the head and the tail simultaneously."
lesson_number: 11
track: fp
aliases: ["/learn/0011-puzzle/"]
concept: "Recursion: nested structures"
stage: 1
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [3, 10]
skin: chalkboard
---

Every recursion you've written so far has had this shape: peel the head, do something with it, then
recurse *only on the tail*. This puzzle breaks that pattern.

**Flatten** a nested list: given a list that may contain elements or other lists (nested to any
depth), produce a single flat list of all the leaf elements in order.

```python
flatten([1, [2, 3], [4, [5, 6]], 7])   # [1, 2, 3, 4, 5, 6, 7]
flatten([[[[1]]]])                      # [1]
flatten([])                            # []
flatten([1, 2, 3])                     # [1, 2, 3]   (already flat — works too)
```

**Recursion recap (standalone):** a recursive function calls itself on a smaller input until it
reaches a base case answered directly. A list is either empty `[]` or has a first element `xs[0]`
and a rest `xs[1:]`. In Python, `isinstance(x, list)` is `True` when `x` is a list.

The wrinkle: `xs[0]` might itself be a list. If it is, you can't just prepend it — you need to
flatten *it* first, then combine that with the flattening of the rest.

```python
def flatten(xs):
    if xs == []:
        return ???
    elif isinstance(xs[0], list):
        return ??? + ???    # flatten the head list, flatten the tail, combine
    else:
        return ??? + ???    # head is a leaf element — use it, flatten the tail
```

Think through `flatten([1, [2, 3], 4])` step by step before filling it in:
- Head is `1` (not a list) → keep it, recurse on `[[2, 3], 4]`.
- Head is `[2, 3]` (a list) → flatten it (`[2, 3]`), recurse on `[4]`.
- Head is `4` → keep it, recurse on `[]` → `[]`.

**Stretch:** can this function handle infinitely deep nesting? Is there any input that could cause
it to loop forever?
