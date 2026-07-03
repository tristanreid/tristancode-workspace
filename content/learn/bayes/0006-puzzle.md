---
title: "Bayes from Both Directions"
description: "Derive Bayes' theorem from the two factorizations of a joint probability, then use it on a spam filter."
lesson_number: 6
track: bayes
concept: "Bayes' theorem"
stage: 1
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: [2, 3]
skin: chalkboard
numeric:
  question: "P(spam | mentions crypto), as a decimal."
  answer: 0.857
  tolerance: 0.01
---

Time to cash the check lesson 3 wrote. A joint probability factors two ways — that's not a trick,
it's just the multiplication rule (P(A and B) = P(A | B) · P(B), where P(A | B) is the probability
of A *within the world where* B holds) applied in each direction:

    P(A and B) = P(A | B) · P(B) = P(B | A) · P(A)

Set the two right-hand sides equal, divide by P(B), and you have **Bayes' theorem**:

    P(A | B) = P(B | A) · P(A) / P(B)

Its whole job is **reversing a conditional**: you know how often evidence shows up *given* a
hypothesis, and you want how plausible the hypothesis is *given* the evidence. Those point in
opposite directions (lesson 2 showed they can differ wildly), and this is the exchange rate.

Put it to work. Your mail corpus:

- **40%** of incoming mail is spam: P(spam) = 0.4.
- **90%** of spam mentions crypto: P(crypto | spam) = 0.9.
- **10%** of legitimate mail mentions crypto: P(crypto | ham) = 0.1.

A new message mentions crypto. **Compute P(spam | crypto).**

You'll need P(crypto), the overall rate of crypto-mentions — it isn't given directly, but the
crypto mentions have to come from *somewhere*: some from the spam pile, some from the ham pile.
Add up both contributions (using the multiplication rule on each) and you have your denominator.

If the algebra feels slippery, do it with a concrete population instead: imagine exactly 1,000
messages and count how many are spam-with-crypto, ham-with-crypto — then ask what fraction of the
crypto-mentioners are spam.
