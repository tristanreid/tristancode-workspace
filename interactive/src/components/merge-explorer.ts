/**
 * Merge Explorer — Interactive component for "Split, Process, Combine"
 *
 * Pick an operation (sum, max, min, count, mean, median), split a dataset
 * across 3 machines, and see whether the distributed result matches the
 * centralized one. Highlights failure cases with clear visual feedback.
 */

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.merge-explorer {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.merge-explorer-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.merge-explorer-select {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  cursor: pointer;
}

.merge-explorer-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.45rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.merge-explorer-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.merge-explorer-btn-secondary {
  background: transparent;
  color: var(--accent, #0d9488);
}
.merge-explorer-btn-secondary:hover {
  background: var(--accent, #0d9488);
  color: #fff;
}

.merge-explorer-machines {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (max-width: 580px) {
  .merge-explorer-machines {
    grid-template-columns: 1fr;
  }
}

.merge-explorer-machine {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
  text-align: center;
}

.merge-explorer-machine-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.merge-explorer-machine-title-0 { color: var(--accent, #0d9488); }
.merge-explorer-machine-title-1 { color: #8b5cf6; }
.merge-explorer-machine-title-2 { color: #e87b35; }

.merge-explorer-machine-data {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-secondary, #475569);
  margin-bottom: 0.5rem;
  line-height: 1.5;
  word-break: break-all;
}

.merge-explorer-machine-result {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.merge-explorer-machine-result-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-explorer-verdict {
  border: 2px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: var(--bg, #fff);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1.5rem;
  margin-bottom: 0.75rem;
}

.merge-explorer-verdict-match {
  border-color: var(--accent, #0d9488);
}

.merge-explorer-verdict-mismatch {
  border-color: #ef4444;
}

.merge-explorer-verdict-item {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.merge-explorer-verdict-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.merge-explorer-verdict-value {
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.merge-explorer-verdict-correct {
  color: var(--accent, #0d9488);
}

.merge-explorer-verdict-wrong {
  color: #ef4444;
}

.merge-explorer-verdict-icon {
  font-size: 1.3rem;
}

.merge-explorer-explanation {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
}

.merge-explorer-explanation-match {
  border-left-color: var(--accent, #0d9488);
  background: rgba(13,148,136,0.04);
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

// ─── Operations ─────────────────────────────────────────────────────

type OpName = 'sum' | 'max' | 'min' | 'count' | 'mean' | 'median';

interface OpResult {
  partials: string[];          // partial result displayed per machine
  combined: number;            // result of combining partials
  centralized: number;         // correct answer from all data
  match: boolean;
  explanation: string;
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function computeOp(op: OpName, partitions: number[][]): OpResult {
  const all = partitions.flat();

  switch (op) {
    case 'sum': {
      const partials = partitions.map(p => p.reduce((a, b) => a + b, 0));
      const combined = partials.reduce((a, b) => a + b, 0);
      const centralized = all.reduce((a, b) => a + b, 0);
      return {
        partials: partials.map(String),
        combined,
        centralized,
        match: combined === centralized,
        explanation: 'Sum of sums = sum of all. It doesn\'t matter how you split the data.',
      };
    }
    case 'max': {
      const partials = partitions.map(p => Math.max(...p));
      const combined = Math.max(...partials);
      const centralized = Math.max(...all);
      return {
        partials: partials.map(String),
        combined,
        centralized,
        match: combined === centralized,
        explanation: 'Max of maxes = max of all. The global maximum can\'t hide inside a partition.',
      };
    }
    case 'min': {
      const partials = partitions.map(p => Math.min(...p));
      const combined = Math.min(...partials);
      const centralized = Math.min(...all);
      return {
        partials: partials.map(String),
        combined,
        centralized,
        match: combined === centralized,
        explanation: 'Min of mins = min of all. Same reasoning as max — the global minimum surfaces.',
      };
    }
    case 'count': {
      const partials = partitions.map(p => p.length);
      const combined = partials.reduce((a, b) => a + b, 0);
      const centralized = all.length;
      return {
        partials: partials.map(String),
        combined,
        centralized,
        match: combined === centralized,
        explanation: 'Count is just a sum of 1s. Every partition knows how many items it has.',
      };
    }
    case 'mean': {
      const partials = partitions.map(
        p => p.reduce((a, b) => a + b, 0) / p.length
      );
      // Wrong way: average of averages
      const combined = partials.reduce((a, b) => a + b, 0) / partials.length;
      const centralized = all.reduce((a, b) => a + b, 0) / all.length;
      const match = Math.abs(combined - centralized) < 0.001;
      return {
        partials: partials.map(v => v.toFixed(2)),
        combined: Math.round(combined * 100) / 100,
        centralized: Math.round(centralized * 100) / 100,
        match,
        explanation: match
          ? 'The partitions happen to be equal-sized, so the mean of means matches. Try reshuffling for unequal splits!'
          : 'Mean of means \u2260 mean of all! The small partition\'s mean gets equal weight with the large one, skewing the result. To fix this, carry (sum, count) pairs instead.',
      };
    }
    case 'median': {
      const partials = partitions.map(p => median(p));
      const combined = median(partials);
      const centralized = median(all);
      const match = combined === centralized;
      return {
        partials: partials.map(v => Number.isInteger(v) ? String(v) : v.toFixed(1)),
        combined: Math.round(combined * 100) / 100,
        centralized: Math.round(centralized * 100) / 100,
        match,
        explanation: match
          ? 'Got lucky — the median of medians happened to match this time. Reshuffle to see it fail!'
          : 'Median of medians \u2260 global median. There\'s no trick that fixes this. Exact median requires seeing all the data in one place — a global shuffle.',
      };
    }
  }
}

// ─── Data Generation ────────────────────────────────────────────────

/**
 * Generate a dataset of n numbers and split into 3 unequal partitions.
 * Unequal sizes make mean/median failures more obvious.
 */
function generateData(): { all: number[]; partitions: number[][] } {
  // Create a dataset with interesting values
  const base = [7, 3, 9, 2, 14, 1, 5, 8, 6, 11, 4, 100];
  // Shuffle
  const all = [...base];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  // Unequal splits: 5, 3, 4
  const partitions = [
    all.slice(0, 5),
    all.slice(5, 8),
    all.slice(8, 12),
  ];
  return { all, partitions };
}

// ─── Mount ──────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('merge-explorer: mount element not found');
    return;
  }

  injectStyles();

  const MACHINE_COLORS = ['var(--accent, #0d9488)', '#8b5cf6', '#e87b35'];
  const MACHINE_NAMES = ['Machine A', 'Machine B', 'Machine C'];

  let currentOp: OpName = 'sum';
  let data = generateData();

  el.innerHTML = `
    <div class="merge-explorer">
      <div class="merge-explorer-header">
        <select class="merge-explorer-select" data-op>
          <option value="sum" selected>Sum</option>
          <option value="max">Max</option>
          <option value="min">Min</option>
          <option value="count">Count</option>
          <option value="mean">Mean (naive)</option>
          <option value="median">Median</option>
        </select>
        <button class="merge-explorer-btn" data-run>Split & Merge</button>
        <button class="merge-explorer-btn merge-explorer-btn-secondary" data-reshuffle>Reshuffle Data</button>
      </div>
      <div class="merge-explorer-machines" data-machines></div>
      <div class="merge-explorer-verdict" data-verdict></div>
      <div class="merge-explorer-explanation" data-explanation></div>
    </div>
  `;

  const opSelect = el.querySelector<HTMLSelectElement>('[data-op]')!;
  const runBtn = el.querySelector<HTMLButtonElement>('[data-run]')!;
  const reshuffleBtn = el.querySelector<HTMLButtonElement>('[data-reshuffle]')!;
  const machinesEl = el.querySelector<HTMLElement>('[data-machines]')!;
  const verdictEl = el.querySelector<HTMLElement>('[data-verdict]')!;
  const explanationEl = el.querySelector<HTMLElement>('[data-explanation]')!;

  function render() {
    const result = computeOp(currentOp, data.partitions);

    // Machines
    machinesEl.innerHTML = data.partitions.map((partition, i) => `
      <div class="merge-explorer-machine">
        <div class="merge-explorer-machine-title merge-explorer-machine-title-${i}">
          ${MACHINE_NAMES[i]} (${partition.length} items)
        </div>
        <div class="merge-explorer-machine-data">
          [${partition.join(', ')}]
        </div>
        <div class="merge-explorer-machine-result-label">
          Partial ${currentOp}
        </div>
        <div class="merge-explorer-machine-result">
          ${result.partials[i]}
        </div>
      </div>
    `).join('');

    // Verdict
    const matchClass = result.match
      ? 'merge-explorer-verdict-match'
      : 'merge-explorer-verdict-mismatch';
    const combinedClass = result.match
      ? 'merge-explorer-verdict-correct'
      : 'merge-explorer-verdict-wrong';
    const icon = result.match ? '\u2714' : '\u2718';
    const iconClass = result.match
      ? 'merge-explorer-verdict-correct'
      : 'merge-explorer-verdict-wrong';

    verdictEl.className = `merge-explorer-verdict ${matchClass}`;
    verdictEl.innerHTML = `
      <div class="merge-explorer-verdict-item">
        <span class="merge-explorer-verdict-label">Combined (distributed)</span>
        <span class="merge-explorer-verdict-value ${combinedClass}">
          ${result.combined}
        </span>
      </div>
      <div class="merge-explorer-verdict-item">
        <span class="merge-explorer-verdict-label">Centralized (correct)</span>
        <span class="merge-explorer-verdict-value merge-explorer-verdict-correct">
          ${result.centralized}
        </span>
      </div>
      <div class="merge-explorer-verdict-item">
        <span class="merge-explorer-verdict-label">Verdict</span>
        <span class="merge-explorer-verdict-value merge-explorer-verdict-icon ${iconClass}">
          ${icon} ${result.match ? 'Match' : 'Mismatch'}
        </span>
      </div>
    `;

    // Explanation
    const explClass = result.match
      ? 'merge-explorer-explanation merge-explorer-explanation-match'
      : 'merge-explorer-explanation';
    explanationEl.className = explClass;
    explanationEl.textContent = result.explanation;
  }

  opSelect.addEventListener('change', () => {
    currentOp = opSelect.value as OpName;
    render();
  });

  runBtn.addEventListener('click', render);

  reshuffleBtn.addEventListener('click', () => {
    data = generateData();
    render();
  });

  // Initial render
  render();
}
