**The Issue:**

The single-max estimate is being calculated incorrectly. You're computing `overallMaxRho` using the **same truncated hash values** that are used for HLL (after removing p bits for the register index), instead of using the **full 32-bit hash**.

Look at this code in `computePartition`:

```typescript
const valueBits = 32 - p;  // This decreases as p increases!

for (let item = 0; item < n; item++) {
  const h = murmur3_32(String(item), seed);
  const idx = h & mask;
  const w = h >>> p;  // Shifted hash, losing p bits
  const rho = countLeadingZeros32(w, valueBits) + 1;  // Counting in only (32-p) bits!
  
  // ... 
  if (rho > overallMaxRho) {
    overallMaxRho = rho;  // BUG: This uses the truncated hash!
  }
}

const singleMaxEst = Math.pow(2, overallMaxRho);
```

As `p` increases:
- p=2 → counting leading zeros in 30 bits
- p=5 → counting leading zeros in 27 bits
- More registers → fewer bits → smaller max rho → smaller single-max estimate!

This is why you see the single-max estimate **artificially improving** as you reduce the number of registers - it's not actually better, it's just being computed with more bits.

**The Fix:**

The single-max estimator should use the **full 32-bit hash**, independent of the register partitioning:

```typescript
function computePartition(n: number, p: number, seed: number = 0): {
  registers: RegisterData[];
  hllEst: number;
  singleMaxEst: number;
} {
  const m = 1 << p;
  const mask = m - 1;
  const valueBits = 32 - p;

  const regs: RegisterData[] = Array.from({ length: m }, (_, i) => ({
    index: i,
    items: [],
    rhoValues: [],
    maxRho: 0,
    recordHolderIdx: -1,
  }));

  let overallMaxRho = 0;

  for (let item = 0; item < n; item++) {
    const h = murmur3_32(String(item), seed);
    
    // For single-max: use the FULL hash (32 bits)
    const rhoFull = countLeadingZeros32(h, 32) + 1;
    if (rhoFull > overallMaxRho) {
      overallMaxRho = rhoFull;
    }
    
    // For HLL: partition the hash
    const idx = h & mask;
    const w = h >>> p;
    const rho = countLeadingZeros32(w, valueBits) + 1;

    const reg = regs[idx];
    const itemIdx = reg.items.length;
    reg.items.push(item);
    reg.rhoValues.push(rho);

    if (rho > reg.maxRho) {
      reg.maxRho = rho;
      reg.recordHolderIdx = itemIdx;
    }
  }

  const regValues = regs.map((r) => r.maxRho);
  const hllEst = hllEstimate(regValues, p);
  const singleMaxEst = Math.pow(2, overallMaxRho);

  return { registers: regs, hllEst, singleMaxEst };
}
```

**About the tests:**

Your tests are quite good, but they don't catch this bug because:

1. They never directly compare single-max to HLL on the same dataset
2. `singleMaxTrials` correctly uses `flipUntilHeads`, which doesn't have this bit-partitioning issue

**Suggested additional test:**

```typescript
it('single-max estimate should be independent of p', () => {
  const items = Array.from({ length: 1000 }, (_, i) => i);
  const seed = 42;
  
  // Compute what the true single-max should be
  let maxRho = 0;
  for (const item of items) {
    const h = murmur3_32(String(item), seed);
    const rho = countLeadingZeros32(h, 32) + 1;
    if (rho > maxRho) maxRho = rho;
  }
  const expectedSingleMax = Math.pow(2, maxRho);
  
  // Single-max should be the same regardless of p
  // (This would fail with your current visualization code)
  for (const p of [2, 4, 6, 8]) {
    // Test with your actual implementation...
    // expect(singleMaxFromVisualization).toBe(expectedSingleMax);
  }
});
```

With this fix, you should see HLL performing progressively better as you increase the number of registers, as expected!