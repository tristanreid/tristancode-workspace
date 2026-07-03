---
title: "When Multiplying Is Legal"
description: "Independence is a precise claim — learning one event tells you nothing about the other — and assuming it falsely is how probability arguments go badly wrong."
lesson_number: 4
track: bayes
concept: "Independence"
stage: 0
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [3]
skin: chalkboard
mcq:
  question: "In exactly one of these calculations the independence assumption is dangerously wrong. Which?"
  options:
    - "A — P(both coins heads) = 0.5 × 0.5, for two fair coins flipped in different rooms"
    - "B — P(both drives fail this year) = 0.03 × 0.03, for two drives of the same model, in the same RAID enclosure, on the same power rail"
    - "C — P(both dice show six) = 1/6 × 1/6, for two dice rolled together"
    - "D — P(heads then a six) = 0.5 × 1/6, for a coin flip followed by a die roll"
  correct: 1
---

Last lesson ended with a warning: P(A and B) = P(A) · P(B) — multiplying the plain, unconditional
probabilities — is only legal when A and B are **independent**. Time to make that precise.

Two events are independent when learning that one happened doesn't move your probability of the
other at all:

    P(A | B) = P(A)

Plug that into the multiplication rule P(A and B) = P(A | B) · P(B) and the conditional collapses:
P(A and B) = P(A) · P(B). So "multiply the plain probabilities" isn't a separate rule — it's the
multiplication rule in the special case where conditioning changes nothing.

Note what independence is *not*: it is not "the events feel unrelated," "the events are physically
separate," or "nobody planned a connection." It's a claim about *information*: knowing B leaves
your belief about A exactly where it was. That's a strong claim, and the world violates it
constantly — most often through a **common cause** lurking behind both events.

Each option in the question multiplies two per-event probabilities to get a joint. Three of the
multiplications are fine. One of them is the kind of error that has produced real disasters —
in datacenters and in courtrooms.
