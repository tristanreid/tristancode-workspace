---
title: "12,000 Events Per Second: Inside Hulu's Beacon Data Pipeline"
description: "How Hulu collected, transformed, and processed billions of events daily — the architecture behind 175 MapReduce jobs per hour."
series: "Hulu Pipeline"
weight: 1
skin: hulu
links:
  - label: "Hadoop Summit 2014 Talk"
    url: "https://www.youtube.com/watch?v=VjXwoHUCvOQ"
  - label: "Slides"
    url: "https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit"
---

*Every click, every playback start, every ad impression — 12,000 events per second flowing into a system that could never pause, never drop data, and never fall behind.*

---

## The Firehose

In the early 2010s, Hulu's data engineering team faced a challenge familiar to anyone running analytics at scale: the data never stops.

Every time a user pressed play, skipped an ad, switched devices, or adjusted their video quality, the Hulu client fired off an event called a **beacon**. These were simple HTTP requests — fire-and-forget telemetry that captured what was happening across millions of concurrent viewing sessions.

The numbers were relentless:

- **Average**: ~12,000 events per second
- **Peak**: ~35,000 events per second
- **Downtime budget**: zero — data loss was unacceptable

This wasn't a system you could take offline for maintenance windows. It ran continuously, 24/7, and every event mattered. A missed playback-start beacon meant undercounting views. A dropped ad-impression beacon meant revenue discrepancies. The pipeline had to be both fast and bulletproof.

---

## What's a Beacon?

A beacon is a small, structured HTTP request that captures a single event. Here's what a raw beacon looked like:

```
/v3/playback/start?
  bitrate=650
  &cdn=Akamai
  &channel=Anime
  &client=Explorer
  &computerguid=EA8FA1000232B8F6986C3E0BE55E9333
  &contentid=5003673
  …
```

URL-encoded key-value pairs. Verbose, messy, and completely unstructured from the database's perspective — but each one contained a rich snapshot of a user's moment: what they were watching, on what device, through which CDN, at what bitrate.

The design philosophy was **fire and forget**: the client sends the beacon and moves on immediately. It doesn't wait for a response. It doesn't retry. The receiving infrastructure handles reliability.

Three properties defined the beacon system:

1. **Fire & Forget** — Clients send and forget. No blocking the user experience.
2. **HTTP Format** — Standard HTTP GET requests. Simple, debuggable, compatible with every load balancer and proxy in existence.
3. **High Availability** — The collection layer had to be always-on. If it went down, beacons were lost forever.

---

## From Raw Events to Structured Storage

Once beacons arrived at the collection layer, they entered a pipeline designed around one principle: **get the data safely onto disk as fast as possible, then process it at leisure.**

### Step 1: Log Collection → HDFS

Raw beacon data was collected and written to HDFS (the Hadoop Distributed File System). Files were organized by two axes:

- **Beacon type** — playback/start, ads/impression, error/playback, etc.
- **Time partition** — bucketed by hour

So at any given time, you could look at HDFS and find a directory like `/beacons/playback/start/2013/04/01/00/` containing all the playback-start events from midnight to 1 AM on April 1st, 2013.

This partitioning was deliberate. Downstream processing needed to operate on specific beacon types within specific time windows. Hourly partitions gave the batch jobs a natural unit of work: process this hour's data, move on to the next.

### Step 2: MapReduce — From Beacons to Basefacts

The raw beacons were verbose and denormalized. The MapReduce layer transformed them into structured **basefacts** — the dimensional model that downstream reporting depended on:

```
video_id            | 289696
content_partner_id  | 398
distribution_partner_id | 602
distro_platform_id  | 14
is_on_hulu          | 0
hourid              | 383149
watched             | 76426
```

Each basefact was a clean, typed row: dimensions (video_id, partner, platform) and facts (counts, sums, durations). This transformation — from messy URL parameters to clean dimensional data — was the core work of the pipeline.

And there was a *lot* of it: **150–175 MapReduce jobs ran every hour**, each one processing a different beacon type or computing a different metric.

### Step 3: Aggregation & Publishing

Basefacts were hourly. But report users needed daily, weekly, monthly, quarterly, and annual aggregations. A cascade of aggregation jobs rolled up the hourly basefacts into progressively coarser time grains:

```
Hourly basefacts
  → Daily aggregations
    → Weekly aggregations
      → Monthly aggregations
        → Quarterly aggregations
          → Annual aggregations
```

The aggregated data was then **published** — pushed to databases where the reporting tools could query it.

---

## The Pipeline in One Picture

Zooming all the way out, here's the flow from a user pressing "Play" to an analyst running a report:

```
User action
  → Beacon (HTTP event)
    → Collection layer (high availability)
      → HDFS (bucketed by type, partitioned by hour)
        → MapReduce (beacons → basefacts)
          → Aggregation (hourly → daily → ... → annual)
            → Publishing (push to report databases)
              → Reporting Portal (self-service queries)
```

Every stage had to be reliable. Every stage had to be fast. And every stage had to be monitored — because when something broke at the MapReduce layer, the effects cascaded: aggregations stalled, published data went stale, and reports showed yesterday's numbers.

This is the system we'll be exploring throughout this series. In the next post, we'll look at how the team tamed the complexity of 175 MapReduce jobs by building a domain-specific language — **BeaconSpec** — that let engineers declare *what* to compute instead of writing *how* to compute it.

---

## What Made This Architecture Work

A few principles recurred throughout the pipeline's design:

### Service-Oriented Thinking

Hulu's engineering culture favored small teams with specialized scopes, each building tools for other developers. The pipeline wasn't a monolith — it was a collection of services, each doing one thing well: collection, storage, transformation, aggregation, publishing, reporting.

This meant each piece could be developed, deployed, and scaled independently. It also meant each piece could be *monitored* independently — a property that would become crucial (and insufficient) as we'll see in later posts.

### Declarative Over Imperative

Rather than hand-coding each MapReduce job, the team built a DSL (BeaconSpec) that let engineers *declare* metric definitions. Rather than hand-coding user filters, they adopted MVEL expressions. The pattern was consistent: where possible, describe *what* you want and let the framework handle *how*.

### Right Tool for the Job

The pipeline used Java for MapReduce, Scala and Akka for job scheduling, JFlex and CUP for the DSL compiler, HDFS for storage, and Hive for ad-hoc queries. No single language or framework dominated. Each component used whatever was best suited to its role.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Pipeline series](/blog/) for more.*
