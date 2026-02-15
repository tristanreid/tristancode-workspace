/**
 * Component: DataExplorer3D
 *
 * Interactive 3D point cloud of 10,000 IMDB movie review embeddings
 * projected to 3D via UMAP.  Readers can orbit / zoom / pan,
 * color by sentiment or rating, and hover for review text.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ─── Types ──────────────────────────────────────────────────────────

interface PointMeta {
  s: string;   // "pos" | "neg"
  r: number;   // 1-10
  t: string;   // text snippet
  c?: number;  // HDBSCAN cluster (-1 = noise)
}

interface PointData {
  positions: number[];
  count: number;
  meta: PointMeta[];
}

// ─── Colour palettes ────────────────────────────────────────────────

const SENTIMENT = {
  pos: new THREE.Color(0x22c55e),
  neg: new THREE.Color(0xef4444),
};

const RATING: THREE.Color[] = [
  new THREE.Color(0xdc2626), // 1
  new THREE.Color(0xef4444), // 2
  new THREE.Color(0xf97316), // 3
  new THREE.Color(0xfb923c), // 4
  new THREE.Color(0xfbbf24), // 5
  new THREE.Color(0xa3e635), // 6
  new THREE.Color(0x4ade80), // 7
  new THREE.Color(0x22d3ee), // 8
  new THREE.Color(0x818cf8), // 9
  new THREE.Color(0xa78bfa), // 10
];

const CLUSTER: THREE.Color[] = [
  new THREE.Color(0xef4444), // 0 — Indian cinema
  new THREE.Color(0x22c55e), // 1 — TV series
  new THREE.Color(0x3b82f6), // 2 — Religious films
  new THREE.Color(0xf59e0b), // 3 — Holiday movies
  new THREE.Color(0xa855f7), // 4 — General
  new THREE.Color(0x06b6d4), // 5 — Animation
  new THREE.Color(0xec4899), // 6 — Martial arts
  new THREE.Color(0x84cc16), // 7
  new THREE.Color(0xf97316), // 8
  new THREE.Color(0x6366f1), // 9
];

const CLUSTER_NAMES: Record<number, string> = {
  '-1': 'Noise',
  0: 'Indian cinema',
  1: 'TV series',
  2: 'Religious films',
  3: 'Holiday movies',
  4: 'General',
  5: 'Animation',
  6: 'Martial arts',
};

const NOISE_COLOR = new THREE.Color(0x475569);

// ─── Shaders ────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  attribute vec3 pointColor;
  attribute float highlight;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vHighlight;
  uniform float uSize;
  uniform float uScale;

  void main() {
    vColor      = pointColor;
    vHighlight  = highlight;
    vec4 mv     = modelViewMatrix * vec4(position, 1.0);
    float depth = clamp(-mv.z, 1.0, 10.0);
    gl_PointSize = (uSize + highlight * 3.0) * uScale * (3.0 / depth);
    gl_Position  = projectionMatrix * mv;
    vAlpha = clamp(1.0 - (-mv.z - 2.0) * 0.15, 0.4, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;
  varying float vHighlight;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float disc = smoothstep(0.5, 0.3, d);
    float a    = disc * vAlpha * mix(0.75, 1.0, vHighlight);
    vec3  c    = mix(vColor, vec3(1.0), vHighlight * 0.35);
    gl_FragColor = vec4(c, a);
  }
`;

// ─── CSS ────────────────────────────────────────────────────────────

const CSS = /* css */ `
.data-explorer-3d {
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
.de3d-toolbar {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.75rem 1rem;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-wrap: wrap;
}
.de3d-toolbar label {
  font-size: 0.8rem; font-weight: 600; color: #94a3b8;
  white-space: nowrap;
}
.de3d-toolbar select {
  font-size: 0.8rem; padding: 0.3rem 0.5rem;
  border-radius: 6px; border: 1px solid #475569;
  background: #0f172a; color: #e2e8f0; cursor: pointer;
}
.de3d-toolbar input[type="range"] { width: 100px; accent-color: #818cf8; }
.de3d-toolbar button {
  font-size: 0.75rem; padding: 0.3rem 0.7rem;
  border-radius: 6px; border: 1px solid #475569;
  background: #1e293b; color: #94a3b8; cursor: pointer;
  transition: all 0.15s;
}
.de3d-toolbar button:hover { background: #334155; color: #e2e8f0; }
.de3d-divider {
  width: 1px; height: 1.4rem; background: #334155;
  margin: 0 0.15rem;
}
.de3d-toolbar button[data-action="zoomIn"],
.de3d-toolbar button[data-action="zoomOut"] {
  font-size: 1rem; font-weight: 700; line-height: 1;
  width: 1.7rem; height: 1.7rem; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
}

/* ── legend ── */
.de3d-legend {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.4rem 1rem;
  background: #1e293b; border-bottom: 1px solid #334155;
  font-size: 0.75rem; color: #94a3b8; flex-wrap: wrap;
}
.de3d-legend-item { display: flex; align-items: center; gap: 0.35rem; }
.de3d-legend-dot  { width: 10px; height: 10px; border-radius: 50%; }

/* ── canvas ── */
.de3d-canvas-wrap {
  position: relative; width: 100%; height: 550px;
  cursor: grab;
}
.de3d-canvas-wrap:active { cursor: grabbing; }
.de3d-canvas-wrap canvas { display: block; width: 100% !important; height: 100% !important; }

/* ── tooltip (appended to body) ── */
.de3d-tooltip {
  position: fixed; pointer-events: none;
  background: #1e293b; border: 1px solid #475569;
  border-radius: 8px; padding: 0.6rem 0.8rem;
  max-width: 320px; font-size: 0.8rem;
  color: #e2e8f0; line-height: 1.45;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  opacity: 0; transition: opacity 0.15s; z-index: 1000;
  font-family: var(--font-sans, system-ui, sans-serif);
}
.de3d-tooltip.visible { opacity: 1; }
.de3d-tooltip-meta {
  display: flex; gap: 0.5rem; align-items: center;
  margin-bottom: 0.4rem; font-weight: 600;
}
.de3d-tooltip-badge {
  padding: 0.15rem 0.5rem; border-radius: 4px;
  font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.05em;
}
.de3d-tooltip-badge.pos { background: rgba(34,197,94,0.2); color: #4ade80; }
.de3d-tooltip-badge.neg { background: rgba(239,68,68,0.2); color: #f87171; }
.de3d-tooltip-text { color: #94a3b8; font-style: italic; }

/* ── loading / hint ── */
.de3d-loading {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; background: #0f172a;
  color: #94a3b8; font-size: 0.9rem; gap: 0.75rem; z-index: 10;
}
.de3d-spinner {
  width: 32px; height: 32px;
  border: 3px solid #334155; border-top-color: #818cf8;
  border-radius: 50%;
  animation: de3d-spin 0.8s linear infinite;
}
@keyframes de3d-spin { to { transform: rotate(360deg); } }

.de3d-hint {
  position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);
  font-size: 0.75rem; color: #64748b;
  background: rgba(15,23,42,0.8); padding: 0.4rem 0.8rem;
  border-radius: 6px; pointer-events: none;
  transition: opacity 0.5s;
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);
  stylesInjected = true;
}

// ─── Mount ──────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null) {
  if (!el) return;
  injectStyles();

  // ── DOM ──────────────────────────────────────────────────────────
  el.innerHTML = `
    <div class="data-explorer-3d">
      <div class="de3d-toolbar">
        <label>Color by</label>
        <select data-ctl="colorBy">
          <option value="sentiment">Sentiment</option>
          <option value="rating">Rating (1–10)</option>
          <option value="cluster">Cluster (HDBSCAN)</option>
        </select>
        <label>Point size</label>
        <input type="range" data-ctl="size" min="1" max="10" value="3" step="0.5">
        <span class="de3d-divider"></span>
        <button data-action="zoomIn" title="Zoom in">+</button>
        <button data-action="zoomOut" title="Zoom out">−</button>
        <button data-action="reset">Reset view</button>
      </div>
      <div class="de3d-legend" data-el="legend"></div>
      <div class="de3d-canvas-wrap" data-el="wrap">
        <div class="de3d-loading" data-el="loading">
          <div class="de3d-spinner"></div>
          <span>Loading 10,000 reviews…</span>
        </div>
        <div class="de3d-hint" data-el="hint">
          Drag to rotate · Pinch or +/− to zoom · Right-click to pan
        </div>
      </div>
    </div>`;

  const tooltip = document.createElement('div');
  tooltip.className = 'de3d-tooltip';
  document.body.appendChild(tooltip);

  const $ = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
  const wrap      = $<HTMLDivElement>('[data-el="wrap"]');
  const loading   = $<HTMLDivElement>('[data-el="loading"]');
  const hint      = $<HTMLDivElement>('[data-el="hint"]');
  const legendEl  = $<HTMLDivElement>('[data-el="legend"]');
  const colorBySel = $<HTMLSelectElement>('[data-ctl="colorBy"]');
  const sizeRange  = $<HTMLInputElement>('[data-ctl="size"]');
  const zoomInBtn  = $<HTMLButtonElement>('[data-action="zoomIn"]');
  const zoomOutBtn = $<HTMLButtonElement>('[data-action="zoomOut"]');
  const resetBtn   = $<HTMLButtonElement>('[data-action="reset"]');

  // ── Three.js core ────────────────────────────────────────────────
  const scene  = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0.3, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  wrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.08;
  controls.autoRotate     = true;
  controls.autoRotateSpeed = 0.5;
  controls.minDistance     = 0.5;
  controls.maxDistance     = 8;

  // ── Raycaster ────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  (raycaster.params as any).Points = { threshold: 0.03 };
  const mouse = new THREE.Vector2();

  // ── State ────────────────────────────────────────────────────────
  let data: PointData | null = null;
  let points: THREE.Points | null = null;
  let colorAttr: THREE.BufferAttribute | null = null;
  let hlAttr: THREE.BufferAttribute | null = null;
  let mat: THREE.ShaderMaterial | null = null;
  let hovIdx = -1;
  let colorMode: 'sentiment' | 'rating' | 'cluster' = 'sentiment';

  // ── Resize ───────────────────────────────────────────────────────
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  // ── Legend ────────────────────────────────────────────────────────
  function updateLegend() {
    if (colorMode === 'sentiment') {
      legendEl.innerHTML = [
        dot('#22c55e', 'Positive'), dot('#ef4444', 'Negative'),
      ].join('');
    } else if (colorMode === 'rating') {
      legendEl.innerHTML = RATING.map((c, i) =>
        dot('#' + c.getHexString(), String(i + 1))
      ).join('');
    } else {
      // Cluster mode — show named clusters + noise
      const hasClusters = data?.meta.some(m => m.c !== undefined);
      if (!hasClusters) {
        legendEl.innerHTML = '<span style="color:#94a3b8;font-size:0.75rem">Cluster data not available</span>';
        return;
      }
      const ids = new Set(data!.meta.map(m => m.c ?? -1));
      const sorted = [...ids].sort((a, b) => a - b);
      legendEl.innerHTML = sorted.map(id => {
        if (id < 0) return dot('#' + NOISE_COLOR.getHexString(), 'Noise');
        const name = CLUSTER_NAMES[id] ?? `Cluster ${id}`;
        const c = CLUSTER[id % CLUSTER.length];
        return dot('#' + c.getHexString(), name);
      }).join('');
    }
  }
  function dot(color: string, label: string) {
    return `<div class="de3d-legend-item">
      <span class="de3d-legend-dot" style="background:${color}"></span>${label}
    </div>`;
  }
  updateLegend();

  // ── Apply colours to buffer ──────────────────────────────────────
  function applyColors() {
    if (!data || !colorAttr) return;
    const a = colorAttr.array as Float32Array;
    for (let i = 0; i < data.count; i++) {
      const m = data.meta[i];
      let c: THREE.Color;
      if (colorMode === 'sentiment') {
        c = m.s === 'pos' ? SENTIMENT.pos : SENTIMENT.neg;
      } else if (colorMode === 'rating') {
        c = RATING[Math.max(0, Math.min(9, m.r - 1))];
      } else {
        // cluster
        const cid = m.c ?? -1;
        c = cid < 0 ? NOISE_COLOR : CLUSTER[cid % CLUSTER.length];
      }
      a[i * 3]     = c.r;
      a[i * 3 + 1] = c.g;
      a[i * 3 + 2] = c.b;
    }
    colorAttr.needsUpdate = true;
  }

  // ── Tooltip ──────────────────────────────────────────────────────
  function showTip(i: number, cx: number, cy: number) {
    const m = data!.meta[i];
    const clusterLabel = m.c !== undefined && m.c >= 0
      ? CLUSTER_NAMES[m.c] ?? `Cluster ${m.c}`
      : m.c === -1 ? 'Noise' : '';
    const clusterBadge = clusterLabel
      ? `<span style="font-size:0.7rem;color:#94a3b8;margin-left:auto">${clusterLabel}</span>`
      : '';
    tooltip.innerHTML = `
      <div class="de3d-tooltip-meta">
        <span class="de3d-tooltip-badge ${m.s}">${m.s === 'pos' ? 'Positive' : 'Negative'}</span>
        <span>${m.r}/10</span>
        ${clusterBadge}
      </div>
      <div class="de3d-tooltip-text">"${m.t}"</div>`;
    tooltip.classList.add('visible');
    let left = cx + 16, top = cy - 20;
    if (left + 340 > window.innerWidth) left = cx - 340;
    if (top + 140 > window.innerHeight) top = cy - 140;
    if (top < 8) top = 8;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top + 'px';
  }
  function hideTip() { tooltip.classList.remove('visible'); }

  // ── Hover ────────────────────────────────────────────────────────
  function onPointerMove(e: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (!points || !hlAttr) return;
    const hits = raycaster.intersectObject(points);

    // clear old
    if (hovIdx >= 0) {
      (hlAttr.array as Float32Array)[hovIdx] = 0;
      hlAttr.needsUpdate = true;
    }

    if (hits.length && hits[0].index !== undefined) {
      hovIdx = hits[0].index;
      (hlAttr.array as Float32Array)[hovIdx] = 1;
      hlAttr.needsUpdate = true;
      showTip(hovIdx, e.clientX, e.clientY);
      renderer.domElement.style.cursor = 'pointer';
    } else {
      hovIdx = -1;
      hideTip();
      renderer.domElement.style.cursor = 'grab';
    }
  }
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerleave', () => { hideTip(); hovIdx = -1; });

  // ── Auto-rotate stops on first interaction ───────────────────────
  let interacted = false;
  controls.addEventListener('start', () => {
    if (!interacted) {
      interacted = true;
      controls.autoRotate = false;
      hint.style.opacity = '0';
    }
  });

  // ── Toolbar wiring ───────────────────────────────────────────────
  colorBySel.addEventListener('change', () => {
    colorMode = colorBySel.value as typeof colorMode;
    applyColors();
    updateLegend();
  });

  sizeRange.addEventListener('input', () => {
    if (mat) mat.uniforms.uSize.value = parseFloat(sizeRange.value);
  });

  // ── Zoom buttons (for trackpad users without a scroll wheel) ──────
  function zoomBy(factor: number) {
    // Move camera along the direction toward the controls target
    const dir = new THREE.Vector3().subVectors(
      camera.position, controls.target
    );
    dir.multiplyScalar(factor);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  }
  zoomInBtn.addEventListener('click',  () => zoomBy(0.8));
  zoomOutBtn.addEventListener('click', () => zoomBy(1.25));

  resetBtn.addEventListener('click', () => {
    camera.position.set(0, 0.3, 3);
    controls.target.set(0, 0, 0);
    controls.autoRotate = true;
    controls.update();
    interacted = false;
    hint.style.opacity = '1';
  });

  // ── Animation loop ───────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // ── Load data & build point cloud ────────────────────────────────
  fetch('/data/exploring-data/umap-3d.json')
    .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
    .then((d: PointData) => {
      data = d;

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position',
        new THREE.Float32BufferAttribute(d.positions, 3));

      const colors = new Float32Array(d.count * 3);
      colorAttr = new THREE.BufferAttribute(colors, 3);
      geo.setAttribute('pointColor', colorAttr);

      const hl = new Float32Array(d.count);
      hlAttr = new THREE.BufferAttribute(hl, 1);
      geo.setAttribute('highlight', hlAttr);

      mat = new THREE.ShaderMaterial({
        vertexShader:   VERT,
        fragmentShader: FRAG,
        uniforms: {
          uSize:  { value: parseFloat(sizeRange.value) },
          uScale: { value: pixelRatio },
        },
        transparent: true,
        depthWrite:  false,
      });

      applyColors();

      points = new THREE.Points(geo, mat);
      scene.add(points);

      loading.style.display = 'none';
      animate();
    })
    .catch(err => {
      loading.innerHTML =
        `<span style="color:#f87171">Failed to load data: ${err.message}</span>`;
    });
}
