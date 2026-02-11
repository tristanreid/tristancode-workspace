import { describe, it, expect } from 'vitest';
import { NNEngine, TASKS } from './nn-engine';

// ─── Constructor ─────────────────────────────────────────────────────

describe('NNEngine constructor', () => {
  it('stores layer sizes correctly', () => {
    const engine = new NNEngine([2, 4, 1]);
    expect(engine.layerSizes).toEqual([2, 4, 1]);
  });

  it('initializes at epoch 0', () => {
    const engine = new NNEngine([2, 4, 1]);
    expect(engine.getEpoch()).toBe(0);
  });

  it('produces a snapshot with correct dimensions', () => {
    const engine = new NNEngine([2, 4, 1]);
    const snap = engine.snapshot();
    expect(snap.layerSizes).toEqual([2, 4, 1]);
    expect(snap.weights.length).toBe(2); // 2 layers of weights
    expect(snap.weights[0].length).toBe(2); // 2 inputs
    expect(snap.weights[0][0].length).toBe(4); // 4 hidden neurons
    expect(snap.weights[1].length).toBe(4); // 4 hidden neurons
    expect(snap.weights[1][0].length).toBe(1); // 1 output
    expect(snap.biases.length).toBe(2);
    expect(snap.biases[0].length).toBe(4);
    expect(snap.biases[1].length).toBe(1);
  });

  it('uses deterministic initialization from same seed', () => {
    const a = new NNEngine([2, 4, 1], 2.0, 42);
    const b = new NNEngine([2, 4, 1], 2.0, 42);
    expect(a.snapshot().weights).toEqual(b.snapshot().weights);
    expect(a.snapshot().biases).toEqual(b.snapshot().biases);
  });

  it('produces different weights from different seeds', () => {
    const a = new NNEngine([2, 4, 1], 2.0, 1);
    const b = new NNEngine([2, 4, 1], 2.0, 2);
    expect(a.snapshot().weights).not.toEqual(b.snapshot().weights);
  });
});

// ─── Forward pass ────────────────────────────────────────────────────

describe('forward', () => {
  it('returns correct number of activation layers', () => {
    const engine = new NNEngine([2, 4, 1]);
    const result = engine.forward([0, 0]);
    // Input + hidden + output = 3 layers
    expect(result.activations.length).toBe(3);
    expect(result.activations[0]).toEqual([0, 0]); // input layer
    expect(result.activations[1].length).toBe(4); // hidden layer
    expect(result.activations[2].length).toBe(1); // output layer
    expect(result.output.length).toBe(1);
  });

  it('returns activations in [0, 1] for sigmoid', () => {
    const engine = new NNEngine([2, 8, 4, 1]);
    const inputs = [[0, 0], [0, 1], [1, 0], [1, 1], [0.5, 0.5]];
    for (const input of inputs) {
      const result = engine.forward(input);
      for (const layer of result.activations.slice(1)) {
        // Skip input layer
        for (const val of layer) {
          expect(val).toBeGreaterThan(0);
          expect(val).toBeLessThan(1);
        }
      }
    }
  });

  it('is deterministic for the same input', () => {
    const engine = new NNEngine([2, 4, 1], 2.0, 42);
    const r1 = engine.forward([0.5, 0.7]);
    const r2 = engine.forward([0.5, 0.7]);
    expect(r1.output).toEqual(r2.output);
  });
});

// ─── Training ────────────────────────────────────────────────────────

describe('trainStep', () => {
  it('increments epoch counter', () => {
    const engine = new NNEngine([2, 4, 1]);
    expect(engine.getEpoch()).toBe(0);
    engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    expect(engine.getEpoch()).toBe(1);
    engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    expect(engine.getEpoch()).toBe(2);
  });

  it('returns loss and forward results', () => {
    const engine = new NNEngine([2, 4, 1]);
    const result = engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    expect(typeof result.loss).toBe('number');
    expect(result.loss).toBeGreaterThan(0);
    expect(result.forwards.length).toBe(4); // 4 samples in AND
  });

  it('reduces loss over training', () => {
    const engine = new NNEngine([2, 4, 1], 2.0, 42);
    const first = engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    for (let i = 0; i < 99; i++) {
      engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    }
    const last = engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    expect(last.loss).toBeLessThan(first.loss);
  });
});

// ─── Learning AND ────────────────────────────────────────────────────

describe('learning AND gate', () => {
  it('learns AND with a single neuron', () => {
    const engine = new NNEngine([2, 1], 2.0, 42);
    for (let i = 0; i < 1000; i++) {
      engine.trainStep(TASKS.and.inputs, TASKS.and.targets);
    }

    // Check predictions
    const pred00 = engine.forward([0, 0]).output[0];
    const pred01 = engine.forward([0, 1]).output[0];
    const pred10 = engine.forward([1, 0]).output[0];
    const pred11 = engine.forward([1, 1]).output[0];

    expect(pred00).toBeLessThan(0.1);
    expect(pred01).toBeLessThan(0.2);
    expect(pred10).toBeLessThan(0.2);
    expect(pred11).toBeGreaterThan(0.8);
  });
});

// ─── XOR impossibility ──────────────────────────────────────────────

describe('XOR impossibility (single neuron)', () => {
  it('fails to learn XOR with no hidden layer', () => {
    const engine = new NNEngine([2, 1], 2.0, 42);
    for (let i = 0; i < 2000; i++) {
      engine.trainStep(TASKS.xor.inputs, TASKS.xor.targets);
    }

    const result = engine.trainStep(TASKS.xor.inputs, TASKS.xor.targets);
    // Loss should still be high (> 0.2 means it hasn't learned)
    expect(result.loss).toBeGreaterThan(0.2);

    // All predictions should be near 0.5 (confused)
    for (const input of TASKS.xor.inputs) {
      const pred = engine.forward(input).output[0];
      expect(pred).toBeGreaterThan(0.3);
      expect(pred).toBeLessThan(0.7);
    }
  });
});

// ─── XOR with hidden layer ──────────────────────────────────────────

describe('XOR with hidden layer', () => {
  it('solves XOR with a hidden layer', () => {
    const engine = new NNEngine([2, 4, 1], 2.0, 42);
    for (let i = 0; i < 5000; i++) {
      engine.trainStep(TASKS.xor.inputs, TASKS.xor.targets);
    }

    const result = engine.trainStep(TASKS.xor.inputs, TASKS.xor.targets);
    expect(result.loss).toBeLessThan(0.01);

    const pred00 = engine.forward([0, 0]).output[0];
    const pred01 = engine.forward([0, 1]).output[0];
    const pred10 = engine.forward([1, 0]).output[0];
    const pred11 = engine.forward([1, 1]).output[0];

    expect(pred00).toBeLessThan(0.1); // expected 0
    expect(pred01).toBeGreaterThan(0.9); // expected 1
    expect(pred10).toBeGreaterThan(0.9); // expected 1
    expect(pred11).toBeLessThan(0.1); // expected 0
  });
});

// ─── Predefined tasks ────────────────────────────────────────────────

describe('TASKS', () => {
  it('has AND, OR, and XOR', () => {
    expect(TASKS.and).toBeDefined();
    expect(TASKS.or).toBeDefined();
    expect(TASKS.xor).toBeDefined();
  });

  it('each task has 4 input/target pairs with correct shapes', () => {
    for (const task of Object.values(TASKS)) {
      expect(task.inputs.length).toBe(4);
      expect(task.targets.length).toBe(4);
      for (const input of task.inputs) {
        expect(input.length).toBe(2);
      }
      for (const target of task.targets) {
        expect(target.length).toBe(1);
      }
    }
  });
});
