/**
 * Generate static SVG hero images for each post in the Trie series.
 *
 * Each SVG shows a trie visualization with thematically relevant words,
 * styled to match the "graph" skin. Run with:
 *
 *   npx tsx scripts/generate-trie-heroes.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';

// ─── Per-post word lists ────────────────────────────────────────────

const posts = [
  {
    slug: 'trie-what-is-a-trie',
    words: ['trie', 'tried', 'tries', 'tree', 'trees', 'trek', 'trend'],
  },
  {
    slug: 'trie-visualizing-with-d3',
    words: ['draw', 'drawn', 'draft', 'drag', 'drape', 'dream', 'drift'],
  },
  {
    slug: 'trie-scanning-text',
    words: ['scan', 'scale', 'scatter', 'score', 'screen', 'script', 'scheme'],
  },
  {
    slug: 'trie-broadcasting-in-spark',
    words: ['broadcast', 'broad', 'branch', 'bridge', 'bright', 'bring', 'brick'],
  },
  {
    slug: 'trie-autocomplete-react',
    words: ['complete', 'compile', 'compute', 'compare', 'compose', 'compact', 'combine'],
  },
  {
    slug: 'trie-shrinking-for-the-wire',
    words: ['shrink', 'ship', 'share', 'shape', 'sharp', 'shift', 'shield'],
  },
];

// ─── Colors (from style-graph.css) ──────────────────────────────────

// We generate two variants per post: light and dark.
const themes = {
  light: {
    accent: '#d94040',
    bg: '#fdfdfd',
    text: '#1e2a3a',
    textMuted: '#8899aa',
    border: '#d0d8e4',
    gridColor: 'rgba(74,122,181,0.07)',
    gridColorStrong: 'rgba(74,122,181,0.15)',
  },
  dark: {
    accent: '#ef6060',
    bg: '#141a24',
    text: '#d8e0ec',
    textMuted: '#5a6a80',
    border: '#2a3648',
    gridColor: 'rgba(88,136,204,0.06)',
    gridColorStrong: 'rgba(88,136,204,0.12)',
  },
};

// ─── Simple trie builder ────────────────────────────────────────────

interface TrieNode {
  char: string;
  path: string;
  isTerminal: boolean;
  children: Map<string, TrieNode>;
}

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = { char: '', path: '', isTerminal: false, children: new Map() };

  for (const word of words) {
    let node = root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!node.children.has(ch)) {
        node.children.set(ch, {
          char: ch,
          path: word.slice(0, i + 1),
          isTerminal: false,
          children: new Map(),
        });
      }
      node = node.children.get(ch)!;
    }
    node.isTerminal = true;
  }

  return root;
}

// ─── Tree layout (simple recursive) ────────────────────────────────

interface LayoutNode {
  x: number;
  y: number;
  char: string;
  path: string;
  isTerminal: boolean;
  isRoot: boolean;
  children: LayoutNode[];
}

function layoutTree(
  trieNode: TrieNode,
  nodeSpacing: number,
  levelHeight: number,
): { root: LayoutNode; width: number; height: number } {
  // Convert trie to layout tree
  function convert(node: TrieNode, depth: number): LayoutNode {
    const sortedChildren = [...node.children.values()].sort((a, b) =>
      a.char.localeCompare(b.char),
    );
    return {
      x: 0,
      y: depth * levelHeight,
      char: node.char,
      path: node.path,
      isTerminal: node.isTerminal,
      isRoot: depth === 0,
      children: sortedChildren.map((c) => convert(c, depth + 1)),
    };
  }

  const root = convert(trieNode, 0);

  // Assign x positions using a simple left-to-right leaf placement
  let nextX = 0;
  function assignX(node: LayoutNode): void {
    if (node.children.length === 0) {
      node.x = nextX;
      nextX += nodeSpacing;
    } else {
      for (const child of node.children) {
        assignX(child);
      }
      // Center parent over children
      const first = node.children[0].x;
      const last = node.children[node.children.length - 1].x;
      node.x = (first + last) / 2;
    }
  }
  assignX(root);

  // Compute bounds
  let maxX = 0;
  let maxY = 0;
  function bounds(node: LayoutNode): void {
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
    node.children.forEach(bounds);
  }
  bounds(root);

  return { root, width: maxX, height: maxY };
}

// ─── SVG generator ──────────────────────────────────────────────────

function generateSVG(
  words: string[],
  theme: (typeof themes)['light'],
  variant: 'light' | 'dark',
): string {
  const trie = buildTrie(words);

  const nodeSpacing = 52;
  const levelHeight = 64;
  const nodeRadius = 18;
  const rootRadius = 8;
  const padding = 50;

  const { root } = layoutTree(trie, nodeSpacing, levelHeight);

  // Compute actual bounds of the tree
  let minX = Infinity, maxX = -Infinity, maxY = 0;
  function computeBounds(node: LayoutNode): void {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
    node.children.forEach(computeBounds);
  }
  computeBounds(root);

  const treeWidth = maxX - minX;
  const treeHeight = maxY;

  const svgWidth = treeWidth + 2 * padding;
  const svgHeight = treeHeight + 2 * padding;

  // Offset to center the tree (translate so minX becomes 0)
  const offsetX = -minX + padding;
  const offsetY = padding;

  const lines: string[] = [];

  // SVG header
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">`,
  );

  // Defs for grid pattern
  lines.push(`  <defs>`);
  lines.push(`    <pattern id="grid-sm-${variant}" width="20" height="20" patternUnits="userSpaceOnUse">`);
  lines.push(`      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${theme.gridColor}" stroke-width="0.5"/>`);
  lines.push(`    </pattern>`);
  lines.push(`    <pattern id="grid-lg-${variant}" width="100" height="100" patternUnits="userSpaceOnUse">`);
  lines.push(`      <rect width="100" height="100" fill="url(#grid-sm-${variant})"/>`);
  lines.push(`      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="${theme.gridColorStrong}" stroke-width="1"/>`);
  lines.push(`    </pattern>`);
  lines.push(`  </defs>`);

  // Background with grid
  lines.push(`  <rect width="${svgWidth}" height="${svgHeight}" fill="${theme.bg}"/>`);
  lines.push(`  <rect width="${svgWidth}" height="${svgHeight}" fill="url(#grid-lg-${variant})"/>`);

  // Content group — centered using computed offset
  lines.push(`  <g transform="translate(${offsetX},${offsetY})">`);

  // Draw links first
  function drawLinks(node: LayoutNode): void {
    for (const child of node.children) {
      // Curved vertical link
      const x1 = node.x;
      const y1 = node.y;
      const x2 = child.x;
      const y2 = child.y;
      const midY = (y1 + y2) / 2;
      lines.push(
        `    <path d="M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}" fill="none" stroke="${theme.border}" stroke-width="2.5" stroke-linecap="round"/>`,
      );
      drawLinks(child);
    }
  }
  drawLinks(root);

  // Draw nodes
  function drawNodes(node: LayoutNode): void {
    if (node.isRoot) {
      // Root: small muted circle
      lines.push(
        `    <circle cx="${node.x}" cy="${node.y}" r="${rootRadius}" fill="${theme.textMuted}" stroke="${theme.textMuted}" stroke-width="2"/>`,
      );
    } else {
      // Terminal ring
      if (node.isTerminal) {
        lines.push(
          `    <circle cx="${node.x}" cy="${node.y}" r="${nodeRadius + 5}" fill="none" stroke="${theme.accent}" stroke-width="2" opacity="0.3"/>`,
        );
      }

      // Main circle
      const fill = node.isTerminal ? theme.accent : theme.bg;
      lines.push(
        `    <circle cx="${node.x}" cy="${node.y}" r="${nodeRadius}" fill="${fill}" stroke="${theme.accent}" stroke-width="2.5"/>`,
      );

      // Character label
      const labelColor = node.isTerminal ? '#ffffff' : theme.text;
      lines.push(
        `    <text x="${node.x}" y="${node.y}" text-anchor="middle" dy="0.35em" fill="${labelColor}" font-family="'JetBrains Mono','SF Mono','Fira Code',monospace" font-size="15" font-weight="700">${escapeXml(node.char)}</text>`,
      );
    }

    node.children.forEach(drawNodes);
  }
  drawNodes(root);

  lines.push(`  </g>`);
  lines.push(`</svg>`);

  return lines.join('\n');
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Main ───────────────────────────────────────────────────────────

const outDir = 'static/images/trie-series';
mkdirSync(outDir, { recursive: true });

for (const post of posts) {
  for (const [variant, colors] of Object.entries(themes)) {
    const svg = generateSVG(post.words, colors, variant as 'light' | 'dark');
    const filename = `${outDir}/${post.slug}-${variant}.svg`;
    writeFileSync(filename, svg);
    console.log(`  ${filename}`);
  }
}

console.log(`\nGenerated ${posts.length * 2} SVGs in ${outDir}/`);
