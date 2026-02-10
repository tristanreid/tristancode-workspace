/**
 * Component: TrieScanner
 *
 * An interactive widget that demonstrates multi-pattern text scanning with
 * a trie. The reader loads words into a trie (with presets), pastes or types
 * a block of text, and watches the trie highlight all matches in real-time.
 *
 * Features:
 * - Word list with add/remove, or preset examples
 * - Editable text area for scanning
 * - Highlighted matches with hover details (match text, trie path)
 * - Toggle for word boundaries vs. substring matching
 * - Toggle for case sensitivity
 * - Match count and stats
 * - Optional trie visualization (small, below the scanner)
 *
 * Styled via CSS custom properties from the active theme.
 */

import { TrieEngine, TrieMatch } from '../trie-engine';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.trie-scanner {
  border: 2px solid var(--border, #d0d8e4);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 2rem 0;
  background: var(--bg, #fff);
  font-family: var(--font-body, system-ui, sans-serif);
}

.trie-scanner-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.trie-scanner-header h3 {
  margin: 0;
  font-family: var(--font-heading, var(--font-mono, monospace));
  font-size: 1.1rem;
  color: var(--text, #1e2a3a);
}

/* ── Word list ──────────────────────────────────── */

.trie-scanner-words {
  margin-bottom: 1rem;
}

.trie-scanner-words-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #8899aa);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trie-scanner-word-input-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.trie-scanner-word-input {
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  font-family: var(--font-mono, 'SF Mono', monospace);
  font-size: 0.9rem;
  background: var(--bg, #fff);
  color: var(--text, #1e2a3a);
  outline: none;
  transition: border-color 0.15s;
}
.trie-scanner-word-input:focus {
  border-color: var(--accent, #d94040);
}

.trie-scanner-btn {
  padding: 0.4rem 0.85rem;
  border: 1.5px solid var(--accent, #d94040);
  border-radius: 6px;
  background: var(--bg, #fff);
  color: var(--accent, #d94040);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.trie-scanner-btn:hover {
  background: var(--accent, #d94040);
  color: #fff;
}

.trie-scanner-btn-sm {
  padding: 0.25rem 0.55rem;
  font-size: 0.75rem;
}

.trie-scanner-btn-active {
  background: var(--accent, #d94040);
  color: #fff;
}

.trie-scanner-word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  min-height: 1.8rem;
}

.trie-scanner-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: var(--accent, #d94040);
  color: #fff;
  font-family: var(--font-mono, 'SF Mono', monospace);
  font-size: 0.8rem;
  font-weight: 600;
}

.trie-scanner-tag-remove {
  cursor: pointer;
  opacity: 0.7;
  font-size: 0.9rem;
  line-height: 1;
}
.trie-scanner-tag-remove:hover {
  opacity: 1;
}

.trie-scanner-presets {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.trie-scanner-presets-label {
  font-size: 0.75rem;
  color: var(--text-muted, #8899aa);
  margin-right: 0.3rem;
  align-self: center;
}

/* ── Options row ────────────────────────────────── */

.trie-scanner-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  align-items: center;
}

.trie-scanner-option {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text, #1e2a3a);
  cursor: pointer;
  user-select: none;
}

.trie-scanner-option input[type="checkbox"] {
  accent-color: var(--accent, #d94040);
  width: 16px;
  height: 16px;
}

/* ── Text area ──────────────────────────────────── */

.trie-scanner-text-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #8899aa);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trie-scanner-textarea {
  width: 100%;
  min-height: 90px;
  padding: 0.7rem;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text, #1e2a3a);
  background: var(--bg, #fff);
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.trie-scanner-textarea:focus {
  border-color: var(--accent, #d94040);
}

/* ── Results ────────────────────────────────────── */

.trie-scanner-results {
  margin-top: 1rem;
}

.trie-scanner-results-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #8899aa);
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trie-scanner-output {
  padding: 0.9rem;
  border: 1.5px solid var(--border, #d0d8e4);
  border-radius: 6px;
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text, #1e2a3a);
  background: var(--bg, #fff);
  min-height: 3rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.trie-scanner-match {
  background: color-mix(in srgb, var(--accent, #d94040) 18%, transparent);
  border-bottom: 2px solid var(--accent, #d94040);
  padding: 0.05em 0.15em;
  border-radius: 2px;
  cursor: default;
  transition: background 0.15s;
}
.trie-scanner-match:hover {
  background: color-mix(in srgb, var(--accent, #d94040) 35%, transparent);
}

.trie-scanner-stats {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-top: 0.7rem;
  font-size: 0.82rem;
  color: var(--text-muted, #8899aa);
}

.trie-scanner-stat-value {
  font-weight: 700;
  color: var(--accent, #d94040);
  font-family: var(--font-mono, 'SF Mono', monospace);
}

.trie-scanner-empty {
  color: var(--text-muted, #8899aa);
  font-style: italic;
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

// ─── Presets ─────────────────────────────────────────────────────────

interface Preset {
  label: string;
  words: string[];
  text: string;
}

const PRESETS: Preset[] = [
  {
    label: 'Cities',
    words: ['New York', 'New Orleans', 'San Francisco', 'San Jose', 'San Diego', 'Los Angeles', 'Las Vegas'],
    text: 'The flight from New York to San Francisco takes about five hours. From there you can drive to San Jose or head south toward Los Angeles and San Diego. Meanwhile New Orleans is hosting its annual jazz festival, and Las Vegas is packed for a tech conference.',
  },
  {
    label: 'Programming',
    words: ['map', 'reduce', 'filter', 'sort', 'slice', 'find', 'flat', 'join'],
    text: 'First we filter the records by date, then map each one to its score. We sort the results and slice the top ten. To combine groups, we flat map nested arrays and reduce them into a single total. Finally we join the strings and find any anomalies.',
  },
  {
    label: 'Animals',
    words: ['cat', 'car', 'card', 'cart', 'care', 'the', 'there', 'their', 'them'],
    text: 'The cat sat on their card table. There was a cart outside, and the car was parked nearby. They showed care for them, and the cat purred happily there.',
  },
  {
    label: 'Overlap Demo',
    words: ['New', 'New York', 'New York City', 'York'],
    text: 'Welcome to New York City, the greatest city in the world. New York has something for everyone. York is also a city in England.',
  },
];

// ─── Component ──────────────────────────────────────────────────────

export function mount(container: HTMLElement): void {
  injectStyles();

  const trie = new TrieEngine();
  let wordBoundaries = true;
  let caseSensitive = false;
  let resolveOverlaps = true;

  // ── Build DOM ──────────────────────────────────
  const root = document.createElement('div');
  root.className = 'trie-scanner';

  // Header
  const header = el('div', 'trie-scanner-header');
  header.appendChild(elText('h3', 'Trie Text Scanner'));
  root.appendChild(header);

  // Word list section
  const wordsSection = el('div', 'trie-scanner-words');
  wordsSection.appendChild(elText('div', 'Dictionary', 'trie-scanner-words-label'));

  // Word input row
  const wordInputRow = el('div', 'trie-scanner-word-input-row');
  const wordInput = document.createElement('input');
  wordInput.type = 'text';
  wordInput.className = 'trie-scanner-word-input';
  wordInput.placeholder = 'Add a word or phrase...';
  wordInputRow.appendChild(wordInput);

  const addBtn = elText('button', 'Add', 'trie-scanner-btn trie-scanner-btn-sm');
  wordInputRow.appendChild(addBtn);

  const clearWordsBtn = elText('button', 'Clear All', 'trie-scanner-btn trie-scanner-btn-sm');
  wordInputRow.appendChild(clearWordsBtn);
  wordsSection.appendChild(wordInputRow);

  // Tags
  const tagContainer = el('div', 'trie-scanner-word-tags');
  wordsSection.appendChild(tagContainer);

  // Presets
  const presetsRow = el('div', 'trie-scanner-presets');
  presetsRow.appendChild(elText('span', 'Try:', 'trie-scanner-presets-label'));
  const presetButtons: HTMLButtonElement[] = [];
  for (const preset of PRESETS) {
    const btn = elText('button', preset.label, 'trie-scanner-btn trie-scanner-btn-sm') as HTMLButtonElement;
    presetButtons.push(btn);
    presetsRow.appendChild(btn);
  }
  wordsSection.appendChild(presetsRow);

  root.appendChild(wordsSection);

  // Options row
  const optionsRow = el('div', 'trie-scanner-options');

  const wbLabel = el('label', 'trie-scanner-option');
  const wbCheck = document.createElement('input');
  wbCheck.type = 'checkbox';
  wbCheck.checked = wordBoundaries;
  wbLabel.appendChild(wbCheck);
  wbLabel.appendChild(document.createTextNode('Word boundaries'));
  optionsRow.appendChild(wbLabel);

  const csLabel = el('label', 'trie-scanner-option');
  const csCheck = document.createElement('input');
  csCheck.type = 'checkbox';
  csCheck.checked = caseSensitive;
  csLabel.appendChild(csCheck);
  csLabel.appendChild(document.createTextNode('Case sensitive'));
  optionsRow.appendChild(csLabel);

  const olLabel = el('label', 'trie-scanner-option');
  const olCheck = document.createElement('input');
  olCheck.type = 'checkbox';
  olCheck.checked = resolveOverlaps;
  olLabel.appendChild(olCheck);
  olLabel.appendChild(document.createTextNode('Resolve overlaps'));
  optionsRow.appendChild(olLabel);

  root.appendChild(optionsRow);

  // Text area
  const textSection = el('div', '');
  textSection.appendChild(elText('div', 'Text to scan', 'trie-scanner-text-label'));
  const textarea = document.createElement('textarea');
  textarea.className = 'trie-scanner-textarea';
  textarea.placeholder = 'Type or paste text here, then watch the trie find all matches...';
  textSection.appendChild(textarea);
  root.appendChild(textSection);

  // Results
  const resultsSection = el('div', 'trie-scanner-results');
  resultsSection.appendChild(elText('div', 'Matches', 'trie-scanner-results-label'));
  const output = el('div', 'trie-scanner-output');
  resultsSection.appendChild(output);

  const statsRow = el('div', 'trie-scanner-stats');
  resultsSection.appendChild(statsRow);

  root.appendChild(resultsSection);
  container.appendChild(root);

  // ── State management ───────────────────────────

  function addWord(word: string): void {
    const trimmed = word.trim();
    if (!trimmed) return;
    // For case-insensitive matching, insert lowercased
    const insertWord = caseSensitive ? trimmed : trimmed.toLowerCase();
    trie.insert(insertWord);
    renderTags();
    scan();
  }

  function removeWord(word: string): void {
    // Rebuild the trie without this word
    const words = trie.getWords().filter((w) => w !== word);
    trie.clear();
    for (const w of words) trie.insert(w);
    renderTags();
    scan();
  }

  function clearWords(): void {
    trie.clear();
    renderTags();
    scan();
  }

  function loadPreset(preset: Preset): void {
    trie.clear();
    for (const w of preset.words) {
      const insertWord = caseSensitive ? w : w.toLowerCase();
      trie.insert(insertWord);
    }
    textarea.value = preset.text;
    renderTags();
    scan();
  }

  function renderTags(): void {
    tagContainer.innerHTML = '';
    const words = trie.getWords();
    if (words.length === 0) {
      tagContainer.appendChild(elText('span', 'No words loaded', 'trie-scanner-empty'));
      return;
    }
    for (const word of words) {
      const tag = el('span', 'trie-scanner-tag');
      tag.appendChild(document.createTextNode(word));
      const removeBtn = elText('span', '\u00d7', 'trie-scanner-tag-remove');
      removeBtn.addEventListener('click', () => removeWord(word));
      tag.appendChild(removeBtn);
      tagContainer.appendChild(tag);
    }
  }

  function scan(): void {
    const text = textarea.value;
    if (!text || trie.wordCount === 0) {
      output.innerHTML = '';
      if (!text && trie.wordCount > 0) {
        output.appendChild(elText('span', 'Enter some text to scan...', 'trie-scanner-empty'));
      } else if (text && trie.wordCount === 0) {
        output.appendChild(elText('span', 'Add words to the dictionary first...', 'trie-scanner-empty'));
      } else {
        output.appendChild(elText('span', 'Add words and enter text to see matches', 'trie-scanner-empty'));
      }
      statsRow.innerHTML = '';
      return;
    }

    let matches = trie.findAllMatches(text, {
      wordBoundaries,
      caseSensitive,
    });

    const rawCount = matches.length;

    if (resolveOverlaps) {
      matches = TrieEngine.resolveOverlaps(matches);
    }

    renderHighlightedText(text, matches);
    renderStats(rawCount, matches.length, text.length);
  }

  function renderHighlightedText(text: string, matches: TrieMatch[]): void {
    output.innerHTML = '';

    if (matches.length === 0) {
      output.appendChild(document.createTextNode(text));
      return;
    }

    // Sort matches by start position
    const sorted = [...matches].sort((a, b) => a.start - b.start);

    let cursor = 0;
    for (const m of sorted) {
      // Text before this match
      if (m.start > cursor) {
        output.appendChild(document.createTextNode(text.slice(cursor, m.start)));
      }

      // The match itself
      const matchSpan = el('span', 'trie-scanner-match');
      matchSpan.textContent = text.slice(m.start, m.end);
      matchSpan.title = `"${m.match}" → pattern "${m.pattern}" [${m.start}:${m.end}]`;
      output.appendChild(matchSpan);

      cursor = m.end;
    }

    // Remaining text
    if (cursor < text.length) {
      output.appendChild(document.createTextNode(text.slice(cursor)));
    }
  }

  function renderStats(rawCount: number, resolvedCount: number, textLength: number): void {
    statsRow.innerHTML = '';

    const stat = (label: string, value: string | number) => {
      const s = el('span', '');
      s.innerHTML = `${label}: <span class="trie-scanner-stat-value">${value}</span>`;
      return s;
    };

    statsRow.appendChild(stat('Matches', resolvedCount));
    if (resolveOverlaps && rawCount !== resolvedCount) {
      statsRow.appendChild(stat('Before overlap resolution', rawCount));
    }
    statsRow.appendChild(stat('Patterns', trie.wordCount));
    statsRow.appendChild(stat('Text length', `${textLength} chars`));
    statsRow.appendChild(stat('Trie nodes', trie.nodeCount));
  }

  // ── Event handlers ─────────────────────────────

  wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addWord(wordInput.value);
      wordInput.value = '';
    }
  });

  addBtn.addEventListener('click', () => {
    addWord(wordInput.value);
    wordInput.value = '';
  });

  clearWordsBtn.addEventListener('click', clearWords);

  presetButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => loadPreset(PRESETS[i]));
  });

  textarea.addEventListener('input', scan);

  wbCheck.addEventListener('change', () => {
    wordBoundaries = wbCheck.checked;
    scan();
  });

  csCheck.addEventListener('change', () => {
    caseSensitive = csCheck.checked;
    // Rebuild trie with new case sensitivity
    const words = trie.getWords();
    trie.clear();
    for (const w of words) {
      const insertWord = caseSensitive ? w : w.toLowerCase();
      trie.insert(insertWord);
    }
    renderTags();
    scan();
  });

  olCheck.addEventListener('change', () => {
    resolveOverlaps = olCheck.checked;
    scan();
  });

  // ── Initial state ──────────────────────────────

  renderTags();
}

// ─── DOM helpers ─────────────────────────────────────────────────────

function el(tag: string, className: string): HTMLElement {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function elText(tag: string, text: string, className = ''): HTMLElement {
  const e = document.createElement(tag);
  if (className) e.className = className;
  e.textContent = text;
  return e;
}
