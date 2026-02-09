/**
 * HyperLogLog Simulation Engine
 *
 * Pure TypeScript, zero DOM dependencies. Every interactive component
 * in the HLL blog series imports from here.
 *
 * The API is framed in the "coin-flipping crowd" metaphor used throughout
 * the blog series:
 *   - A "person" flips coins (generates a random binary string)
 *   - A "streak" is the number of tails before the first heads (leading zeros)
 *   - A "crowd" is a collection of people (unique items)
 *   - A "register" is a sub-crowd that tracks its own max streak
 */

// ─── Seeded PRNG ──────────────────────────────────────────────────────
// Mulberry32: fast, simple, 32-bit state, good enough for simulations.
// Every component that needs reproducible results uses this.

export function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Coin Flipping (Core Intuition) ──────────────────────────────────

/**
 * Simulate one person flipping a fair coin until they get heads.
 * Returns the number of tails before the first heads (the "streak").
 *
 * Equivalent to: generate a random binary string and count leading zeros.
 *
 * @param rng - Random number generator (0–1). Defaults to Math.random.
 */
export function flipUntilHeads(rng: () => number = Math.random): number {
  let tails = 0;
  while (rng() < 0.5) {
    tails++;
  }
  return tails;
}

/**
 * Simulate a crowd of `n` people each flipping coins.
 * Returns an array of streak lengths (one per person).
 */
export function simulateCrowd(
  n: number,
  rng: () => number = Math.random
): number[] {
  const streaks: number[] = new Array(n);
  for (let i = 0; i < n; i++) {
    streaks[i] = flipUntilHeads(rng);
  }
  return streaks;
}

// ─── Hashing ─────────────────────────────────────────────────────────
// We need a deterministic hash that maps any item to a uniform 32-bit integer.
// MurmurHash3_x86_32 is fast, well-distributed, and widely used in HLL
// implementations. This is a faithful port of Austin Appleby's reference
// implementation, processing strings as UTF-8 bytes in 4-byte blocks.
// It produces the same output as Python's mmh3.hash() (used in Part 4).

const _encoder = new TextEncoder();

/**
 * MurmurHash3_x86_32 hash of a string.
 * Processes the string as UTF-8 bytes, matching the standard reference
 * implementation. Returns an unsigned 32-bit integer.
 */
export function murmur3_32(key: string, seed: number = 0): number {
  const utf8 = _encoder.encode(key);
  const len = utf8.length;
  const nblocks = len >> 2; // number of 4-byte blocks

  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  // Process 4-byte blocks
  for (let i = 0; i < nblocks; i++) {
    let k1 =
      utf8[i * 4] |
      (utf8[i * 4 + 1] << 8) |
      (utf8[i * 4 + 2] << 16) |
      (utf8[i * 4 + 3] << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = (Math.imul(h1, 5) + 0xe6546b64) | 0;
  }

  // Process tail (remaining 1–3 bytes)
  const tail = nblocks * 4;
  let k1 = 0;

  switch (len & 3) {
    case 3:
      k1 ^= utf8[tail + 2] << 16;
    /* falls through */
    case 2:
      k1 ^= utf8[tail + 1] << 8;
    /* falls through */
    case 1:
      k1 ^= utf8[tail];
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  // Finalization mix (fmix32)
  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0; // ensure unsigned
}

/**
 * Count leading zeros of a 32-bit unsigned integer.
 * Uses the `bits` parameter to interpret only part of the word.
 *
 * In the coin-flip metaphor: "how many tails before the first heads?"
 */
export function countLeadingZeros32(x: number, bits: number = 32): number {
  if (x === 0) return bits;
  // Math.clz32 counts leading zeros of a 32-bit integer
  const clz = Math.clz32(x);
  // If we're only looking at `bits` bits (not all 32), adjust:
  // The top (32 - bits) bits are irrelevant, so subtract them.
  return Math.min(clz - (32 - bits), bits);
}

// ─── Single-Max Estimator (Flajolet–Martin) ──────────────────────────

/**
 * Given an array of streak lengths (leading-zero counts),
 * return the single-max estimate: 2^max(streaks).
 *
 * This is the simplest cardinality estimator — and the noisiest.
 */
export function singleMaxEstimate(streaks: number[]): number {
  if (streaks.length === 0) return 0;
  let max = 0;
  for (const s of streaks) {
    if (s > max) max = s;
  }
  return Math.pow(2, max);
}

// ─── HyperLogLog ─────────────────────────────────────────────────────

/**
 * The alpha_m bias-correction constant for HLL.
 * Depends on the number of registers m.
 */
export function alphaM(m: number): number {
  if (m === 16) return 0.673;
  if (m === 32) return 0.697;
  if (m === 64) return 0.709;
  return 0.7213 / (1 + 1.079 / m);
}

/**
 * Process an array of items through HLL and return the register values.
 *
 * In the coin-flip metaphor:
 *   - Each item is a person in the crowd
 *   - The lowest `p` bits of their hash determine which sub-crowd (register) they join
 *   - The remaining upper bits determine their streak (leading zeros)
 *   - Each register keeps only the longest streak seen
 *
 * @param items - Array of items (strings or numbers) to count
 * @param p - Number of bits for register index (m = 2^p registers)
 * @param seed - Hash seed (default 0)
 * @returns Array of m register values
 */
export function hllRegisters(
  items: (string | number)[],
  p: number,
  seed: number = 0
): number[] {
  const m = 1 << p;
  const registers = new Array<number>(m).fill(0);
  const mask = m - 1; // bitmask for the register index
  const valueBits = 32 - p; // remaining bits for the streak

  for (const item of items) {
    const key = typeof item === 'number' ? String(item) : item;
    const h = murmur3_32(key, seed);

    // Lowest p bits → register index (which sub-crowd?)
    const idx = h & mask;

    // Remaining upper bits → count leading zeros (L), then add 1 to get
    // ρ (the position of the first 1-bit, 1-indexed). This matches the
    // standard HLL convention: ρ=1 means the first bit is 1, ρ=2 means
    // 01..., etc. In coin-flip terms: L = tails before heads, ρ = L + 1.
    const w = h >>> p;
    const rho = countLeadingZeros32(w, valueBits) + 1;

    // Each register keeps the max ρ (the "record holder" of its sub-crowd)
    if (rho > registers[idx]) {
      registers[idx] = rho;
    }
  }

  return registers;
}

/**
 * Compute the HLL cardinality estimate from register values.
 *
 * Uses the harmonic mean of 2^(-M[j]) across all registers,
 * scaled by alpha_m * m^2. Includes the small-range correction
 * (linear counting) when many registers are empty.
 *
 * @param registers - Array of register values (max leading-zero counts)
 * @param p - Number of bits used for register index
 * @returns Estimated number of distinct items
 */
export function hllEstimate(registers: number[], p: number): number {
  const m = registers.length;
  const alpha = alphaM(m);

  // Harmonic mean indicator: sum of 2^(-M[j])
  let indicator = 0;
  let emptyRegisters = 0;
  for (const r of registers) {
    indicator += Math.pow(2, -r);
    if (r === 0) emptyRegisters++;
  }

  // Raw estimate
  let E = alpha * m * m / indicator;

  // Small-range correction: if estimate is small and there are empty registers,
  // use linear counting instead (more accurate for small cardinalities)
  if (E <= 2.5 * m && emptyRegisters > 0) {
    E = m * Math.log(m / emptyRegisters);
  }

  // Large-range correction (for 32-bit hash):
  // if E > 2^32 / 30, correct for hash collisions.
  // With 32-bit hashes this kicks in around ~143 million.
  const twoTo32 = 4294967296;
  if (E > twoTo32 / 30) {
    E = -twoTo32 * Math.log(1 - E / twoTo32);
  }

  return E;
}

/**
 * Full HLL pipeline: hash items → fill registers → estimate cardinality.
 *
 * @param items - Items to count
 * @param p - Register bits (m = 2^p)
 * @param seed - Hash seed
 * @returns Estimated distinct count
 */
export function hllCount(
  items: (string | number)[],
  p: number,
  seed: number = 0
): number {
  const registers = hllRegisters(items, p, seed);
  return hllEstimate(registers, p);
}

/**
 * Merge two HLL register arrays by taking the element-wise max.
 *
 * In the coin-flip metaphor: two sub-crowds that were tracked separately
 * can be combined — the record holder for each register is the person
 * with the longest streak from either group.
 */
export function mergeRegisters(a: number[], b: number[]): number[] {
  if (a.length !== b.length) {
    throw new Error(
      `Cannot merge registers of different sizes: ${a.length} vs ${b.length}`
    );
  }
  const merged = new Array<number>(a.length);
  for (let i = 0; i < a.length; i++) {
    merged[i] = Math.max(a[i], b[i]);
  }
  return merged;
}

// ─── Trial Runners (for interactive components) ──────────────────────
// These run many independent experiments and return arrays of estimates,
// which the visualization components render as histograms/distributions.

/**
 * Run many trials of the single-max estimator.
 *
 * Each trial: simulate a crowd of `n` people flipping coins,
 * take the max streak, return 2^max as the estimate.
 *
 * @param n - Crowd size (true distinct count)
 * @param trials - Number of independent trials
 * @param seed - PRNG seed for reproducibility
 * @returns Array of estimates (one per trial)
 */
export function singleMaxTrials(
  n: number,
  trials: number,
  seed: number = 42
): number[] {
  const rng = createRng(seed);
  const estimates: number[] = new Array(trials);

  for (let t = 0; t < trials; t++) {
    const streaks = simulateCrowd(n, rng);
    estimates[t] = singleMaxEstimate(streaks);
  }

  return estimates;
}

/**
 * Run many trials of the HLL estimator.
 *
 * Each trial: generate `n` unique items, run them through HLL with `p` bits,
 * return the estimate.
 *
 * @param n - Number of distinct items (true cardinality)
 * @param p - Register bits (m = 2^p)
 * @param trials - Number of independent trials
 * @param seed - Base seed (each trial uses seed + trialIndex)
 * @returns Array of estimates (one per trial)
 */
export function hllTrials(
  n: number,
  p: number,
  trials: number,
  seed: number = 42
): number[] {
  const estimates: number[] = new Array(trials);

  for (let t = 0; t < trials; t++) {
    // Each trial uses a different hash seed so the same items
    // produce different register assignments, simulating independent experiments
    const items = Array.from({ length: n }, (_, i) => i);
    estimates[t] = hllCount(items, p, seed + t);
  }

  return estimates;
}

// ─── Statistics Helpers ──────────────────────────────────────────────
// Used by components to display summary stats alongside visualizations.

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function harmonicMean(values: number[]): number {
  if (values.length === 0) return 0;
  let reciprocalSum = 0;
  for (const v of values) {
    if (v === 0) return 0; // harmonic mean undefined if any value is 0
    reciprocalSum += 1 / v;
  }
  return values.length / reciprocalSum;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let sumSq = 0;
  for (const v of values) {
    const d = v - m;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / (values.length - 1));
}

export function relativeError(estimate: number, truth: number): number {
  if (truth === 0) return estimate === 0 ? 0 : Infinity;
  return Math.abs(estimate - truth) / truth;
}

export function percentWithinError(
  estimates: number[],
  truth: number,
  errorFraction: number
): number {
  if (estimates.length === 0) return 0;
  let count = 0;
  for (const e of estimates) {
    if (relativeError(e, truth) <= errorFraction) count++;
  }
  return count / estimates.length;
}
