---
title: "The Substitution Game"
description: "Discover what referential transparency means by trying to swap expressions for their values — and seeing when that swap breaks things."
lesson_number: 7
concept: "Referential transparency"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1, 2]
skin: chalkboard
mcq:
  question: "After evaluating `f(5)` once and getting the result `10`, you want to replace every occurrence of `f(5)` in your program with the literal `10` — the way you might simplify algebra. For which function is that substitution always safe?"
  options:
    - "def f(x): print(x); return x * 2"
    - "call_count = 0\ndef f(x):\n    global call_count\n    call_count += 1\n    return x * 2"
    - "import random\ndef f(x): return x * random.random()"
    - "def f(x): return x * 2"
  correct: 3
---

In algebra, you can replace an expression with its value without changing anything. If `y = 3 + 4`,
you can substitute `7` for `3 + 4` anywhere it appears, and the math stays the same. Functions in
most programming languages *look* like algebra — but they aren't always.

**Referential transparency** is the property that makes the substitution safe. A function call is
*referentially transparent* if you can always replace it with its return value and the surrounding
program behaves identically.

Recap of terms you'll need:

- A **pure function** is one whose output depends only on its inputs, with no side effects. (Side
  effects include: printing to the screen, reading user input, modifying a variable that lives
  outside the function, generating a random number, writing a file, etc.)
- **Substitution model**: a way to reason about code by replacing each function call with its result,
  one step at a time — the same way you simplify an algebraic expression.

Below are four definitions of `f`. After running `f(5)` once and observing it returns `10`, you want
to mechanically replace *every subsequent call* `f(5)` with the literal `10`.

```python
# Option A
def f(x):
    print(x)        # writes to the terminal
    return x * 2

# Option B
call_count = 0
def f(x):
    global call_count
    call_count += 1   # modifies a variable that lives outside f
    return x * 2

# Option C
import random
def f(x):
    return x * random.random()   # result varies each call

# Option D
def f(x):
    return x * 2
```

For each option, think: if you replaced `f(5)` with `10` everywhere, would the program behave
exactly the same as if the calls had actually been made?
