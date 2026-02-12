---
title: "Think Like a User: Graph-Based Troubleshooting for Data Pipelines"
description: "How flipping the monitoring model from 'what failed?' to 'who is affected?' transformed pipeline operations — using a graph database and the Cypher skills from the previous post."
series: "Hulu Pipeline"
weight: 6
skin: hulu
links:
  - label: "Hadoop Summit 2014 Talk"
    url: "https://www.youtube.com/watch?v=VjXwoHUCvOQ"
  - label: "Slides"
    url: "https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit"
---

*Detection of a problem isn't enough. We need to think of things from the report users' perspectives.*

---

In [Post 4](/blog/hulu-pipeline-email-explosion-monitoring/), we saw how traditional monitoring fails at scale: email explosions, tool sprawl, and a consolidated UI that detects failures but can't assess impact. In [Post 5](/blog/hulu-pipeline-neo4j-cypher-graph-queries/), we learned Neo4j and Cypher — the graph database and query language that make connected-data questions trivial.

Now we combine them. This post is the payoff: the system that actually solved Hulu's monitoring problem.

---

## The Fundamental Shift

Traditional pipeline monitoring asks: **"What failed?"**

That's the wrong first question. The right first question is: **"Who is affected?"**

A failed MapReduce job is an infrastructure event. An analyst whose daily report shows stale data is a *business* event. The first might be interesting; the second is urgent. But without a model connecting infrastructure to users, every failure looks equally important — and when everything is equally important, nothing is.

The team at Hulu recognized that they needed to model the pipeline from the **report user's perspective**:

```
Report Users
  └── receive Reports
        └── which have Runs (successful or failed)
              └── which depend on Tables
                    └── which are produced by Jobs
```

Flip this upside down:

```
Jobs (this is where failures happen)
  └── produce Tables
        └── feed Reports
              └── serve User Groups
                    └── belong to Business Units
```

Now a job failure has a clear path to business impact.

---

## The Contextual Troubleshooting Model

The system the team built rested on four principles:

### 1. Connect Issues to Business Units

Every pipeline entity — jobs, tables, aggregations, reports — lives in a graph. Relationships encode the data flow: `PRODUCES`, `FEEDS`, `AGGREGATES`, `SERVES`. When something fails, a graph traversal instantly reveals which business units are downstream.

### 2. Better Impact Assessment

Not all failures are equal. A failed job that feeds a deprecated test table is noise. A failed job that feeds the executive dashboard is a 3 AM page. The graph encodes this priority: user groups have importance levels, reports have SLAs, and the traversal carries that context back to the failure.

```cypher
-- Find all high-priority user groups affected by failures in the last hour
MATCH (j:Job {status: "failed"})-[*]->(g:UserGroup)
WHERE j.run_hour = "2014-04-01T03:00"
  AND g.priority IN ["high", "critical"]
RETURN j.name AS failed_job,
       collect(DISTINCT g.name) AS affected_groups,
       max(CASE g.priority WHEN "critical" THEN 2 WHEN "high" THEN 1 ELSE 0 END) AS max_severity
ORDER BY max_severity DESC
```

### 3. Tune Performance Per User Needs

Different user groups have different latency tolerances. The content analytics team might need hourly data within 30 minutes. The finance team might only need daily data by 9 AM. The graph can encode these SLAs and flag failures that actually threaten them, while staying silent about failures that don't.

### 4. A Graph Data Structure, Populated with What We Care About

The key insight is in that phrase: "populated with the stuff we care about." The graph isn't a generic dependency tracker. It's specifically modeled around the entities that connect infrastructure failures to human impact: jobs, tables, reports, user groups, and business units.

---

## Why a Graph? (Revisited)

We covered this in the [Cypher post](/blog/hulu-pipeline-neo4j-cypher-graph-queries/), but it's worth restating in context:

### Instead of RDBMS

The number of joins between a failed job and the affected user group is **indeterminate**. A job might produce a table that directly feeds a report (2 hops). Or it might produce a table that feeds an intermediate aggregation that feeds another aggregation that feeds a report (4 hops). In SQL, you'd need to know the intermediate resources to write the query. In Cypher:

```cypher
MATCH (j:Job {status: "failed"})-[*]->(g:UserGroup)
RETURN j.name, g.name
```

One line. Any depth. No intermediate knowledge required.

### Instead of a Tree

Pipeline data is **recombinant**. A single metric table might feed multiple reports. A single report might serve multiple user groups. A user group might receive reports from completely different branches of the pipeline. Trees can't represent this without duplicating nodes. Graphs handle it naturally.

---

## Building the Monitoring UI

The contextual troubleshooting system combined the graph model with a web interface that let on-call engineers investigate failures in context.

### The Investigation Flow

Here's how the system worked in practice, walking through an actual investigation:

**Step 1: See the failures.**

The UI shows all failures from the current time window. Not as a wall of emails, but as a filterable, sortable list with severity indicators derived from the graph. Critical-path failures (those affecting high-priority user groups) bubble to the top.

**Step 2: Filter and focus.**

Clicking a failure category reveals the specific jobs. In one investigation, most of the Hive failures were on the same table — but it was a commonly used table, so the impact was wide. The filtering let the engineer see this pattern immediately instead of discovering it after triaging a dozen individual alerts.

**Step 3: See the downstream impact.**

For each failure (or group of failures), the UI shows the matched reports — the reports that depend on the failed data. This is the graph traversal in action. The engineer doesn't need to memorize which reports use which tables; the system knows.

**Step 4: Drill into details.**

Log links on each failure take the engineer directly to the relevant error output. No more grepping through log files or navigating the Hadoop UI. The path from "something is broken" to "here's the stack trace" is two clicks.

### What Changed

Compare this flow to the pre-graph approach:

| Before (Traditional) | After (Graph-Based) |
|---|---|
| Email arrives: "Job X failed" | Dashboard shows failures ranked by business impact |
| Open Hadoop UI, find the job | Click the failure, see the error and downstream impact |
| Manually figure out which tables are affected | Graph traversal shows all affected tables automatically |
| Ask around: "Does anyone use these tables?" | Matched reports and user groups shown immediately |
| Grep logs for the error | Log link right there in the UI |
| Decide if it's urgent based on gut feeling | Priority derived from user group importance |

The total time from "something broke" to "here's who cares and here are the logs" went from 20+ minutes of context assembly to seconds.

---

## The Deeper Lesson: Model the Domain, Not the Infrastructure

The graph-based approach succeeded because it modeled the **domain** — the relationships between pipeline entities and the humans who depend on them — rather than the **infrastructure** — CPU utilization, JVM heap sizes, task attempt counts.

Infrastructure metrics are necessary but not sufficient. They tell you *that* something happened. Domain models tell you *why it matters*.

This is the same principle that made BeaconSpec effective (see [Post 2](/blog/beaconspec-hulu-dsl-data-pipeline/)). The DSL modeled the domain — beacons, dimensions, facts — not the infrastructure (MapReduce mappers, reducers, partition keys). The monitoring graph modeled the domain — jobs, tables, reports, users — not the infrastructure (YARN containers, HDFS blocks, task trackers).

In both cases, **the right abstraction at the right layer transformed the entire system.**

---

## In Summary

Three takeaways from the monitoring evolution:

### Find the Important Questions and Measure the Right Data

The important question wasn't "which job failed?" — it was "who is affected and how badly?" Once the team reframed the question, the solution (a graph connecting failures to users) became obvious.

### Make Troubleshooting Easy

The best monitoring system is one where the investigation path is so smooth that on-call engineers can diagnose and resolve issues in minutes, not hours. The graph-based UI turned a multi-tool scavenger hunt into a click-through flow.

### Small Distinct Services Are Easy to Create, Maintain, and Wire Together

The monitoring system wasn't a monolith. The graph database was a service. The failure detection was a service. The log aggregation was a service. The UI assembled them. When one piece needed an upgrade, the others were unaffected.

This was the architecture philosophy throughout: at the pipeline level (separate collection, storage, processing, reporting services), at the DSL level (separate compiler, scheduler, validator), and at the monitoring level (separate detection, graph, UI). Small pieces, loosely joined, each doing one thing well.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Pipeline series](/blog/) for more.*
