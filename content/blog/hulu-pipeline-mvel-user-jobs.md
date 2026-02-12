---
title: "MVEL and User-Defined Jobs: Letting Users Configure Their Own Pipeline"
description: "How a lightweight expression language gave non-specialists the power to define custom pipeline logic — safely."
series: "Hulu Pipeline"
weight: 7
skin: hulu
links:
  - label: "Hadoop Summit 2014 Talk"
    url: "https://www.youtube.com/watch?v=VjXwoHUCvOQ"
  - label: "Slides"
    url: "https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit"
---

*How much power do you give your users? Too little and they're blocked on your team for every change. Too much and they bring down the pipeline.*

---

Earlier in this series, we looked at [BeaconSpec](/blog/beaconspec-hulu-dsl-data-pipeline/) — the domain-specific language that let engineers declare metric definitions instead of hand-coding MapReduce jobs. BeaconSpec was powerful, but it was designed for *metric definitions*: "take this beacon type, extract these dimensions, compute these aggregations."

There was another class of pipeline customization that BeaconSpec didn't cover: **user-defined jobs** — custom filtering, routing, and transformation logic that varied by use case and changed frequently.

The solution was **MVEL** (MVFLEX Expression Language), and it illustrates a different point in the DSL design spectrum: sometimes you don't need a custom language at all. Sometimes an existing expression language, properly sandboxed, gives users exactly the right amount of power.

---

## The Problem: Everyone Needs Something Slightly Different

The data pipeline processed beacons from every Hulu client: web players, mobile apps, smart TVs, gaming consoles, set-top boxes. Each beacon carried a rich set of fields: client type, OS, device, screen resolution, fullscreen status, bitrate, CDN, and dozens more.

Different teams needed different slices of this data:

- The **web team** wanted metrics filtered to browser clients only
- The **mobile team** needed data split by iOS vs. Android
- The **living room team** wanted Roku, Apple TV, and gaming console data
- The **QA team** needed to isolate fullscreen playback on specific OS versions

Each of these filters was conceptually simple — it's just "show me the data where these conditions are true." But expressing those conditions required either:

1. **Writing a new MapReduce job** — heavyweight, requires a developer, slow to deploy
2. **Adding filter parameters to BeaconSpec** — possible but would bloat the DSL with conditional logic it wasn't designed for
3. **Giving users a way to express conditions directly** — lightweight, self-service, fast to iterate

The team chose option 3.

---

## What Is MVEL?

[MVEL](http://mvel.documentnode.com/) (MVFLEX Expression Language) is a lightweight expression language for the JVM. It looks like a simplified Java without the ceremony:

```java
// Simple boolean expressions
client contains 'Chrome' && fullscreen == true

// Compound conditions with grouping
(os contains 'Windows' || os contains 'Mac') && bitrate > 500

// String matching
channel == 'Anime' || channel == 'Drama'

// Null-safe navigation
device?.manufacturer == 'Roku'
```

MVEL expressions are:
- **Evaluated at runtime** — no compilation step, changes take effect immediately
- **Sandboxed** — the expression can only read the fields exposed to it, not call arbitrary Java methods
- **Familiar** — anyone who can write an `if` statement in any C-family language can write MVEL

The key distinction from BeaconSpec: MVEL expressions don't *define* a computation. They define a *predicate* — a true/false condition that filters which data flows through a particular pipeline branch.

---

## How It Worked at Hulu

User-defined jobs used MVEL expressions as configurable filters. A job definition might look like:

```yaml
job:
  name: web_fullscreen_playback
  source: playback/start
  filter: "client contains 'Chrome' && fullscreen == true && (os contains 'Windows' || os contains 'Mac')"
  output: web_fullscreen_metrics
```

The pipeline would:

1. Read beacons from the source (`playback/start`)
2. Evaluate the MVEL filter expression against each beacon's fields
3. Pass only matching beacons to the downstream computation
4. Write results to the specified output

When the web team wanted to add Firefox to their filter, they updated the expression — no code change, no deployment, no rebuild.

---

## The Design Tension: Power vs. Safety

Expression languages sit at a critical point on the flexibility spectrum:

```
Less Power, More Safety                              More Power, Less Safety
├──────────────────────────────────────────────────────────────────────────┤
Config files    DSLs         Expression      Scripting     General-purpose
(YAML, JSON)   (BeaconSpec)  languages       languages     languages
                             (MVEL)          (Groovy,      (Java, Python)
                                              Lua)
```

**Config files** are safe but inflexible — you can only do what the config schema allows. **General-purpose languages** are infinitely flexible but dangerous — a user could write an infinite loop or access the filesystem.

MVEL hits a sweet spot for the "user-defined predicate" use case:

- **Expressive enough** to handle complex boolean conditions with string matching, numeric comparisons, null handling, and grouping
- **Restricted enough** that expressions can't allocate memory, start threads, access the network, or call arbitrary methods
- **Simple enough** that a data analyst can write and test expressions without knowing Java

### Guardrails

To keep MVEL safe in a production pipeline, the team applied several constraints:

1. **Whitelisted field access** — expressions could only reference fields explicitly exposed from the beacon data (client, os, bitrate, etc.)
2. **No method calls** — MVEL supports method invocation, but the sandboxed configuration disabled it
3. **Timeout limits** — expression evaluation was bounded; an expression that took too long was killed
4. **Validation on save** — before a new expression was deployed, it was parsed and type-checked against the available fields

---

## MVEL vs. BeaconSpec: Different Tools for Different Jobs

It's worth comparing the two "DSLish" approaches the pipeline used, because they illustrate when to build a custom language vs. when to adopt an existing one:

| Aspect | BeaconSpec | MVEL |
|--------|-----------|------|
| **Purpose** | Define what metrics to compute | Define which data to include/exclude |
| **Type** | External DSL (custom syntax, custom compiler) | Expression language (existing, off-the-shelf) |
| **Users** | Data engineers | Data engineers + analysts + product managers |
| **Output** | Generated MapReduce code | Boolean (true/false per record) |
| **Change cycle** | Compile → deploy → restart | Edit expression → save → immediate effect |
| **Complexity** | Full metric definitions with dimensions, aggregations, metadata | Simple boolean predicates |
| **Build cost** | High (wrote a compiler with JFlex + CUP) | Low (embedded an existing library) |

The lesson: **match the tool to the problem.** BeaconSpec was worth the investment of building a custom compiler because metric definitions are complex, structurally rich, and benefit from code generation. MVEL was the right choice for user filters because predicates are simple, well-served by existing expression languages, and need rapid iteration.

---

## Expression Languages Beyond MVEL

The pattern of "give users a safe way to write logic within guardrails" shows up everywhere in modern data infrastructure:

| System | Expression Mechanism | Use Case |
|--------|---------------------|----------|
| **Apache Kafka** (Streams) | Predicates in the DSL API | Stream filtering and routing |
| **Elasticsearch** | Painless scripting language | Custom scoring, ingest transforms |
| **dbt** | Jinja expressions in SQL | Conditional model logic |
| **Airflow** | Python callables + Jinja templates | Dynamic DAG generation |
| **Grafana** | Alert rule expressions | Monitoring condition definitions |
| **CEL** (Common Expression Language) | Google's sandboxed expression language | Policy evaluation in Kubernetes, IAM |

Google's [CEL](https://github.com/google/cel-spec) is particularly worth noting — it was designed from the ground up for exactly this "safe user-defined expressions" use case, with formal guarantees about termination and resource bounds. If you're building something similar today, CEL is a strong starting point.

---

## When to Use an Expression Language vs. Building a DSL

A quick decision framework:

**Use an expression language (MVEL, CEL, Jinja, SpEL) when:**
- Users need to express conditions, predicates, or simple transformations
- The output is a value (boolean, number, string) — not a program or artifact
- Changes should take effect immediately without a build step
- Multiple non-engineering personas need to write expressions

**Build a custom DSL when:**
- The domain has rich structure (dimensions, aggregations, relationships) that benefits from dedicated syntax
- You want to generate code, tests, metadata, or documentation from the definitions
- Compile-time validation provides significant value (catching errors before production)
- The investment in tooling (parser, compiler, IDE support) pays back across hundreds of definitions

Both approaches share the core DSL philosophy: **let users express *what* they want in domain terms, and handle the *how* automatically.** They just do it at different scales of ambition.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Pipeline series](/blog/) for more.*
