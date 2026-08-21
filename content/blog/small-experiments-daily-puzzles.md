---
title: "Growing a Daily Puzzle Curriculum (with an AI on a Monday-Morning Cron)"
description: "The theory and machinery behind tristancode.com/learn — why puzzles beat articles, how a calibration question works, and the contract that lets an AI extend a curriculum unattended."
weight: 10
series: "Small Experiments"
series_weight: 300
skin: generative
---

This is an experiment that's still running: a self-paced path of tiny daily
puzzles at [tristancode.com/learn](/learn/), which an AI routine extends
every Monday morning, staying a fixed distance ahead of wherever I actually
am. As I write this there are 86 puzzles live
across four tracks, and I didn't write them — I wrote the *curriculum*, the
*rules*, and the *feedback*, and Claude Code writes the lessons.

Two things make this worth a post: the learning-theory choices (why puzzles,
why these answer formats, why these topics), and the engineering contract
that makes unattended AI generation something other than a content firehose.

![The landing page: one resume card per track](/small_experiments/img/learn_landing.png)

---

## Why puzzles, not articles

The format rule for the whole site is: **you attempt before you see.** Every
lesson leads with a puzzle; the solution is a separate page you visit after
committing to an answer.

That's not a style preference — it's the most robust result in the learning
literature. The *testing effect*: retrieving (or even just attempting) an
answer strengthens memory far more than re-reading an explanation, and the
attempt helps even when it fails, because it primes you for the correction.
An article invites you to nod along; a puzzle makes you discover what you
actually believe first, so the explanation lands on a live question instead
of a blank slate.

The answer formats form a ladder, each rung demanding a stronger commitment
before the reveal:

- **Reveal** — think, then flip. The weakest commitment, for questions where
  the thinking is the point.
- **Multiple choice** — commit to one of several plausible wrongs.
- **Numeric** — type an actual number, checked with a tolerance (with the
  solution unlocking after three misses, so a stuck puzzle can't dead-end).
- **Estimate** — the interesting one. It deserves its own section.

## Calibration: the estimate puzzle

An estimate puzzle asks for two things: your best single guess, and a **90%
interval** — a low and high bound you believe has a 90% chance of containing
the true value.

![An estimate puzzle from the Bayesian track: the bet a 90% interval makes](/small_experiments/img/learn_estimate.png)

The interval is not a hedge. It's a specific, checkable promise: if you're
well-calibrated, the truth should escape your 90% intervals about one time in
ten — *no more and no less*. Miss constantly and you're overconfident (the
single most common human failure). Never miss and your intervals are useless
caution — "between 0 and 100%" is always right and carries no information.

Every estimate answer gets logged, so the site accumulates a record of my hit
rate against my stated intervals over months. That long-run log — not any
single answer — is the real product. You're not just learning what's true
about the world; you're learning the transfer skill underneath every forecast
and every project plan: how much to trust your own confidence.

## The four tracks, and why these

Topics weren't picked to be a syllabus; each track exists because of a
specific itch. Tracks are cheap to add — a curriculum file and a one-line
registry entry — so the system follows curiosity:

- **Functional & parallel thinking** (the original) — pure functions,
  recursion, folds, algebraic data types, and the map/reduce/scan reasoning
  that lets a runtime spread work across cores without you writing a lock.
  Honest origin story: this started as an on-ramp to the
  [Bend](https://github.com/HigherOrderCO/Bend) language, and partway in I
  realized the language was scaffolding — the *concepts* were the
  destination. The track got deliberately de-anchored, and I think it's
  better for it. Curricula, like trip routes, deserve re-planning.
- **Bayesian statistics** — probability as plausibility: conditioning,
  priors and posteriors, and the calibration training above. This is
  thinking-tool maintenance; it decays without reps.
- **Cognitive science & AI architectures** — the personal one. I'd built an
  agent harness inspired by blackboard systems and wanted the intellectual
  lineage under my feet: production systems, Hearsay-II, ACT-R and SOAR,
  subsumption, Society of Mind — arriving at modern agent harnesses knowing
  which sixty-year-old ideas they're re-discovering.
- **Machine learning** — deliberately sequenced with *evaluation before
  neural nets*: baselines, leakage, metrics, and how to tell whether a model
  is any good, before any architecture worship.

## The buffer: generation throttled by progress

The scheduling rule that makes the whole thing sane: the routine keeps
exactly **eight unsolved lessons ahead** of my last-completed marker in each
active track. Never more.

Small rule, three jobs. It means generation is *demand-pulled by actual
learning* — if I stop solving, the queue stops growing, instead of piling up
into a guilt mountain (every abandoned RSS reader knows this failure mode).
It caps cost and review burden. And it keeps the generator working close to
the frontier of what I've seen, where my feedback about quality is freshest.
The Monday-morning routine's whole job is: read each track's marker, count
unsolved lessons ahead, top up to eight, publish.

## Letting an AI write lessons unattended

The generator is a scheduled Claude Code task. The interesting design isn't
the generation — it's the *contract* that keeps weekly unattended output
coherent:

- **Curriculum as source of truth.** A public repo
  ([tristanreid/daily-learning-puzzles](https://github.com/tristanreid/daily-learning-puzzles))
  holds per-track curricula, the generation prompt, and a feedback file. The
  routine re-reads all three every run — so when I correct course ("less
  jargon," "that lesson assumed notation I never introduced"), the
  correction is written down once and applies to every future lesson, not
  just the next one. The AI has no memory between Mondays; the repo *is* the
  memory.
- **Config, never code.** Lessons are markdown with front matter; the answer
  types are driven entirely by front-matter fields. The generator is not
  allowed to write JavaScript. Interactive machinery gets built by hand, in
  sessions where I'm paying attention; the weekly routine can only fill in
  vetted shapes. This one rule removes the scariest failure modes of
  auto-published content.
- **Boring, inspectable infrastructure.** The site is static Hugo; progress
  sync is one small serverless function writing `{lastCompleted, events}` to
  a blob store, keyed by an anonymous token in the URL — no accounts, no
  logins, and a progress record I can read with curl.

One war story from the seam between those pieces: after a big restructure,
the site served new HTML against a *ten-day-cached* copy of the old
JavaScript, and every lesson page hung on "Loading your spot…". Nothing was
wrong with the generated content — the deploy pipeline had outrun the cache
policy. When an AI ships while you sleep, the boring web fundamentals
(cache-busting, versioned assets) stop being optional hygiene and become the
safety rail.

## The feedback loop, and what's next

Completing a lesson isn't a checkbox — it's a one-tap difficulty rating:
*easy / good / hard / fail*. Combined with the estimate logs, the site is
quietly accumulating outcome data about me: which concepts I rate hard,
where my calibration drifts, what I fail.

That's the open frontier. The designed-but-unfinished half feeds those
signals back into generation: per-concept weakness maps, spaced review of
what I got wrong, probes at the boundary of what I've mastered. The honest
summary of where this experiment stands: the *generation* loop is closed and
has run for months; the *adaptation* loop is still mostly a design document.

Which suggests the real takeaway. The interesting artifact here isn't an AI
that writes puzzles — that part is almost easy now. It's the contract around
it: a curriculum it must follow, a buffer that throttles it, ratings that
inform it, and a config-not-code boundary that limits it. Same lesson as the
[canoe maps](/blog/small-experiments-canoe-trip-maps/), one scale up: the
human contribution isn't the artifact, it's the specification — and here,
the specification is a living thing the AI and I maintain together, one
Monday at a time.
