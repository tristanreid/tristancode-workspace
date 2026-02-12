# Entity Detection — Research Notes

Research for the planned blog series: **Entity Resolution** (see `DEVELOPMENT.md`).

---

## Overview

Entity detection (also called entity recognition or entity matching) is the problem of finding mentions of known entities in unstructured text. In the codebase, this powers a knowledge management system that scans documents (Google Docs, Presentations, PDFs, Slack threads, data documentation) and identifies which Netflix shows, employees, countries, talent, topics, and data assets are mentioned.

The approach is **dictionary-based** rather than ML-based: a curated catalog of entity names is loaded into a Trie, and the Trie is used to scan documents for exact and case-insensitive matches. This is fast, deterministic, and scales cleanly across a distributed Spark cluster.

---

## Important Notes
The notes in this file are meant to assist in the writing of the blog series. They reference codebases and library names like pcra-dse, cau-lib-core, knowledge-mgmt, etc. Those names should not be used in the blog series itself.

---

## Architecture: Two Systems, One Pipeline

Entity detection exists at two levels in the codebase:

### 1. Batch Pipeline (pcra-dse — Scala/Spark)

The batch pipeline runs as a scheduled Spark workflow that scans all documents in the knowledge management corpus.

**Workflow definition**: `repos/pcra-dse/workflows/knowledgemgmt_new/entity_resolution/km.entity_resolution.sch.yaml`

**DAG structure** (simplified):
```
AlternateTitleFrequencyCount
    → EntityScoreNetflixShow
    → EntityScoreNetflixLicensedShow
EntityScoreNetflixTalent (parallel)
EntityScoreNetflixEmployee (parallel)
EntityScoreAnalyticGenre (parallel)
EntityScoreDataTable (parallel)
EntityScoreTopic (parallel)
```

Jobs run with `run_strategy: parallel` — multiple entity types are scored concurrently.

**Pattern for each entity scoring job**:

1. **Load entity catalog** from SQL (e.g., `km.entity_netflix_show`)
2. **Build trie(s)** from entity search terms → IDs
3. **Broadcast** trie(s) to Spark executors
4. **Register UDF** that calls `trie.allMatches(text)`
5. **Scan documents** using `LATERAL VIEW explode(udf(text_column))` in Spark SQL
6. **Score matches** by field (title matches weighted 50× vs. body matches)
7. **Write results** to `km.entity_resolution` table

### 2. Real-Time Detection (cau-lib-core — Python/async)

The application-level system provides on-demand entity detection for interactive features.

**Key file**: `repos/cau-lib-core/src/cau_lib_core/netflix/entity_matching.py`

**Architecture**:
- `EntityTrie` wraps two `Trie[EntityMatch]` instances (case-sensitive + case-insensitive)
- `EntityCache` provides two-tier caching (in-memory + optional filesystem)
- `load_entities()` fetches entity catalogs from S3 or Lilyhammer (HTTP/mTLS proxy)
- `detect_entities(text, entity_type)` returns matches for a single type
- `detect_all_entity_types(text)` runs all types in parallel via `asyncio.gather`

---

## Entity Types

| Entity Type | ID Field | Source Table | Scoring Module |
|---|---|---|---|
| `netflix_show` | `show_title_id` | `km.entity_netflix_show` | `EntityScoreNetflixShow.scala` |
| `netflix_licensed_show` | `show_title_id` | `km.entity_netflix_licensed_show` | `EntityScoreNetflixLicensedShow.scala` |
| `talent` | `hitch_person_id` | `km.entity_talent` | `EntityScoreNetflixTalent.scala` |
| `netflix_employee` | `employee_id` | `km.entity_netflix_employee` | `EntityScoreNetflixEmployee.scala` |
| `country` | `country_iso_code` | — | — |
| `netflix_audience` | `audience_id` | — | — |
| `topic` | `id` | `km.topic` | `EntityScoreTopic.scala` |
| `analytic_genre` | — | `dse.ttl_analytic_genre_d` | `EntityScoreAnalyticGenre.scala` |
| `data_table` | — | warehouse metadata | `EntityScoreDataTable.scala` |

Each entity in the catalog has:
- `_km_entity_search` — the surface form(s) to match against (one or more search terms)
- `_km_entity_label` — human-readable display name
- `_km_entity_type` — entity type identifier

---

## The Scoring Model

Entity detection doesn't just find mentions — it **scores** them. The scoring model reveals how context and confidence are layered:

### Field weighting

From `EntityScoreNetflixShow.scala` (lines 163-168):
```sql
sum(
    if(field = 'title', 
        score * (50 * (1.0 + coalesce(talent_score, 0)))
        , 0)
    + if(field != 'title',
        score * (1.0 + coalesce(talent_score, 0))
        , 0)
) as score
```

Title matches are weighted **50×** higher than body matches, reflecting the intuition that a show name in a document's title is a much stronger signal than an incidental mention in the body.

### Likelihood (disambiguation)

From `EntityScoreNetflixShow.scala` (lines 17-19):
```sql
coalesce(
    log(1.0 + coalesce(model_relevance, 500000.0) / wiki_document_frequency) / 10.0
    , 1.0
) as likelihood
```

Each entity term gets a **likelihood score** based on how common the term is in Wikipedia. A show called "You" appears in nearly every Wikipedia article, so it gets a low likelihood; "Stranger Things" is much more distinctive. This is essentially an IDF (inverse document frequency) calculation.

### Case sensitivity as signal

In the `EntityTrie` (cau-lib-core), case-sensitive matches get **2× the likelihood** of case-insensitive matches:
```python
# entity_matching.py line 227
self.case_sensitive_trie.insert(description, EntityMatch(entity_id, 2.0 * likelihood))
```

Rationale: if someone writes "Squid Game" (capitalized) it's more likely to be the show than "squid game" in a casual context.

### Talent boosting

When a document mentions a talent (actor/director) who is associated with a show, the show's score is boosted by the talent score (see `doc_talent_title_matches` CTE in `EntityScoreNetflixShow.scala`). This captures the intuition that a document mentioning both "Millie Bobby Brown" and "Stranger Things" is more confidently about that show.

### Frequency-based filtering

`AlternateTitleFrequencyCount.scala` pre-computes how often each alternate title appears in the internal document corpus and in Wikipedia. Titles that are too common are filtered out of the case-insensitive trie to reduce false positives:
```sql
where 
( corpus_document_frequency < 8
  or corpus_ignore_case_document_frequency < 18
  or wiki_document_frequency < 6382
  or wiki_ignore_case_document_frequency < 20750
)
```

### Overlap resolution

When entity matches overlap in text, the `EntityTrie._resolve_overlaps()` method keeps the match with the highest likelihood. This handles cases like "The Crown" vs. "Crown" — the longer, more specific match wins if it has higher confidence.

---

## The Frontend: Query-Time Entity Parsing

The knowledge-mgmt React app (`repos/knowledge-mgmt`) provides the user-facing search interface. It uses a different approach for query-time entity detection:

**Token-based parsing** (`src/api/useKMQuery.tsx`):
- Query is split on spaces
- Tokens matching the pattern `keyword:signifier:id` are parsed as entity search strings
- Keywords: `about`, `by`, `mention`, `contributor`, `from`
- Signifiers: `country`, `talent`, `person`, `title`, `source`
- Example: `about:title:81593252` means "documents about Netflix show #81593252"

**Entity suggestions** (`src/api/useSearchSuggestions.ts`):
- Elasticsearch `match_phrase_prefix` on `_km_entity_search` field
- Returns entity labels and search terms for autocomplete

This is complementary to the Trie-based detection: the Trie finds entities *in* documents, while the query parser lets users search *for* entities.

---

## Blog Series: "Entity Detection: Finding What Matters in Text"

Skin: `graph`. 4 posts.

| # | Post | File | Status |
|---|------|------|--------|
| 1 | The "You" Problem — Why Entity Detection Is Harder Than Ctrl+F | `entity-detection-the-you-problem.md` | Written |
| 2 | Scoring Entity Matches — When Finding Isn't Enough | `entity-detection-scoring-matches.md` | Written |
| 3 | Entity Detection at Scale — The Broadcast Pattern | `entity-detection-at-scale.md` | Written |
| 4 | From Batch to Real-Time — Entity Detection in a Web App | `entity-detection-batch-to-realtime.md` | Written |

### Post 1: "The 'You' Problem — Why Entity Detection Is Harder Than Ctrl+F"

- The problem: you have a catalog of known entities and a pile of unstructured text — find the matches
- Why it's harder than `ctrl+F`: ambiguity ("You", "The Crown"), case sensitivity, partial matches, multiple surface forms for the same entity
- Approaches: dictionary-based (Trie), ML-based (NER), hybrid
- When dictionary-based wins: known, curated catalogs; high precision required; distributed systems where determinism matters
- The three hard problems: ambiguity, surface form variation, overlapping matches
- Preview of the scoring model as the solution

### Post 2: "Scoring Entity Matches — When Finding Isn't Enough"

- Why finding a match isn't enough — you need to know how confident you are
- The IDF-like likelihood model: common words get low scores, distinctive names get high scores
- Field weighting: title vs. body as context signal
- Case sensitivity as signal (dual-trie pattern, 2× confidence for case-sensitive matches)
- Talent/cross-entity corroboration boosting
- Frequency-based filtering (pre-compute term frequency, filter overly common terms)
- Overlap resolution: when matches compete for the same text span, highest-confidence wins
- Walk through the complete scoring pipeline

### Post 3: "Entity Detection at Scale — The Broadcast Pattern"

- The Spark broadcast pattern: build once, scan everywhere
- The complete entity detection DAG: multiple entity types processed in parallel
- The dual-trie pattern at scale: case-sensitive + case-insensitive tries broadcast together
- The tie-breaker pattern: merging entity data at insert time when multiple entities share a surface form
- Performance: scaling to millions of documents with hundreds of thousands of entity terms
- Cross-reference with the Trie series for the data structure deep-dive

### Post 4: "From Batch to Real-Time — Entity Detection in a Web App"

- The evolution: from Spark batch jobs to async Python with in-memory caching
- The same algorithm, different infrastructure: `EntityTrie` wrapping `Trie[T]`
- Caching strategies: in-memory for long-lived servers, filesystem for scripts
- Entity catalog lifecycle: remote storage → authenticated proxy → local cache → Trie
- Running all entity types in parallel with `asyncio.gather`
- The complementary approach: trie-based detection for documents, search-based lookup for queries

---

## Connections to Other Planned Series

- **Trie series**: Entity detection is the primary *application* of the Trie — the Trie series covers the data structure, this series covers its use
- **Mergeable Operations series**: The tie-breaker is a merge operation; broadcasting the trie is an example of "replicate read-only state to avoid coordination"
- **HLL series** (existing): Both HLL and entity detection involve scanning large datasets with compact, pre-built data structures
- **Hulu Data Platform series**: Entity detection is a form of data enrichment — similar in spirit to the pipeline monitoring and metadata extraction described in the Hulu series

---

## Source File Reference

| File | Key Content |
|---|---|
| `repos/pcra-dse/.../EntityScoreNetflixShow.scala` | Main show entity scoring: trie build, broadcast, UDF, scoring SQL |
| `repos/pcra-dse/.../EntityScoreNetflixLicensedShow.scala` | Licensed show scoring (same pattern) |
| `repos/pcra-dse/.../EntityScoreNetflixTalent.scala` | Talent scoring with tie-breaker for box office/wiki popularity |
| `repos/pcra-dse/.../EntityScoreNetflixEmployee.scala` | Employee name/ID matching |
| `repos/pcra-dse/.../EntityScoreTopic.scala` | Topic detection with scored terms |
| `repos/pcra-dse/.../EntityScoreAnalyticGenre.scala` | Genre description matching |
| `repos/pcra-dse/.../EntityScoreDataTable.scala` | Warehouse table name detection |
| `repos/pcra-dse/.../AlternateTitleFrequencyCount.scala` | Pre-computation: alternate titles → frequency + tie-breaker merge |
| `repos/pcra-dse/.../km.entity_resolution.sch.yaml` | Workflow DAG definition |
| `repos/pcra-dse/.../package.scala` | Shared types: `FieldEntityScore`, `TermFrequencyCount` |
| `repos/cau-lib-core/.../entity_matching.py` | Real-time: `EntityTrie`, `EntityCache`, `detect_entities`, `detect_all_entity_types` |
| `repos/cau-lib-core/.../core/data/trie.py` | The underlying `Trie[T]` used by `EntityTrie` |
| `repos/knowledge-mgmt/src/api/useKMQuery.tsx` | Query-time entity parsing (keyword:signifier:id) |
| `repos/knowledge-mgmt/src/api/esQueryHelpers.ts` | Elasticsearch entity suggestion queries |
| `repos/knowledge-mgmt/src/api/useSearchSuggestions.ts` | Entity autocomplete via `match_phrase_prefix` |
| `repos/knowledge-mgmt/src/types.ts` | `Entity`, `EntityScore`, `EntityEmployee`, `EntityTitle` types |
