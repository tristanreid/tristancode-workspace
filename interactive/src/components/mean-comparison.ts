/**
 * Component E: MeanComparison
 *
 * Shows register estimates as dots on a log-scale number line, with
 * arithmetic mean and harmonic mean marked. The reader regenerates
 * to see that arithmetic mean bounces around (pulled by outliers)
 * while harmonic mean stays close to truth.
 */

import {
  hllRegisters,
  mean as arithmeticMean,
  harmonicMean,
} from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.mean-comparison {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.mean-comparison-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.mean-comparison-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mean-comparison-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.mean-comparison-info {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-family: var(--font-mono, monospace);
}

.mean-comparison-chart {
  margin: 0.75rem 0;
  position: relative;
}

.mean-comparison-chart svg {
  width: 100%;
  display: block;
}

.mean-comparison-estimates {
  font-size: 0.8rem;
  font-family: var(--font-mono, monospace);
  color: var(--text-secondary, #475569);
  margin-bottom: 0.75rem;
  line-height: 1.6;
  word-break: break-all;
}

.mean-comparison-estimates-label {
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.7rem;
}

.mean-comparison-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.5rem 1.5rem;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
}

.mean-comparison-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.mean-comparison-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mean-comparison-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
}

.mean-comparison-callout {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
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

// ─── Data ───────────────────────────────────────────────────────────

interface MeanData {
  estimates: number[];  // per-register power-of-2 estimates
  arithMean: number;
  harmMean: number;
  trueN: number;
}

function computeData(n: number, p: number, seed: number): MeanData {
  const items = Array.from({ length: n }, (_, i) => i);
  const regs = hllRegisters(items, p, seed);
  // hllRegisters stores ρ = L + 1 (position of first 1-bit).
  // Each register's local estimate is 2^L = 2^(ρ-1), matching our
  // single-max estimator: "how many tails before the first heads?"
  const estimates = regs.map((r) => (r > 0 ? Math.pow(2, r - 1) : 0));
  const nonEmpty = estimates.filter((e) => e > 0);
  const am = arithmeticMean(nonEmpty);
  const hm = harmonicMean(nonEmpty);
  return { estimates: nonEmpty, arithMean: am, harmMean: hm, trueN: n };
}

// ─── Chart ──────────────────────────────────────────────────────────

function renderChart(container: HTMLElement, data: MeanData): void {
  container.innerHTML = '';

  const { estimates, arithMean, harmMean, trueN } = data;
  const containerWidth = container.clientWidth || 500;
  const margin = { top: 36, right: 20, bottom: 32, left: 20 };
  const width = containerWidth - margin.left - margin.right;
  const height = 80;

  // Determine range (log scale)
  const allValues = [...estimates, arithMean, harmMean, trueN / estimates.length];
  const minLog = Math.floor(Math.log2(Math.max(1, Math.min(...allValues)))) - 0.5;
  const maxLog = Math.ceil(Math.log2(Math.max(...allValues))) + 0.5;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(containerWidth));
  svg.setAttribute('height', String(height + margin.top + margin.bottom));

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  // Scale
  function xPos(val: number): number {
    const log = Math.log2(Math.max(val, 1));
    return ((log - minLog) / (maxLog - minLog)) * width;
  }

  // Axis line
  const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axisLine.setAttribute('x1', '0');
  axisLine.setAttribute('x2', String(width));
  axisLine.setAttribute('y1', String(height / 2));
  axisLine.setAttribute('y2', String(height / 2));
  axisLine.setAttribute('stroke', 'var(--border, #cbd5e1)');
  axisLine.setAttribute('stroke-width', '1');
  g.appendChild(axisLine);

  // Tick marks
  for (let p = Math.ceil(minLog); p <= Math.floor(maxLog); p++) {
    const x = xPos(Math.pow(2, p));
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', String(x));
    tick.setAttribute('x2', String(x));
    tick.setAttribute('y1', String(height / 2 - 4));
    tick.setAttribute('y2', String(height / 2 + 4));
    tick.setAttribute('stroke', 'var(--border, #cbd5e1)');
    g.appendChild(tick);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(height / 2 + 18));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--text-muted, #94a3b8)');
    label.setAttribute('font-size', '10');
    label.setAttribute('font-family', 'var(--font-mono, monospace)');
    const val = Math.pow(2, p);
    label.textContent = val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val);
    g.appendChild(label);
  }

  // Estimate dots (jittered vertically)
  estimates.forEach((est, i) => {
    const x = xPos(est);
    const y = height / 2 - 10 - (i % 3) * 8;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(x));
    circle.setAttribute('cy', String(y));
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', 'var(--accent, #0d9488)');
    circle.setAttribute('opacity', '0.5');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '0.5');
    g.appendChild(circle);
  });

  // Arithmetic mean marker
  addMarker(g, xPos(arithMean), height / 2, '#ef4444', 'Arith. mean', -28);

  // Harmonic mean marker
  addMarker(g, xPos(harmMean), height / 2, 'var(--accent, #0d9488)', 'Harm. mean', -16);

  container.appendChild(svg);
}

function addMarker(
  g: SVGGElement,
  x: number,
  y: number,
  color: string,
  label: string,
  labelY: number
): void {
  // Vertical line
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', String(x));
  line.setAttribute('x2', String(x));
  line.setAttribute('y1', String(y - 35));
  line.setAttribute('y2', String(y + 4));
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '2');
  line.setAttribute('stroke-dasharray', '4,2');
  g.appendChild(line);

  // Label
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', String(x));
  text.setAttribute('y', String(y + labelY));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', color);
  text.setAttribute('font-size', '10');
  text.setAttribute('font-weight', '700');
  text.setAttribute('font-family', 'var(--font-mono, monospace)');
  text.textContent = label;
  g.appendChild(text);
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('mean-comparison: mount element not found');
    return;
  }

  injectStyles();

  const N = 1000;
  const P = 3; // 8 registers — small enough to show individual estimates
  let seed = Math.floor(Math.random() * 1_000_000);

  el.innerHTML = `
    <div class="mean-comparison">
      <div class="mean-comparison-controls">
        <button class="mean-comparison-btn">Re-generate</button>
        <span class="mean-comparison-info">${N.toLocaleString()} items → ${1 << P} sub-crowds</span>
      </div>
      <div class="mean-comparison-estimates"></div>
      <div class="mean-comparison-chart"></div>
      <div class="mean-comparison-stats"></div>
      <div class="mean-comparison-callout">
        The <strong style="color:#ef4444">arithmetic mean</strong> gets pulled toward outliers.
        The <strong style="color:var(--accent, #0d9488)">harmonic mean</strong> naturally down-weights
        them, staying close to the truth. This is why HyperLogLog uses the harmonic mean.
      </div>
    </div>
  `;

  const btn = el.querySelector<HTMLButtonElement>('.mean-comparison-btn')!;
  const estimatesEl = el.querySelector<HTMLElement>('.mean-comparison-estimates')!;
  const chartEl = el.querySelector<HTMLElement>('.mean-comparison-chart')!;
  const statsEl = el.querySelector<HTMLElement>('.mean-comparison-stats')!;

  function run() {
    seed = Math.floor(Math.random() * 1_000_000);
    const data = computeData(N, P, seed);
    const m = 1 << P;
    const truePerSub = N / m;

    // Show raw estimates
    estimatesEl.innerHTML = `
      <span class="mean-comparison-estimates-label">Sub-crowd estimates:</span>
      [${data.estimates.map((e) => e.toLocaleString()).join(', ')}]
    `;

    renderChart(chartEl, data);

    const arithErr = ((Math.abs(data.arithMean - truePerSub) / truePerSub) * 100).toFixed(0);
    const harmErr = ((Math.abs(data.harmMean - truePerSub) / truePerSub) * 100).toFixed(0);

    statsEl.innerHTML = `
      <div class="mean-comparison-stat">
        <span class="mean-comparison-stat-label">Arithmetic mean</span>
        <span class="mean-comparison-stat-value" style="color:#ef4444">${Math.round(data.arithMean).toLocaleString()} <span style="font-size:0.75rem;font-weight:400">(${arithErr}% off)</span></span>
      </div>
      <div class="mean-comparison-stat">
        <span class="mean-comparison-stat-label">Harmonic mean</span>
        <span class="mean-comparison-stat-value" style="color:var(--accent, #0d9488)">${Math.round(data.harmMean).toLocaleString()} <span style="font-size:0.75rem;font-weight:400">(${harmErr}% off)</span></span>
      </div>
      <div class="mean-comparison-stat">
        <span class="mean-comparison-stat-label">True (per sub-crowd)</span>
        <span class="mean-comparison-stat-value">~${Math.round(truePerSub).toLocaleString()}</span>
      </div>
    `;
  }

  btn.addEventListener('click', run);

  // Responsive resize
  let resizeTimeout: ReturnType<typeof setTimeout>;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (chartEl.querySelector('svg')) run();
    }, 200);
  });
  resizeObserver.observe(chartEl);

  run(); // initial
}
