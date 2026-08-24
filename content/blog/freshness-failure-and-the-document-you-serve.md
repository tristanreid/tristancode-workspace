---
title: "Freshness, Failure, and the Document You Serve"
description: "When a source read fails, do you keep serving the last good copy or drop the document? I shipped both policies in the same system — and the reversal was about the environment changing, not about the first answer being wrong."
weight: 10
series: "From Rows to Retrieval"
series_weight: 140
skin: graph
---

Your pipeline tries to re-read a document it indexed last week. The read
fails.

You have to decide something, right now, and there are only two options.
Keep serving what you already have — a copy that was correct last week and
might still be. Or remove the document from the corpus, on the grounds that
you can no longer confirm it exists, or that you're still allowed to see it.

I've shipped both policies in the same system. First "keep the last good
copy," deliberately. Later "drop it," equally deliberately. The interesting
part isn't which one is right — neither is, universally. It's *why the
correct answer inverted*, because the code that made the decision barely
changed while the world around it changed completely.

This continues a series about search systems as
[projections rather than truth](/blog/search-index-not-source-of-truth/). A
freshness policy is where that abstraction gets uncomfortably concrete: your
projection is a claim about a world you can only observe intermittently, and
sometimes the observation fails.

## The original policy, and why it was right

The first version of this system was an enterprise document search
application I built at Netflix. Three characteristics of its early life
shaped the failed-read policy, and all three pointed the same direction.

**Reads failed constantly.** The APIs the pipeline used to fetch documents
were aggressively rate-limited, and a meaningful fraction of fetches failed
on any given run. That's the crucial one, so let me be precise about what it
implies: when failures are that common, **a failed read carries almost no
information about the document.** It's a fact about my quota, not about
whether that document still exists. Dropping documents on failure would have
meant a corpus that flickered — documents vanishing and reappearing based on
which fetches happened to land, with no correlation to anything a user would
consider meaningful.

**The audience was small and senior.** Early access was limited to a
relatively small group of fairly senior people, who already had broad access
to internal information. If the system served a document whose read had
failed, the realistic downside was small: it was very likely a document that
reader could have opened anyway.

**Getting into the corpus was hard.** The criteria for a document to enter
the corpus were restrictive. That made corpus membership meaningful — a
document that was in there had passed a deliberately high bar. Its presence
was evidence in its own favor, so throwing it out over an infrastructure
hiccup was destroying something expensive to replace.

Add those up and "keep serving the last good version" isn't a compromise,
it's the correct reading of the evidence. A failure meant "ask again later,"
so the system said: assume the document is fine, keep serving what we have,
retry.

{{< themed-svg "/images/search-series/failed-read" "The same failed-read event under two regimes: when reads fail constantly a failure is noise about infrastructure and the policy is to keep serving; when reads are reliable a failure is signal about the document and the policy is to drop it" >}}

## Then all three assumptions expired

Over the following period, every one of those three conditions stopped being
true — not because of any single decision about freshness, but because the
application succeeded.

**I got the rate limits resolved.** Fetching became reliable. And the moment
reads almost always succeed, the meaning of a failure inverts: it goes from
noise to signal. A failure is now much more likely to mean something *about
the document* — it was deleted, it moved, or my access to it was revoked.
The exact same event, carrying the opposite implication, purely because the
base rate changed.

**The app went company-wide.** The audience was no longer a small group with
broad existing access. It became everyone, with wildly varying entitlements.
Now consider the specific failure mode where a fetch fails *because
permission was revoked*: under the old policy, the system responds to
"you can no longer read this" by continuing to serve the copy it made when
it could. With a small senior audience that's a rounding error. Company-wide,
it's a system that leaks access-controlled content in the exact situation
designed to prevent it.

**Corpus criteria became broad.** As the corpus opened up to far more
sources, membership stopped being evidence of anything. A document being
present no longer meant it had passed a bar; it meant nobody had stopped it.
And that flips the scarce resource in the whole design. When entry is
expensive, the thing you protect is *inclusion* — you err toward keeping
documents, because losing one is costly. When entry is cheap and automatic,
inclusion takes care of itself, and the thing people desperately need is
**a reliable lever for exclusion**: a way to say "not this one," and have it
stick.

So the policy reversed. A document whose latest read failed is excluded from
the served corpus, rather than served from cache.

## The lesson I actually took

It would be easy to write this up as "we learned better," and that framing
would be false. The first policy was well-reasoned for its conditions. What
happened is subtler and, I think, more useful:

> **A policy is a compressed set of assumptions about its environment. When
> the environment changes, the policy doesn't fail loudly — it just quietly
> becomes the wrong answer, while continuing to run exactly as designed.**

Nothing broke when the rate limits were fixed. No test failed when the
audience expanded. The freshness policy kept doing precisely what it was
built to do, and every day it did so it was a little more wrong. That's the
dangerous shape of this class of bug: no error, no alert, no symptom until
someone notices that a document they lost access to is still showing up in
search.

Which suggests a practice I've become insistent about since: **write down the
conditions a policy depends on, next to the policy.** Not the behavior — the
*justification*. "We serve the last good copy because reads fail often enough
that a failure tells us nothing, and because our audience already has broad
access." A comment like that turns an invisible expiry into a visible one.
The day someone fixes the rate limits, there's a decent chance they read the
sentence and think: wait, that assumption was mine, and I just deleted it.

There's a second lesson underneath the first, about what a signal *means*
rather than what it says. Engineers tend to treat an error as an error — a
fetch failed, handle it. But the information content of a failure depends
entirely on how often failures happen. A 5% failure rate makes each failure
nearly meaningless. A 0.1% failure rate makes each failure worth acting on.
Same event, same code path, completely different inference. Any system that
makes decisions from failures should know its own base rate, and ideally
should notice when that base rate moves.

## What I'd build now

The mechanical mistake that makes this hard to change later is overloading a
single "latest" field — one record that means both "when did we last try?"
and "what content do we have?" Keeping those separate makes the policy a
decision rather than a side effect:

```json
{
  "resource_id": "doc:ABC",
  "latest_attempt": {
    "at": "2025-03-08T12:00:00Z",
    "status": "timeout",
    "error_class": "transient"
  },
  "latest_success": {
    "at": "2025-03-07T12:00:00Z",
    "content_version": "sha256:…"
  },
  "serving_policy": {
    "visible": true,
    "reason": "transient_failure_within_grace_period",
    "reevaluate_at": "2025-03-08T13:00:00Z"
  }
}
```

Three things this structure buys you, all of which I wanted at some point and
didn't have:

**The error class drives the policy.** A timeout and a 403 are both failures
and should never be treated the same way. A timeout is a statement about the
network; a permission error is a statement about the document, and it should
remove the document immediately rather than entering any grace period. Once
you're classifying errors, the transient-versus-authoritative distinction
does most of the work.

**Visibility becomes explicit and explainable.** `serving_policy.reason`
means a support question — "why is this still showing up?" — has an answer
you can look up instead of reconstruct. It also gives you a corpus-wide
metric that would have caught my expired policy years earlier: how many
documents are currently visible only because of a grace period? If that
number quietly falls to near zero because reads got reliable, your grace
period isn't protecting anything anymore. If it spikes, something upstream is
broken.

**Grace periods get an expiry, not just a state.** `reevaluate_at` makes
"keep serving for now" a bounded promise rather than an indefinite one. The
version of this policy I'd defend today isn't really either of the two I
shipped — it's a short, explicit grace period for transient failures,
immediate removal for authoritative ones, and a hard limit after which
unconfirmable documents leave regardless.

And then the part that isn't about failures at all: **give people levers.**
Once corpus entry is broad and automatic, the ability to exclude — a
document, a path, a whole source — has to be a first-class, low-friction
feature with an audit trail, not a support ticket that ends in someone
editing a config. That's the requirement that emerged from the same shift
that flipped the freshness policy, and it's the one I'd build earliest if I
were starting over. Broad automatic inclusion without good exclusion tools
isn't a generous corpus; it's an unaccountable one.

## The general shape

Freshness is usually discussed as a latency problem: how quickly do edits
show up? That's the easy half. The hard half is what to do when you *can't
tell* — and the answer depends on facts about your environment that live
nowhere in your code: how reliable your sources are, who's reading the
results, and how much a document's presence in the corpus is supposed to mean.

Get in the habit of asking, of any serving system: what does it do when it
can't confirm something, and when was that decision last examined against the
conditions that justified it? In my experience the second half of that
question is the one nobody has asked recently.

Next in this series: entity resolution without an LLM — how deterministic
matching and plain corpus statistics resolve ambiguous names, and why I'd
still reach for them first.
