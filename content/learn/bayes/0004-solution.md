---
title: "Solution: When Multiplying Is Legal"
description: "Common causes break independence: correlated failures, correlated evidence, and the courtroom case that made the error infamous."
lesson_number: 4
track: bayes
concept: "Independence"
stage: 0
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
resources:
  - title: "Wikipedia — Sally Clark"
    url: https://en.wikipedia.org/wiki/Sally_Clark
    note: "the false-independence conviction discussed in the solution"
---

**B — the two drives.** Same model (shared manufacturing defects and firmware bugs), same
enclosure (shared vibration and temperature), same power rail (shared surges). These aren't two
independent 3% dice; they share **common causes**, and a common cause is exactly what makes
learning about one event move your belief about the other. When drive 1 dies, P(drive 2 dies this
year) is no longer 3% — the ambient temperature, the power event, or the bad firmware batch that
killed drive 1 is still right there. The honest calculation is the multiplication rule from last
lesson: P(both) = P(second | first) · P(first), and P(second | first) can be *ten times* the
marginal rate. Storage engineers learned this empirically: correlated drive failure is why RAID
arrays die during the rebuild, and why serious systems mix models, batches, and racks.

The other three are the textbook-legal cases: separate coins, separate dice, and a coin plus a
die genuinely share nothing — learning one outcome tells you nothing about the other.

**Why this error matters beyond hardware.** In 1999, Sally Clark was convicted of murdering her
two infant sons after an expert testified that two natural crib deaths in one family had
probability 1 in 73 million — computed as (1 in 8,543)². Squaring assumes the two deaths were
independent. But siblings share genetics and environment — precisely the common-cause structure of
the drives. Real family data shows a second crib death is far more likely than the marginal rate.
The conviction was eventually overturned; statisticians cite the case as the canonical
independence abuse. The same error, pointed the other way, is **double-counting evidence**: two
alerts from the same broken metric, two "independent" reviewers who read each other's comments,
two models trained on the same skewed data. Agreeing copies are not multiplying evidence.

**The pitfall in one line:** independence is an assumption you must *argue for* (what could the
common cause be? did the sources actually see different things?), never a default you fall back
on because the multiplication is easier.

**Where this goes:** near the top of this track sits the practice of compounding evidence —
combining two test results, two witnesses, two log lines. The condition that makes compounding
legitimate is a refinement called *conditional* independence, and you now have every concept it's
built from.
