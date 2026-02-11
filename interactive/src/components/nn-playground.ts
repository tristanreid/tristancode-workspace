/**
 * Component: NNPlayground
 *
 * An interactive widget that lets the reader:
 * - Choose a task (AND, OR, XOR)
 * - Choose a network architecture (single neuron vs hidden layer)
 * - Watch the network train step by step or continuously
 * - See weights and activations visualized in real time
 * - Watch the loss curve evolve
 * - See predictions in a truth table
 *
 * Styled via CSS custom properties from the active theme.
 */

import { NNEngine, TASKS } from '../nn-engine';
import type { TaskData, ForwardResult } from '../nn-engine';
import { NNViz } from '../nn-viz';
import * as d3 from 'd3';

// ─── Styles ──────────────────────────────────────────────────────────

const STYLES = /* css */ `
.nn-playground {
  font-family: var(--font-sans, system-ui, sans-serif);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary, #f1f5f9);
}

.nn-playground-header {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.nn-playground-header label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin-right: 0.25rem;
}

.nn-playground-select {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  background: var(--bg, #fff);
  color: var(--text, #0f172a);
  cursor: pointer;
}

.nn-playground-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--border, #cbd5e1);
  margin: 0 0.25rem;
}

.nn-playground-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

@media (max-width: 600px) {
  .nn-playground-body {
    grid-template-columns: 1fr;
  }
}

.nn-playground-viz-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nn-playground-right {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nn-playground-truth-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.nn-playground-truth-table th {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #94a3b8);
  padding: 0.35rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border, #cbd5e1);
}

.nn-playground-truth-table td {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  padding: 0.35rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border, #cbd5e1);
}

.nn-playground-truth-table td.nn-pred {
  font-weight: 700;
}

.nn-playground-pred-good {
  color: var(--accent, #0d9488);
}

.nn-playground-pred-bad {
  color: #ef4444;
}

.nn-playground-pred-meh {
  color: #f59e0b;
}

.nn-playground-loss-container {
  height: 80px;
  position: relative;
}

.nn-playground-loss-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.nn-playground-loss-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-secondary, #475569);
  float: right;
}

.nn-playground-loss-svg {
  display: block;
  width: 100%;
  height: 60px;
}

.nn-playground-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.nn-playground-btn {
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border, #cbd5e1);
  cursor: pointer;
  transition: all 0.15s ease;
}
.nn-playground-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.nn-playground-btn-primary {
  background: var(--accent, #0d9488);
  color: #fff;
  border-color: var(--accent, #0d9488);
}
.nn-playground-btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #0f766e);
  border-color: var(--accent-hover, #0f766e);
}

.nn-playground-btn-secondary {
  background: transparent;
  color: var(--text-secondary, #475569);
}
.nn-playground-btn-secondary:hover:not(:disabled) {
  background: var(--accent-glow, rgba(13,148,136,0.1));
  color: var(--text, #0f172a);
}

.nn-playground-epoch {
  font-family: var(--font-mono, monospace);
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  margin-left: auto;
}

.nn-playground-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-style: italic;
  margin-top: 0.25rem;
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

interface PlaygroundState {
  task: TaskData;
  architecture: number[];
  engine: NNEngine;
  viz: NNViz | null;
  lossHistory: number[];
  playing: boolean;
  animFrame: number | null;
  selectedSample: number; // which truth table row is highlighted in the viz
}

const ARCHITECTURES: Record<string, { label: string; layers: number[] }> = {
  'single': { label: '1 neuron (no hidden layer)', layers: [2, 1] },
  'hidden-4': { label: '4 hidden neurons', layers: [2, 4, 1] },
};

function createEngine(arch: number[]): NNEngine {
  return new NNEngine(arch, 2.0, 42);
}

// ─── Mount ───────────────────────────────────────────────────────────

export function mount(el: HTMLElement | null): void {
  if (!el) {
    console.error('nn-playground: mount element not found');
    return;
  }

  injectStyles();

  // ── Initial state ──────────────────────────────────────────────

  const state: PlaygroundState = {
    task: TASKS['xor'],
    architecture: ARCHITECTURES['hidden-4'].layers,
    engine: createEngine(ARCHITECTURES['hidden-4'].layers),
    viz: null,
    lossHistory: [],
    playing: false,
    animFrame: null,
    selectedSample: 0,
  };

  // ── Build DOM ──────────────────────────────────────────────────

  el.innerHTML = `
    <div class="nn-playground">
      <div class="nn-playground-header">
        <label>Task</label>
        <select class="nn-playground-select" data-control="task">
          <option value="and">AND</option>
          <option value="or">OR</option>
          <option value="xor" selected>XOR</option>
        </select>
        <div class="nn-playground-divider"></div>
        <label>Architecture</label>
        <select class="nn-playground-select" data-control="arch">
          <option value="single">No hidden layer</option>
          <option value="hidden-4" selected>4 hidden neurons</option>
        </select>
      </div>
      <div class="nn-playground-body">
        <div class="nn-playground-viz-container" data-el="viz"></div>
        <div class="nn-playground-right">
          <table class="nn-playground-truth-table">
            <thead>
              <tr><th>A</th><th>B</th><th>Expected</th><th>Prediction</th></tr>
            </thead>
            <tbody data-el="table-body"></tbody>
          </table>
          <div>
            <div class="nn-playground-loss-label">
              Loss
              <span class="nn-playground-loss-value" data-el="loss-value">—</span>
            </div>
            <div class="nn-playground-loss-container" data-el="loss-chart"></div>
          </div>
        </div>
      </div>
      <div class="nn-playground-controls">
        <button class="nn-playground-btn nn-playground-btn-secondary" data-action="step">Step</button>
        <button class="nn-playground-btn nn-playground-btn-primary" data-action="play">Train</button>
        <button class="nn-playground-btn nn-playground-btn-secondary" data-action="reset">Reset</button>
        <span class="nn-playground-epoch" data-el="epoch">Epoch 0</span>
      </div>
      <div class="nn-playground-hint" data-el="hint">Click on a row in the truth table to see activations for that input.</div>
    </div>
  `;

  // ── Element refs ───────────────────────────────────────────────

  const vizContainer = el.querySelector<HTMLElement>('[data-el="viz"]')!;
  const tableBody = el.querySelector<HTMLElement>('[data-el="table-body"]')!;
  const lossChart = el.querySelector<HTMLElement>('[data-el="loss-chart"]')!;
  const lossValue = el.querySelector<HTMLElement>('[data-el="loss-value"]')!;
  const epochLabel = el.querySelector<HTMLElement>('[data-el="epoch"]')!;
  const playBtn = el.querySelector<HTMLButtonElement>('[data-action="play"]')!;
  const stepBtn = el.querySelector<HTMLButtonElement>('[data-action="step"]')!;
  const resetBtn = el.querySelector<HTMLButtonElement>('[data-action="reset"]')!;
  const taskSelect = el.querySelector<HTMLSelectElement>('[data-control="task"]')!;
  const archSelect = el.querySelector<HTMLSelectElement>('[data-control="arch"]')!;

  // ── Loss chart setup ───────────────────────────────────────────

  const lossSvg = d3
    .select(lossChart)
    .append('svg')
    .attr('class', 'nn-playground-loss-svg')
    .attr('preserveAspectRatio', 'none');

  const lossPath = lossSvg
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', 'var(--accent, #0d9488)')
    .attr('stroke-width', 2);

  function updateLossChart(): void {
    const history = state.lossHistory;
    if (history.length < 2) {
      lossPath.attr('d', '');
      return;
    }

    const w = lossChart.clientWidth || 200;
    const h = 60;
    lossSvg.attr('viewBox', `0 0 ${w} ${h}`);

    const xScale = d3
      .scaleLinear()
      .domain([0, history.length - 1])
      .range([0, w]);
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.max(0.3, d3.max(history) ?? 0.3)])
      .range([h - 2, 2]);

    const line = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d));

    lossPath.attr('d', line(history));
  }

  // ── Truth table ────────────────────────────────────────────────

  function updateTable(forwards: ForwardResult[] | null): void {
    const task = state.task;
    let html = '';
    for (let i = 0; i < task.inputs.length; i++) {
      const inp = task.inputs[i];
      const expected = task.targets[i][0];

      let predText = '—';
      let predClass = '';
      if (forwards && forwards[i]) {
        const pred = forwards[i].output[0];
        predText = pred.toFixed(4);
        const error = Math.abs(pred - expected);
        if (error < 0.15) predClass = 'nn-playground-pred-good';
        else if (error < 0.35) predClass = 'nn-playground-pred-meh';
        else predClass = 'nn-playground-pred-bad';
      }

      const selected = i === state.selectedSample ? ' style="background: var(--accent-glow, rgba(13,148,136,0.08))"' : '';
      html += `<tr data-row="${i}"${selected}>
        <td>${inp[0]}</td>
        <td>${inp[1]}</td>
        <td>${expected}</td>
        <td class="nn-pred ${predClass}">${predText}</td>
      </tr>`;
    }
    tableBody.innerHTML = html;

    // Click handlers for rows
    tableBody.querySelectorAll('tr').forEach((tr) => {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => {
        const row = parseInt(tr.dataset.row ?? '0');
        state.selectedSample = row;
        showSampleActivations();
        updateTable(getForwards());
      });
    });
  }

  function getForwards(): ForwardResult[] {
    return state.task.inputs.map((inp) => state.engine.forward(inp));
  }

  // ── Visualization ──────────────────────────────────────────────

  function initViz(): void {
    vizContainer.innerHTML = '';
    const snap = state.engine.snapshot();
    const vizWidth = Math.min(vizContainer.clientWidth || 350, 400);
    state.viz = new NNViz(vizContainer, {
      width: vizWidth,
      height: 240,
      nodeRadius: 18,
      paddingX: 45,
      paddingY: 36,
    });
    state.viz.init(snap);
  }

  function showSampleActivations(): void {
    if (!state.viz) return;
    const input = state.task.inputs[state.selectedSample];
    const fwd = state.engine.forward(input);
    state.viz.updateActivations(fwd.activations);
  }

  // ── Training ───────────────────────────────────────────────────

  function doStep(): ForwardResult[] {
    const result = state.engine.trainStep(
      state.task.inputs,
      state.task.targets,
    );
    state.lossHistory.push(result.loss);
    return result.forwards;
  }

  function updateUI(forwards: ForwardResult[]): void {
    epochLabel.textContent = `Epoch ${state.engine.getEpoch()}`;
    const lastLoss = state.lossHistory[state.lossHistory.length - 1];
    lossValue.textContent = lastLoss !== undefined ? lastLoss.toFixed(6) : '—';
    updateTable(forwards);
    updateLossChart();
    if (state.viz) {
      state.viz.updateWeights(state.engine.snapshot());
      showSampleActivations();
    }
  }

  function step(): void {
    const forwards = doStep();
    updateUI(forwards);
  }

  function startPlaying(): void {
    if (state.playing) return;
    state.playing = true;
    playBtn.textContent = 'Pause';

    const stepsPerFrame = 10; // train 10 epochs per animation frame for speed

    function tick() {
      if (!state.playing) return;

      let forwards: ForwardResult[] = [];
      for (let i = 0; i < stepsPerFrame; i++) {
        forwards = doStep();
      }
      updateUI(forwards);

      // Stop if loss is very low
      const lastLoss = state.lossHistory[state.lossHistory.length - 1];
      if (lastLoss < 0.0001 || state.engine.getEpoch() > 50000) {
        stopPlaying();
        return;
      }

      state.animFrame = requestAnimationFrame(tick);
    }

    state.animFrame = requestAnimationFrame(tick);
  }

  function stopPlaying(): void {
    state.playing = false;
    playBtn.textContent = 'Train';
    if (state.animFrame !== null) {
      cancelAnimationFrame(state.animFrame);
      state.animFrame = null;
    }
  }

  function reset(): void {
    stopPlaying();
    state.engine = createEngine(state.architecture);
    state.lossHistory = [];
    state.selectedSample = 0;
    initViz();
    epochLabel.textContent = 'Epoch 0';
    lossValue.textContent = '—';
    lossPath.attr('d', '');
    updateTable(null);
    showSampleActivations();
  }

  // ── Event listeners ────────────────────────────────────────────

  stepBtn.addEventListener('click', step);

  playBtn.addEventListener('click', () => {
    if (state.playing) stopPlaying();
    else startPlaying();
  });

  resetBtn.addEventListener('click', reset);

  taskSelect.addEventListener('change', () => {
    state.task = TASKS[taskSelect.value];
    reset();
  });

  archSelect.addEventListener('change', () => {
    state.architecture = ARCHITECTURES[archSelect.value].layers;
    reset();
  });

  // ── Initial render ─────────────────────────────────────────────

  initViz();
  updateTable(null);
  showSampleActivations();
}
