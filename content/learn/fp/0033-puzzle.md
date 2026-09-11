---
title: "Tail Calls: What an Accumulator Actually Buys You"
description: "A tail call is a recursive call with nothing left to do after it returns. Compare stack depth directly between a non-tail sum and its accumulator-passing rewrite, on a list long enough to matter."
lesson_number: 33
track: fp
aliases: ["/learn/0033-puzzle/"]
concept: "Tail calls & accumulators"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [6, 12, 32]
skin: chalkboard
numeric:
  question: "For a 40-element list, how many fewer stack frames does the accumulator (tail-recursive) version of sum use, compared to the plain non-tail version — assuming a language that actually applies tail-call optimization?"
  answer: 39
  tolerance: 0
  unit: "stack frames saved"
---

**Warm-up recall (Lesson 20).** **Pattern matching** is structured case analysis over a sum type's
variants — each case gets its own branch, checked exhaustively. Given
`Shape = Circle(r: Int) | Rectangle(w: Int, h: Int)`, and `area` defined by pattern match
(`Circle(r) → r*r*3` as a rough area, `Rectangle(w,h) → w*h`), what is `area(Rectangle(4, 5))`? Keep
the number; the solution confirms it.

---

**Terms (standalone):**

- **Tail position**: the very last thing a function does before returning — nothing happens to the
  result afterward. `return f(x)` has `f(x)` in tail position. `return 1 + f(x)` does **not** — the
  `+ 1` is work still pending after `f(x)` returns.
- **Tail call**: a function call that occurs in tail position.
- **Tail-call optimization (TCO)**: a technique some language runtimes use to reuse the *current*
  stack frame for a tail call instead of pushing a new one — since there's nothing left to do in the
  current frame after the call returns, keeping it around serves no purpose. Python does **not** do
  this; Scheme, and some JavaScript engines, do.
- **Accumulator pattern** (Lesson 12): thread a running result as an extra argument, updated on the
  way down, so the final call can just return it directly — no pending work after the recursive call.

### The two versions

```python
def sum_plain(lst):
    if not lst:
        return 0
    return lst[0] + sum_plain(lst[1:])       # NOT tail position: "+ lst[0]" happens after the call returns

def sum_acc(lst, acc):
    if not lst:
        return acc
    return sum_acc(lst[1:], acc + lst[0])    # tail position: nothing happens after this call returns
```

`sum_plain`'s recursive call is wrapped in `lst[0] + ...` — that addition can't happen until the
recursive call finishes, so the current frame must stay on the stack, waiting, for the entire depth
of the recursion. `sum_acc`'s recursive call *is* the return value, with no wrapping expression left
to evaluate afterward — there is nothing the current frame needs to stick around for.

---

### Part 1 — Stack depth for `sum_plain` on a 40-element list

Each call to `sum_plain` that hasn't hit the base case yet needs its own frame, because it's still
waiting on `+`. Counting the very first call as depth 1, how many stack frames does `sum_plain` need
simultaneously at the deepest point, for a 40-element list?

---

### Part 2 — Stack depth for `sum_acc`, *if* TCO applied

If a runtime actually reuses the current frame on every tail call (real Scheme runtimes guarantee
this; Python does not), how many stack frames does `sum_acc` need at once, regardless of list length
— 40 elements, 4 million elements, doesn't matter?

---

### Part 3 — The graded question (above)

Using your answers to Parts 1 and 2, compute how many fewer stack frames the TCO'd `sum_acc` uses
compared to `sum_plain`, specifically for the 40-element case. Enter it in the numeric box.

---

### Part 4 — Why Python still blows the stack on `sum_acc`

Python has no TCO — every call, tail or not, pushes a real frame, and Python's default recursion
limit is around 1000. Given that, does rewriting `sum_plain` into the accumulator form `sum_acc`
actually save you from a `RecursionError` on a 10,000-element list *in Python specifically*? What
would you have to do instead, in a language without TCO, to sum a 10,000-element list without
recursion-depth trouble?
