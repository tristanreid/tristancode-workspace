---
title: "The Reporting Layer: Building a Data API for Self-Service Analytics"
description: "How Hulu turned raw pipeline output into a self-service reporting platform — with query generation, scheduling, and a portal that put data in users' hands."
series: "Hulu Pipeline"
weight: 8
skin: hulu
---

*The pipeline processes the data. The aggregation layer rolls it up. But none of that matters if the people who need the numbers can't get to them.*

---

Earlier in this series, we covered how data [flowed through Hulu's pipeline](/blog/hulu-pipeline-12000-events-per-second/) from raw beacons to structured basefacts and up through aggregation layers. But a pipeline that produces clean, aggregated data is only half the story. The other half is **getting that data to the humans who make decisions with it.**

At Hulu, the reporting layer was a multi-service stack that turned pipeline output into on-demand, self-service analytics. It's worth examining because it solved a problem that nearly every data team faces: how do you give report users autonomy without giving them footguns?

---

## The Challenge: From Aggregated Tables to Answers

By the time data reached the reporting layer, it had been through the wringer: collected as beacons, transformed by MapReduce into basefacts, and rolled up through hourly, daily, weekly, monthly, and quarterly aggregations. The data was clean and structured.

But "clean and structured" doesn't mean "accessible." The aggregated data lived in Hive tables — powerful but not user-friendly. Expecting a product manager or content strategist to write Hive queries was unrealistic.

The team needed a stack that could:

1. **Let non-technical users request reports** without writing code
2. **Validate requests** before executing them (Are these columns available? Is the date range valid?)
3. **Generate efficient queries** from high-level specifications
4. **Schedule and queue reports** so the cluster wasn't overwhelmed
5. **Present results** in a browsable, shareable format

---

## The Architecture

The reporting stack was a pipeline-within-the-pipeline, composed of distinct services:

### Reporting Portal UI (RP2)

The user-facing web application. Report users — analysts, product managers, content teams — interacted with this portal to:

- Browse available metrics and dimensions
- Select columns, date ranges, and filters
- Submit report requests
- View completed reports
- Schedule recurring reports

The key design decision: the portal presented **domain concepts**, not database concepts. Users saw "video starts by content partner, daily, last 30 days" — not "SELECT content_partner_id, SUM(total_count) FROM playback_daily WHERE hourid BETWEEN..."

### Report Controller

The orchestration service. When a user submitted a report request through the portal, the Report Controller:

1. **Validated the request** — checked that the requested columns existed, the date range was within available data, and the combination of dimensions and metrics was valid
2. **Generated the query** — translated the high-level report specification into an optimized Hive query
3. **Submitted the query** to the execution layer

Validation before execution was crucial. Without it, users would submit malformed requests, wait 20 minutes for execution, and get a cryptic Hive error. With it, they got immediate, friendly feedback: "The column 'device_type' isn't available for ad impression data. Did you mean 'platform_type'?"

### Data API Service

The abstraction layer between the portal and the underlying data infrastructure. The Data API:

- Exposed available columns and their metadata (types, descriptions, valid date ranges)
- Handled authentication and authorization (not every user could see every metric)
- Provided a consistent interface regardless of whether the underlying data was in Hive, a published database, or a cache

This service decoupled the portal from the storage layer. If the team moved data from Hive to a faster query engine, the portal didn't need to change.

### HiveRunner

The execution engine. HiveRunner:

- Received generated queries from the Report Controller
- Managed a queue of pending queries
- Executed queries against the Hive cluster
- Handled retries, timeouts, and resource management
- Returned results to the Report Controller for delivery to the portal

### Scheduler

For recurring reports — "send the daily content performance report to the Content Team every morning at 8 AM" — the Scheduler service handled:

- Cron-like scheduling of report executions
- Dependency checking (don't run the daily report if the daily aggregation hasn't completed yet)
- Notification on completion or failure

### Published Databases

For frequently-accessed, latency-sensitive reports, the aggregated data was published to optimized databases (outside Hive) that could serve queries faster. This was the "popular data publishing" path: identify which reports are run most often, pre-compute their results, and serve them from a fast store.

---

## The Flow

Here's a complete request lifecycle:

```
User opens Reporting Portal (RP2)
  → Browses available columns via Data API
  → Selects dimensions, metrics, date range, filters
  → Submits report request

Report Controller receives request
  → Validates columns and date range (via Data API)
  → Generates optimized Hive query
  → Submits to HiveRunner queue

HiveRunner executes query
  → Manages queue position and cluster resources
  → Runs query against Hive
  → Returns results

Report Controller delivers results
  → Formats for display in portal
  → Stores for later retrieval
  → Notifies user: "Your report is ready"

User views completed report in RP2
```

---

## Design Lessons

Several aspects of the reporting architecture generalize well beyond Hulu:

### 1. Validate Before You Execute

The single biggest usability improvement in the reporting stack was front-loading validation. Every invalid request caught at submission time is a query that doesn't waste cluster resources and a user who doesn't wait 15 minutes for an error.

Modern analytics tools (Looker, dbt, Metabase) all do this: type-check the query, validate field references, and check data availability before execution. In 2013, building this validation layer was a deliberate architectural choice.

### 2. Separate the Interface from the Engine

The Data API's abstraction layer meant the portal could evolve independently from the data infrastructure. This is the same principle behind modern semantic layers (dbt metrics, Looker's LookML, Cube.js): define the business logic once in a middle tier, and let the UI and the query engine each do their job.

### 3. Queue and Prioritize

Not all report requests are equal. A recurring daily report for the executive team should take priority over an ad-hoc exploration. The scheduler and queue in HiveRunner handled this, ensuring that high-priority reports completed on time even when the cluster was busy.

### 4. Publish Popular Data

The hot-path optimization — pre-computing and publishing frequently-accessed reports to faster stores — is the same pattern that today's analytics engineers call "materialized views" or "metric layer caching." The insight was the same in 2013: if you know what people will ask for, prepare the answer in advance.

### 5. Domain Language in the UI

The portal presented domain concepts (metrics, dimensions, content partners, platforms), not database concepts (tables, columns, JOINs). This is what made it truly self-service. Users didn't need to know that "video starts by partner" meant a specific Hive query against a specific table with specific aggregation — they just asked for what they wanted.

This echoes the same "declarative over imperative" philosophy that drove BeaconSpec and MVEL. At every layer — metric definition, data filtering, and now report generation — the pattern was the same: express *what* you want, and the system handles *how*.

---

## How This Connects to Monitoring

One important detail: the reporting layer was also a *consumer* of the pipeline, which made it a critical part of the monitoring graph we discussed in [Post 6](/blog/hulu-pipeline-graph-troubleshooting/).

When a MapReduce job failed, the impact rippled through: basefacts weren't produced, aggregations stalled, and reports returned stale data (or failed entirely). The graph-based monitoring system modeled these connections: Job → Table → Aggregation → Published Data → Report → User Group.

The reporting architecture's clean service separation made this modeling straightforward. Each service boundary was a natural node in the graph. The scheduled reports provided the link between data infrastructure and business users. Without the reporting layer's structure, the monitoring graph would have had no way to connect failures to the humans who cared about them.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Pipeline series](/blog/) for more.*
