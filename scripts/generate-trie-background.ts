/**
 * Generate a tiling SVG background that rotates through all 6 trie
 * shapes from the series.  The tile arranges the tries in a 3×2 grid;
 * when CSS repeats the tile the viewer sees a rich variety of trie
 * fragments rather than a single repeating pattern.
 *
 * Run with: npx tsx scripts/generate-trie-background.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';

// ─── Word lists (same as the hero generator) ────────────────────────

const wordSets = [
  ['trie', 'tried', 'tries', 'tree', 'trees', 'trek', 'trend'],
  ['draw', 'drawn', 'draft', 'drag', 'drape', 'dream', 'drift'],
  ['scan', 'scale', 'scatter', 'score', 'screen', 'script', 'scheme'],
  ['broadcast', 'broad', 'branch', 'bridge', 'bright', 'bring', 'brick'],
  ['complete', 'compile', 'compute', 'compare', 'compose', 'compact', 'combine'],
  ['shrink', 'ship', 'share', 'shape', 'sharp', 'shift', 'shield'],
];

// ─── Simple trie builder ────────────────────────────────────────────

interface TrieNode {
  char: string;
  isTerminal: boolean;
  children: Map<string, TrieNode>;
}

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = { char: '', isTerminal: false, children: new Map() };
  for (const word of words) {
    let node = root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (!node.children.has(ch)) {
        node.children.set(ch, { char: ch, isTerminal: false, children: new Map() });
      }
      node = node.children.get(ch)!;
    }
    node.isTerminal = true;
  }
  return root;
}

// ─── Layout ─────────────────────────────────────────────────────────

interface LayoutNode {
  x: number;
  y: number;
  char: string;
  isTerminal: boolean;
  isRoot: boolean;
  children: LayoutNode[];
}

function layoutTree(trieNode: TrieNode, nodeSpacing: number, levelHeight: number) {
  function convert(node: TrieNode, depth: number): LayoutNode {
    const sorted = [...node.children.values()].sort((a, b) => a.char.localeCompare(b.char));
    return {
      x: 0,
      y: depth * levelHeight,
      char: node.char,
      isTerminal: node.isTerminal,
      isRoot: depth === 0,
      children: sorted.map((c) => convert(c, depth + 1)),
    };
  }
  const root = convert(trieNode, 0);

  let nextX = 0;
  function assignX(node: LayoutNode): void {
    if (node.children.length === 0) {
      node.x = nextX;
      nextX += nodeSpacing;
    } else {
      for (const child of node.children) assignX(child);
      const first = node.children[0].x;
      const last = node.children[node.children.length - 1].x;
      node.x = (first + last) / 2;
    }
  }
  assignX(root);

  let minX = Infinity,
    maxX = -Infinity,
    maxY = 0;
  function bounds(node: LayoutNode): void {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
    node.children.forEach(bounds);
  }
  bounds(root);

  return { root, minX, maxX, maxY };
}

// ─── Colors ─────────────────────────────────────────────────────────

interface Colors {
  accent: string;
  text: string;
  textMuted: string;
  border: string;
}

const themes: Record<string, Colors> = {
  light: {
    accent: 'rgba(217,64,64,0.14)',
    text: 'rgba(30,42,58,0.12)',
    textMuted: 'rgba(136,153,170,0.2)',
    border: 'rgba(208,216,228,0.35)',
  },
  dark: {
    accent: 'rgba(239,96,96,0.12)',
    text: 'rgba(216,224,236,0.10)',
    textMuted: 'rgba(90,106,128,0.18)',
    border: 'rgba(42,54,72,0.35)',
  },
};

// ─── Render one small trie into SVG fragments ───────────────────────

function renderTreeFragments(
  words: string[],
  colors: Colors,
  offsetX: number,
  offsetY: number,
): { svg: string; width: number; height: number } {
  const nodeSpacing = 30;
  const levelHeight = 36;
  const nodeRadius = 10;
  const rootRadius = 4;

  const trie = buildTrie(words);
  const { root, minX, maxX, maxY } = layoutTree(trie, nodeSpacing, levelHeight);

  const treeWidth = maxX - minX;
  const treeHeight = maxY;

  const tx = offsetX - minX;
  const ty = offsetY;

  const lines: string[] = [];
  lines.push(`  <g transform="translate(${tx},${ty})">`);

  // Edges
  function drawEdges(node: LayoutNode): void {
    for (const child of node.children) {
      const midY = (node.y + child.y) / 2;
      lines.push(
        `    <path d="M${node.x},${node.y} C${node.x},${midY} ${child.x},${midY} ${child.x},${child.y}" fill="none" stroke="${colors.border}" stroke-width="1.5" stroke-linecap="round"/>`,
      );
      drawEdges(child);
    }
  }
  drawEdges(root);

  // Nodes
  function drawNodes(node: LayoutNode): void {
    if (node.isRoot) {
      lines.push(`    <circle cx="${node.x}" cy="${node.y}" r="${rootRadius}" fill="${colors.textMuted}"/>`);
    } else {
      if (node.isTerminal) {
        lines.push(
          `    <circle cx="${node.x}" cy="${node.y}" r="${nodeRadius + 3}" fill="none" stroke="${colors.accent}" stroke-width="1.2"/>`,
        );
        lines.push(
          `    <circle cx="${node.x}" cy="${node.y}" r="${nodeRadius}" fill="${colors.accent}" stroke="${colors.accent}" stroke-width="1.5"/>`,
        );
      } else {
        lines.push(
          `    <circle cx="${node.x}" cy="${node.y}" r="${nodeRadius}" fill="none" stroke="${colors.accent}" stroke-width="1.5"/>`,
        );
      }
      lines.push(
        `    <text x="${node.x}" y="${node.y}" text-anchor="middle" dy="0.35em" fill="${colors.text}" font-family="'JetBrains Mono',monospace" font-size="9" font-weight="700">${node.char}</text>`,
      );
    }
    node.children.forEach(drawNodes);
  }
  drawNodes(root);

  lines.push(`  </g>`);

  return { svg: lines.join('\n'), width: treeWidth, height: treeHeight };
}

// ─── Composite tile ─────────────────────────────────────────────────

function generateCompositeTile(variant: 'light' | 'dark'): string {
  const colors = themes[variant];
  const padding = 24;
  const cellGap = 20;

  // Layout each tree to measure its size
  const measured = wordSets.map((words) => {
    const trie = buildTrie(words);
    const { minX, maxX, maxY } = layoutTree(trie, 30, 36);
    return { words, width: maxX - minX, height: maxY };
  });

  // Arrange in 3 columns × 2 rows
  const cols = 3;
  const rows = 2;

  // Find max cell dimensions per column and per row
  const colWidths: number[] = [];
  const rowHeights: number[] = [];

  for (let c = 0; c < cols; c++) {
    let maxW = 0;
    for (let r = 0; r < rows; r++) {
      const idx = r * cols + c;
      if (idx < measured.length) maxW = Math.max(maxW, measured[idx].width);
    }
    colWidths.push(maxW);
  }

  for (let r = 0; r < rows; r++) {
    let maxH = 0;
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx < measured.length) maxH = Math.max(maxH, measured[idx].height);
    }
    rowHeights.push(maxH);
  }

  // Total tile size
  const totalW =
    colWidths.reduce((s, w) => s + w, 0) + cellGap * (cols - 1) + 2 * padding;
  const totalH =
    rowHeights.reduce((s, h) => s + h, 0) + cellGap * (rows - 1) + 2 * padding;

  const svgLines: string[] = [];
  svgLines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`,
  );

  // Render each tree into its grid cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= measured.length) continue;

      const { words, width: treeW, height: treeH } = measured[idx];

      // Cell top-left
      let cellX = padding;
      for (let ci = 0; ci < c; ci++) cellX += colWidths[ci] + cellGap;
      let cellY = padding;
      for (let ri = 0; ri < r; ri++) cellY += rowHeights[ri] + cellGap;

      // Center the tree within the cell
      const cx = cellX + (colWidths[c] - treeW) / 2;
      const cy = cellY + (rowHeights[r] - treeH) / 2;

      const { svg } = renderTreeFragments(words, colors, cx, cy);
      svgLines.push(svg);
    }
  }

  svgLines.push(`</svg>`);
  return svgLines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────

const outDir = 'static/images/trie-series';
mkdirSync(outDir, { recursive: true });

for (const variant of ['light', 'dark'] as const) {
  const svg = generateCompositeTile(variant);
  const filename = `${outDir}/trie-bg-${variant}.svg`;
  writeFileSync(filename, svg);
  console.log(`  ${filename}`);
}

console.log('\nGenerated 2 composite background tile SVGs (3×2 grid, 6 tries each)');
