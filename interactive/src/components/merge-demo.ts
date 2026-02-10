/**
 * Component G: MergeDemo
 *
 * Demonstrates HLL's merge superpower: two independently tracked crowds
 * can be combined by taking the element-wise max of their registers.
 * The merged estimate ≈ |A ∪ B|, not |A| + |B|.
 *
 * Two crowds with configurable overlap. Each gets its own HLL sketch.
 * A "Merge" button combines them and shows that the merged estimate
 * correctly handles the overlap while a naive sum overcounts.
 */

import * as d3 from 'd3';
import { hllRegisters, hllEstimate, mergeRegisters } from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.merge-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.merge-demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}

.merge-demo-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 130px;
}

.merge-demo-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.merge-demo-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.merge-demo-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.merge-demo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.merge-demo-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.merge-demo-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.merge-demo-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.merge-demo-crowds {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

@media (max-width: 580px) {
  .merge-demo-crowds {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .merge-demo-overlap-indicator {
    display: none;
  }
}

.merge-demo-crowd {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg, #fff);
  text-align: center;
}

.merge-demo-crowd-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.merge-demo-crowd-title-a {
  color: var(--accent, #0d9488);
}

.merge-demo-crowd-title-b {
  color: #8b5cf6;
}

.merge-demo-crowd-viz {
  min-height: 60px;
  margin-bottom: 0.5rem;
}

.merge-demo-crowd-viz svg {
  display: block;
  margin: 0 auto;
}

.merge-demo-crowd-stat {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  color: var(--text, #0f172a);
}

.merge-demo-crowd-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-demo-overlap-indicator {
  font-size: 1.5rem;
  color: var(--text-muted, #94a3b8);
  text-align: center;
  line-height: 1;
}

.merge-demo-result {
  border: 2px solid var(--accent, #0d9488);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: var(--bg, #fff);
  display: none;
}

.merge-demo-result-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent, #0d9488);
  margin-bottom: 0.75rem;
}

.merge-demo-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem 1.5rem;
}

.merge-demo-result-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.merge-demo-result-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-demo-result-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.merge-demo-result-highlight {
  color: var(--accent, #0d9488);
}

.merge-demo-result-wrong {
  color: var(--accent-secondary, #f97316);
  text-decoration: line-through;
  opacity: 0.7;
}

.merge-demo-empty {
  text-align: center;
  padding: 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
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

// ─── Dot Visualization ───────────────────────────────────────────────

function renderDotGrid(
  container: HTMLElement,
  count: number,
  color: string,
  maxDots: number = 200
): void {
  container.innerHTML = '';

  const displayCount = Math.min(count, maxDots);
  const containerWidth = container.clientWidth || 180;

  const cols = Math.ceil(Math.sqrt(displayCount * 2));
  const dotR = Math.min(4, Math.max(1.5, containerWidth / (cols * 3)));
  const spacing = dotR * 2.5;
  const rows = Math.ceil(displayCount / cols);
  const svgWidth = Math.min(containerWidth, cols * spacing + spacing);
  const svgHeight = rows * spacing + spacing;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const g = svg.append('g').attr('transform', `translate(${spacing / 2}, ${spacing / 2})`);

  for (let i = 0; i < displayCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    g.append('circle')
      .attr('cx', col * spacing)
      .attr('cy', row * spacing)
      .attr('r', dotR)
      .attr('fill', color)
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.3);
  }
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('merge-demo: mount element not found');
    return;
  }

  injectStyles();

  let sizeA = 700;
  let sizeB = 500;
  let overlapPct = 40; // percent of B that overlaps with A
  const p = 8; // 256 registers — good balance for demo

  el.innerHTML = `
    <div class="merge-demo">
      <div class="merge-demo-controls">
        <div class="merge-demo-slider-group">
          <label class="merge-demo-label">
            Crowd A
            <span class="merge-demo-label-value" data-display="a">${sizeA}</span>
          </label>
          <input type="range" class="merge-demo-slider" data-slider="a"
                 min="100" max="2000" step="50" value="${sizeA}">
        </div>
        <div class="merge-demo-slider-group">
          <label class="merge-demo-label">
            Crowd B
            <span class="merge-demo-label-value" data-display="b">${sizeB}</span>
          </label>
          <input type="range" class="merge-demo-slider" data-slider="b"
                 min="100" max="2000" step="50" value="${sizeB}">
        </div>
        <div class="merge-demo-slider-group">
          <label class="merge-demo-label">
            Overlap
            <span class="merge-demo-label-value" data-display="overlap">${overlapPct}%</span>
          </label>
          <input type="range" class="merge-demo-slider" data-slider="overlap"
                 min="0" max="100" step="5" value="${overlapPct}">
        </div>
        <button class="merge-demo-btn" data-btn="run">Run & Merge</button>
      </div>

      <div class="merge-demo-crowds">
        <div class="merge-demo-crowd" data-crowd="a">
          <div class="merge-demo-crowd-title merge-demo-crowd-title-a">Crowd A (Monday)</div>
          <div class="merge-demo-crowd-viz" data-viz="a">
            <div class="merge-demo-empty">Press Run & Merge</div>
          </div>
          <div class="merge-demo-crowd-stat-label">HLL estimate</div>
          <div class="merge-demo-crowd-stat" data-est="a">—</div>
        </div>
        <div class="merge-demo-overlap-indicator">∩</div>
        <div class="merge-demo-crowd" data-crowd="b">
          <div class="merge-demo-crowd-title merge-demo-crowd-title-b">Crowd B (Tuesday)</div>
          <div class="merge-demo-crowd-viz" data-viz="b">
            <div class="merge-demo-empty">Press Run & Merge</div>
          </div>
          <div class="merge-demo-crowd-stat-label">HLL estimate</div>
          <div class="merge-demo-crowd-stat" data-est="b">—</div>
        </div>
      </div>

      <div class="merge-demo-result" data-result>
        <div class="merge-demo-result-title">Merged Result (A ∪ B)</div>
        <div class="merge-demo-result-grid">
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">True union size</span>
            <span class="merge-demo-result-stat-value" data-res="true">—</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Merged HLL estimate</span>
            <span class="merge-demo-result-stat-value merge-demo-result-highlight" data-res="merged">—</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Naive sum (A + B)</span>
            <span class="merge-demo-result-stat-value merge-demo-result-wrong" data-res="naive">—</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Overlap</span>
            <span class="merge-demo-result-stat-value" data-res="overlap">—</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Merged error</span>
            <span class="merge-demo-result-stat-value merge-demo-result-highlight" data-res="error">—</span>
          </div>
          <div class="merge-demo-result-stat">
            <span class="merge-demo-result-stat-label">Naive error</span>
            <span class="merge-demo-result-stat-value merge-demo-result-wrong" data-res="naive-error">—</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const sliderA = el.querySelector<HTMLInputElement>('[data-slider="a"]')!;
  const sliderB = el.querySelector<HTMLInputElement>('[data-slider="b"]')!;
  const sliderOverlap = el.querySelector<HTMLInputElement>('[data-slider="overlap"]')!;
  const displayA = el.querySelector<HTMLElement>('[data-display="a"]')!;
  const displayB = el.querySelector<HTMLElement>('[data-display="b"]')!;
  const displayOverlap = el.querySelector<HTMLElement>('[data-display="overlap"]')!;
  const runBtn = el.querySelector<HTMLButtonElement>('[data-btn="run"]')!;
  const vizA = el.querySelector<HTMLElement>('[data-viz="a"]')!;
  const vizB = el.querySelector<HTMLElement>('[data-viz="b"]')!;
  const estA = el.querySelector<HTMLElement>('[data-est="a"]')!;
  const estB = el.querySelector<HTMLElement>('[data-est="b"]')!;
  const resultPanel = el.querySelector<HTMLElement>('[data-result]')!;
  const resTrue = el.querySelector<HTMLElement>('[data-res="true"]')!;
  const resMerged = el.querySelector<HTMLElement>('[data-res="merged"]')!;
  const resNaive = el.querySelector<HTMLElement>('[data-res="naive"]')!;
  const resOverlap = el.querySelector<HTMLElement>('[data-res="overlap"]')!;
  const resError = el.querySelector<HTMLElement>('[data-res="error"]')!;
  const resNaiveError = el.querySelector<HTMLElement>('[data-res="naive-error"]')!;

  sliderA.addEventListener('input', () => {
    sizeA = parseInt(sliderA.value, 10);
    displayA.textContent = String(sizeA);
  });

  sliderB.addEventListener('input', () => {
    sizeB = parseInt(sliderB.value, 10);
    displayB.textContent = String(sizeB);
  });

  sliderOverlap.addEventListener('input', () => {
    overlapPct = parseInt(sliderOverlap.value, 10);
    displayOverlap.textContent = `${overlapPct}%`;
  });

  function run() {
    // Build item sets with controlled overlap
    // Crowd A: items 0 .. sizeA-1
    // Crowd B: items that overlap with A, plus unique items
    const overlapCount = Math.round(sizeB * (overlapPct / 100));
    const uniqueB = sizeB - overlapCount;

    // A's items: [0, sizeA)
    const itemsA: number[] = [];
    for (let i = 0; i < sizeA; i++) itemsA.push(i);

    // B's items: [sizeA - overlapCount, sizeA - overlapCount + sizeB)
    // This means the last `overlapCount` items of A overlap with the first `overlapCount` items of B
    const bStart = sizeA - overlapCount;
    const itemsB: number[] = [];
    for (let i = bStart; i < bStart + sizeB; i++) itemsB.push(i);

    const trueUnion = sizeA + uniqueB; // = sizeA + sizeB - overlapCount

    // Compute HLL registers
    const regsA = hllRegisters(itemsA, p);
    const regsB = hllRegisters(itemsB, p);
    const regsMerged = mergeRegisters(regsA, regsB);

    const estAVal = hllEstimate(regsA, p);
    const estBVal = hllEstimate(regsB, p);
    const estMerged = hllEstimate(regsMerged, p);
    const naiveSum = estAVal + estBVal;

    const mergedError = Math.abs(estMerged - trueUnion) / trueUnion;
    const naiveError = Math.abs(naiveSum - trueUnion) / trueUnion;

    // Render dot grids
    renderDotGrid(vizA, sizeA, 'var(--accent, #0d9488)');
    renderDotGrid(vizB, sizeB, '#8b5cf6');

    // Update estimates
    estA.textContent = Math.round(estAVal).toLocaleString();
    estB.textContent = Math.round(estBVal).toLocaleString();

    // Show result panel
    resultPanel.style.display = '';
    resTrue.textContent = trueUnion.toLocaleString();
    resMerged.textContent = Math.round(estMerged).toLocaleString();
    resNaive.textContent = Math.round(naiveSum).toLocaleString();
    resOverlap.textContent = `${overlapCount.toLocaleString()} shared`;
    resError.textContent = `${(mergedError * 100).toFixed(1)}%`;
    resNaiveError.textContent = `${(naiveError * 100).toFixed(0)}%`;
  }

  runBtn.addEventListener('click', run);
}
