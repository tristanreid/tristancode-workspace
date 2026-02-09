/**
 * Component C: MaxStreakDistribution
 *
 * The critical "instability" demonstration. The reader picks a crowd size,
 * runs hundreds of trials of the single-max estimator, and sees how wildly
 * the estimates scatter — all powers of 2, spread across a huge range.
 *
 * Visualization: a strip chart where each dot is one trial, stacked at its
 * power-of-2 estimate value on a log2 x-axis. True N is shown as a prominent
 * vertical line. Dots are colored by how far off they are from the truth.
 */

import * as d3 from 'd3';
import { singleMaxTrials, mean, median, stdDev } from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.max-streak-dist {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.max-streak-dist-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: flex-end;
}

.max-streak-dist-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 160px;
}

.max-streak-dist-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.max-streak-dist-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.max-streak-dist-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.max-streak-dist-slider::-webkit-slider-thumb {
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
.max-streak-dist-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.max-streak-dist-btn {
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
  white-space: nowrap;
}
.max-streak-dist-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.max-streak-dist-chart {
  margin: 1rem 0;
  position: relative;
}

.max-streak-dist-chart svg {
  width: 100%;
  display: block;
}

.max-streak-dist-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.5rem 1.5rem;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.max-streak-dist-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.max-streak-dist-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.max-streak-dist-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text, #0f172a);
}

.max-streak-dist-callout {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
}

.max-streak-dist-prose {
  margin-top: 1.25rem;
  font-size: inherit;
  line-height: 1.7;
  color: var(--text, #0f172a);
}

.max-streak-dist-prose p {
  margin: 0 0 1em 0;
}

.max-streak-dist-prose p:last-child {
  margin-bottom: 0;
}

.max-streak-dist-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
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

// ─── Chart Rendering ─────────────────────────────────────────────────

interface ChartData {
  estimates: number[];
  trueN: number;
}

function renderChart(
  container: HTMLElement,
  data: ChartData
): void {
  const { estimates, trueN } = data;

  // Clear previous
  container.innerHTML = '';

  if (estimates.length === 0) {
    container.innerHTML = '<div class="max-streak-dist-empty">Press Run Trials to simulate...</div>';
    return;
  }

  // Dimensions
  const containerWidth = container.clientWidth || 500;
  const margin = { top: 28, right: 20, bottom: 44, left: 20 };
  const width = containerWidth - margin.left - margin.right;
  const height = 280 - margin.top - margin.bottom;

  // Count estimates per power-of-2 bucket
  const buckets = new Map<number, number>();
  for (const e of estimates) {
    buckets.set(e, (buckets.get(e) || 0) + 1);
  }

  // Determine x-axis range (in log2 space)
  const log2Estimates = estimates.map((e) => Math.log2(e));
  const minLog2 = Math.floor(Math.min(...log2Estimates)) - 0.5;
  const maxLog2 = Math.ceil(Math.max(...log2Estimates)) + 0.5;
  const trueLog2 = Math.log2(trueN);

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain([minLog2, maxLog2])
    .range([0, width]);

  const maxCount = Math.max(...buckets.values());
  const dotRadius = Math.min(6, Math.max(2.5, width / (estimates.length * 0.6)));
  const dotSpacing = dotRadius * 2.2;

  // SVG
  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', 280)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // True N reference line (behind everything)
  svg
    .append('line')
    .attr('x1', xScale(trueLog2))
    .attr('x2', xScale(trueLog2))
    .attr('y1', -margin.top + 8)
    .attr('y2', height + 20)
    .attr('stroke', 'var(--accent-secondary, #f97316)')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6,3')
    .attr('opacity', 0.8);

  // True N label
  svg
    .append('text')
    .attr('x', xScale(trueLog2))
    .attr('y', -margin.top + 18)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--accent-secondary, #f97316)')
    .attr('font-size', '11px')
    .attr('font-weight', '700')
    .attr('font-family', 'var(--font-mono, monospace)')
    .text(`True N = ${trueN.toLocaleString()}`);

  // Color scale: distance from truth (green = close, orange/red = far)
  const colorScale = (estimate: number): string => {
    const ratio = Math.abs(Math.log2(estimate) - trueLog2);
    if (ratio <= 0.5) return 'var(--accent, #0d9488)';
    if (ratio <= 1.5) return '#f59e0b'; // amber
    return 'var(--accent-secondary, #f97316)';
  };

  // Draw dots (strip plot, stacked vertically at each power of 2)
  const sortedBuckets = Array.from(buckets.entries()).sort(
    (a, b) => a[0] - b[0]
  );

  for (const [estimate, count] of sortedBuckets) {
    const cx = xScale(Math.log2(estimate));
    const col = colorScale(estimate);

    for (let i = 0; i < count; i++) {
      const cy = height - 8 - i * dotSpacing;
      svg
        .append('circle')
        .attr('cx', cx)
        .attr('cy', Math.max(cy, 0))
        .attr('r', 0)
        .attr('fill', col)
        .attr('opacity', 0.75)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .transition()
        .duration(300)
        .delay(i * 5 + Math.abs(Math.log2(estimate) - trueLog2) * 30)
        .attr('r', dotRadius);
    }
  }

  // X-axis: powers of 2
  const tickValues: number[] = [];
  for (let p = Math.ceil(minLog2); p <= Math.floor(maxLog2); p++) {
    tickValues.push(p);
  }

  const xAxis = d3
    .axisBottom(xScale)
    .tickValues(tickValues)
    .tickFormat((d) => {
      const val = Math.pow(2, d as number);
      if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
      return val.toFixed(0);
    });

  svg
    .append('g')
    .attr('transform', `translate(0,${height + 4})`)
    .call(xAxis)
    .call((g) => {
      g.select('.domain').attr('stroke', 'var(--border, #cbd5e1)');
      g.selectAll('.tick line').attr('stroke', 'var(--border, #cbd5e1)');
      g.selectAll('.tick text')
        .attr('fill', 'var(--text-muted, #94a3b8)')
        .attr('font-family', 'var(--font-mono, monospace)')
        .attr('font-size', '10px');
    });

  // X-axis label
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', height + 40)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text-muted, #94a3b8)')
    .attr('font-size', '11px')
    .text('Estimate (powers of 2)');
}

// ─── Stats Rendering ─────────────────────────────────────────────────

function renderStats(
  container: HTMLElement,
  estimates: number[],
  trueN: number
): void {
  if (estimates.length === 0) {
    container.innerHTML = '';
    return;
  }

  const sorted = [...estimates].sort((a, b) => a - b);
  const m = mean(estimates);
  const med = median(estimates);
  const sd = stdDev(estimates);
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const within10 = estimates.filter(
    (e) => Math.abs(e - trueN) / trueN <= 0.1
  ).length;
  const pctWithin10 = ((within10 / estimates.length) * 100).toFixed(0);

  container.innerHTML = `
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">True N</span>
      <span class="max-streak-dist-stat-value">${trueN.toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Mean estimate</span>
      <span class="max-streak-dist-stat-value">${Math.round(m).toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Median estimate</span>
      <span class="max-streak-dist-stat-value">${Math.round(med).toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Std deviation</span>
      <span class="max-streak-dist-stat-value">${Math.round(sd).toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Range</span>
      <span class="max-streak-dist-stat-value">${lo.toLocaleString()} — ${hi.toLocaleString()}</span>
    </div>
    <div class="max-streak-dist-stat">
      <span class="max-streak-dist-stat-label">Within 10% of N</span>
      <span class="max-streak-dist-stat-value">${pctWithin10}%</span>
    </div>
  `;
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('max-streak-distribution: mount element not found');
    return;
  }

  injectStyles();

  // Default values
  let crowdSize = 1000;
  let numTrials = 200;
  let seed = Math.floor(Math.random() * 1_000_000);

  el.innerHTML = `
    <div class="max-streak-dist">
      <div class="max-streak-dist-controls">
        <div class="max-streak-dist-slider-group">
          <label class="max-streak-dist-label">
            Crowd size (N)
            <span class="max-streak-dist-label-value" data-display="crowd">${crowdSize.toLocaleString()}</span>
          </label>
          <input type="range" class="max-streak-dist-slider" data-slider="crowd"
                 min="2" max="5" step="0.1" value="3">
        </div>
        <div class="max-streak-dist-slider-group">
          <label class="max-streak-dist-label">
            Trials
            <span class="max-streak-dist-label-value" data-display="trials">${numTrials}</span>
          </label>
          <input type="range" class="max-streak-dist-slider" data-slider="trials"
                 min="50" max="500" step="10" value="${numTrials}">
        </div>
        <button class="max-streak-dist-btn">Run Trials</button>
      </div>
      <div class="max-streak-dist-chart">
        <div class="max-streak-dist-empty">Press Run Trials to simulate...</div>
      </div>
      <div class="max-streak-dist-stats"></div>
      <div class="max-streak-dist-prose" style="display:none"></div>
    </div>
  `;

  const crowdSlider = el.querySelector<HTMLInputElement>(
    '[data-slider="crowd"]'
  )!;
  const trialsSlider = el.querySelector<HTMLInputElement>(
    '[data-slider="trials"]'
  )!;
  const crowdDisplay = el.querySelector<HTMLElement>(
    '[data-display="crowd"]'
  )!;
  const trialsDisplay = el.querySelector<HTMLElement>(
    '[data-display="trials"]'
  )!;
  const runBtn = el.querySelector<HTMLButtonElement>(
    '.max-streak-dist-btn'
  )!;
  const chartContainer = el.querySelector<HTMLElement>(
    '.max-streak-dist-chart'
  )!;
  const statsContainer = el.querySelector<HTMLElement>(
    '.max-streak-dist-stats'
  )!;
  const proseContainer = el.querySelector<HTMLElement>(
    '.max-streak-dist-prose'
  )!;

  // Crowd size slider is logarithmic: value is log10(N)
  crowdSlider.addEventListener('input', () => {
    crowdSize = Math.round(Math.pow(10, parseFloat(crowdSlider.value)));
    crowdDisplay.textContent = crowdSize.toLocaleString();
  });

  trialsSlider.addEventListener('input', () => {
    numTrials = parseInt(trialsSlider.value, 10);
    trialsDisplay.textContent = String(numTrials);
  });

  function runSimulation() {
    seed = Math.floor(Math.random() * 1_000_000);
    const estimates = singleMaxTrials(crowdSize, numTrials, seed);

    renderChart(chartContainer, { estimates, trueN: crowdSize });
    renderStats(statsContainer, estimates, crowdSize);

    // Dynamic prose with actual min/max from this run
    const sorted = [...estimates].sort((a, b) => a - b);
    const lo = sorted[0];
    const hi = sorted[sorted.length - 1];
    proseContainer.style.display = '';
    proseContainer.innerHTML = `
      <p>The estimates can only land on powers of 2, and they spread across a <em>huge</em> range.
      One hash function gives ${lo.toLocaleString()}, another gives ${hi.toLocaleString()} —
      both trying to estimate the exact same crowd of ${crowdSize.toLocaleString()}.</p>
      <p>Why is it this bad? Because the estimate depends entirely on the single luckiest
      (or unluckiest) person in the crowd. One person gets a lucky long streak and the estimate
      doubles. Nobody gets lucky and the estimate might be half what it should be. The
      coarse-grained, powers-of-2 nature of the estimate makes it even worse — there's no way
      to land on a value between, say, ${lo.toLocaleString()} and ${(lo * 2).toLocaleString()}.</p>
    `;
  }

  runBtn.addEventListener('click', runSimulation);

  // Also handle window resize for responsive chart
  let resizeTimeout: ReturnType<typeof setTimeout>;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Re-render if we have data
      if (chartContainer.querySelector('svg')) {
        runSimulation();
      }
    }, 200);
  });
  resizeObserver.observe(chartContainer);
}
