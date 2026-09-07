---
title: "Solution: Two Words, One Number: What Does Embedding Distance Actually Measure?"
description: "Embedding distance is a stand-in for whatever the training objective rewarded — co-purchase, shared vocabulary, or something else entirely — never a universal 'meaning' the space discovers on its own."
lesson_number: 22
track: ml
concept: "Things as vectors: what distance in embedding space means"
stage: 5
layout: solution
role: solution
builds_on: [18]
skin: chalkboard
resources:
  - title: "TensorFlow Embedding Projector"
    url: https://projector.tensorflow.org/
    note: "interactively explore real embedding spaces and see what clusters together, and why"
---

**Option 2.** There's no bug to find (option 1) — "semantically related" isn't one fixed thing, so
there's no single correct answer for both models to converge on. The two spaces also aren't measuring
opposite quantities (option 3) — both are ordinary distance-as-similarity spaces, just shaped by
different data. And neither objective is inherently "more correct" than the other (option 4) — they
answer different, both-legitimate questions.

**What actually happened.** Every embedding model is trained to make some specific relationship show
up as spatial closeness — that relationship is defined by the training data and loss, not discovered
from thin air. Model A's objective rewards it for placing items close together when they *co-occur in
orders*. Charcoal and lighter fluid are bought together on a huge fraction of grilling-related orders —
so co-purchase-similarity pulls them close, correctly, by that model's definition of similar. Model B's
objective rewards it for placing items close together when their *descriptions use similar words*.
"Bag of hardwood lump charcoal for grilling" and "petroleum-based fire starter fluid" share almost no
vocabulary — different product category, different adjectives, different use-case language — so
description-similarity correctly pushes them apart. Both models did exactly what they were trained to
do; they were just trained to do different things.

**The general lesson.** "Embedding space" is not a single canonical map of meaning that different
models approximate more or less well. It's a *learned projection* shaped by whatever signal supervised
it: co-occurrence, click-through, description text, translation pairs, contrastive pairs a human
labeled as "same" or "different." Before trusting distance in *any* embedding space as "similarity,"
the load-bearing question is: similar according to *what signal*? A recommendation embedding trained
on co-purchase will happily put a phone and a phone case close together (bought together constantly)
even though a description-based embedding would place them nowhere near each other (different objects
entirely). Neither is wrong; they're answering different questions, and picking the wrong one for your
use case is a live source of production bugs, not a hypothetical one — a search feature built on a
co-purchase embedding will return `phone case` when someone searches `phone`, which is a co-purchase
answer to a description-similarity question.

**Where this goes:** now that "close" has a precise, objective-dependent meaning, the next lesson asks
what goes wrong when you *use* that closeness naively — nearest-neighbor search has its own traps
(scale, hubness, embeddings that go stale as the underlying model or data drifts) even once you've
picked the right embedding for the job.
