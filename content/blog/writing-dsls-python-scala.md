---
title: "Building Your First Domain-Specific Language: A Practical Guide in Python and Scala"
description: "How a small, focused language can eliminate boilerplate, reduce bugs, and make your team faster — with working examples."
series: "Hulu Pipeline"
weight: 3
skin: hulu
links:
  - label: "Hadoop Summit 2014 Talk"
    url: "https://www.youtube.com/watch?v=VjXwoHUCvOQ"
  - label: "Slides"
    url: "https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit"
---

*How a small, focused language can eliminate boilerplate, reduce bugs, and make your team faster — with working examples you can build this afternoon.*

*This is a hands-on companion to the [previous post](/blog/beaconspec-hulu-dsl-data-pipeline/) about Hulu's BeaconSpec DSL. There, we explored why Hulu built a domain-specific language for their data pipeline. Here, we'll build something similar ourselves — in both Python and Scala — and explore what each language brings to DSL design.*

---

## The Case for a Tiny Language

Imagine you're on a data engineering team. Every week, someone needs to define a new metric: "count playback starts by video ID," "sum ad impressions by partner," "average session length by device type." Each metric follows the same pattern, but every time, someone writes 80 lines of Java or Python boilerplate — data loading, grouping, aggregation, output formatting — just to express what could be a three-line specification.

This is exactly the situation the Hulu data team faced in the early 2010s. They were running 150–175 MapReduce jobs per hour, and each new metric required hand-written Java. Their answer was **BeaconSpec**, a domain-specific language that let engineers write this:

```beaconspec
basefact playback_start from playback/start {
    dimension video.id as video_id;
    dimension contentPartner.id as content_partner_id;
    fact sum(count.count) as total_count;
}
```

Instead of hundreds of lines of MapReduce code.

The result? Fewer bugs, faster onboarding, better monitoring, and a pipeline that was dramatically easier to reason about. The DSL didn't replace Java — it replaced the *repetitive parts* of Java.

This tutorial will show you how to build something similar — a minimal DSL for data metric definitions — in both **Python** and **Scala**. Along the way, we'll explore why the two languages lead to fundamentally different approaches, and when each shines.

---

## What Exactly Is a DSL?

A **domain-specific language** is a programming language built for one job. You already use several:

| DSL | Domain | What It Replaces |
|-----|--------|-----------------|
| SQL | Relational data queries | Imperative loops over files |
| CSS | Visual styling | Programmatic pixel manipulation |
| Regular expressions | Text pattern matching | Nested if/else string parsing |
| Terraform HCL | Infrastructure provisioning | Manual cloud console clicks |
| Makefile syntax | Build automation | Shell script spaghetti |

DSLs come in two flavors:

- **External DSLs** have their own syntax, parser, and (often) compiler. SQL and regex are external DSLs. BeaconSpec was too — it used JFlex and CUP to parse `.spec` files and generate Java code.
- **Internal DSLs** (also called *embedded* DSLs) piggyback on an existing language's syntax. They look like a new language but are actually valid code in the host language. Think of Ruby's RSpec, Kotlin's Gradle scripts, or Scala's sbt build definitions.

Internal DSLs are where we'll start, because they're dramatically simpler to build. No parser. No lexer. No compiler. Just clever API design.

---

## Our Target: A Metric Definition DSL

We want users to be able to define data metrics declaratively. Here's what we'd like the end result to *feel* like:

```
metric "playback_starts" from "playback/start" {
    dimension "video_id" from "video.id"
    dimension "partner_id" from "contentPartner.id"
    aggregate sum of "count" as "total_plays"
}
```

We can't get *exactly* this syntax in an internal DSL (it's not valid Python or Scala), but we can get remarkably close. Let's see how.

---

## Part 1: The Python Approach — Builder Pattern with Context Managers

Python doesn't have Scala's syntactic flexibility, but it has two powerful tools for building DSLs: **context managers** (`with` blocks) and **method chaining**. Let's use both.

### Step 1: Define the Data Model

Start with simple data classes that represent what a metric specification *is*:

```python
from dataclasses import dataclass, field

@dataclass
class Dimension:
    name: str
    source_field: str

@dataclass
class Aggregation:
    function: str       # "sum", "count", "avg", etc.
    source_field: str
    output_name: str

@dataclass
class MetricSpec:
    name: str
    source: str
    dimensions: list[Dimension] = field(default_factory=list)
    aggregations: list[Aggregation] = field(default_factory=list)
```

Nothing fancy here — just plain data containers. This is the *semantic model*: the structured representation of what the user wants to express.

### Step 2: Build the DSL Layer

Now, the fun part. We create a builder that feels like a mini-language:

```python
class MetricBuilder:
    """A small DSL for defining data metrics."""

    def __init__(self, name: str):
        self._spec = MetricSpec(name=name, source="")

    def from_source(self, source: str) -> "MetricBuilder":
        self._spec.source = source
        return self

    def dimension(self, name: str, source_field: str) -> "MetricBuilder":
        self._spec.dimensions.append(Dimension(name=name, source_field=source_field))
        return self

    def aggregate(self, func: str, source_field: str, as_name: str) -> "MetricBuilder":
        self._spec.aggregations.append(
            Aggregation(function=func, source_field=source_field, output_name=as_name)
        )
        return self

    def build(self) -> MetricSpec:
        if not self._spec.source:
            raise ValueError(f"Metric '{self._spec.name}' has no source defined")
        if not self._spec.aggregations:
            raise ValueError(f"Metric '{self._spec.name}' has no aggregations")
        return self._spec


def metric(name: str) -> MetricBuilder:
    """Entry point for the DSL."""
    return MetricBuilder(name)
```

### Step 3: Use It

```python
spec = (
    metric("playback_starts")
    .from_source("playback/start")
    .dimension("video_id", source_field="video.id")
    .dimension("partner_id", source_field="contentPartner.id")
    .aggregate("sum", source_field="count", as_name="total_plays")
    .build()
)

print(spec)
# MetricSpec(name='playback_starts', source='playback/start',
#   dimensions=[Dimension(name='video_id', source_field='video.id'), ...],
#   aggregations=[Aggregation(function='sum', source_field='count', output_name='total_plays')])
```

That reads pretty well! But we can go further with a context-manager variant that collects definitions:

```python
class MetricRegistry:
    """Collects metric definitions in a context block."""

    def __init__(self):
        self.specs: list[MetricSpec] = []

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def define(self, name: str) -> MetricBuilder:
        builder = MetricBuilder(name)
        # We'll capture on build — override build to auto-register
        original_build = builder.build

        def registering_build():
            spec = original_build()
            self.specs.append(spec)
            return spec

        builder.build = registering_build
        return builder


# Usage
with MetricRegistry() as registry:
    (registry.define("playback_starts")
        .from_source("playback/start")
        .dimension("video_id", source_field="video.id")
        .aggregate("sum", source_field="count", as_name="total_plays")
        .build())

    (registry.define("ad_impressions")
        .from_source("ads/impression")
        .dimension("campaign_id", source_field="campaign.id")
        .aggregate("count", source_field="*", as_name="impression_count")
        .build())

print(f"Registered {len(registry.specs)} metrics")
```

### What Makes This "DSL-ish"

Even though it's plain Python, notice how the code reads:

- `metric("playback_starts").from_source("playback/start")` — reads almost like English.
- Method chaining creates a *fluent interface* where each call returns `self`.
- The `build()` method acts as a terminator that validates and produces the final object.
- The registry context manager gives us a block-scoped collection mechanism.

The key principle: **a good internal DSL hides the machinery and surfaces the domain concepts.**

---

## Part 2: The Scala Approach — Where DSLs Feel Native

Scala was practically *designed* for internal DSLs. Several language features combine to make DSL construction feel effortless:

1. **Infix notation** — `a method b` instead of `a.method(b)`
2. **Curly braces for block arguments** — `metric("x") { ... }` is just a function call
3. **Implicit conversions** (Scala 2) / **extension methods and `given`** (Scala 3)  — add methods to existing types
4. **Operator overloading** — define `|`, `~>`, or any symbol as a method
5. **By-name parameters** — delay evaluation for block-style APIs

Let's build the same metric DSL:

### Step 1: The Data Model

```scala
case class Dimension(name: String, sourceField: String)

case class Aggregation(function: String, sourceField: String, outputName: String)

case class MetricSpec(
  name: String,
  source: String,
  dimensions: List[Dimension] = List.empty,
  aggregations: List[Aggregation] = List.empty
)
```

Scala's case classes give us immutable data containers with structural equality — a natural fit for specifications.

### Step 2: The DSL Builder

```scala
class MetricBuilder(name: String):
  private var _source: String = ""
  private val _dimensions = collection.mutable.ListBuffer[Dimension]()
  private val _aggregations = collection.mutable.ListBuffer[Aggregation]()

  def from(source: String): MetricBuilder =
    _source = source
    this

  def dimension(name: String, from: String): MetricBuilder =
    _dimensions += Dimension(name, from)
    this

  def sum(field: String, as outputName: String): MetricBuilder =
    _aggregations += Aggregation("sum", field, outputName)
    this

  def count(field: String, as outputName: String): MetricBuilder =
    _aggregations += Aggregation("count", field, outputName)
    this

  def avg(field: String, as outputName: String): MetricBuilder =
    _aggregations += Aggregation("avg", field, outputName)
    this

  def build(): MetricSpec =
    require(_source.nonEmpty, s"Metric '$name' needs a source")
    require(_aggregations.nonEmpty, s"Metric '$name' needs at least one aggregation")
    MetricSpec(name, _source, _dimensions.toList, _aggregations.toList)

def metric(name: String): MetricBuilder = MetricBuilder(name)
```

### Step 3: Use It

```scala
val spec = metric("playback_starts")
  .from("playback/start")
  .dimension("video_id", from = "video.id")
  .dimension("partner_id", from = "contentPartner.id")
  .sum("count", as = "total_plays")
  .build()

println(spec)
// MetricSpec(playback_starts, playback/start,
//   List(Dimension(video_id,video.id), Dimension(partner_id,contentPartner.id)),
//   List(Aggregation(sum,count,total_plays)))
```

Already very clean. But Scala lets us push further.

### Step 4: The Block-Style DSL

Using by-name parameters and a mutable context, we can create a block syntax that looks almost like a dedicated language:

```scala
import scala.collection.mutable.ListBuffer

class MetricContext(val name: String, val source: String):
  val dimensions: ListBuffer[Dimension] = ListBuffer.empty
  val aggregations: ListBuffer[Aggregation] = ListBuffer.empty

  def dimension(name: String, from: String): Unit =
    dimensions += Dimension(name, from)

  def sum(field: String, as outputName: String): Unit =
    aggregations += Aggregation("sum", field, outputName)

  def count(field: String, as outputName: String): Unit =
    aggregations += Aggregation("count", field, outputName)

  def toSpec: MetricSpec =
    MetricSpec(name, source, dimensions.toList, aggregations.toList)

def metric(name: String, source: String)(body: MetricContext ?=> Unit): MetricSpec =
  val ctx = MetricContext(name, source)
  body(using ctx)
  ctx.toSpec

// Helper to access the context implicitly
def dimension(name: String, from: String)(using ctx: MetricContext): Unit =
  ctx.dimension(name, from)

def sum(field: String, as outputName: String)(using ctx: MetricContext): Unit =
  ctx.sum(field, as = outputName)

def count(field: String, as outputName: String)(using ctx: MetricContext): Unit =
  ctx.count(field, as = outputName)
```

Now look at the usage:

```scala
val playbackMetric = metric("playback_starts", "playback/start"):
  dimension("video_id", from = "video.id")
  dimension("partner_id", from = "contentPartner.id")
  sum("count", as = "total_plays")

val adMetric = metric("ad_impressions", "ads/impression"):
  dimension("campaign_id", from = "campaign.id")
  count("*", as = "impression_count")
```

Compare that to the original BeaconSpec syntax at the top of this post. It's remarkably close — and it's *real, compilable Scala*. No parser needed. No code generation. The Scala compiler itself validates the structure.

---

## Part 3: Python vs. Scala — An Honest Comparison

Having built the same DSL in both languages, here's what stands out:

### Syntax Expressiveness

| Feature | Python | Scala |
|---------|--------|-------|
| Method chaining | Works well | Works well |
| Named parameters as keywords | `source_field="video.id"` | `from = "video.id"` (reads like English) |
| Block-scoped definitions | `with` blocks (limited) | Curly braces / significant indentation (natural) |
| Eliminating dots and parens | Not possible | Infix notation: `a method b` |
| Implicit context passing | Not built-in (use thread-locals or globals) | Context parameters (`using`/`given`) |
| Operator overloading | Supported but discouraged culturally | Idiomatic and widely used |

**Winner: Scala.** It's not close. Scala's syntax was designed to bend. Python's was designed to be uniform.

### Ease of Implementation

| Aspect | Python | Scala |
|--------|--------|-------|
| Lines of code for basic DSL | ~40 | ~40 |
| Learning curve for DSL author | Low | Medium (need to understand implicits/givens) |
| Learning curve for DSL user | Very low | Low-Medium |
| Debugging DSL code | Straightforward stack traces | Can be confusing with implicits |

**Winner: Python.** The builder pattern is a well-understood idiom. Anyone reading the Python version immediately knows what's happening. The Scala version with context parameters requires more Scala-specific knowledge.

### Validation and Safety

| Aspect | Python | Scala |
|--------|--------|-------|
| Compile-time type checking | None (runtime only) | Full type safety |
| Catching missing fields | Runtime `ValueError` | Compile-time with phantom types |
| IDE auto-completion | Good | Excellent (types guide suggestions) |
| Refactoring safety | Low | High |

**Winner: Scala.** In a large codebase where dozens of engineers write metric definitions, compile-time validation catches errors before they reach production. Python's `build()` validation only fires at runtime.

### When to Choose Each

**Choose Python when:**
- Your team already works in Python
- The DSL users are data scientists or analysts (familiar with Python, less so with Scala)
- You want rapid iteration and don't need compile-time guarantees
- The DSL is "glue" between other Python tools (pandas, Airflow, dbt)

**Choose Scala when:**
- You're in a JVM ecosystem (Spark, Kafka, Flink)
- Type safety matters — you want the *compiler* to reject bad metric definitions
- You want the DSL to look truly native, not like a builder pattern
- You're already using Scala for the execution layer (as Hulu was with MapReduce)

---

## Part 4: Going Beyond — From Internal to External DSL

Everything above has been *internal* DSLs — valid Python or Scala code. But what if you want your own syntax entirely? That's when you build an **external DSL**, like Hulu's BeaconSpec.

Here's a minimal external DSL parser in Python using just the standard library. We'll parse a simplified version of the BeaconSpec syntax:

```python
import re
from dataclasses import dataclass, field

@dataclass
class ParsedMetric:
    name: str
    source: str
    dimensions: list[tuple[str, str]] = field(default_factory=list)
    aggregations: list[tuple[str, str, str]] = field(default_factory=list)

def parse_metric_spec(text: str) -> list[ParsedMetric]:
    """A minimal parser for a BeaconSpec-like language."""
    metrics = []

    # Match each metric block
    block_pattern = r'metric\s+(\w+)\s+from\s+"([^"]+)"\s*\{([^}]*)\}'

    for match in re.finditer(block_pattern, text, re.DOTALL):
        name, source, body = match.groups()
        m = ParsedMetric(name=name, source=source)

        for line in body.strip().split("\n"):
            line = line.strip().rstrip(";")
            if not line:
                continue

            # Parse dimension lines
            dim_match = re.match(r'dimension\s+"(\w+)"\s+from\s+"([^"]+)"', line)
            if dim_match:
                m.dimensions.append((dim_match.group(1), dim_match.group(2)))
                continue

            # Parse aggregation lines
            agg_match = re.match(r'(sum|count|avg)\s+"([^"]+)"\s+as\s+"(\w+)"', line)
            if agg_match:
                m.aggregations.append(
                    (agg_match.group(1), agg_match.group(2), agg_match.group(3))
                )

    metrics.append(m)
    return metrics

# Try it out
spec_text = '''
metric playback_starts from "playback/start" {
    dimension "video_id" from "video.id";
    dimension "partner_id" from "contentPartner.id";
    sum "count" as "total_plays";
}

metric ad_impressions from "ads/impression" {
    dimension "campaign_id" from "campaign.id";
    count "*" as "impression_count";
}
'''

for m in parse_metric_spec(spec_text):
    print(f"{m.name}: {len(m.dimensions)} dimensions, {len(m.aggregations)} aggregations")
```

This is deliberately minimal — a regex-based parser for a simple grammar. For anything more complex, you'd reach for proper parsing tools:

| Tool | Language | Approach |
|------|----------|----------|
| **Lark** | Python | EBNF grammar, generates parse tree |
| **PLY** | Python | Lex/Yacc style, like JFlex/CUP |
| **ANTLR** | JVM + others | Grammar-based, generates lexer + parser |
| **Scala Parser Combinators** | Scala | Composable parsers in pure Scala |
| **FastParse** | Scala | High-performance parser combinators |

The Hulu team used **JFlex** (lexer generator) and **CUP** (parser generator) for BeaconSpec — essentially the Java equivalent of Lex and Yacc. This gave them a full compiler pipeline: `.spec` file in, generated Java MapReduce code out.

---

## Part 5: A Quick Scala Parser Combinator Example

Scala's parser combinators deserve a mention because they blur the line between internal and external DSLs. You write a parser that looks like a grammar definition, but it's valid Scala:

```scala
// Using scala-parser-combinators library
import scala.util.parsing.combinator._

case class DimensionDecl(name: String, source: String)
case class AggregationDecl(func: String, field: String, alias: String)
case class MetricDecl(name: String, source: String,
                      dims: List[DimensionDecl], aggs: List[AggregationDecl])

object MetricParser extends RegexParsers:

  def identifier: Parser[String] = """[a-zA-Z_]\w*""".r
  def quoted: Parser[String] = "\"" ~> """[^"]+""".r <~ "\""

  def dimension: Parser[DimensionDecl] =
    "dimension" ~> quoted ~ ("from" ~> quoted) <~ ";" ^^ {
      case name ~ source => DimensionDecl(name, source)
    }

  def aggregation: Parser[AggregationDecl] =
    ("sum" | "count" | "avg") ~ quoted ~ ("as" ~> quoted) <~ ";" ^^ {
      case func ~ field ~ alias => AggregationDecl(func, field, alias)
    }

  def metricBlock: Parser[MetricDecl] =
    "metric" ~> identifier ~ ("from" ~> quoted) ~ ("{" ~> rep(dimension | aggregation) <~ "}") ^^ {
      case name ~ source ~ decls =>
        val dims = decls.collect { case d: DimensionDecl => d }
        val aggs = decls.collect { case a: AggregationDecl => a }
        MetricDecl(name, source, dims, aggs)
    }

  def spec: Parser[List[MetricDecl]] = rep(metricBlock)

  def parseSpec(input: String): List[MetricDecl] =
    parseAll(spec, input) match
      case Success(result, _) => result
      case failure: NoSuccess => throw RuntimeException(s"Parse error: ${failure.msg}")
```

This parses the *exact same external syntax* as the Python regex parser, but with proper grammar rules, error reporting, and composability. The `~>`, `<~`, `~`, `^^`, and `rep` combinators are all just Scala methods — this is itself an internal DSL for writing parsers!

---

## Principles for Your Own DSL

Whether you go internal or external, Python or Scala, keep these principles in mind:

### 1. Start with the Usage, Not the Implementation

Write out how you *want* the DSL to look before writing any implementation code. Show it to your teammates. If they can read it without explanation, you're on the right track.

### 2. Model the Domain, Not the Technology

Your DSL's vocabulary should come from the problem domain ("metric," "dimension," "aggregate") not from the implementation ("mapper," "reducer," "partition key"). This is what made BeaconSpec powerful — engineers thought in terms of beacons and facts, not in terms of MapReduce shuffles.

### 3. Keep It Minimal

The best DSLs are small. If your DSL needs conditionals, loops, and variable declarations, you're probably building a general-purpose language by accident. Stop and reconsider.

### 4. Validate Early and Clearly

Whether at compile time (Scala) or at `build()` time (Python), your DSL should produce clear error messages in domain terms:

```
Error: Metric 'playback_starts' has no aggregations defined.
  Did you forget to add a sum() or count()?
```

Not:

```
IndexError: list index out of range
```

### 5. Plan for What Comes After Parsing

A DSL is only as useful as what happens *after* parsing. BeaconSpec generated Java code. Your DSL might generate SQL, Spark jobs, Airflow DAGs, API configurations, or monitoring dashboards. Design the semantic model (those data classes) with the output stage in mind.

---

## Wrapping Up

A DSL doesn't have to be a huge investment. An internal DSL in Python or Scala can be built in an afternoon and can immediately start paying dividends by making repetitive specifications more readable, more maintainable, and less error-prone.

The key insight from Hulu's BeaconSpec — and from the broader DSL tradition — is that **the right abstraction at the right layer can transform an entire system**. By letting engineers declare *what* they wanted measured rather than writing *how* to measure it, the team didn't just write less code. They built a foundation for automatic validation, consistent monitoring, and faster debugging across hundreds of concurrent jobs.

Start small. Pick one repetitive pattern in your codebase. Write out what you wish the specification looked like. Then build the thinnest possible layer — a builder in Python, a block DSL in Scala — that makes that wish a reality.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See also: [BeaconSpec on Medium](https://medium.com/lai-blog/beaconspec-8fb6d480470c) · [Slides on SlideShare](https://www.slideshare.net/slideshow/t-435phall1reidv2/35985404)*
