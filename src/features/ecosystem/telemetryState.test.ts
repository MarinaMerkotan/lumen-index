import { describe, expect, it } from 'vitest';
import { BLOCK_POLL_MS, STALE_AFTER_MS, blockFullnessPermille, deriveTelemetryState, nextBlockPollMs } from './telemetryState';

describe('deriveTelemetryState', () => {
  const now = 1_000_000;

  it('reports loading before the first response and error on failure', () => {
    expect(deriveTelemetryState({ status: 'pending', dataUpdatedAt: 0 }, now)).toBe('loading');
    expect(deriveTelemetryState({ status: 'error', dataUpdatedAt: now - 1000 }, now)).toBe('error');
  });

  it('is live while fresh and stale once the last success is too old', () => {
    expect(deriveTelemetryState({ status: 'success', dataUpdatedAt: now - 5_000 }, now)).toBe('live');
    expect(deriveTelemetryState({ status: 'success', dataUpdatedAt: now - STALE_AFTER_MS - 1 }, now)).toBe('stale');
  });
});

describe('nextBlockPollMs', () => {
  it('polls once per slot while healthy and backs off after failures', () => {
    expect(nextBlockPollMs('success', null)).toBe(BLOCK_POLL_MS);
    expect(nextBlockPollMs('error', { name: 'TimeoutError' })).toBe(30_000);
    expect(nextBlockPollMs('error', { status: 429 })).toBe(60_000);
  });
});

describe('blockFullnessPermille', () => {
  it('computes utilisation with bigint math and clamps', () => {
    expect(blockFullnessPermille(15_000_000n, 30_000_000n)).toBe(500);
    expect(blockFullnessPermille(1n, 3n)).toBe(333);
    expect(blockFullnessPermille(40n, 30n)).toBe(1000);
    expect(blockFullnessPermille(5n, 0n)).toBe(0);
  });
});
