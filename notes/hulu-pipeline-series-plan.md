# Hulu Data Pipeline Blog Series — Expanded Plan

## Source Material

- **Presentation**: [Hulu Pipeline](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit?slide=id.p1#slide=id.p1) (45 slides)
- **Video**: [Monitoring the Data Pipeline at Hulu — Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ) (35 min)
- **Related**: [BeaconSpec on Medium](https://medium.com/lai-blog/beaconspec-8fb6d480470c)
- **SlideShare**: [Monitoring the Data Pipeline at Hulu](https://www.slideshare.net/slideshow/t-435phall1reidv2/35985404)

All posts in this series should include a reference block linking to the presentation and video. Use this standard footer:

```markdown
*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Pipeline series](/blog/) for more.*
```

---

## Series Structure — 9 Posts

### Main narrative arc (Posts 1–6)

| # | Weight | Title | File | Slides | Status |
|---|--------|-------|------|--------|--------|
| 1 | 1 | 12,000 Events Per Second: Inside Hulu's Beacon Data Pipeline | `hulu-pipeline-12000-events-per-second.md` | 1–14 | **New** |
| 2 | 2 | Why Hulu Built a DSL for Its Data Pipeline | `beaconspec-hulu-dsl-data-pipeline.md` | 15–16 | Existing |
| 3 | 3 | Building Your First DSL: Python & Scala | `writing-dsls-python-scala.md` | — | Existing |
| 4 | 4 | The Email Explosion: Why Monitoring a Data Pipeline Is Harder Than You Think | `hulu-pipeline-email-explosion-monitoring.md` | 23–35 | **New** |
| 5 | 5 | Pattern Matching in Graphs: A Practical Introduction to Neo4j and Cypher | `hulu-pipeline-neo4j-cypher-graph-queries.md` | — | **New** |
| 6 | 6 | Think Like a User: Graph-Based Troubleshooting for Data Pipelines | `hulu-pipeline-graph-troubleshooting.md` | 36–44 | **New** |

### Supplementary deep-dives (Posts 7–9)

| # | Weight | Title | File | Slides | Status |
|---|--------|-------|------|--------|--------|
| 7 | 7 | MVEL and User-Defined Jobs: Letting Users Configure Their Own Pipeline | `hulu-pipeline-mvel-user-jobs.md` | 17 | **New** |
| 8 | 8 | The Reporting Layer: Building a Data API for Self-Service Analytics | `hulu-pipeline-reporting-layer.md` | 18–22 | **New** |
| 9 | 9 | From Batch to Stream: What 2014's Lessons Mean for Today's Pipelines | `hulu-pipeline-batch-to-stream.md` | — | **New** |

Posts 1–6 tell the main story: build the pipeline → give it a DSL → try to monitor it → learn graphs → solve monitoring with graphs. Posts 7–9 are supplementary deep-dives that expand on specific aspects.

---

## Presentation Structure (Slide-by-Slide Mapping)

| Slides | Section | Topic | Blog Post |
|--------|---------|-------|-----------|
| 1–7 | Intro | Who am I, what's Hulu, service-oriented culture | Post 1 (opening context) |
| 8–10 | Beacons | Fire-and-forget HTTP events, beacon format, collection/transform/process | Post 1 |
| 11 | Pipeline | Pipeline overview: monitoring + reporting | Post 1 |
| 12–13 | Scale | 12K events/sec avg, 35K peak, "data never stops" | Post 1 |
| 14 | Storage | Log collection → HDFS, bucketed by type, partitioned by hour | Post 1 |
| 15 | MapReduce | Beacons → basefacts transformation | Post 1 / Post 2 |
| 16 | BeaconSpec | DSL, JFlex & CUP compiler, job scheduler (Scala/Akka) | Post 2 (existing) |
| 17 | MVEL | User-defined jobs with MVEL expressions | Post 7 |
| 18 | Aggregation | Hourly → daily → weekly → monthly → quarterly → annual; publishing | Post 1 / Post 8 |
| 19–22 | Reporting | RP2 DB, Report Controller, Data API Service, HiveRunner, Reporting Portal UI | Post 8 |
| 23 | Monitoring | Section header | Post 4 |
| 24 | Problem | "Big data pipeline? Bet that's going great for you." | Post 4 (opening) |
| 25 | Email Explosions | Change gatekeeping overhead, consumption problems | Post 4 |
| 26–27 | Tools | "Lots of monitoring tools available" | Post 4 |
| 28 | Confusion | "WHAT'S GOING ON??!??" — the cognitive overload moment | Post 4 |
| 29–34 | Take One | Comprehensive web UI, service-oriented arch, but multitasking still fails | Post 4 |
| 35 | Transition | "Take that! Data pipeline issues!" (false victory) | Post 4 |
| 36 | Realization | Detection alone isn't enough — need user perspective | Post 6 |
| 37 | User Model | Report Users → reports → run status → user groups | Post 6 |
| 38 | Graph Model | Contextual troubleshooting: connect issues to business units, impact assessment | Post 6 |
| 39 | Why a Graph | vs. RDBMS (indeterminate joins), vs. tree (recombinant data) | Post 5 / Post 6 |
| 40–42 | Demo | Investigation walkthrough: filtered failures, hive table, matched reports, log links | Post 6 |
| 43 | Success | It works! | Post 6 |
| 44 | Summary | Find important questions, measure right data, make troubleshooting easy, small services | Post 6 (conclusion) |
| 45 | Credits | Team acknowledgments | — |

---

## Post Specifications

### Post 1 (NEW): "12,000 Events Per Second: Inside Hulu's Beacon Data Pipeline"

**Weight**: 1 | **Slides**: 1–14 | **File**: `hulu-pipeline-12000-events-per-second.md`

The big picture. Opens with scale (12K events/sec, 35K peak), introduces beacons as fire-and-forget HTTP events, walks through the full pipeline from collection to HDFS to MapReduce to aggregation to reporting. Sets the stage for everything that follows.

**Sections**: What are beacons → The scale challenge → Raw events to structured storage → The pipeline in one picture → 150–175 MapReduce jobs per hour.

**Key slides to screenshot**: 9 (beacon flow), 10 (raw beacon URL), 11 (pipeline overview), 12 (12K events/sec), 14 (HDFS bucketing), 15 (basefact schema).

---

### Post 2 (EXISTING): "Why Hulu Built a DSL for Its Data Pipeline"

**Weight**: 2 | **File**: `beaconspec-hulu-dsl-data-pipeline.md`

Already written. Needs: connecting intro paragraph referencing Post 1, series footer update (done).

**Key slide to add**: 16 (BeaconSpec architecture: DSL → JFlex/CUP → Generated Java → Scheduler).

---

### Post 3 (EXISTING): "Building Your First DSL: Python & Scala"

**Weight**: 3 | **File**: `writing-dsls-python-scala.md`

Already written. Needs: connecting intro paragraph referencing Post 2, series footer update (done).

---

### Post 4 (NEW): "The Email Explosion: Why Monitoring a Data Pipeline Is Harder Than You Think"

**Weight**: 4 | **Slides**: 23–35 | **File**: `hulu-pipeline-email-explosion-monitoring.md`

The monitoring problem statement. Opens with sardonic tone ("Big data pipeline? Bet that's going great for you."), walks through email alert fatigue, tool sprawl, cognitive overload, the first-generation consolidated UI approach, and why detection alone isn't enough.

**Sections**: Big data reality check → Email explosions → Tool sprawl → Cognitive overload → Take One: consolidate everything → Does this solve our problems?

**Key slides to screenshot**: 24 (sardonic opener), 25 (email explosions), 28 (WHAT'S GOING ON??), 29–34 (monitoring UI concepts).

---

### Post 5 (NEW): "Pattern Matching in Graphs: A Practical Introduction to Neo4j and Cypher"

**Weight**: 5 | **Slides**: 39 (partial) | **File**: `hulu-pipeline-neo4j-cypher-graph-queries.md`

Explainer post that teaches the reader Cypher and graph thinking before Post 6 applies it. Uses pipeline monitoring examples to keep it connected to the series, but is self-contained enough to be useful to anyone learning Neo4j.

**Sections**: Why graph databases → Nodes, relationships, properties → Cypher's ASCII-art pattern syntax → Basic queries (MATCH, WHERE, RETURN, CREATE) → Path traversal and variable-length patterns → Graph vs. SQL for connected data → Setting up the pipeline monitoring connection.

---

### Post 6 (NEW): "Think Like a User: Graph-Based Troubleshooting for Data Pipelines"

**Weight**: 6 | **Slides**: 36–44 | **File**: `hulu-pipeline-graph-troubleshooting.md`

The resolution. Applies the graph concepts from Post 5 to solve the monitoring problem from Post 4. The key insight: flip from "what failed?" to "who is affected?"

**Sections**: Detection isn't enough → The user perspective → The contextual troubleshooting model → Why a graph (vs. RDBMS, vs. tree) → Investigation walkthrough → The payoff → Lessons learned.

**Key slides to screenshot**: 37 (user perspective model), 38 (contextual troubleshooting graph), 39 (why a graph), 40–42 (investigation walkthrough).

---

### Post 7 (NEW): "MVEL and User-Defined Jobs: Letting Users Configure Their Own Pipeline"

**Weight**: 7 | **Slides**: 17 | **File**: `hulu-pipeline-mvel-user-jobs.md`

Deep-dive into MVEL expressions for user-defined pipeline logic. Connects to the DSL theme (Posts 2–3) — MVEL is another form of domain-specific language, but for a different audience and purpose. Explores the design tension: how much power do you give users? How do you keep it safe?

**Sections**: The user jobs problem → What is MVEL → Expression examples → Safety and sandboxing → Connection to DSL thinking → When expression languages beat full DSLs.

---

### Post 8 (NEW): "The Reporting Layer: Building a Data API for Self-Service Analytics"

**Weight**: 8 | **Slides**: 18–22 | **File**: `hulu-pipeline-reporting-layer.md`

Deep-dive into the reporting architecture: aggregation (hourly → daily → weekly → monthly), the Data API Service, HiveRunner, report scheduling, and the self-service Reporting Portal UI.

**Sections**: From basefacts to reports → Aggregation layers → The reporting architecture → Self-service query building → Lessons for modern analytics stacks.

**Key slide to screenshot**: 19 (full reporting flow).

---

### Post 9 (NEW): "From Batch to Stream: What 2014's Lessons Mean for Today's Pipelines"

**Weight**: 9 | **File**: `hulu-pipeline-batch-to-stream.md`

Reflective capstone. The 2014 talk was about batch processing with MapReduce. How do the same principles (DSLs, graph-based monitoring, user-centric thinking) apply to modern streaming architectures (Kafka, Flink, Spark Streaming)? Positions the series as relevant to today's practitioners.

**Sections**: What's changed since 2014 → DSLs in the streaming era → Monitoring streaming pipelines → The user-centric insight is timeless → What we'd do differently today.

---

## Cross-Cutting Themes

1. **Declarative over Imperative** — BeaconSpec, MVEL, the reporting portal, Cypher itself. The team repeatedly chose to let users declare *what* they wanted rather than writing *how* to get it.

2. **Small Services, Loosely Coupled** — Pre-microservices-hype, but doing it right. Each monitoring concern is a separate service.

3. **Think from the User's Perspective** — The central insight of the talk. Every post should reinforce this.

4. **Automation as a Force Multiplier** — The DSL generates code, validators, test scaffolding, metadata. The monitoring graph auto-connects failures to affected users.

---

## Imagery Strategy

### Slide Screenshots

Export key slides as PNGs from Google Slides. Place in `static/images/hulu-pipeline/`.

**Priority slides to export:**
1. Slide 9 — "External View of Beacons" (pipeline flow)
2. Slide 11 — "The Pipeline" (monitoring + reporting overview)
3. Slide 12 — "Data Collection" (12K events/sec)
4. Slide 15 — "MapReduce" (basefact schema)
5. Slide 16 — "Hulu MapReduce Metrics Jobs" (BeaconSpec architecture)
6. Slide 19 — "Reporting Flow" (full reporting architecture)
7. Slide 25 — "Email Explosions" (monitoring problem)
8. Slide 37 — "The User Perspective" (report-user model)
9. Slide 38 — "Contextual Troubleshooting Model" (the graph)
10. Slide 39 — "Why a Graph?" (vs. RDBMS, vs. tree)

### Recreated Diagrams (SVGs matching `hulu` theme)

- Pipeline flow: beacons → HDFS → MR → aggregation → reporting
- Contextual troubleshooting graph
- User-perspective model
- Cypher pattern examples (ASCII-art style, matching the visual pattern-matching syntax)

---

## Front Matter Template

```yaml
---
title: "Post Title"
description: "One-line summary"
series: "Hulu Pipeline"
weight: N
skin: hulu
---
```
