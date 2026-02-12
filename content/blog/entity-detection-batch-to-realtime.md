---
title: "From Batch to Real-Time — Entity Detection in a Web App"
description: "The same trie algorithm that scans 10 million documents overnight can tag a single document in milliseconds. Here's how to make the leap."
weight: 40
series: "Entity Detection: Finding What Matters in Text"
series_weight: 30
skin: graph
---

The batch pipeline from [Part 3](/blog/entity-detection-at-scale/) is powerful. It processes 10 million documents against 8 entity types in minutes, runs overnight, and writes scored results to a table. By morning, every document in the corpus is tagged with its entity mentions.

But what about the document that was written *this morning*?

A user opens a web app, pastes in some text, and expects to see entity tags instantly — which shows are mentioned, which people, which topics. They can't wait for the nightly batch run. They need entity detection *right now*.

The good news: the algorithm is identical. The same dual-trie pattern, the same scoring model, the same overlap resolution. What changes is everything *around* the algorithm — how the tries get built, how they're cached, and how multiple entity types are processed concurrently.

---

## Same Algorithm, New Constraints

In the Spark pipeline, the entity detection workflow looks like this:

```
Load catalog from SQL → Build tries → Broadcast → Scan → Score → Write
```

Each step can take seconds or minutes because the pipeline runs as a batch job. Memory is plentiful (distributed across a cluster). The tries are built fresh on every run.

In a web application, the constraints are different:

| Concern | Batch (Spark) | Real-Time (Web App) |
|:---|:---|:---|
| **Latency** | Minutes acceptable | Milliseconds required |
| **Catalog loading** | Read from SQL table | Fetch from remote storage |
| **Trie construction** | Build once per job | Build once, reuse for many requests |
| **Memory** | Distributed across executors | Single process, limited RAM |
| **Concurrency** | Spark parallelism | async/await |
| **Entity types** | Separate Spark jobs | Concurrent coroutines |

The core scan — walking the trie character by character — is already fast. On a single core, it processes a typical document (a few kilobytes of text) in microseconds. The latency challenge isn't the scan itself. It's everything else: loading catalogs, building tries, and coordinating across entity types.

---

## The EntityTrie Wrapper

The first step is to encapsulate the dual-trie pattern into a clean abstraction. Instead of managing two tries manually, wrap them in a class:

```python
from dataclasses import dataclass
from trie_match import Trie

@dataclass
class EntityMatch:
    entity_id: str
    likelihood: float

class EntityTrie:
    """Wraps a case-sensitive and case-insensitive trie for a single entity type."""
    
    def __init__(self, catalog, term_frequencies=None):
        self.case_sensitive_trie = Trie()
        self.case_insensitive_trie = Trie()
        
        for entity in catalog:
            for term in entity.search_terms:
                lik = likelihood(term, entity.wiki_frequency)
                
                # Case-sensitive: always include, 2× confidence
                self.case_sensitive_trie.insert(
                    term,
                    EntityMatch(entity.id, lik * 2.0),
                )
                
                # Case-insensitive: only if not too common
                if should_include_ci(term, term_frequencies):
                    self.case_insensitive_trie.insert(
                        term.lower(),
                        EntityMatch(entity.id, lik),
                    )
    
    def detect(self, text):
        """Find and score all entity mentions in text."""
        cs_matches = self.case_sensitive_trie.find_all(
            text, word_boundaries=True
        )
        ci_matches = self.case_insensitive_trie.find_all(
            text.lower(), word_boundaries=True
        )
        
        all_matches = cs_matches + ci_matches
        resolved = resolve_overlaps(all_matches)
        return resolved
```

This is the same logic as the Spark UDF from [Part 3](/blog/entity-detection-at-scale/), but packaged as a reusable Python class. One `EntityTrie` per entity type. Call `detect(text)` on any string and get back scored, resolved matches.

The `EntityTrie` is **immutable after construction** — once built, it's thread-safe and can handle concurrent reads from multiple async handlers without locking. This is the same property that made tries ideal for [Spark broadcast](/blog/trie-broadcasting-in-spark/): build once, read many.

---

## The Catalog Loading Problem

In Spark, the entity catalog is a SQL table. Read it, build the trie, broadcast. Simple.

In a web app, the catalog lives somewhere else — object storage like S3, a database, or an API behind an authenticated proxy. And it's big. A full entity catalog with 100,000+ entries, their alternate names, Wikipedia frequencies, and metadata can be tens of megabytes.

You can't fetch the catalog on every request. The first request would take seconds (network round-trip + deserialization + trie construction), and every subsequent request would do the same work again.

You need caching. And not just one layer of it.

---

## Two-Tier Caching

The solution is a cache with two tiers: **in-memory** for speed and **filesystem** for durability.

```python
import json
import hashlib
from pathlib import Path

class EntityCache:
    def __init__(self, cache_dir="/tmp/entity_cache"):
        self._memory_cache = {}       # entity_type → EntityTrie
        self._cache_dir = Path(cache_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)
    
    async def get_trie(self, entity_type, loader):
        """
        Get an EntityTrie, checking memory first, then filesystem,
        then loading from remote.
        """
        # Tier 1: in-memory
        if entity_type in self._memory_cache:
            return self._memory_cache[entity_type]
        
        # Tier 2: filesystem
        cache_path = self._cache_dir / f"{entity_type}.json"
        if cache_path.exists():
            catalog = json.loads(cache_path.read_text())
            trie = EntityTrie(catalog)
            self._memory_cache[entity_type] = trie
            return trie
        
        # Tier 3: remote fetch
        catalog = await loader(entity_type)
        cache_path.write_text(json.dumps(catalog))
        trie = EntityTrie(catalog)
        self._memory_cache[entity_type] = trie
        return trie
    
    def invalidate(self, entity_type=None):
        """Clear cache, forcing a re-fetch on next access."""
        if entity_type:
            self._memory_cache.pop(entity_type, None)
            cache_path = self._cache_dir / f"{entity_type}.json"
            cache_path.unlink(missing_ok=True)
        else:
            self._memory_cache.clear()
            for f in self._cache_dir.glob("*.json"):
                f.unlink()
```

The lifecycle of a catalog:

```
Remote storage (S3 / database / API)
  ↓  (first request: fetch over network, ~2-5 seconds)
Filesystem cache (local disk)
  ↓  (cold start: read from disk, ~200ms)
In-memory cache (Python dict)
  ↓  (warm: instant)
EntityTrie (ready to scan)
```

On the first request after a cold start, the app fetches from remote storage, saves to disk, builds the trie, and caches it in memory. On subsequent requests, the trie is already in memory — zero overhead. If the process restarts, the filesystem cache avoids the expensive remote fetch.

**Cache invalidation** is TTL-based or event-driven. A daily cron job can call `invalidate()` to force a refresh, or a webhook from the catalog management system can trigger invalidation when entities are added or removed. The next request after invalidation transparently rebuilds.

---

## Parallel Entity Type Detection

In the Spark pipeline, entity types run as separate jobs on the cluster. In a web app, they run as concurrent coroutines with `asyncio.gather`:

```python
import asyncio

class EntityDetector:
    ENTITY_TYPES = [
        "show", "licensed_show", "talent", "employee",
        "country", "topic", "genre", "data_asset",
    ]
    
    def __init__(self, cache, catalog_loader):
        self.cache = cache
        self.loader = catalog_loader
    
    async def detect_entities(self, text, entity_type):
        """Detect entities of a single type in text."""
        trie = await self.cache.get_trie(entity_type, self.loader)
        return trie.detect(text)
    
    async def detect_all(self, text):
        """Detect all entity types in parallel."""
        tasks = [
            self.detect_entities(text, et)
            for et in self.ENTITY_TYPES
        ]
        results = await asyncio.gather(*tasks)
        
        # Flatten into a single list, tagged by type
        all_matches = []
        for entity_type, matches in zip(self.ENTITY_TYPES, results):
            for match in matches:
                match.entity_type = entity_type
                all_matches.append(match)
        
        return all_matches
```

`asyncio.gather` launches all 8 entity type detections concurrently. If the tries are already cached in memory (the common case), each detection is a synchronous CPU-bound operation that completes in microseconds. The `gather` returns when all 8 are done — effectively instantaneous.

The first request after a cold start is slower: `gather` kicks off 8 concurrent remote fetches, each taking a few seconds. But they run in parallel, so the total time is the time of the slowest single fetch — not the sum. And once cached, every subsequent request is fast.

---

## Putting It Together: The API

Here's what the real-time entity detection endpoint looks like in a web framework:

```python
from fastapi import FastAPI

app = FastAPI()
cache = EntityCache()
detector = EntityDetector(cache, load_catalog_from_s3)

@app.post("/detect")
async def detect_entities(request: DetectRequest):
    matches = await detector.detect_all(request.text)
    
    return {
        "entities": [
            {
                "entity_id": m.entity_id,
                "entity_type": m.entity_type,
                "matched_text": m.matched_text,
                "score": m.likelihood,
                "start": m.start,
                "end": m.end,
            }
            for m in matches
            if m.likelihood > request.min_confidence
        ]
    }
```

A user sends text. The API runs all entity types in parallel, applies the scoring model, and returns tagged entities with confidence scores — all in the time it takes to walk 8 tries through the text. For a typical document, that's under 10 milliseconds.

---

## Detection vs. Search: Two Sides of the Coin

There's a subtle distinction in how entity detection fits into a larger application. The trie-based system we've built answers one question:

> **Given a document, which entities are mentioned in it?**

But users often ask the inverse question:

> **Given an entity, which documents mention it?**

These are complementary operations, and they use different tools:

| Direction | Tool | Technique |
|:---|:---|:---|
| Document → Entities | **Trie scan** | Walk the trie through the text, emit matches |
| Entity → Documents | **Search index** | Query an index (e.g., Elasticsearch) for the entity name |

The trie scan is how you *enrich* documents — adding entity metadata at ingestion time. The search index is how you *query* documents — finding them by their entity tags at read time.

In a complete system, these feed each other:

```
New document arrives
  ↓
Trie scan → entity tags (shows, talent, topics, ...)
  ↓
Index document + entity tags into search engine
  ↓
User searches for "Stranger Things"
  ↓
Search engine returns documents tagged with that entity
```

The batch pipeline from [Part 3](/blog/entity-detection-at-scale/) does the enrichment at scale — processing millions of documents overnight. The real-time API from this post does it on demand — tagging a new document the moment it's created. The search engine serves the inverse query using the tags that both systems produce.

This is why the entity detection system works well as infrastructure rather than a standalone feature. It produces structured metadata that downstream systems (search, recommendations, analytics, dashboards) can consume. The trie scan is the engine. The entity tags are the fuel.

---

## What We Built

Let's zoom out. Over four posts, we've built a complete entity detection system:

**[Part 1: The "You" Problem](/blog/entity-detection-the-you-problem/)** — The problem: string matching finds "You" everywhere, but almost never means the show. Entity detection requires *scoring*, not just matching.

**[Part 2: Scoring Entity Matches](/blog/entity-detection-scoring-matches/)** — The scoring model: five signals (distinctiveness, case sensitivity, field weighting, corroboration, pre-filtering) that layer together to separate real entity mentions from coincidental string overlaps.

**[Part 3: Entity Detection at Scale](/blog/entity-detection-at-scale/)** — The distributed architecture: a DAG of parallel Spark jobs, each broadcasting dual tries and scanning millions of documents. 460,000 entity terms, 10 million documents, 5 minutes.

**Part 4: From Batch to Real-Time** — The same algorithm in a web app: `EntityTrie` wrappers, two-tier caching, `asyncio.gather` for parallel entity type detection. Under 10 milliseconds per document.

The through-line is the trie. The [data structure we explored](/blog/trie-what-is-a-trie/) in the Trie series — a tree that shares prefixes — turned out to be the foundation of a production system that tags millions of documents with hundreds of thousands of entity names. Its properties (compact, serializable, read-only, fast) make it equally suited to a Spark broadcast and an in-memory web cache.

But the trie is just the scanner. What makes entity detection *work* is everything around it: the scoring model that knows "Stranger Things" is distinctive and "You" is not, the dual-trie pattern that treats capitalization as signal, the field weighting that values title matches over body matches, and the corroboration that recognizes when multiple entities reinforce each other.

The system we've described is deterministic, scalable, and maintainable. It doesn't require training data, GPU clusters, or model versioning. It requires a curated catalog, a well-tuned scoring model, and a trie. Sometimes the best approach to a hard problem isn't the most sophisticated one — it's the one whose failure modes you can understand and fix.

---

## The Series

1. [The "You" Problem](/blog/entity-detection-the-you-problem/) — Why entity detection is harder than string matching
2. [Scoring Entity Matches](/blog/entity-detection-scoring-matches/) — The disambiguation model
3. [Entity Detection at Scale](/blog/entity-detection-at-scale/) — Broadcasting tries across a Spark cluster
4. **From Batch to Real-Time** — You are here

---

*Previous: [Entity Detection at Scale](/blog/entity-detection-at-scale/)*
