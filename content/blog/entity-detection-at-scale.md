---
title: "Entity Detection at Scale — The Broadcast Pattern"
description: "How to scan 10 million documents for 100,000 entity names across 8 entity types — all in parallel on a Spark cluster."
weight: 30
series: "Entity Detection: Finding What Matters in Text"
series_weight: 30
skin: graph
---

In [Part 2](/blog/entity-detection-scoring-matches/), we built a scoring model that turns ambiguous string matches into confident entity annotations. Distinctiveness, case sensitivity, field weighting, corroboration — five signals that layer together to solve the "You" problem.

But we built it for one document at a time. In production, you have:

- **10 million documents** — memos, reports, presentations, messages
- **100,000+ entity names** — across shows, talent, employees, countries, topics, genres, and more
- **8 entity types** — each with its own catalog, its own scoring logic, and its own tries
- **A daily refresh** — new documents arrive, catalogs update, everything needs re-scoring

This is a distributed computing problem. And it's one that maps beautifully onto Apache Spark.

We covered the [mechanics of broadcasting a trie in Spark](/blog/trie-broadcasting-in-spark/) in the Trie series — how to serialize a trie, ship it to every executor, and register a UDF that scans text. This post is about the layer above that: the **entity detection system architecture** that orchestrates the entire pipeline.

---

## Not One Trie — Many Tries

The first thing that changes at scale is that you don't have a single trie. You have many.

Each entity type has its own catalog, its own scoring rules, and its own pair of tries (case-sensitive and case-insensitive). Shows have 100,000 names with Wikipedia-derived distinctiveness scores. Talent have 200,000 names with box-office popularity. Employees have 50,000 names. Countries have a few hundred. Topics have a few thousand weighted terms.

Each entity type is scored independently because the scoring logic differs:

| Entity Type | Catalog Size | Scoring Strategy |
|:---|---:|:---|
| Shows | ~100,000 names | Distinctiveness + field weight + talent boost |
| Licensed Shows | ~80,000 names | Same as shows, separate catalog |
| Talent | ~200,000 names | Box-office popularity as tie-breaker |
| Employees | ~50,000 names | Exact match preferred, no distinctiveness |
| Countries | ~500 names | High distinctiveness by default |
| Topics | ~5,000 terms | Scored terms with manual curation weights |
| Genres | ~2,000 descriptions | Description-level matching |
| Data Assets | ~30,000 names | Table/column name matching |

Building one massive trie with all entity types mixed together would be simpler, but it creates problems. Scoring logic is entity-type-specific — a talent name and a show name that happen to be the same string ("Selena," say) need different scoring and different disambiguation. Keeping them separate means each scoring job can apply its own rules cleanly.

---

## The Pipeline DAG

The entity detection pipeline isn't a single job — it's a **directed acyclic graph** (DAG) of jobs, some sequential and some parallel:

```
┌─────────────────────────────┐
│  Frequency Pre-Computation  │  ← Count term frequencies across corpus + Wikipedia
└──────────┬──────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────────┐ ┌─────────┐ ┌──────────┐ ┌───────┐ ┌───────┐ ┌──────┐
│  Shows  │ │ Licensed    │ │ Talent  │ │Employees │ │Topics │ │Genres │ │Data  │
│         │ │ Shows       │ │         │ │          │ │       │ │       │ │Assets│
└────┬────┘ └──────┬──────┘ └────┬────┘ └────┬─────┘ └───┬───┘ └───┬───┘ └──┬───┘
     │             │             │            │           │         │        │
     └──────┬──────┴──────┬──────┴────┬───────┴─────┬─────┴────┬────┴────┬───┘
            ▼                                                            
     ┌──────────────────┐
     │  Merge Results   │  ← Union all entity mentions into one table
     └──────────────────┘
```

The frequency pre-computation runs first because the show and licensed-show scoring jobs depend on it — they need to know which terms to exclude from the case-insensitive trie. The remaining entity types don't need frequency data, so they run in parallel with the show jobs.

All seven scoring jobs run with a **parallel execution strategy**. On a Spark cluster, this means they're submitted as independent jobs that share cluster resources. A typical run processes all entity types in the time it takes to process the single largest one (usually shows or talent).

---

## Step 1: Frequency Pre-Computation

Before building the show trie, you need to know which terms are too common to search for. The frequency pre-computation job counts how often each entity search term appears in two corpora:

1. **Your own document corpus** — how often does "Dark" appear across your 10 million documents?
2. **Wikipedia** — how often does "Dark" appear across all English Wikipedia articles?

```python
# Pseudo-code for frequency pre-computation
entity_terms = spark.read.table("entity_catalog") \
    .select("search_term", "entity_id") \
    .distinct()

# Count corpus occurrences
corpus_freq = (
    documents
    .crossJoin(broadcast(entity_terms))
    .filter(col("text").contains(col("search_term")))
    .groupBy("search_term")
    .agg(
        countDistinct("doc_id").alias("corpus_doc_frequency"),
    )
)

# Join with pre-computed Wikipedia frequencies
term_frequencies = corpus_freq.join(
    wiki_frequencies, on="search_term", how="left"
)
```

The output is a table mapping each search term to its frequency in both corpora. This feeds into the trie-building step, where the pre-filtering logic from [Part 2](/blog/entity-detection-scoring-matches/) decides which terms make it into the case-insensitive trie.

This pre-computation is moderately expensive — it touches every document in the corpus. But it only needs to run when the entity catalog changes significantly, not on every scoring run.

---

## Step 2: Build and Broadcast the Dual Tries

Each entity scoring job follows the same pattern:

1. Load the entity catalog for this type
2. Join with frequency data (for shows and licensed shows)
3. Compute likelihood scores
4. Build case-sensitive and case-insensitive tries
5. Broadcast both tries to all executors

```python
from trie_match import Trie

def build_entity_tries(catalog_rows, term_frequencies):
    cs_trie = Trie()  # case-sensitive
    ci_trie = Trie()  # case-insensitive
    
    for row in catalog_rows:
        lik = likelihood(row.search_term, row.wiki_doc_frequency)
        
        # Case-sensitive: always include, 2× confidence
        cs_trie.insert(
            row.search_term,
            value={"entity_id": row.entity_id, "likelihood": lik * 2.0},
            tie_breaker=merge_entities,  # handle shared surface forms
        )
        
        # Case-insensitive: include only if not too common
        if should_include_ci(row.search_term, term_frequencies):
            ci_trie.insert(
                row.search_term.lower(),
                value={"entity_id": row.entity_id, "likelihood": lik},
                tie_breaker=merge_entities,
            )
    
    return cs_trie, ci_trie
```

The **tie-breaker** is critical here. Multiple entities can share the same surface form — "Selena" is both a 2024 documentary and a 1997 biopic. When two entities collide on the same trie path, the tie-breaker decides what to store at that node.

There are two strategies:

**Keep all candidates** — concatenate the entity IDs at the node. The trie stores a list of all possible entities for this surface form. Disambiguation happens downstream, during scoring.

```python
def merge_entities(existing, new):
    """Tie-breaker: keep all candidate entities."""
    return {
        "entity_ids": existing["entity_ids"] + [new["entity_id"]],
        "likelihood": max(existing["likelihood"], new["likelihood"]),
    }
```

**Keep the best candidate** — pick the entity with the highest relevance score. Simpler, but loses information.

```python
def merge_entities(existing, new):
    """Tie-breaker: keep the most relevant entity."""
    if new["likelihood"] > existing["likelihood"]:
        return new
    return existing
```

In practice, the "keep all" approach works better for shows (where you want to surface all possible title matches and let scoring disambiguate) and the "keep best" approach works better for talent (where the most famous person with that name is almost always the correct match).

After building, both tries are broadcast:

```python
broadcast_cs = spark.sparkContext.broadcast(cs_trie)
broadcast_ci = spark.sparkContext.broadcast(ci_trie)
```

Two broadcasts per entity type. For 7 entity types, that's 14 broadcast variables — but each is small (10–80 MB), and they're shared across all tasks on each executor.

---

## Step 3: Scan, Score, Explode

With the tries broadcast, scanning is a UDF applied to each document. But unlike the simple UDF in the [Trie series](/blog/trie-broadcasting-in-spark/), this one implements the full scoring pipeline from [Part 2](/blog/entity-detection-scoring-matches/):

```python
@F.udf(match_schema)
def score_entities(text, field_name):
    if text is None:
        return []
    
    cs_trie = broadcast_cs.value
    ci_trie = broadcast_ci.value
    
    # Scan with both tries
    cs_matches = cs_trie.find_all(text, word_boundaries=True)
    ci_matches = ci_trie.find_all(text.lower(), word_boundaries=True)
    
    # Merge and apply field weighting
    all_matches = []
    for m in cs_matches:
        score = m.value["likelihood"]
        score *= 50.0 if field_name == "title" else 1.0
        all_matches.append({"entity_id": m.value["entity_id"], "score": score, **m})
    
    for m in ci_matches:
        score = m.value["likelihood"]
        score *= 50.0 if field_name == "title" else 1.0
        all_matches.append({"entity_id": m.value["entity_id"], "score": score, **m})
    
    # Resolve overlaps by confidence
    resolved = resolve_overlaps(all_matches)
    return resolved
```

The UDF returns an array of scored matches. Spark's `explode` function turns each array element into its own row, creating a flat table of (document, entity, score, field) tuples:

```python
# Apply UDF to each document field
title_matches = documents.withColumn(
    "matches", score_entities(F.col("title_text"), F.lit("title"))
)
body_matches = documents.withColumn(
    "matches", score_entities(F.col("body_text"), F.lit("body"))
)

# Union the field results and explode
all_matches = title_matches.union(body_matches)
entity_mentions = all_matches.select(
    "doc_id",
    F.explode("matches").alias("match"),
).select(
    "doc_id",
    F.col("match.entity_id"),
    F.col("match.score"),
    F.col("match.matched_text"),
)
```

The final aggregation sums scores per (document, entity) pair — multiple mentions in the same document accumulate:

```python
entity_scores = (
    entity_mentions
    .groupBy("doc_id", "entity_id")
    .agg(
        F.sum("score").alias("total_score"),
        F.count("*").alias("mention_count"),
        F.collect_list("matched_text").alias("matched_terms"),
    )
    .filter(F.col("total_score") > 0.5)  # confidence threshold
)
```

---

## Step 4: Corroboration Across Entity Types

The talent boost from [Part 2](/blog/entity-detection-scoring-matches/) requires a cross-entity-type join. After all entity types have been scored independently, you join the results:

```python
# talent_show_map: talent_entity_id → [show_entity_id, ...]
show_scores = entity_scores.filter(col("entity_type") == "show")
talent_scores = entity_scores.filter(col("entity_type") == "talent")

# Find documents where both a talent and their associated show are detected
corroborated = (
    show_scores.alias("s")
    .join(talent_scores.alias("t"), on="doc_id")
    .join(talent_show_map, 
          col("t.entity_id") == col("talent_id"))
    .filter(col("s.entity_id") == col("show_id"))
    .select(
        "doc_id",
        col("s.entity_id").alias("show_entity_id"),
        (col("s.total_score") * (1.0 + col("t.total_score"))).alias("boosted_score"),
    )
)

# Update show scores with the boost
final_scores = show_scores.join(
    corroborated, on=["doc_id", "show_entity_id"], how="left"
).withColumn(
    "final_score",
    F.coalesce(col("boosted_score"), col("total_score"))
)
```

This join is small — it only involves documents where both a talent and a show were detected. And it runs after the heavy scanning is done, so it adds minimal overhead.

---

## The Numbers

Here are realistic performance characteristics for this pipeline:

| Metric | Value |
|:---|:---|
| Document corpus | ~10 million documents |
| Entity catalog (all types) | ~460,000 search terms |
| Largest trie (talent, case-insensitive) | ~200,000 terms, ~800,000 nodes |
| Broadcast size per trie | 15–80 MB |
| Scan throughput per executor core | ~1,000 documents/second |
| Cluster size | 100 executors, 4 cores each |
| Wall clock (all entity types, parallel) | ~5 minutes |
| Sequential equivalent | ~3 hours |

The 60× speedup comes from two levels of parallelism:

1. **Data parallelism** — 10 million documents are partitioned across 400 cores. Each core scans its partition locally using the broadcast trie.
2. **Entity-type parallelism** — All 7 entity-type scoring jobs run concurrently on the same cluster. The total time is the time of the longest job, not the sum.

The broadcast overhead is negligible. Serializing a trie takes ~100ms. Shipping it to 100 executors takes ~2 seconds (Spark uses a torrent-like protocol). Deserializing on each executor takes ~200ms. After that, every scan is pure local computation — no network IO, no shuffles, no coordination.

---

## Why This Architecture Works

This pipeline has a property that makes it almost embarrassingly parallel: **the tries are read-only, and the documents are independent.**

No document's scoring depends on any other document's results. No executor needs to communicate with any other executor during the scan. The only coordination points are:

1. **The broadcast** — before scanning, each executor receives the tries (once)
2. **The merge** — after scanning, results from all partitions are unioned (standard Spark shuffle)
3. **The corroboration join** — a small join between show and talent results

Everything between steps 1 and 2 is perfectly parallel. This is the [broadcast pattern](/blog/trie-broadcasting-in-spark/) from the Trie series, applied at system scale.

The architecture also handles **incremental updates** naturally. When new documents arrive, you don't re-score the entire corpus — you scan only the new documents with the existing broadcast tries. When the entity catalog changes, you rebuild the tries and re-broadcast — but the scan logic is identical. The two concerns (catalog freshness and document freshness) are completely decoupled.

---

## The Series So Far

1. [The "You" Problem](/blog/entity-detection-the-you-problem/) — Why entity detection is harder than string matching
2. [Scoring Entity Matches](/blog/entity-detection-scoring-matches/) — The disambiguation model
3. **Entity Detection at Scale** — You are here
4. [From Batch to Real-Time](/blog/entity-detection-batch-to-realtime/) — Moving entity detection into a web application

---

## What's Next

We've built an entity detection system that processes millions of documents in minutes on a Spark cluster. But Spark is batch — you submit a job, wait for it to finish, and read the results from a table.

What if you need entity detection *right now*? A user pastes text into a search box, and you need to identify entities in real time. A new document arrives, and you want to tag it before it's even indexed.

In [Part 4](/blog/entity-detection-batch-to-realtime/), we'll see how the exact same algorithm — dual tries, scoring, overlap resolution — moves from a batch Spark pipeline into an async Python web service with in-memory caching and parallel entity-type detection.

---

*Previous: [Scoring Entity Matches](/blog/entity-detection-scoring-matches/)*

*Next: [From Batch to Real-Time](/blog/entity-detection-batch-to-realtime/)*
