/**
 * Component I: AvalancheDemo
 *
 * Shows a table of sequential or similar strings and their hashes side by side.
 * The leading-zero counts are highlighted, making it visually obvious that
 * there's no relationship between similar inputs and their leading zeros.
 *
 * Key insight: HLL's technique is independent of the input distribution.
 * Whether your data is "1", "2", "3" or random UUIDs, hashing makes them
 * all look uniformly random.
 *
 * The reader can type a "prefix" to see how appending different suffixes
 * produces uncorrelated hashes — e.g., type "user_" to see "user_1",
 * "user_2", ... all with wildly different leading-zero counts.
 *
 * Styled via CSS custom properties from the active theme.
 */

import { murmur3_32, countLeadingZeros32 } from '../hll-sim';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.avalanche-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.avalanche-demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-end;
}

.avalanche-demo-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 140px;
}

.avalanche-demo-input-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
}

.avalanche-demo-input {
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  outline: none;
  transition: border-color 0.15s ease;
}
.avalanche-demo-input:focus {
  border-color: var(--accent, #0d9488);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(13,148,136,0.1));
}

.avalanche-demo-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.avalanche-demo-chip {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.avalanche-demo-chip:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}

.avalanche-demo-table-wrap {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.avalanche-demo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.avalanche-demo-table th {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--accent, #0d9488);
  white-space: nowrap;
}

.avalanche-demo-table td {
  font-family: var(--font-mono, monospace);
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--border, #cbd5e1);
  vertical-align: middle;
}

.avalanche-demo-table tr:last-child td {
  border-bottom: none;
}

.avalanche-demo-table tr:nth-child(even) td {
  background: rgba(0,0,0,0.015);
}

.avalanche-demo-input-cell {
  color: var(--text, #0f172a);
  font-weight: 500;
}

.avalanche-demo-binary-cell {
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  line-height: 1.5;
}

.avalanche-demo-bit-zero {
  color: var(--accent, #0d9488);
  font-weight: 700;
}

.avalanche-demo-bit-one-first {
  color: var(--accent-secondary, #f97316);
  font-weight: 700;
}

.avalanche-demo-bit-rest {
  color: var(--text-muted, #94a3b8);
}

.avalanche-demo-bit-space {
  display: inline-block;
  width: 0.2em;
}

.avalanche-demo-lz-cell {
  text-align: center;
}

.avalanche-demo-lz-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.6rem;
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.avalanche-demo-lz-badge-low {
  background: var(--accent, #0d9488);
}
.avalanche-demo-lz-badge-mid {
  background: #f59e0b;
}
.avalanche-demo-lz-badge-high {
  background: var(--accent-secondary, #f97316);
}

.avalanche-demo-bar-cell {
  width: 100px;
  min-width: 60px;
}

.avalanche-demo-bar {
  height: 14px;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.avalanche-demo-bar-low {
  background: var(--accent, #0d9488);
}
.avalanche-demo-bar-mid {
  background: #f59e0b;
}
.avalanche-demo-bar-high {
  background: var(--accent-secondary, #f97316);
}

.avalanche-demo-callout {
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

// ─── Helpers ─────────────────────────────────────────────────────────

interface RowData {
  input: string;
  hash: number;
  binary: string;
  leadingZeros: number;
}

function computeRows(prefix: string, count: number): RowData[] {
  const rows: RowData[] = [];
  for (let i = 1; i <= count; i++) {
    const input = prefix + String(i);
    const hash = murmur3_32(input, 0);
    const binary = (hash >>> 0).toString(2).padStart(32, '0');
    const lz = countLeadingZeros32(hash, 32);
    rows.push({ input, hash, binary, leadingZeros: lz });
  }
  return rows;
}

function badgeClass(lz: number): string {
  if (lz <= 2) return 'low';
  if (lz <= 5) return 'mid';
  return 'high';
}

function formatBinaryHTML(binary: string, lz: number): string {
  const allZero = binary === '0'.repeat(32);
  const parts: string[] = [];
  // Only show first 16 bits for compactness
  const showBits = 16;
  for (let i = 0; i < showBits; i++) {
    if (i > 0 && i % 4 === 0) {
      parts.push('<span class="avalanche-demo-bit-space"></span>');
    }
    if (i < lz) {
      parts.push(`<span class="avalanche-demo-bit-zero">${binary[i]}</span>`);
    } else if (i === lz && !allZero) {
      parts.push(`<span class="avalanche-demo-bit-one-first">${binary[i]}</span>`);
    } else {
      parts.push(`<span class="avalanche-demo-bit-rest">${binary[i]}</span>`);
    }
  }
  parts.push('<span class="avalanche-demo-bit-rest">\u2026</span>');
  return parts.join('');
}

// ─── Rendering ───────────────────────────────────────────────────────

function renderTable(el: HTMLElement, prefix: string, count: number): void {
  const tableWrap = el.querySelector<HTMLElement>('.avalanche-demo-table-wrap')!;
  const rows = computeRows(prefix, count);

  // Find max leading zeros for bar scaling
  const maxLZ = Math.max(...rows.map((r) => r.leadingZeros), 1);

  const rowsHTML = rows
    .map((r) => {
      const tier = badgeClass(r.leadingZeros);
      const barWidth = Math.max(4, (r.leadingZeros / maxLZ) * 100);
      return `<tr>
        <td class="avalanche-demo-input-cell">${escapeHTML(r.input)}</td>
        <td class="avalanche-demo-binary-cell">${formatBinaryHTML(r.binary, r.leadingZeros)}</td>
        <td class="avalanche-demo-lz-cell">
          <span class="avalanche-demo-lz-badge avalanche-demo-lz-badge-${tier}">${r.leadingZeros}</span>
        </td>
        <td class="avalanche-demo-bar-cell">
          <div class="avalanche-demo-bar avalanche-demo-bar-${tier}" style="width:${barWidth}%"></div>
        </td>
      </tr>`;
    })
    .join('');

  tableWrap.innerHTML = `
    <table class="avalanche-demo-table">
      <thead>
        <tr>
          <th>Input</th>
          <th>Hash (first 16 bits)</th>
          <th>Leading 0s</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
    </table>
  `;
}

function escapeHTML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Mount ───────────────────────────────────────────────────────────

const SUGGESTED_PREFIXES = [
  { label: '(none)', value: '' },
  { label: 'user_', value: 'user_' },
  { label: 'item-', value: 'item-' },
  { label: 'page/', value: 'page/' },
];

const ROW_COUNT = 20;

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('avalanche-demo: mount element not found');
    return;
  }

  injectStyles();

  let prefix = '';

  const chipsHTML = SUGGESTED_PREFIXES.map(
    (s) =>
      `<button class="avalanche-demo-chip" data-prefix="${s.value}">${s.label}</button>`
  ).join('');

  el.innerHTML = `
    <div class="avalanche-demo">
      <div class="avalanche-demo-controls">
        <div class="avalanche-demo-input-group">
          <label class="avalanche-demo-input-label">Prefix (optional)</label>
          <input type="text" class="avalanche-demo-input"
                 placeholder="e.g. user_" value="">
        </div>
      </div>
      <div class="avalanche-demo-chips">
        Presets: ${chipsHTML}
      </div>
      <div class="avalanche-demo-table-wrap"></div>
      <div class="avalanche-demo-callout">
        Even though the inputs are sequential (<strong>1, 2, 3, …</strong>), the leading-zero
        counts bounce around randomly. The hash of <strong>"1"</strong> tells you
        <em>nothing</em> about the hash of <strong>"2"</strong>.
        This is why HyperLogLog works regardless of what your data looks like —
        hashing erases all structure.
      </div>
    </div>
  `;

  const input = el.querySelector<HTMLInputElement>('.avalanche-demo-input')!;
  const chips = el.querySelectorAll<HTMLButtonElement>('.avalanche-demo-chip');

  function update() {
    renderTable(el!, prefix, ROW_COUNT);
  }

  input.addEventListener('input', () => {
    prefix = input.value;
    update();
  });

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      prefix = chip.dataset.prefix || '';
      input.value = prefix;
      update();
    });
  }

  // Initial render
  update();
}
