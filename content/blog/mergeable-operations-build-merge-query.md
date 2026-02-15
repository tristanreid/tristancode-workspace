---
title: "Build, Merge, Query"
description: "Sketches are only as useful as the API around them. How Hive UDFs turn T-Digest and Bloom filter theory into SQL functions anyone can use — and why the aggregation framework was designed for exactly this."
weight: 25
series: "Mergeable Operations in Distributed Computation"
series_weight: 20
skin: graph
draft: true
---

The [previous post](/blog/mergeable-operations-sketches/) covered what sketches are: compact data structures with bounded error and mergeable operations. T-Digest gives you approximate quantiles. Bloom filters give you approximate set membership. Both merge beautifully.

But knowing what a T-Digest is and being able to *use* one in a data pipeline are very different things. A sketch sitting in a library is potential energy. To make it kinetic, you need to answer three questions:

1. **How do I build one** from raw data?
2. **How do I merge** partial sketches across partitions?
3. **How do I query** the result?

These are the three operations every sketch needs. And it turns out that the Hive UDAF framework — the aggregation API used by Spark, Hive, and Presto — was designed around exactly this lifecycle.

This post walks through a set of UDFs and UDAFs I built to make T-Digest and Bloom filters usable from SQL. The full source is in two repos — [hive-tdigest-udfs](https://github.com/tristanreid/hive-tdigest-udfs) and [hive-bloom-udfs](https://github.com/tristanreid/hive-bloom-udfs) — but the pattern applies to any sketch in any aggregation framework.

---

## The Three Operations

Every useful sketch has three operations, and they serve different roles:

| Operation | Type | What it does |
|---|---|---|
| **Build** | UDAF (aggregation) | Consume raw data, produce a sketch |
| **Merge** | UDAF (aggregation) | Combine existing sketches into one |
| **Query** | UDF (scalar) | Extract an answer from a sketch |

Build and Merge are *aggregations* — they reduce many rows to one. Query is a *scalar function* — it takes one sketch and returns a value.

This separation matters. You might build sketches once (during ingestion) and then merge and query them many times (at query time, with different groupings). The pre-aggregation pattern from the [HLL discussion](/blog/mergeable-operations-sketches/#hyperloglog--how-many-unique) works the same way here: build once, merge on demand.

In SQL, the three operations look like this:

```sql
-- BUILD: create a T-Digest sketch per country from raw latencies
SELECT country,
       tdigest_build(response_time_ms, 100) AS latency_sketch
FROM requests
GROUP BY country;

-- MERGE: combine daily sketches into a weekly sketch
SELECT country,
       tdigest_merge(daily_sketch) AS weekly_sketch
FROM daily_country_sketches
WHERE dt BETWEEN '2024-01-01' AND '2024-01-07'
GROUP BY country;

-- QUERY: extract percentiles from a sketch
SELECT country,
       tdigest_percentiles(weekly_sketch, array(0.50, 0.95, 0.99))
FROM weekly_country_sketches;
```

Three functions. Three roles. That's the entire API surface for approximate distributed percentiles.

---

## The UDAF Lifecycle

The reason this works so cleanly is that the Hive UDAF framework was designed around exactly the lifecycle a sketch needs.

A Hive UDAF processes data in phases, determined by how the framework distributes the computation:

```
              ┌─── Machine 1 ───┐    ┌─── Machine 2 ───┐
              │  iterate()      │    │  iterate()      │
              │  iterate()      │    │  iterate()      │
              │  iterate()      │    │  iterate()      │
              │  terminatePartial()  │  terminatePartial()
              └───────┬─────────┘    └───────┬─────────┘
                      │       serialized     │
                      │    partial sketches   │
                      └──────────┬───────────┘
                                 │
                         ┌─── Reducer ───┐
                         │  merge()      │
                         │  merge()      │
                         │  terminate()  │
                         └──────────────┘
                              ↓
                        final sketch
```

The framework handles the distribution. Your UDAF only needs to implement five methods:

| Method | Sketch equivalent | What it does |
|---|---|---|
| `getNewAggregationBuffer()` | **create empty sketch** | The identity element |
| `iterate(buffer, row)` | **add a data point** | Build up the sketch one value at a time |
| `terminatePartial(buffer)` | **serialize** | Ship the partial sketch across the network |
| `merge(buffer, partial)` | **combine two sketches** | The merge operation |
| `terminate(buffer)` | **serialize final result** | Output the finished sketch |

If this looks familiar, it should. An empty sketch that you build up by adding elements, then combine partial results with a merge operation... that's the structure from [Part 1](/blog/mergeable-operations-split-process-combine/). The aggregation framework doesn't know or care that it's processing a T-Digest versus a Bloom filter versus a simple sum — it calls the same five methods. The algebra is the same.

---

## T-Digest: The Implementation

Here's how the three T-Digest operations work in practice.

### The Aggregation Buffer

The heart of any UDAF is the aggregation buffer — the mutable state that accumulates data. For T-Digest, it wraps the `MergingDigest` from Ted Dunning's [t-digest library](https://github.com/tdunning/t-digest):

```java
class MergingDigestAggregationBuffer extends AbstractAggregationBuffer {
    private MergingDigest histogram;

    void init(final int compression) {
        histogram = new MergingDigest(compression);
    }

    // Add a raw data point (used during iterate)
    void update(final double value) {
        histogram.add(value);
    }

    // Merge an incoming serialized sketch (used during merge)
    void update(final Object incomingSketch) {
        if (incomingSketch != null) {
            if (histogram == null) {
                histogram = deserialize(incomingSketch);
            } else {
                histogram.add(deserialize(incomingSketch));
            }
        }
    }

    // Serialize to bytes for shipping across the network
    public byte[] getResult() {
        byte[] arr = new byte[histogram.byteSize()];
        ByteBuffer result = ByteBuffer.wrap(arr);
        histogram.asBytes(result);
        return result.array();
    }
}
```

Notice the two `update` overloads: one takes raw values (for the build path), the other takes serialized sketches (for the merge path). Same buffer, two roles.

### Build: Raw Data → Sketch

The build UDAF (`TDigestSketchUDAF`) accepts one to three arguments: the data point (or an array of points), an optional compression parameter, and an optional weight. Inside its evaluator, the `iterate` method adds each value to the buffer:

```scala
// Inside the evaluator's iterate() method:
val value = inputObjectInspector.getPrimitiveJavaObject(data(0))
if (hasWeight) {
    val weight = inputObjectInspector.getPrimitiveJavaObject(data(2)).asInstanceOf[Int]
    state.update(castedValue, weight)
} else {
    state.update(castedValue)
}
```

The compression parameter controls the trade-off between accuracy and size. Higher compression means more centroids, more memory, and tighter error bounds. The default of 100 gives a few hundred centroids — a few kilobytes — with excellent accuracy at the tails.

### Merge: Sketch + Sketch → Sketch

The merge UDAF (`TDigestSketchMergeUDAF`) takes pre-built sketches as input and combines them. Its `iterate` method deserializes incoming sketches and feeds them to the buffer's merge path:

```scala
// iterate receives serialized sketches, not raw data
val value = inputObjectInspector.getPrimitiveJavaObject(data(0))
state.update(castedValue)  // calls the Object overload → deserialize + merge
```

The evaluator's `merge` method (called by the framework when combining partial results across partitions) does the same thing:

```java
public void merge(AggregationBuffer buf, Object data) {
    final MergingDigestAggregationBuffer state =
        (MergingDigestAggregationBuffer) buf;
    state.update(data);  // deserialize and merge
}
```

Same operation at two levels: user-facing (merge pre-built sketches from a table) and framework-facing (merge partial results during the shuffle). The code is identical because the merge operation is the same regardless of *why* you're merging.

### Query: Sketch → Percentiles

The query UDF (`TDigestEstimateUDF`) deserializes a sketch and extracts quantiles:

```scala
class TDigestEstimateUDF extends GenericUDF {
    override def evaluate(args: Array[DeferredObject]): java.util.List[Double] = {
        val sketchBytes = args(0).get().asInstanceOf[Array[Byte]]
        val percentiles = listOI.getList(args(1).get()).asScala
            .map(_.asInstanceOf[HiveDecimal].doubleValue())

        val md = MergingDigestAggregationBuffer.deserialize(sketchBytes)
        percentiles.map(md.quantile(_)).asJava
    }
}
```

One sketch in, one list of quantile values out. You can call it on any T-Digest sketch regardless of whether it was built from raw data or merged from a thousand partitions. The sketch doesn't remember its history — it only represents the distribution.

---

## Bloom Filters: The Implementation

The Bloom filter follows the same three-operation pattern, with one difference: the query is a membership test (boolean), not a numeric estimate.

### Build

Two UDAF variants — one for long keys, one for string keys — accumulate items into a `BloomKFilter`:

```java
// BloomKFilterAggregationBuffer
void update(final long value) {
    bloomfilter.addLong(value);
}

void update(final String value) {
    bloomfilter.addString(value);
}

// Merge an incoming serialized filter
void update(final Object incomingSketch) {
    if (bloomfilter == null) {
        bloomfilter = deserialize(incomingSketch);
    } else {
        bloomfilter.merge(deserialize(incomingSketch));
    }
}
```

The `maxK` parameter controls the expected number of distinct items, which determines the bit array size and the false positive rate.

### Merge

The merge follows the same evaluator pattern as T-Digest. The framework calls `merge()` with serialized partial filters; the buffer deserializes and ORs them together.

### Query: Membership Test

```scala
class BloomKFilterUDF extends UDF {
    def evaluate(bloomfilterHash: Array[Byte], item: Long): Boolean =
        getFilter(bloomfilterHash).testLong(item)

    def evaluate(bloomfilterHash: Array[Byte], item: String): Boolean =
        getFilter(bloomfilterHash).testString(item)

    def evaluate(bloomfilterHash: Array[Byte], item: Int): Boolean =
        getFilter(bloomfilterHash).testInt(item)
}
```

Overloaded for every type the Bloom filter supports. Deserialize, test, return a boolean. No false negatives — ever.

---

## The Serialization Problem

There's an unglamorous but critical engineering problem hiding in all of this: **serialization**.

Sketches need to cross JVM boundaries. During a Spark job, partial sketches are serialized after `terminatePartial()`, shipped across the network during the shuffle, and deserialized before `merge()`. The format needs to be compact, deterministic, and robust to the various wrapper types the framework might use.

Look at the T-Digest deserialization:

```java
public static MergingDigest deserialize(Object serializedSketch) {
    if (serializedSketch instanceof MergingDigest)
        return (MergingDigest) serializedSketch;

    byte[] bytes = null;
    if (serializedSketch instanceof String)
        bytes = BASE64_DECODER.decode(((String) serializedSketch).getBytes(UTF8_STRING));
    else if (serializedSketch instanceof byte[])
        bytes = (byte[]) serializedSketch;
    else if (serializedSketch instanceof BytesWritable)
        bytes = ((BytesWritable) serializedSketch).getBytes();

    return MergingDigest.fromBytes(ByteBuffer.wrap(bytes));
}
```

Four input types, one output. This defensive deserialization isn't elegant, but it's necessary. The framework passes different wrapper types depending on the aggregation phase (`PARTIAL1` vs. `PARTIAL2` vs. `FINAL`), and different Hive/Spark versions have their own preferences. The Bloom filter buffer has the same pattern, with an additional `Text` type to handle.

T-Digest sketches serialize to raw bytes — compact and binary. Bloom filters serialize to Base64 strings — slightly larger, but safely storable in string-typed columns. That's useful when you want to persist sketches in Hive tables for later merging: build daily, store as a column, merge weekly on demand.

And then there's the vendored `BloomKFilter` and `Murmur3`. Hive includes its own Bloom filter implementation in `org.apache.hive.common.util`, but different Hive versions ship different implementations with incompatible APIs. Rather than fighting version conflicts between the Hive and Spark runtimes, it's simpler to vendor the code — copy the source files into your own package and eliminate the dependency entirely. Not elegant, but it works, which when you're dealing with the Hadoop ecosystem's dependency hell is what matters.

---

## The Pattern

Step back and look at the two implementations side by side:

| | T-Digest | Bloom Filter |
|---|---|---|
| **Build UDAF** | `TDigestSketchUDAF` | `BloomKFilterUDAF` / `BloomKFilterStringUDAF` |
| **Merge UDAF** | `TDigestSketchMergeUDAF` | (same evaluator handles merge) |
| **Query UDF** | `TDigestEstimateUDF` | `BloomKFilterUDF` |
| **Buffer** | `MergingDigestAggregationBuffer` | `BloomKFilterAggregationBuffer` |
| **Evaluator** | `MergingDigestEvaluator` | `BloomKFilterEvaluator` |
| **Serialization** | Binary (byte array) | Base64 string |

Different sketches, different questions, different serialization formats — but the same five-method lifecycle. The evaluators are nearly identical. The buffers have the same shape: `init`, `update` (with overloads for raw values and serialized sketches), `getResult`, `reset`. The query UDFs are thin wrappers around deserialize + query.

This uniformity isn't coincidence. The aggregation framework decomposes every aggregation into the same lifecycle because **every aggregation that works in a distributed system has the same underlying structure**. The framework doesn't care whether you're summing numbers or merging T-Digests — it calls the same methods, in the same order, with the same semantics.

The empty buffer is the identity element. The merge method is the associative operation. The framework handles distribution because the algebra guarantees correctness regardless of how the data is partitioned or in what order the merges happen.

That sounds a lot like the "two rules" from [Part 1](/blog/mergeable-operations-split-process-combine/#two-rules) — associativity and an identity element. The [next post](/blog/mergeable-operations-algebird/) will give this structure its proper name, and show what happens when you build an entire library around it.

---

## Source Code

- **[hive-tdigest-udfs](https://github.com/tristanreid/hive-tdigest-udfs)** — Build, merge, and query T-Digest sketches from SQL. Depends on Ted Dunning's [t-digest](https://github.com/tdunning/t-digest) library.
- **[hive-bloom-udfs](https://github.com/tristanreid/hive-bloom-udfs)** — Build, merge, and query Bloom filters from SQL. Self-contained (BloomKFilter and Murmur3 vendored from Hive).

---

*Previous: [Sketches: Trading Precision for Scalability](/blog/mergeable-operations-sketches/)*

*Next: [When Abstract Algebra Becomes Practical](/blog/mergeable-operations-algebird/)*
