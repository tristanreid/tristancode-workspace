---
title: "What Happens Next: Continuation-Passing Style"
description: "Make 'what to do with this result' an explicit argument instead of an implicit return, and every call becomes a tail call."
lesson_number: 33
track: fp
aliases: ["/learn/0033-puzzle/"]
concept: "Continuation-passing style (CPS)"
stage: 6
layout: puzzle
role: puzzle
answer_type: reveal
builds_on: [17, 31]
skin: chalkboard
---

Stage 5 ended on tail calls: a call is in tail position when it's the *entire* return expression,
nothing pending afterward. Stage 6 opens with a technique that makes **every** call a tail call, by
restructuring how functions communicate their results at all.

**Terms (standalone):**

- **Direct style**: the ordinary way you write functions — a function `return`s its result, and the
  *caller* decides what to do with it. `1 + f(x)` is direct style: `f` returns a value, then the
  caller (whoever wrote `1 + f(x)`) adds `1` to it.
- **Continuation**: "the rest of the computation" — everything that would happen with a value once
  it's produced, reified as an explicit function. If the original code was `1 + f(x)`, the
  continuation of `f(x)` is "take whatever `f(x)` returns, and add 1 to it" — as a function:
  `lambda result: 1 + result`.
- **Continuation-passing style (CPS)**: a way of writing functions where, instead of `return`ing a
  value to an implicit caller, a function takes an *extra argument* — the continuation, usually
  called `k` — and **calls `k` with its result** instead of returning. Nothing is ever "returned" in
  the ordinary sense; the continuation decides what happens next, and the original function's job
  ends the moment it calls `k`.

### From direct style to CPS

Direct style:

```python
def add1(x):
    return x + 1

result = add1(5)
print(result)          # "what happens next" is implicit — whatever comes after this line
```

CPS version — `add1` takes a continuation `k` and calls it instead of returning:

```python
def add1_cps(x, k):
    k(x + 1)            # instead of "return x + 1", CALL k with the result

add1_cps(5, lambda result: print(result))   # the "what happens next" is now an explicit argument
```

Notice: `add1_cps` never uses `return` for its real result — it *calls* `k`. And critically, `k(x +
1)` is itself a **tail call**: it's the last thing `add1_cps` does, nothing pending afterward. Every
CPS function's body ends in exactly one call — to `k`, or to another CPS function passing along a
continuation — so every call in CPS code is a tail call. This is exactly what closes the loop from
Lesson 31: CPS is a systematic way to make tail-call-friendly code, not by hoping you remembered an
accumulator, but by construction.

---

### Part 1 — Convert `square` and chain it

Direct style:

```python
def square(x):
    return x * x

result = square(4) + 1
print(result)   # 17
```

Rewrite `square` in CPS as `square_cps(x, k)`. Then write the call that reproduces `square(4) + 1`
followed by `print(...)`, entirely via continuations — no `return` of a real value anywhere, no
implicit "whatever comes after this line."

(Hint: `square_cps(4, k)` should call `k` with `16`. What continuation, when called with `16`,
performs the `+ 1` and then the `print`?)

---

### Part 2 — Chain two CPS calls: `add1_cps` then `square_cps`

Direct style: `square(add1(3))` → `16`.

Using `add1_cps` and `square_cps` from above, write the CPS call chain that computes
`square(add1(3))` and prints it. Pay attention to *whose* continuation gets passed to whom.

---

### Part 3 — Reveal: what does CPS make explicit that direct style hides?

In direct style, "what happens after this function returns" lives in the call stack — implicitly,
as the sequence of pending frames waiting for a value. In CPS, where does that same information
live instead? What's the practical consequence of moving it from an implicit stack to an explicit,
ordinary function value that gets passed around like any other argument?
