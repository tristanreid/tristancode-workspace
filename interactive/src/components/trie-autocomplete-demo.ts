/**
 * Component: TrieAutocompleteDemo
 *
 * A live head-to-head comparison of trie search vs. Array.filter() on the
 * same 236,000-word dictionary. Both panels share the same fetched data
 * and identical UI, so the only variable is the search algorithm.
 *
 * Features:
 * - Fetches entire system dictionary (~236K words, ~900 KB gzipped)
 * - Side-by-side: Trie O(L) vs Array.filter O(N)
 * - Shows search timing for each in microseconds / milliseconds
 * - Keyboard navigation, bolded prefixes, score badges
 * - Theme-aware (graph skin light/dark)
 */

// ─── Tiny autocomplete trie ─────────────────────────────────────────

interface TrieNode {
  children: Map<string, TrieNode>;
  entries: Array<{ text: string; score: number }>;
}

function createNode(): TrieNode {
  return { children: new Map(), entries: [] };
}

class AutocompleteTrie {
  private root = createNode();
  private _size = 0;
  private _nodeCount = 1;

  insert(text: string, score = 0): void {
    let node = this.root;
    const lower = text.toLowerCase();
    for (const ch of lower) {
      if (!node.children.has(ch)) {
        node.children.set(ch, createNode());
        this._nodeCount++;
      }
      node = node.children.get(ch)!;
    }
    node.entries.push({ text, score });
    this._size++;
  }

  search(prefix: string, limit = 10): Array<{ text: string; score: number }> {
    let node = this.root;
    const lower = prefix.toLowerCase();
    for (const ch of lower) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    const results: Array<{ text: string; score: number }> = [];
    const collect = (n: TrieNode): void => {
      for (const e of n.entries) results.push(e);
      for (const child of n.children.values()) collect(child);
    };
    collect(node);
    results.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
    return results.slice(0, limit);
  }

  get size(): number {
    return this._size;
  }
  get nodeCount(): number {
    return this._nodeCount;
  }
}

// ─── Array.filter search (the naive approach) ───────────────────────

function arrayFilterSearch(
  data: Array<{ text: string; score: number }>,
  prefix: string,
  limit = 10
): Array<{ text: string; score: number }> {
  const lower = prefix.toLowerCase();
  const matches = data.filter((e) => e.text.toLowerCase().startsWith(lower));
  matches.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
  return matches.slice(0, limit);
}

// ─── Styles ─────────────────────────────────────────────────────────

const STYLES = /* css */ `
.trie-ac-demo {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.trie-ac-demo-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: var(--text-muted, #64748b);
  font-size: 0.9rem;
}

.trie-ac-demo-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border, #d0d8e4);
  border-top-color: var(--accent, #d94040);
  border-radius: 50%;
  animation: trie-ac-spin 0.7s linear infinite;
}

@keyframes trie-ac-spin {
  to { transform: rotate(360deg); }
}

.trie-ac-demo-build-stats {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 1rem;
  font-family: var(--font-mono, monospace);
  line-height: 1.6;
}

.trie-ac-demo-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) {
  .trie-ac-demo-panels {
    grid-template-columns: 1fr;
  }
}

.trie-ac-panel {
  position: relative;
  display: flex;
  flex-direction: column;
}

.trie-ac-panel-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  font-family: var(--font-mono, monospace);
}
.trie-ac-panel-title.trie {
  color: var(--accent, #d94040);
}
.trie-ac-panel-title.filter {
  color: var(--text-muted, #64748b);
}

.trie-ac-panel-input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.trie-ac-panel-input:focus {
  border-color: var(--accent, #d94040);
}
.trie-ac-panel-input::placeholder {
  color: var(--text-muted, #8899aa);
}

.trie-ac-panel-dropdown {
  position: absolute;
  top: calc(0.8rem + 0.5rem + 1rem + 0.6rem * 2 + 3px + 4px);
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg, #fff);
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  padding: 4px 0;
  margin: 4px 0 0 0;
}

.trie-ac-panel-item {
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.1s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text, #0f172a);
}
.trie-ac-panel-item:hover,
.trie-ac-panel-item[data-highlighted="true"] {
  background: var(--bg-hover, #f0f4f8);
}

.trie-ac-panel-item .match-bold {
  font-weight: 700;
}
.trie-ac-panel-item .score {
  color: var(--text-muted, #8899aa);
  font-size: 0.75rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.trie-ac-panel-no-match {
  padding: 0.4rem 0.75rem;
  color: var(--text-muted, #8899aa);
  font-style: italic;
  font-size: 0.85rem;
}

.trie-ac-panel-stats {
  font-size: 0.78rem;
  color: var(--text-muted, #64748b);
  margin-top: 0.5rem;
  font-family: var(--font-mono, monospace);
  min-height: 1.4em;
}
.trie-ac-panel-stats .time-value {
  font-weight: 700;
}
.trie-ac-panel-stats .time-value.fast {
  color: #16a34a;
}
.trie-ac-panel-stats .time-value.slow {
  color: var(--accent, #d94040);
}

.trie-ac-demo-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.75rem;
}
`;

// ─── Component ──────────────────────────────────────────────────────

const DATA_URL = '/data/trie-demo/words.json';

type SearchFn = (query: string) => { results: Array<{ text: string; score: number }>; micros: number };

/** Create one autocomplete panel (input + dropdown + stats) */
function createPanel(
  panelId: string,
  titleText: string,
  titleClass: string,
  placeholder: string,
  searchFn: SearchFn
): { panel: HTMLElement; input: HTMLInputElement } {
  const panel = document.createElement('div');
  panel.className = 'trie-ac-panel';

  const title = document.createElement('div');
  title.className = `trie-ac-panel-title ${titleClass}`;
  title.textContent = titleText;
  panel.appendChild(title);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'trie-ac-panel-input';
  input.placeholder = placeholder;
  input.setAttribute('autocomplete', 'off');
  panel.appendChild(input);

  const dropdown = document.createElement('ul');
  dropdown.className = 'trie-ac-panel-dropdown';
  dropdown.style.display = 'none';
  panel.appendChild(dropdown);

  const stats = document.createElement('div');
  stats.className = 'trie-ac-panel-stats';
  panel.appendChild(stats);

  // State
  let isOpen = false;
  let highlightIndex = -1;
  let suggestions: Array<{ text: string; score: number }> = [];
  let lastMicros = 0;

  function renderDropdown(): void {
    dropdown.innerHTML = '';
    if (suggestions.length === 0 && input.value.length >= 1) {
      const li = document.createElement('li');
      li.className = 'trie-ac-panel-no-match';
      li.textContent = 'No matches';
      dropdown.appendChild(li);
      dropdown.style.display = 'block';
      return;
    }
    if (suggestions.length === 0) {
      dropdown.style.display = 'none';
      return;
    }
    const query = input.value;
    for (let i = 0; i < suggestions.length; i++) {
      const entry = suggestions[i];
      const item = document.createElement('li');
      item.className = 'trie-ac-panel-item';
      item.dataset.highlighted = String(i === highlightIndex);

      const textSpan = document.createElement('span');
      const lower = entry.text.toLowerCase();
      const qLower = query.toLowerCase();
      const idx = lower.indexOf(qLower);
      if (idx >= 0 && query.length > 0) {
        textSpan.appendChild(document.createTextNode(entry.text.slice(0, idx)));
        const b = document.createElement('span');
        b.className = 'match-bold';
        b.textContent = entry.text.slice(idx, idx + query.length);
        textSpan.appendChild(b);
        textSpan.appendChild(document.createTextNode(entry.text.slice(idx + query.length)));
      } else {
        textSpan.textContent = entry.text;
      }
      item.appendChild(textSpan);

      if (entry.score > 0) {
        const badge = document.createElement('span');
        badge.className = 'score';
        badge.textContent = entry.score.toFixed(2);
        item.appendChild(badge);
      }

      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = entry.text;
        isOpen = false;
        dropdown.style.display = 'none';
        doSearch();
      });
      item.addEventListener('mouseenter', () => {
        highlightIndex = i;
        updateHL();
      });

      dropdown.appendChild(item);
    }
    dropdown.style.display = 'block';
  }

  function updateHL(): void {
    const items = dropdown.querySelectorAll('.trie-ac-panel-item');
    items.forEach((el, i) => {
      (el as HTMLElement).dataset.highlighted = String(i === highlightIndex);
    });
    if (highlightIndex >= 0 && items[highlightIndex]) {
      (items[highlightIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }

  function formatTime(micros: number): string {
    if (micros < 1000) return micros + ' µs';
    return (micros / 1000).toFixed(1) + ' ms';
  }

  function updateStats(): void {
    if (input.value.length === 0) {
      stats.innerHTML = '';
      return;
    }
    const timeClass = lastMicros < 1000 ? 'fast' : 'slow';
    stats.innerHTML =
      `${suggestions.length} result${suggestions.length !== 1 ? 's' : ''} in ` +
      `<span class="time-value ${timeClass}">${formatTime(lastMicros)}</span>`;
  }

  function doSearch(): void {
    const query = input.value;
    if (query.length < 1) {
      suggestions = [];
      lastMicros = 0;
      isOpen = false;
      dropdown.style.display = 'none';
      updateStats();
      return;
    }
    const { results, micros } = searchFn(query);
    suggestions = results;
    lastMicros = micros;
    highlightIndex = -1;
    updateStats();
  }

  // Events
  input.addEventListener('input', () => {
    doSearch();
    isOpen = true;
    renderDropdown();
  });

  input.addEventListener('focus', () => {
    if (input.value.length >= 1 && suggestions.length > 0) {
      isOpen = true;
      renderDropdown();
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      isOpen = false;
      dropdown.style.display = 'none';
    }, 150);
  });

  input.addEventListener('keydown', (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        isOpen = true;
        renderDropdown();
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightIndex = highlightIndex < suggestions.length - 1 ? highlightIndex + 1 : 0;
        updateHL();
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightIndex = highlightIndex > 0 ? highlightIndex - 1 : suggestions.length - 1;
        updateHL();
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
          input.value = suggestions[highlightIndex].text;
          isOpen = false;
          dropdown.style.display = 'none';
          doSearch();
        }
        break;
      case 'Escape':
        isOpen = false;
        highlightIndex = -1;
        dropdown.style.display = 'none';
        break;
    }
  });

  return { panel, input };
}

// ─── Mount ──────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) return;

  // Inject styles
  if (!document.getElementById('trie-ac-demo-styles')) {
    const style = document.createElement('style');
    style.id = 'trie-ac-demo-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  el.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'trie-ac-demo';

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'trie-ac-demo-loading';
  loadingDiv.innerHTML = '<div class="trie-ac-demo-spinner"></div><span>Fetching 235,000-word dictionary...</span>';
  wrapper.appendChild(loadingDiv);

  const buildStats = document.createElement('div');
  buildStats.className = 'trie-ac-demo-build-stats';
  buildStats.style.display = 'none';
  wrapper.appendChild(buildStats);

  const panels = document.createElement('div');
  panels.className = 'trie-ac-demo-panels';
  panels.style.display = 'none';
  wrapper.appendChild(panels);

  const hint = document.createElement('div');
  hint.className = 'trie-ac-demo-hint';
  hint.style.display = 'none';
  hint.textContent = 'Type the same prefix in both boxes and compare the search times';
  wrapper.appendChild(hint);

  el.appendChild(wrapper);

  // ─── Fetch and build ───
  const fetchStart = performance.now();

  fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data: Array<{ text: string; score: number }>) => {
      const fetchMs = (performance.now() - fetchStart).toFixed(0);

      // Build the trie
      const buildStart = performance.now();
      const trie = new AutocompleteTrie();
      for (const entry of data) {
        trie.insert(entry.text, entry.score);
      }
      const buildMs = (performance.now() - buildStart).toFixed(0);

      // Update UI
      loadingDiv.style.display = 'none';
      buildStats.style.display = 'block';
      panels.style.display = 'grid';
      hint.style.display = 'block';

      buildStats.innerHTML =
        `${trie.size.toLocaleString()} words loaded · ` +
        `Fetched in ${fetchMs} ms · Trie built in ${buildMs} ms ` +
        `(${trie.nodeCount.toLocaleString()} nodes)`;

      // Search functions
      const trieSearch: SearchFn = (query) => {
        const t0 = performance.now();
        const results = trie.search(query, 10);
        const micros = Math.round((performance.now() - t0) * 1000);
        return { results, micros };
      };

      const filterSearch: SearchFn = (query) => {
        const t0 = performance.now();
        const results = arrayFilterSearch(data, query, 10);
        const micros = Math.round((performance.now() - t0) * 1000);
        return { results, micros };
      };

      // Create panels
      const { panel: triePanel } = createPanel(
        'trie',
        'Trie · O(L)',
        'trie',
        'Search with trie...',
        trieSearch
      );

      const { panel: filterPanel } = createPanel(
        'filter',
        'Array.filter · O(N)',
        'filter',
        'Search with filter...',
        filterSearch
      );

      panels.appendChild(triePanel);
      panels.appendChild(filterPanel);
    })
    .catch((err) => {
      loadingDiv.innerHTML = `<span style="color:var(--accent,#d94040)">Failed to load dictionary: ${err.message}</span>`;
    });
}
