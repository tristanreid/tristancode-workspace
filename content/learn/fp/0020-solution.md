---
title: "Solution: Pattern Matching: Exhaustive Case Analysis"
description: "Exhaustiveness is enforced at compile time in typed languages — the compiler enumerates all constructors and flags missing arms before the program runs."
lesson_number: 20
track: fp
aliases: ["/learn/0020-solution/"]
concept: "Pattern matching"
stage: 3
layout: solution
role: solution
builds_on: [19]
skin: chalkboard
---

**Answer: (b) — at compile time.**

In a language with exhaustive pattern matching, the compiler knows all constructors of a sealed sum type. When type-checking the `match` expression, it enumerates `Ok` and `Err` and finds no arm for `Err`. This is flagged *before the program runs*.

Actual compiler output:

```scala
// Scala
warning: match may not be exhaustive.
It would fail on the following input: Err(_)
    match result:
    ^^^^^
```

```
// Rust — exhaustiveness is an error, not a warning
error[E0004]: non-exhaustive patterns: `Err(_)` not covered
```

In Haskell, GHC emits `-Wincomplete-patterns` by default. In F#, incomplete matches are errors.

---

### Why the other options are wrong

**(a)** "Most pattern-matching languages don't check." This is backwards: the defining feature of sum types in typed functional languages is compile-time exhaustiveness. Scala, Haskell, Rust, F#, OCaml, Elm, Swift, and Kotlin all enforce it for sealed/closed types.

**(c)** "Detected at the call site where Err is created." The call site that constructs `Err(...)` has no connection to your match expression. There is no mechanism for this.

**(d)** "Detected at runtime." That is what happens in Python and JavaScript, which have no notion of closed sum types. A `match` in Python silently falls through if no arm matches; you'd need an explicit `case _: raise` to catch it. Compile-time detection is a strict improvement over runtime detection — the bug surfaces even on code paths that tests don't exercise.

---

### The real benefit: adding a variant forces updates everywhere

Suppose you add `Timeout` to the `Result` type:

```scala
sealed trait Result
case class Ok(value: Int) extends Result
case class Err(message: String) extends Result
case class Timeout(after_ms: Int) extends Result   // new
```

The compiler now reports every `match` in your codebase that doesn't handle `Timeout`. You get a complete list of call sites that need updating — for free, before you run a single test. With an open class hierarchy (`isinstance` chains), you get nothing; the gaps are silent.

---

### Exhaustiveness and open-world vs closed-world

Exhaustiveness only works for *closed* (sealed) sum types — where the compiler knows all variants at compile time. An open class hierarchy (e.g. non-sealed Java classes, Python's plain inheritance) is open-world: anyone can subclass, so the compiler cannot enumerate all possible shapes.

This is a deliberate trade-off. `sealed` gives you exhaustiveness at the cost of extensibility. For domains where the set of cases is *known and fixed* (like `Result`, `Shape`, expression trees, parse trees, configuration), sealed is almost always the right call.

---

### Pattern matching also unpacks fields

Pattern matching is not just dispatch — it simultaneously destructs the value and binds fields:

```scala
result match {
  case Ok(v)    => v * 2    // v is bound to the integer
  case Err(msg) => { log(msg); -1 }  // msg is the string
}
```

Compare to the accessor approach:
```python
if isinstance(result, Ok):
    v = result.value    # two steps: check then access
    return v * 2
elif isinstance(result, Err):
    msg = result.message
    log(msg)
    return -1
```

Pattern matching collapses "check constructor" + "extract fields" into one syntactic unit. The type system guarantees that `v` in the `Ok` arm is an `Int` — you never need to check whether the field exists.

---

**Next**: the most important sum type in functional programming refers to *itself* — a binary tree (Lesson 21).
