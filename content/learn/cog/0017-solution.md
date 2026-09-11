---
title: "Solution: Why This Path Won't Let You Do 20 Lessons on One Topic in a Row"
description: "A review 1 hour later is still recognition in disguise; a review after real decay is a genuine reconstruction — which is why a spacing schedule should wait until the earlier trace has actually weakened, not just elapsed some arbitrary clock time."
lesson_number: 17
track: cog
concept: "Spacing & interleaving (the science this whole puzzle system is built on)"
stage: 4
layout: solution
role: solution
builds_on: [15, 16]
skin: chalkboard
resources:
  - title: "Cepeda et al. (2006) — 'Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis'"
    url: https://pubmed.ncbi.nlm.nih.gov/16719566/
    note: "a large meta-analysis of the spacing effect across decades of studies"
  - title: "Rohrer & Taylor (2007) — interleaved vs. blocked math practice"
    url: https://link.springer.com/article/10.1007/s11251-007-9015-8
    note: "the classic study demonstrating interleaving's long-term advantage despite worse in-practice performance"
---

**Retrieval check answer.** The **algorithmic** level is held fixed (same search algorithm, minimax
with alpha-beta pruning); the **implementational** level varies (phone hardware vs. a data-center
cluster). Marr's whole point: one algorithm can run on many substrates, so a claim about which
algorithm is used says nothing about, and is unconstrained by, which hardware it happens to run on.

---

### Why Schedule 2 is the more valuable review

Right after learning something, activation is still high — the trace hasn't decayed much (in lesson
15's terms, t is small, so t^(−d) is close to its maximum). Reviewing it **1 hour later** hits the
fact while it's still almost fully active: the "retrieval" barely has to reconstruct anything, because
the trace never really left. That's functionally closer to lesson 16's **recognition** — a cheap
lookup of something still sitting near the surface — even though nothing is literally on screen. It
adds a use-event, technically, but a shallow one.

Reviewing **3 days later** hits the fact after real decay has set in: the trace has weakened enough
that reconstructing it takes genuine effort, closer to lesson 16's **recall**. That's the kind of use
lesson 16 argued does the real work of strengthening a retrieval pathway, not just re-exposing content.

**The design rule this implies:** a review only earns its full value as a use-event if it happens
*after* the previous trace has decayed enough that retrieving it again requires real reconstruction —
not merely "after some fixed clock interval." Reviewing too soon (Schedule 1) wastes the review on a
trace that hasn't forgotten anything yet; reviewing far too late risks outright retrieval failure
(activation has dropped so low the attempt fails rather than succeeds, which teaches nothing and can
be discouraging). The right target is the region in between: spaced *just* far enough that recall
requires genuine effort and typically still succeeds — which is why effective spacing schedules
lengthen the gap between reviews over time (each successful review resets the clock on a now-stronger,
slower-decaying trace, so the next gap that produces "genuine effort, likely success" is longer than
the last).

---

### Interleaving, briefly

The same "genuine effort beats easy fluency" logic drives interleaving. Practicing several related
skills mixed together (rather than one skill in an isolated block) is harder in the moment specifically
because you can't coast on "I already know which technique applies here, since I've been doing this
one for the last ten problems" — you have to actually retrieve *which* technique fits *this* problem,
every time. That's an extra retrieval demand blocked practice never imposes, and it's exactly the skill
(identifying which technique a novel, unlabeled problem calls for) that later transfers to real,
un-labeled problems.

**This path's own design, mapped:** the routine's buffer policy — keeping only a small number of
unsolved lessons ahead of you, delivered over real days rather than dumped at once — is a spacing
mechanism, aimed at the region between "too soon" and "too late" this lesson just derived. Interleaving
four tracks (fp, bayes, cog, ml) in the same sitting, rather than finishing one track's full spine
first, is the domain-level version of Rohrer & Taylor's mixed problem sets: it forces you to retrieve
*which* domain's thinking a given puzzle calls for, not just execute a technique you were already
told to use.

**Where this goes:** back to blackboard architecture, sharpened by one changed requirement — the same
"one factor decides everything" move this lesson just made for spacing, applied to when a pipeline
stops being adequate.
