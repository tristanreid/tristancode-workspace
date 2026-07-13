---
title: "The Answer Sheet That Must Sum to One"
description: "A probability mass function is just a plausibility number attached to every possible value — and those numbers are on a tight leash."
lesson_number: 12
track: bayes
concept: "Distributions as answer sheets (pmf)"
stage: 2
layout: puzzle
role: puzzle
answer_type: numeric
builds_on: []
skin: chalkboard
numeric:
  question: "P(3), the missing plausibility for face 3?"
  answer: 0.4
  tolerance: 0.01
---

Every lesson so far asked about *one* hypothesis at a time: disease or not, guilty or not. A
**probability mass function (pmf)** does something bigger: it's an answer sheet that assigns a
plausibility number to *every* possible value of some discrete quantity at once — not "is it 10%?"
but "here's how plausible every rate from 0% to 100% is, all at once, on one sheet."

The one hard constraint on that answer sheet: the numbers must be non-negative, and **they must
sum to exactly 1**. That's not a formula to memorize — it's just what "plausibility distributed
across every possibility" means. If you're 100% sure the true value is *somewhere* on your list of
possibilities, the total plausibility across the whole list can't be more or less than "certain."

A four-sided die (faces 1–4) you suspect is weighted gets tossed many times. From the data, you
estimate this pmf:

| face | plausibility |
|---|---|
| 1 | 0.1 |
| 2 | 0.3 |
| 3 | ? |
| 4 | 0.2 |

What must P(3) be, given the pmf has to sum to 1 across all four faces?
