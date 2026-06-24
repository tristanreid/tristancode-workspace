---
title: "Solution: The List That Wouldn't Change"
description: "Why xs + [4] is the immutable move, and how immutability lets parallel workers share data without locks."
lesson_number: 2
concept: "Immutability"
stage: 0
layout: solution
role: solution
builds_on: [1]
skin: chalkboard
---

**The answer is B: `return xs + [4]`.**

`xs + [4]` evaluates to a *new* list. The original `xs` is read but never touched, so the caller's
`scores` stays `[10, 20, 30]` and `result` becomes `[10, 20, 30, 4]`. Two separate values, exactly as
the caller expected.

The other three all mutate the original in place:

- **A — `xs.append(4)`** tacks `4` onto the very list the caller passed in. `scores` becomes
  `[10, 20, 30, 4]` too. Surprise side effect.
- **D — `xs += [4]`** looks like "make a new list," but for a Python list `+=` is in-place extension —
  the same object the caller holds is modified.
- **C — `xs[len(xs):] = [4]`** is slice assignment, another in-place edit of the original.

The trap in B-vs-D is worth remembering: `xs = xs + [4]` rebinds a name to a new list, but
`xs += [4]` mutates the existing one. They look almost identical and behave oppositely.

### Expressions, not statements

Notice that B is a single **expression** — a piece of code that *evaluates to a value* (`xs + [4]`).
The others lean on **statements** — instructions that *do something* (append, assign). Functional
thinking pushes you toward expressions: instead of "go change that list," you say "here is a new list
that is the old one plus 4." You describe *what the value is*, not *what steps to perform*.

### Why immutability matters for parallelism

If a value can never change, then any number of workers can read it **at the same time** and none of
them can corrupt it for the others. There's no torn read, no half-updated state, nothing to lock.

That's the deal immutability and purity strike together: [pure functions](../0001-puzzle/) don't change
shared state, and immutable values *can't* be changed out from under you. Take both away and parallel
code needs locks and mutexes to stop workers from clobbering each other. Keep both, and a runtime like
**Bend** can fan your work out across many cores freely — because there's simply nothing to fight over.

**Next:** we put this mindset to work on the most fundamental functional tool of all — **recursion** —
starting by summing a list in Lesson 3.
