# Revised Season 1 Plan (2026-08-24)

**Status:** editorial revision after reconciling the original proposal against the
live site. Supersedes the Season 1 list in `01_SERIES_STRATEGY.md` and demotes
Seasons 2–3. Written with Tristan; reflects his three concerns: redundancy,
discovery, and avoiding generic posts that don't carry his POV.

## The filter applied

One test per brief: **could a competent tech writer with no access to Tristan's
history write this post?** If yes, it was cut or demoted to a supporting section.
The differentiator for everything that remains is accumulated systems judgment:
evolution narratives, reversals, and decisions with consequences.

## Redundancy findings (why Seasons 2–3 are demoted)

The site already covers much of the proposed foundational material, in POV-rich
form:

| Proposed topic | Already covered by (live series) |
|---|---|
| Autocomplete, spell correction, multi-pattern matching | *Tries: Multi-Pattern Text Search* (6 posts) |
| Entity matching, scoring, broadcast pattern | *Entity Detection* (4 posts) |
| Sketches, approximate aggregation, OLAP projections | *HyperLogLog* (4) + *Mergeable Operations* (4) |
| Pipeline monitoring, batch→stream, DSLs, reporting layers | *Hulu Data Platform* (9) |
| Embeddings foundations | *Exploring High-Dimensional Data* (7) |

**Rule going forward:** new search posts *link* to these series as prerequisites
instead of re-teaching them. This converts the redundancy problem into the
discovery solution — the new posts become the front door to the archive.

Surviving fragments of Seasons 2–3 (BM25 from first principles, distributed
top-k) become individual posts or sections, only if a Season 1 post creates
demand for them.

## Season 1: eight posts

Ordering alternates essays (which travel/get shared) with practical posts
(which get googled). Each entry lists the POV hook — the thing only Tristan can
write — and its links into existing series.

### 1. The Search Index Is Not the Source of Truth *(architectural essay — the anchor)*
- **Thesis:** interactive systems are purpose-built projections of underlying
  truth; relational, OLAP, inverted-index, graph, and vector representations
  each precompute a different kind of answer. Absorbs the useful core of the
  cut "Search Is Not Lookup" post.
- **POV hook:** the career arc itself — the same worldview connecting
  warehouse → Hadoop/Spark → Druid → Elasticsearch → vectors. Personal, not
  textbook.
- **Links to:** Mergeable Ops (projections you can merge), Hulu platform
  (reporting layer as projection), HLL (sketch as lossy projection).
- **Discovery role:** the shareable front-door essay; every later post links
  back to it.

### 2. Zero-Downtime Rebuilds with Versioned Indexes and Aliases *(practical)*
- **POV hook:** distilled from an internal library actually used across many
  index types; the lifecycle (ingest settings → restore settings → atomic alias
  move → rollback index retention) encodes real operational scars.
- **Netflix:** RESOLVED 2026-08-24 — cleared to name (mention involves no
  specific people/projects and implies no company position).
- **Scale:** RESOLVED 2026-08-24 — numbers unknown; omit adoption/size claims
  entirely. Describe the library's *design*, not its reach.
- **Title styled for search intent** — this is the post stuck engineers google.

### 3. A URL Is a Locator, Not an Identity *(practical, corpus identity)*
- **POV hook:** canonicalization war stories — redirects, tracking params,
  mirrors, short-links; identity as *policy*, not string equality.
- **Links to:** Entity Detection series (identity for entities vs documents).

### 4. Freshness, Failure, and the Document You Serve *(practical, policy)*
- **POV hook:** the documented reversal — first serving the last successful
  read after a failure, later intentionally excluding a document whose latest
  read failed. Policy-and-trust lesson no generic writer has.

### 5. ~~Entity Resolution Without an LLM~~ → **Embeddings Don't Know Which Rock You Mean**
- **REPLACED 2026-08-24.** The original scope is *already published* on the
  site and would have been near-duplicate. `entity-detection-scoring-matches`
  covers Signal 1 (distinctiveness scored against Wikipedia document
  frequency, TF-IDF style, with the You/Dark numbers) and Signal 4
  (cross-entity corroboration — show + cast member). `entity-detection-the-you-problem`
  covers the common-title problem. Writing "deterministic entity resolution"
  again would repeat Tristan's own best work.
- **The additive angle instead:** *entities vs. embeddings* — the comparison
  the existing series never makes, and the half of his 2023 Netflix talk the
  blog never covered. Claim: embeddings give you semantic neighborhood;
  entity resolution gives you a **decision** — a discrete, joinable,
  auditable ID you can filter, facet, govern, and build graph edges from.
  A vector cannot be filtered on, counted, or corrected.
- **POV hook:** "respect for deterministic methods in an LLM-heavy era" made
  concrete and current; plus the correctability argument (a wrong rule can be
  fixed; a wrong embedding can only be retrained around).
- **Fresh example:** "The Rock" — unused anywhere on the site, and better
  than the existing You/Dark cases because it's ambiguous across entity
  *types* (person, film, landmark).
- **Links to:** Entity Detection series for all mechanics (do NOT re-teach
  them — 2–3 sentences and a link); Exploring High-Dimensional Data for what
  embeddings actually are; post 1 for the projection framing.

### 6. A Knowledge Graph Without a Graph Database *(architectural)*
- **POV hook:** bounded traversal + link-derived features computed in batch,
  skipping the graph-database product entirely; "a product is not an
  architecture" stance.
- **Links to:** Hulu Neo4j/Cypher post (the contrast: when a graph DB *is*
  the right tool), Exploring High-Dimensional Data graph-analysis post.

### 7. Chunking Is Information Architecture *(bridge to RAG)*
- **POV hook:** chunking decisions as the same projection-design problem from
  post 1, not a RAG implementation detail; what structure-aware chunking
  preserved/destroyed in a real corpus.
- **Sets up** a possible Season 2 = the strongest half of old Season 4
  ("RAG without shortcuts"), gated on how these posts land.

### 8. From One-Off Index Jobs to a Paved-Road Library *(platform essay, closer)*
- **POV hook:** when repetition becomes a library; defaults as encoded
  organizational learning; where the escape hatch lives. Mirrors the
  Small Experiments closing theme (the contract/spec is the human
  contribution) at organizational scale.
- **Netflix:** RESOLVED 2026-08-24 — cleared to name (same terms as post 2).
- **Scale:** RESOLVED 2026-08-24 — numbers unknown; omit adoption claims;
  write qualitatively about the pattern, not its footprint.

## Cut list (and why)

- **Search Is Not Lookup** — merged into post 1; standalone it's a textbook chapter.
- **`text` vs `keyword` mapping gotcha** — saturated topic; revive only as a
  short aside inside post 2 if a real incident anchors it.
- **The Shuffle Tax** — crowded topic + overlaps existing distributed series;
  revive only if posts link to a need for it.
- **Hybrid Retrieval and Cross-Encoder Reranking** — keep on the backlog until
  it can be written around Tristan's evaluation experience rather than the
  standard architecture diagram.

## Standing rules for every post

1. **Confidentiality:** excise internal hostnames, repo paths, workflow IDs,
   product names, and proprietary source-system names (per file 05).
   **Netflix may be named when the mention involves no specific people or
   projects and implies no company position (Tristan, 2026-08-24). Still flag
   each new mention in a draft so he can review it before publish.**
2. **Scale claims:** no corpus sizes, traffic, performance, or adoption numbers
   unless Tristan supplies them — he has data for some projects; **ask** rather
   than hedge or invent.
3. **Three registers, kept distinct:** "in one system I built…" (fact) /
   "the lesson I took…" (interpretation) / "for a new system I would…"
   (recommendation).
4. **Link discipline:** each post links to post 1, to at least one existing
   series where relevant, and forward only to posts that exist.
5. **Synthetic examples** from file 06 (toy documents, short-link service,
   employee directory) instead of internal specifics.

## Discovery plan (series-level)

- Publish post 1 first and let it stand alone for a couple of weeks; it's the
  linkable thesis. Posts 2–8 follow at a deliberate cadence (no more than
  ~2/month) — each gets its own small launch rather than arriving as a dump.
- The site's new **Start Here** page groups the search series with its
  prerequisite series, so a reader arriving at any post can find the lattice.
- Practical posts carry search-intent titles; essays carry opinionated titles.
