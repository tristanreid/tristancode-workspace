---
title: "Solution: Experts Around a Blackboard"
description: "Uncertainty flows both ways: why bidirectional inference forced the blackboard, and what the design buys any system of cooperating specialists."
lesson_number: 4
track: cog
concept: "Blackboard architecture"
stage: 1
layout: solution
role: solution
builds_on: [3]
skin: chalkboard
resources:
  - title: "Nii (1986) — Blackboard Systems, Part One (AI Magazine)"
    url: https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/537
    note: "the canonical survey; part two covers applications"
  - title: "Erman, Hayes-Roth, Lesser & Reddy (1980) — The Hearsay-II Speech-Understanding System (ACM Computing Surveys)"
    url: https://dl.acm.org/doi/10.1145/356810.356816
    note: "the full system paper — worth reading with your agent harness open in another window"
---

**Errors and ambiguity at every level, so certainty has to flow both ways.** In clean problems, a
pipeline is fine: each stage resolves its layer and hands up a *fact*. In speech, no stage can
resolve its own layer alone. The acoustics genuinely cannot decide between "seven" and "Devon" —
but the grammar knows a digit is likely here, and that *top-down* knowledge is exactly what the
*bottom-up* stage needed. A pipeline structurally forbids that conversation: by the time the
parser exists, the phoneme decision is frozen. Low-confidence guesses compound stage over stage,
and the final output is built on the rubble. (The other options are real 1970s engineering pains,
but none of them is *architectural* — a faster, bigger machine fixes them and still can't send
grammatical knowledge downward.)

The blackboard's answer is **bidirectional inference through a shared hypothesis space**: a
strong word hypothesis raises the plausibility of the phonemes that would compose it, exactly as
strong phonetics raises candidate words. Hearsay-II's signature tactic was the **island of
certainty**: find the stretch where *some* level is confident — anywhere in the utterance, any
level of abstraction — and grow outward from it, letting each secured hypothesis constrain its
noisy neighbors. Understanding spreads from strongholds instead of marching left-to-right.
(Notice the human echo, deliberately: you do this when parsing a bad phone connection — catch
"…meeting…" and "…Thursday…" and reconstruct the sentence from its islands. Blackboard theory
began as a model of perception.)

What the design buys, beyond speech:

- **Radical modularity.** KSs share only the board's hypothesis format. Add a new expert —
  Hearsay-II gained and shed KSs throughout its life — without touching the others. It's lesson
  3's rule-modularity, promoted from rules to subsystems.
- **Anytime behavior.** The board always holds a current best interpretation with confidences;
  stop early and you get a usable partial answer, not a stack trace.
- **Graceful degradation.** A weak KS costs quality, not collapse — others route around it.

**The cost, honestly:** the intelligence doesn't disappear, it moves into **control** — deciding
*which* KS acts next, when hundreds could. Lesson 3's moral (arbitration *is* behavior) returns
at full scale, and it's the next lesson's entire subject.

**For your harness:** the correspondence is direct — shared scratchpad/context = blackboard;
tools and sub-agents = KSs; orchestrator = control. The two ideas most worth stealing are islands
of certainty (let confidence, not sequence, drive the plan — start where the task is most
tractable and let results constrain the rest) and hypotheses-with-support-links instead of bare
facts on the board, so conclusions can be re-rated when their support erodes. When a fixed
tool-chain keeps building confidently on step 2's shaky output, you are re-living 1974; that is
pipeline rubble, and this lesson is the fix.

**Where this goes:** inside the machine — hypothesis levels, the scheduler and its agenda, and
how BB1 put control knowledge *itself* on a blackboard.
