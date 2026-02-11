# Trie Data Structure — Research Notes

Research for the planned blog series: **Tries — Data Structure, Spark Integration & GitHub Release** (see `DEVELOPMENT.md`).

---

## Overview

A Trie (prefix tree) stores strings character-by-character in a tree structure where each node branches on the next character. This makes it extremely efficient for multi-pattern string matching — given a set of N terms and a document of length M, the Trie finds all matches in O(M × L) time where L is the max term length, rather than O(N × M) for naive per-term scanning.

Three implementations exist across the codebase, each tailored to a different runtime:

| Implementation | Language | Location | Context |
|---|---|---|---|
| `GenericTrie[A]` | Scala | `repos/pcra-dse/.../util/GenericTrie.scala` | Spark jobs — entity resolution pipeline |
| `GenericTrie` | Python | `repos/pcra-dse/km-python/shared/generic_trie.py` | Python Spark/Metaflow jobs |
| `Trie[T]` | Python | `repos/cau-lib-core/.../core/data/trie.py` | Application-level entity matching (async, FastAPI) |

---

## Implementation Comparison

### Common Design

All three implementations share the same core algorithm:

1. **Build phase**: Walk the tree character-by-character for each term, creating nodes as needed, storing the associated value at the leaf
2. **Search phase**: For each starting position in the input text, walk the tree; when a node has a value, check word boundaries and emit a match
3. **Case handling**: All support case-sensitive and case-insensitive modes via character normalization
4. **Word boundary detection**: Matches are only reported at word boundaries (checking that the character before and after the match is non-alphanumeric)

### Key Differences

#### Scala `GenericTrie[A]` (`GenericTrie.scala`)

```
repos/pcra-dse/workflows/knowledgemgmt_new/scala/km/
  src/main/scala/com/netflix/spark/km_entity_resolution/util/GenericTrie.scala
```

- **Type-parameterized**: `GenericTrie[A]` — works with any value type
- **Single value per key**: Each trie path stores `Option[A]`; collisions resolved via `tieBreaker: (A, A) => A`
- **Tie-breaker pattern**: Critical for entity resolution — e.g., when the same title string maps to multiple show IDs, the tie-breaker merges them:
  ```scala
  // AlternateTitleFrequencyCount.scala lines 35-36
  val tieBreaker = (a: AlternateTitleDescList, b: AlternateTitleDescList) =>
    AlternateTitleDescList(a.title_desc, a.show_title_ids ++ b.show_title_ids)
  ```
- **Minimum length guard**: `allMatches` returns empty for strings shorter than 3 characters
- **Word boundary**: Uses `isLetterOrDigit` (includes digits in boundary check)
- **Companion object**: `GenericTrie.apply(words, ignoreCase, tieBreaker)` factory + `main()` demo

#### Python `GenericTrie` (`generic_trie.py`)

```
repos/pcra-dse/km-python/shared/generic_trie.py
```

- Direct port of the Scala version — identical algorithm, identical boundary logic (`isalnum`)
- Same tie-breaker pattern, same minimum-length guard
- Factory function: `generic_trie_factory(words, ignore_case, tie_breaker)`
- Used in Python-based entity resolution scripts (e.g., `alternate_title_frequency_count/sp.alternate_title_frequency_count.py`)

#### Python `Trie[T]` (`trie.py`)

```
repos/cau-lib-core/src/cau_lib_core/core/data/trie.py
```

- **Generic via TypeVar**: `Trie[T]` using Python's `Generic[T]`
- **Multiple values per key**: Stores `List[T]` at each node (no tie-breaker needed — values accumulate)
- **Rich match objects**: Returns `TrieMatch[T]` dataclass with `value`, `match`, `start`, `end` (character spans)
- **No minimum length guard**: Handles all input lengths
- **Word boundary**: Uses `isalpha()` (letters only, not digits — slightly different from Scala version)
- **Cleaner API**: `insert()`, `search()`, `find_all_matches(text, word_boundaries=True)`

### Design Decision: Single vs. Multiple Values

The pcra-dse `GenericTrie` uses `Option[A]` (single value) with a tie-breaker function — this is an explicit merge operation at insert time. The cau-lib-core `Trie` uses `List[T]` (multiple values) — deferring the merge to query time. Both approaches work; the tie-breaker approach is more memory-efficient when the merge is well-defined.

**Blog angle**: This is a small but perfect illustration of "when to merge" — at write time vs. read time — that connects to the broader mergeable operations series.

---

## Spark Broadcast Pattern

One of the most compelling properties of the Trie for distributed computation: it is **efficient to broadcast**.

### How it works (from `EntityScoreNetflixShow.scala`)

1. **Driver builds the trie**: Entity terms and IDs are collected to the driver and inserted into a `GenericTrie[NetflixShowScore]` (line 43)
2. **Spark broadcasts it**: `spark.sparkContext.broadcast(trie)` serializes the trie once and ships it to all executors (line 44)
3. **UDF reads from broadcast**: Each executor deserializes the trie once, then every row-level UDF call references the local copy: `broadcastTrie.value.allMatches(s)` (line 73)

```scala
// EntityScoreNetflixShow.scala — the broadcast pattern
val trie = GenericTrie[NetflixShowScore](allResultPairs.toList ++ allResultPairsByIDs.toList)
val broadcastTrie = spark.sparkContext.broadcast(trie)

// ... also a case-insensitive variant
val ignoreCaseBroadcastedTrie = spark.sparkContext.broadcast(ignoreCaseTrie)

val findMatches = (s: String) =>
  (ignoreCaseBroadcastedTrie.value.allMatches(s).map { case (value, _) => value }
   ++ broadcastTrie.value.allMatches(s).map { case (value, _) => value })
    .groupBy(_.show_title_id)
    .mapValues(_.map(_.score).sum)
    .toSeq

spark.sqlContext.udf.register("showScore", findMatches)
```

### Why Tries are especially good for broadcast

- **Compact**: Shared prefixes are stored once — thousands of terms can share significant structure
- **Serializable**: The tree of maps/dicts serializes cleanly with Java/Kryo serialization
- **Read-only after build**: No concurrent writes needed — broadcast variables are immutable
- **No per-row overhead**: Unlike a join, there's no shuffle; the trie lives in executor memory and is consulted locally for every row

### Dual-trie pattern

Every entity scoring job broadcasts **two** tries — one case-sensitive, one case-insensitive — then combines their matches. This pattern appears across:

- `EntityScoreNetflixShow.scala`
- `EntityScoreNetflixLicensedShow.scala`
- `AlternateTitleFrequencyCount.scala`
- `EntityScoreNetflixTalent.scala`

The `cau-lib-core` `EntityTrie` class (in `entity_matching.py`) formalizes this as a first-class abstraction with `case_sensitive_trie` and `case_insensitive_trie` fields, adding likelihood adjustments (case-sensitive matches get 2× the likelihood score).

---

## Blog Series Ideas

### Post 1: "What Is a Trie?"

- The name (from "re**trie**val") and the core idea: a tree that shares prefixes
- Visual: build a trie from a small set of words, show how shared prefixes compress storage
- Complexity analysis: O(M × L) scanning vs O(N × M) for brute force
- Interactive component idea: let the reader type words and see the trie grow in real-time

### Post 2: "Broadcasting a Trie in Spark"

- The problem: you have 100,000 entity names and 10 million documents — how do you scan them all?
- Naive approach: join (shuffle) vs. broadcast (replicate)
- The trie as a broadcast variable: compact, serializable, read-only
- Walk through the `EntityScoreNetflixShow` pattern
- Performance characteristics: memory footprint, serialization cost
- Interactive component idea: simulated distributed scan showing how broadcast avoids shuffling

### Post 3: "Case Sensitivity and Word Boundaries"

- The dual-trie pattern: why you need both case-sensitive and case-insensitive matching
- Word boundary detection: the subtle bugs that happen without it (matching "ROMA" inside "ROMAnce")
- The tie-breaker pattern: what happens when multiple entities share the same surface form
- Real-world examples from the entity resolution pipeline

### Potential GitHub Release

- Clean, generic `Trie[T]` implementation (the cau-lib-core version is a good candidate)
- Add serialization support (JSON, pickle, possibly Arrow)
- Add `merge(other_trie)` operation for distributed use cases
- Include a Spark integration example
- Benchmarks: trie vs. regex vs. Aho-Corasick for multi-pattern matching

---

## Connections to Other Planned Series

- **Entity Resolution series**: The Trie is the core data structure powering entity detection — these series naturally cross-reference
- **Mergeable Operations series**: The tie-breaker function is a merge operation; the broadcast pattern shows why compact, serializable structures matter in distributed systems
- **HLL series** (existing): Like HLL, the Trie demonstrates a data structure purpose-built for a specific distributed computation pattern

---

## Source File Reference

| File | Key Content |
|---|---|
| `repos/pcra-dse/.../util/GenericTrie.scala` | Scala trie: `GenericTrieNode[A]`, `GenericTrie[A]`, `addWord`, `allMatches` |
| `repos/pcra-dse/km-python/shared/generic_trie.py` | Python port: `GenericTrieNode`, `GenericTrie`, `generic_trie_factory` |
| `repos/cau-lib-core/.../core/data/trie.py` | Clean Python generic: `Trie[T]`, `TrieNode[T]`, `TrieMatch[T]` |
| `repos/cau-lib-core/.../netflix/entity_matching.py` | `EntityTrie` (dual-trie), `EntityCache`, `load_entities`, `detect_entities` |
| `repos/pcra-dse/.../EntityScoreNetflixShow.scala` | Spark broadcast pattern, UDF registration, scoring SQL |
| `repos/pcra-dse/.../AlternateTitleFrequencyCount.scala` | Tie-breaker merge pattern, frequency counting |
| `repos/pcra-dse/.../package.scala` | `FieldEntityScore`, `TermFrequencyCount` types |
