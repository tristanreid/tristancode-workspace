---
title: "The Bedroom That Costs You Money"
description: "A linear regression says more bedrooms means a cheaper house. It's not lying — it's answering a narrower question than the one you asked."
lesson_number: 5
track: ml
concept: "Linear regression & coefficient interpretation"
stage: 1
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [1, 4]
skin: chalkboard
mcq:
  question: "What does the negative bedroom coefficient actually mean?"
  options:
    - "Adding a bedroom to a house causes its price to drop — more bedrooms are undesirable to buyers"
    - "Holding square footage fixed, a house divided into more bedrooms (so each room is smaller) tends to sell for less — bedroom count is a stand-in for room size once floor area is already accounted for"
    - "The model is broken — a correctly fit model could never assign bedrooms a negative coefficient"
    - "Bedrooms have zero real relationship to price; the coefficient is pure noise"
  correct: 1
---

Lesson 1 named linear regression's family: `f(x) = w₁x₁ + w₂x₂ + ... + b`, a weighted sum of the
features plus an intercept. Fitting it (lesson 1's "search" step, done here by minimizing squared
error) produces one **coefficient** per feature — a single number that's tempting to read as
"how much this feature matters." That reading is more dangerous than it looks.

A model predicts house price from two features: **square footage** and **number of bedrooms**.
Fit on real sales data, it comes back with:

> price ≈ 150 × sqft − 8,000 × bedrooms + 20,000

The bedroom coefficient is **negative**. Read naively, this says "each additional bedroom makes
the house cheaper" — which sounds backwards; everyone "knows" more bedrooms should raise price.
Nothing was miscoded and the fit isn't broken.

The key fact a linear regression coefficient reports is **narrower than "how much this feature
matters"**: it's *"holding every other feature in the model fixed, how much does the prediction
change per unit of this one."* Square footage is in the model too. Picture two houses of the
*exact same* 1,800 square feet — one built as a spacious 3-bedroom, one chopped into a cramped
5-bedroom. Which one is the pricier listing?

Given that picture, what does the negative bedroom coefficient actually mean?
