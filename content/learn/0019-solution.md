---
title: "Solution: Sum Types and Product Types"
description: "Why sum types make illegal states structurally unrepresentable — and what this means for safe, self-documenting data design."
lesson_number: 19
concept: "Algebraic data types"
stage: 3
layout: solution
role: solution
builds_on: [18]
skin: chalkboard
---

**Answer: (b) — B allows a state that A cannot represent.**

In encoding B (a product type), every `Opt` value simultaneously carries *both* a `has_value` boolean *and* a `value` integer. Nothing in the type prevents `{ has_value: false, value: 42 }` — a perfectly valid combination of field values that is semantically meaningless ("no value... but here's 42"). It can be constructed, stored, and passed around without any type error.

In encoding A (a sum type), the variants are structurally distinct:

- `Some(42)` — carries exactly one integer
- `None` — carries *no data at all*

The state "no value, but value = 42" **cannot exist in A** — not by convention, but by construction. There is no way to put data into `None`.

---

### Why the other options are wrong

**(a)** "Same set of valid values." The *intended* values are the same (present or absent), but the *representable* values differ. B admits a class of states with no intended meaning; A does not.

**(c)** "`None` carries no data — the value field would be undefined." Carrying no data is not a bug — it's the point. "No value" means no data. An empty constructor is perfectly valid and intentional.

**(d)** "B is more expressive." Reading both fields simultaneously is exactly what makes B *less* safe. In B, you look at `has_value` to know whether `value` means anything — nothing stops you from reading `value` when `has_value` is false. In A, the constructor *is* the signal: you can only access `value` when you've matched on `Some`.

---

### The principle: make illegal states unrepresentable

A sum type enforces that only *meaningful* combinations of data exist. This phrase — "make illegal states unrepresentable" — is one of the most useful design heuristics in typed functional programming.

You will see it repeatedly. Whenever you find yourself writing `is_valid: Bool` or `has_result: Bool` next to a field that may or may not contain meaningful data, ask: could this be a sum type instead?

```
# Before (product with implicit invariant)
type Response = { success: Bool, data: Json, error_msg: String }
# Bug: what does data mean when success=false? What does error_msg mean when success=true?

# After (sum type — invariant enforced by shape)
type Response = Ok(data: Json) | Err(message: String)
# Unambiguous: Ok carries data; Err carries a message. Never both.
```

---

### How sum types are constructed and consumed

To build a sum type value, pick a constructor: `Some(42)` or `None`.

To consume a sum type value, you *pattern match* — one branch per constructor, each branch extracting the constructor's fields. That is the topic of Lesson 20.

**Next**: once you have a sum type, you need a way to case-split on it. Pattern matching is that mechanism — and in typed languages it guarantees you handle every case (Lesson 20).
