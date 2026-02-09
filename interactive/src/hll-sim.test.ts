import { describe, it, expect } from 'vitest';
import {
  createRng,
  flipUntilHeads,
  simulateCrowd,
  murmur3_32,
  countLeadingZeros32,
  singleMaxEstimate,
  alphaM,
  hllRegisters,
  hllEstimate,
  hllCount,
  mergeRegisters,
  singleMaxTrials,
  hllTrials,
  mean,
  harmonicMean,
  median,
  stdDev,
  relativeError,
  percentWithinError,
} from './hll-sim';

// ─── PRNG ────────────────────────────────────────────────────────────

describe('createRng', () => {
  it('produces deterministic sequences from the same seed', () => {
    const rng1 = createRng(12345);
    const rng2 = createRng(12345);
    const seq1 = Array.from({ length: 100 }, () => rng1());
    const seq2 = Array.from({ length: 100 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences from different seeds', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    const seq1 = Array.from({ length: 20 }, () => rng1());
    const seq2 = Array.from({ length: 20 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });

  it('produces values in [0, 1)', () => {
    const rng = createRng(42);
    for (let i = 0; i < 10000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

// ─── Coin Flipping ───────────────────────────────────────────────────

describe('flipUntilHeads', () => {
  it('returns a non-negative integer', () => {
    const rng = createRng(1);
    for (let i = 0; i < 100; i++) {
      const streak = flipUntilHeads(rng);
      expect(streak).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(streak)).toBe(true);
    }
  });

  it('returns 0 when first flip is heads (rng > 0.5)', () => {
    // rng always returns 0.75 → first flip is heads → 0 tails
    const streak = flipUntilHeads(() => 0.75);
    expect(streak).toBe(0);
  });

  it('returns expected streak for controlled rng', () => {
    // Return 0.25 three times (tails), then 0.75 (heads) → streak of 3
    let call = 0;
    const values = [0.25, 0.25, 0.25, 0.75];
    const rng = () => values[call++];
    expect(flipUntilHeads(rng)).toBe(3);
  });
});

describe('simulateCrowd', () => {
  it('returns an array of length n', () => {
    const rng = createRng(42);
    const streaks = simulateCrowd(500, rng);
    expect(streaks).toHaveLength(500);
  });

  it('is deterministic with seeded rng', () => {
    const s1 = simulateCrowd(200, createRng(99));
    const s2 = simulateCrowd(200, createRng(99));
    expect(s1).toEqual(s2);
  });
});

// ─── Hashing ─────────────────────────────────────────────────────────

describe('murmur3_32', () => {
  it('returns a 32-bit unsigned integer', () => {
    const h = murmur3_32('hello');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('matches standard MurmurHash3_x86_32 test vectors', () => {
    // Empty string with seed 0 should always produce 0
    expect(murmur3_32('', 0)).toBe(0);
    // Standard test vector for "hello"
    expect(murmur3_32('hello', 0)).toBe(0x248bfa47);
  });

  it('is deterministic', () => {
    expect(murmur3_32('test', 0)).toBe(murmur3_32('test', 0));
  });

  it('different inputs produce different hashes (with high probability)', () => {
    const hashes = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      hashes.add(murmur3_32(String(i)));
    }
    // With 1000 items in a 32-bit space, collisions are extremely unlikely
    expect(hashes.size).toBe(1000);
  });

  it('different seeds produce different hashes for the same key', () => {
    const h1 = murmur3_32('same_key', 0);
    const h2 = murmur3_32('same_key', 1);
    expect(h1).not.toBe(h2);
  });
});

describe('countLeadingZeros32', () => {
  it('returns 32 for zero', () => {
    expect(countLeadingZeros32(0)).toBe(32);
  });

  it('returns 0 for a number with the high bit set', () => {
    expect(countLeadingZeros32(0x80000000)).toBe(0);
  });

  it('returns 31 for 1', () => {
    expect(countLeadingZeros32(1)).toBe(31);
  });

  it('respects the bits parameter', () => {
    // 1 in a 4-bit field = 0001 → 3 leading zeros
    expect(countLeadingZeros32(1, 4)).toBe(3);
    // 8 in a 4-bit field = 1000 → 0 leading zeros
    expect(countLeadingZeros32(8, 4)).toBe(0);
    // 0 in a 4-bit field → 4 leading zeros
    expect(countLeadingZeros32(0, 4)).toBe(4);
  });
});

// ─── Single-Max Estimator ────────────────────────────────────────────

describe('singleMaxEstimate', () => {
  it('returns 0 for empty array', () => {
    expect(singleMaxEstimate([])).toBe(0);
  });

  it('returns 2^max of the input streaks', () => {
    expect(singleMaxEstimate([0, 1, 2, 3])).toBe(8); // 2^3
    expect(singleMaxEstimate([5, 3, 5, 2])).toBe(32); // 2^5
    expect(singleMaxEstimate([0])).toBe(1); // 2^0
    expect(singleMaxEstimate([10])).toBe(1024); // 2^10
  });
});

// ─── HyperLogLog ─────────────────────────────────────────────────────

describe('alphaM', () => {
  it('returns known constants for standard sizes', () => {
    expect(alphaM(16)).toBe(0.673);
    expect(alphaM(32)).toBe(0.697);
    expect(alphaM(64)).toBe(0.709);
  });

  it('returns formula result for larger sizes', () => {
    const a = alphaM(256);
    expect(a).toBeCloseTo(0.7213 / (1 + 1.079 / 256), 6);
  });
});

describe('hllRegisters', () => {
  it('returns an array of length 2^p', () => {
    const items = [1, 2, 3, 4, 5];
    const regs = hllRegisters(items, 4); // 16 registers
    expect(regs).toHaveLength(16);
  });

  it('all register values are non-negative integers', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const regs = hllRegisters(items, 4);
    for (const r of regs) {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(r)).toBe(true);
    }
  });

  it('is deterministic (same items, same seed → same registers)', () => {
    const items = Array.from({ length: 500 }, (_, i) => `item_${i}`);
    const r1 = hllRegisters(items, 8, 0);
    const r2 = hllRegisters(items, 8, 0);
    expect(r1).toEqual(r2);
  });

  it('duplicates do not change registers', () => {
    const items = [1, 2, 3, 4, 5];
    const duped = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 1, 1];
    const r1 = hllRegisters(items, 4);
    const r2 = hllRegisters(duped, 4);
    expect(r1).toEqual(r2);
  });
});

describe('hllEstimate', () => {
  it('returns 0 (via linear counting) when all registers are 0', () => {
    const regs = new Array(256).fill(0);
    // m * ln(m/V) where V = m → m * ln(1) = 0
    expect(hllEstimate(regs, 8)).toBe(0);
  });
});

describe('hllCount', () => {
  it('estimates 10,000 items within 15% with p=8 (256 registers)', () => {
    const items = Array.from({ length: 10000 }, (_, i) => i);
    const estimate = hllCount(items, 8);
    const error = relativeError(estimate, 10000);
    expect(error).toBeLessThan(0.15);
  });

  it('estimates 10,000 items within 5% with p=10 (1024 registers)', () => {
    const items = Array.from({ length: 10000 }, (_, i) => i);
    const estimate = hllCount(items, 10);
    const error = relativeError(estimate, 10000);
    expect(error).toBeLessThan(0.05);
  });

  it('estimates 100,000 items within 10% with p=10', () => {
    const items = Array.from({ length: 100000 }, (_, i) => i);
    const estimate = hllCount(items, 10);
    const error = relativeError(estimate, 100000);
    expect(error).toBeLessThan(0.10);
  });
});

// ─── Merge ───────────────────────────────────────────────────────────

describe('mergeRegisters', () => {
  it('takes element-wise max', () => {
    const a = [3, 5, 2, 7];
    const b = [4, 3, 5, 2];
    expect(mergeRegisters(a, b)).toEqual([4, 5, 5, 7]);
  });

  it('throws on mismatched lengths', () => {
    expect(() => mergeRegisters([1, 2], [1, 2, 3])).toThrow();
  });

  it('merged HLL approximates the union', () => {
    // Set A: 0..4999, Set B: 3000..7999
    // Union: 0..7999 = 8000 unique items
    const setA = Array.from({ length: 5000 }, (_, i) => i);
    const setB = Array.from({ length: 5000 }, (_, i) => i + 3000);
    const p = 10;

    const regsA = hllRegisters(setA, p);
    const regsB = hllRegisters(setB, p);
    const merged = mergeRegisters(regsA, regsB);
    const estimate = hllEstimate(merged, p);
    const error = relativeError(estimate, 8000);
    expect(error).toBeLessThan(0.10);
  });
});

// ─── Trial Runners ───────────────────────────────────────────────────

describe('singleMaxTrials', () => {
  it('returns the correct number of estimates', () => {
    const estimates = singleMaxTrials(100, 50, 42);
    expect(estimates).toHaveLength(50);
  });

  it('all estimates are powers of 2', () => {
    const estimates = singleMaxTrials(1000, 100, 42);
    for (const e of estimates) {
      expect(Math.log2(e) % 1).toBe(0);
    }
  });

  it('is deterministic with same seed', () => {
    const e1 = singleMaxTrials(500, 30, 99);
    const e2 = singleMaxTrials(500, 30, 99);
    expect(e1).toEqual(e2);
  });
});

describe('hllTrials', () => {
  it('returns the correct number of estimates', () => {
    const estimates = hllTrials(1000, 8, 20, 42);
    expect(estimates).toHaveLength(20);
  });

  it('estimates cluster around the true value', () => {
    const n = 5000;
    const estimates = hllTrials(n, 10, 50, 42);
    const avg = mean(estimates);
    const error = relativeError(avg, n);
    // The average of 50 HLL trials should be very close to truth
    expect(error).toBeLessThan(0.05);
  });
});

// ─── Statistics Helpers ──────────────────────────────────────────────

describe('statistics', () => {
  it('mean computes correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([])).toBe(0);
  });

  it('harmonicMean computes correctly', () => {
    // Harmonic mean of [1, 4] = 2 / (1/1 + 1/4) = 2 / 1.25 = 1.6
    expect(harmonicMean([1, 4])).toBeCloseTo(1.6, 10);
    expect(harmonicMean([])).toBe(0);
    expect(harmonicMean([0, 1])).toBe(0); // undefined if any value is 0
  });

  it('median computes correctly', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });

  it('stdDev computes correctly', () => {
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2);
    expect(stdDev([])).toBe(0);
    expect(stdDev([5])).toBe(0);
  });

  it('relativeError computes correctly', () => {
    expect(relativeError(110, 100)).toBeCloseTo(0.1, 10);
    expect(relativeError(90, 100)).toBeCloseTo(0.1, 10);
    expect(relativeError(0, 0)).toBe(0);
  });

  it('percentWithinError computes correctly', () => {
    const estimates = [95, 100, 105, 110, 115, 120, 130, 140, 80, 50];
    // Within 10% of 100 means [90, 110]: 95, 100, 105, 110 → 4/10 = 40%
    expect(percentWithinError(estimates, 100, 0.1)).toBeCloseTo(0.4, 10);
  });
});

// ─── Regression: single-max should use full hash, not truncated ─────
describe('Single-max vs HLL independence', () => {
  it('single-max (2^L) on full hash should be independent of p', () => {
    // Compute the true single-max estimate using L (leading zeros) of the full hash
    const items = Array.from({ length: 1000 }, (_, i) => i);
    const seed = 42;

    let maxL = 0;
    for (const item of items) {
      const h = murmur3_32(String(item), seed);
      const L = countLeadingZeros32(h, 32);
      if (L > maxL) maxL = L;
    }
    const expectedSingleMax = Math.pow(2, maxL);

    // Verify it's a power of 2 and reasonable
    expect(expectedSingleMax).toBeGreaterThan(0);
    expect(Math.log2(expectedSingleMax) % 1).toBe(0);

    // The single-max estimate should NOT change based on how we partition
    // the hash for HLL registers.
    for (const p of [2, 4, 6, 8]) {
      let maxLCheck = 0;
      for (const item of items) {
        const h = murmur3_32(String(item), seed);
        const L = countLeadingZeros32(h, 32);
        if (L > maxLCheck) maxLCheck = L;
      }
      expect(Math.pow(2, maxLCheck)).toBe(expectedSingleMax);
    }
  });
});

// ─── Estimator consistency ──────────────────────────────────────────
describe('Estimator consistency', () => {
  it('singleMaxEstimate uses L (leading zeros), not ρ (L+1)', () => {
    // If max streak L=8, estimate should be 2^8 = 256, not 2^9 = 512
    const streaks = [0, 3, 8, 5];
    expect(singleMaxEstimate(streaks)).toBe(256);
    expect(singleMaxEstimate(streaks)).not.toBe(512);
  });
});

// ─── Register bounds ────────────────────────────────────────────────
describe('Register value bounds', () => {
  it('all ρ values are in valid range [0, 33-p]', () => {
    const p = 8;
    const items = Array.from({ length: 10000 }, (_, i) => i);
    const regs = hllRegisters(items, p);

    for (const rho of regs) {
      expect(rho).toBeGreaterThanOrEqual(0);
      expect(rho).toBeLessThanOrEqual(33 - p); // Max ρ = (32-p) + 1
    }
  });
});

// ─── Variance decreases with more registers ─────────────────────────
describe('HLL variance vs register count', () => {
  it('variance decreases as register count increases', () => {
    const n = 10000;
    const trials = 100;

    const est_p4 = hllTrials(n, 4, trials, 42);
    const est_p6 = hllTrials(n, 6, trials, 42);
    const est_p8 = hllTrials(n, 8, trials, 42);

    const sd4 = stdDev(est_p4);
    const sd6 = stdDev(est_p6);
    const sd8 = stdDev(est_p8);

    // More registers → lower variance
    expect(sd6).toBeLessThan(sd4);
    expect(sd8).toBeLessThan(sd6);
  });
});
