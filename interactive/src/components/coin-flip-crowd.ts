/**
 * Component A: CoinFlipCrowd
 *
 * The reader's first encounter with the coin-flipping crowd metaphor.
 * A crowd of dots, each "person" flips coins until heads. The record holder
 * is highlighted, the estimate is displayed, and a histogram of streak
 * lengths makes the distribution concrete.
 *
 * Play → animate dots → show max streak → show estimate.
 * Re-run → new seed, estimate changes (building instability intuition).
 * Crowd size slider → logarithmic, 50–10,000.
 */

import * as d3 from 'd3';
import { simulateCrowd, singleMaxEstimate, createRng } from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.coin-crowd {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.coin-crowd-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1.25rem;
}

.coin-crowd-slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 150px;
}

.coin-crowd-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  display: flex;
  justify-content: space-between;
}

.coin-crowd-label-value {
  font-family: var(--font-mono, monospace);
  color: var(--accent, #0d9488);
}

.coin-crowd-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border, #cbd5e1);
  outline: none;
}
.coin-crowd-slider::-webkit-slider-thumb {
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
.coin-crowd-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent, #0d9488);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.coin-crowd-btn-group {
  display: flex;
  gap: 0.5rem;
}

.coin-crowd-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.coin-crowd-btn-primary {
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.coin-crowd-btn-primary:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.coin-crowd-btn-secondary {
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
}
.coin-crowd-btn-secondary:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.coin-crowd-viz {
  margin: 1rem 0;
}

.coin-crowd-viz svg {
  width: 100%;
  display: block;
}

.coin-crowd-results {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border, #cbd5e1);
  border-bottom: 1px solid var(--border, #cbd5e1);
  margin-bottom: 1rem;
}

.coin-crowd-result {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.coin-crowd-result-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.coin-crowd-result-value {
  font-family: var(--font-mono, monospace);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.coin-crowd-result-highlight {
  color: var(--accent-secondary, #f97316);
}

.coin-crowd-histogram {
  margin-top: 0.5rem;
}

.coin-crowd-histogram svg {
  width: 100%;
  display: block;
}

.coin-crowd-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
}

.coin-crowd-hint {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
  transition: opacity 0.3s ease;
}

@keyframes crowdDotAppear {
  from { r: 0; opacity: 0; }
  to   { opacity: 1; }
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

// ─── Crowd Dot Visualization ─────────────────────────────────────────

interface CrowdResult {
  streaks: number[];
  maxStreak: number;
  maxIdx: number;
  estimate: number;
}

function computeCrowd(n: number, seed: number): CrowdResult {
  const rng = createRng(seed);
  const streaks = simulateCrowd(n, rng);
  let maxStreak = 0;
  let maxIdx = 0;
  for (let i = 0; i < streaks.length; i++) {
    if (streaks[i] > maxStreak) {
      maxStreak = streaks[i];
      maxIdx = i;
    }
  }
  const estimate = singleMaxEstimate(streaks);
  return { streaks, maxStreak, maxIdx, estimate };
}

function renderDots(
  container: HTMLElement,
  result: CrowdResult
): void {
  container.innerHTML = '';
  const { streaks, maxStreak, maxIdx } = result;
  const n = streaks.length;

  const containerWidth = container.clientWidth || 500;

  // Calculate grid layout
  // We cap visible dots at 500 for performance; show a representative sample
  const maxDots = 500;
  const showAll = n <= maxDots;
  const displayCount = showAll ? n : maxDots;

  // Determine indices to display
  const displayIndices: number[] = [];
  if (showAll) {
    for (let i = 0; i < n; i++) displayIndices.push(i);
  } else {
    // Always include the record holder
    const step = n / maxDots;
    const sampled = new Set<number>();
    sampled.add(maxIdx);
    for (let i = 0; i < maxDots - 1; i++) {
      sampled.add(Math.floor(i * step));
    }
    displayIndices.push(...Array.from(sampled).sort((a, b) => a - b));
  }

  // Grid dimensions
  const cols = Math.ceil(Math.sqrt(displayCount * 1.5));
  const dotRadius = Math.min(6, Math.max(2, (containerWidth - 40) / (cols * 2.8)));
  const dotSpacing = dotRadius * 2.5;
  const rows = Math.ceil(displayCount / cols);
  const svgHeight = rows * dotSpacing + 20;

  // Color scale: streak length → color intensity
  // Shorter streaks = lighter teal, longer = darker teal
  const colorScale = d3
    .scaleSequential(d3.interpolateRgb('#b2dfdb', '#00695c'))
    .domain([0, Math.max(maxStreak, 3)]);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', svgHeight);

  const g = svg.append('g').attr('transform', `translate(${dotSpacing}, ${dotSpacing / 2})`);

  displayIndices.forEach((itemIdx, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * dotSpacing;
    const cy = row * dotSpacing;
    const streak = streaks[itemIdx];
    const isRecordHolder = itemIdx === maxIdx;

    if (isRecordHolder) {
      // Record holder: star shape (rendered as larger circle with ring + orange)
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 0)
        .attr('fill', 'var(--accent-secondary, #f97316)')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .transition()
        .duration(400)
        .delay(300 + i * 0.5)
        .attr('r', dotRadius * 1.8);

      // Inner star marker
      g.append('text')
        .attr('x', cx)
        .attr('y', cy)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', `${dotRadius * 1.6}px`)
        .attr('fill', '#fff')
        .attr('opacity', 0)
        .text('★')
        .transition()
        .duration(300)
        .delay(500 + i * 0.5)
        .attr('opacity', 1);
    } else {
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 0)
        .attr('fill', colorScale(streak))
        .attr('opacity', 0.75)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.3)
        .transition()
        .duration(300)
        .delay(i * 0.5)
        .attr('r', dotRadius);
    }
  });
}

// ─── Histogram of Streak Lengths ─────────────────────────────────────

function renderHistogram(
  container: HTMLElement,
  result: CrowdResult
): void {
  container.innerHTML = '';
  const { streaks, maxStreak } = result;

  const containerWidth = container.clientWidth || 500;
  const margin = { top: 14, right: 16, bottom: 36, left: 40 };
  const width = containerWidth - margin.left - margin.right;
  const height = 130;

  // Count per streak length
  const counts = new Map<number, number>();
  for (const s of streaks) {
    counts.set(s, (counts.get(s) || 0) + 1);
  }

  const maxBucket = maxStreak;
  const buckets: { streak: number; count: number }[] = [];
  for (let s = 0; s <= maxBucket; s++) {
    buckets.push({ streak: s, count: counts.get(s) || 0 });
  }

  const xScale = d3
    .scaleBand<number>()
    .domain(buckets.map((b) => b.streak))
    .range([0, width])
    .padding(0.15);

  const maxCount = d3.max(buckets, (b) => b.count) || 1;
  const yScale = d3.scaleLinear().domain([0, maxCount]).nice().range([height, 0]);

  const colorScale = d3
    .scaleSequential(d3.interpolateRgb('#b2dfdb', '#00695c'))
    .domain([0, Math.max(maxStreak, 3)]);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll('rect')
    .data(buckets)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.streak)!)
    .attr('y', height)
    .attr('width', xScale.bandwidth())
    .attr('height', 0)
    .attr('fill', (d) => d.streak === maxStreak ? 'var(--accent-secondary, #f97316)' : colorScale(d.streak))
    .attr('opacity', (d) => d.streak === maxStreak ? 1 : 0.75)
    .attr('rx', 2)
    .transition()
    .duration(400)
    .delay((_, i) => i * 30)
    .attr('y', (d) => yScale(d.count))
    .attr('height', (d) => height - yScale(d.count));

  // X-axis
  const xAxis = d3.axisBottom(xScale).tickFormat((d) => String(d));
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .call((ax) => {
      ax.select('.domain').attr('stroke', 'var(--border, #cbd5e1)');
      ax.selectAll('.tick line').attr('stroke', 'var(--border, #cbd5e1)');
      ax.selectAll('.tick text')
        .attr('fill', 'var(--text-muted, #94a3b8)')
        .attr('font-family', 'var(--font-mono, monospace)')
        .attr('font-size', '10px');
    });

  // X-axis label
  g.append('text')
    .attr('x', width / 2)
    .attr('y', height + 32)
    .attr('text-anchor', 'middle')
    .attr('fill', 'var(--text-muted, #94a3b8)')
    .attr('font-size', '11px')
    .text('Streak length (tails before heads)');

  // Y-axis
  const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat((d) => String(d));
  g.append('g')
    .call(yAxis)
    .call((ax) => {
      ax.select('.domain').attr('stroke', 'var(--border, #cbd5e1)');
      ax.selectAll('.tick line').attr('stroke', 'var(--border, #cbd5e1)');
      ax.selectAll('.tick text')
        .attr('fill', 'var(--text-muted, #94a3b8)')
        .attr('font-family', 'var(--font-mono, monospace)')
        .attr('font-size', '10px');
    });
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('coin-flip-crowd: mount element not found');
    return;
  }

  injectStyles();

  let crowdSize = 200;
  let runCount = 0;
  let seed = Math.floor(Math.random() * 1_000_000);

  el.innerHTML = `
    <div class="coin-crowd">
      <div class="coin-crowd-controls">
        <div class="coin-crowd-slider-group">
          <label class="coin-crowd-label">
            Crowd size
            <span class="coin-crowd-label-value" data-display="crowd">${crowdSize.toLocaleString()}</span>
          </label>
          <input type="range" class="coin-crowd-slider" data-slider="crowd"
                 min="1.7" max="4" step="0.05" value="${Math.log10(crowdSize).toFixed(2)}">
        </div>
        <div class="coin-crowd-btn-group">
          <button class="coin-crowd-btn coin-crowd-btn-primary" data-btn="play">Play</button>
          <button class="coin-crowd-btn coin-crowd-btn-secondary" data-btn="rerun">Re-run</button>
        </div>
      </div>
      <div class="coin-crowd-viz">
        <div class="coin-crowd-empty">Press Play to let the crowd flip coins...</div>
      </div>
      <div class="coin-crowd-results" style="display:none" data-results></div>
      <div class="coin-crowd-histogram" data-histogram></div>
      <div class="coin-crowd-hint" style="display:none" data-hint></div>
    </div>
  `;

  const crowdSlider = el.querySelector<HTMLInputElement>('[data-slider="crowd"]')!;
  const crowdDisplay = el.querySelector<HTMLElement>('[data-display="crowd"]')!;
  const playBtn = el.querySelector<HTMLButtonElement>('[data-btn="play"]')!;
  const rerunBtn = el.querySelector<HTMLButtonElement>('[data-btn="rerun"]')!;
  const vizContainer = el.querySelector<HTMLElement>('.coin-crowd-viz')!;
  const resultsContainer = el.querySelector<HTMLElement>('[data-results]')!;
  const histContainer = el.querySelector<HTMLElement>('[data-histogram]')!;
  const hintContainer = el.querySelector<HTMLElement>('[data-hint]')!;

  crowdSlider.addEventListener('input', () => {
    crowdSize = Math.round(Math.pow(10, parseFloat(crowdSlider.value)));
    crowdDisplay.textContent = crowdSize.toLocaleString();
  });

  function runGame() {
    seed = Math.floor(Math.random() * 1_000_000);
    runCount++;

    const result = computeCrowd(crowdSize, seed);

    // Render dots
    renderDots(vizContainer, result);

    // Render results panel
    resultsContainer.style.display = '';
    const accuracy = ((result.estimate / crowdSize) * 100).toFixed(0);
    const direction = result.estimate > crowdSize ? 'over' : result.estimate < crowdSize ? 'under' : 'exact';
    resultsContainer.innerHTML = `
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Crowd size</span>
        <span class="coin-crowd-result-value">${crowdSize.toLocaleString()}</span>
      </div>
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Record streak</span>
        <span class="coin-crowd-result-value coin-crowd-result-highlight">${result.maxStreak} tails</span>
      </div>
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Estimate</span>
        <span class="coin-crowd-result-value coin-crowd-result-highlight">2<sup>${result.maxStreak}</sup> = ${result.estimate.toLocaleString()}</span>
      </div>
      <div class="coin-crowd-result">
        <span class="coin-crowd-result-label">Accuracy</span>
        <span class="coin-crowd-result-value">${accuracy}% ${direction === 'over' ? '(over)' : direction === 'under' ? '(under)' : '(exact!)'}</span>
      </div>
    `;

    // Render histogram
    renderHistogram(histContainer, result);

    // Show hint after multiple re-runs
    if (runCount >= 3) {
      hintContainer.style.display = '';
      hintContainer.textContent =
        'Notice how the estimate changes each time? The longest streak depends on luck — ' +
        'one person gets a lucky long run and the estimate jumps. ' +
        "That's the instability problem we'll solve in Part 3.";
    }
  }

  playBtn.addEventListener('click', runGame);
  rerunBtn.addEventListener('click', runGame);

  // Responsive: re-render on resize if we have data
  let resizeTimeout: ReturnType<typeof setTimeout>;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (vizContainer.querySelector('svg')) {
        const result = computeCrowd(crowdSize, seed);
        renderDots(vizContainer, result);
        renderHistogram(histContainer, result);
      }
    }, 200);
  });
  resizeObserver.observe(vizContainer);
}
