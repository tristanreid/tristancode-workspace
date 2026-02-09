/**
 * Component F: StabilityShowdown
 *
 * THE payoff component. Side-by-side comparison of single-max estimator
 * vs HyperLogLog. Same crowd size, many trials, two histograms.
 *
 * Left panel:  single-max estimates (wide, powers-of-2, noisy)
 * Right panel: HLL estimates (tight cluster around true N)
 *
 * Sliders for N, m (registers), and trial count. The contrast is dramatic.
 */

import * as d3 from 'd3';
import {
  singleMaxTrials,
  hllTrials,
  mean,
  stdDev,
  percentWithinError,
} from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.stability-showdown {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.stability-showdown-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .stability-showdown-panels {
    grid-template-columns: 1fr;
  }
}

.stability-showdown-panel {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 1rem;
  background: var(--bg, #fff);
}

.stability-showdown-panel-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
  text-align: center;
}

.stability-showdown-panel-title-left {
  color: var(--accent-secondary, #f97316);
}

.stability-showdown-panel-title-right {
  color: var(--accent, #0d9488);
}

.stability-showdown-chart {
  margin: 0.5rem 0;
  min-height: 160px;
}

.stability-showdown-chart svg {
  width: 100%;
  display: block;
}

.stability-showdown-panel-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 0.75rem;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
}

.stability-showdown-stat {
  display: flex;
  flex-direction: column;
}

.stability-showdown-stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stability-showdown-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.stability-showdown-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
}

.stability-showdown-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 140px;
}

.stability-showdown-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.stability-showdown-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.stability-showdown-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.stability-showdown-slider::-webkit-slider-thumb {
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
.stability-showdown-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.stability-showdown-btn {
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
.stability-showdown-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.stability-showdown-empty {
  text-align: center;
  padding: 2.5rem 1rem;
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

// ─── Histogram rendering ─────────────────────────────────────────────

function renderHistogram(
  container: HTMLElement,
  estimates: number[],
  trueN: number,
  accentColor: string,
  isPowerOf2: boolean
): void {
  container.innerHTML = '';
  if (estimates.length === 0) return;

  const containerWidth = container.clientWidth || 300;
  const margin = { top: 20, right: 12, bottom: 34, left: 12 };
  const width = containerWidth - margin.left - margin.right;
  const height = 150;

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  if (isPowerOf2) {
    // Strip chart for powers-of-2 (same as Component C)
    const buckets = new Map<number, number>();
    for (const e of estimates) {
      buckets.set(e, (buckets.get(e) || 0) + 1);
    }

    const log2Estimates = estimates.map((e) => Math.log2(Math.max(e, 1)));
    const minLog2 = Math.floor(Math.min(...log2Estimates)) - 0.5;
    const maxLog2 = Math.ceil(Math.max(...log2Estimates)) + 0.5;
    const trueLog2 = Math.log2(trueN);

    const xScale = d3.scaleLinear().domain([minLog2, maxLog2]).range([0, width]);
    const dotR = Math.min(4, Math.max(2, width / (estimates.length * 0.8)));
    const dotSpace = dotR * 2.2;

    // True N line
    svg.append('line')
      .attr('x1', xScale(trueLog2)).attr('x2', xScale(trueLog2))
      .attr('y1', -8).attr('y2', height + 12)
      .attr('stroke', 'var(--accent-secondary, #f97316)')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,2').attr('opacity', 0.7);

    for (const [estimate, count] of buckets.entries()) {
      const cx = xScale(Math.log2(estimate));
      for (let i = 0; i < count; i++) {
        svg.append('circle')
          .attr('cx', cx).attr('cy', height - 4 - i * dotSpace)
          .attr('r', dotR).attr('fill', accentColor).attr('opacity', 0.6)
          .attr('stroke', '#fff').attr('stroke-width', 0.3);
      }
    }

    // X-axis
    const ticks: number[] = [];
    for (let p = Math.ceil(minLog2); p <= Math.floor(maxLog2); p++) ticks.push(p);
    const xAxis = d3.axisBottom(xScale).tickValues(ticks)
      .tickFormat((d) => {
        const v = Math.pow(2, d as number);
        return v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v);
      });
    svg.append('g').attr('transform', `translate(0,${height + 4})`).call(xAxis)
      .call((g) => {
        g.select('.domain').attr('stroke', 'var(--border, #cbd5e1)');
        g.selectAll('.tick line').attr('stroke', 'var(--border, #cbd5e1)');
        g.selectAll('.tick text').attr('fill', 'var(--text-muted, #94a3b8)')
          .attr('font-size', '9px').attr('font-family', 'var(--font-mono, monospace)');
      });
  } else {
    // Standard histogram for continuous HLL estimates
    const sorted = [...estimates].sort((a, b) => a - b);
    const lo = sorted[0] * 0.8;
    const hi = sorted[sorted.length - 1] * 1.2;

    const xScale = d3.scaleLinear().domain([lo, hi]).range([0, width]);
    const bins = d3.bin().domain(xScale.domain() as [number, number]).thresholds(30)(estimates);
    const maxCount = d3.max(bins, (b) => b.length) || 1;
    const yScale = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);

    // True N line
    svg.append('line')
      .attr('x1', xScale(trueN)).attr('x2', xScale(trueN))
      .attr('y1', -8).attr('y2', height + 12)
      .attr('stroke', 'var(--accent-secondary, #f97316)')
      .attr('stroke-width', 1.5).attr('stroke-dasharray', '4,2').attr('opacity', 0.7);

    // Bars
    svg.selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.x0!) + 0.5)
      .attr('y', (d) => yScale(d.length))
      .attr('width', (d) => Math.max(0, xScale(d.x1!) - xScale(d.x0!) - 1))
      .attr('height', (d) => height - yScale(d.length))
      .attr('fill', accentColor)
      .attr('opacity', 0.7)
      .attr('rx', 1);

    // X-axis
    const xAxis = d3.axisBottom(xScale).ticks(5)
      .tickFormat((d) => {
        const v = d as number;
        return v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(Math.round(v));
      });
    svg.append('g').attr('transform', `translate(0,${height + 4})`).call(xAxis)
      .call((g) => {
        g.select('.domain').attr('stroke', 'var(--border, #cbd5e1)');
        g.selectAll('.tick line').attr('stroke', 'var(--border, #cbd5e1)');
        g.selectAll('.tick text').attr('fill', 'var(--text-muted, #94a3b8)')
          .attr('font-size', '9px').attr('font-family', 'var(--font-mono, monospace)');
      });
  }
}

// ─── Stats ───────────────────────────────────────────────────────────

function renderStats(
  container: HTMLElement,
  estimates: number[],
  trueN: number
): void {
  const sorted = [...estimates].sort((a, b) => a - b);
  const m = mean(estimates);
  const sd = stdDev(estimates);
  const pct10 = percentWithinError(estimates, trueN, 0.1);
  const lo = sorted[0];
  const hi = sorted[sorted.length - 1];
  const relErr = ((sd / trueN) * 100).toFixed(1);

  container.innerHTML = `
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Mean</span>
      <span class="stability-showdown-stat-value">${Math.round(m).toLocaleString()}</span>
    </div>
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Std error</span>
      <span class="stability-showdown-stat-value">${relErr}%</span>
    </div>
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Within 10%</span>
      <span class="stability-showdown-stat-value">${(pct10 * 100).toFixed(0)}%</span>
    </div>
    <div class="stability-showdown-stat">
      <span class="stability-showdown-stat-label">Range</span>
      <span class="stability-showdown-stat-value">${Math.round(lo).toLocaleString()} — ${Math.round(hi).toLocaleString()}</span>
    </div>
  `;
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('stability-showdown: mount element not found');
    return;
  }

  injectStyles();

  let crowdSize = 1000;
  let regBits = 4; // m = 16
  let numTrials = 200;

  el.innerHTML = `
    <div class="stability-showdown">
      <div class="stability-showdown-panels">
        <div class="stability-showdown-panel">
          <div class="stability-showdown-panel-title stability-showdown-panel-title-left">Single-Max Estimator</div>
          <div class="stability-showdown-chart" data-chart="left">
            <div class="stability-showdown-empty">Press Run Comparison</div>
          </div>
          <div class="stability-showdown-panel-stats" data-stats="left"></div>
        </div>
        <div class="stability-showdown-panel">
          <div class="stability-showdown-panel-title stability-showdown-panel-title-right">HyperLogLog (m = <span data-m-display>${1 << regBits}</span> registers)</div>
          <div class="stability-showdown-chart" data-chart="right">
            <div class="stability-showdown-empty">Press Run Comparison</div>
          </div>
          <div class="stability-showdown-panel-stats" data-stats="right"></div>
        </div>
      </div>
      <div class="stability-showdown-controls">
        <div class="stability-showdown-slider-group">
          <label class="stability-showdown-label">
            Crowd size (N)
            <span class="stability-showdown-label-value" data-display="crowd">${crowdSize.toLocaleString()}</span>
          </label>
          <input type="range" class="stability-showdown-slider" data-slider="crowd"
                 min="2" max="5" step="0.1" value="${Math.log10(crowdSize).toFixed(1)}">
        </div>
        <div class="stability-showdown-slider-group">
          <label class="stability-showdown-label">
            Registers (m)
            <span class="stability-showdown-label-value" data-display="regs">${1 << regBits}</span>
          </label>
          <input type="range" class="stability-showdown-slider" data-slider="regs"
                 min="2" max="8" step="1" value="${regBits}">
        </div>
        <div class="stability-showdown-slider-group">
          <label class="stability-showdown-label">
            Trials
            <span class="stability-showdown-label-value" data-display="trials">${numTrials}</span>
          </label>
          <input type="range" class="stability-showdown-slider" data-slider="trials"
                 min="50" max="500" step="10" value="${numTrials}">
        </div>
        <button class="stability-showdown-btn">Run Comparison</button>
      </div>
    </div>
  `;

  // Elements
  const crowdSlider = el.querySelector<HTMLInputElement>('[data-slider="crowd"]')!;
  const regsSlider = el.querySelector<HTMLInputElement>('[data-slider="regs"]')!;
  const trialsSlider = el.querySelector<HTMLInputElement>('[data-slider="trials"]')!;
  const crowdDisplay = el.querySelector<HTMLElement>('[data-display="crowd"]')!;
  const regsDisplay = el.querySelector<HTMLElement>('[data-display="regs"]')!;
  const trialsDisplay = el.querySelector<HTMLElement>('[data-display="trials"]')!;
  const mDisplay = el.querySelector<HTMLElement>('[data-m-display]')!;
  const runBtn = el.querySelector<HTMLButtonElement>('.stability-showdown-btn')!;
  const leftChart = el.querySelector<HTMLElement>('[data-chart="left"]')!;
  const rightChart = el.querySelector<HTMLElement>('[data-chart="right"]')!;
  const leftStats = el.querySelector<HTMLElement>('[data-stats="left"]')!;
  const rightStats = el.querySelector<HTMLElement>('[data-stats="right"]')!;

  crowdSlider.addEventListener('input', () => {
    crowdSize = Math.round(Math.pow(10, parseFloat(crowdSlider.value)));
    crowdDisplay.textContent = crowdSize.toLocaleString();
  });

  regsSlider.addEventListener('input', () => {
    regBits = parseInt(regsSlider.value, 10);
    const m = 1 << regBits;
    regsDisplay.textContent = String(m);
    mDisplay.textContent = String(m);
  });

  trialsSlider.addEventListener('input', () => {
    numTrials = parseInt(trialsSlider.value, 10);
    trialsDisplay.textContent = String(numTrials);
  });

  function runComparison() {
    const seed = Math.floor(Math.random() * 1_000_000);

    // Run single-max trials
    const smEstimates = singleMaxTrials(crowdSize, numTrials, seed);

    // Run HLL trials
    const hllEstimates = hllTrials(crowdSize, regBits, numTrials, seed);

    // Render
    renderHistogram(leftChart, smEstimates, crowdSize, 'var(--accent-secondary, #f97316)', true);
    renderHistogram(rightChart, hllEstimates, crowdSize, 'var(--accent, #0d9488)', false);
    renderStats(leftStats, smEstimates, crowdSize);
    renderStats(rightStats, hllEstimates, crowdSize);
  }

  runBtn.addEventListener('click', runComparison);

  // Responsive
  let resizeTimeout: ReturnType<typeof setTimeout>;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (leftChart.querySelector('svg')) runComparison();
    }, 200);
  });
  resizeObserver.observe(leftChart);
}
