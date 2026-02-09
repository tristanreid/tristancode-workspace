/**
 * Component D: CrowdPartition
 *
 * Shows a crowd of N items partitioned into m = 2^p registers (sub-crowds).
 * Each register displays its items as colored dots, its max streak (ρ),
 * and its local estimate. A combined HLL estimate is shown below.
 *
 * The reader adjusts p and sees the *same items* reorganize into different
 * numbers of sub-crowds. The total dot count never changes — this is the
 * key visual insight: we're slicing the same crowd, not adding new people.
 */

import {
  murmur3_32,
  countLeadingZeros32,
  hllEstimate,
  hllRegisters,
} from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.crowd-partition {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.crowd-partition-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: center;
}

.crowd-partition-p-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.crowd-partition-p-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.crowd-partition-p-btn {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: 5px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.crowd-partition-p-btn:hover {
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}
.crowd-partition-p-btn-active {
  background: var(--accent, #0d9488);
  border-color: var(--accent, #0d9488);
  color: #fff;
}

.crowd-partition-info {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-family: var(--font-mono, monospace);
  margin-left: auto;
}

.crowd-partition-registers {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.crowd-partition-register {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  background: var(--bg, #fff);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.crowd-partition-reg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.crowd-partition-reg-name {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #94a3b8);
}

.crowd-partition-reg-count {
  font-size: 0.7rem;
  color: var(--text-muted, #94a3b8);
  font-family: var(--font-mono, monospace);
}

.crowd-partition-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  min-height: 12px;
}

.crowd-partition-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.crowd-partition-dot-star {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transform: rotate(45deg);
  box-shadow: 0 0 4px rgba(249,115,22,0.5);
}

.crowd-partition-reg-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.78rem;
  font-family: var(--font-mono, monospace);
}

.crowd-partition-reg-stat-label {
  color: var(--text-muted, #94a3b8);
}

.crowd-partition-reg-stat-value {
  font-weight: 700;
  color: var(--text, #0f172a);
}

.crowd-partition-summary {
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem 1.5rem;
}

.crowd-partition-summary-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.crowd-partition-summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.crowd-partition-summary-value {
  font-family: var(--font-mono, monospace);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.crowd-partition-summary-value-accent {
  color: var(--accent, #0d9488);
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

// ─── Register colors ────────────────────────────────────────────────
// ColorBrewer Set2-inspired palette, colorblind-safe

const REG_COLORS = [
  '#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3',
  '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3',
  '#1b9e77', '#d95f02', '#7570b3', '#e7298a',
  '#66a61e', '#e6ab02', '#a6761d', '#666666',
];

function regColor(idx: number): string {
  return REG_COLORS[idx % REG_COLORS.length];
}

// ─── Data computation ───────────────────────────────────────────────

interface RegisterData {
  index: number;
  items: number[];
  streakValues: number[];  // L values (leading zeros / tails count) per item
  maxStreak: number;       // max L for this register
  recordHolderIdx: number; // index within items array
}

function computePartition(n: number, p: number, seed: number = 0): {
  registers: RegisterData[];
  hllEst: number;
  singleMaxEst: number;
} {
  const m = 1 << p;
  const mask = m - 1;
  const valueBits = 32 - p;

  // Initialize register data
  const regs: RegisterData[] = Array.from({ length: m }, (_, i) => ({
    index: i,
    items: [],
    streakValues: [],
    maxStreak: 0,
    recordHolderIdx: -1,
  }));

  // Track overall max L (leading zeros of full hash) for the single-max
  // estimator. This is independent of register partitioning.
  let overallMaxL = 0;

  for (let item = 0; item < n; item++) {
    const h = murmur3_32(String(item), seed);

    // Single-max: count leading zeros of the FULL 32-bit hash
    const fullL = countLeadingZeros32(h, 32);
    if (fullL > overallMaxL) {
      overallMaxL = fullL;
    }

    // HLL: lowest p bits → register index, upper bits → streak
    const idx = h & mask;
    const w = h >>> p;
    const L = countLeadingZeros32(w, valueBits); // streak (tails before heads)

    const reg = regs[idx];
    const itemIdx = reg.items.length;
    reg.items.push(item);
    reg.streakValues.push(L);

    if (L > reg.maxStreak) {
      reg.maxStreak = L;
      reg.recordHolderIdx = itemIdx;
    }
  }

  // HLL estimate: convert L to ρ = L + 1 for hllEstimate (which expects ρ)
  const regRhoValues = regs.map((r) => r.maxStreak + 1);
  const hllEst = hllEstimate(regRhoValues, p);

  // Single-max estimate: 2^max(L)
  const singleMaxEst = Math.pow(2, overallMaxL);

  return { registers: regs, hllEst, singleMaxEst };
}

// ─── Rendering ───────────────────────────────────────────────────────

function renderPartition(el: HTMLElement, n: number, p: number): void {
  const data = computePartition(n, p);
  const m = 1 << p;

  const registersEl = el.querySelector<HTMLElement>('.crowd-partition-registers')!;
  const summaryEl = el.querySelector<HTMLElement>('.crowd-partition-summary')!;
  const infoEl = el.querySelector<HTMLElement>('.crowd-partition-info')!;

  infoEl.textContent = `m = ${m} registers`;

  // Grid columns: adapt to register count
  const cols = m <= 4 ? m : m <= 8 ? 4 : m <= 16 ? 4 : 4;
  registersEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // Render each register
  registersEl.innerHTML = data.registers
    .map((reg) => {
      const color = regColor(reg.index);
      const dotsHTML = reg.items
        .map((_, i) => {
          const isStar = i === reg.recordHolderIdx;
          const cls = isStar
            ? 'crowd-partition-dot crowd-partition-dot-star'
            : 'crowd-partition-dot';
          const bg = isStar ? 'var(--accent-secondary, #f97316)' : color;
          return `<span class="${cls}" style="background:${bg}" title="streak=${reg.streakValues[i]}"></span>`;
        })
        .join('');

      const localEst = Math.pow(2, reg.maxStreak);
      return `<div class="crowd-partition-register">
        <div class="crowd-partition-reg-header">
          <span class="crowd-partition-reg-name" style="color:${color}">Reg ${reg.index}</span>
          <span class="crowd-partition-reg-count">${reg.items.length} items</span>
        </div>
        <div class="crowd-partition-dots">${dotsHTML}</div>
        <div class="crowd-partition-reg-stats">
          <span>
            <span class="crowd-partition-reg-stat-label">max streak: </span>
            <span class="crowd-partition-reg-stat-value">${reg.maxStreak}</span>
          </span>
          <span>
            <span class="crowd-partition-reg-stat-label">est: </span>
            <span class="crowd-partition-reg-stat-value">${localEst.toLocaleString()}</span>
          </span>
        </div>
      </div>`;
    })
    .join('');

  // Summary
  const error = ((Math.abs(data.hllEst - n) / n) * 100).toFixed(1);
  summaryEl.innerHTML = `
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">True crowd size</span>
      <span class="crowd-partition-summary-value">${n.toLocaleString()}</span>
    </div>
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">Single-max estimate</span>
      <span class="crowd-partition-summary-value">${data.singleMaxEst.toLocaleString()}</span>
    </div>
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">HLL estimate (harmonic)</span>
      <span class="crowd-partition-summary-value crowd-partition-summary-value-accent">${Math.round(data.hllEst).toLocaleString()}</span>
    </div>
    <div class="crowd-partition-summary-stat">
      <span class="crowd-partition-summary-label">Error</span>
      <span class="crowd-partition-summary-value crowd-partition-summary-value-accent">${error}%</span>
    </div>
  `;
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('crowd-partition: mount element not found');
    return;
  }

  injectStyles();

  const N = 1000;
  let currentP = 3; // 8 registers

  const pOptions = [2, 3, 4, 5]; // 4, 8, 16, 32 registers

  const pBtnsHTML = pOptions
    .map(
      (p) =>
        `<button class="crowd-partition-p-btn${p === currentP ? ' crowd-partition-p-btn-active' : ''}"
                 data-p="${p}">p=${p} (m=${1 << p})</button>`
    )
    .join('');

  el.innerHTML = `
    <div class="crowd-partition">
      <div class="crowd-partition-controls">
        <div class="crowd-partition-p-group">
          <span class="crowd-partition-p-label">Register bits:</span>
          ${pBtnsHTML}
        </div>
        <span class="crowd-partition-info"></span>
      </div>
      <div class="crowd-partition-registers"></div>
      <div class="crowd-partition-summary"></div>
    </div>
  `;

  const pBtns = el.querySelectorAll<HTMLButtonElement>('.crowd-partition-p-btn');

  function updateActiveBtn() {
    for (const btn of pBtns) {
      const p = parseInt(btn.dataset.p!, 10);
      btn.classList.toggle('crowd-partition-p-btn-active', p === currentP);
    }
  }

  for (const btn of pBtns) {
    btn.addEventListener('click', () => {
      currentP = parseInt(btn.dataset.p!, 10);
      updateActiveBtn();
      renderPartition(el!, N, currentP);
    });
  }

  renderPartition(el, N, currentP);
}
