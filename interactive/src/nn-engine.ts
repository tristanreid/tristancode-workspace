/**
 * NNEngine — A minimal neural network engine for interactive demos.
 *
 * Implements a fully-connected feed-forward network with sigmoid activations.
 * Supports forward pass (with full activation capture), backpropagation,
 * and weight/bias inspection for visualization.
 *
 * All math is plain TypeScript — no dependencies.
 */

// ─── Activation functions ────────────────────────────────────────────

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
}

function sigmoidDerivative(output: number): number {
  return output * (1 - output);
}

// ─── Seeded RNG ──────────────────────────────────────────────────────

/** Simple mulberry32 PRNG for reproducible weight initialization. */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Types ───────────────────────────────────────────────────────────

export interface NNSnapshot {
  /** Weights for each layer. weights[l][i][j] = weight from neuron i in layer l to neuron j in layer l+1. */
  weights: number[][][];
  /** Biases for each layer. biases[l][j] = bias of neuron j in layer l+1. */
  biases: number[][];
  /** Layer sizes including input layer. */
  layerSizes: number[];
}

export interface ForwardResult {
  /** Activations at each layer (including input). activations[l][i]. */
  activations: number[][];
  /** Final output (same as activations[last]). */
  output: number[];
}

export interface TrainStepResult {
  /** Average loss over the batch. */
  loss: number;
  /** Forward results for each sample (for visualization). */
  forwards: ForwardResult[];
}

export interface TaskData {
  name: string;
  inputs: number[][];
  targets: number[][];
}

// ─── Predefined tasks ────────────────────────────────────────────────

export const TASKS: Record<string, TaskData> = {
  and: {
    name: 'AND',
    inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
    targets: [[0], [0], [0], [1]],
  },
  or: {
    name: 'OR',
    inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
    targets: [[0], [1], [1], [1]],
  },
  xor: {
    name: 'XOR',
    inputs: [[0, 0], [0, 1], [1, 0], [1, 1]],
    targets: [[0], [1], [1], [0]],
  },
};

// ─── Engine ──────────────────────────────────────────────────────────

export class NNEngine {
  /** Layer sizes (e.g., [2, 4, 1] for 2→4→1). */
  readonly layerSizes: number[];

  /** weights[l][i][j]: weight from neuron i in layer l to neuron j in layer l+1. */
  private weights: number[][][];

  /** biases[l][j]: bias of neuron j in layer l+1 (indexed from 0). */
  private biases: number[][];

  private learningRate: number;
  private epoch = 0;

  constructor(layerSizes: number[], learningRate = 2.0, seed = 42) {
    this.layerSizes = layerSizes;
    this.learningRate = learningRate;

    const rng = mulberry32(seed);

    // Initialize weights with small random values (Xavier-like)
    this.weights = [];
    this.biases = [];
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const fanIn = layerSizes[l];
      const fanOut = layerSizes[l + 1];
      const scale = Math.sqrt(2.0 / (fanIn + fanOut));
      const w: number[][] = [];
      for (let i = 0; i < fanIn; i++) {
        const row: number[] = [];
        for (let j = 0; j < fanOut; j++) {
          row.push((rng() * 2 - 1) * scale);
        }
        w.push(row);
      }
      this.weights.push(w);

      const b: number[] = [];
      for (let j = 0; j < fanOut; j++) {
        b.push(0);
      }
      this.biases.push(b);
    }
  }

  /** Current epoch (number of full training passes). */
  getEpoch(): number {
    return this.epoch;
  }

  /** Set the learning rate. */
  setLearningRate(lr: number): void {
    this.learningRate = lr;
  }

  /** Forward pass — returns activations at every layer. */
  forward(input: number[]): ForwardResult {
    const activations: number[][] = [input.slice()];

    let current = input;
    for (let l = 0; l < this.weights.length; l++) {
      const w = this.weights[l];
      const b = this.biases[l];
      const next: number[] = [];
      for (let j = 0; j < w[0].length; j++) {
        let sum = b[j];
        for (let i = 0; i < current.length; i++) {
          sum += current[i] * w[i][j];
        }
        next.push(sigmoid(sum));
      }
      activations.push(next);
      current = next;
    }

    return { activations, output: current };
  }

  /**
   * Train one epoch on the given data.
   * Performs full-batch gradient descent (accumulates gradients over all samples, then updates).
   */
  trainStep(inputs: number[][], targets: number[][]): TrainStepResult {
    const n = inputs.length;
    const numLayers = this.weights.length;

    // Accumulate gradients
    const dW: number[][][] = this.weights.map((w) =>
      w.map((row) => row.map(() => 0)),
    );
    const dB: number[][] = this.biases.map((b) => b.map(() => 0));

    let totalLoss = 0;
    const forwards: ForwardResult[] = [];

    for (let s = 0; s < n; s++) {
      // Forward pass
      const fwd = this.forward(inputs[s]);
      forwards.push(fwd);

      // Compute loss (MSE)
      const output = fwd.output;
      for (let j = 0; j < output.length; j++) {
        totalLoss += (targets[s][j] - output[j]) ** 2;
      }

      // Backward pass — compute deltas layer by layer
      const deltas: number[][] = [];

      // Output layer delta
      const outputDelta: number[] = [];
      for (let j = 0; j < output.length; j++) {
        outputDelta.push(
          (output[j] - targets[s][j]) * sigmoidDerivative(output[j]),
        );
      }
      deltas[numLayers - 1] = outputDelta;

      // Hidden layer deltas (backpropagation)
      for (let l = numLayers - 2; l >= 0; l--) {
        const layerAct = fwd.activations[l + 1]; // activation of this layer
        const nextDelta = deltas[l + 1];
        const w = this.weights[l + 1];
        const delta: number[] = [];
        for (let i = 0; i < layerAct.length; i++) {
          let sum = 0;
          for (let j = 0; j < nextDelta.length; j++) {
            sum += nextDelta[j] * w[i][j];
          }
          delta.push(sum * sigmoidDerivative(layerAct[i]));
        }
        deltas[l] = delta;
      }

      // Accumulate gradients
      for (let l = 0; l < numLayers; l++) {
        const layerInput = fwd.activations[l];
        const delta = deltas[l];
        for (let i = 0; i < layerInput.length; i++) {
          for (let j = 0; j < delta.length; j++) {
            dW[l][i][j] += layerInput[i] * delta[j];
          }
        }
        for (let j = 0; j < delta.length; j++) {
          dB[l][j] += delta[j];
        }
      }
    }

    // Update weights (average gradient)
    for (let l = 0; l < numLayers; l++) {
      for (let i = 0; i < this.weights[l].length; i++) {
        for (let j = 0; j < this.weights[l][i].length; j++) {
          this.weights[l][i][j] -= this.learningRate * (dW[l][i][j] / n);
        }
      }
      for (let j = 0; j < this.biases[l].length; j++) {
        this.biases[l][j] -= this.learningRate * (dB[l][j] / n);
      }
    }

    this.epoch++;

    return {
      loss: totalLoss / n,
      forwards,
    };
  }

  /** Get a snapshot of the network state for visualization. */
  snapshot(): NNSnapshot {
    return {
      weights: this.weights.map((w) => w.map((row) => row.slice())),
      biases: this.biases.map((b) => b.slice()),
      layerSizes: this.layerSizes.slice(),
    };
  }
}
