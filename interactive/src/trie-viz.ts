/**
 * Trie Visualizer — D3 tree rendering for a trie data structure.
 *
 * Takes the hierarchy output from TrieEngine.toHierarchy() and renders
 * an animated SVG tree diagram. Nodes are circles with character labels;
 * terminal nodes (where a word ends) are filled with the accent color.
 * Transitions animate smoothly as words are added.
 *
 * Uses CSS custom properties from the active theme so it adapts to
 * any skin and light/dark mode.
 */

import * as d3 from 'd3';
import type { TrieHierarchyNode } from './trie-engine';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.trie-viz-svg {
  display: block;
  margin: 0 auto;
  overflow: visible;
}

.trie-viz-link {
  fill: none;
  stroke: var(--border, #cbd5e1);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.trie-viz-node-root .trie-viz-circle {
  fill: var(--text-muted, #94a3b8);
  stroke: var(--text-muted, #94a3b8);
  stroke-width: 2;
}
.trie-viz-node-root .trie-viz-label {
  display: none;
}

.trie-viz-node-internal .trie-viz-circle {
  fill: var(--bg, #fff);
  stroke: var(--accent, #0d9488);
  stroke-width: 2.5;
}
.trie-viz-node-internal .trie-viz-label {
  fill: var(--text, #0f172a);
  font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
  font-size: 16px;
  font-weight: 700;
}

.trie-viz-node-terminal .trie-viz-circle {
  fill: var(--accent, #0d9488);
  stroke: var(--accent, #0d9488);
  stroke-width: 2.5;
}
.trie-viz-node-terminal .trie-viz-label {
  fill: #fff;
  font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
  font-size: 16px;
  font-weight: 700;
}

/* Subtle ring on terminal nodes */
.trie-viz-node-terminal .trie-viz-ring {
  fill: none;
  stroke: var(--accent, #0d9488);
  stroke-width: 2;
  opacity: 0.3;
}

/* Highlight state (for search path visualization) */
.trie-viz-node-highlight .trie-viz-circle {
  stroke: var(--accent-secondary, #f97316);
  stroke-width: 3.5;
}
.trie-viz-link-highlight {
  stroke: var(--accent-secondary, #f97316) !important;
  stroke-width: 3.5 !important;
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ─── Type aliases for D3 nodes ──────────────────────────────────────

type HNode = d3.HierarchyPointNode<TrieHierarchyNode>;
type HLink = d3.HierarchyPointLink<TrieHierarchyNode>;

// ─── Visualizer class ───────────────────────────────────────────────

export interface TrieVizOptions {
  /** Minimum horizontal separation between sibling nodes (px). Default 44. */
  nodeSpacing?: number;
  /** Vertical distance between parent and child levels (px). Default 62. */
  levelHeight?: number;
  /** Transition duration (ms). Default 400. */
  duration?: number;
  /** Maximum SVG height before it stops growing (px). Default 500. */
  maxHeight?: number;
}

export class TrieViz {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  private nodeRadius = 20;
  private rootRadius = 10;
  private nodeSpacing: number;
  private levelHeight: number;
  private duration: number;
  private maxHeight: number;
  private padding = 36;
  private colors!: {
    accent: string;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
  };

  constructor(container: HTMLElement, options?: TrieVizOptions) {
    injectStyles();

    this.nodeSpacing = options?.nodeSpacing ?? 56;
    this.levelHeight = options?.levelHeight ?? 72;
    this.duration = options?.duration ?? 400;
    this.maxHeight = options?.maxHeight ?? 600;

    this.svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'trie-viz-svg')
      .attr('preserveAspectRatio', 'xMidYMin meet')
      .attr('width', '100%');

    const g = this.svg.append('g').attr('class', 'trie-viz-content');
    this.linkGroup = g.append('g').attr('class', 'trie-viz-links');
    this.nodeGroup = g.append('g').attr('class', 'trie-viz-nodes');

    // Read CSS custom properties once for reliable SVG fills
    const cs = getComputedStyle(document.documentElement);
    this.colors = {
      accent: cs.getPropertyValue('--accent').trim() || '#d94040',
      bg: cs.getPropertyValue('--bg').trim() || '#ffffff',
      text: cs.getPropertyValue('--text').trim() || '#1e2a3a',
      textMuted: cs.getPropertyValue('--text-muted').trim() || '#8899aa',
      border: cs.getPropertyValue('--border').trim() || '#d0d8e4',
    };
  }

  /**
   * Update the visualization with new trie data.
   * Smoothly transitions nodes and links to their new positions.
   */
  update(data: TrieHierarchyNode): void {
    const root = d3.hierarchy(data);
    const treeLayout = d3
      .tree<TrieHierarchyNode>()
      .nodeSize([this.nodeSpacing, this.levelHeight]);
    treeLayout(root);

    // ── Compute SVG bounds ──────────────────────────────────────
    let xMin = 0;
    let xMax = 0;
    let yMax = 0;
    root.each((d) => {
      const pd = d as HNode;
      xMin = Math.min(xMin, pd.x);
      xMax = Math.max(xMax, pd.x);
      yMax = Math.max(yMax, pd.y);
    });

    const pad = this.padding + this.nodeRadius;
    const svgWidth = xMax - xMin + 2 * pad;
    const svgHeight = yMax + 2 * pad;

    // Set viewBox directly (D3 can't interpolate viewBox strings)
    this.svg
      .attr('viewBox', `${xMin - pad} ${-pad} ${svgWidth} ${svgHeight}`)
      .attr('height', Math.min(svgHeight, this.maxHeight));

    // ── Links ───────────────────────────────────────────────────
    const links = root.links() as HLink[];
    const linkPath = d3
      .linkVertical<HLink, HNode>()
      .x((d) => d.x)
      .y((d) => d.y);

    const linkSel = this.linkGroup
      .selectAll<SVGPathElement, HLink>('.trie-viz-link')
      .data(links, (d) => d.target.data.id);

    // Enter
    linkSel
      .enter()
      .append('path')
      .attr('class', 'trie-viz-link')
      .attr('d', linkPath)
      .attr('fill', 'none')
      .attr('stroke', this.colors.border)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .transition()
      .duration(this.duration)
      .attr('opacity', 1);

    // Update
    linkSel
      .transition()
      .duration(this.duration)
      .attr('d', linkPath);

    // Exit
    linkSel
      .exit()
      .transition()
      .duration(this.duration / 2)
      .attr('opacity', 0)
      .remove();

    // ── Nodes ───────────────────────────────────────────────────
    const nodes = root.descendants() as HNode[];

    const nodeSel = this.nodeGroup
      .selectAll<SVGGElement, HNode>('.trie-viz-node')
      .data(nodes, (d) => d.data.id);

    const { accent, bg, text, textMuted, border } = this.colors;
    const nr = this.nodeRadius;
    const rr = this.rootRadius;
    const dur = this.duration;

    // Enter
    const enterG = nodeSel
      .enter()
      .append('g')
      .attr('class', (d) => nodeClass(d))
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .attr('opacity', 0);

    // Terminal ring (rendered first, behind the main circle)
    enterG
      .filter((d) => d.data.isTerminal)
      .append('circle')
      .attr('class', 'trie-viz-ring')
      .attr('r', nr + 5)
      .attr('fill', 'none')
      .attr('stroke', accent)
      .attr('stroke-width', 2)
      .attr('opacity', 0.3);

    // Main circle — set fill/stroke inline for guaranteed visibility
    enterG
      .append('circle')
      .attr('class', 'trie-viz-circle')
      .attr('r', (d) => d.data.id === '__root__' ? rr : nr)
      .attr('fill', (d) => {
        if (d.data.id === '__root__') return textMuted;
        return d.data.isTerminal ? accent : bg;
      })
      .attr('stroke', (d) => {
        if (d.data.id === '__root__') return textMuted;
        return accent;
      })
      .attr('stroke-width', (d) => d.data.id === '__root__' ? 2 : 2.5);

    // Character label
    enterG
      .append('text')
      .attr('class', 'trie-viz-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => d.data.isTerminal ? '#fff' : text)
      .attr('font-family', "'SF Mono', 'Fira Code', monospace")
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text((d) => d.data.char);

    // Update — reposition, update class, and fade in enter nodes.
    // Using a single merged transition avoids D3's transition-cancellation
    // (unnamed transitions on the same element override each other).
    const merged = nodeSel.merge(enterG as any);
    merged
      .attr('class', (d) => nodeClass(d))
      .transition()
      .duration(dur)
      .attr('opacity', 1)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    // Update circle appearance (node may have become terminal)
    merged
      .select('.trie-viz-circle')
      .transition()
      .duration(dur)
      .attr('r', (d: any) => d.data.id === '__root__' ? rr : nr)
      .attr('fill', (d: any) => {
        if (d.data.id === '__root__') return textMuted;
        return d.data.isTerminal ? accent : bg;
      })
      .attr('stroke', (d: any) => {
        if (d.data.id === '__root__') return textMuted;
        return accent;
      });

    // Update label color (if node became terminal)
    merged
      .select('.trie-viz-label')
      .transition()
      .duration(dur)
      .attr('fill', (d: any) => d.data.isTerminal ? '#fff' : text);

    // Add ring to nodes that became terminal
    merged.each(function (d: any) {
      const g = d3.select(this);
      const hasRing = !g.select('.trie-viz-ring').empty();
      if (d.data.isTerminal && !hasRing) {
        g.insert('circle', '.trie-viz-circle')
          .attr('class', 'trie-viz-ring')
          .attr('r', nr + 5)
          .attr('fill', 'none')
          .attr('stroke', accent)
          .attr('stroke-width', 2)
          .attr('opacity', 0)
          .transition()
          .duration(dur)
          .attr('opacity', 0.3);
      }
    });

    // Exit
    nodeSel
      .exit()
      .transition()
      .duration(dur / 2)
      .attr('opacity', 0)
      .remove();
  }

  /**
   * Highlight a path through the trie (for search visualization).
   * Pass the character path, e.g. "the" highlights root→t→h→e.
   */
  highlightPath(path: string): void {
    this.clearHighlights();

    // Build the set of node IDs on the path
    const pathIds = new Set<string>();
    let prefix = '';
    pathIds.add('__root__');
    for (const char of path) {
      prefix += char;
      pathIds.add(prefix);
    }

    // Highlight matching nodes
    this.nodeGroup
      .selectAll<SVGGElement, HNode>('.trie-viz-node')
      .classed('trie-viz-node-highlight', (d) => pathIds.has(d.data.id));

    // Highlight matching links
    this.linkGroup
      .selectAll<SVGPathElement, HLink>('.trie-viz-link')
      .classed('trie-viz-link-highlight', (d) =>
        pathIds.has(d.target.data.id),
      );
  }

  /** Remove all path highlights. */
  clearHighlights(): void {
    this.nodeGroup
      .selectAll('.trie-viz-node')
      .classed('trie-viz-node-highlight', false);
    this.linkGroup
      .selectAll('.trie-viz-link')
      .classed('trie-viz-link-highlight', false);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function nodeClass(d: HNode): string {
  const base = 'trie-viz-node';
  if (d.data.id === '__root__') return `${base} trie-viz-node-root`;
  if (d.data.isTerminal) return `${base} trie-viz-node-terminal`;
  return `${base} trie-viz-node-internal`;
}
