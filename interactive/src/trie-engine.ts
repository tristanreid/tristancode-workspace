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

  /** Remove all words and reset to empty. */
  clear(): void {
    this.root = createNode();
    this._words = [];
  }
}
