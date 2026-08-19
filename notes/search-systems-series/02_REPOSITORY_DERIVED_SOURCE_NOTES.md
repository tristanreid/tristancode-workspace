# Repository-Derived Source Notes

**Private authoring material. Do not publish verbatim.**

This document gives a blog-authoring agent enough technical context to write informed drafts without direct repository access. Paths are retained for Tristan's later verification. Internal endpoints, credentials, and identifying data are intentionally omitted.

## 1. Scope and evidentiary limits

Two repositories were examined:

1. `pcra-dse`, a production data-workflow repository with a large knowledge-management subsystem and earlier analytical workflows;
2. `elasticsearch-ingest`, a Python library extracted from repeated warehouse-to-Elasticsearch jobs.

The code strongly supports writing about ingestion, transformation, indexing, graph and entity features, embeddings, and distributed batch processing. It provides less direct evidence about the final online query service. In particular:

- the exact production query DSL and field boosts were not found here;
- the complete user-facing ranking formula was not found here;
- PageRank is joined into the document index, but the current producer of the `doc_pagerank` table was not found in the repository snapshot;
- cross-encoder and relevant-passage services are present, but their exact integration in the application request path is not shown;
- relevance judgments, A/B tests, and production quality metrics are not represented sufficiently to quote results.

Articles may explain the principles these components illustrate, but should not invent online behavior or impact measurements.

---

# Part I: Knowledge-management and search pipeline

## 2. High-level workflow

The primary daily workflow is declared in:

- `workflows/knowledgemgmt_new/knowledgemgmt.sch.yaml`

Its main dependency chain is approximately:

```text
application/curated data movement
        ↓
entity tables and topic tables
        ↓
source normalization
        ↓
link extraction and canonicalization
        ↓
document acquisition and parsing
        ↓
graph mappings and document metadata
        ↓
entity resolution
        ↓
Elasticsearch document/entity/topic indexes
        ↓
reports and metrics
```

The orchestration is not one monolithic Spark job. It combines:

- Spark SQL jobs for joins, aggregation, model construction, and table writes;
- PySpark jobs for UDF-heavy transformations;
- containerized Python jobs for external APIs, iterative processing, PDF parsing, and GPU models;
- Scala/Spark jobs for performance-sensitive trie matching and entity scoring;
- Elasticsearch-Hadoop for distributed index writes;
- a separate Python client for index creation, settings, aliases, and cleanup.

That polyglot shape is itself a useful lesson: the architecture chose execution environments according to work type, but each environment added packaging and compatibility obligations.

## 3. Corpus sources

The pipeline's source layer is broader than “crawl a document store.” Source records include or historically included categories such as:

- curated research or project records;
- strategy and quarterly-review documents;
- experiment records and related artifacts;
- newsletters and manually submitted links;
- document-store folders and shared documents;
- dashboards and application pages;
- topic pages and curated top resources;
- internal manuals and code-hosting links;
- summarized discussion threads and Q&A records;
- data-warehouse tables and columns.

The public-safe abstraction is:

> Structured systems identify authoritative starting points. Those sources contain URLs to less structured resources. Documents then contain more links, creating a bounded discovery graph.

Relevant files:

- `workflows/knowledgemgmt_new/source/`
- `workflows/knowledgemgmt_new/link/ss.link_candidates.sql`

`ss.link_candidates.sql` normalizes many source-specific records into a common shape with fields conceptually equivalent to:

```text
source_id
source_type
source_field
text_or_url_containing_links
index_target
```

This is a significant modeling choice. Source-specific complexity is pushed to the boundary; downstream link processing receives a common contract.

## 4. Link extraction and canonicalization

The link workflow is defined in:

- `workflows/knowledgemgmt_new/link/km_link.sch.yaml`

Its stages are:

1. union source-specific link candidates;
2. extract URL-like strings;
3. resolve known redirect forms and short links;
4. classify the resource type;
5. derive a stable resource ID where possible;
6. apply exclusions;
7. write a canonical edge table.

### 4.1 URL extraction

`kg.link_extract.py` reads candidate text, calls a shared `find_urls` function, deduplicates URLs within a record, resolves certain wrapper redirects, and records whether a valid URL was found.

Shared logic in `km-python/shared/km_utils.py`:

- searches strings with a combined URL pattern;
- removes non-printable characters;
- strips trailing punctuation such as periods, commas, semicolons, closing brackets, quotes, and similar characters;
- checks domains or recognized short-link forms;
- can recursively inspect arbitrary dictionaries and lists for URL-containing strings.

The history records repeated fixes for:

- URLs with no whitespace between them and surrounding text;
- trailing punctuation;
- links hidden behind redirect wrappers;
- case differences in short-link forms;
- alternate folder and document URL forms;
- malformed or unsupported domains.

Public lesson: a one-character parsing error can create duplicate identities, broken graph edges, failed fetches, and apparently bad relevance downstream.

### 4.2 Short-link resolution

`kg.go_links.py` demonstrates a generic short-link resolver pattern:

- extract the alias from several textual and URL forms;
- cache repeated aliases;
- rate-limit calls to the resolver service;
- follow a bounded number of short-link-to-short-link redirects;
- stop after a small maximum to avoid loops;
- persist both the resolution and its status.

The specific internal short-link service must be replaced publicly with a generic example such as `go/design-doc`.

### 4.3 Resource classification and identity

`sp.link.py` joins extracted links to resolved redirects, applies exclusions, detects resource type, and derives a canonical document ID.

Identity rules differ by resource:

- hosted documents often have an ID embedded after a known path component;
- dashboards may require normalization to a workbook or application identifier;
- web applications may use a canonical host-derived ID;
- repository links may retain a full file URL because repository-level identity is too coarse;
- query parameters and edit/view suffixes are removed for some document types.

This is evidence for the thesis “identity is domain-specific; URL normalization alone is not enough.”

## 5. Document acquisition and incremental processing

The document workflow is defined in:

- `workflows/knowledgemgmt_new/doc/km.doc.sch.yaml`

Its major stages are:

```text
recreate candidate queue
    ↓
select documents to inspect
    ↓
fetch raw contents and metadata in batches
    ↓
select current raw version
    ↓
parse PDFs
    ↓
preprocess common representation
    ↓
produce plain text and structure-preserving Markdown
    ↓
update last-checked metadata
```

### 5.1 Candidate selection

`ss.doc_process_list.sql` builds a bounded daily work list. Candidate classes include:

- previously unseen linked documents;
- documents whose last fetch failed;
- documents with observed edit activity after their stored modification time;
- documents that have gone the longest without being checked.

The current script uses explicit per-class limits rather than trying to fetch the entire corpus every day. It also checks that update candidates remain near an accepted source in the graph.

The queue is partitioned into groups of roughly a few thousand records. The corresponding Python acquisition loop repeatedly takes the lowest partition, removes that queue partition, and processes the candidate set.

This implementation creates useful discussion points:

- API capacity and compute are finite, so freshness is a prioritization problem;
- new, failed, recently edited, and merely old documents deserve different priority;
- queue mutation order determines at-most-once versus at-least-once behavior;
- a batch table can act as a simple work queue, but recovery semantics must be explicit;
- “restartable” does not mean “exactly once.”

Do not claim the current workflow is fully restart-safe: the workflow itself is tagged `restart_unsafe`, and delete-before-processing has a loss window if the worker dies after claiming work.

### 5.2 Raw acquisition

`kg.doc_raw.py` fetches documents according to type:

- document and presentation APIs for structured content;
- drive metadata for title, MIME type, timestamps, owners, and editor information;
- comments when available;
- direct downloads for PDFs;
- shortcut resolution before fetching a target;
- base64 storage for binary PDF content.

Each attempt records fields conceptually like:

```text
document_id
original_url
MIME_type
resource_type
title
raw_contents
raw_metadata
raw_comments
load_status
error_log
load_id
load_date
```

Important resilience behavior:

- unsupported MIME types are recorded as errors rather than silently parsed;
- comment failures can be separated from document failures;
- PDF responses are checked for the PDF file signature rather than trusted solely from the URL;
- external requests use timeouts;
- batches are persisted periodically rather than retained until the entire run completes.

### 5.3 “Latest attempt” versus “last successful version”

This policy changed historically and must be represented accurately.

- A March 2, 2023 change selected the latest **successful** raw version so a failed read would leave the prior content available.
- A March 30, 2023 change deliberately changed the policy: if the latest attempt failed, the document was excluded from the current corpus rather than falling back indefinitely.
- The current `ss.doc_raw_latest.sql` selects the latest attempt and downstream preprocessing includes only successful records. Therefore a latest failure excludes the document from the rebuilt parsed corpus.

This is excellent material for an article because neither choice is universally correct:

- serving last-known-good content favors availability but risks serving content that was deleted or became unauthorized;
- excluding on a failed latest read favors conservative trust but reduces availability because transient errors remove content.

An article should describe this as a policy tradeoff and ask Tristan why the policy changed before supplying a first-person narrative.

## 6. Parsing heterogeneous documents

### 6.1 Common preprocessing

`ss.doc_preprocess.sql` creates a common input for parsers:

- successful latest raw records only;
- parsed PDF text substituted for PDF binary content;
- tab characters normalized;
- low-content and transcript-like records filtered;
- manuals represented as another text-bearing document type.

### 6.2 Plain-text parsing

`sp.doc.py` handles:

- document paragraphs, links, mentions, nested tables, and tables of contents;
- presentations by walking slide shapes and text runs;
- Unicode normalization, including multiple visually similar spaces, dashes, and quote characters;
- surrogate removal;
- metadata extraction for created/modified times, owners, editors, and departed-owner indicators;
- comment authors and timestamps;
- trailing URL punctuation cleanup.

The key lesson is that extraction is semantic transformation, not merely file decoding. Rich document APIs expose structure that can be preserved or destroyed.

### 6.3 Markdown parsing

`sp.doc_markdown.py` creates a parallel, structure-preserving representation:

- named heading styles become Markdown headings;
- bullets preserve nesting;
- links remain Markdown links;
- section breaks are represented;
- tables are emitted in an HTML-like table form that can later be chunked without losing cell boundaries;
- mentions are collected separately.

This representation later supports structure-aware chunking for embeddings. It is a strong concrete argument for introducing an intermediate representation instead of immediately flattening everything to plain text.

### 6.4 PDFs

`kg.doc_pdf_parsed.py` illustrates defensive PDF processing:

- process only bounded-size records that begin with the expected base64-encoded PDF signature;
- try one parser first;
- detect suspicious extraction by examining average token/string lengths;
- fall back to a second parser;
- choose the more plausible output when both are imperfect;
- normalize problematic Unicode;
- process in bounded batches.

The heuristic is not a general quality metric; it is evidence that PDF extraction needs validation and fallback. Public examples should describe two generic parsers rather than internal packaging details.

## 7. Graph construction and corpus boundaries

### 7.1 Source-to-document and document-to-document edges

The pipeline distinguishes:

- links from authoritative structured sources to resources;
- links from one document to another;
- parent and child relationships;
- direct versus indirect source attribution.

`ss.doc_source_map.sql` maps canonical document IDs back to the structured sources that mentioned them.

`ss.link_relation.sql` constructs parent and child arrays from unique edges while excluding self-links.

### 7.2 Bounded shortest-generation mapping

`kg.link_shortest_generation_map.py` constructs a bounded breadth-first projection:

1. generation 0 contains documents directly associated with a non-document source;
2. each later generation adds previously unmapped documents linked from the prior generation;
3. the loop stops after a small fixed number of generations;
4. the stored record contains both generation number and one path back to a source.

`ss.doc_gate.sql` includes documents only when they are within a maximum accepted generation from a source.

This serves at least three purposes:

- corpus discovery;
- a trust or provenance boundary;
- a ranking/metadata feature representing source distance.

The pipeline also keeps historical snapshots of the generation map, enabling analysis of corpus change over time.

### 7.3 Link-derived scores

`ss.doc_weighted_linkers.sql` computes a simple authority-like score:

```text
sum over incoming/source links of 1 / (1 + source_generation)
```

A direct authoritative source contributes more than a link from a document farther from a source. This is deliberately simpler and more interpretable than a global graph algorithm.

The Elasticsearch load also joins a PageRank field from `km.doc_pagerank`. The table's producer is absent from this repository snapshot, so the authoring agent should not describe how that PageRank was calculated without clarification.

## 8. Metadata enrichment and search document construction

`workflows/knowledgemgmt_new/doc_mappings/km.doc_mappings.sch.yaml` orchestrates graph and metadata jobs after document parsing.

`ss.doc_metadata.sql` merges information from:

- parsed document title, URL, owners, and collaborators;
- structured source descriptions and project metadata;
- curated resource overrides;
- comments and mentions;
- PDF and scholarly-document metadata;
- title/entity reflections;
- exclusions;
- source tags, business areas, countries, and dates.

The final Elasticsearch staging table in `h2es7/h2es.documents.sql` denormalizes many signal families into each document:

- stable ID, canonical URL, resource/MIME type;
- title and a separate spelling-suggestion title field;
- descriptions, summaries, keywords, and source types;
- authors, collaborators, owners, editors, mentions, commenters, and organizational metadata;
- created, modified, added, and last-checked times;
- source details and source count;
- incoming and outgoing link details and counts;
- weighted linker score, graph generation, and path to source;
- PageRank fields when available;
- entity match arrays by entity type;
- document text;
- embeddings and a two-dimensional projection in some versions;
- document-view history and recent/all-time usage aggregates.

This table is a vivid example of a search index as a denormalized read model. It combines truth from many systems because query-time joins would be too slow or unavailable.

The text field is truncated differently based on graph distance in one implementation: documents closer to authoritative sources can contribute substantially more text than more distant documents. This combines trust policy with index-size control.

## 9. Elasticsearch mappings represented in the repository

A document index template in `h2es7/mappings/es7.index.mappings.settings.txt` includes:

- English analysis for title and text fields;
- a shingle analyzer for a “did you mean” title field;
- nested mappings for source records and entity-score arrays;
- keyword mappings for exact categorical fields;
- a 768-dimensional approximate-nearest-neighbor vector field using cosine similarity;
- an index-level k-nearest-neighbor setting.

Important implications for posts:

- title/body analysis was intentional rather than dynamic;
- suggestion text was indexed differently from ordinary title search;
- entity score arrays required `nested` semantics so entity IDs stayed associated with their scores;
- exact fields and analyzed fields served different query needs;
- vector support was added to a pre-existing lexical/document index rather than replacing the whole corpus model.

Do not state that every current index uses this exact template. The repository also points to a separate canonical template repository, and versions may differ.

## 10. Entity resolution

Entity resolution is one of the richest case studies in the codebase.

### 10.1 Entity types

The workflow includes deterministic or heuristic matching for categories such as:

- countries or regions;
- employees;
- talent/people;
- titles or shows;
- licensed titles;
- analytic genres;
- audiences;
- warehouse tables and columns;
- topics.

### 10.2 Generic trie

A generic trie exists in both shared Python and Scala code. Its matching behavior:

- associates arbitrary values with phrases;
- optionally ignores case;
- starts matching only at non-alphanumeric boundaries;
- accepts a match only when the following character is also a boundary;
- can return all matches in a string;
- supports a tie-breaker when the same phrase maps to multiple values.

The trie is constructed centrally, broadcast to Spark executors, and used inside UDFs. This avoids scanning every entity phrase independently for every document.

### 10.3 Field-aware evidence

Country matching provides a simple example:

- a title match receives a much larger weight than a body-text match;
- an explicitly curated country field receives an intermediate/high weight;
- body occurrences receive the base weight;
- matches are collected as structured arrays containing field, entity ID, and count;
- per-entity scores are aggregated and normalized for the document.

The weights are heuristic evidence, not a calibrated probability. That distinction should be explicit in an article.

### 10.4 Ambiguity and corpus frequency

Title matching computes phrase/document frequencies in both an internal corpus and a large external text corpus, with case-sensitive and case-insensitive variants.

The title-entity scorer uses rarity and other relevance values to determine how much evidence a title phrase provides. Common phrases are less trustworthy, especially under case-insensitive matching. Exact title or season identifiers can receive strong deterministic evidence.

Additional evidence can include:

- a related person entity mentioned in the same document;
- a structured source that explicitly identifies a title;
- manually included or excluded entity/document pairs.

This is an excellent first-principles story: entity resolution combines lexical matching, inverse-frequency intuition, field evidence, cross-entity relationships, and human overrides.

### 10.5 Explicit exclusions

Entity resolution supports a curated exclusion table for false-positive entity/document pairs. This should be framed as a normal production capability, not an embarrassment: high-value ambiguity often needs auditable human correction.

## 11. Topics, taxonomies, and curated resources

`topics/sp.topic.py` merges:

- curated topic records;
- preferred terms and synonyms;
- acronyms;
- entity-derived aliases;
- ownership and communication metadata;
- top resources and other resource lists;
- descriptions and notes;
- publication/deprecation state.

The search-term array removes nulls, deduplicates values, strips line breaks, and explicitly excludes a few dangerously common short codes.

This illustrates a hybrid information architecture:

- a curated taxonomy supplies stable names, ownership, descriptions, and preferred resources;
- entity data supplies alternate names;
- vector embeddings supply semantic similarity;
- search documents expose all of these as complementary fields.

## 12. Embeddings and passage indexes

### 12.1 Topic vectors

`topics/kg.topic_vector_flag.py` generates topic embeddings from:

- the topic description;
- aliases/entity search terms;
- related descriptive text;
- curated “top resource” documents.

Long resource documents are split by prioritized delimiters under the model's token limit. Per-document embeddings are averaged with extra weight on the first chunk, and the topic's own introductory text receives significantly more weight than each supporting document.

This provides material for a nuanced post about embedding composition: weighting can encode useful prior beliefs, but it also makes one opaque vector represent several distinct evidence sources.

### 12.2 Document and chunk vectors

`h2es7/kg.doc_flag_embeddings.py` uses a sentence-transformer model to create:

- one document embedding;
- multiple section/chunk embeddings;
- chunk text that preserves the Markdown header hierarchy;
- special handling for tables so headers stay with rows;
- a weighted chunk vector combining mostly local chunk meaning with some document-level context.

The chunker:

1. splits the Markdown document into sections at headings and tables;
2. maintains a stack of heading levels;
3. prefixes chunks with the full heading path;
4. recursively splits over paragraph, newline, sentence, punctuation, and whitespace boundaries to meet token limits;
5. merges small adjacent pieces when possible;
6. uses table-aware row grouping;
7. discards very short chunks.

The generated data is loaded into a chunk-level Elasticsearch index with document metadata repeated on each chunk. A parallel unweighted form also existed for comparison.

This is strong evidence for these claims:

- chunking is a semantic transformation, not plumbing;
- document-level context and local passage meaning can be blended;
- structured intermediate formats improve chunk quality;
- document and chunk indexes support different retrieval needs.

It does **not** prove that the weighted vectors improved production quality. Ask Tristan whether comparative evaluation exists before making an outcome claim.

### 12.3 Q&A vectors

`h2es7/kg.slack_qa_embeddings.py` creates embeddings from summarized questions, stores the associated answer summary and thread metadata, and later loads the Q&A records into Elasticsearch.

The key retrieval design is asymmetric:

- embed what the user is likely to ask;
- retrieve a record that contains both the question representation and answer/provenance.

### 12.4 Cross-encoder reranking

`metaflows/crossencoder_metaflow.py` hosts a GPU-backed cross-encoder service. Given a query and candidate strings, it:

- constructs query/candidate pairs;
- tokenizes and truncates them;
- scores every pair with a sequence-classification model;
- returns the top `k` candidate strings and scores.

A related `relevant_sentences_metaflow.py` repeatedly narrows long text:

- split into coarse chunks;
- score chunks against the query in bounded batches;
- retain the best chunk from each batch;
- repeat until one coarse region remains;
- split that region into smaller chunks and return the best one.

These components support discussion of multi-stage retrieval. They do not establish the exact production call graph or latency budget.

---

# Part II: `elasticsearch-ingest` library

## 13. Why the library exists

The package's stated purpose is loading warehouse query results into Elasticsearch with zero-downtime alias cutovers. It supports two usage levels:

1. a streamlined wrapper driven by workflow parameters;
2. a lower-level function for direct control.

The repository history begins in February 2025 in its current standalone form, but the ETL repository contains older versions of the underlying pattern. Tagged releases in the local clone run from `v1.0.0` through `v2.1.4`.

The user states that the library is broadly used internally. The examined ETL repository alone imports it for many indexes, including documents, entities, topics, manuals, onboarding corpora, data-documentation search entities, warehouse metadata, leaderboard data, and discussion/Q&A data.

## 14. Core load algorithm

The principal function is `load_sql_to_es` in `elasticsearch_ingest/es_load.py`.

Conceptual pseudocode:

```python
def load_sql_to_search(sql, alias, mappings, settings, options):
    spark = configured_spark_session(options.spark)
    run_all_setup_statements(sql)
    dataframe = spark.sql(final_statement(sql))

    if options.large_or_multi_part:
        dataframe = dataframe.repartition(options.partition_count)

    physical_index = timestamped_name(alias)
    client.create_index(physical_index, mappings, ingest_settings)

    dataframe.write_with_connector(
        target=physical_index,
        id_field=options.id_field,
        write_options=options.connector,
    )

    client.restore_search_settings(physical_index)
    client.atomic_alias_update(remove_old=True, add_new=True)
    client.delete_unretained_old_indexes()
```

Specific implementation behavior:

- SQL text may contain multiple semicolon-separated statements; all but the last are executed for side effects, and the final statement becomes the DataFrame.
- A default physical name is the alias plus an `_idx_` marker and timestamp.
- A deterministic ID field can be passed to the Elasticsearch-Hadoop connector.
- “Large” or multi-part loads repartition the DataFrame to a fixed high partition count in the current implementation.
- A multi-part mode uses upsert behavior and appends to an existing target rather than rotating an alias after each piece.
- mappings and settings are applied when creating a fresh index.
- additional Spark and connector options provide escape hatches.

## 15. Ingest and search settings

The current implementation has a built-in ingest phase with choices such as:

- compression enabled;
- refresh disabled;
- replicas set to zero;
- a larger translog flush threshold;
- asynchronous translog durability;
- a default shard count;
- soft deletes disabled in the historical cluster-specific template.

After the write, it changes to search-oriented settings including:

- replicas restored to a nonzero value;
- a finite refresh interval.

These are historical/internal defaults, not universal recommendations. A public post should explain the general principle:

> During a controlled rebuild, reduce work whose only purpose is concurrent search; after loading, restore the redundancy and visibility behavior required for serving.

It should also explain the risk: with no replicas and relaxed durability, a node failure during loading may require rebuilding the new index. That can be acceptable only because the old aliased index remains available.

## 16. Alias management

`elasticsearch_ingest/alias_mgmt.py` implements:

- timestamped physical index naming;
- validation that the new physical index exists;
- discovery of the current physical index carrying the logical alias;
- one atomic alias update request containing remove and add actions;
- optional preservation of the previously active physical index;
- deletion of older indexes matching the alias's naming pattern;
- creation of a logical alias over several independently built indexes.

Important nuance:

- the alias update is atomic;
- the complete pipeline is not a transaction;
- index creation, distributed writes, settings restoration, validation, alias cutover, and deletion are separate effects;
- cleanup patterns depend on trustworthy index naming;
- preserving the immediately previous index creates a rollback window;
- multi-index aliases require field compatibility and coordinated lifecycle handling.

## 17. Streamlined interface

`elasticsearch_ingest/common_functions.py` parses workflow parameters for:

- cluster and environment;
- target alias;
- logical-to-physical table mappings.

A caller can write approximately:

```python
from elasticsearch_ingest.common_functions import es_load, get_table

es_load(f"SELECT * FROM {get_table('input')}")
```

The wrapper derives connection configuration, creates a default template, merges mapping/settings overrides, prints the resulting template, and delegates to the lower-level load function. It also exposes helpers for:

- edge n-gram autocomplete mappings;
- lowercase keyword normalizers;
- recursive template overrides.

The design lesson is stronger than the exact API:

- put the common path behind a tiny interface;
- keep environment and table wiring in the workflow control plane;
- preserve a lower-level API and pass-through options for exceptional workloads.

## 18. Caveats in the library snapshot

These are source-review notes, not necessarily blog material:

- The README demonstrates version `2.1.1`, tags reach `2.1.4`, and some production workflows still reference `1.2.0`; version statements need context.
- Current package requirements include Python 3.10+, PySpark 3.4.2, and Elasticsearch client 7.10.1, while examined workflows use Spark 3.3 plus a 7.17.x connector JAR. This underscores that client, connector, Spark, and server versions are separate compatibility axes.
- Unit tests in the standalone repository are currently minimal. Do not claim comprehensive automated coverage.
- The streamlined module parses command-line arguments at import time. Treat this as current implementation detail, not an exemplary universal pattern.
- Fixed defaults such as shard count and repartition count may encode one environment's history. A platform post should discuss when safe defaults become hidden assumptions.

---

# Part III: Distributed analytical systems and OLAP background

## 19. Product Insights and Druid workflows

The repository includes earlier analytical pipelines that produce warehouse aggregates and ingest them into Druid-like OLAP serving systems.

Relevant areas include:

- `workflows/productinsights/`
- `workflows/launchpad/`
- older archived playback and engagement workflows

The architecture commonly looks like:

```text
large event/fact tables
      ↓ Spark SQL
partitioned daily or rolling aggregates
      ↓ additional dimensional projection
Druid ingestion table
      ↓ Hadoop/Druid indexing job
interactive multidimensional datasource
```

This supports several architectural comparisons with search:

- both systems perform expensive batch work to make interactive reads fast;
- OLAP projects measures and dimensions for filtering and aggregation;
- search projects terms, fields, graph features, and vectors for candidate retrieval and ranking;
- both require deliberate partition/segment/index lifecycle management;
- both trade storage and rebuild complexity for low-latency serving.

## 20. Approximate aggregation and grain

A Launchpad workflow creates HyperLogLog sketches of account IDs grouped by dimensions and later configures Druid to merge those sketches.

The corresponding README asks an important semantic question: should a distribution sketch represent raw sessions, accounts, or daily totals per account? The sketch algorithm can be correct while answering the wrong business question if the input grain is wrong.

Strong post thesis:

> Approximation error is often smaller than semantic error. Before choosing sketch parameters, define what one observation means.

## 21. Partitioning and batch ingestion

The analytical workflows show concerns such as:

- selecting a recent available source partition when the exact date is unavailable;
- partition pruning;
- bucketing joins by account ID;
- coalescing output files;
- controlling Druid target partition size;
- batching date ranges for ingestion;
- marking old segments unused before deletion;
- managing late-arriving data and backfills;
- allocating reducer/executor memory;
- tuning ordering and file size for downstream ingest.

The Git history reinforces these as repeated operational lessons, with changes involving OOMs, executor memory, skew, coalescing, late dependencies, delayed playback data, and backfill-specific settings.

## 22. Spark/Scala choices

The knowledge-management Scala project targets Scala 2.12 and a Spark 3.3 line. It packages performance-sensitive jobs and UDFs, including trie-based entity matching and n-gram frequency computation.

This creates a grounded comparison:

- native Spark SQL gives the optimizer the most visibility;
- Python UDFs are easy to author but pay serialization and optimization costs;
- broadcasting a bounded Python data structure can still work well;
- Scala is appropriate when a hot UDF or custom structure must run inside the JVM;
- collecting and broadcasting a dictionary is elegant only while the dictionary remains bounded;
- packaging, JDK, Scala, Spark, connector, and Python upgrades all become part of operational correctness.

---

# Part IV: Evolution and recurring lessons

## 23. Evolution visible in the history

A simplified chronology:

### 2020–2021: analytical pipelines

- scheduled Spark/Hive transformations;
- Druid ingestion and segment lifecycle;
- partition pruning, date semantics, memory tuning, backfills;
- approximate sketches and multidimensional analytical models.

### 2022: knowledge-management refactor

- normalized sources and link candidates;
- document processing lists;
- link relations and bounded source distance;
- metadata enrichment;
- entity resolution;
- Elasticsearch mappings and index loads.

### 2023: hardening and richer retrieval

- URL and redirect edge cases;
- stale-document scheduling;
- source distance and weighted links;
- suggestion analyzers;
- PDF pipeline and fallback parsers;
- Spark 3.3 migration;
- early vector fields and topic/document stores;
- richer document Markdown.

### 2024: semantic retrieval and broader corpora

- document and chunk embeddings;
- structure-aware chunking;
- GPU execution;
- topic vectors;
- Q&A embeddings;
- cross-encoder and relevant-sentence services;
- more entity types and onboarding/manual corpora;
- Python and model dependency upgrades.

### 2025: library extraction and newer data-documentation workflows

- standalone `elasticsearch-ingest` package;
- smoother workflow/YAML interface;
- explicit mappings/settings parameters;
- shared ingest/search tuning;
- broader search indexes for warehouse metadata and data documentation.

This chronology can anchor a retrospective post: the system did not move from “bad lexical search” to “good AI search.” It accumulated layers—identity, structure, metadata, graph, entities, lexical analysis, vectors, and reranking—each solving a different problem.

## 24. Repeated failure categories

The history offers a natural taxonomy of lessons:

### Identity failures

- duplicate aliases or resource IDs;
- alternate URL forms;
- redirects and short-link chains;
- dashboards with several URLs;
- the same ID used at different grains.

### Parsing failures

- Unicode lookalikes;
- URLs touching punctuation;
- nested tables;
- PDFs that claim to be PDFs but are not;
- parser output that is technically nonempty but nonsensical;
- comments failing while the document succeeds.

### Distributed-data failures

- OOMs;
- too many or too few partitions;
- skew;
- small files;
- unnecessary full-corpus work;
- collecting too much on the driver;
- backfills behaving differently from daily runs.

### Search-schema failures

- mappings applied too late;
- object arrays needing nested semantics;
- duplicate documents from joins;
- exact and analyzed fields serving different needs;
- connector and server version mismatch.

### Freshness and policy failures

- documents never rechecked;
- inaccessible documents remaining visible versus transient failures removing them;
- late source partitions;
- “latest” meaning attempt time, event time, snapshot time, or modification time.

### Dependency failures

- Python runtime upgrades;
- Spark upgrades;
- JAR and client compatibility;
- packages installed dynamically in jobs;
- GPU/model dependencies;
- workflow type and execution-environment differences.

## 25. Best case-study assets

The most distinctive stories available from the repositories are:

1. **An index as a derived projection** — one Elasticsearch document assembled from many warehouse and graph tables.
2. **Versioned full rebuilds** — immutable physical index, atomic logical alias, previous-version retention.
3. **URL identity** — resource-specific canonicalization plus redirect handling.
4. **Bounded graph discovery** — authoritative roots, iterative link expansion, shortest source generation, and a corpus gate.
5. **Freshness as scheduling** — bounded daily work across new, failed, edited, and long-unchecked documents.
6. **Policy after read failure** — last-known-good versus exclusion of latest failure.
7. **Structure-preserving parsing** — Markdown hierarchy and table handling used later for chunking.
8. **Deterministic entity resolution** — trie matching, boundary handling, corpus frequency, field weights, cross-entity evidence, and human overrides.
9. **Document plus chunk vectors** — two retrieval grains and a weighted local/global representation.
10. **Question-oriented Q&A embeddings** — retrieve by a question representation, return answer and provenance.
11. **Candidate generation plus cross-encoder reranking** — distinct performance and quality roles.
12. **OLAP/search unification** — both are precomputed serving projections over warehouse truth.
13. **Library extraction** — repeated code becomes a paved road with safe defaults and escape hatches.

These should be preferred over generic industry examples because they reflect actual design work while remaining easy to anonymize.
