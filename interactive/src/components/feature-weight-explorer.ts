/**
 * Feature Weight Explorer — Grid-Based UMAP
 *
 * Each of 15 pre-computed UMAP projections is a genuine dimensionality
 * reduction of differently-weighted concatenated features (embeddings,
 * genre keywords, writing style). The weights form a simplex lattice
 * at 25% resolution.
 *
 * When the user adjusts sliders, we find the nearest pre-computed
 * grid point and smoothly animate the transition. No interpolation
 * tricks — every layout you see is a real UMAP.
 */

// ─── Types ──────────────────────────────────────────────────────────

interface GridEntry {
  w: [number, number, number]; // [semantic, genre, style], sums to 1
  coords: number[];            // flat [x,y,x,y,…]
}

interface ProjectionData {
  count: number;
  grid: GridEntry[];
  meta: { s: string; r: number; t: string }[];
}

// ─── Colour palettes ────────────────────────────────────────────────

const SENTIMENT_COLORS: Record<string, string> = {
  pos: '#22c55e', neg: '#ef4444',
};

const RATING_COLORS = [
  '#dc2626', '#ef4444', '#f97316', '#fb923c', '#fbbf24',
  '#a3e635', '#4ade80', '#22d3ee', '#818cf8', '#a78bfa',
];

// ─── CSS ────────────────────────────────────────────────────────────

const CSS = /* css */ `
.fwe {
  position: relative;
  width: 960px;
  max-width: calc(100vw - 2rem);
  left: 50%;
  transform: translateX(-50%);
  margin: 2rem 0;
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  background: #0f172a;
}

/* ── toolbar ── */
.fwe-toolbar {
  display: flex; align-items: center; gap: 1.25rem;
  padding: 0.75rem 1rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-wrap: wrap;
}
.fwe-slider-group {
  display: flex; align-items: center; gap: 0.4rem;
}
.fwe-slider-group label {
  font-size: 0.78rem; font-weight: 600; color: #94a3b8;
  white-space: nowrap; min-width: 3.2rem;
}
.fwe-slider-group input[type="range"] {
  width: 90px; accent-color: #818cf8;
}
.fwe-slider-group .fwe-val {
  font-size: 0.72rem; color: #64748b; width: 2rem; text-align: right;
  font-variant-numeric: tabular-nums;
}
.fwe-toolbar select {
  font-size: 0.8rem; padding: 0.3rem 0.5rem;
  border-radius: 6px; border: 1px solid #475569;
  background: #0f172a; color: #e2e8f0; cursor: pointer;
}
.fwe-divider {
  width: 1px; height: 1.4rem; background: #334155;
}
.fwe-toolbar button {
  font-size: 0.75rem; padding: 0.3rem 0.7rem;
  border-radius: 6px; border: 1px solid #475569;
  background: #1e293b; color: #94a3b8; cursor: pointer;
  transition: all 0.15s;
}
.fwe-toolbar button:hover { background: #334155; color: #e2e8f0; }

/* ── legend ── */
.fwe-legend {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.4rem 1rem;
  background: #1e293b; border-bottom: 1px solid #334155;
  font-size: 0.75rem; color: #94a3b8; flex-wrap: wrap;
}
.fwe-legend-item { display: flex; align-items: center; gap: 0.35rem; }
.fwe-legend-dot { width: 10px; height: 10px; border-radius: 50%; }

/* ── status bar ── */
.fwe-status {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.35rem 1rem;
  background: #1e293b; border-bottom: 1px solid #334155;
  font-size: 0.72rem; color: #64748b;
  font-variant-numeric: tabular-nums;
}
.fwe-status-weights { font-weight: 600; color: #94a3b8; }
.fwe-status-badge {
  padding: 0.15rem 0.5rem; border-radius: 4px;
  background: rgba(129, 140, 248, 0.15); color: #818cf8;
  font-size: 0.68rem; font-weight: 600;
}

/* ── canvas ── */
.fwe-canvas-wrap {
  position: relative; width: 100%; height: 580px;
}
.fwe-canvas-wrap canvas {
  display: block; width: 100%; height: 100%;
  cursor: crosshair;
}

/* ── tooltip ── */
.fwe-tooltip {
  position: fixed; pointer-events: none;
  background: #1e293b; border: 1px solid #475569;
  border-radius: 8px; padding: 0.6rem 0.8rem;
  max-width: 320px; font-size: 0.8rem;
  color: #e2e8f0; line-height: 1.45;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  opacity: 0; transition: opacity 0.12s; z-index: 1000;
  font-family: var(--font-sans, system-ui, sans-serif);
}
.fwe-tooltip.visible { opacity: 1; }
.fwe-tooltip-meta {
  display: flex; gap: 0.5rem; align-items: center;
  margin-bottom: 0.4rem; font-weight: 600;
}
.fwe-tooltip-badge {
  padding: 0.15rem 0.5rem; border-radius: 4px;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
}
.fwe-tooltip-badge.pos { background: rgba(34,197,94,0.2); color: #4ade80; }
.fwe-tooltip-badge.neg { background: rgba(239,68,68,0.2); color: #f87171; }
.fwe-tooltip-text { color: #94a3b8; font-style: italic; }

/* ── loading ── */
.fwe-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; background: #0f172a;
  color: #94a3b8; font-size: 0.9rem; gap: 0.75rem; z-index: 10;
}
.fwe-spinner {
  width: 32px; height: 32px;
  border: 3px solid #334155; border-top-color: #818cf8;
  border-radius: 50%;
  animation: fwe-spin 0.8s linear infinite;
}
@keyframes fwe-spin { to { transform: rotate(360deg); } }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);
  stylesInjected = true;
}

// ─── Grid lookup ────────────────────────────────────────────────────

/** Build a lookup map from normalized weight key to grid index. */
function buildLookup(grid: GridEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i < grid.length; i++) {
    const [ws, wg, wst] = grid[i].w;
    map.set(weightKey(ws, wg, wst), i);
  }
  return map;
}

/** Normalize slider values and return a lookup key. */
function weightKey(ws: number, wg: number, wst: number): string {
  const total = ws + wg + wst || 1;
  // Round to 6 decimals to match the export script's precision
  const ns = Math.round((ws / total) * 1e6) / 1e6;
  const ng = Math.round((wg / total) * 1e6) / 1e6;
  const nst = Math.round((wst / total) * 1e6) / 1e6;
  return `${ns},${ng},${nst}`;
}

// ─── Mount ──────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null) {
  if (!el) return;
  injectStyles();

  // ── DOM ──
  el.innerHTML = `
    <div class="fwe">
      <div class="fwe-toolbar">
        <div class="fwe-slider-group">
          <label>Meaning</label>
          <input type="range" data-proj="semantic" min="0" max="100" step="25" value="100">
          <span class="fwe-val" data-val="semantic">100</span>
        </div>
        <div class="fwe-slider-group">
          <label>Genre</label>
          <input type="range" data-proj="genre" min="0" max="100" step="25" value="0">
          <span class="fwe-val" data-val="genre">0</span>
        </div>
        <div class="fwe-slider-group">
          <label>Style</label>
          <input type="range" data-proj="style" min="0" max="100" step="25" value="0">
          <span class="fwe-val" data-val="style">0</span>
        </div>
        <span class="fwe-divider"></span>
        <select data-ctl="colorBy">
          <option value="sentiment">Sentiment</option>
          <option value="rating">Rating (1–10)</option>
        </select>
        <button data-action="reset">Reset</button>
      </div>
      <div class="fwe-status" data-el="status">
        <span class="fwe-status-weights" data-el="statusWeights">Meaning 100%</span>
        <span class="fwe-status-badge">genuine UMAP</span>
      </div>
      <div class="fwe-legend" data-el="legend"></div>
      <div class="fwe-canvas-wrap" data-el="wrap">
        <canvas data-el="canvas"></canvas>
        <div class="fwe-loading" data-el="loading">
          <div class="fwe-spinner"></div>
          <span>Loading 10,000 reviews × 15 projections…</span>
        </div>
      </div>
    </div>`;

  const tooltip = document.createElement('div');
  tooltip.className = 'fwe-tooltip';
  document.body.appendChild(tooltip);

  const $ = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
  const wrap       = $<HTMLDivElement>('[data-el="wrap"]');
  const canvas     = $<HTMLCanvasElement>('[data-el="canvas"]');
  const loading    = $<HTMLDivElement>('[data-el="loading"]');
  const legendEl   = $<HTMLDivElement>('[data-el="legend"]');
  const statusW    = $<HTMLSpanElement>('[data-el="statusWeights"]');
  const colorSel   = $<HTMLSelectElement>('[data-ctl="colorBy"]');
  const resetBtn   = $<HTMLButtonElement>('[data-action="reset"]');

  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio, 2);

  // ── State ──
  let data: ProjectionData | null = null;
  let lookup: Map<string, number> | null = null;
  let sliderVals = { semantic: 100, genre: 0, style: 0 };
  let colorMode: 'sentiment' | 'rating' = 'sentiment';
  let activeGridIdx = -1;
  // Current display positions (lerped)
  let curX: Float32Array;
  let curY: Float32Array;
  // Target positions (from grid lookup)
  let tgtX: Float32Array;
  let tgtY: Float32Array;
  let animating = false;
  let hovIdx = -1;

  // ── Resize ──
  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  // ── Legend ──
  function updateLegend() {
    if (colorMode === 'sentiment') {
      legendEl.innerHTML = dot('#22c55e', 'Positive') + dot('#ef4444', 'Negative');
    } else {
      legendEl.innerHTML = RATING_COLORS.map((c, i) =>
        dot(c, String(i + 1))
      ).join('');
    }
  }
  function dot(color: string, label: string) {
    return `<div class="fwe-legend-item"><span class="fwe-legend-dot" style="background:${color}"></span>${label}</div>`;
  }
  updateLegend();

  // ── Set target positions from a grid entry ──
  function setTargetFromGrid(gridIdx: number) {
    if (!data) return;
    const entry = data.grid[gridIdx];
    const coords = entry.coords;
    for (let i = 0; i < data.count; i++) {
      tgtX[i] = coords[i * 2];
      tgtY[i] = coords[i * 2 + 1];
    }
    activeGridIdx = gridIdx;
    animating = true;

    // Update status bar — show clean percentages
    const [ws, wg, wst] = entry.w;
    const fmt = (v: number) => {
      const pct = v * 100;
      return pct === Math.round(pct) ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
    };
    const parts: string[] = [];
    if (ws > 0) parts.push(`Meaning ${fmt(ws)}`);
    if (wg > 0) parts.push(`Genre ${fmt(wg)}`);
    if (wst > 0) parts.push(`Style ${fmt(wst)}`);
    statusW.textContent = parts.join(' + ') || 'Meaning 100%';
  }

  // ── Handle slider change: exact lookup ──
  function onSlidersChanged() {
    if (!data || !lookup) return;
    const key = weightKey(sliderVals.semantic, sliderVals.genre, sliderVals.style);
    const idx = lookup.get(key);
    if (idx !== undefined && idx !== activeGridIdx) {
      setTargetFromGrid(idx);
    }
  }

  // ── Map data coords to canvas coords ──
  function toCanvasX(v: number): number {
    return (v + 1) * 0.5 * (canvas.width / dpr - 40) + 20;
  }
  function toCanvasY(v: number): number {
    return (1 - (v + 1) * 0.5) * (canvas.height / dpr - 40) + 20;
  }
  function fromCanvasX(cx: number): number {
    return (cx - 20) / ((canvas.width / dpr - 40) * 0.5) - 1;
  }
  function fromCanvasY(cy: number): number {
    return 1 - (cy - 20) / ((canvas.height / dpr - 40) * 0.5);
  }

  // ── Render ──
  function getColor(i: number): string {
    const m = data!.meta[i];
    if (colorMode === 'sentiment') {
      return SENTIMENT_COLORS[m.s] || '#94a3b8';
    }
    return RATING_COLORS[Math.max(0, Math.min(9, m.r - 1))];
  }

  function render() {
    if (!data) return;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const R = 2.5;
    const N = data.count;

    // Batch by color for performance
    const colorBuckets = new Map<string, number[]>();
    for (let i = 0; i < N; i++) {
      const c = getColor(i);
      let bucket = colorBuckets.get(c);
      if (!bucket) { bucket = []; colorBuckets.set(c, bucket); }
      bucket.push(i);
    }

    ctx.globalAlpha = 0.7;
    for (const [color, indices] of colorBuckets) {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (const i of indices) {
        const cx = toCanvasX(curX[i]);
        const cy = toCanvasY(curY[i]);
        ctx.moveTo(cx + R, cy);
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Draw highlighted point larger
    if (hovIdx >= 0) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = getColor(hovIdx);
      ctx.lineWidth = 2;
      ctx.beginPath();
      const hx = toCanvasX(curX[hovIdx]);
      const hy = toCanvasY(curY[hovIdx]);
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  // ── Animation loop ──
  const LERP_SPEED = 0.1;

  function animate() {
    requestAnimationFrame(animate);
    if (!data) return;

    if (animating) {
      let maxDelta = 0;
      for (let i = 0; i < data.count; i++) {
        curX[i] += (tgtX[i] - curX[i]) * LERP_SPEED;
        curY[i] += (tgtY[i] - curY[i]) * LERP_SPEED;
        maxDelta = Math.max(maxDelta,
          Math.abs(tgtX[i] - curX[i]), Math.abs(tgtY[i] - curY[i]));
      }
      if (maxDelta < 0.0001) animating = false;
    }

    render();
  }

  // ── Tooltip ──
  function showTip(i: number, cx: number, cy: number) {
    const m = data!.meta[i];
    tooltip.innerHTML = `
      <div class="fwe-tooltip-meta">
        <span class="fwe-tooltip-badge ${m.s}">${m.s === 'pos' ? 'Positive' : 'Negative'}</span>
        <span>${m.r}/10</span>
      </div>
      <div class="fwe-tooltip-text">"${m.t}"</div>`;
    tooltip.classList.add('visible');
    let left = cx + 16, top = cy - 20;
    if (left + 340 > window.innerWidth) left = cx - 340;
    if (top + 140 > window.innerHeight) top = cy - 140;
    if (top < 8) top = 8;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }
  function hideTip() { tooltip.classList.remove('visible'); }

  // ── Hover ──
  canvas.addEventListener('pointermove', (e) => {
    if (!data) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = fromCanvasX(mx);
    const dy = fromCanvasY(my);

    let best = -1, bestDist = 0.02;
    for (let i = 0; i < data.count; i++) {
      const d = (curX[i] - dx) ** 2 + (curY[i] - dy) ** 2;
      if (d < bestDist) { bestDist = d; best = i; }
    }

    hovIdx = best;
    if (best >= 0) {
      showTip(best, e.clientX, e.clientY);
      canvas.style.cursor = 'pointer';
    } else {
      hideTip();
      canvas.style.cursor = 'crosshair';
    }
  });
  canvas.addEventListener('pointerleave', () => { hideTip(); hovIdx = -1; });

  // ── Slider wiring ──
  const sliders = el.querySelectorAll<HTMLInputElement>('input[data-proj]');
  sliders.forEach(slider => {
    const key = slider.dataset.proj as keyof typeof sliderVals;
    const valSpan = el.querySelector<HTMLSpanElement>(`[data-val="${key}"]`)!;
    slider.addEventListener('input', () => {
      sliderVals[key] = parseInt(slider.value);
      valSpan.textContent = slider.value;
      onSlidersChanged();
    });
  });

  colorSel.addEventListener('change', () => {
    colorMode = colorSel.value as typeof colorMode;
    updateLegend();
  });

  resetBtn.addEventListener('click', () => {
    sliderVals = { semantic: 100, genre: 0, style: 0 };
    sliders.forEach(s => {
      const key = s.dataset.proj as keyof typeof sliderVals;
      s.value = String(sliderVals[key]);
      el.querySelector<HTMLSpanElement>(`[data-val="${key}"]`)!.textContent =
        String(sliderVals[key]);
    });
    onSlidersChanged();
  });

  // ── Load data ──
  fetch('/data/exploring-data/feature-projections.json')
    .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
    .then((d: ProjectionData) => {
      data = d;
      lookup = buildLookup(d.grid);
      const N = d.count;
      curX = new Float32Array(N);
      curY = new Float32Array(N);
      tgtX = new Float32Array(N);
      tgtY = new Float32Array(N);

      // Find the semantic-only grid entry and initialize to it
      const semKey = weightKey(100, 0, 0);
      const semIdx = lookup.get(semKey) ?? 0;
      const semCoords = d.grid[semIdx].coords;
      for (let i = 0; i < N; i++) {
        curX[i] = semCoords[i * 2];
        curY[i] = semCoords[i * 2 + 1];
        tgtX[i] = curX[i];
        tgtY[i] = curY[i];
      }
      activeGridIdx = semIdx;

      loading.style.display = 'none';
      animate();
    })
    .catch(err => {
      loading.innerHTML =
        `<span style="color:#f87171">Failed to load data: ${err.message}</span>`;
    });
}
