---
title: "When the Closed Form Runs Out"
description: "Conjugacy depends on the prior's SHAPE matching a special family, not just on the likelihood being a nice one. Spot the case that breaks it."
lesson_number: 20
track: bayes
concept: "When conjugacy breaks and why that's fine (grid thinking preview)"
stage: 3
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [19]
skin: chalkboard
mcq:
  question: "Which of these four setups does NOT have a closed-form (conjugate) posterior update?"
  options:
    - "Prior Beta(2, 2) + likelihood: 12 Bernoulli trials (some successes, some failures)"
    - "Prior Normal(mean=0, variance=4) + likelihood: 5 normal measurements with known variance"
    - "Prior Beta(2, 2) + likelihood: 12 Bernoulli trials — but you drew your actual prior belief as a hand-sketched curve with two separate humps, and only approximated it as Beta(2,2) because that was convenient"
    - "Prior Beta(5, 1) + likelihood: 30 Bernoulli trials (some successes, some failures)"
  correct: 2
---

Lessons 15 and 19 gave you two conjugate pairs: **beta prior + binomial likelihood**, and **normal
prior + normal likelihood (known variance)**. Both let you skip integration entirely — you just
update a couple of parameters with arithmetic, and the posterior is guaranteed to land in the same
family you started in.

It's tempting to conclude "as long as the data is Bernoulli/binomial, I get a closed form." That's
not quite the rule. **Conjugacy is a property of the *pair* — a specific prior family matched to a
specific likelihood family — not a property of the likelihood alone.** If your actual prior belief
doesn't genuinely belong to the matching family (it just happens to have been *approximated* by one
for convenience), the guarantee doesn't transfer to what you actually believed.

**Four setups below.** In three of them, the prior you're using really is the distribution you
believe, and it's from the family that's conjugate to the likelihood — so the update is exact
arithmetic, closed form, done. In one of them, the "prior" being fed into the update is a
convenient stand-in for a belief that doesn't actually have that shape (it's bimodal — two separate
humps of plausibility, maybe because you think the true rate is either "low" or "high" but probably
not in between). Using the closed-form update on that one silently answers a slightly different
question than the one you actually meant to ask.

Which one is it?
