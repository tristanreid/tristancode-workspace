---
title: "Pattern Matching: Exhaustive Case Analysis"
description: "Pattern matching decomposes sum types by their constructor — and in typed languages, forces you to handle every variant, catching gaps at compile time rather than at runtime."
lesson_number: 20
concept: "Pattern matching"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [19]
skin: chalkboard
mcq:
  question: "In a language with exhaustive pattern matching, you write a match on Result with only the Ok arm. What is the EARLIEST point at which the missing Err arm is detected?"
  options:
    - "Never — most pattern-matching languages do not check exhaustiveness."
    - "At compile time — the type-checker flags the missing arm before the program runs."
    - "At the call site where an Err value is created."
    - "At runtime, when the match expression encounters an Err value."
  correct: 1
---

A **sum type** (Lesson 19) defines all the shapes a value can take. **Pattern matching** is the structured mechanism for consuming those shapes — one arm per constructor, each arm extracting the constructor's fields in one step.

**Terms:**

- **Arm**: one case in a match, written `constructor(fields) => expression`. The arm fires when the value has that constructor.
- **Exhaustiveness**: every constructor of the matched type has a corresponding arm. A language with exhaustive checking rejects non-exhaustive matches at compile time.
- **Sealed sum type**: a sum type where all constructors are fixed at definition time. The compiler can enumerate them, enabling exhaustiveness checking.

---

**Example** — `Shape = Circle(radius) | Rectangle(w, h)`:

```python
# Python — structural pattern match, runtime only (no compile-time exhaustiveness)
def area(shape):
    match shape:
        case Circle(radius=r):
            return 3.14159 * r * r
        case Rectangle(width=w, height=h):
            return w * h
```

```scala
// Scala — sealed trait; exhaustiveness is a compile-time guarantee
def area(s: Shape): Double = s match {
  case Circle(r)        => math.Pi * r * r
  case Rectangle(w, h) => w * h
}
// If you add a Triangle constructor to the sealed trait later,
// the compiler warns at every match that doesn't cover Triangle.
```

**Compare to if/else with field inspection:**

```python
def area(shape):
    if isinstance(shape, Circle):
        return 3.14159 * shape.radius ** 2
    elif isinstance(shape, Rectangle):
        return shape.width * shape.height
    # Triangle silently returns None — no error, wrong answer.
```

Pattern matching on a sealed sum type requires handling every variant. `isinstance` chains have no such guarantee: add a new subclass and existing code silently ignores it.

---

**The puzzle:**

A `Result` type is defined as: `Ok(value: Int) | Err(message: String)`.

In a language with exhaustive pattern matching (Scala, Haskell, Rust), you write:

```
match result:
  case Ok(v):  return v * 2
  # Err arm: not written
```

What is the *earliest* point at which the missing `Err` arm is detected?
