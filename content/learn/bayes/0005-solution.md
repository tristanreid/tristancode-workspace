---
title: "Solution: The Information in the Telling"
description: "1/3 for the question, 1/2 for the park — same fact, different procedure, different posterior."
lesson_number: 5
track: bayes
concept: "Conditioning on how you learned it"
stage: 0
layout: solution
role: solution
builds_on: [2]
skin: chalkboard
resources:
  - title: "Wikipedia — Boy or girl paradox"
    url: https://en.wikipedia.org/wiki/Boy_or_girl_paradox
    note: "the full ambiguity taxonomy, including the famous 'boy born on a Tuesday' variant"
  - title: "Wikipedia — Monty Hall problem"
    url: https://en.wikipedia.org/wiki/Monty_Hall_problem
    note: "the same lesson wearing a game-show costume"
---

**1/3.**

The mechanical conditioning from lesson 2, applied exactly: "at least one girl" rules out only BB.
Three equally likely worlds survive — GG, GB, BG — and both-girls is one of them:

    P(GG | at least one girl) = (1/4) / (3/4) = 1/3

The seductive-but-wrong shortcut ("one's a girl, so the other is 50/50") fails because "the other
one" isn't a well-defined child. Your question didn't point at a specific kid; GB and BG are two
distinct ways to have one girl, and together they outweigh GG two-to-one.

**But the park scenario is 1/2 — and that's the real lesson.** At the park you didn't learn the
proposition "at least one is a girl" through a yes/no question about the family. You *sampled a
child* and observed her to be a girl. Enumerate the equally likely (family, child-you-met)
outcomes: GG×2, GB, BG produce a daughter-sighting in 4 equally likely ways, and 2 of those 4 come
from GG families. P(GG | met a daughter) = 1/2. The GG family is twice as likely to *show you* a
daughter, and that difference in the generating procedure carries real information.

Compare the two scenarios: the surviving *fact* is identical — this family has at least one girl.
The **procedure** that delivered the fact differs, so the probabilities differ. The general
principle:

> You don't condition on the fact you learned. You condition on the *event that you learned it,
> the way you learned it*.

This is Monty Hall in disguise (the host *opening a door he knows is empty* is a different
procedure from a door falling open at random, and that's the entire puzzle). It's also a working
data scientist's daily hazard, wearing different clothes: the customers who answered your survey,
the errors that got reported, the incidents that made it into the postmortem doc — each arrived
through a selection procedure, and ignoring that procedure (conditioning on the fact instead of
on the telling) is how selection bias sneaks past people who know how to compute conditionals.

**The pitfall, distilled:** when someone hands you information, ask "out of all the worlds, in
which ones would I have received *exactly this message*?" — not "in which ones is this message
true?"

**Where this goes:** you've now conditioned your way through everything stage 0 owes you. Next:
the two factorizations from lesson 3 snap together into Bayes' theorem, and the updating loop
this track is named for begins.
