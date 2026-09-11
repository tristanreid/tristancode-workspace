---
title: "The Probable Story That Can't Be More Probable"
description: "A detailed, specific story feels more likely than the plain fact it's a subset of. Compute the actual joint probability and watch representativeness lose to arithmetic."
lesson_number: 20
track: cog
concept: "Heuristics & biases: representativeness and the conjunction fallacy"
stage: 5
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: []
skin: chalkboard
numeric:
  question: "What is P(software engineer AND plays in a band), given the base rates below?"
  answer: 0.0075
  tolerance: 0.0005
---

**Retrieval check (from lesson 6, new setting).** A support-ticket triage system scores pending tickets
by priority = credibility × value ÷ cost — credibility that the ticket is genuinely urgent, value of
resolving it (customers affected, revenue at risk), cost (engineer-hours to investigate). Three
tickets: **T1** (credibility 0.8, value 0.9, cost 2), **T2** (credibility 0.9, value 0.2, cost 1),
**T3** (credibility 0.5, value 0.6, cost 1.5). Which ticket gets worked first? (This is the *correct*
use of the formula — all three terms genuinely present, unlike lesson 14's zero-value trap.) Work it
out; the solution confirms it.

---

### Two heuristics, one machinery consequence

A **heuristic** is a mental shortcut — a fast, usually-good-enough rule for judgment under uncertainty,
substituting an easy question for a hard one. Two of the best-studied, from Tversky and Kahneman's
research program:

- **Availability**: judging how probable or frequent something is by how *easily examples come to
  mind* — not by actual frequency. Plane crashes feel more common than they are because they're
  vivid and heavily covered; routine car trips don't make the news, so their much higher actual risk
  feels less available to recall.
- **Representativeness**: judging how probable something is by how well it *matches a mental
  stereotype or pattern* — not by the actual base rates involved. A description that "sounds like" a
  category member gets rated as more probably a member of that category than the numbers justify.

Representativeness has a specific, checkable failure mode: the **conjunction fallacy**. For any two
events A and B, the probability that *both* happen (A **and** B) can never exceed the probability that
*just one of them* (A alone) happens — if you're a member of set A∩B, you're necessarily also a member
of set A. This is pure arithmetic (P(A∩B) ≤ P(A), always), not a matter of judgment. But when a
conjunction "sounds like" a better-fitting story than the plain event alone, representativeness
reliably makes people rate the conjunction as *more* probable — a description that fits a specific
narrative can feel more believable than the bare category it's a strict subset of.

### The puzzle

A hiring pool's résumés include this profile: quiet, detail-oriented, uses precise technical language,
was a musician for several years before switching careers. From this team's actual hiring data:

- **P(software engineer)** = 0.15 (15% of this résumé pool are software engineers, full stop)
- **P(plays in a band | software engineer)** = 0.05 (among software engineers in this pool, 5% also
  currently play in a band)

The description above "sounds like" the second, more specific story — engineer *and* still-a-musician —
more than it sounds like "software engineer" alone, which is exactly the setup representativeness
exploits. Compute the actual joint probability, **P(software engineer AND plays in a band)**, from the
base rates given, and compare it to P(software engineer) = 0.15 alone.
