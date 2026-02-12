---
title: "What Is a Trie?"
description: "How a prefix tree stores thousands of strings using shared structure — and why that makes it one of the most efficient data structures for text search."
weight: 30
series: "Tries: Multi-Pattern Text Search"
series_weight: 10
skin: graph
hero: /images/trie-series/trie-what-is-a-trie
---

Imagine you have a list of 100,000 names — every show in a streaming catalog, say — and a pile of 10 million documents. For each document, you need to find which names appear in it. Every name, every document.

The brute-force approach is simple: for each document, search for each name. That's 100,000 searches per document, times 10 million documents. A trillion operations. Even on fast hardware, that's going to hurt.

There's a better way. A data structure called a **trie** (rhymes with "try") can scan a document for *all* 100,000 names in a single pass through the text, and it does this by exploiting a simple observation: many of those names start with the same letters.

---

## The Prefix Problem

Look at this list of words:

> cat, car, card, care, cart, cast

Notice anything? Every word starts with "ca." Four of the six start with "car." If you're searching for all of these in a document, you're doing a lot of redundant work — scanning for "ca" six separate times, scanning for "car" four separate times.

What if you could share that work? What if you could build a structure that says: "first look for **c**, then **a** — and *from there*, branch out to look for **t**, **r**, or **s**"?

That's exactly what a trie does.

---

## A Tree That Shares Prefixes

A trie (short for "re**trie**val," coined by Edward Fredkin in 1960) is a tree where every string is stored as a path from the root. Each edge represents one character. When two strings share a prefix, they share a path.

The best way to understand it is to build one. Type words into the explorer below and watch the tree grow — pay attention to how shared prefixes merge into a single path:

{{< interactive component="trie-explorer" >}}

Try clicking **"TH- words"** to load a set with dramatic prefix sharing. All six words share the path **t → h → e**, and the tree branches only where the words diverge. The filled nodes mark where a complete word ends.

---

## How Sharing Saves Space

The stats at the bottom of the explorer show **prefix savings** — the percentage of characters saved by storing words in a trie versus storing them independently.

For the "TH- words" set (the, there, their, they, them, then), the savings are striking. Storing these six words normally requires 25 characters. The trie stores them in far fewer nodes because the shared prefix **the** is stored only once.

This isn't just a space optimization. The shared structure is what makes the trie *fast*. When you're scanning text for matches, you walk a single path through the tree. Every character you read either advances you deeper into the trie or tells you "no match starts here." You never waste time re-checking prefixes you've already seen.

---

## The Algorithm: Building a Trie

Inserting a word into a trie is beautifully simple:

1. Start at the root
2. For each character in the word, follow the edge labeled with that character — if no such edge exists, create it
3. When you reach the end of the word, mark the current node as a **terminal** (a word ends here)

Here's a clean Python implementation. The entire data structure is about 30 lines:

```python
class TrieNode:
    def __init__(self):
        self.children = {}     # char → TrieNode
        self.is_terminal = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_terminal = True

    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_terminal
```

That's it. `insert` walks the tree character by character, creating nodes as needed. `search` walks the same way but returns `False` the moment it hits a missing edge.

Both operations take **O(L)** time, where L is the length of the word. No matter how many words are in the trie — a hundred or a hundred thousand — inserting or searching takes time proportional only to the length of the word itself.

---

## The Killer Feature: Multi-Pattern Matching

Searching for a single word is nice, but the real power of a trie is searching for *all* of your patterns in a single pass through a document. Here's how:

For each starting position in the text:

1. Start at the root of the trie
2. Read one character at a time, following edges
3. Whenever you land on a terminal node, you've found a match
4. Keep going — there might be a longer match (like finding both "car" and "card")
5. When you hit a dead end (no edge for the next character), move to the next starting position

```python
def find_all_matches(self, text):
    matches = []
    for i in range(len(text)):
        node = self.root
        j = i
        while j < len(text) and text[j] in node.children:
            node = node.children[text[j]]
            if node.is_terminal:
                matches.append(text[i:j + 1])
            j += 1
    return matches
```

The time complexity is **O(M × L)** where M is the length of the text and L is the longest word in the trie. Compare this to the brute-force approach of checking each pattern separately: **O(N × M)** where N is the number of patterns.

When N is 100,000 and L is 20 characters? That's a **5,000×** speedup.

<div style="background: var(--blockquote-bg, rgba(249,115,22,0.04)); border-left: 3px solid var(--blockquote-border, #f97316); border-radius: 0 8px 8px 0; padding: 1rem 1.25rem; margin: 1.5rem 0;">

| Approach | Time per document | With 100K patterns, 20-char max |
|:---|:---|:---|
| **Brute force** (one search per pattern) | O(N × M) | Proportional to 100,000 × doc length |
| **Trie scan** (single pass) | O(M × L) | Proportional to 20 × doc length |

The trie replaces the **number of patterns** with the **maximum pattern length** — and pattern length is almost always much, much smaller.

</div>

---

## Where Tries Show Up

Tries are everywhere once you know to look for them:

- **Autocomplete**: As you type, the app walks the trie to your current prefix, then enumerates all completions. This is why suggestions appear instantly even when the dictionary has millions of entries.
- **Spell-checking**: Walk the trie for the typed word. If you don't land on a terminal node, the word isn't in the dictionary. The nearby branches suggest corrections.
- **IP routing**: Routers use a variant called a Patricia trie to find the longest matching prefix for an IP address, determining where to forward each packet.
- **Entity detection**: In production systems, tries are used to scan documents for mentions of known entities — show titles, people, places — across millions of documents. This is the use case that motivated my own trie implementations — I presented on it at a [Netflix Data Engineering Tech Talk](https://www.youtube.com/watch?v=F4N8AmScZ-w) ([slides](https://docs.google.com/presentation/d/1ulPiI7bV1lq_d3Dj07j2qQDKst7AgUmoIFHSoQYv1FA/)), and we explore it in depth in the [Entity Detection series](/blog/entity-detection-the-you-problem/).

---

## The Name

A quick note on pronunciation. Edward Fredkin coined the name in 1960 from "re**trie**val" and intended it to be pronounced "tree" — as in, it's a tree for retrieval. But this was confusing (a trie is a tree, so calling it "tree" sounds redundant), and most people now pronounce it "try." I'll use "try" throughout this series, but you'll encounter both in the wild.

---

## What's Next

We've seen the core data structure: a tree that shares prefixes, enabling multi-pattern search in a single pass. But there are subtleties we've glossed over — what happens with case sensitivity? How do you handle word boundaries so you don't match "art" inside "cart"? What if two patterns share the same surface form?

## The Series So Far

1. **What Is a Trie?** — You are here
2. [Building an Interactive Trie Visualizer with D3](/blog/trie-visualizing-with-d3/) — How the animated visualization works
3. [Scanning Text with a Trie](/blog/trie-scanning-text/) — Multi-pattern matching, word boundaries, overlap resolution
4. [Broadcasting a Trie in Spark](/blog/trie-broadcasting-in-spark/) — The distributed computation pattern
5. [Building a Trie-Powered Autocomplete with React](/blog/trie-autocomplete-react/) — The React component
6. [Shrinking the Trie for the Wire](/blog/trie-shrinking-for-the-wire/) — Can a custom format beat gzip? We measured.

---

*Next: [Building an Interactive Trie Visualizer with D3](/blog/trie-visualizing-with-d3/)*
