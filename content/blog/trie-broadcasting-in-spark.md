---
title: "Broadcasting a Trie in Spark"
description: "How to scan millions of documents for 100,000 entity names in parallel — by broadcasting a trie to every executor in a Spark cluster."
weight: 33
series: "Tries: Searching Text the Clever Way"
skin: graph
hero: /images/trie-series/trie-broadcasting-in-spark
---

In [Part 3](/blog/trie-scanning-text/), we scanned text for patterns using a trie. One trie, one document, one machine. The algorithm is fast — O(N x L) per document — but what happens when you have **10 million documents**?

This is the entity detection problem at production scale. You have a dictionary of 100,000 entity names (companies, people, cities, products) and a corpus of millions of documents. Find every entity mention in every document. Report what matched, where, and in which document.

A single machine can scan maybe 1,000 documents per second. At 10 million documents, that's three hours. With a Spark cluster, it's minutes.

The trick is a pattern called **broadcast**.

---

## The Two Things That Don't Fit Together

You have two datasets:

| Dataset | Size | Shape |
|---------|------|-------|
| Entity dictionary | 100,000 names | Small, read-only |
| Documents | 10,000,000 texts | Huge, partitioned across the cluster |

The naive approach is a cross-join: for each document, check every entity. That's 10^12 comparisons. Even with Spark's parallelism, it would take days.

A join doesn't help either. Entities and documents don't share a key — you're searching for *substrings*, not matching column values.

The insight: **replicate the small thing to every machine, then scan locally.** This is broadcast.

---

## Broadcast: Replicate the Dictionary

In Spark, a broadcast variable sends a read-only copy of data to every executor in the cluster. Each executor holds the entire copy in memory, and tasks on that executor access it without any network transfer.

```python
from trie_match import Trie

# Build the trie once on the driver
entity_names = load_entity_dictionary()  # 100K names
trie = Trie.from_patterns(entity_names, case_sensitive=False)

# Broadcast it to all executors
broadcast_trie = spark.sparkContext.broadcast(trie)
```

The trie is serialized once, shipped once per executor (not once per task), and deserialized into local memory. After that, every task on every executor has instant access to the full dictionary.

Why does a trie work so well for this?

1. **Compact**: shared prefixes mean 100,000 entity names might use only 500,000 nodes — far less memory than a flat list or hash set.
2. **Serializable**: it's a tree of simple objects (dicts of chars to child nodes). Python's pickle and Java's serialization handle it without custom logic.
3. **Read-only**: broadcast variables are immutable. A trie is naturally immutable after construction — you build it once, then only read.
4. **Fast**: the scan algorithm doesn't allocate — it walks pointers. No GC pressure, no hash collisions, just pointer chasing.

---

## The Scan: Map Over Documents

With the trie broadcast, scanning is a simple `map` operation:

```python
from pyspark.sql import functions as F
from pyspark.sql.types import ArrayType, StructType, StructField, StringType, IntegerType

match_schema = ArrayType(StructType([
    StructField("match", StringType()),
    StructField("start", IntegerType()),
    StructField("end", IntegerType()),
]))

@F.udf(match_schema)
def find_entities(text):
    if text is None:
        return []
    trie = broadcast_trie.value
    matches = trie.find_all(text, word_boundaries=True)
    resolved = Trie.resolve_overlaps(matches)
    return [{"match": m.match, "start": m.start, "end": m.end} for m in resolved]

# Apply to the entire corpus
results = documents.withColumn("entities", find_entities(F.col("text")))
```

Every executor deserializes the trie once. Every task calls `find_all()` on its partition of documents. There's no shuffle, no join, no network transfer during the scan — just CPU.

For 10 million documents on a 100-executor cluster:
- Each executor scans ~100,000 documents
- At 1,000 docs/sec per core, a 4-core executor finishes in ~25 seconds
- Wall clock: under a minute

---

## The Scala Version

The same pattern in Scala, using the Scala trie library:

```scala
import com.tristanreid.triematch.Trie
import org.apache.spark.sql.functions._
import org.apache.spark.sql.{SparkSession, DataFrame}

val spark = SparkSession.builder().getOrCreate()

// Build and broadcast
val entityNames: List[String] = loadEntityDictionary()
val trie = Trie.fromPatterns(entityNames, caseSensitive = false)
val broadcastTrie = spark.sparkContext.broadcast(trie)

// UDF
val findEntities = udf { (text: String) =>
  if (text == null) Seq.empty[(String, Int, Int)]
  else {
    val matches = broadcastTrie.value.findAll(text, wordBoundaries = true)
    val resolved = Trie.resolveOverlaps(matches)
    resolved.map(m => (m.text, m.start, m.end))
  }
}

// Apply
val results = documents.withColumn("entities", findEntities(col("text")))
```

The Scala `Trie` class implements `Serializable`, so Spark can serialize it natively — no Kryo configuration, no custom serializers. This is by design: the `extends Serializable` on `Trie` and `TrieNode` exists specifically for this use case.

---

## Why Not a Hash Set?

A fair question. If you just want to check "does any entity appear in this text?", you could split the text into words and check each word against a hash set. That's O(N) and very fast.

But entity names aren't single words. "New York" is two tokens. "Los Angeles International Airport" is four. A hash set of entity names can only match single tokens — you'd need to generate all possible n-grams from the text and check each one. For a 1,000-word document and entity names up to 6 words long, that's 6,000 lookups per document.

A trie handles this naturally. It scans left to right, character by character, following edges. When it reaches a terminal node, it found a match — regardless of how many words the entity name contains. There's no n-gram generation, no tokenization overhead.

And there's a subtler advantage: the trie can find **overlapping matches**. If your dictionary contains both "New York" and "New York City", the trie will find both in a single pass. A hash-set approach would need to enumerate both n-grams explicitly.

---

## The Tie-Breaker Pattern

In real entity dictionaries, the same surface form can map to different entities:

| Surface form | Entity |
|---|---|
| "Apple" | Apple Inc. (company) |
| "Apple" | Apple (fruit) |
| "Mercury" | Mercury (planet) |
| "Mercury" | Mercury (element) |
| "Mercury" | Mercury Records (label) |

When you insert these into a trie, you have a conflict: the same path leads to multiple values. You need a policy.

The `tie_breaker` parameter handles this:

```python
# Keep the highest-confidence entity
trie = Trie(
    case_sensitive=False,
    tie_breaker=lambda existing, new: existing if existing["confidence"] > new["confidence"] else new,
)

trie.insert("Apple", {"id": "AAPL", "type": "company", "confidence": 0.95})
trie.insert("Apple", {"id": "fruit_apple", "type": "food", "confidence": 0.60})

# "Apple" now resolves to Apple Inc.
```

Without a tie-breaker, the trie accumulates all values at the terminal node (both are returned). This is useful when you want to surface all candidates and disambiguate downstream — perhaps using context around the mention.

The tie-breaker runs at insert time, so the broadcast trie already has conflicts resolved. No executor-side logic needed.

---

## Sizing the Broadcast

A broadcast variable lives in executor memory. How big is a trie?

For a dictionary of 100,000 entity names with average length 15 characters:
- **Unique characters across all names**: ~200,000 (after prefix sharing)
- **Nodes**: ~200,000 (one per unique character position)
- **Memory per node**: ~200 bytes (Python dict overhead + char key + pointer)
- **Total**: ~40 MB in Python, ~15 MB in Scala (more compact objects)

Spark's default broadcast threshold is 10 MB (`spark.sql.autoBroadcastJoinThreshold`), but this only applies to DataFrames in joins. Explicit `sparkContext.broadcast()` has no size limit — it's bounded only by executor memory.

For 40 MB, that's fine. Most Spark executors have 4–16 GB of memory. A 40 MB trie is noise.

For truly massive dictionaries (1 million+ entities), you'd want the Scala implementation (smaller memory footprint) or a radix tree (fewer nodes). The `trie-match-scala` package is the better choice at that scale.

---

## The Full Pipeline

Here's a realistic entity detection pipeline, end to end:

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.types import ArrayType, StructType, StructField, StringType, IntegerType
from trie_match import Trie

spark = SparkSession.builder.appName("entity-detection").getOrCreate()

# 1. Load entity dictionary (from a table, file, or API)
entities = spark.read.parquet("s3://data/entities/").collect()
entity_pairs = [(row.name, {"id": row.id, "type": row.entity_type}) for row in entities]

# 2. Build trie on the driver
trie = Trie.from_pairs(entity_pairs, case_sensitive=False)
print(f"Trie: {trie.size} entities, {trie.node_count} nodes")

# 3. Broadcast to all executors
broadcast_trie = spark.sparkContext.broadcast(trie)

# 4. Define the scanning UDF
match_schema = ArrayType(StructType([
    StructField("entity_id", StringType()),
    StructField("entity_type", StringType()),
    StructField("matched_text", StringType()),
    StructField("start_pos", IntegerType()),
    StructField("end_pos", IntegerType()),
]))

@F.udf(match_schema)
def detect_entities(text):
    if text is None:
        return []
    trie = broadcast_trie.value
    matches = trie.find_all(text, word_boundaries=True)
    resolved = Trie.resolve_overlaps(matches)
    return [
        {
            "entity_id": m.value["id"],
            "entity_type": m.value["type"],
            "matched_text": m.match,
            "start_pos": m.start,
            "end_pos": m.end,
        }
        for m in resolved
    ]

# 5. Scan the corpus
documents = spark.read.parquet("s3://data/documents/")
results = (
    documents
    .withColumn("entities", detect_entities(F.col("text")))
    .withColumn("entity_count", F.size("entities"))
)

# 6. Explode for downstream analysis
entity_mentions = (
    results
    .select("doc_id", F.explode("entities").alias("entity"))
    .select(
        "doc_id",
        F.col("entity.entity_id"),
        F.col("entity.entity_type"),
        F.col("entity.matched_text"),
        F.col("entity.start_pos"),
        F.col("entity.end_pos"),
    )
)

entity_mentions.write.parquet("s3://data/entity_mentions/")
```

Build the trie once. Broadcast once. Scan millions of documents in parallel. Write the results. Done.

---

## When to Broadcast vs. When to Join

Broadcast isn't always the right pattern. Here's the decision:

| Scenario | Approach | Why |
|---|---|---|
| Small dictionary (<1M patterns), large corpus | **Broadcast trie** | Replicate the small thing, scan locally |
| Both datasets large | **Tokenize + join** | Split text into tokens, join on token. Loses multi-word entities. |
| Real-time (streaming) | **Broadcast trie** | Trie sits in memory on every executor, scans each micro-batch |
| Dictionary changes frequently | **Broadcast + refresh** | Rebuild and re-broadcast periodically (e.g., every hour) |
| Very large dictionary (>10M patterns) | **Partition + trie per partition** | Shard the dictionary, each executor gets a slice |

The broadcast trie pattern covers the vast majority of entity detection workloads. It's simple, it's fast, and it scales linearly with the number of executors.

---

## Open Source

Both trie libraries are designed for this pattern:

### [`trie-match`](https://github.com/tristanreid/trie-match-python) (Python)

```bash
pip install trie-match
```

```python
from trie_match import Trie

trie = Trie.from_patterns(["New York", "Los Angeles"], case_sensitive=False)
broadcast_trie = spark.sparkContext.broadcast(trie)
```

Pickle-serializable out of the box. Works with PySpark's broadcast, `pickle.dumps()`, and any other Python serialization.

### [`trie-match`](https://github.com/tristanreid/trie-match-scala) (Scala)

```scala
libraryDependencies += "com.tristanreid" %% "trie-match" % "0.1.0"
```

```scala
import com.tristanreid.triematch.Trie

val trie = Trie.fromPatterns(List("New York", "Los Angeles"), caseSensitive = false)
val broadcastTrie = spark.sparkContext.broadcast(trie)
```

`Serializable` by design. No Kryo registration needed. Works with Spark's default Java serialization.

---

## The Series So Far

1. [What Is a Trie?](/blog/trie-what-is-a-trie/) — The data structure, from intuition to implementation
2. [Building an Interactive Trie Visualizer with D3](/blog/trie-visualizing-with-d3/) — How the animated visualization works
3. [Scanning Text with a Trie](/blog/trie-scanning-text/) — Multi-pattern matching, word boundaries, overlap resolution
4. **Broadcasting a Trie in Spark** — You are here
5. [Building a Trie-Powered Autocomplete with React](/blog/trie-autocomplete-react/) — The React component
6. [Shrinking the Trie for the Wire](/blog/trie-shrinking-for-the-wire/) — Can a custom format beat gzip? We measured.

The same data structure, applied at every layer: browser (autocomplete), network (packed transfer), and now distributed computation (broadcast scanning). A trie is just a tree that shares its homework — but that simple idea scales from a single search box to a fleet of machines scanning millions of documents in parallel.

---

*Previous: [Scanning Text with a Trie](/blog/trie-scanning-text/)*

*Next: [Building a Trie-Powered Autocomplete with React](/blog/trie-autocomplete-react/)*
