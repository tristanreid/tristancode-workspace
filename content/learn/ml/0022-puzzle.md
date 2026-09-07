---
title: "Two Words, One Number: What Does Embedding Distance Actually Measure?"
description: "An embedding turns a thing into a vector, and distance between vectors becomes a stand-in for similarity. Similarity according to what? The puzzle is in the training objective, not the geometry."
lesson_number: 22
track: ml
concept: "Things as vectors: what distance in embedding space means"
stage: 5
layout: puzzle
role: puzzle
answer_type: mcq
builds_on: [18]
skin: chalkboard
mcq:
  question: "You train an embedding model two different ways on the same catalog of products. Model A learns from co-purchase data (which products get bought together in the same order). Model B learns from product descriptions (which products get described with similar words). In Model A's embedding space, 'charcoal' and 'lighter fluid' end up very close together. In Model B's space, they end up far apart. Both models are working correctly. Why?"
  options:
    - "One of the two models must have a bug — semantically related products should always end up close together in any well-trained embedding space"
    - "Embedding distance measures whatever the training objective actually rewarded being close, not some universal notion of 'meaning'; charcoal and lighter fluid are bought together constantly (co-purchase-close) but described in almost entirely different words — grilling fuel vs. a flammable liquid (description-far), so each model correctly captured a different relationship"
    - "Model A is measuring similarity and Model B is measuring dissimilarity, so their distances aren't comparable at all"
    - "Co-purchase data is strictly more informative than text descriptions, so Model A's placement is the more correct one"
  correct: 1
---

Lesson 18 showed that a network is a composed function that maps inputs to outputs. An **embedding**
is a particular, very useful kind of output: instead of a class label or a number, the network maps
each item — a word, a product, an image, a user — to a point in a high-dimensional vector space (say,
128 or 768 numbers). Two items that end up as nearby points are called "similar" in that space, and
that single move — turning things into points so you can measure distance between them — underlies
recommendation systems, search, clustering, and most of what "semantic search" means in practice.

The trap is treating "close in embedding space" as if it meant "similar" in some single, objective,
universal sense. It doesn't. An embedding space is *shaped entirely by what the training objective
rewarded*. Train a model to predict which products get bought in the same order, and it will place
products close together exactly when they tend to co-occur in orders — regardless of whether they
"mean" anything alike. Train a different model to predict which products share similar text
descriptions, and closeness now tracks vocabulary overlap in the copy — regardless of purchase
behavior.

**The scenario:** a retailer trains Model A on co-purchase data and Model B on product-description
text, over the same catalog. In Model A's space, "charcoal" and "lighter fluid" land close together.
In Model B's space, they land far apart. Neither model is broken.

**Your task:** pick the explanation that correctly accounts for both placements being right.
