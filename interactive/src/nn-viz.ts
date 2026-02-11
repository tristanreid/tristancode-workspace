/**
 * NNViz — D3 neural network visualizer.
 *
 * Renders a feed-forward network as an SVG diagram with:
 * - Nodes arranged in columns (one per layer)
 * - Edges colored and weighted by weight values (blue = positive, red = negative)
 * - Node fill showing activation value (intensity = activation level)
 * - Smooth transitions as weights and activations change during training
 *
 * Uses CSS custom properties from the active theme.
 */

import * as d3 from 'd3';
import type { NNSnapshot, ForwardResult } from './nn-engine';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.nn-viz-svg {
  display: block;
  margin: 0 auto;
  overflow: visible;
}

.nn-viz-edge {
  fill: none;
  stroke-linecap: round;
  transition: stroke 0.15s ease, stroke-width 0.15s ease, opacity 0.15s ease;
}

.nn-viz-node {
  transition: fill 0.15s ease, stroke 0.15s ease;
}

.nn-viz-label {
  font-family: var(--font-mono, 'SF Mono', 'Fira Code', monospace);
  font-weight: 600;
  pointer-events: none;
  user-select: none;
}

.nn-viz-layer-label {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  fill: var(--text-muted, #94a3b8);
  text-anchor: middle;
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

// ─── Types ───────────────────────────────────────────────────────────

interface NodePos {
  layer: number;
  index: number;
  x: number;
  y: number;
}

export interface NNVizOptions {
  /** Width of the SVG. Default 400. */
  width?: number;
  /** Height of the SVG. Default 280. */
  height?: number;
  /** Node radius. Default 18. */
  nodeRadius?: number;
  /** Horizontal padding from edges. Default 50. */
  paddingX?: number;
  /** Vertical padding from edges. Default 40. */
  paddingY?: number;
  /** Whether to show layer labels. Default true. */
  showLabels?: boolean;
  /** Transition duration (ms). Default 150. */
  duration?: number;
}

// ─── Visualizer ──────────────────────────────────────────────────────

export class NNViz {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private edgeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private labelGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  private width: number;
  private height: number;
  private nodeRadius: number;
  private paddingX: number;
  private paddingY: number;
  private showLabels: boolean;
  private duration: number;

  private nodePositions: NodePos[] = [];
  private colors: {
    accent: string;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
  };

  constructor(container: HTMLElement, options?: NNVizOptions) {
    injectStyles();

    this.width = options?.width ?? 400;
    this.height = options?.height ?? 280;
    this.nodeRadius = options?.nodeRadius ?? 18;
    this.paddingX = options?.paddingX ?? 50;
    this.paddingY = options?.paddingY ?? 40;
    this.showLabels = options?.showLabels ?? true;
    this.duration = options?.duration ?? 150;

    this.svg = d3
      .select(container)
      .append('svg')
      .attr('class', 'nn-viz-svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.edgeGroup = this.svg.append('g').attr('class', 'nn-viz-edges');
    this.nodeGroup = this.svg.append('g').attr('class', 'nn-viz-nodes');
    this.labelGroup = this.svg.append('g').attr('class', 'nn-viz-labels');

    // Read theme colors
    const cs = getComputedStyle(document.documentElement);
    this.colors = {
      accent: cs.getPropertyValue('--accent').trim() || '#0d9488',
      bg: cs.getPropertyValue('--bg').trim() || '#ffffff',
      text: cs.getPropertyValue('--text').trim() || '#0f172a',
      textMuted: cs.getPropertyValue('--text-muted').trim() || '#94a3b8',
      border: cs.getPropertyValue('--border').trim() || '#cbd5e1',
    };
  }

  /** Compute node positions for a given architecture. */
  private computePositions(layerSizes: number[]): NodePos[] {
    const positions: NodePos[] = [];
    const numLayers = layerSizes.length;
    const labelOffset = this.showLabels ? 20 : 0;
    const usableWidth = this.width - 2 * this.paddingX;
    const usableHeight = this.height - 2 * this.paddingY - labelOffset;

    for (let l = 0; l < numLayers; l++) {
      const x =
        numLayers === 1
          ? this.width / 2
          : this.paddingX + (l / (numLayers - 1)) * usableWidth;
      const size = layerSizes[l];
      for (let i = 0; i < size; i++) {
        const y =
          size === 1
            ? this.paddingY + labelOffset + usableHeight / 2
            : this.paddingY +
              labelOffset +
              (i / (size - 1)) * usableHeight;
        positions.push({ layer: l, index: i, x, y });
      }
    }
    return positions;
  }

  /** Get the NodePos for a specific layer and neuron index. */
  private getNode(layer: number, index: number): NodePos | undefined {
    return this.nodePositions.find(
      (n) => n.layer === layer && n.index === index,
    );
  }

  /**
   * Set up the network structure (call once when architecture changes).
   * Draws nodes, edges, and labels.
   */
  init(snapshot: NNSnapshot): void {
    this.nodePositions = this.computePositions(snapshot.layerSizes);

    // Clear
    this.edgeGroup.selectAll('*').remove();
    this.nodeGroup.selectAll('*').remove();
    this.labelGroup.selectAll('*').remove();

    // Draw edges
    for (let l = 0; l < snapshot.weights.length; l++) {
      const w = snapshot.weights[l];
      for (let i = 0; i < w.length; i++) {
        for (let j = 0; j < w[i].length; j++) {
          const from = this.getNode(l, i)!;
          const to = this.getNode(l + 1, j)!;
          this.edgeGroup
            .append('line')
            .attr('class', 'nn-viz-edge')
            .attr('data-layer', l)
            .attr('data-from', i)
            .attr('data-to', j)
            .attr('x1', from.x)
            .attr('y1', from.y)
            .attr('x2', to.x)
            .attr('y2', to.y)
            .attr('stroke', this.colors.border)
            .attr('stroke-width', 1)
            .attr('opacity', 0.4);
        }
      }
    }

    // Draw nodes
    for (const pos of this.nodePositions) {
      const g = this.nodeGroup
        .append('g')
        .attr('data-layer', pos.layer)
        .attr('data-index', pos.index)
        .attr('transform', `translate(${pos.x},${pos.y})`);

      g.append('circle')
        .attr('class', 'nn-viz-node')
        .attr('r', this.nodeRadius)
        .attr('fill', this.colors.bg)
        .attr('stroke', this.colors.border)
        .attr('stroke-width', 2);

      g.append('text')
        .attr('class', 'nn-viz-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '12px')
        .attr('fill', this.colors.textMuted)
        .text('');
    }

    // Layer labels
    if (this.showLabels) {
      const labels = ['Input', ...snapshot.layerSizes.slice(1, -1).map((_, i) => `Hidden ${snapshot.layerSizes.length > 3 ? i + 1 : ''}`).map(s => s.trim()), 'Output'];
      for (let l = 0; l < snapshot.layerSizes.length; l++) {
        const firstNode = this.getNode(l, 0)!;
        this.labelGroup
          .append('text')
          .attr('class', 'nn-viz-layer-label')
          .attr('x', firstNode.x)
          .attr('y', this.paddingY - 6)
          .text(labels[l]);
      }
    }

    // Apply initial weights
    this.updateWeights(snapshot);
  }

  /** Update edge appearance based on current weights. */
  updateWeights(snapshot: NNSnapshot): void {
    const maxWeight = this.findMaxWeight(snapshot);

    for (let l = 0; l < snapshot.weights.length; l++) {
      const w = snapshot.weights[l];
      for (let i = 0; i < w.length; i++) {
        for (let j = 0; j < w[i].length; j++) {
          const val = w[i][j];
          const norm = maxWeight > 0 ? Math.abs(val) / maxWeight : 0;
          const color = val >= 0 ? '#3b82f6' : '#ef4444'; // blue positive, red negative
          const width = 0.5 + norm * 3.5;
          const opacity = 0.15 + norm * 0.7;

          this.edgeGroup
            .select(
              `[data-layer="${l}"][data-from="${i}"][data-to="${j}"]`,
            )
            .attr('stroke', color)
            .attr('stroke-width', width)
            .attr('opacity', opacity);
        }
      }
    }
  }

  /**
   * Update node appearance based on activations from a forward pass.
   * Pass null to clear activations (show empty nodes).
   */
  updateActivations(activations: number[][] | null): void {
    for (const pos of this.nodePositions) {
      const g = this.nodeGroup.select(
        `[data-layer="${pos.layer}"][data-index="${pos.index}"]`,
      );

      if (!activations) {
        g.select('.nn-viz-node')
          .attr('fill', this.colors.bg)
          .attr('stroke', this.colors.border);
        g.select('.nn-viz-label').text('');
        continue;
      }

      const val = activations[pos.layer]?.[pos.index] ?? 0;

      // Interpolate node fill from bg (0) to accent (1)
      const fill = d3.interpolateRgb(this.colors.bg, this.colors.accent)(val);
      const stroke = d3.interpolateRgb(
        this.colors.border,
        this.colors.accent,
      )(Math.min(val * 1.5, 1));
      const textColor = val > 0.55 ? '#fff' : this.colors.text;

      g.select('.nn-viz-node').attr('fill', fill).attr('stroke', stroke);

      g.select('.nn-viz-label')
        .attr('fill', textColor)
        .text(val.toFixed(2));
    }
  }

  /** Find the maximum absolute weight in the network. */
  private findMaxWeight(snapshot: NNSnapshot): number {
    let max = 0;
    for (const layer of snapshot.weights) {
      for (const row of layer) {
        for (const w of row) {
          max = Math.max(max, Math.abs(w));
        }
      }
    }
    return max;
  }
}
