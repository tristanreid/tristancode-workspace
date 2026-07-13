---
title: "The Architecture That Refuses to Get Stuck"
description: "SOAR's answer to 'the agent doesn't know what to do next': stop, and make deciding itself the next problem to solve."
lesson_number: 11
track: cog
concept: "SOAR I: problem spaces, universal subgoaling, impasses"
stage: 2
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [3]
skin: chalkboard
mcq:
  question: "A SOAR agent has two operators that both apply to the current state, and its preference rules score them exactly equally — no basis to prefer one. What does the architecture do?"
  options:
    - "Pick one at random and continue, logging the tie for later review"
    - "Halt and raise an error, since production systems require a unique next action"
    - "Automatically create a subgoal, in a new problem space, whose job is to decide between the two operators"
    - "Apply both operators simultaneously and merge their effects"
  correct: 2
---

Lesson 3 introduced production systems: condition→action rules firing over working memory, with a
**conflict-resolution** step whenever more than one rule matches. SOAR (Newell's architecture,
built on that same production-system core) makes a specific, uncompromising commitment about what
happens when conflict-resolution *can't* resolve anything.

SOAR frames all cognition as **search through a problem space** — a state, a set of operators that
transform one state into another, and a goal test. Normal operation: the current state suggests
applicable operators, preference rules (themselves productions) rank them, the best one fires,
repeat. An **impasse** is what SOAR calls the moment that pipeline breaks — no operator applies, or
several apply and nothing in memory prefers one over the rest, or an operator's effects aren't yet
known.

SOAR's single governing move for *every* impasse, without exception, is called **universal
subgoaling**: automatically spin up a new subgoal, in a brand new problem space, whose entire
purpose is to resolve the impasse itself — "which operator is better" becomes its own problem to
search, with its own operators, its own working memory, its own possible impasses (which can
themselves trigger further subgoals, arbitrarily deep). There's no separate "get unstuck" module
bolted on; getting stuck and solving the stuck-ness are handled by the exact same problem-space
search machinery as everything else.

Given all of that: what does SOAR do when two operators tie?
