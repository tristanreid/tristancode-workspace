---
title: "Solution: The Amnesiac Who Learned to Juggle and Never Knew It"
description: "H.M. improved every day and remembered none of it — a clean dissociation between procedural and declarative memory that proves they're separate systems, not one system with a volume knob."
lesson_number: 17
track: cog
concept: "Long-term memory systems: episodic vs semantic vs procedural"
stage: 3
layout: solution
role: solution
builds_on: [10, 16]
skin: chalkboard
resources:
  - title: "Scoville & Milner (1957) — the original H.M. case report"
    url: https://jnnp.bmj.com/content/20/1/11
    note: "the foundational paper establishing the hippocampus's role in new declarative memory formation"
---

### MCQ answer: (1) — improved daily, remembered none of it

H.M.'s tracing speed and accuracy improved measurably day after day — a completely normal
procedural learning curve. Yet each day, he reported no memory of ever having done the task before,
often expressing surprise at how well he performed on something he insisted was novel. This is the
single most famous demonstration in memory research that skill learning (procedural memory) and
event memory (episodic memory) are **dissociable** — genuinely separate systems, not one memory
faculty operating at different strengths. Option (0) describes what you'd predict if memory really
were one unified system that his damage weakened globally; it's exactly what didn't happen. Option
(2) describes ordinary, non-dissociated learning — not what was observed. Option (3) is simply false
— mirror-tracing is a well-established procedural learning task specifically because performance
improves with practice via a memory mechanism, just not a declarative one.

---

### Part 2 — Why the *pattern* is the strong evidence

A uniformly mild deficit across all memory types is exactly what you'd expect from "memory is a
single resource, and this damage weakened it somewhat" — consistent with one system, just running
worse. What H.M. showed instead is a **double-dissociable pattern**: one capacity (procedural
learning) performing at essentially full, healthy strength, while another (new episodic memory)
performed at essentially zero — with no continuum of "medium impairment" in between. That specific
combination — one system spared, the other devastated, by the *same* focal brain damage — is much
harder to explain under a single-unified-memory account than under an account where procedural and
declarative memory depend on different, at least partially separable, neural substrates (the
hippocampus being critical for forming new declarative memories, but not required for procedural
learning, which appears to route through different structures, notably the basal ganglia and
cerebellum). A single damaged region taking out one whole system while leaving another fully intact
is close to the strongest kind of evidence neuropsychology can offer for separateness.

---

### Part 3 — A predicted second dissociation: episodic vs. semantic

Yes — this dissociation has in fact been observed in other real cases (distinct from H.M.
specifically). A plausible real-world pattern: a patient with more selective, milder hippocampal
damage (as opposed to H.M.'s extensive removal) who cannot reliably form new episodic memories —
they can't tell you what they did yesterday, or recall the specific occasion they learned something
— but who *can* still slowly acquire new semantic facts over repeated exposure, ending up "knowing"
a new fact (e.g., a new person's job title, repeated across many encounters) without being able to
recall any specific instance of learning it. This is source amnesia taken to its logical extreme:
retaining the fact while permanently losing the episodic "when/where I learned this" tag. (The
developmental case of patients with early, selective hippocampal damage acquiring largely normal
semantic/school knowledge despite profound episodic memory deficits — reported by researchers
including Faraneh Vargha-Khadem — is a real-world instance of close to this pattern.) This fits the
general logic of Part 2: if procedural/declarative can dissociate via H.M.'s damage, and
episodic/semantic are meaningfully distinct systems rather than the same thing at different
grain-sizes, a different lesion profile predicts they should be separately impairable too — and
evidence broadly bears that prediction out, though less starkly clean than the H.M. case.

---

### Part 4 — Dissociation in an agent harness

Take the **episodic (context window) vs. semantic (trained-in weights) pair**. A concrete
dissociation: end a conversation (the context window is cleared) — everything episodic about *this
specific interaction* (what the user just said, what was tried and failed, the specific back-and-
forth) is gone, completely and immediately, the harness equivalent of H.M.'s inability to retain new
episodic content. Yet the model's general knowledge — facts, language ability, learned behavioral
patterns baked in during training — persists completely unaffected across that same reset, the
harness equivalent of intact semantic and procedural memory. This is in fact the *default*,
unremarkable behavior of most LLM systems without a persistent memory feature — every new
conversation starts in a state analogous to H.M.'s: full general competence, zero memory of prior
specific episodes. Systems that add a persistent "memory" feature (like this very memory system
being used to author these lessons) are explicitly engineering a workaround for exactly this
default dissociation — building an artificial episodic store precisely because the base system, by
default, has none.

---

### The pattern

| System | What it stores | H.M.'s status | ACT-R analogue |
|---|---|---|---|
| Episodic | specific events (what/when/where) | severely impaired (new) | declarative chunks |
| Semantic | general facts/concepts | impaired for new learning | declarative chunks |
| Procedural | skills, how-to | **intact**, normal learning curve | production rules |

**Rule**: long-term memory is not one system with a single dial — episodic, semantic, and procedural
memory are dissociable, meaning focal damage can devastate one while leaving another fully intact.
The declarative/procedural split maps directly onto ACT-R's chunks-vs-productions architecture from
Stage 2, giving this psychological finding a concrete computational counterpart.

**Where this goes:** Stage 3 closes here, having covered attention's gate (Lesson 16) and what
happens once things get through it into durable storage. Stage 4 turns to what happens with heavy,
repeated *use* of stored knowledge — the power law of practice, and how expertise itself is built.
