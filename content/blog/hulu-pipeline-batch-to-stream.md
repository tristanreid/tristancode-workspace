---
title: "From Batch to Stream: What 2014's Lessons Mean for Today's Pipelines"
description: "The Hadoop Summit talk was about MapReduce. But the principles — DSLs, graph-based monitoring, user-centric thinking — are more relevant than ever in the streaming era."
series: "Hulu Pipeline"
weight: 9
skin: hulu
links:
  - label: "Hadoop Summit 2014 Talk"
    url: "https://www.youtube.com/watch?v=VjXwoHUCvOQ"
  - label: "Slides"
    url: "https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit"
---

*The tools have changed. The principles haven't.*

---

This series has been based on a talk from [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). The technology stack — MapReduce, HDFS, Hive, hourly batch partitions — is unmistakably of its era. Nobody starts a new data pipeline on MapReduce in the 2020s.

But rewatch the talk, and something becomes clear: almost nothing in it is *about* MapReduce. It's about how to think about data pipelines at scale. The problems it solved — boilerplate explosion, alert fatigue, impact-blind monitoring, self-service reporting — are exactly the problems modern data teams face today.

This closing post maps the 2014 lessons onto today's landscape and asks: what would we do differently, and what would we do exactly the same?

---

## What's Changed Since 2014

The macro shift is from **batch** to **streaming** (or at least, streaming-first with batch as a special case):

| 2014 | Now |
|------|-----|
| MapReduce (Java) | Flink, Spark Structured Streaming, Kafka Streams |
| HDFS (hourly partitions) | Kafka topics, Iceberg/Delta Lake tables |
| Hourly batch processing | Real-time or micro-batch (seconds to minutes) |
| Hive for ad-hoc queries | Trino, Spark SQL, BigQuery, Snowflake |
| Custom job scheduler (Scala/Akka) | Airflow, Dagster, Prefect, Temporal |
| Graphite/OpenTSDB | Prometheus, Grafana, Datadog |
| Custom reporting portal | Looker, Metabase, Superset, Hex |

The tooling is dramatically better. But the architectural patterns — and the failure modes — are strikingly similar.

---

## Lesson 1: DSLs Are More Relevant Than Ever

BeaconSpec ([Post 2](/blog/beaconspec-hulu-dsl-data-pipeline/)) was built because hand-coding MapReduce jobs for every metric was unsustainable. Today, nobody hand-codes MapReduce — but the DSL impulse has spread everywhere.

### Modern DSLs for Data Pipelines

| System | DSL | What It Replaces |
|--------|-----|-----------------|
| **dbt** | SQL + Jinja + YAML config | Hand-written ETL scripts |
| **Dataform** | SQLX (SQL + JavaScript) | Manual BigQuery pipeline management |
| **Apache Beam** | Unified API (Java/Python/Go) | Platform-specific streaming code |
| **Flink SQL** | SQL over streams | Imperative Flink Java/Scala |
| **KSQL / ksqlDB** | SQL over Kafka topics | Kafka Streams Java API |
| **Terraform / Pulumi** | HCL / TypeScript | Manual infrastructure provisioning |
| **Great Expectations** | Declarative data quality specs | Ad-hoc validation scripts |

The pattern is identical to BeaconSpec: **declare *what* you want computed, and let the framework handle *how*.** dbt is, in many ways, the spiritual successor to BeaconSpec — it lets analysts write metric definitions in a high-level language (SQL + Jinja), and generates the execution plan, dependency graph, tests, and documentation automatically.

The lesson from 2014 that still holds: **if your engineers are writing boilerplate, you need a DSL.** The form factor has evolved (YAML configs, SQL-based, Python decorators), but the principle is unchanged.

### What We'd Do Differently

BeaconSpec compiled to Java MapReduce code. Today, we'd likely define metrics in a dbt-like framework that generates SQL or Spark/Flink jobs. The compilation target changed; the abstraction didn't.

We'd also invest earlier in IDE support. BeaconSpec had a custom compiler but no syntax highlighting, auto-completion, or inline error checking. Modern DSL tooling (Language Server Protocol, VS Code extensions) makes this much more achievable.

---

## Lesson 2: Expression Languages and Self-Service Are Table Stakes

MVEL ([Post 7](/blog/hulu-pipeline-mvel-user-jobs/)) gave non-specialists the ability to define custom pipeline logic safely. This was ahead of its time — today, every major data platform has some version of this:

- **Airflow** uses Python callables and Jinja templates for dynamic DAG generation
- **dbt** uses Jinja expressions for conditional SQL logic
- **Kafka Connect** uses Single Message Transforms with configurable predicates
- **Grafana** uses expression-based alert rules
- **Google's CEL** provides a purpose-built, sandboxed expression language for policy evaluation

The tension we discussed — power vs. safety — is still the central design question. Google's CEL deserves special mention because it was designed with formal guarantees about termination and resource bounds, directly addressing the "what if a user writes an infinite loop?" problem.

### What We'd Do Differently

Today we'd probably use CEL or a similar purpose-built expression language instead of MVEL. The Java ecosystem has evolved, and there are better options for sandboxed evaluation. We'd also build a testing/preview environment where users can test their expressions against sample data before deploying to production.

---

## Lesson 3: Alert Fatigue Is Universal (and Still Unsolved)

The [email explosion](/blog/hulu-pipeline-email-explosion-monitoring/) problem hasn't gone away. If anything, it's gotten worse. Modern pipelines have *more* moving parts (microservices, event streams, real-time features), which means more potential failure points and more alerts.

The same failure modes from 2014 repeat in 2025:

- **PagerDuty fatigue** (the new email fatigue) — too many alerts, not enough context
- **Dashboard sprawl** (the new tool sprawl) — Grafana, Datadog, CloudWatch, application-specific UIs, Slack channels
- **Context assembly** — an on-call engineer still bounces between five tools trying to understand what happened

The observation that monitoring needs to show *impact*, not just *status*, is exactly what modern observability platforms are slowly moving toward. Tools like Rootly, FireHydrant, and PagerDuty's AIOps try to correlate alerts with business impact. Service maps in Datadog and Lightstep try to show dependency chains.

But the fundamental insight from 2014 remains uncommon in practice: **model the graph of dependencies from infrastructure failures all the way to the humans who are affected, and use that graph to prioritize.**

### What We'd Do Differently

The graph would be populated automatically. In 2014, the pipeline dependency graph was manually maintained or inferred from job configurations. Today, tools like OpenLineage, Marquez, Amundsen, and DataHub automatically track data lineage — which jobs produce which tables, which tables feed which dashboards. Combining automated lineage with the user-impact model from the Hulu approach would be powerful.

We'd also add cost awareness. Modern cloud-based pipelines have an explicit dollar cost per query, per job, per GB stored. The monitoring graph could include cost signals: "This failure affects a report that costs $X/day to regenerate."

---

## Lesson 4: Graph-Based Thinking Scales

The [contextual troubleshooting model](/blog/hulu-pipeline-graph-troubleshooting/) — connecting failures to affected users through a graph traversal — was the most original idea in the 2014 talk. It's also the idea that has aged best.

Modern data catalogs and lineage tools are building exactly this graph:

| Tool | What It Models |
|------|---------------|
| **OpenLineage** | Job → dataset → job (automated lineage) |
| **DataHub** (LinkedIn) | Datasets, dashboards, pipelines, users, teams |
| **Amundsen** (Lyft) | Tables, dashboards, people, usage stats |
| **Marquez** (WeWork → LF AI) | Jobs, datasets, facets (quality, schema, lineage) |
| **dbt** | Model dependency graph (compiled from SQL references) |

What most of these tools *don't* do — yet — is close the loop from infrastructure failure to human impact in real time. They model lineage (what depends on what) but not monitoring (what's broken right now and who cares). The 2014 Hulu approach combined both in one system, and that combination remains rare.

### What We'd Do Differently

We'd build on top of existing lineage infrastructure (OpenLineage + DataHub or Marquez) rather than building a custom graph from scratch. The lineage graph gives you the "what depends on what" for free. You'd layer on:

1. **Real-time failure signals** from your orchestrator (Airflow, Dagster)
2. **SLA definitions** per report/dashboard/user group
3. **Priority routing** — automatically page the right team based on graph traversal

This is essentially the 2014 architecture rebuilt on modern foundations. The insight — connect infrastructure to users through a graph — is the hard part. The tooling to implement it is now much better.

---

## Lesson 5: Service-Oriented Architecture (Still) Wins

The recurring refrain through the entire presentation: **small distinct services are easy to create, maintain, and wire together.**

This was said two years before the "microservices" term went mainstream. The pipeline used it throughout: separate services for collection, storage, processing, aggregation, publishing, reporting, and monitoring. Each service had a clear API boundary, could be deployed independently, and was owned by the team that understood it best.

Today this is orthodoxy. But it's worth noting *why* it worked so well for the data pipeline specifically:

1. **Different scaling needs** — the collection layer needed high-throughput, low-latency writes. The MapReduce layer needed batch compute. The reporting layer needed low-latency reads. Different services, different resource profiles.
2. **Different change cadences** — BeaconSpec definitions changed weekly. The MapReduce framework changed monthly. The reporting UI changed daily. Independent deployment meant each could move at its own speed.
3. **Blast radius** — a bug in the reporting portal didn't take down data collection. A bad MVEL expression didn't break the aggregation layer. Service boundaries contained failures.

### What We'd Do Differently

We'd formalize the service contracts more. In 2014, the services communicated through HDFS files, database tables, and custom APIs. Today, we'd use schema registries (for data contracts), API specifications (OpenAPI, gRPC), and event-driven communication (Kafka) to make the boundaries explicit and enforced.

---

## The Deeper Lesson

Across all of this — DSLs, expression languages, monitoring, reporting, service architecture — one principle recurs: **model the domain, not the infrastructure.**

- BeaconSpec modeled beacons, dimensions, and facts — not MapReduce mappers and reducers
- MVEL expressions modeled user intent ("show me Chrome fullscreen data") — not pipeline mechanics
- The monitoring graph modeled the path from failures to affected humans — not CPU utilization and JVM heap sizes
- The reporting portal presented metrics and dimensions — not tables and SQL

The infrastructure changes every few years. MapReduce gave way to Spark. Spark is giving way to Flink and streaming-first architectures. Hive gave way to Trino. Custom monitoring gave way to Datadog.

But the domain endures. People still need to define metrics. They still need to filter data. They still need to know who's affected when something breaks. They still need self-service access to analytics.

Build for the domain, and the infrastructure transitions become manageable.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Pipeline series](/blog/) for more.*
