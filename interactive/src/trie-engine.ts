/**
 * Trie Engine
 *
 * A TypeScript trie (prefix tree) for visualization and text matching.
 * Stores strings character-by-character in a tree where each node
 * branches on the next character. Shared prefixes are stored once.
 *
 * Designed to pair with trie-viz.ts for D3 rendering — toHierarchy()
 * exports a tree structure that d3.hierarchy() can consume directly.
 */

// ─── Match result (for text scanning) ────────────────────────────────

export interface TrieMatch {
  /** The matched text as it appeared in the input */
  match: string;
  /** Start index in the input text (inclusive) */
  start: number;
  /** End index in the input text (exclusive) */
  end: number;
  /** The trie path (normalized form) that matched */
  pattern: string;
}

// ─── Hierarchy export (for D3) ──────────────────────────────────────

export interface TrieHierarchyNode {
  /** Unique ID for D3 data binding — the prefix path to this node */
  id: string;
  /** The character at this node (empty string for root) */
  char: string;
  /** Full prefix accumulated from root to this node */
  path: string;
  /** Whether a word terminates at this node */
  isTerminal: boolean;
  /** Words that terminate at this node */
  words: string[];
  /** Child nodes, sorted alphabetically */
  children: TrieHierarchyNode[];
}

// ─── Internal node ──────────────────────────────────────────────────

interface InternalNode {
  children: Map<string, InternalNode>;
  isTerminal: boolean;
  words: string[];
}

function createNode(): InternalNode {
  return { children: new Map(), isTerminal: false, words: [] };
}

// ─── Trie ───────────────────────────────────────────────────────────

export class TrieEngine {
  private root = createNode();
  private _words: string[] = [];

  /**
   * Insert a word into the trie.
   * Returns true if the word was new, false if it already existed.
   */
  insert(word: string): boolean {
    if (!word) return false;
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, createNode());
      }
      node = node.children.get(char)!;
    }
    if (node.isTerminal) return false;
    node.isTerminal = true;
    node.words.push(word);
    this._words.push(word);
    return true;
  }

  /** Check if a word exists in the trie. */
  search(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char)!;
    }
    return node.isTerminal;
  }

  /** Check if any word starts with the given prefix. */
  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return false;
      node = node.children.get(char)!;
    }
    return true;
  }

  /** All words currently in the trie. */
  getWords(): string[] {
    return [...this._words];
  }

  get wordCount(): number {
    return this._words.length;
  }

  /** Total nodes including root. */
  get nodeCount(): number {
    let count = 0;
    const walk = (node: InternalNode) => {
      count++;
      for (const child of node.children.values()) walk(child);
    };
    walk(this.root);
    return count;
  }

  /** Sum of character lengths of all inserted words. */
  get totalChars(): number {
    return this._words.reduce((sum, w) => sum + w.length, 0);
  }

  /**
   * Export the trie as a D3-compatible hierarchy.
   * Children are sorted alphabetically for a stable layout.
   */
  toHierarchy(): TrieHierarchyNode {
    const convert = (
      node: InternalNode,
      char: string,
      path: string,
    ): TrieHierarchyNode => {
      const sortedKeys = [...node.children.keys()].sort();
      const children = sortedKeys.map((key) =>
        convert(node.children.get(key)!, key, path + key),
      );
      return {
        id: path || '__root__',
        char,
        path,
        isTerminal: node.isTerminal,
        words: [...node.words],
        children,
      };
    };
    return convert(this.root, '', '');
  }

  /**
   * Find all trie matches in the given text.
   *
   * For each starting position in the text, walks the trie as far as
   * possible. Every terminal node encountered emits a match. When
   * `wordBoundaries` is true (default), matches are only emitted when
   * flanked by non-alpha characters (or string start/end).
   *
   * Returns matches sorted by position, then by length descending.
   */
  findAllMatches(
    text: string,
    options?: { wordBoundaries?: boolean; caseSensitive?: boolean },
  ): TrieMatch[] {
    const wordBoundaries = options?.wordBoundaries ?? true;
    const caseSensitive = options?.caseSensitive ?? true;
    const normalized = caseSensitive ? text : text.toLowerCase();
    const matches: TrieMatch[] = [];

    for (let i = 0; i < normalized.length; i++) {
      let node = this.root;
      let j = i;

      while (j < normalized.length && node.children.has(normalized[j])) {
        node = node.children.get(normalized[j])!;

        if (node.isTerminal) {
          if (wordBoundaries) {
            const atStart = i === 0 || !isAlpha(text[i - 1]);
            const atEnd = j + 1 === text.length || !isAlpha(text[j + 1]);
            if (atStart && atEnd) {
              matches.push({
                match: text.slice(i, j + 1),
                start: i,
                end: j + 1,
                pattern: normalized.slice(i, j + 1),
              });
            }
          } else {
            matches.push({
              match: text.slice(i, j + 1),
              start: i,
              end: j + 1,
              pattern: normalized.slice(i, j + 1),
            });
          }
        }
        j++;
      }
    }

    return matches;
  }

  /**
   * Resolve overlapping matches by keeping the longest match at each
   * position, and removing matches that are fully contained within a
   * longer match.
   */
  static resolveOverlaps(matches: TrieMatch[]): TrieMatch[] {
    if (matches.length === 0) return [];

    // Sort by start ascending, then length descending
    const sorted = [...matches].sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    const result: TrieMatch[] = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const prev = result[result.length - 1];
      const curr = sorted[i];
      // Skip if fully contained in previous match
      if (curr.start >= prev.start && curr.end <= prev.end) continue;
      // Skip if overlapping (keep the earlier/longer one)
      if (curr.start < prev.end) continue;
      result.push(curr);
    }
    return result;
  }

  /** Remove all words and reset to empty. */
  clear(): void {
    this.root = createNode();
    this._words = [];
  }
}

// ─── Utilities ──────────────────────────────────────────────────────

function isAlpha(ch: string): boolean {
  return /[a-zA-Z]/.test(ch);
}
