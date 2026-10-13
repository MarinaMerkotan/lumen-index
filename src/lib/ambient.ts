export interface AmbientTiming {
  /** Full cycle length in ms. */
  duration: number;
  /** Start offset in ms. */
  delay: number;
}

interface TimingRange {
  minDuration: number;
  maxDuration: number;
  baseDelay?: number;
  maxDelay: number;
}

/** Deterministic 0..1 value for an integer seed (mulberry32 single step). */
export function seededUnit(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Stable, asynchronous timing for ambient decorations so that pulses never fire in lockstep
 * and the same element keeps the same rhythm across renders (no Math.random in render).
 */
export function ambientTiming(index: number, range: TimingRange, salt = 0): AmbientTiming {
  const { minDuration, maxDuration, baseDelay = 0, maxDelay } = range;
  const a = seededUnit(index * 2 + 1 + salt * 7919);
  const b = seededUnit(index * 2 + 2 + salt * 7919);
  return {
    duration: Math.round(minDuration + a * (maxDuration - minDuration)),
    delay: Math.round(baseDelay + b * maxDelay),
  };
}
