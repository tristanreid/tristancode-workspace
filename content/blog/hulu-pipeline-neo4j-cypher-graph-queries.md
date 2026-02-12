---
title: "Pattern Matching in Graphs: A Practical Introduction to Neo4j and Cypher"
description: "How to query connected data by drawing the patterns you're looking for — and why SQL struggles where graphs shine."
series: "Hulu Data Platform"
series_weight: 60
weight: 5
skin: hulu
links:
  - label: "Hadoop Summit 2014 Talk"
    url: "https://www.youtube.com/watch?v=VjXwoHUCvOQ"
  - label: "Slides"
    url: "https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit"
---

*What if you could query a database by sketching the shape of the answer?*

---

In the [previous post](/blog/hulu-pipeline-email-explosion-monitoring/), we saw how monitoring a data pipeline with traditional tools leads to alert fatigue and cognitive overload. The core problem: when a MapReduce job fails, you can detect the failure — but you can't easily answer the question that matters: *"Who is affected, and how badly?"*

Answering that question requires traversing a web of connections: jobs produce tables, tables feed reports, reports serve user groups, user groups belong to business units. This is a **graph problem** — and graph problems call for a graph database.

This post introduces **Neo4j** and its query language **Cypher**. If you've never used a graph database, this is your starting point. If you have, the pipeline-monitoring examples will show a practical application you might not have considered. In the next post, we'll apply these tools to build the contextual troubleshooting system that solved Hulu's monitoring problem.

---

## Why Graph Databases Exist

Relational databases are built around tables, rows, and joins. They excel when your data fits neatly into a fixed schema and your queries involve a predictable number of table lookups.

But some questions are fundamentally about **connections**:

- "Which reports are affected by this failed job?" (1 hop? 2 hops? 5?)
- "What's the shortest dependency path from this data source to the CEO's dashboard?"
- "Show me everything downstream of this table."

In a relational database, each hop in the chain requires another JOIN. If you don't know how many hops deep the connection goes, you need recursive CTEs — which are awkward to write, hard to optimize, and often slow.

Graph databases store data as **nodes** (things) and **relationships** (connections between things). Traversing connections isn't an afterthought bolted onto a table-oriented engine — it's the fundamental operation the database is optimized for.

---

## The Property Graph Model

Neo4j uses a **property graph** model. Three building blocks:

### Nodes

A node is a thing — a person, a job, a table, a report. Nodes have:
- **Labels** that categorize them (like a type): `Job`, `Table`, `Report`, `User`
- **Properties** that describe them (key-value pairs): `{name: "daily_playback", status: "failed"}`

### Relationships

A relationship connects two nodes. Relationships have:
- A **type** that names the connection: `PRODUCES`, `FEEDS`, `SERVES`, `DEPENDS_ON`
- A **direction**: from one node to another
- Optional **properties**: `{since: "2014-01-15"}`

### Properties

Both nodes and relationships can carry arbitrary key-value properties. No rigid schema — you can add properties as needed.

The result is a structure that looks like a whiteboard diagram: circles connected by arrows, each annotated with labels and data.

---

## Cypher: Drawing Your Queries

Cypher is Neo4j's query language, and its defining feature is **ASCII-art pattern matching**. Instead of declaring joins between tables, you draw the shape of the data you're looking for.

### The Basics

Nodes are wrapped in parentheses. Relationships are arrows:

```cypher
-- A node
(j:Job)

-- A relationship
(j:Job)-[:PRODUCES]->(t:Table)

-- A longer path
(j:Job)-[:PRODUCES]->(t:Table)-[:FEEDS]->(r:Report)
```

That last line reads: "A Job that produces a Table that feeds a Report." The pattern is the query.

### MATCH: Finding Patterns

`MATCH` finds all subgraphs in the database that fit your pattern:

```cypher
-- Find all jobs that produce tables
MATCH (j:Job)-[:PRODUCES]->(t:Table)
RETURN j.name, t.name
```

```cypher
-- Find all reports fed by a specific table
MATCH (t:Table {name: "playback_hourly"})-[:FEEDS]->(r:Report)
RETURN r.name, r.owner
```

```cypher
-- Find the full chain: job → table → report → user
MATCH (j:Job)-[:PRODUCES]->(t:Table)-[:FEEDS]->(r:Report)-[:SERVES]->(u:User)
WHERE j.status = "failed"
RETURN j.name, t.name, r.name, u.name
```

That last query is the killer. In one statement, it answers: "For every failed job, show me the tables it produces, the reports those tables feed, and the users who receive those reports." Four entities, three joins — and the query reads like a sentence.

### CREATE: Building the Graph

Creating data uses the same visual syntax:

```cypher
-- Create a job node
CREATE (j:Job {name: "daily_playback_mr", type: "MapReduce", status: "running"})

-- Create nodes and a relationship in one statement
CREATE (j:Job {name: "hourly_ads_mr"})-[:PRODUCES]->(t:Table {name: "ad_impressions_hourly"})

-- Connect existing nodes
MATCH (t:Table {name: "ad_impressions_hourly"})
MATCH (r:Report {name: "Daily Ad Performance"})
CREATE (t)-[:FEEDS]->(r)
```

### WHERE: Filtering

Filter on properties, just like SQL:

```cypher
MATCH (j:Job)-[:PRODUCES]->(t:Table)
WHERE j.status = "failed"
  AND j.run_hour = "2014-04-01T03:00"
RETURN j.name, t.name
```

### Aggregation

Cypher has the familiar aggregation functions:

```cypher
-- Count how many reports each user receives
MATCH (u:User)<-[:SERVES]-(r:Report)
RETURN u.name, count(r) AS report_count
ORDER BY report_count DESC
```

---

## Variable-Length Paths: Where Graphs Leave SQL Behind

Here's where graph databases earn their keep. Consider this question: "What is downstream of this failed job — at *any* distance?"

Maybe the job produces a table, which feeds an aggregation, which feeds another aggregation, which feeds a report. That's four hops. Maybe another path is two hops. You don't know in advance.

In Cypher, this is trivial:

```cypher
-- Find everything reachable downstream of a failed job, at any depth
MATCH (j:Job {name: "hourly_playback_mr", status: "failed"})-[*]->(downstream)
RETURN downstream
```

The `[*]` means "follow any number of relationships." You can also bound it:

```cypher
-- Follow 1 to 5 hops
MATCH (j:Job {name: "hourly_playback_mr"})-[*1..5]->(downstream)
RETURN labels(downstream), downstream.name
```

Or restrict the relationship types:

```cypher
-- Only follow PRODUCES and FEEDS relationships, up to 4 hops
MATCH (j:Job {name: "hourly_playback_mr"})-[:PRODUCES|FEEDS*1..4]->(downstream)
RETURN downstream.name, labels(downstream)
```

Now compare this to SQL. To find everything two hops downstream:

```sql
SELECT r.name
FROM jobs j
JOIN job_tables jt ON jt.job_id = j.id
JOIN tables t ON t.id = jt.table_id
JOIN table_reports tr ON tr.table_id = t.id
JOIN reports r ON r.id = tr.report_id
WHERE j.name = 'hourly_playback_mr'
  AND j.status = 'failed';
```

That's already five joins for two hops — and you had to know the intermediate tables (`job_tables`, `tables`, `table_reports`, `reports`) in advance. For three hops, you'd add more joins. For "any number of hops," you'd need a recursive CTE:

```sql
WITH RECURSIVE downstream AS (
  SELECT id, name, 'Job' AS type, 0 AS depth
  FROM pipeline_entities
  WHERE name = 'hourly_playback_mr' AND status = 'failed'

  UNION ALL

  SELECT e.id, e.name, e.type, d.depth + 1
  FROM pipeline_entities e
  JOIN dependencies dep ON dep.source_id = d.id AND dep.target_id = e.id
  JOIN downstream d ON true
  WHERE d.depth < 10
)
SELECT * FROM downstream;
```

The recursive CTE works, but it requires a generic `dependencies` table (flattening all relationship types into one table), careful depth limiting to avoid infinite loops, and mental gymnastics to reason about. The Cypher version — `(j)-[*]->(downstream)` — says the same thing in a line.

This was exactly the argument for using a graph database at Hulu (slide 39 of the [presentation](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit)):

> **Why a graph instead of RDBMS?**
> Indeterminate number of joins. Query for graph connectedness is trivial and short. Query for connectedness with SQL relies on knowing the intermediate resources.

---

## Why Not a Tree?

If the data were purely hierarchical — every node has exactly one parent — a tree would suffice. But pipeline data is **recombinant**: a single metric might appear in multiple reports, and those reports might serve overlapping sets of users.

```
Job A ──→ Table X ──→ Report 1 ──→ User Group Alpha
                  └──→ Report 2 ──→ User Group Alpha
                                └──→ User Group Beta
Job B ──→ Table X  (same table, different producer)
```

Table X has two producers and feeds two reports. Report 2 serves two user groups. User Group Alpha receives both Report 1 and Report 2. This isn't a tree — it's a graph. Forcing it into a tree means duplicating nodes, which means inconsistency and stale data.

---

## A Complete Pipeline Monitoring Example

Let's put it together. Imagine we've modeled the data pipeline as a graph:

```cypher
-- Create the graph
CREATE (j1:Job {name: "hourly_playback_mr", status: "failed", hour: "2014-04-01T03:00"})
CREATE (j2:Job {name: "hourly_ads_mr", status: "completed", hour: "2014-04-01T03:00"})
CREATE (t1:Table {name: "playback_hourly"})
CREATE (t2:Table {name: "ad_impressions_hourly"})
CREATE (t3:Table {name: "playback_daily"})
CREATE (r1:Report {name: "Daily Content Performance"})
CREATE (r2:Report {name: "Weekly Executive Summary"})
CREATE (r3:Report {name: "Ad Revenue Dashboard"})
CREATE (g1:UserGroup {name: "Content Team", priority: "high"})
CREATE (g2:UserGroup {name: "Executive Staff", priority: "critical"})
CREATE (g3:UserGroup {name: "Ad Sales", priority: "high"})

CREATE (j1)-[:PRODUCES]->(t1)
CREATE (j2)-[:PRODUCES]->(t2)
CREATE (t1)-[:FEEDS]->(t3)
CREATE (t1)-[:FEEDS]->(r1)
CREATE (t3)-[:FEEDS]->(r2)
CREATE (t2)-[:FEEDS]->(r3)
CREATE (r1)-[:SERVES]->(g1)
CREATE (r2)-[:SERVES]->(g2)
CREATE (r3)-[:SERVES]->(g3)
```

Now the monitoring questions become simple queries:

```cypher
-- Q1: What's affected by the failed job?
MATCH (j:Job {status: "failed"})-[*]->(affected)
RETURN labels(affected)[0] AS type, affected.name
ORDER BY type
```

Result:
```
type       | name
-----------|---------------------------
Report     | Daily Content Performance
Report     | Weekly Executive Summary
Table      | playback_hourly
Table      | playback_daily
UserGroup  | Content Team
UserGroup  | Executive Staff
```

One query. Complete downstream impact assessment.

```cypher
-- Q2: Which high-priority user groups are affected?
MATCH (j:Job {status: "failed"})-[*]->(g:UserGroup)
WHERE g.priority IN ["high", "critical"]
RETURN g.name, g.priority
```

```cypher
-- Q3: What's the full dependency path from failure to executive impact?
MATCH path = (j:Job {status: "failed"})-[*]->(g:UserGroup {name: "Executive Staff"})
RETURN [node IN nodes(path) | node.name] AS dependency_chain
```

Result:
```
dependency_chain
["hourly_playback_mr", "playback_hourly", "playback_daily", "Weekly Executive Summary", "Executive Staff"]
```

That dependency chain is exactly what an on-call engineer needs at 3 AM: "This job failed. Here's the chain of things between it and the people who will notice."

---

## Key Cypher Concepts Summary

| Concept | Syntax | Example |
|---------|--------|---------|
| Node | `(n:Label {prop: val})` | `(j:Job {status: "failed"})` |
| Relationship | `-[:TYPE]->` | `-[:PRODUCES]->` |
| Pattern match | `MATCH pattern RETURN ...` | `MATCH (j:Job)-[:PRODUCES]->(t) RETURN t` |
| Filter | `WHERE condition` | `WHERE j.status = "failed"` |
| Variable-length path | `-[*min..max]->` | `-[:FEEDS*1..5]->` |
| Any-length path | `-[*]->` | `(j)-[*]->(downstream)` |
| Create | `CREATE pattern` | `CREATE (j:Job {name: "x"})` |
| Aggregation | `count()`, `collect()`, etc. | `RETURN count(r) AS total` |
| Path extraction | `nodes(path)`, `relationships(path)` | `RETURN [n IN nodes(path) \| n.name]` |

---

## What's Next

Now that we have the tools — a graph database to model pipeline dependencies, and Cypher to query them — we can build the system that actually solved Hulu's monitoring problem. In the next post, we'll see how the team flipped the monitoring model from "what failed?" to "who is affected?" — using exactly the kind of graph queries we just learned.

---

*This post is part of a series based on [Monitoring the Data Pipeline at Hulu](https://docs.google.com/presentation/d/1yETDcfD1IADBHgor0LDEjwqcDoGlt2Epdjlm0DajUrM/edit), presented at [Hadoop Summit 2014](https://www.youtube.com/watch?v=VjXwoHUCvOQ). See the full [Hulu Data Platform series](/blog/) for more.*
