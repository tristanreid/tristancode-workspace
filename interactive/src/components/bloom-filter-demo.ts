/**
 * Bloom Filter Demo — Interactive component for "Sketches: Trading Precision for Scalability"
 *
 * Two Bloom filters side by side. Add items to each, see the bit arrays
 * light up. Merge them (bitwise OR). Check membership — and discover
 * false positives.
 */

// ─── Hash Functions ─────────────────────────────────────────────────

/**
 * Simple deterministic hash using FNV-1a variant with a seed.
 * Returns a value in [0, size).
 */
function fnvHash(str: string, seed: number, size: number): number {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % size);
}

/** k hash functions for bloom filter. */
function bloomHashes(item: string, k: number, m: number): number[] {
  return Array.from({ length: k }, (_, i) => fnvHash(item, i * 0x9e3779b9, m));
}

// ─── Bloom Filter Engine ────────────────────────────────────────────

interface BloomFilter {
  bits: Uint8Array;
  m: number;
  k: number;
  items: string[];
}

function createFilter(m: number, k: number): BloomFilter {
  return { bits: new Uint8Array(m), m, k, items: [] };
}

function addItem(filter: BloomFilter, item: string): number[] {
  const positions = bloomHashes(item, filter.k, filter.m);
  for (const pos of positions) {
    filter.bits[pos] = 1;
  }
  filter.items.push(item);
  return positions;
}

function checkItem(filter: BloomFilter, item: string): { found: boolean; positions: number[] } {
  const positions = bloomHashes(item, filter.k, filter.m);
  const found = positions.every(pos => filter.bits[pos] === 1);
  return { found, positions };
}

function mergeFilters(a: BloomFilter, b: BloomFilter): BloomFilter {
  const merged = createFilter(a.m, a.k);
  for (let i = 0; i < a.m; i++) {
    merged.bits[i] = (a.bits[i] | b.bits[i]) as 0 | 1;
  }
  merged.items = [...new Set([...a.items, ...b.items])];
  return merged;
}

function fillRatio(filter: BloomFilter): number {
  let set = 0;
  for (let i = 0; i < filter.m; i++) {
    if (filter.bits[i]) set++;
  }
  return set / filter.m;
}

// ─── Styles ─────────────────────────────────────────────────────────

const STYLES = /* css */ `
.bloom-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.bloom-demo-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

@media (max-width: 580px) {
  .bloom-demo-filters {
    grid-template-columns: 1fr;
  }
}

.bloom-demo-filter {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
}

.bloom-demo-filter-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.bloom-demo-filter-title-a { color: var(--accent, #0d9488); }
.bloom-demo-filter-title-b { color: #8b5cf6; }
.bloom-demo-filter-title-merged { color: #e87b35; }

.bloom-demo-input-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.bloom-demo-input {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 5px;
  background: var(--bg-secondary, #f1f5f9);
  color: var(--text, #0f172a);
  flex: 1;
  min-width: 0;
}
.bloom-demo-input:focus {
  outline: 2px solid var(--accent, #0d9488);
  outline-offset: -1px;
}

.bloom-demo-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  border: 1px solid var(--accent, #0d9488);
  background: var(--accent, #0d9488);
  color: #fff;
}
.bloom-demo-btn:hover {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.bloom-demo-btn-purple {
  border-color: #8b5cf6;
  background: #8b5cf6;
}
.bloom-demo-btn-purple:hover {
  background: #7c3aed;
  border-color: #7c3aed;
}

.bloom-demo-btn-orange {
  border-color: #e87b35;
  background: #e87b35;
}
.bloom-demo-btn-orange:hover {
  background: #d4691f;
  border-color: #d4691f;
}

.bloom-demo-btn-secondary {
  background: transparent;
  color: var(--accent, #0d9488);
}
.bloom-demo-btn-secondary:hover {
  background: var(--accent, #0d9488);
  color: #fff;
}

.bloom-demo-bits {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin: 0.5rem 0;
}

.bloom-demo-bit {
  width: 14px;
  height: 14px;
  border-radius: 2px;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.bloom-demo-bit-off {
  background: var(--border, #cbd5e1);
}

.bloom-demo-bit-on-a {
  background: var(--accent, #0d9488);
}

.bloom-demo-bit-on-b {
  background: #8b5cf6;
}

.bloom-demo-bit-on-merged {
  background: #e87b35;
}

.bloom-demo-bit-highlight {
  transform: scale(1.4);
  box-shadow: 0 0 4px rgba(0,0,0,0.3);
}

.bloom-demo-items {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.25rem;
  line-height: 1.4;
  min-height: 1.4em;
}

.bloom-demo-stats {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  color: var(--text-secondary, #475569);
  margin-top: 0.25rem;
}

.bloom-demo-merge-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.bloom-demo-merged-panel {
  border: 2px solid #e87b35;
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
  margin-bottom: 1rem;
  display: none;
}

.bloom-demo-check-section {
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--bg, #fff);
}

.bloom-demo-check-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary, #475569);
  margin-bottom: 0.5rem;
}

.bloom-demo-check-result {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  margin-top: 0.5rem;
  display: none;
}

.bloom-demo-check-positive {
  background: rgba(13,148,136,0.08);
  color: var(--accent, #0d9488);
  border: 1px solid var(--accent, #0d9488);
}

.bloom-demo-check-negative {
  background: rgba(100,116,139,0.06);
  color: var(--text-secondary, #475569);
  border: 1px solid var(--border, #cbd5e1);
}

.bloom-demo-check-false-positive {
  background: rgba(239,68,68,0.08);
  color: #ef4444;
  border: 1px solid #ef4444;
}

.bloom-demo-explanation {
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
  line-height: 1.5;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  background: var(--blockquote-bg, rgba(249,115,22,0.04));
  border-left: 3px solid var(--blockquote-border, #f97316);
  border-radius: 0 6px 6px 0;
  display: none;
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

// ─── Bit Array Rendering ────────────────────────────────────────────

function renderBits(
  container: HTMLElement,
  filter: BloomFilter,
  colorClass: string,
  highlightPositions?: number[]
): void {
  container.innerHTML = '';
  const highlight = new Set(highlightPositions ?? []);
  for (let i = 0; i < filter.m; i++) {
    const bit = document.createElement('div');
    bit.className = 'bloom-demo-bit';
    if (filter.bits[i]) {
      bit.classList.add(colorClass);
    } else {
      bit.classList.add('bloom-demo-bit-off');
    }
    if (highlight.has(i)) {
      bit.classList.add('bloom-demo-bit-highlight');
    }
    container.appendChild(bit);
  }
}

// ─── Mount ──────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('bloom-filter-demo: mount element not found');
    return;
  }

  injectStyles();

  const M = 48;  // bit array size — small enough to visualize
  const K = 3;   // number of hash functions

  let filterA = createFilter(M, K);
  let filterB = createFilter(M, K);
  let merged: BloomFilter | null = null;

  // Pre-populate with some items for immediate visual interest
  const defaultA = ['cat', 'dog', 'fish'];
  const defaultB = ['bird', 'snake', 'dog'];

  el.innerHTML = `
    <div class="bloom-demo">
      <div class="bloom-demo-filters">
        <div class="bloom-demo-filter">
          <div class="bloom-demo-filter-title bloom-demo-filter-title-a">Filter A</div>
          <div class="bloom-demo-input-row">
            <input class="bloom-demo-input" data-input="a" placeholder="Type a word..." />
            <button class="bloom-demo-btn" data-add="a">Add</button>
          </div>
          <div class="bloom-demo-bits" data-bits="a"></div>
          <div class="bloom-demo-items" data-items="a"></div>
          <div class="bloom-demo-stats" data-stats="a"></div>
        </div>
        <div class="bloom-demo-filter">
          <div class="bloom-demo-filter-title bloom-demo-filter-title-b">Filter B</div>
          <div class="bloom-demo-input-row">
            <input class="bloom-demo-input" data-input="b" placeholder="Type a word..." />
            <button class="bloom-demo-btn bloom-demo-btn-purple" data-add="b">Add</button>
          </div>
          <div class="bloom-demo-bits" data-bits="b"></div>
          <div class="bloom-demo-items" data-items="b"></div>
          <div class="bloom-demo-stats" data-stats="b"></div>
        </div>
      </div>

      <div class="bloom-demo-merge-row">
        <button class="bloom-demo-btn bloom-demo-btn-orange" data-merge>Merge (Bitwise OR)</button>
        <button class="bloom-demo-btn bloom-demo-btn-secondary" data-reset>Reset All</button>
      </div>

      <div class="bloom-demo-merged-panel" data-merged-panel>
        <div class="bloom-demo-filter-title bloom-demo-filter-title-merged">Merged Filter (A | B)</div>
        <div class="bloom-demo-bits" data-bits="merged"></div>
        <div class="bloom-demo-items" data-items="merged"></div>
        <div class="bloom-demo-stats" data-stats="merged"></div>
      </div>

      <div class="bloom-demo-check-section">
        <div class="bloom-demo-check-title">Check Membership</div>
        <div class="bloom-demo-input-row">
          <input class="bloom-demo-input" data-input="check" placeholder="Check a word..." />
          <button class="bloom-demo-btn bloom-demo-btn-secondary" data-check>Check</button>
        </div>
        <div class="bloom-demo-check-result" data-check-result></div>
      </div>

      <div class="bloom-demo-explanation" data-explanation></div>
    </div>
  `;

  // Elements
  const inputA = el.querySelector<HTMLInputElement>('[data-input="a"]')!;
  const inputB = el.querySelector<HTMLInputElement>('[data-input="b"]')!;
  const inputCheck = el.querySelector<HTMLInputElement>('[data-input="check"]')!;
  const addBtnA = el.querySelector<HTMLButtonElement>('[data-add="a"]')!;
  const addBtnB = el.querySelector<HTMLButtonElement>('[data-add="b"]')!;
  const mergeBtn = el.querySelector<HTMLButtonElement>('[data-merge]')!;
  const resetBtn = el.querySelector<HTMLButtonElement>('[data-reset]')!;
  const checkBtn = el.querySelector<HTMLButtonElement>('[data-check]')!;
  const bitsA = el.querySelector<HTMLElement>('[data-bits="a"]')!;
  const bitsB = el.querySelector<HTMLElement>('[data-bits="b"]')!;
  const bitsMerged = el.querySelector<HTMLElement>('[data-bits="merged"]')!;
  const itemsA = el.querySelector<HTMLElement>('[data-items="a"]')!;
  const itemsB = el.querySelector<HTMLElement>('[data-items="b"]')!;
  const itemsMerged = el.querySelector<HTMLElement>('[data-items="merged"]')!;
  const statsA = el.querySelector<HTMLElement>('[data-stats="a"]')!;
  const statsB = el.querySelector<HTMLElement>('[data-stats="b"]')!;
  const statsMerged = el.querySelector<HTMLElement>('[data-stats="merged"]')!;
  const mergedPanel = el.querySelector<HTMLElement>('[data-merged-panel]')!;
  const checkResult = el.querySelector<HTMLElement>('[data-check-result]')!;
  const explanationEl = el.querySelector<HTMLElement>('[data-explanation]')!;

  function renderFilter(
    filter: BloomFilter,
    bitsEl: HTMLElement,
    itemsEl: HTMLElement,
    statsEl: HTMLElement,
    colorClass: string,
    highlight?: number[]
  ) {
    renderBits(bitsEl, filter, colorClass, highlight);
    itemsEl.textContent = filter.items.length > 0
      ? `Items: ${filter.items.join(', ')}`
      : 'No items yet';
    const ratio = fillRatio(filter);
    const bitsSet = filter.bits.reduce((a, b) => a + b, 0);
    statsEl.textContent = `${bitsSet}/${filter.m} bits set (${(ratio * 100).toFixed(0)}%)`;
  }

  function renderAll(highlightA?: number[], highlightB?: number[]) {
    renderFilter(filterA, bitsA, itemsA, statsA, 'bloom-demo-bit-on-a', highlightA);
    renderFilter(filterB, bitsB, itemsB, statsB, 'bloom-demo-bit-on-b', highlightB);
    if (merged) {
      mergedPanel.style.display = 'block';
      renderFilter(merged, bitsMerged, itemsMerged, statsMerged, 'bloom-demo-bit-on-merged');
    }
  }

  function doAdd(which: 'a' | 'b') {
    const input = which === 'a' ? inputA : inputB;
    const item = input.value.trim().toLowerCase();
    if (!item) return;
    const filter = which === 'a' ? filterA : filterB;
    const positions = addItem(filter, item);
    input.value = '';
    // Re-merge if merged view is visible
    if (merged) {
      merged = mergeFilters(filterA, filterB);
    }
    const highlightA = which === 'a' ? positions : undefined;
    const highlightB = which === 'b' ? positions : undefined;
    renderAll(highlightA, highlightB);
    // Clear highlights after a moment
    setTimeout(() => renderAll(), 800);
  }

  addBtnA.addEventListener('click', () => doAdd('a'));
  addBtnB.addEventListener('click', () => doAdd('b'));

  inputA.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd('a'); });
  inputB.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd('b'); });

  mergeBtn.addEventListener('click', () => {
    merged = mergeFilters(filterA, filterB);
    renderAll();
    explanationEl.style.display = 'block';
    explanationEl.textContent =
      'The merged filter is the bitwise OR of both arrays. Any item in either filter will test positive in the merged filter — that\'s what makes Bloom filter merge so simple.';
  });

  resetBtn.addEventListener('click', () => {
    filterA = createFilter(M, K);
    filterB = createFilter(M, K);
    merged = null;
    mergedPanel.style.display = 'none';
    checkResult.style.display = 'none';
    explanationEl.style.display = 'none';
    renderAll();
  });

  checkBtn.addEventListener('click', doCheck);
  inputCheck.addEventListener('keydown', (e) => { if (e.key === 'Enter') doCheck(); });

  function doCheck() {
    const item = inputCheck.value.trim().toLowerCase();
    if (!item) return;

    // Check against the merged filter if it exists, otherwise filter A
    const target = merged ?? filterA;
    const { found, positions } = checkItem(target, item);
    const actuallyIn = target.items.includes(item);

    checkResult.style.display = 'block';

    if (found && actuallyIn) {
      // True positive
      checkResult.className = 'bloom-demo-check-result bloom-demo-check-positive';
      checkResult.innerHTML = `<strong>"${item}"</strong> — Probably in set \u2714 (true positive)`;
    } else if (found && !actuallyIn) {
      // False positive!
      checkResult.className = 'bloom-demo-check-result bloom-demo-check-false-positive';
      checkResult.innerHTML =
        `<strong>"${item}"</strong> — Probably in set... but it's NOT! \u2718 False positive! ` +
        `Positions [${positions.join(', ')}] all happen to be set by other items.`;
      explanationEl.style.display = 'block';
      explanationEl.textContent =
        `False positive: "${item}" hashes to positions [${positions.join(', ')}], ` +
        `which were all set by other items. The filter says "probably yes" but the answer is actually "no." ` +
        `This is the fundamental trade-off: Bloom filters never miss a real member, but sometimes report false membership.`;
    } else {
      // True negative
      checkResult.className = 'bloom-demo-check-result bloom-demo-check-negative';
      const zeroPos = positions.filter(p => !target.bits[p]);
      checkResult.innerHTML =
        `<strong>"${item}"</strong> — Definitely NOT in set \u2714 ` +
        `(position${zeroPos.length > 1 ? 's' : ''} [${zeroPos.join(', ')}] ${zeroPos.length > 1 ? 'are' : 'is'} 0)`;
    }
  }

  // Pre-populate
  for (const item of defaultA) addItem(filterA, item);
  for (const item of defaultB) addItem(filterB, item);
  renderAll();
}
