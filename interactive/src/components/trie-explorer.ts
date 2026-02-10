/**
 * Component: TrieExplorer
 *
 * An interactive widget that lets the reader type words and watch a trie
 * build in real-time. A D3 tree diagram shows the structure, with shared
 * prefixes clearly visible as merged paths and terminal nodes highlighted.
 *
 * Features:
 * - Type a word and press Enter / click Add to insert it
 * - Click a preset example to load a curated word set with animation
 * - Stats bar shows word count, node count, and prefix compression ratio
 * - Reset button clears everything
 *
 * Styled via CSS custom properties from the active theme.
 */

import { TrieEngine } from '../trie-engine';
import { TrieViz } from '../trie-viz';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.trie-explorer {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.trie-explorer-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.trie-explorer-input {
  flex: 1;
  min-width: 120px;
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
.trie-explorer-input:focus {
  border-color: var(--accent, #0d9488);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(13,148,136,0.1));
}

.trie-explorer-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.trie-explorer-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.trie-explorer-btn-primary {
  background: var(--accent, #0d9488);
  color: #fff;
  border-color: var(--accent, #0d9488);
}
.trie-explorer-btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.trie-explorer-btn-secondary {
  background: transparent;
  color: var(--text-secondary, #475569);
}
.trie-explorer-btn-secondary:hover:not(:disabled) {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.trie-explorer-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
  align-items: center;
}

.trie-explorer-examples-label {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-right: 0.25rem;
}

.trie-explorer-chip {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border, #cbd5e1);
  background: transparent;
  color: var(--text-secondary, #475569);
  cursor: pointer;
  transition: all 0.15s ease;
}
.trie-explorer-chip:hover {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  border-color: var(--accent, #0d9488);
  color: var(--accent, #0d9488);
}
.trie-explorer-chip:disabled {
  opacity: 0.4;
  cursor: default;
}

.trie-explorer-viz {
  min-height: 80px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trie-explorer-empty {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  font-size: 0.9rem;
  padding: 2rem 0;
  text-align: center;
}

.trie-explorer-stats {
  border-top: 1px solid var(--border, #cbd5e1);
  padding-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.trie-explorer-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.trie-explorer-stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.trie-explorer-stat-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.trie-explorer-stat-highlight {
  color: var(--accent, #0d9488);
}

.trie-explorer-words {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #475569);
}

.trie-explorer-words-list {
  font-family: var(--font-mono, monospace);
  color: var(--text, #0f172a);
}

.trie-explorer-feedback {
  font-size: 0.8rem;
  height: 1.2em;
  margin-bottom: 0.5rem;
  transition: opacity 0.2s ease;
}
.trie-explorer-feedback-ok {
  color: var(--accent, #0d9488);
}
.trie-explorer-feedback-dup {
  color: var(--accent-secondary, #f97316);
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

// ─── Example word sets ──────────────────────────────────────────────

const EXAMPLES: Record<string, string[]> = {
  'Cars & Cards': ['cat', 'car', 'card', 'care', 'cart', 'cast'],
  'TH- words': ['the', 'there', 'their', 'they', 'them', 'then'],
  'Tea & Top': ['to', 'top', 'toy', 'tea', 'ten', 'team'],
  'Code': ['int', 'into', 'interface', 'internal', 'input'],
};

// ─── Helpers ────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Mount ──────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('trie-explorer: mount element not found');
    return;
  }

  injectStyles();

  const trie = new TrieEngine();
  let isAnimating = false;

  // ── Build DOM ───────────────────────────────────────────────────

  const exampleChips = Object.keys(EXAMPLES)
    .map(
      (name) =>
        `<button class="trie-explorer-chip" data-example="${name}">${name}</button>`,
    )
    .join('');

  el.innerHTML = `
    <div class="trie-explorer">
      <div class="trie-explorer-controls">
        <input type="text" class="trie-explorer-input"
               placeholder="Type a word..." autocomplete="off" spellcheck="false">
        <button class="trie-explorer-btn trie-explorer-btn-primary" data-btn="add">Add</button>
        <button class="trie-explorer-btn trie-explorer-btn-secondary" data-btn="reset">Clear</button>
      </div>
      <div class="trie-explorer-examples">
        <span class="trie-explorer-examples-label">Examples:</span>
        ${exampleChips}
      </div>
      <div class="trie-explorer-feedback">&nbsp;</div>
      <div class="trie-explorer-viz"></div>
      <div class="trie-explorer-stats" style="display:none">
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Words</span>
          <span class="trie-explorer-stat-value" data-stat="words">0</span>
        </div>
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Nodes</span>
          <span class="trie-explorer-stat-value" data-stat="nodes">0</span>
        </div>
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Total characters</span>
          <span class="trie-explorer-stat-value" data-stat="chars">0</span>
        </div>
        <div class="trie-explorer-stat">
          <span class="trie-explorer-stat-label">Prefix savings</span>
          <span class="trie-explorer-stat-value trie-explorer-stat-highlight" data-stat="savings">—</span>
        </div>
        <div class="trie-explorer-words">
          <span class="trie-explorer-words-list" data-stat="word-list"></span>
        </div>
      </div>
    </div>
  `;

  // ── Elements ────────────────────────────────────────────────────

  const input = el.querySelector<HTMLInputElement>('.trie-explorer-input')!;
  const addBtn = el.querySelector<HTMLButtonElement>('[data-btn="add"]')!;
  const resetBtn = el.querySelector<HTMLButtonElement>('[data-btn="reset"]')!;
  const vizContainer = el.querySelector<HTMLElement>('.trie-explorer-viz')!;
  const statsContainer = el.querySelector<HTMLElement>('.trie-explorer-stats')!;
  const feedback = el.querySelector<HTMLElement>('.trie-explorer-feedback')!;
  const chips = el.querySelectorAll<HTMLButtonElement>('.trie-explorer-chip');

  // ── Initialize visualizer ───────────────────────────────────────

  // Show empty state
  vizContainer.innerHTML =
    '<div class="trie-explorer-empty">Add a word to start building the trie</div>';

  let viz: TrieViz | null = null;

  function ensureViz(): TrieViz {
    if (!viz) {
      vizContainer.innerHTML = '';
      viz = new TrieViz(vizContainer);
    }
    return viz;
  }

  // ── State updates ───────────────────────────────────────────────

  function showFeedback(msg: string, type: 'ok' | 'dup'): void {
    feedback.textContent = msg;
    feedback.className = `trie-explorer-feedback trie-explorer-feedback-${type}`;
    // Auto-clear after a moment
    setTimeout(() => {
      feedback.innerHTML = '&nbsp;';
    }, 2000);
  }

  function updateStats(): void {
    const words = trie.wordCount;
    if (words === 0) {
      statsContainer.style.display = 'none';
      return;
    }

    statsContainer.style.display = '';

    const nodes = trie.nodeCount - 1; // exclude root
    const chars = trie.totalChars;
    const savings =
      chars > 0 ? Math.round((1 - nodes / chars) * 100) : 0;

    el.querySelector<HTMLElement>('[data-stat="words"]')!.textContent =
      String(words);
    el.querySelector<HTMLElement>('[data-stat="nodes"]')!.textContent =
      String(nodes);
    el.querySelector<HTMLElement>('[data-stat="chars"]')!.textContent =
      String(chars);
    el.querySelector<HTMLElement>('[data-stat="savings"]')!.textContent =
      savings > 0 ? `${savings}%` : '—';
    el.querySelector<HTMLElement>(
      '[data-stat="word-list"]',
    )!.textContent = trie.getWords().join(', ');
  }

  function addWord(word: string): boolean {
    const trimmed = word.trim().toLowerCase();
    if (!trimmed) return false;

    const isNew = trie.insert(trimmed);
    if (isNew) {
      ensureViz().update(trie.toHierarchy());
      updateStats();
      showFeedback(`Added "${trimmed}"`, 'ok');
    } else {
      showFeedback(`"${trimmed}" already in trie`, 'dup');
    }
    return isNew;
  }

  function resetAll(): void {
    trie.clear();
    if (viz) {
      vizContainer.innerHTML = '';
      viz = null;
    }
    vizContainer.innerHTML =
      '<div class="trie-explorer-empty">Add a word to start building the trie</div>';
    updateStats();
    feedback.innerHTML = '&nbsp;';
    input.value = '';
    input.focus();
  }

  async function loadExample(name: string): Promise<void> {
    const words = EXAMPLES[name];
    if (!words || isAnimating) return;

    isAnimating = true;
    setControlsEnabled(false);

    // Reset first
    trie.clear();
    if (viz) {
      vizContainer.innerHTML = '';
      viz = null;
    }
    feedback.innerHTML = '&nbsp;';
    updateStats();

    // Add words one at a time with animation
    for (let i = 0; i < words.length; i++) {
      await sleep(i === 0 ? 200 : 500);
      const word = words[i];
      input.value = word;
      trie.insert(word);
      ensureViz().update(trie.toHierarchy());
      updateStats();
      showFeedback(`Added "${word}"`, 'ok');
    }

    await sleep(300);
    input.value = '';
    isAnimating = false;
    setControlsEnabled(true);
    input.focus();
  }

  function setControlsEnabled(enabled: boolean): void {
    input.disabled = !enabled;
    addBtn.disabled = !enabled;
    resetBtn.disabled = !enabled;
    chips.forEach((c) => (c.disabled = !enabled));
  }

  // ── Event listeners ─────────────────────────────────────────────

  addBtn.addEventListener('click', () => {
    addWord(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addWord(input.value);
      input.value = '';
    }
  });

  resetBtn.addEventListener('click', resetAll);

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const name = chip.dataset.example || '';
      loadExample(name);
    });
  }
}
