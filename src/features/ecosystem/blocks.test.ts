import { describe, expect, it } from 'vitest';
import { chartGeometry, feeHistoryToPoints, recentBlockNumbers, toBlockSummary } from './blocks';

const raw = {
  number: 100n,
  hash: ('0x' + 'ab'.repeat(32)) as `0x${string}`,
  timestamp: 1_700_000_000n,
  transactions: [('0x' + '01'.repeat(32)) as `0x${string}`, ('0x' + '02'.repeat(32)) as `0x${string}`],
  gasUsed: 15_000_000n,
  gasLimit: 30_000_000n,
  baseFeePerGas: 412_000_000n,
  miner: '0x0000000000000000000000000000000000000001' as `0x${string}`,
};

describe('toBlockSummary', () => {
  it('maps header fields and counts transactions without fetching them', () => {
    expect(toBlockSummary(raw)).toEqual({
      number: 100n,
      hash: raw.hash,
      timestampMs: 1_700_000_000_000,
      txCount: 2,
      gasUsed: 15_000_000n,
      gasLimit: 30_000_000n,
      baseFeePerGas: 412_000_000n,
      feeRecipient: raw.miner,
      firstTxHash: raw.transactions[0],
    });
  });

  it('never presents a pending block as mined and handles empty / pre-London blocks', () => {
    expect(toBlockSummary({ ...raw, number: null })).toBeNull();
    expect(toBlockSummary({ ...raw, hash: null })).toBeNull();
    const empty = toBlockSummary({ ...raw, transactions: [], baseFeePerGas: undefined });
    expect(empty).toMatchObject({ txCount: 0, firstTxHash: null, baseFeePerGas: null });
  });
});

describe('recentBlockNumbers', () => {
  it('returns newest-first numbers and stops at genesis', () => {
    expect(recentBlockNumbers(100n, 4)).toEqual([100n, 99n, 98n, 97n]);
    expect(recentBlockNumbers(2n, 10)).toEqual([2n, 1n, 0n]);
  });
});

describe('feeHistoryToPoints', () => {
  it('separates observed blocks from the protocol-computed next base fee', () => {
    const points = feeHistoryToPoints({ oldestBlock: 10n, baseFeePerGas: [5n, 6n, 7n], gasUsedRatio: [0.5, 0.25] });
    expect(points).toEqual([
      { block: 10n, baseFee: 5n, gasUsedRatio: 0.5, kind: 'observed' },
      { block: 11n, baseFee: 6n, gasUsedRatio: 0.25, kind: 'observed' },
      { block: 12n, baseFee: 7n, gasUsedRatio: null, kind: 'next' },
    ]);
  });

  it('keeps missing values as null and omits a missing next value', () => {
    const points = feeHistoryToPoints({ oldestBlock: 1n, baseFeePerGas: [5n], gasUsedRatio: [0.1, Number.NaN] });
    expect(points).toEqual([
      { block: 1n, baseFee: 5n, gasUsedRatio: 0.1, kind: 'observed' },
      { block: 2n, baseFee: null, gasUsedRatio: null, kind: 'observed' },
    ]);
  });
});

describe('chartGeometry', () => {
  const point = (block: bigint, baseFee: bigint | null) => ({ block, baseFee, gasUsedRatio: 0.5, kind: 'observed' as const });

  it('scales present values into the box with a padded domain', () => {
    const g = chartGeometry([point(1n, 100n), point(2n, 200n)], 100, 100, 0);
    expect(g.min).toBe(90n);
    expect(g.max).toBe(210n);
    expect(g.bars[0].height).toBeCloseTo((10 / 120) * 100);
    expect(g.bars[1].height).toBeCloseTo((110 / 120) * 100);
    expect(g.bars[1].x).toBe(50);
  });

  it('draws missing values as empty slots instead of interpolating', () => {
    const g = chartGeometry([point(1n, 100n), point(2n, null), point(3n, 100n)], 90, 100, 0);
    expect(g.bars[1]).toMatchObject({ y: null, height: 0 });
    expect(g.bars).toHaveLength(3);
  });

  it('handles flat and empty series', () => {
    expect(chartGeometry([point(1n, 50n), point(2n, 50n)], 100, 100).bars.every((b) => b.height > 0)).toBe(true);
    expect(chartGeometry([point(1n, null)], 100, 100).bars).toEqual([]);
    expect(chartGeometry([], 100, 100).bars).toEqual([]);
  });
});
