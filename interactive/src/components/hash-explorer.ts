/**
 * Component H: HashExplorer
 *
 * An interactive widget that lets the reader type any text and see:
 *   1. The MurmurHash3 hash value in hexadecimal
 *   2. The hash in binary (with leading zeros highlighted)
 *   3. The count of leading zeros
 *   4. The estimate contribution: 2^(leading zeros)
 *
 * Key moment: tiny changes to the input produce completely different hashes.
 * Includes suggested inputs as clickable chips for quick exploration.
 *
 * Styled via CSS custom properties from the active theme.
 */

import { murmur3_32, countLeadingZeros32 } from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.hash-explorer {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.hash-explorer-input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.hash-explorer-input-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  white-space: nowrap;
}

.hash-explorer-input {
  flex: 1;
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  outline: none;
  transition: border-color 0.15s ease;
}
.hash-explorer-input:focus {
  border-color: var(--accent, #0d9488);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(13,148,136,0.1));
}

.hash-explorer-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.hash-explorer-chip {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.hash-explorer-chip:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}

.hash-explorer-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hash-explorer-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.hash-explorer-row-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 7rem;
  flex-shrink: 0;
}

.hash-explorer-row-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text, #0f172a);
  word-break: break-all;
  line-height: 1.6;
}

.hash-explorer-bit-zero {
  color: var(--accent, #0d9488);
  font-weight: 700;
}

.hash-explorer-bit-one-first {
  color: var(--accent-secondary, #f97316);
  font-weight: 700;
}

.hash-explorer-bit-rest {
  color: var(--text-muted, #94a3b8);
}

.hash-explorer-bit-space {
  display: inline-block;
  width: 0.3em;
}

.hash-explorer-zeros-count {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.hash-explorer-zeros-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  height: 1.8rem;
  border-radius: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 1rem;
  font-weight: 700;
  background: var(--accent, #0d9488);
  color: #fff;
}

.hash-explorer-estimate {
  font-weight: 700;
  color: var(--accent, #0d9488);
}

.hash-explorer-empty {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
  padding: 1rem 0;
}

.hash-explorer-divider {
  border: none;
  border-top: 1px solid var(--border, #cbd5e1);
  margin: 0.25rem 0;
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

// ─── Helpers ─────────────────────────────────────────────────────────

function toHex(n: number): string {
  return (n >>> 0).toString(16).padStart(8, '0');
}

function toBinaryGrouped(n: number): string {
  return (n >>> 0).toString(2).padStart(32, '0');
}

function formatBinaryHTML(binary: string): string {
  const lz = countLeadingZeros32(parseInt(binary, 2) >>> 0, 32);
  // If hash is 0, all bits are leading zeros
  const allZero = binary === '0'.repeat(32);

  const parts: string[] = [];
  for (let i = 0; i < 32; i++) {
    // Insert space every 4 bits for readability
    if (i > 0 && i % 4 === 0) {
      parts.push('<span class="hash-explorer-bit-space"></span>');
    }

    if (i < lz) {
      // Leading zero
      parts.push(`<span class="hash-explorer-bit-zero">${binary[i]}</span>`);
    } else if (i === lz && !allZero) {
      // First 1-bit
      parts.push(`<span class="hash-explorer-bit-one-first">${binary[i]}</span>`);
    } else {
      // Rest
      parts.push(`<span class="hash-explorer-bit-rest">${binary[i]}</span>`);
    }
  }
  return parts.join('');
}

function formatHexSpaced(hex: string): string {
  // Group into pairs: "a3f21b7c" → "a3 f2 1b 7c"
  return hex.match(/.{2}/g)?.join(' ') || hex;
}

// ─── Rendering ───────────────────────────────────────────────────────

function renderResults(el: HTMLElement, input: string): void {
  const resultsEl = el.querySelector<HTMLElement>('.hash-explorer-results')!;

  if (input.length === 0) {
    resultsEl.innerHTML =
      '<div class="hash-explorer-empty">Type something above to see its hash...</div>';
    return;
  }

  const hash = murmur3_32(input, 0);
  const hex = toHex(hash);
  const binary = toBinaryGrouped(hash);
  const lz = countLeadingZeros32(hash, 32);
  const estimate = Math.pow(2, lz);

  resultsEl.innerHTML = `
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Hash (hex)</span>
      <span class="hash-explorer-row-value">${formatHexSpaced(hex)}</span>
    </div>
    <hr class="hash-explorer-divider">
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Hash (binary)</span>
      <span class="hash-explorer-row-value">${formatBinaryHTML(binary)}</span>
    </div>
    <hr class="hash-explorer-divider">
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Leading zeros</span>
      <span class="hash-explorer-row-value">
        <span class="hash-explorer-zeros-count">
          <span class="hash-explorer-zeros-badge">${lz}</span>
        </span>
      </span>
    </div>
    <div class="hash-explorer-row">
      <span class="hash-explorer-row-label">Estimate</span>
      <span class="hash-explorer-row-value">
        <span class="hash-explorer-estimate">2<sup>${lz}</sup> = ${estimate.toLocaleString()}</span>
      </span>
    </div>
  `;
}

// ─── Mount ───────────────────────────────────────────────────────────

const SUGGESTED_INPUTS = [
  '1', '2', '3',
  'hello', 'hello!', 'hellp',
  'user_42', 'alice@example.com',
];

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('hash-explorer: mount element not found');
    return;
  }

  injectStyles();

  const chipsHTML = SUGGESTED_INPUTS.map(
    (s) => {
      const escaped = s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
      return `<button class="hash-explorer-chip" data-input="${escaped}">${escaped}</button>`;
    }
  ).join('');

  el.innerHTML = `
    <div class="hash-explorer">
      <div class="hash-explorer-input-row">
        <span class="hash-explorer-input-label">Type anything:</span>
        <input type="text" class="hash-explorer-input"
               placeholder="hello" value="hello">
      </div>
      <div class="hash-explorer-chips">
        Try: ${chipsHTML}
      </div>
      <div class="hash-explorer-results"></div>
    </div>
  `;

  const input = el.querySelector<HTMLInputElement>('.hash-explorer-input')!;
  const chips = el.querySelectorAll<HTMLButtonElement>('.hash-explorer-chip');

  input.addEventListener('input', () => {
    renderResults(el, input.value);
  });

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const value = chip.dataset.input || '';
      input.value = value;
      renderResults(el, value);
      input.focus();
    });
  }

  // Initial render
  renderResults(el, input.value);
}
