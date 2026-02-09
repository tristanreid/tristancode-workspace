/**
 * Component B: CoinBinaryEquivalence
 *
 * An interactive widget that lets the reader flip one coin at a time
 * and see the binary string build up alongside it. Makes the
 * coin-flip ↔ binary connection crystal clear.
 *
 * Styled via CSS custom properties from the active theme.
 */

import { createRng } from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────
// Injected once into <head>. Uses CSS custom properties so it adapts
// to any theme (stochastic, graph, etc.) and light/dark mode.

const STYLES = /* css */ `
.coin-binary {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
  max-width: 480px;
}

.coin-binary-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.coin-binary-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  cursor: pointer;
  transition: all 0.15s ease;
}

.coin-binary-btn-primary {
  background: var(--accent, #0d9488);
  color: #fff;
  border-color: var(--accent, #0d9488);
}
.coin-binary-btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}
.coin-binary-btn-primary:disabled {
  opacity: 0.5;
  cursor: default;
}

.coin-binary-btn-secondary {
  background: transparent;
  color: var(--text-secondary, #475569);
}
.coin-binary-btn-secondary:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.coin-binary-flips {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  min-height: 2rem;
}

.coin-binary-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  animation: coinRowAppear 0.3s ease-out;
}

@keyframes coinRowAppear {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.coin-binary-flip-num {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  width: 1.5rem;
  text-align: right;
}

.coin-binary-coin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
  transition: transform 0.3s ease;
}

.coin-binary-coin-tails {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--accent, #0d9488);
  border: 2px solid var(--accent, #0d9488);
}

.coin-binary-coin-heads {
  background: var(--accent-secondary, #f97316);
  color: #fff;
  border: 2px solid var(--accent-secondary, #f97316);
}

@keyframes coinSpin {
  0%   { transform: rotateY(0deg) scale(1); }
  50%  { transform: rotateY(90deg) scale(0.9); }
  100% { transform: rotateY(0deg) scale(1); }
}
.coin-binary-coin-spinning {
  animation: coinSpin 0.3s ease-in-out;
}

.coin-binary-arrow {
  color: var(--text-muted, #94a3b8);
  font-size: 0.85rem;
}

.coin-binary-bit {
  font-family: var(--font-mono, monospace);
  font-size: 1.1rem;
  font-weight: 600;
  width: 1.5rem;
  text-align: center;
}

.coin-binary-bit-zero {
  color: var(--accent, #0d9488);
}

.coin-binary-bit-one {
  color: var(--accent-secondary, #f97316);
}

.coin-binary-label {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-left: auto;
}

.coin-binary-summary {
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coin-binary-summary-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.coin-binary-summary-label {
  color: var(--text-secondary, #475569);
  min-width: 8rem;
}

.coin-binary-summary-value {
  font-family: var(--font-mono, monospace);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.coin-binary-summary-value-bit {
  letter-spacing: 0.15em;
}

.coin-binary-empty {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.75rem 0;
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

// ─── Component Logic ─────────────────────────────────────────────────

interface FlipResult {
  isTails: boolean;
}

interface State {
  flips: FlipResult[];
  done: boolean;
  rng: () => number;
}

function createState(): State {
  return {
    flips: [],
    done: false,
    rng: createRng(Math.floor(Math.random() * 1_000_000)),
  };
}

function doFlip(state: State): void {
  if (state.done) return;
  const value = state.rng();
  const isTails = value < 0.5;
  state.flips.push({ isTails });
  if (!isTails) {
    state.done = true; // Got heads — game over
  }
}

function leadingZeros(state: State): number {
  let count = 0;
  for (const flip of state.flips) {
    if (flip.isTails) count++;
    else break;
  }
  return count;
}

function binaryString(state: State): string {
  return state.flips.map((f) => (f.isTails ? '0' : '1')).join('');
}

// ─── Rendering ───────────────────────────────────────────────────────

function render(el: HTMLElement, state: State): void {
  const flipsEl = el.querySelector<HTMLElement>('.coin-binary-flips')!;
  const summaryEl = el.querySelector<HTMLElement>('.coin-binary-summary')!;
  const flipBtn = el.querySelector<HTMLButtonElement>('.coin-binary-btn-primary')!;

  // Update button state
  flipBtn.disabled = state.done;
  flipBtn.textContent = state.done ? 'Done!' : 'Flip!';

  // Render flip rows
  if (state.flips.length === 0) {
    flipsEl.innerHTML = '<div class="coin-binary-empty">Press Flip! to start flipping coins...</div>';
  } else {
    flipsEl.innerHTML = state.flips
      .map((flip, i) => {
        const coinClass = flip.isTails ? 'coin-binary-coin-tails' : 'coin-binary-coin-heads';
        const coinLabel = flip.isTails ? 'T' : 'H';
        const bit = flip.isTails ? '0' : '1';
        const bitClass = flip.isTails ? 'coin-binary-bit-zero' : 'coin-binary-bit-one';
        const isLast = i === state.flips.length - 1;
        const spinClass = isLast ? ' coin-binary-coin-spinning' : '';
        const label = flip.isTails ? 'tail' : 'heads!';

        return `<div class="coin-binary-row">
          <span class="coin-binary-flip-num">${i + 1}</span>
          <span class="coin-binary-coin ${coinClass}${spinClass}">${coinLabel}</span>
          <span class="coin-binary-arrow">\u2192</span>
          <span class="coin-binary-bit ${bitClass}">${bit}</span>
          <span class="coin-binary-label">${label}</span>
        </div>`;
      })
      .join('');
  }

  // Render summary
  if (state.flips.length === 0) {
    summaryEl.style.display = 'none';
  } else {
    summaryEl.style.display = '';
    const zeros = leadingZeros(state);
    const bits = binaryString(state);
    const estimateHTML = state.done
      ? `<div class="coin-binary-summary-row">
           <span class="coin-binary-summary-label">Estimate contribution</span>
           <span class="coin-binary-summary-value">2<sup>${zeros}</sup> = ${Math.pow(2, zeros).toLocaleString()}</span>
         </div>`
      : '';

    summaryEl.innerHTML = `
      <div class="coin-binary-summary-row">
        <span class="coin-binary-summary-label">Binary string</span>
        <span class="coin-binary-summary-value coin-binary-summary-value-bit">${bits.split('').map((b, i) => {
          const cls = b === '0' ? 'coin-binary-bit-zero' : 'coin-binary-bit-one';
          return `<span class="${cls}">${b}</span>`;
        }).join('')}${state.done ? '' : '<span style="opacity:0.3">\u2026</span>'}</span>
      </div>
      <div class="coin-binary-summary-row">
        <span class="coin-binary-summary-label">Leading zeros</span>
        <span class="coin-binary-summary-value">${zeros}${state.done ? '' : ' (so far)'}</span>
      </div>
      ${estimateHTML}
    `;
  }
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('coin-binary: mount element not found');
    return;
  }

  injectStyles();

  let state = createState();

  el.innerHTML = `
    <div class="coin-binary">
      <div class="coin-binary-controls">
        <button class="coin-binary-btn coin-binary-btn-primary">Flip!</button>
        <button class="coin-binary-btn coin-binary-btn-secondary">Reset</button>
      </div>
      <div class="coin-binary-flips"></div>
      <div class="coin-binary-summary" style="display:none"></div>
    </div>
  `;

  const flipBtn = el.querySelector<HTMLButtonElement>('.coin-binary-btn-primary')!;
  const resetBtn = el.querySelector<HTMLButtonElement>('.coin-binary-btn-secondary')!;

  flipBtn.addEventListener('click', () => {
    doFlip(state);
    render(el, state);
  });

  resetBtn.addEventListener('click', () => {
    state = createState();
    render(el, state);
  });

  render(el, state);
}
