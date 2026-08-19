# Extended Blog Backlog

This catalog is intentionally broad. It includes the first-season posts and later candidates so the authoring agent can reconcile the plan with existing site content.

## Labels

- **S1** — recommended for the first season; detailed brief exists in file 03
- **P1** — strong next candidate with direct repository grounding
- **P2** — valuable later post, possibly requiring additional examples or research
- **Short** — approximately 500–1,000 words
- **Practical** — implementation-oriented
- **Deep** — theory and engineering consequences
- **Essay** — architectural perspective
- **Case study** — anonymized evolution of a real system

---

# A. Information architecture

### A01 — The Search Index Is Not the Source of Truth
**S1 · Essay.** Explain the index as a denormalized, rebuildable serving projection assembled from canonical and derived systems. Strongest evidence: the final document index joins content, metadata, links, entities, usage, and vectors.

### A02 — Rows, Columns, Documents, Graphs, and Vectors
**P1 · Deep.** Compare relational, columnar OLAP, inverted-index, graph, and vector representations according to access pattern, update model, and failure mode. This can become the conceptual centerpiece of the larger series.

### A03 — One Source of Truth, Many Projections
**P1 · Practical.** Follow one synthetic project record into an operational row, analytical aggregate, search document, graph node, and embedding record. Emphasize that duplication is safe only with explicit derivation contracts.

### A04 — Choose an Architecture from the Shape of the Question
**P1 · Essay.** Begin with point lookup, aggregation, ranked retrieval, graph traversal, or semantic similarity rather than a vendor comparison. Provide a decision tree.

### A05 — Denormalization: Paying for Joins before the User Arrives
**P1 · Deep.** Search and OLAP move work from query time to build time. Explore latency gains, rebuild costs, storage amplification, and stale enrichments.

### A06 — Where Should the Join Happen?
**P1 · Practical.** Compare source-time, pipeline-time, index-time, application-time, and query-time relationships. Use document metadata and entity enrichment as examples of write-time joins.

### A07 — Batch Rebuilds, CDC, or Both?
**P1 · Deep.** Compare snapshots, incremental updates, change streams, periodic reconciliation, and hybrid designs. Ask whether the freshness requirement truly justifies continuous synchronization.

### A08 — Consistency Is a Product Budget
**P1 · Essay.** Titles, permissions, popularity, embeddings, and summaries may tolerate different staleness. Show why one global “real-time” requirement creates unnecessary complexity.

### A09 — When Elasticsearch Is the Wrong Database
**P1 · Short.** Checklist: transactional invariants, heavy joins, tiny datasets, no ranking need, write-dominated workloads, or unbounded analytical scans.

### A10 — Information Architecture Has a Complexity Budget
**P2 · Essay.** Every specialized index, model, queue, and synchronization path creates operational obligations. Offer criteria for when a new projection earns its cost.

---

# B. Information-retrieval fundamentals

### IR01 — Search Is Not Lookup
**S1 · Essay.** Ranked evidence versus boolean eligibility. Detailed brief in file 03.

### IR02 — The Inverted Index from First Principles
**P1 · Deep.** Build postings lists for a six-document toy corpus, then add positions, field information, term frequency, and document frequency.

### IR03 — BM25 without the Incantations
**P1 · Deep.** Explain inverse document frequency, term-frequency saturation, and document-length normalization intuitively before presenting the formula.

### IR04 — Precision and Recall Are Product Decisions
**P1 · Deep.** Show why adding candidates can help recall while eroding trust, and why a “perfect-looking” result page may hide missed information.

### IR05 — Fielded Search: Not All Matches Are Evidence of the Same Strength
**P1 · Practical.** Compare title, description, alias, body, owner, and curated metadata matches. Connect field boosts to entity-resolution field weights.

### IR06 — Query Context versus Filter Context
**P1 · Short.** A condition can constrain eligibility without contributing relevance. Use permissions, dates, type, and entity filters as examples.

### IR07 — Exact, Fuzzy, and Semantic Are Different Kinds of Match
**P1 · Deep.** Exact identifiers, analyzed lexical text, typo tolerance, synonyms, entities, and vectors should have explicit roles rather than being mixed under “smart search.”

### IR08 — Distributed Top-K Is Harder Than It Looks
**P2 · Deep.** Explain shard-local candidates, global merge, term statistics, and why topology can affect ranking.

### IR09 — Relevance Is Policy Encoded as Math
**P1 · Essay.** Freshness, authority, popularity, and source distance embed product values. Make ranking governance visible.

### IR10 — Search Quality Cannot Exceed Corpus Quality
**P1 · Essay.** Missing, duplicated, stale, malformed, inaccessible, or poorly titled documents define the ceiling before ranking begins.

---

# C. Elasticsearch gotchas and operations

### ES01 — `text`, `keyword`, and the Mapping You Cannot Change
**S1 · Practical.** Detailed brief in file 03.

### ES02 — Tokenizer, Analyzer, Token Filter, Normalizer
**P1 · Short.** Show one input string and the output of each stage. Include exact keyword normalization as a separate concept from text analysis.

### ES03 — Test the Analyzer before Blaming the Query
**P1 · Short.** Demonstrate inspecting index-time and query-time token streams. A high-value debugging habit.

### ES04 — Dynamic Mapping Is Convenient Until It Becomes the Schema
**P1 · Short.** Accidental dates, numeric coercion, conflicting types, and field explosion. Explain why explicit mappings belong in the build contract.

### ES05 — Arrays of Objects Lie Unless They Are `nested`
**P1 · Short.** Use entity/score pairs to show cross-object false matches. Directly grounded in nested entity score arrays.

### ES06 — Null, Missing, Empty String, and Empty Array
**P1 · Short.** Explain indexing and `exists` behavior, then connect it to upstream normalization and Spark null/array semantics.

### ES07 — Edge N-Grams Belong at Index Time
**P1 · Short.** Use an edge n-gram index analyzer and ordinary search analyzer; explain index amplification and low-quality one-character matches.

### ES08 — Refresh Is Visibility, Not Durability
**P1 · Short.** Distinguish refresh, Lucene segment visibility, translog durability, flush, and replicas.

### ES09 — Why Bulk Loads Disable Refreshes and Replicas
**P1 · Practical.** Explain phase-specific settings and why a rebuildable hidden index can accept temporary risk that a live mutable index cannot.

### ES10 — Shards Are Not Generic Parallelism Knobs
**P1 · Short.** More shards add fan-out, metadata, merge work, and small-shard overhead. Give a workload-based sizing framework instead of a magic number.

### ES11 — Why Shard Topology Can Change Scores
**P2 · Deep.** Distributed term statistics and local candidate selection connect IR theory with cluster layout.

### ES12 — Elasticsearch Will Not Deduplicate for You
**P1 · Short.** Stable IDs, auto-generated IDs, create/upsert semantics, and duplicate rows caused by one-to-many joins.

### ES13 — Zero-Downtime Rebuilds with Versioned Indexes and Aliases
**S1 · Case study.** Detailed brief in file 03.

### ES14 — An Alias Swap Is Atomic; the Pipeline Is Not
**P1 · Short.** Build, write, validate, settings restoration, cutover, and deletion remain independent effects.

### ES15 — Never Promote an Empty Index
**P1 · Short.** A valid zero-row query can still indicate upstream failure. Recommend minimum counts, distinct IDs, and representative smoke queries.

### ES16 — Index Cleanup Is Garbage Collection
**P1 · Practical.** Reachability from aliases, retention windows, rollback candidates, naming conventions, and wildcard deletion hazards.

### ES17 — Exact Counts and Deep Pagination Are Expensive
**P2 · Practical.** `track_total_hits`, `from`/`size`, `search_after`, and point-in-time consistency.

### ES18 — Multi-Index Aliases: One Logical Corpus, Several Lifecycles
**P2 · Deep.** Explain mapping compatibility, coordinated cutover, partial failure, and why federating physical indexes can be attractive.

---

# D. Corpus construction and knowledge graphs

### C01 — A URL Is a Locator, Not an Identity
**S1 · Practical.** Detailed brief in file 03.

### C02 — Canonicalize before You Deduplicate
**P1 · Practical.** A staged algorithm: syntax cleanup, redirect resolution, resource classification, stable-ID extraction, and provenance retention.

### C03 — The Closing Parenthesis That Broke the Graph
**P1 · Short.** A malformed extracted URL causes a failed fetch, absent edge, missing graph reachability, and ultimately no search result.

### C04 — Build the Corpus by Following Links
**P1 · Deep.** Start from trusted structured sources, extract links, and expand the graph to a bounded depth.

### C05 — Link Distance as a Trust Boundary
**P1 · Essay.** Directly sourced documents and distant linked documents should not automatically receive equal inclusion or ranking treatment.

### C06 — Freshness Is a Scheduling Problem
**P1 · Practical.** Prioritize unseen, changed, failed, and long-unchecked resources under finite quotas.

### C07 — Freshness, Failure, and the Document You Serve
**S1 · Case study.** Latest successful version versus exclusion after the latest failure; detailed brief in file 03.

### C08 — Parsing Rich Documents without Destroying Their Meaning
**P1 · Practical.** Headings, bullets, links, tables, comments, mentions, and slide structure are retrieval data.

### C09 — Markdown as a Retrieval Intermediate Representation
**P1 · Practical.** A portable representation between proprietary APIs and chunk/index pipelines; supports inspection and structure-aware processing.

### C10 — PDFs Are an Adversarial Input Format
**P1 · Practical.** Signature checks, size limits, encryption, parser fallback, suspicious-output heuristics, scanned files, and timeouts.

### C11 — Provenance Is Part of Relevance
**P1 · Essay.** Source type, owner, age, source path, and extraction status can influence trust, ranking, and citation.

### C12 — A Knowledge Graph without a Graph Database
**S1 · Deep.** Detailed brief in file 03.

### C13 — PageRank inside an Enterprise Corpus
**P2 · Deep.** Discuss link authority, organizational bias, and differences from the public web. Requires clarification about the actual PageRank producer and use.

### C14 — Taxonomies and Embeddings Solve Different Problems
**P1 · Essay.** Curated topics provide governance and stable language; vectors provide flexible similarity. Neither makes the other obsolete.

### C15 — Human Overrides Are Features, Not Failures
**P1 · Practical.** Explicit exclusions, canonical names, confirmed matches, and curated top resources should be auditable and versioned.

### C16 — Corpus Boundaries and Access Control
**P1 · Deep.** Permissions must constrain discovery, indexing, ranking, context assembly, and citations—not only the final UI.

---

# E. Query understanding and ranking

### Q01 — Query Understanding Is a Pipeline, Not a Model
**P1 · Deep.** Normalization, language, entities, acronyms, intent, filters, candidates, and ranking are separate debuggable stages.

### Q02 — Synonyms Can Reduce Search Quality
**P1 · Short.** Broad bidirectional expansion creates noise. Discuss directional, scoped, and phrase-level synonyms.

### Q03 — Acronyms, Country Codes, and Tiny Ambiguities
**P1 · Practical.** Very short tokens collide with ordinary language. Use corpus frequency, case, context, and exclusions.

### Q04 — “Did You Mean?” with Shingles
**P1 · Practical.** Explain adjacent-token sequences and why a suggestion field should be analyzed differently from ordinary title retrieval.

### Q05 — Autocomplete Is a Ranking System
**P1 · Deep.** Prefix matching generates candidates; popularity, recency, type, and context determine useful ordering.

### Q06 — Ranking Is a Stack of Signals
**P1 · Essay.** Lexical, semantic, entity, graph, authority, freshness, popularity, and quality signals each represent different evidence.

### Q07 — Weight Fields by Evidence, Not Convenience
**P1 · Practical.** A title match and a body mention should not be equivalent. Field weights should reflect why a field contains the term.

### Q08 — Entity-Aware Retrieval without Replacing Full-Text Search
**P1 · Deep.** Entity matches can filter, expand, or boost lexical candidates while preserving exact term behavior.

### Q09 — Candidate Retrieval and Reranking Are Different Jobs
**P1 · Deep.** Fast high-recall retrieval followed by expensive precision-oriented scoring.

### Q10 — Evaluate Ranking before You Tune It
**P1 · Practical.** Judged queries, Recall@K, MRR, NDCG, failure categories, and stage-specific evaluation.

### Q11 — Behavioral Signals Create Feedback Loops
**P2 · Deep.** Clicks and views encode preference and prior exposure. Discuss position bias, cold starts, and popularity reinforcement.

### Q12 — Debug Search by Failure Stage
**P1 · Short.** Distinguish missing corpus, parsing failure, filtered candidate, low candidate score, reranking failure, and display/citation failure.

---

# F. Embeddings, semantic retrieval, and RAG

### R01 — RAG Is Mostly a Retrieval System
**P1 · Essay.** Corpus, freshness, permissions, ranking, and provenance determine whether the generator receives usable evidence.

### R02 — A Long Document Embedding Is Often a Truncated Document
**P1 · Short.** Model context limits do not summarize excess text. Explain truncation, pooling, and why long-document strategy must be explicit.

### R03 — Chunking Is Information Architecture
**S1 · Deep.** Detailed brief in file 03.

### R04 — Preserve Heading Hierarchy in Every Chunk
**P1 · Short.** Repeat the document/section path so an isolated passage retains meaning.

### R05 — Tables Need Their Own Chunking Strategy
**P1 · Practical.** Keep headers with rows, preserve units, and avoid splitting related columns across chunks.

### R06 — Document Retrieval and Chunk Retrieval Are Complementary
**P1 · Deep.** Document candidates preserve artifact-level coherence; passage candidates locate specific evidence.

### R07 — Hybrid Retrieval and Cross-Encoder Reranking
**S1 · Deep.** Detailed brief in file 03.

### R08 — BM25 and Cosine Scores Are Not Comparable Units
**P1 · Short.** Explain why raw score addition is suspect and introduce rank fusion or calibration.

### R09 — Rerank Only What You Can Afford
**P1 · Practical.** Candidate limits, batching, GPU serving, timeouts, and lexical fallback.

### R10 — Should Metadata Be Embedded with the Body?
**P1 · Deep.** Concatenation and weighted vector averaging can improve recall but obscure which evidence caused similarity.

### R11 — Index Questions Differently from Answers
**P1 · Practical.** Embed the likely user question, return the linked answer and provenance. Grounded in summarized Q&A records.

### R12 — Embedding Upgrades Are Schema Migrations
**P1 · Deep.** Dimension, normalization, score distribution, chunking, and thresholds all change. Build a new index and evaluate before cutover.

### R13 — Deduplicate before You Embed
**P1 · Short.** Duplicates waste GPU work, crowd result sets, and distort evaluation. Use canonical IDs and content hashes.

### R14 — Citations Are a Data-Lineage Feature
**P1 · Essay.** Stable source and chunk IDs, version timestamps, and accessible URLs must exist before prompt assembly.

### R15 — Evaluate Retrieval and Generation Separately
**P1 · Deep.** Determine whether evidence was missing, ranked too low, dropped during context construction, or misused by the generator.

### R16 — Stale and Contradictory Evidence Is Harder Than Hallucination
**P1 · Essay.** A model may faithfully summarize obsolete content. Retrieval needs authority, time, version, and conflict policy.

### R17 — Graph-Augmented RAG without the Hype
**P2 · Deep.** Use links, entities, and topics for controlled expansion or reranking rather than replacing ordinary retrieval with an undefined graph layer.

---

# G. Distributed data processing and OLAP

### D01 — MapReduce Never Really Went Away
**P1 · Essay.** Spark hides mechanics, but mapping, partitioning, shuffle, aggregation, and materialization remain the durable model.

### D02 — The Shuffle Tax
**S1 · Deep.** Detailed brief in file 03.

### D03 — `repartition` versus `coalesce`
**P1 · Short.** Increase versus reduce partitions, shuffle behavior, output-file control, and downstream concurrency.

### D04 — Data Skew: When One Key Owns the Cluster
**P1 · Deep.** Detection, salting, pre-aggregation, hot-key isolation, and broadcast alternatives.

### D05 — The Small-Files Problem Is an Architecture Problem
**P1 · Practical.** Parallel output can overwhelm metadata, scheduling, and downstream ingestion; compaction and partition design belong in the workflow.

### D06 — `collect()` Is a Distributed-System Escape Hatch
**P1 · Short.** Collecting and broadcasting a bounded trie is elegant; doing the same with an unbounded corpus crashes the driver.

### D07 — Python UDF, Native Spark SQL, or Scala?
**P1 · Deep.** Compare authoring cost, optimizer visibility, serialization, JVM execution, packaging, and performance.

### D08 — Designing Restartable Work Queues on Batch Tables
**P1 · Practical.** Candidate partitions, claiming work, delete-before versus delete-after, attempt records, and at-least-once processing.

### D09 — Backfills Are Different Programs Wearing the Same Clothes
**P1 · Essay.** Backfills alter partition counts, source availability, memory pressure, lateness assumptions, and retry behavior.

### D10 — Event Time, Processing Time, Snapshot Time, and “Latest”
**P1 · Deep.** A document's modification time, acquisition time, workflow date, and serving version are not interchangeable.

### D11 — Approximate Aggregation Is a Product Tradeoff
**P1 · Deep.** HyperLogLog and quantile sketches trade bounded error for mergeability and interactivity.

### D12 — A Sketch of What, Exactly?
**P1 · Short.** Users, sessions, daily account totals, and raw events define different distributions. Semantic grain comes before error bounds.

### D13 — OLAP and Search Both Precompute Answers
**P1 · Essay.** Cubes, rollups, inverted indexes, graph features, and embeddings all spend build-time computation to produce interactive reads.

### D14 — Partition for the Consumer, Not Only the Producer
**P2 · Practical.** Spark output partitions become files, bulk writers, or downstream segments. Optimize the whole boundary.

---

# H. Platform and library engineering

### P01 — From One-Off Index Jobs to a Paved-Road Library
**S1 · Case study.** Detailed brief in file 03.

### P02 — Safe Defaults Are an Architectural Product
**P1 · Essay.** Index naming, rollback retention, mappings, and lifecycle defaults encode organizational experience.

### P03 — Every Paved Road Needs an Escape Hatch
**P1 · Practical.** Keep the common API tiny while exposing controlled overrides for mappings, settings, Spark, and connector options.

### P04 — Workflow YAML Is Part of the Public API
**P1 · Practical.** Parameter names, table maps, environments, wheels, JARs, and executor versions form a contract as real as a Python signature.

### P05 — Dependency Compatibility Is Part of Correctness
**P1 · Deep.** Python, Spark, Scala, JDK, client, connector, server, and model dependencies can each break a data path.

### P06 — Testing a Library Whose Output Is a Distributed Side Effect
**P1 · Practical.** Isolate template creation, index naming, alias actions, retention, and connection setup; integration-test the real boundary deliberately.

### P07 — Observability for Indexing Libraries
**P1 · Practical.** Standard logs and metrics for source count, distinct IDs, partitions, write rejections, settings restoration, alias target, duration, and cleanup.

### P08 — The Changelog Is the Syllabus
**P1 · Essay.** Classify years of fixes into identity, parsing, distribution, schema, freshness, and dependency lessons.

### P09 — When a Safe Default Becomes a Hidden Assumption
**P1 · Essay.** Fixed shard and partition counts illustrate the tension between consistency and workload-specific tuning.

### P10 — Reversibility as a Platform Feature
**P2 · Essay.** Versioned artifacts, alias cutovers, previous-index retention, and additive schema changes make operational change safer.

---

# Suggested prioritization after Season 1

If the first season performs well, the strongest next twelve are:

1. **Rows, Columns, Documents, Graphs, and Vectors**
2. **The Inverted Index from First Principles**
3. **BM25 without the Incantations**
4. **Precision and Recall Are Product Decisions**
5. **Test the Analyzer before Blaming the Query**
6. **Arrays of Objects Lie Unless They Are `nested`**
7. **PDFs Are an Adversarial Input Format**
8. **Synonyms Can Reduce Search Quality**
9. **RAG Is Mostly a Retrieval System**
10. **Evaluate Retrieval and Generation Separately**
11. **A Sketch of What, Exactly?**
12. **The Changelog Is the Syllabus**

This set preserves the desired mix of short gotchas, foundational theory, modern retrieval, and hard-earned operational judgment.
