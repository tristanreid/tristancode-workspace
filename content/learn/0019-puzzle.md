---
title: "Sum Types and Product Types"
description: "The two building blocks of every algebraic data type: product (a value carries all its fields at once) and sum (a value is exactly one of its variants). Sum types make illegal states unrepresentable."
lesson_number: 19
concept: "Algebraic data types"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [18]
skin: chalkboard
mcq:
  question: "Which statement correctly describes the structural difference between encoding A and encoding B?"
  options:
    - "They represent the same set of valid values — B is just more explicit about when value is meaningful."
    - "B allows a state that A cannot represent: has_value=false paired with value=42. A has no equivalent nonsensical state."
    - "A cannot represent the no-value case because None carries no data — the value field would be undefined."
    - "B is more expressive because both has_value and value are always readable simultaneously."
  correct: 1
---

Stage 3 is about *data shapes* — how to define structure before you reason about it. Every data type is built from two fundamental pieces.

**Product type**: a value that simultaneously carries *all* of its fields. Think record or struct:

```python
@dataclass
class Point:
    x: float
    y: float
```

Every `Point` has both an `x` *and* a `y`. The word "product" reflects size: `|Float| × |Float|` possible values.

**Sum type** (also: tagged union, discriminated union, variant type): a value that is exactly *one of* a fixed set of alternatives. Each alternative is called a **constructor** or **variant**:

```python
@dataclass
class Circle:
    radius: float

@dataclass
class Rectangle:
    width: float
    height: float

Shape = Circle | Rectangle   # modern Python union
```

Every `Shape` is either a `Circle` *or* a `Rectangle` — never both. `|Shape| = |Circle| + |Rectangle|` (hence "sum"). Variants can carry *different* data: `Circle` has one field, `Rectangle` has two. This distinguishes a sum type from a plain enum.

The same idea in Scala and TypeScript:

```scala
// Scala — sealed trait is the canonical ADT form
sealed trait Shape
case class Circle(radius: Double) extends Shape
case class Rectangle(width: Double, height: Double) extends Shape
```

```typescript
// TypeScript — discriminated union
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };
```

`sealed` in Scala means: these are *all* the variants — no subclass can be added outside this file. This closure is what enables exhaustiveness checking (Lesson 20).

---

Now consider two engineers debating how to encode "an integer that might or might not exist":

```
Engineer A:  type Opt = Some(value: Int) | None
                        ^^^^^^ sum type ^^^^^^

Engineer B:  type Opt = { has_value: Bool, value: Int }
                        ^^^^^^^^ product type ^^^^^^^^^
```

Both seem workable at first glance — you check `has_value` before reading `value` in B, and you match on `Some` or `None` in A.

Which statement correctly describes the structural difference between encoding A and encoding B?
