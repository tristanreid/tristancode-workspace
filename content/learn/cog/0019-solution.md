---
title: "Solution: Good Enough, On Purpose"
description: "Expected value of one more look is 0.2 hours against a 0.5-hour cost — searching further is a losing bet, and stopping there is satisficing working correctly, not settling."
lesson_number: 19
track: cog
concept: "Satisficing (Simon): why real agents don't optimize"
stage: 5
layout: solution
role: solution
builds_on: [6]
skin: chalkboard
resources:
  - title: "Stanford Encyclopedia of Philosophy — Bounded Rationality"
    url: https://plato.stanford.edu/entries/bounded-rationality/
    note: "a rigorous overview of Simon's argument and its descendants in economics and AI"
---

**Retrieval check answer.** The fact-checking desk has the forcing property, not the CI pipeline's
adequacy: a later tip needs to be able to send the desk back to re-verify an already-published claim,
and there's no way to know in advance which order tips, sources, and drafts will need to revise each
other in. A fixed tips → verify → publish pipeline would either lock in early mistakes (publish before
a later tip could have corrected it) or need an ever-growing tangle of "go back and recheck" edges
bolted onto a structure that was supposed to be one-way — lesson 7's tell that the architecture wants
to be a blackboard.

---

### The computation

Expected value of researching one more candidate = P(better) × (value if better) + P(not better) ×
(value if not) = 0.10 × 2 hours + 0.90 × 0 hours = **0.2 hours**.

Compare to the cost of researching it: **0.5 hours**. The expected payoff (0.2 hours) is *less* than
the cost of getting it (0.5 hours) — continuing to search has **negative expected net value**. The
rational move, by Simon's logic, is to **satisfice**: stop, and go with the candidate already in hand.

**This is not "settling for less than the best."** It's the correct application of the exact
value-versus-cost logic lesson 6's agenda scoring used for a queue of pending actions, applied here to
a single stopping decision: an action (searching further) is only worth taking if its expected value
exceeds its cost, and 0.2 < 0.5 means it doesn't. An agent that kept searching anyway — chasing a
"best possible" option regardless of what one more look actually costs and is expected to return —
would be the one behaving irrationally, not the one that stopped.

**Why Simon insisted this is the normal case, not an exception.** True optimization requires knowing
the entire option space and its exact values up front, or having unlimited time and computation to find
out — a condition that essentially never holds for a real decision-maker with limited information,
limited time, and limited compute (Simon's **bounded rationality**). Once search itself has a cost and
the space of options is only partially known, "keep searching until you've found the provable best" is
not the rigorous choice, it's the choice that ignores the cost of finding out. Satisficing — set an
aspiration level, take the first thing that clears it, stop — is what a resource-limited agent does
when it's reasoning *correctly* about its own limits, not a shortcut it takes when it can't be bothered
to reason properly.

**Where the aspiration level itself comes from, briefly:** it isn't fixed — Simon's own studies (and
later work on this) found people and organizations adjust their aspiration level based on how the
search is going: a string of disappointing options lowers it (a candidate that looked mediocre an hour
ago starts looking acceptable), a string of good ones raises it. The threshold in this puzzle (2 hours
of expected benefit, 10% chance) was handed to you as a given; in practice it's itself something an
agent estimates and revises as it searches, adding one more layer of bounded, imperfect reasoning on
top of the stopping rule itself.

**For your harness:** an agent looping "call one more tool, check one more source, generate one more
candidate" needs exactly this stopping rule — continuing only pays if the expected marginal
information or quality gain exceeds the cost of the next call, in tokens, latency, or dollars. An agent
with no such rule either stops too early (arbitrary turn limits) or never stops (optimizing against an
option space it can't fully see) — satisficing is the principled middle, not a compromise between them.

**Where this goes:** satisficing explains when agents *stop* searching. Next lesson turns to the
opposite failure — the shortcuts agents (human ones, specifically) take *while* searching, and one
that can make an option look more probable than a fact it's logically a subset of.
