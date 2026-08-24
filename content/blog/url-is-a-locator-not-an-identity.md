---
title: "A URL Is a Locator, Not an Identity"
description: "Five URLs can point at one document. If your search corpus treats them as five documents, everything downstream — dedup, ranking, the link graph, RAG citations — inherits the mistake."
weight: 10
series: "From Rows to Retrieval"
series_weight: 130
skin: graph
---

Here are five strings. They all point at the same document.

```text
https://docs.example.test/document/d/ABC/edit
https://docs.example.test/document/d/ABC/view?tab=notes
https://drive.example.test/open?id=ABC
https://go.example.test/launch-plan
https://redirect.example.test/?url=https%3A%2F%2Fdocs.example.test%2Fdocument%2Fd%2FABC
```

One person opened it from a file browser. One followed a company short link.
One pasted it out of an email that routed through a click-tracking wrapper.
One was reading the notes tab. They are five different *observations of how
someone got there* — and exactly one document.

If your pipeline treats those as five documents, here's what you've actually
built: a search result page with the same document listed five times, each
copy holding one-fifth of the evidence about how important it is. The link
graph splits into five weakly-connected nodes instead of one well-connected
one. Freshness checks refresh five records, disagreeing about which is
current. Five near-identical chunks land in your vector store, so a RAG
retrieval that wanted three distinct sources gets one document wearing three
hats. And when a colleague reports that "the launch plan doesn't come up," you
will spend an afternoon confirming that it does, in fact, come up — as
`hosted-document:ABC-but-with-a-tab-parameter`, ranked forty-first.

This post is about the step that prevents all of that: deriving a **canonical
identity** for the things in your corpus, and understanding that URLs are
evidence toward that identity rather than the identity itself.

It's the third post in a series arguing that a search index is
[a projection, not the truth](/blog/search-index-not-source-of-truth/), and
that most retrieval failures are manufactured upstream of retrieval. Identity
is the purest example of that claim I know.

## Identity is not a string comparison

Every engineer's first instinct here is a `normalize_url()` function:
lowercase the host, drop the fragment, sort the query parameters, strip the
trailing slash. Write it once, use it everywhere.

That function is worth having and it will not be sufficient, for a reason
worth stating precisely: **the rule for extracting identity depends on what
kind of resource you're looking at.**

- For a hosted document, the identity is an opaque ID embedded in the path,
  and everything else — `/edit`, `/view`, `?tab=notes` — is a *view* of it
  that should be discarded.
- For a dashboard, the URL may name a specific view inside a workbook, and
  the identity you actually want is usually the workbook.
- For a web application, identity may be the host itself, since the paths are
  ephemeral UI state.
- For a file in a source repository, the full path *is* the identity — the
  repository is far too coarse, since `README.md` and `docs/setup.md` are
  entirely different documents that a repository-level ID would merge into
  one.

Notice that last one runs in the opposite direction from the others: three
rules say "throw away path detail," and one says "keep all of it." No generic
normalizer can know that, because it isn't a fact about URL syntax. It's a
fact about the systems those URLs come from. This is the crux of the post:
**identity is domain knowledge, not string processing** — and it belongs in a
classification step that says "this is a hosted document" before it says
"therefore its ID is this part."

{{< themed-svg "/images/search-series/url-identity" "Six observed URLs — including one with trailing punctuation copied from prose — pass through seven canonicalization stages and resolve to a single canonical resource identity" >}}

## The stages

A canonicalization pipeline that survives contact with real corpora ends up
with roughly seven stages, and they have to happen in this order.

**1. Extract URLs from text.** Links don't arrive as tidy fields; they arrive
embedded in prose, in chat messages, in structured fields that sometimes
contain a sentence, in nested JSON blobs. You need a URL matcher that can
find candidates anywhere, including inside arbitrarily nested structures.

**2. Strip syntax noise.** URLs copied out of prose bring the prose with
them: a trailing period, a comma, a closing parenthesis, a quotation mark,
sometimes an invisible non-printing character. This step is unglamorous and
it is where an outsized share of bugs live. More on that in a moment.

**3. Validate the form.** Reject what isn't a supported URL: malformed
strings, domains you deliberately exclude, schemes you don't handle. Better
to drop it here, explicitly, than to have it fail mysteriously three stages
later.

**4. Unwrap redirect wrappers.** Click-trackers and safety scanners
encapsulate the real URL as a query parameter. That's a pure string
operation — the true target is right there, percent-encoded — and it's worth
doing before you make any network calls.

**5. Resolve short links, with a bound.** A short link (`go/launch-plan`) is
a promise that only the resolver can keep, so this stage does I/O. Which
means it needs the full defensive kit: cache aggressively (the same handful
of aliases appear constantly), rate-limit the resolver so your batch job
doesn't take out an internal service, follow at most a small fixed number of
hops, and **persist the resolution status alongside the result** so a failure
is a recorded fact rather than a silent absence. Short links pointing to
short links are common enough to matter, and short link cycles exist. A hop
limit isn't paranoia; it's the difference between a bounded job and one that
hangs.

**6. Classify the resource, then extract its ID.** The type-specific step
from the previous section. Classification first, identity second.

**7. Keep the original.** Deriving a canonical ID is lossy, and you will want
the loss back. Store the observed URLs and the redirect chain alongside the
canonical record:

```json
{
  "resource_id": "hosted-document:ABC",
  "canonical_url": "https://docs.example.test/document/d/ABC",
  "observed_urls": [
    "https://docs.example.test/document/d/ABC/edit",
    "https://docs.example.test/document/d/ABC/view?tab=notes",
    "https://drive.example.test/open?id=ABC",
    "https://go.example.test/launch-plan"
  ],
  "redirect_chain": [
    "https://go.example.test/launch-plan",
    "https://docs.example.test/document/d/ABC/edit"
  ]
}
```

Provenance earns its storage three ways. It's how you debug ("why did these
two merge?"), it's how you re-derive identity when a rule changes without
re-crawling the world, and it's how a user who searched for the short link
they remember still finds the document.

## The closing parenthesis that broke the graph

The stage-2 bugs are the ones I want to dwell on, because they illustrate
something about pipelines that I think is underappreciated.

Someone writes, in a design doc:

> See the launch plan (https://docs.example.test/document/d/ABC/edit).

Your extractor pulls out `https://docs.example.test/document/d/ABC/edit).` —
with the closing parenthesis and the period attached. Now trace what happens
downstream, one step at a time. The canonical ID derived from that string
doesn't match the real document's ID, so it becomes its own resource. Fetching
it fails, because that URL doesn't exist. The edge from the design doc to the
launch plan is never created. The launch plan therefore has one fewer
incoming link — and if the design doc was its *only* inbound link from a
trusted source, the launch plan now sits outside the boundary of your
discovery graph entirely. It isn't in the corpus. It cannot be returned.

The user's experience of this: "search is bad." The actual defect: one
character of punctuation, five stages upstream, in a regex.

I've watched versions of this play out more than once, and the general lesson
has stuck with me harder than any specific fix: **in a retrieval pipeline,
ingestion defects don't announce themselves as ingestion defects. They
present as relevance problems.** A missing document produces no error
anywhere — it's an absence, and absences don't page you. This is why I'd
argue corpus-construction code deserves the same testing rigor as ranking
code, even though ranking gets all the attention.

## Test it like a parser, because it is one

Canonicalization is the rare pipeline component that's trivially unit
testable — it's a pure function from string to identity — so there's no
excuse for not having a table of cases that grows every time something
surprises you:

| Raw input | Expected type | Expected stable ID | Why |
|---|---|---|---|
| `.../document/d/ABC/edit` | hosted document | `hosted-document:ABC` | drop the view suffix |
| `.../document/d/ABC/edit).` | hosted document | `hosted-document:ABC` | strip trailing punctuation |
| `.../document/d/ABC/view?tab=notes` | hosted document | `hosted-document:ABC` | drop view params |
| `go.example/launch-plan` | short link → document | `hosted-document:ABC` | resolve the chain |
| `.../dashboard/workbooks/42/views/7` | dashboard | `dashboard:42` | workbook is the identity |
| `.../repo/docs/setup.md` | repository file | full normalized path | repo ID is too coarse |
| `https://excluded.example.test/x` | excluded | *(none)* | rejected on purpose |

Every row in a table like this should be a bug someone actually hit. Written
that way, the table becomes a compact history of everything your corpus has
taught you about the systems it draws from — which is a genuinely valuable
artifact, and one that transfers to the next person far better than the regex
does.

## Identity is a decision, and decisions change

One more property, easy to miss until it bites: identity is a *policy you
chose*, which means it can change — and changing it rewrites history.

Suppose you decide dashboards should be identified by workbook rather than by
individual view. That's almost certainly an improvement. It also means
documents that were previously five separate resources are now one, and any
downstream artifact keyed by the old identity — index documents, graph edges,
embeddings, cached summaries, a user's saved link — refers to something that
no longer exists.

Which is where this connects back to the
[previous post on rebuilds](/blog/zero-downtime-index-rebuilds-aliases/): an
identity change is exactly the kind of change that's trivial if you can
rebuild your index from a warehouse, and terrifying if you can't. If
canonicalization is a pure function applied during a rebuild, changing the
rule is a code change plus a rebuild. If identity was assigned once, at crawl
time, and never recorded how it was derived, changing the rule means a
migration with no ground truth to migrate from. This is the practical
argument for keeping `observed_urls` around: it's the raw material that makes
re-derivation possible.

The general form of that idea: **derive identity, don't assign it.** A
derived identity can be recomputed when your understanding improves. An
assigned one is a fact you can no longer question.

## What to take from this

If you're building a corpus out of things that have URLs:

1. **Treat a URL as an observation**, not a name. The name is what you derive.
2. **Classify before you identify.** The rule differs by resource type, and
   sometimes runs in the opposite direction (keep the whole path, don't
   strip it).
3. **Do string work before network work.** Unwrap redirect wrappers before
   you resolve short links, and bound every chain you follow.
4. **Persist status, not just success.** A failed resolution is data.
5. **Keep the originals.** Provenance is what lets you change your mind later.
6. **Test canonicalization like a parser**, with a table of real cases,
   because a one-character error here surfaces as "search is bad" and
   nowhere else.

None of this involves ranking, models, or anything a reader would call
"search technology." That's rather the point. Retrieval quality is decided by
whether your system knows what things *are* long before it decides which of
them to show.

Next in this series: what to serve when the source of a document goes dark —
freshness policy, failed reads, and a decision I got wrong and later
deliberately reversed.
