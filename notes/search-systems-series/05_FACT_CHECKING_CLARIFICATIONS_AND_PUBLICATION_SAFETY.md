# Fact Checking, Clarifications, and Publication Safety

**Private authoring material.** This file separates what was directly verified from what remains an inference, historical fact, or user-supplied assertion.

## 1. Evidence labels

Use these labels while drafting:

- **V — Verified current snapshot:** directly present in the examined files.
- **H — Verified history:** supported by Git history but not necessarily current behavior.
- **U — User assertion:** supplied by Tristan, not independently established from the local repositories.
- **I — Inference:** a reasonable architectural interpretation, not an explicit implementation fact.
- **Q — Requires clarification:** conflicting, missing, or insufficient evidence.

Do not include these labels in published prose; they are an authoring discipline.

---

# 2. Verified facts

## Repository and timeline

- **V:** `pcra-dse` is a production-oriented data-workflow repository containing Spark SQL, PySpark, containerized Python, workflow YAML, Scala/Spark, Druid ingestion, Metaflow services, and Elasticsearch loads.
- **V:** The local repository begins in October 2020.
- **V/H:** The `workflows/knowledgemgmt_new/` refactor begins in July 2022.
- **V:** Tristan's local authored commit history spans 2020 through 2025 and covers analytical pipelines, knowledge management, Elasticsearch, entity resolution, embeddings, and workflow/platform concerns.
- **V:** The main knowledge-management workflow runs daily and orchestrates entities, topics, sources, links, documents, mappings, entity resolution, index loads, and reporting.
- **V:** The workflow has separate sandbox/test/prod patterns in several subareas.

## Source and link model

- **V:** Many source-specific records are normalized into a common link-candidate table.
- **V:** Candidate records carry source identity/type, the source field containing the link, the text/URL source, and an index target.
- **V:** URL extraction removes trailing punctuation and non-printable characters and checks recognized domains/forms.
- **V:** Redirect wrappers and an internal short-link service are resolved.
- **V:** Short-link resolution is cached, rate-limited, bounded to a small number of redirects, and persists status.
- **V:** Resource classification and stable-ID extraction are domain-specific.
- **V:** An exclusion table removes explicitly disallowed resources.

## Document acquisition

- **V:** The candidate list includes unseen documents, prior failures, documents with newer edit activity, and long-unchecked documents.
- **V:** The current code applies bounded quotas to candidate classes rather than attempting to refresh the entire corpus daily.
- **V:** Candidate processing is partitioned/batched.
- **V:** Acquisition records raw content, metadata, comments, load status, error text, and load identifiers.
- **V:** Supported paths include structured documents, presentations, drive-hosted files, shortcuts, and PDFs.
- **V:** PDF responses are checked for an expected file signature.
- **V:** The document workflow is tagged as restart-unsafe in the workflow definition.

## Failure policy

- **H:** On March 2, 2023, the latest-success selection was changed to preserve the last successful read after a failed attempt.
- **H:** On March 30, 2023, that decision was reversed: if the latest attempt failed, the document was excluded from the corpus.
- **V:** The current snapshot selects the latest attempt and downstream processing includes only successful latest records, so a latest failure removes the document from the rebuilt parsed corpus.
- **Q:** The motivation for the policy reversal is not documented in enough detail to state confidently.

## Parsing

- **V:** The system produces both plain-text and structure-preserving Markdown-like document representations.
- **V:** Heading styles, bullets, hyperlinks, nested tables, mentions, tables of contents, presentations, metadata, and comments are handled explicitly.
- **V:** Unicode normalization addresses several space, dash, quote, and surrogate-character cases.
- **V:** PDFs use two parsers with a plausibility heuristic and fallback.
- **V:** Oversized and obviously invalid PDFs are bounded or filtered.

## Graph model

- **V:** The system models structured-source-to-document and document-to-document links.
- **V:** It constructs parent and child link arrays.
- **V:** It performs a bounded iterative expansion from directly sourced documents.
- **V:** The examined implementation stores generations 0 through 3 and gates documents to a maximum generation of 3.
- **V:** It stores one path back toward an authoritative source.
- **V:** It computes a simple link score using contributions inversely weighted by source generation.
- **V:** Historical snapshots of the shortest-generation map are retained.
- **V:** Elasticsearch staging joins PageRank fields from a `doc_pagerank` table.
- **Q:** The producer and exact implementation of `doc_pagerank` were not found in this snapshot.

## Search-document projection

- **V:** The final document staging table denormalizes parsed text, source metadata, ownership, graph fields, entity scores, temporal fields, summaries/keywords, usage, and vectors.
- **V:** Document text length is limited, with one implementation allowing more text for documents closer to accepted sources.
- **V:** Entity/source arrays use structured or nested forms.
- **V:** A mapping file includes English analyzers, shingles for a suggestion field, exact keyword fields, nested entity/source fields, and a vector field.
- **Q:** The mapping file's vector dimension and the current embedding model's output dimension appear to belong to different iterations. Do not assert that the checked-in template exactly matches the current embedding job without confirmation.
- **V:** A README says canonical index templates live in another repository, so checked-in templates may not be the production source of truth.

## Entity resolution

- **V:** Entity resolution includes deterministic matching for several domain entity categories.
- **V:** A generic trie implementation exists in Python and Scala.
- **V:** The trie supports case-sensitive/case-insensitive matching, word-boundary behavior, arbitrary associated values, and tie-breaking for duplicate phrases.
- **V:** Dictionaries/tries are collected centrally and broadcast to Spark executors in several jobs.
- **V:** Field location affects score: for example, title and curated metadata can receive more weight than body text.
- **V:** Alternate-title frequency is computed against both an internal corpus and an external general corpus, in case-sensitive and insensitive forms.
- **V:** Title matching combines phrase rarity/relevance, IDs, structured-source evidence, related-person evidence, and explicit exclusions.
- **V:** Entity scores are heuristic values, not documented calibrated probabilities.

## Topics and taxonomy

- **V:** Topic records combine preferred names, synonyms, acronyms, ownership, descriptions, publication state, and curated resources.
- **V:** Entity aliases can be incorporated into topic search terms.
- **V:** Some extremely common short codes are explicitly excluded from search-term arrays.
- **V:** Topic embeddings combine topic text and selected resource documents with explicit weighting.

## Embeddings and reranking

- **V:** The snapshot contains a document/chunk embedding job using `BAAI/bge-large-en-v1.5`.
- **V:** The chunker is tokenizer-aware and uses headings, tables, paragraphs, punctuation, and whitespace as prioritized boundaries.
- **V:** Heading hierarchy is prefixed to chunks.
- **V:** Tables receive special row/header handling.
- **V:** One chunk-vector variant blends chunk and document embeddings with much higher weight on the local chunk.
- **V:** Separate document and chunk records are written and later loaded into Elasticsearch indexes.
- **V:** A Q&A embedding job embeds summarized questions and stores answer/provenance metadata.
- **V:** A GPU-hosted service uses `BAAI/bge-reranker-large` to score query/candidate pairs and return top candidates.
- **V:** A related service performs hierarchical passage selection over long text.
- **Q:** The exact production fusion of lexical candidates, vector candidates, and cross-encoder output is not shown.
- **Q:** No comparative quality results for weighted versus unweighted chunks were found.

## Elasticsearch ingestion library

- **V:** The standalone package is named `elasticsearch-ingest`.
- **V:** The current clone has tags from `v1.0.0` through `v2.1.4`.
- **V:** The README example refers to `2.1.1`, while examined production workflows refer to `1.2.0`.
- **V:** The low-level function executes Spark SQL and writes the resulting DataFrame via Elasticsearch-Hadoop.
- **V:** It creates a timestamped physical index, applies mappings/settings before the write, restores search settings, and rotates an alias.
- **V:** It can preserve the previously active index and delete older matching indexes.
- **V:** It supports a deterministic ID field, additional Spark options, connector options, and multi-part loads.
- **V:** The streamlined interface derives environment/target/table information from workflow parameters and delegates to the low-level loader.
- **V:** The package requirements in the examined snapshot include Python 3.10+, PySpark 3.4.2, and Elasticsearch Python client 7.10.1.
- **V:** Examined workflows run Spark 3.3 with a 7.17.x Elasticsearch-Hadoop connector and JDK 17, illustrating separate compatibility axes.
- **V:** Current tests in the standalone repository are minimal.
- **U:** Tristan says the package is broadly used internally.
- **V:** The local ETL repository contains many imports across documents, entities, topics, manuals, onboarding, data documentation, warehouse metadata, leaderboard, and discussion/Q&A indexes.

## OLAP and distributed processing

- **V:** Earlier workflows construct partitioned daily and rolling warehouse aggregates and ingest them into Druid-style analytical datasources.
- **V:** At least one workflow creates mergeable HyperLogLog sketches of account IDs and configures the analytical store to merge them.
- **V:** A repository README explicitly raises the semantic question of whether a sketch represents sessions, accounts, or daily totals.
- **V:** Workflows address partition pruning, date-range batching, source-partition fallback, output coalescing, bucketing, target segment size, old-segment cleanup, reducer/executor memory, and backfills.
- **V:** The Scala subproject targets Scala 2.12 and a Spark 3.3 line in the examined snapshot.

---

# 3. Claims that are reasonable interpretations, not direct facts

The following are strong themes, but should be written as lessons or interpretations:

- **I:** Graph distance was a trust signal. It definitely controlled inclusion and appeared as an indexed field; whether users or ranking explicitly interpreted it as “trust” needs confirmation.
- **I:** Markdown was chosen specifically as the long-term intermediate representation for RAG. It clearly enabled structured chunking, but design intent should be confirmed.
- **I:** The chunk/document embedding blend improved retrieval. The implementation exists; measured improvement was not found.
- **I:** PageRank improved ranking. The field exists, but production use and impact are unverified.
- **I:** The indexing library reduced incidents or engineering time. Likely, but no metrics were examined.
- **I:** Scala replaced Python specifically for performance. Scala contains performance-sensitive logic, but motivations should be obtained from Tristan.
- **I:** A particular shard or partition default is “best.” Defaults reflect one environment and should not be universalized.
- **I:** Full rebuilds are always preferable. They are attractive when the authoritative snapshot is available and rebuild cost is acceptable.
- **I:** The knowledge graph was a complete semantic knowledge graph. The code clearly models sources, documents, entities, topics, and links, but public terminology should match Tristan's intended scope.

---

# 4. Important contradictions and version boundaries

## Last-known-good content

Do not write “the system always served the last known good copy.” That was a historical implementation for a period, then intentionally changed.

Better:

> We tried both policies. Preserving the last successful copy favored availability; excluding a document after the latest failed read favored conservative trust. The right choice depends on whether a failure may indicate revoked access or deletion.

## Embedding dimensions and models

A checked-in index template defines a 768-dimensional vector, while the current document embedding script names a model generally associated with a different dimension. This likely reflects different generations of the system or a template no longer canonical.

Do not publish an exact vector dimension unless Tristan confirms the relevant version.

## Library versions

Do not describe one version as universally deployed. The standalone repository, README, tags, and production workflow references differ.

Better:

> The library evolved through multiple releases while existing workflows upgraded on their own schedules.

## Spark and Elasticsearch versions

The Python client, Elasticsearch-Hadoop connector, Spark runtime, and server can all have different version numbers. Avoid a sentence that implies one “Elasticsearch version” governs the entire stack.

## PageRank

The search projection includes PageRank fields, but their producer is absent from this repository snapshot. Do not explain an implementation or outcome without Tristan's input.

## Current versus historical defaults

Some settings—fixed shard count, fixed repartition count, relaxed translog durability, disabled soft deletes—are environment- and era-specific. Explain the principle, not the literal values, unless the post is explicitly historical.

---

# 5. High-priority questions for Tristan

## Editorial and audience

1. Is the intended publication public, internal, or both?
2. May Netflix be named as the setting?
3. May the internal search product or `elasticsearch-ingest` package be named?
4. Which existing blog posts already cover databases, Spark, search, or RAG?
5. Does Tristan prefer first-person case studies or mostly general technical essays?
6. Are there topics he does not want associated with his public work?

## Search serving and relevance

7. What did the actual query path look like?
8. Which indexed fields were used for filtering, lexical score, boosting, or display only?
9. How were lexical and vector candidates combined, if at all?
10. Was the cross-encoder in the production request path, an experiment, or a hosted capability for selected uses?
11. How were relevance changes evaluated: judgment sets, user feedback, online experiments, or ad hoc testing?
12. Which ambiguous queries best illustrate failures without disclosing sensitive content?
13. Was PageRank used in ranking, and where was it produced?

## Corpus and graph

14. Why was graph depth limited to the chosen value?
15. Was source distance explicitly understood as trust, or mainly a scope/performance boundary?
16. Why did the failure policy change from last-success fallback to latest-failure exclusion?
17. How were access revocation and deletion handled?
18. What source or document type caused the hardest identity problem?
19. Which parsing bug created the most downstream damage?
20. Were source paths or provenance shown to users?

## Entity resolution

21. Which entity type was most successful with deterministic methods?
22. Which ambiguity motivated corpus-frequency scoring?
23. Were precision/recall or adjudicated samples available?
24. Why did some matchers move to or remain in Scala?
25. How frequently were manual exclusions needed?

## Embeddings and RAG

26. Which embedding models were used over time, and what dimensions corresponded to which indexes?
27. Was weighted chunk-plus-document embedding compared against unweighted chunks?
28. Did document-level and chunk-level retrieval appear together in the application?
29. How were chunks deduplicated or grouped in results?
30. What model upgrade or dependency problem was most instructive?
31. Were citations assembled from stable chunk IDs?
32. Were stale or contradictory sources a visible issue?

## `elasticsearch-ingest` library

33. When and why was the pattern extracted from the ETL repository?
34. Who were the first users outside the originating project?
35. What concrete evidence supports “broadly used internally”?
36. Which default encoded the most valuable hard-won lesson?
37. Which default later became too opinionated?
38. What validation happened before alias cutover outside the current library code?
39. Was rollback actually exercised?
40. What should a hypothetical next major version change?

## Distributed processing and OLAP

41. Which lesson came specifically from Hadoop/MapReduce, Cascading, or Scalding and still shaped Spark work?
42. Which job offers the best public story about skew or shuffles?
43. Which backfill failed because daily-run assumptions did not hold?
44. Is there a shareable example where approximate aggregation was the right product tradeoff?
45. Can any scale, runtime, cost, or reliability numbers be disclosed?

---

# 6. Publication-safety checklist

Before any draft is published, verify all of the following.

## Remove or generalize

- internal repository paths and repository hostnames;
- workflow IDs and scheduler-specific control-plane syntax;
- internal service, cluster, application, and authentication names;
- employee names, emails, groups, and organization data;
- proprietary dataset, schema, table, dashboard, and product names;
- internal URLs, ports, object-store paths, artifact registries, and package locations;
- exact corpus sizes, traffic, performance, memory, GPU, and cost figures unless approved;
- source-system names that reveal confidential business processes;
- code comments containing internal links;
- credential material of any kind.

## Replace with synthetic equivalents

| Internal concept | Public-safe replacement |
|---|---|
| internal document suite | hosted document API |
| short-link service | `go/example` or a generic redirect service |
| internal dashboard platforms | dashboard/reporting system |
| employee directory | organization directory |
| title/show entity | product, project, book, or media-title entity |
| strategy/QBR/experiment sources | authoritative project records |
| internal warehouse schemas | `warehouse.documents`, `warehouse.entities` |
| internal cluster alias | `documents` |
| internal physical index | `documents_idx_20250301T120000` |
| internal discussion system | team discussion threads |

## Code publication

- Reimplement examples from first principles rather than copying production files.
- Keep examples short enough to review completely.
- Remove authentication and environment logic.
- Avoid exact internal tuning values; use placeholders and explain that tuning is workload-specific.
- Use toy IDs and public-domain text.
- Include tests for canonicalization, entity matching, alias actions, or chunking when code is central to the post.

## Claims and metrics

- Attribute broad adoption, scale, speedups, quality gains, and incident reductions only to approved evidence.
- Do not turn commit-message anecdotes into incident claims.
- Do not claim production use merely because exploratory code exists.
- Distinguish current behavior from a historical experiment.
- If exact numbers are unavailable, describe the direction of the tradeoff rather than inventing a benchmark.

---

# 7. Safe and unsafe phrasing examples

### Library adoption

**Unsafe:** “The library is used by every Elasticsearch pipeline at Netflix.”  
**Safe:** “I extracted the pattern into an internal library that was adopted by multiple indexing workflows.”  
**Needs Tristan:** how broad the adoption was and whether the company may be named.

### Reranking

**Unsafe:** “Production search used BGE reranking to improve relevance by 30%.”  
**Safe:** “The system included a hosted cross-encoder capable of reranking a bounded candidate set.”

### PageRank

**Unsafe:** “We calculated PageRank nightly and used it as a primary ranking signal.”  
**Safe:** “The search projection had room for graph-derived signals, including PageRank supplied by another process.”

### Last-known-good behavior

**Unsafe:** “Failed reads always fell back to the previous version.”  
**Safe:** “We experimented with both serving the last successful version and hiding a document after its latest read failed.”

### Full rebuilds

**Unsafe:** “Full rebuilds are better than incremental indexing.”  
**Safe:** “When a complete authoritative snapshot is available and affordable to rebuild, a fresh index plus alias cutover can be simpler and safer than mutating the live corpus.”

### Embedding quality

**Unsafe:** “Blending document and chunk vectors improved retrieval.”  
**Safe:** “One design blended local chunk meaning with document-level context; whether that helps should be evaluated against an unweighted baseline.”

---

# 8. Suggested fact-check workflow for each article

1. Draft only from verified facts and clearly labeled general theory.
2. Highlight every first-person implementation claim.
3. Send Tristan the smallest targeted question set from file 03 and this file.
4. Reconcile answers with the repository-derived notes.
5. Replace internal examples with synthetic ones.
6. Run a technical review for search/distributed-systems accuracy.
7. Run a confidentiality review.
8. Verify that current behavior, historical behavior, and present recommendation are not conflated.
9. Add links to Tristan's existing posts where the authoring agent sees thematic continuity.
