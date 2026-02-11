---
title: "Scoring Entity Matches — When Finding Isn't Enough"
description: "A trie finds the strings. Scoring decides which matches are real. Here's the disambiguation model that solves the 'You' problem."
weight: 20
series: "Entity Detection: Finding What Matters in Text"
skin: graph
---

In [Part 1](/blog/entity-detection-the-you-problem/), we saw the fundamental tension of entity detection: a trie is excellent at finding strings in text, but finding a string isn't the same as finding an entity. The show "You" matches everywhere. "The Crown" matches "the crown jewels." The scan is perfect. The results are useless.

The solution is **scoring** — a system that assigns a confidence value to every match, so you can separate real entity mentions from coincidental string overlaps. The scoring model is surprisingly simple, built from a handful of intuitive signals that layer together to produce remarkably good disambiguation.

---

## Signal 1: How Distinctive Is the Name?

The single most powerful signal is **distinctiveness** — how likely is it that this string, in general text, refers to the entity?

"Stranger Things" is highly distinctive. Outside of conversations about the show, people rarely write those two words together. If you find "Stranger Things" in a document, it's almost certainly about the show.

"You" is the opposite. It appears in virtually every English document ever written. Finding "You" in a document tells you almost nothing.

We can quantify this. If you count how many Wikipedia articles contain a given term, you get a measure of how common it is in general text. A term that appears in 5 Wikipedia articles is distinctive. A term that appears in 5 million is not.

The formula borrows from **TF-IDF** (term frequency–inverse document frequency), a classic information retrieval technique:

```python
import math

def likelihood(entity_term, wiki_doc_frequency, baseline_relevance=500_000):
    """
    Score how distinctive an entity name is.
    
    Lower wiki_doc_frequency = more distinctive = higher score.
    baseline_relevance controls the scale — think of it as 
    "how popular does a term need to be before we start discounting it?"
    """
    if wiki_doc_frequency is None or wiki_doc_frequency == 0:
        return 1.0  # unknown frequency → neutral score
    return math.log(1.0 + baseline_relevance / wiki_doc_frequency) / 10.0
```

Here's what this produces for real show titles:

| Title | Wikipedia Appearances | Likelihood Score |
|:---|---:|---:|
| **Stranger Things** | ~2,500 | 0.53 |
| **Squid Game** | ~1,800 | 0.56 |
| **The Witcher** | ~8,000 | 0.41 |
| **Dark** | ~4,200,000 | 0.01 |
| **You** | ~5,800,000 | 0.00 |

"Stranger Things" gets a score 50× higher than "You." This single number captures the intuition: distinctive names are confident matches; generic names are not.

The log function matters. It compresses the scale so that the difference between "somewhat common" and "very common" is smaller than the difference between "rare" and "somewhat common." This matches our intuition — "The Witcher" (8,000 articles) is meaningfully more distinctive than "Dark" (4.2 million), but both are in a different league than "Stranger Things" (2,500).

---

## Signal 2: Case Sensitivity

Consider two occurrences of the show "You" in a document:

> "**You** should watch this — it's a thriller about a bookstore manager."
>
> "Have **you** seen anything good lately?"

The first "You" is capitalized at the start of a sentence — but it's also describing the show. The second "you" is clearly a pronoun. How do we distinguish them?

The answer is the **dual-trie pattern**: build *two* tries from the same catalog.

```python
class EntityDetector:
    def __init__(self, catalog):
        self.case_sensitive_trie = Trie()
        self.case_insensitive_trie = Trie()
        
        for entity in catalog:
            for term in entity.search_terms:
                lik = likelihood(term, entity.wiki_frequency)
                
                # Case-sensitive: original casing, 2× confidence
                self.case_sensitive_trie.insert(
                    term, 
                    Match(entity.id, likelihood=lik * 2.0)
                )
                
                # Case-insensitive: lowercased, 1× confidence
                self.case_insensitive_trie.insert(
                    term.lower(), 
                    Match(entity.id, likelihood=lik)
                )
    
    def detect(self, text):
        # Scan with both tries
        cs_matches = self.case_sensitive_trie.find_all(text)
        ci_matches = self.case_insensitive_trie.find_all(text.lower())
        
        # Merge — case-sensitive matches carry 2× weight
        return merge_matches(cs_matches, ci_matches)
```

Case-sensitive matches get **2× the likelihood** of case-insensitive matches. The rationale: if someone writes "Squid Game" with the original capitalization, it's a stronger signal that they mean the show than "squid game" in lowercase.

This doesn't fully solve the "You" problem — "You" at the start of a sentence is capitalized whether it's the show or the pronoun. But combined with the distinctiveness score (which already penalizes "You" heavily), the capitalization bonus pushes genuinely intended references higher while keeping coincidental matches low.

The dual-trie pattern has another benefit: you can choose to **exclude** certain terms from the case-insensitive trie entirely. A show called "You" probably shouldn't be in the case-insensitive trie at all — "you" in lowercase is never going to be a real match. The case-sensitive trie can still catch "You" when someone capitalizes it intentionally.

---

## Signal 3: Where the Match Appears

Not all parts of a document are equal. A show title in a document's **heading** or **title field** is an extremely strong signal — it means the entire document is probably about that show. The same title in the body text is much weaker — it might be a passing mention or a coincidence.

In production, title-field matches are weighted **50×** higher than body matches:

```python
def field_weight(match, field):
    """
    A match in the document title is worth 50 body matches.
    """
    if field == "title":
        return match.likelihood * 50.0
    else:
        return match.likelihood * 1.0
```

This one multiplier has an enormous effect. A low-distinctiveness match like "Dark" in the body text scores `0.01 × 1.0 = 0.01` — effectively nothing. But "Dark" in the document title scores `0.01 × 50.0 = 0.50` — suddenly significant. If someone titled their document "Dark: A Visual Analysis," the system correctly identifies it as likely being about the show.

The field weighting also handles multi-field documents naturally. A document typically has a title, maybe section headings, and body text. You scan each field separately with the same trie, then aggregate scores per entity:

```python
def score_document(detector, doc):
    scores = {}
    
    for field_name, field_text in doc.fields.items():
        matches = detector.detect(field_text)
        for match in matches:
            weight = field_weight(match, field_name)
            if match.entity_id not in scores:
                scores[match.entity_id] = 0.0
            scores[match.entity_id] += weight
    
    return scores
```

The same entity mentioned in the title *and* the body gets both contributions summed. Multiple mentions in the body accumulate. The scoring is additive — more evidence means higher confidence.

---

## Signal 4: Cross-Entity Corroboration

Here's a subtle but powerful signal: entities don't appear in isolation. Documents about a show tend to mention the show's cast. Documents about a country tend to mention its cities.

If a document mentions both **"Stranger Things"** and **"Millie Bobby Brown"**, you can be more confident that both matches are real. The talent mention *corroborates* the show match, and vice versa.

The implementation is straightforward. Your entity catalog includes relationships — which talent is associated with which show. After the initial scoring pass, you check for co-occurrence:

```python
def apply_talent_boost(doc_scores, talent_show_map):
    """
    If a document mentions both a talent and one of their shows,
    boost the show's score by the talent's score.
    """
    talent_scores = {
        eid: score for eid, score in doc_scores.items()
        if entity_type(eid) == "talent"
    }
    
    for talent_id, talent_score in talent_scores.items():
        associated_shows = talent_show_map.get(talent_id, [])
        for show_id in associated_shows:
            if show_id in doc_scores:
                doc_scores[show_id] *= (1.0 + talent_score)
    
    return doc_scores
```

The boost is multiplicative: the show's score is multiplied by `(1 + talent_score)`. A strong talent match (high distinctiveness, case-sensitive, in the title) produces a larger boost. A weak talent match barely moves the needle.

This creates a virtuous cycle: the more corroborating evidence a document contains, the more confident each individual match becomes. A document mentioning "Stranger Things," "Millie Bobby Brown," and "Hawkins, Indiana" has overwhelming evidence for the show — even without any single match being individually conclusive.

---

## Signal 5: Pre-Filtering Common Terms

Some entity names are so common that they shouldn't even be searched for case-insensitively. No amount of scoring can salvage "you" as a case-insensitive match — it will always drown in false positives.

The solution is to **pre-filter** the entity catalog before building the trie. By counting how often each entity name appears in a reference corpus (your own document corpus and/or Wikipedia), you can identify terms that are too common to be useful:

```python
def should_include_case_insensitive(term, corpus_freq, wiki_freq):
    """
    Exclude terms from the case-insensitive trie if they're
    too common to produce useful matches.
    """
    return (
        corpus_freq < 8                    # rare in our own documents
        or wiki_freq < 6_400               # rare in Wikipedia
    )
```

The thresholds are calibrated empirically — you run the pipeline, inspect the false positive rate, and adjust. The exact numbers depend on your corpus size and entity catalog, but the principle is universal: don't search for things you know you won't find.

Terms that fail the filter are still included in the **case-sensitive** trie. "You" won't be searched case-insensitively, but if someone writes "You" with intentional capitalization in a context that suggests the show, the case-sensitive trie will catch it.

This is an important architectural choice: **filtering happens at trie construction time, not at query time.** The trie you broadcast to your cluster is already pruned. Every executor scans with the clean trie — no per-match filtering logic, no wasted computation on matches you'd discard anyway.

---

## Overlap Resolution, Revisited

In the [Trie series](/blog/trie-scanning-text/#overlapping-matches), we resolved overlapping matches by keeping the **longest** non-overlapping match. That's a reasonable default, but with confidence scores, we can do better.

Consider scanning the text "The Crown Season 3" with these catalog entries:

| Surface Form | Entity | Likelihood |
|:---|:---|---:|
| "The Crown" | The Crown (show) | 0.45 |
| "Crown" | Crown (disambiguation) | 0.12 |
| "The Crown Season 3" | The Crown Season 3 (show season) | 0.48 |

The matches overlap. "The Crown" and "Crown" compete for the same text span. "The Crown" and "The Crown Season 3" overlap too.

With length-based resolution, "The Crown Season 3" wins — it's the longest. With confidence-based resolution, it also wins — it has the highest score. In this case, both approaches agree.

But consider: "The Crown" vs. "Crown" in the text "the crown jewels." Length-based keeps "The Crown" (10 characters vs. 5). Confidence-based also keeps "The Crown" (0.45 vs. 0.12). Still agree.

Where they diverge is in edge cases where a shorter, more distinctive match is better than a longer, generic one. The confidence-based approach naturally handles these because distinctiveness is baked into the score.

The algorithm is almost identical to the one in the Trie series, with one change: instead of sorting by length, sort by likelihood:

```python
def resolve_overlaps(matches):
    """
    Keep the highest-confidence non-overlapping matches.
    """
    # Sort by start position, then by confidence (descending)
    sorted_matches = sorted(
        matches, 
        key=lambda m: (m.start, -m.likelihood)
    )
    
    result = []
    last_end = -1
    for match in sorted_matches:
        if match.start >= last_end:
            result.append(match)
            last_end = match.end
    
    return result
```

---

## The Complete Pipeline

Let's put all five signals together and walk through a complete example. Given this document:

```
Title: "Stranger Things Season 4 — What We Know"
Body: "The new season of Stranger Things features Millie Bobby Brown 
       returning as Eleven. You should watch it. The show was dark 
       and suspenseful."
```

**Step 1: Scan with both tries.**

The case-sensitive trie scanning the raw text finds:

| Match | Field | Position | Entity | Raw Likelihood |
|:---|:---|:---|:---|---:|
| "Stranger Things" | title | 0–16 | The Show | 0.53 |
| "Stranger Things" | body | 19–35 | The Show | 0.53 |
| "Millie Bobby Brown" | body | 45–64 | The Talent | 0.61 |
| "You" | body | 92–95 | You (show) | 0.00 |
| "Eleven" | body | 79–85 | Eleven (character) | 0.28 |

The case-insensitive trie scanning the lowered text also finds "dark" (but "you" was pre-filtered out of the case-insensitive trie):

| Match | Field | Position | Entity | Raw Likelihood |
|:---|:---|:---|:---|---:|
| "dark" | body | 112–116 | Dark (show) | 0.01 |

**Step 2: Apply case-sensitivity multiplier.**

Case-sensitive matches get 2× likelihood. The case-insensitive "dark" match keeps its base score. "You" from the case-sensitive trie has a base likelihood of essentially 0, so doubling it doesn't help.

**Step 3: Apply field weighting.**

"Stranger Things" in the title: `0.53 × 2.0 × 50.0 = 53.0`
"Stranger Things" in the body: `0.53 × 2.0 × 1.0 = 1.06`
"Millie Bobby Brown" in the body: `0.61 × 2.0 × 1.0 = 1.22`
"You" in the body: `0.00 × 2.0 × 1.0 = 0.00`
"dark" in the body: `0.01 × 1.0 × 1.0 = 0.01`

**Step 4: Aggregate by entity.**

| Entity | Title Score | Body Score | Total |
|:---|---:|---:|---:|
| Stranger Things (show) | 53.0 | 1.06 | **54.06** |
| Millie Bobby Brown (talent) | — | 1.22 | **1.22** |
| You (show) | — | 0.00 | **0.00** |
| Dark (show) | — | 0.01 | **0.01** |

**Step 5: Apply talent corroboration.**

Millie Bobby Brown is associated with Stranger Things. The show's score is boosted: `54.06 × (1.0 + 1.22) = 120.01`.

**Step 6: Resolve overlaps and threshold.**

No overlapping matches remain after resolution. Apply a minimum threshold (e.g., score > 0.5) to filter noise:

| Entity | Final Score | Verdict |
|:---|---:|:---|
| **Stranger Things** | **120.01** | Strong match |
| **Millie Bobby Brown** | **1.22** | Match |
| Dark | 0.01 | Filtered out |
| You | 0.00 | Filtered out |

The scoring model correctly identifies this document as being about Stranger Things and Millie Bobby Brown, while correctly rejecting "You" (a pronoun) and "dark" (an adjective).

---

## Why This Works

Each individual signal is imperfect. Distinctiveness alone can't handle "The Crown" (moderately distinctive but appears in many non-show contexts). Case sensitivity alone can't handle sentence-initial capitalization. Field weighting alone can't distinguish a document *about* a show from one that merely mentions it in passing.

But layered together, these signals are remarkably robust. A false positive has to survive *all* of them — it needs to be a distinctive term, properly capitalized, in a prominent field, with corroborating evidence from related entities. Very few false matches clear that bar.

And the model degrades gracefully. If you don't have Wikipedia frequency data, you lose distinctiveness but still have case sensitivity, field weighting, and corroboration. If your documents don't have structured fields, you lose field weighting but keep everything else. Each signal is independent and additive.

This is the power of a scoring approach over a binary match/no-match approach. You don't have to get the threshold perfect — you can always adjust it downstream based on your precision/recall requirements. Some applications want high recall (show me everything that might be an entity). Others want high precision (only show me entities you're confident about). The same scoring model serves both — you just move the threshold.

---

## The Series So Far

1. [The "You" Problem](/blog/entity-detection-the-you-problem/) — Why entity detection is harder than string matching
2. **Scoring Entity Matches** — You are here
3. [Entity Detection at Scale](/blog/entity-detection-at-scale/) — Broadcasting tries across a Spark cluster
4. [From Batch to Real-Time](/blog/entity-detection-batch-to-realtime/) — Moving entity detection into a web application

---

## What's Next

We have a scoring model that turns ambiguous string matches into confident entity annotations. But we've been thinking about one document at a time. What happens when you have **10 million documents** and **100,000 entity names** across **8 different entity types** — all of which need to be scored in parallel?

In [Part 3](/blog/entity-detection-at-scale/), we'll see how the entire scoring pipeline maps onto a distributed Spark cluster: broadcasting dual tries, running entity types in parallel, and processing millions of documents in minutes.

---

*Previous: [The "You" Problem](/blog/entity-detection-the-you-problem/)*

*Next: [Entity Detection at Scale](/blog/entity-detection-at-scale/)*
