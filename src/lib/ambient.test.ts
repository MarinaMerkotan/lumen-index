import { describe, expect, it } from 'vitest';
import { ambientTiming, seededUnit } from './ambient';

const RANGE = { minDuration: 6000, maxDuration: 12000, baseDelay: 2000, maxDelay: 5000 };

describe('seededUnit', () => {
  it('is deterministic and within [0, 1)', () => {
    for (let seed = -50; seed < 200; seed++) {
      const value = seededUnit(seed);
      expect(value).toBe(seededUnit(seed));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('ambientTiming', () => {
  it('stays inside the requested bounds', () => {
    for (let i = 0; i < 64; i++) {
      const { duration, delay } = ambientTiming(i, RANGE);
      expect(duration).toBeGreaterThanOrEqual(RANGE.minDuration);
      expect(duration).toBeLessThanOrEqual(RANGE.maxDuration);
      expect(delay).toBeGreaterThanOrEqual(RANGE.baseDelay);
      expect(delay).toBeLessThanOrEqual(RANGE.baseDelay + RANGE.maxDelay);
    }
  });

  it('desynchronises neighbouring elements', () => {
    const timings = Array.from({ length: 8 }, (_, i) => ambientTiming(i, RANGE));
    expect(new Set(timings.map((t) => t.duration)).size).toBeGreaterThan(6);
    expect(new Set(timings.map((t) => t.delay)).size).toBeGreaterThan(6);
  });

  it('changes rhythm with the salt', () => {
    expect(ambientTiming(0, RANGE, 1)).not.toEqual(ambientTiming(0, RANGE, 2));
  });
});
