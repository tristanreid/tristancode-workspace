/**
 * Entry point that re-exports the simulation engine.
 * This gets bundled by esbuild into static/js/hll/ for use by
 * Hugo shortcodes and interactive components.
 */
export {
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
} from '../hll-sim';
