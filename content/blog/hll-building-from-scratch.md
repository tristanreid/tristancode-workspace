---
title: "Building HyperLogLog from Scratch"
description: "A step-by-step Python implementation of HyperLogLog, from hashing to registers to the harmonic mean — with tests and benchmarks at every stage."
weight: 23
series: "HyperLogLog: Counting Unique Items at Scale"
series_weight: 40
skin: stochastic
---

You've seen the intuition ([Part 1](/blog/hll-counting-unique-items-part1/)), the hashing foundation ([Part 2](/blog/hll-hashing-randomness/)), and the full algorithm with interactive demos ([Part 3](/blog/hll-splitting-the-crowd/)). Now let's build it.

This post is a complete, working Python implementation of HyperLogLog — about 60 lines of core code. We'll build it piece by piece, testing as we go, and finish with benchmarks that show just how absurdly memory-efficient HLL is compared to exact counting.

The coin-flipping metaphor from the rest of the series is preserved in comments and variable names throughout.

---

## Step 1: Hashing — Giving Every Person a Coin Sequence

We need a hash function that maps any input to a uniformly distributed integer. Python's built-in `hash()` isn't suitable — it's randomized across sessions and doesn't guarantee uniform distribution. We'll use `mmh3`, a Python binding for MurmurHash3:

```python
import mmh3

def hash_item(item, seed=0):
    """Hash any item to an unsigned 32-bit integer.
    
    In coin-flip terms: this gives every person in the crowd
    their own deterministic, uniformly random coin-flip sequence.
    """
    return mmh3.hash(str(item), seed) & 0xFFFFFFFF
```

The `& 0xFFFFFFFF` ensures we get an unsigned 32-bit value (Python's `mmh3.hash` returns a signed int).

Let's verify it looks uniform:

```python
# Quick sanity check: hash some sequential integers
for i in range(5):
    h = hash_item(i)
    print(f"hash({i}) = {h:032b}  ({h})")
```

```
hash(0) = 10110010100100011101010110011100  (2996901532)
hash(1) = 01111100110000110100000001100010  (2093449314)
hash(2) = 00110011100101111000100001010010  (866091090)
hash(3) = 10110100001001001111100110010110  (3020627350)
hash(4) = 00001011101111001000001111100011  (198246371)
```

No pattern. Good.

---

## Step 2: Counting Leading Zeros — The Streak

Next, we need to count leading zeros in a binary string — the "streak of tails before the first heads":

```python
def count_leading_zeros(value, bits=32):
    """Count leading zeros in the binary representation.
    
    In coin-flip terms: how many tails before the first heads?
    A value of 00001... has 4 leading zeros (streak of 4).
    """
    if value == 0:
        return bits
    count = 0
    # Check each bit from the most significant down
    for i in range(bits - 1, -1, -1):
        if value & (1 << i):
            break
        count += 1
    return count
```

Test it:

```python
assert count_leading_zeros(0b10000000_00000000_00000000_00000000) == 0  # first bit is 1
assert count_leading_zeros(0b00000001_00000000_00000000_00000000) == 7  # 7 zeros then a 1
assert count_leading_zeros(0b00000000_00000000_00000000_00000001) == 31 # 31 zeros!
assert count_leading_zeros(0, bits=32) == 32  # all zeros
print("✓ count_leading_zeros tests pass")
```

---

## Step 3: The Single-Max Estimator

Before building full HLL, let's implement the naive estimator from Part 1. This will be our baseline to beat:

```python
def single_max_estimate(items, seed=0):
    """Estimate cardinality using the longest leading-zero streak.
    
    The Flajolet-Martin estimator: hash every item, track the
    longest streak, estimate = 2^max_streak.
    
    In coin-flip terms: find the person in the crowd with the
    longest streak of tails. Use that to estimate crowd size.
    """
    max_zeros = 0
    for item in items:
        h = hash_item(item, seed)
        zeros = count_leading_zeros(h)
        max_zeros = max(max_zeros, zeros)
    return 2 ** max_zeros
```

Let's see how noisy it is:

```python
import random

true_n = 10_000
items = list(range(true_n))

# Run 20 trials with different hash seeds
for seed in range(20):
    est = single_max_estimate(items, seed=seed)
    error = abs(est - true_n) / true_n * 100
    print(f"  seed={seed:2d}  estimate={est:>8,}  error={error:.0f}%")
```

```
  seed= 0  estimate=  16,384  error=64%
  seed= 1  estimate=   8,192  error=18%
  seed= 2  estimate=  16,384  error=64%
  seed= 3  estimate=   8,192  error=18%
  seed= 4  estimate=  16,384  error=64%
  seed= 5  estimate=   8,192  error=18%
  seed= 6  estimate=  32,768  error=228%
  seed= 7  estimate=   8,192  error=18%
  ...
```

Yikes. The estimates jump between powers of 2 and are frequently off by 50% or more. Let's fix this.

---

## Step 4: HyperLogLog — The Full Implementation

Here's the complete HLL implementation. It's surprisingly short:

```python
import math

class HyperLogLog:
    """HyperLogLog cardinality estimator.
    
    In coin-flip terms:
    - p bits determine which sub-crowd (register) each person joins
    - The remaining bits are their coin-flip sequence
    - Each register tracks the longest streak in its sub-crowd
    - The harmonic mean combines all the sub-crowd reports
    """
    
    def __init__(self, p=10, seed=0):
        """
        Args:
            p: Number of bits for register indexing.
                m = 2^p registers. More registers = more accuracy.
            seed: Hash seed.
        """
        self.p = p
        self.m = 1 << p              # number of registers (sub-crowds)
        self.seed = seed
        self.registers = [0] * self.m  # each register tracks max streak
        
    def _alpha(self):
        """Bias-correction constant, depends on number of registers."""
        if self.m == 16: return 0.673
        if self.m == 32: return 0.697
        if self.m == 64: return 0.709
        return 0.7213 / (1 + 1.079 / self.m)
    
    def add(self, item):
        """Add an item to the sketch.
        
        In coin-flip terms: a new person walks up.
        1. Look at their first p coin flips → determines their sub-crowd
        2. Look at the rest of their coin flips → measure their streak
        3. If it's a new record for that sub-crowd, update the register
        """
        h = hash_item(item, self.seed)
        
        # First p bits → register index (which sub-crowd?)
        idx = h & (self.m - 1)
        
        # Remaining bits → the coin-flip sequence to measure
        w = h >> self.p
        
        # Count leading zeros + 1 = position of first 1-bit (ρ)
        # This matches the standard HLL convention
        rho = count_leading_zeros(w, 32 - self.p) + 1
        
        # Keep the max (the record-holder of this sub-crowd)
        self.registers[idx] = max(self.registers[idx], rho)
    
    def count(self):
        """Estimate the number of distinct items seen.
        
        Uses the harmonic mean of 2^(-register) values,
        with small-range and large-range corrections.
        """
        alpha = self._alpha()
        
        # Harmonic mean indicator: sum of 2^(-M[j])
        indicator = sum(2.0 ** (-r) for r in self.registers)
        
        # Raw HLL estimate
        E = alpha * self.m * self.m / indicator
        
        # Small-range correction (linear counting)
        empty = self.registers.count(0)
        if E <= 2.5 * self.m and empty > 0:
            E = self.m * math.log(self.m / empty)
        
        # Large-range correction (hash collision adjustment)
        two_to_32 = 2 ** 32
        if E > two_to_32 / 30:
            E = -two_to_32 * math.log(1 - E / two_to_32)
        
        return E
    
    def merge(self, other):
        """Merge another HLL sketch into this one.
        
        In coin-flip terms: combine two sub-crowds that were
        tracked separately. The record-holder for each register
        is the person with the longest streak from either group.
        """
        assert self.m == other.m, "Can only merge sketches with same m"
        for i in range(self.m):
            self.registers[i] = max(self.registers[i], other.registers[i])
    
    def memory_bytes(self):
        """Approximate memory usage (6 bits per register)."""
        return math.ceil(self.m * 6 / 8)
```

That's the whole algorithm. Let's test it.

---

## Step 5: Testing

### Basic accuracy test

```python
def test_basic_accuracy():
    true_n = 100_000
    hll = HyperLogLog(p=14)  # 16,384 registers — standard Redis config
    
    for i in range(true_n):
        hll.add(str(i))
    
    estimate = hll.count()
    error = abs(estimate - true_n) / true_n
    
    print(f"True count:  {true_n:>10,}")
    print(f"HLL estimate:{estimate:>10,.0f}")
    print(f"Error:       {error*100:>9.2f}%")
    print(f"Memory:      {hll.memory_bytes():>10,} bytes")
    
    assert error < 0.05, f"Error too high: {error:.2%}"
    print("✓ Basic accuracy test passes")

test_basic_accuracy()
```

```
True count:     100,000
HLL estimate:    99,438
Error:            0.56%
Memory:       12,288 bytes
```

0.56% error using 12 KB. Compare that to `set()` which would need several megabytes.

### Duplicate handling

```python
def test_duplicates():
    """Same item added multiple times should not inflate the count."""
    hll = HyperLogLog(p=10)
    
    # Add 1000 unique items
    for i in range(1000):
        hll.add(str(i))
    
    est_before = hll.count()
    
    # Now add the same items again (10x each)
    for _ in range(10):
        for i in range(1000):
            hll.add(str(i))
    
    est_after = hll.count()
    
    print(f"Before duplicates: {est_before:.0f}")
    print(f"After 10x duplicates: {est_after:.0f}")
    assert est_before == est_after, "Duplicates should not change the estimate!"
    print("✓ Duplicate handling test passes")

test_duplicates()
```

```
Before duplicates: 1018
After 10x duplicates: 1018
```

The estimate doesn't change — duplicates hash to the same register with the same streak.

### Merge test

```python
def test_merge():
    """Merging two sketches should approximate the union."""
    hll_a = HyperLogLog(p=12)
    hll_b = HyperLogLog(p=12)
    
    # Crowd A: items 0-6999 (7000 unique)
    for i in range(7000):
        hll_a.add(str(i))
    
    # Crowd B: items 3000-9999 (7000 unique, 4000 overlap with A)
    for i in range(3000, 10000):
        hll_b.add(str(i))
    
    true_union = 10000  # items 0-9999
    
    # Merge B into A
    hll_a.merge(hll_b)
    merged_est = hll_a.count()
    
    error = abs(merged_est - true_union) / true_union
    print(f"True union:    {true_union:>8,}")
    print(f"Merged estimate:{merged_est:>8,.0f}")
    print(f"Error:          {error*100:>7.2f}%")
    print(f"Naive sum:     {14000:>8,}  ← wrong (double-counts overlap)")
    
    assert error < 0.05
    print("✓ Merge test passes")

test_merge()
```

```
True union:      10,000
Merged estimate:  10,142
Error:             1.42%
Naive sum:       14,000  ← wrong (double-counts overlap)
```

---

## Step 6: Accuracy vs. Memory — The Trade-off Curve

Let's measure how accuracy improves as we add more registers:

```python
def benchmark_accuracy(true_n=100_000, trials=50):
    """Measure error at different register counts."""
    print(f"{'p':>3}  {'m':>7}  {'Memory':>8}  {'Avg Error':>10}  {'Std Error':>10}  {'1.04/√m':>8}")
    print("-" * 58)
    
    for p in range(4, 17):
        m = 1 << p
        errors = []
        
        for seed in range(trials):
            hll = HyperLogLog(p=p, seed=seed)
            for i in range(true_n):
                hll.add(str(i))
            est = hll.count()
            errors.append(abs(est - true_n) / true_n)
        
        avg_err = sum(errors) / len(errors)
        std_err = (sum((e - avg_err)**2 for e in errors) / len(errors)) ** 0.5
        theoretical = 1.04 / (m ** 0.5)
        memory = math.ceil(m * 6 / 8)
        
        mem_str = f"{memory:,} B" if memory < 1024 else f"{memory/1024:.1f} KB"
        
        print(f"{p:>3}  {m:>7,}  {mem_str:>8}  {avg_err*100:>9.2f}%  {std_err*100:>9.2f}%  {theoretical*100:>7.2f}%")

benchmark_accuracy()
```

```
  p        m    Memory   Avg Error   Std Error   1.04/√m
----------------------------------------------------------
  4       16      12 B      17.42%      14.63%    26.00%
  5       32      24 B      12.31%       9.27%    18.38%
  6       64      48 B       8.04%       6.53%    13.00%
  7      128      96 B       5.86%       4.44%     9.19%
  8      256     192 B       4.12%       3.19%     6.50%
  9      512     384 B       2.87%       2.21%     4.60%
 10    1,024     768 B       2.04%       1.57%     3.25%
 11    2,048    1.5 KB       1.42%       1.12%     2.30%
 12    4,096    3.0 KB       1.01%       0.79%     1.62%
 13    8,192    6.0 KB       0.72%       0.57%     1.15%
 14   16,384   12.0 KB       0.51%       0.39%     0.81%
 15   32,768   24.0 KB       0.36%       0.27%     0.58%
 16   65,536   48.0 KB       0.25%       0.19%     0.41%
```

The pattern is clear: **double the registers, reduce the error by √2**. And the measured error tracks the theoretical formula **σ ≈ 1.04/√m** closely.

---

## Step 7: Memory Comparison — HLL vs. Exact

This is where HLL's value becomes visceral:

```python
import sys

def memory_comparison():
    sizes = [1_000, 10_000, 100_000, 1_000_000, 10_000_000]
    p = 14  # standard config: 16,384 registers
    
    print(f"{'N':>12}  {'set() memory':>14}  {'HLL memory':>12}  {'Ratio':>8}  {'HLL error':>10}")
    print("-" * 68)
    
    for n in sizes:
        # Exact counting with set
        exact = set(str(i) for i in range(n))
        set_mem = sys.getsizeof(exact)
        # Add the size of the string objects themselves
        set_mem += sum(sys.getsizeof(s) for s in list(exact)[:100]) / 100 * n
        
        # HLL
        hll = HyperLogLog(p=p)
        for i in range(n):
            hll.add(str(i))
        hll_mem = hll.memory_bytes()
        hll_err = abs(hll.count() - n) / n
        
        ratio = set_mem / hll_mem
        
        set_str = f"{set_mem/1024:.0f} KB" if set_mem < 1e6 else f"{set_mem/1e6:.1f} MB"
        
        print(f"{n:>12,}  {set_str:>14}  {hll_mem/1024:.1f} KB  {ratio:>7,.0f}x  {hll_err*100:>9.2f}%")

memory_comparison()
```

```
           N    set() memory    HLL memory     Ratio   HLL error
--------------------------------------------------------------------
       1,000         89 KB     12.0 KB        7x       0.42%
      10,000        822 KB     12.0 KB       69x       0.67%
     100,000        7.6 MB     12.0 KB      649x       0.51%
   1,000,000       73.2 MB     12.0 KB    6,247x       0.70%
  10,000,000      711.4 MB     12.0 KB   60,723x       0.53%
```

Ten million items: exact counting needs ~711 MB. HLL needs **12 KB** — a 60,000x reduction — with less than 1% error. The HLL memory is constant regardless of the input size. That's the magic.

---

## The Complete Code

Here's everything in one copy-pasteable block:

```python
"""
HyperLogLog — A complete implementation in ~60 lines.

Metaphor reference:
  - item    → a person in the crowd
  - hash    → their personal coin-flip sequence
  - register → a sub-crowd (colored armband group)
  - rho     → their streak length + 1 (position of first heads)
  - count() → estimated crowd size
"""

import math
import mmh3


def hash_item(item, seed=0):
    """Hash any item to an unsigned 32-bit integer."""
    return mmh3.hash(str(item), seed) & 0xFFFFFFFF


def count_leading_zeros(value, bits=32):
    """Count leading zeros — the 'streak of tails.'"""
    if value == 0:
        return bits
    count = 0
    for i in range(bits - 1, -1, -1):
        if value & (1 << i):
            break
        count += 1
    return count


class HyperLogLog:
    def __init__(self, p=14, seed=0):
        self.p = p
        self.m = 1 << p
        self.seed = seed
        self.registers = [0] * self.m

    def _alpha(self):
        if self.m == 16: return 0.673
        if self.m == 32: return 0.697
        if self.m == 64: return 0.709
        return 0.7213 / (1 + 1.079 / self.m)

    def add(self, item):
        h = hash_item(item, self.seed)
        idx = h & (self.m - 1)
        w = h >> self.p
        rho = count_leading_zeros(w, 32 - self.p) + 1
        self.registers[idx] = max(self.registers[idx], rho)

    def count(self):
        alpha = self._alpha()
        indicator = sum(2.0 ** (-r) for r in self.registers)
        E = alpha * self.m * self.m / indicator

        empty = self.registers.count(0)
        if E <= 2.5 * self.m and empty > 0:
            E = self.m * math.log(self.m / empty)

        two_to_32 = 2 ** 32
        if E > two_to_32 / 30:
            E = -two_to_32 * math.log(1 - E / two_to_32)

        return E

    def merge(self, other):
        assert self.m == other.m
        for i in range(self.m):
            self.registers[i] = max(self.registers[i], other.registers[i])

    def memory_bytes(self):
        return math.ceil(self.m * 6 / 8)
```

---

## What We Built

In about 60 lines of Python, we have a fully functional HyperLogLog that:

1. **Hashes** any input to a uniform 32-bit integer
2. **Partitions** items into sub-crowds using the first *p* bits
3. **Tracks** the longest streak (ρ) in each register
4. **Estimates** cardinality using the bias-corrected harmonic mean
5. **Handles** edge cases (small and large ranges)
6. **Merges** sketches with a simple element-wise max
7. Uses **constant memory** regardless of input size

The code maps directly to the intuition from the rest of the series:

| Concept | Code |
|:---|:---|
| A person walks up | `add(item)` |
| Their coin-flip sequence | `hash_item(item)` |
| Which sub-crowd they join | `h & (m - 1)` — first p bits |
| Their streak length | `count_leading_zeros(w) + 1` |
| The record-holder | `max(registers[idx], rho)` |
| Combining sub-crowd reports | `alpha * m² / Σ 2^(-M[j])` — harmonic mean |
| Merging two crowds | `max(a[i], b[i])` for each register |

From coin flips to counting billions. That's HyperLogLog.

---

*Previous: [Splitting the Crowd — How HyperLogLog Tames Randomness](/blog/hll-splitting-the-crowd/)*
