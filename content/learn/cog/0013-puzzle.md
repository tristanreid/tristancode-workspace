---
title: "Where the Architectures Actually Get Checked"
description: "ACT-R and SOAR aren't just design philosophies — they make numerical predictions about human timing and errors. How well do those predictions hold up?"
lesson_number: 13
track: cog
concept: "What these architectures predict about humans, and how well"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [10, 12]
skin: chalkboard
mcq:
  question: "Which is the most accurate, well-documented limitation of cognitive architectures like ACT-R and SOAR, as predictors of human behavior?"
  options:
    - "They fail to predict reaction times for any well-practiced, well-structured task"
    - "They predict well-structured, well-practiced task performance (timing, error rates, learning curves) fairly precisely, but have a much harder time predicting genuinely novel insight or creative restructuring of a problem"
    - "They only apply to physical, motor tasks and say nothing about mental arithmetic or memory retrieval"
    - "They were empirically abandoned decades ago and make no verified predictions that have held up"
  correct: 1
---

Lessons 10–12 built up two architectures' internal machinery in detail — activation formulas,
subgoaling, chunking. It's fair to ask: do these produce anything you can actually check against a
real human sitting at a keyboard, not just an elegant story?

They do, and this is where cognitive architectures earn their keep as *science* rather than
software design philosophy. ACT-R in particular has a long track record of fitting **quantitative**
human data: reaction times in the low hundreds of milliseconds for simple retrievals, the shape of
the **power law of practice** (performance improving fast at first, then ever more slowly — a
prediction that falls directly out of the base-level activation math from lesson 10, not bolted on
separately), and error rates in tasks like mental arithmetic or menu search, fit closely enough to
be used in real human-computer-interaction design work (predicting how long a new UI layout will
take users to learn, before it's ever built). SOAR has matched timing and behavior in complex,
well-structured task domains too — the classic case is fitting expert behavior in domains like
airspace management and simulated piloting.

Where both architectures are consistently weaker: moments of genuine **insight** — restructuring a
problem itself rather than searching harder within a fixed problem space or retrieving a stronger
memory (the classic psychology example is the "aha" moment in insight puzzles, where the *shape* of
the solution space suddenly changes rather than search within it succeeding). Both architectures are
fundamentally built around searching or retrieving *within* a space of operators/chunks that's
already defined — modeling the moment a person invents a wholly new way to see the problem is a much
harder fit for either.

Given that track record: which statement best describes their real, documented limitation?
