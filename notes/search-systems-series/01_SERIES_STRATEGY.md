# Series Strategy: From Rows to Retrieval

## Working umbrella

**Primary working title:** *From Rows to Retrieval*  
**Subtitle:** *Lessons from building analytical, search, graph, and RAG systems at scale*

Other viable series names:

- *The Index Is Not the Truth*
- *Building Systems That Find Things*
- *Search Systems in Practice*
- *Notes from the Retrieval Layer*
- *Information Architecture at Scale*

## Core thesis

A useful through-line for the entire series is:

> A database is optimized for a family of questions. A relational table, OLAP model, inverted index, graph projection, and vector index can all describe the same world, but each pays different costs at write time, query time, and synchronization time. The right design follows from the shape of the question, the freshness requirement, and the acceptable failure mode.

This framing makes the series larger and more durable than a version-specific Elasticsearch tutorial. It also creates a natural progression through Tristan's experience:

1. normalized relational data and transactional integrity;
2. batch computation with MapReduce-derived systems;
3. analytical projections and approximate aggregation;
4. low-latency search indexes and ranking;
5. graph-derived authority and relationship features;
6. entity-aware retrieval;
7. vectors, chunk retrieval, cross-encoder reranking, and RAG;
8. internal platform design that makes safe patterns reusable.

## Author credibility represented by the source material

The repositories support an author position based on implementation rather than commentary:

- The main ETL repository was initialized in 2020, and Tristan's local commit history spans 2020–2025.
- The knowledge-management refactor under `workflows/knowledgemgmt_new/` begins in July 2022 and evolves through traditional full-text search, graph features, entity resolution, vector indexes, chunking, and reranking.
- Tristan is the dominant historical contributor in the local Git shortlog, with work across search, knowledge management, Product Insights, Spark, Druid, and data workflows.
- The commit history repeatedly records practical problems: duplicates, malformed links, stale documents, unsupported document types, memory pressure, Spark upgrades, Python upgrades, connector changes, retries, PDF parsing, schema drift, entity ambiguity, mapping changes, and ingestion performance.
- The separate `elasticsearch-ingest` package distills repeated indexing logic into a versioned internal library with a high-level workflow interface and a lower-level escape hatch.

Do not publish commit counts or dates as proof points unless Tristan wants them. Their purpose here is to confirm that the proposed voice—“lessons learned over several years”—is supported by the work.

## Target audiences

### Primary

Senior data engineers, search engineers, platform engineers, and backend engineers who understand databases but have not internalized information-retrieval architecture.

### Secondary

- ML engineers building RAG applications who need stronger retrieval and data-pipeline foundations;
- analytics engineers deciding when a warehouse is insufficient as a serving layer;
- software architects choosing among relational, OLAP, search, graph, and vector systems;
- engineers operating Elasticsearch without a formal IR background;
- technical leads building paved-road libraries and internal platforms.

### What readers should gain

Readers should leave with reusable mental models rather than product recipes:

- search is ranked retrieval, not database lookup;
- indexes are derived projections, not canonical truth;
- index-time work and query-time work trade against one another;
- identity, freshness, provenance, and access control are retrieval concerns;
- lexical, graph, entity, behavioral, and vector signals are complementary;
- distributed data shape determines performance;
- safe operational defaults can encode years of experience.

## Content pillars

### Pillar 1: Information architecture

Questions answered:

- What is each storage model good at?
- When should a relationship be resolved?
- When is denormalization appropriate?
- How should teams reason about consistency and freshness?
- When is Elasticsearch, a graph database, or a vector database unnecessary?

### Pillar 2: Classical information retrieval

Questions answered:

- How does an inverted index work?
- Why does BM25 behave as it does?
- What are precision, recall, and fielded relevance?
- Why is distributed top-k retrieval difficult?
- How do analyzers and mappings affect what can be found?

### Pillar 3: Corpus engineering and knowledge graphs

Questions answered:

- What counts as a document?
- How are links discovered, normalized, and represented?
- How should stale, failed, duplicated, or inaccessible content be handled?
- When do graph distance and provenance become trust signals?
- How can entity resolution work without a large model?

### Pillar 4: Indexing and Elasticsearch operations

Questions answered:

- How can a full rebuild be safe and cheap enough?
- What does an atomic alias switch guarantee—and not guarantee?
- Why do mappings, IDs, shards, refreshes, and nested fields cause surprises?
- How should a Spark pipeline feed an Elasticsearch cluster?
- What invariants should be checked before cutover?

### Pillar 5: Semantic retrieval and RAG

Questions answered:

- What does chunking preserve or destroy?
- When should retrieval operate at document or passage level?
- How should lexical and vector retrieval be combined?
- What is a cross-encoder for?
- How should retrieval and generation be evaluated separately?

### Pillar 6: Distributed data processing and OLAP

Questions answered:

- Why does the MapReduce model still matter in Spark?
- What do shuffles, skew, partitioning, and small files do to a job?
- How do Druid-style projections and sketches trade exactness for interactivity?
- Why are backfills different from scheduled runs?
- How do batch semantics shape search and RAG systems?

### Pillar 7: Platform engineering

Questions answered:

- When should a repeated script become a library?
- How can defaults encode organizational learning?
- Where should an escape hatch exist?
- How are workflow configuration and dependency compatibility part of the API?
- How can side-effect-heavy indexing software be tested and observed?

## Recommended formats

Use a deliberate mix. A sequence of only deep dives will be slow to produce; a sequence of only gotchas will undersell the systems perspective.

### Short gotcha

- 500–1,000 words
- one surprising behavior;
- one minimal example;
- one diagnostic technique;
- one safe rule of thumb;
- caveat showing where the rule stops applying.

Examples: `text` versus `keyword`; `nested`; refresh versus durability; deterministic IDs; `repartition` versus `coalesce`.

### Practical implementation article

- 1,500–2,500 words
- a concrete problem and architecture;
- failure modes;
- operational lifecycle;
- pseudocode or public-safe code;
- validation checklist.

Examples: alias-based rebuilds; freshness scheduling; URL canonicalization; chunking structured documents.

### Deep dive

- 2,500–5,000 words
- first principles;
- a mathematical or systems model;
- consequences for implementation;
- a worked example;
- alternatives and limits.

Examples: BM25; distributed top-k; entity ambiguity from corpus frequency; hybrid retrieval; the shuffle tax.

### Architectural essay

- 1,500–3,000 words
- a strong thesis;
- two or three contrasting architectures;
- decision framework;
- signs that a team has chosen poorly.

Examples: “The search index is not the source of truth”; “Rows, columns, documents, graphs, and vectors.”

### Anonymized case study

- begin with a real engineering need;
- abstract company-specific nouns;
- include the evolution, not just the final design;
- explain which initially reasonable ideas failed;
- avoid unsupported scale or performance claims.

Examples: constructing an enterprise document corpus; extracting an indexing library; adding chunk vectors to a lexical corpus.

## Narrative principles

### 1. Begin with the user's question

Prefer “A user types an ambiguous title and expects the right memo” over “We built a trie.” Technology should enter after the information need is clear.

### 2. Explain the hidden data work

A recurring theme should be that retrieval quality is downstream of corpus discovery, identity, parsing, metadata, freshness, and access. The repository provides unusually strong evidence for this point.

### 3. Show the evolution

Good stories include a sequence such as:

1. index documents;
2. discover duplicate identities;
3. canonicalize URLs;
4. follow document links;
5. bound the graph by authoritative sources;
6. enrich documents with entities and graph features;
7. add embeddings and chunks;
8. add reranking;
9. package the indexing pattern.

This is more instructive than presenting a polished architecture as if it appeared fully formed.

### 4. Treat deterministic methods seriously

Tries, regexes, field weights, link distance, aliases, explicit mappings, and warehouse models are not embarrassing predecessors to AI. They remain inexpensive, transparent, and often superior for exact domain knowledge.

### 5. Separate fact, interpretation, and recommendation

Useful phrasings:

- “In one system I built, we…” — implementation fact, after confidentiality review.
- “The lesson I took from that was…” — interpretation.
- “For a new system, I would…” — current recommendation, which may differ from historical code.

### 6. Include tradeoffs and reversals

The Git history shows designs changing: for example, one revision selected the last successful document after a failed read; a later revision intentionally excluded a document when its latest read failed. That is a better lesson about policy and trust than a claim that one strategy is universally correct.

## Proposed release structure

### Season 1: The shape of a search system

1. **The Search Index Is Not the Source of Truth** — architectural thesis.
2. **Search Is Not Lookup** — introduction to ranked retrieval.
3. **`text`, `keyword`, and the Mapping You Cannot Change** — high-value gotcha.
4. **Zero-Downtime Rebuilds with Versioned Indexes and Aliases** — practical operational pattern.
5. **A URL Is a Locator, Not an Identity** — corpus identity.
6. **Freshness, Failure, and the Document You Serve** — incremental processing and policy.
7. **Entity Resolution without an LLM** — deterministic retrieval enrichment.
8. **A Knowledge Graph without a Graph Database** — graph modeling and bounded traversal.
9. **Chunking Is Information Architecture** — bridge into semantic retrieval.
10. **Hybrid Retrieval and Cross-Encoder Reranking** — modern ranking architecture.
11. **The Shuffle Tax** — distributed processing foundations.
12. **From One-Off Index Jobs to a Paved-Road Library** — platform conclusion.

This order alternates foundational essays, concise practical advice, and deeper implementations. Posts 1–8 can stand without RAG; posts 9–10 build on the corpus and ranking vocabulary established earlier.

### Season 2: Relevance engineering

Candidate arc:

1. inverted indexes from first principles;
2. BM25;
3. precision and recall;
4. fielded relevance;
5. synonyms and acronyms;
6. autocomplete and spell correction;
7. graph and authority signals;
8. behavioral signals and feedback loops;
9. candidate generation versus reranking;
10. retrieval evaluation.

### Season 3: Distributed information pipelines

Candidate arc:

1. MapReduce as a durable mental model;
2. shuffles;
3. partitioning and skew;
4. small files;
5. broadcast data structures;
6. Python UDF versus native Spark versus Scala;
7. restartable batch work queues;
8. event time and freshness;
9. backfills;
10. sketches and OLAP projections.

### Season 4: RAG without shortcuts

Candidate arc:

1. RAG is mostly retrieval;
2. corpus boundaries and permissions;
3. document versus passage retrieval;
4. structure-aware chunking;
5. tables;
6. hybrid candidate generation;
7. reranking;
8. model and preprocessing lineage;
9. citations as data lineage;
10. retrieval and generation evaluation;
11. stale and contradictory evidence;
12. graph-augmented retrieval.

## Inter-post dependency map

```text
The index is not truth
  ├── versioned indexes and aliases
  ├── schema evolution
  ├── consistency and freshness
  └── one source, many projections

Search is not lookup
  ├── inverted indexes and BM25
  ├── precision and recall
  ├── fielded ranking
  └── candidate retrieval vs reranking

Corpus identity and parsing
  ├── URL canonicalization
  ├── link graph
  ├── entity resolution
  ├── provenance
  └── structure-aware chunking

Distributed batch foundations
  ├── warehouse-to-index pipeline
  ├── graph feature computation
  ├── embedding generation
  ├── backfills
  └── platform library

Chunking
  ├── document vs passage retrieval
  ├── hybrid retrieval
  ├── reranking
  ├── citations
  └── RAG evaluation
```

## Success criteria for the series

The series is successful if readers begin using phrases and decisions such as:

- “That index is a projection; what is its source and rebuild contract?”
- “Should this condition filter eligibility or affect relevance?”
- “What is the stable identity after redirects and URL variants?”
- “What evidence does an entity match in this field provide?”
- “Are we evaluating candidate recall separately from answer quality?”
- “What shuffle or skew does this transformation create?”
- “Is this safe default encoding a real invariant, or only one workload's history?”

Those are stronger outcomes than teaching a particular API call.
