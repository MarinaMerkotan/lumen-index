import { parseUnits } from 'viem';
import { describe, expect, it } from 'vitest';
import { formatPpm, impactLevel, parseAmount, parseFeePercent, quoteSwap } from './amm';
import { curveGeometry } from './curve';

const u = (v: string) => parseUnits(v, 18);

describe('parseAmount', () => {
  it('parses plain decimals into 18-decimal fixed point', () => {
    expect(parseAmount('1500.25')).toEqual({ ok: true, value: u('1500.25') });
    expect(parseAmount(' 0.5 ')).toEqual({ ok: true, value: u('0.5') });
    expect(parseAmount('.5')).toEqual({ ok: true, value: u('0.5') });
    expect(parseAmount('7.')).toEqual({ ok: true, value: u('7') });
    expect(parseAmount('0')).toEqual({ ok: true, value: 0n });
    expect(parseAmount('0.000000000000000001')).toEqual({ ok: true, value: 1n });
  });

  it('rejects invalid, over-precise and oversized input', () => {
    for (const bad of ['-1', '1e5', '1,000', 'abc', '.', '1.2.3', 'NaN', 'Infinity', '0x10']) {
      expect(parseAmount(bad)).toEqual({ ok: false, reason: 'format' });
    }
    expect(parseAmount('')).toEqual({ ok: false, reason: 'empty' });
    expect(parseAmount('0.0000000000000000001')).toEqual({ ok: false, reason: 'too-precise' });
    expect(parseAmount('1000000000000000')).toEqual({ ok: false, reason: 'too-large' });
    expect(parseAmount('000999999999999999')).toEqual({ ok: true, value: u('999999999999999') });
  });
});

describe('parseFeePercent', () => {
  it('converts percentages to basis points', () => {
    expect(parseFeePercent('0.3')).toEqual({ ok: true, bps: 30 });
    expect(parseFeePercent('0.05')).toEqual({ ok: true, bps: 5 });
    expect(parseFeePercent('.3')).toEqual({ ok: true, bps: 30 });
    expect(parseFeePercent('0')).toEqual({ ok: true, bps: 0 });
    expect(parseFeePercent('10')).toEqual({ ok: true, bps: 1000 });
  });
  it('rejects out-of-range or malformed fees', () => {
    expect(parseFeePercent('10.01')).toEqual({ ok: false, reason: 'out-of-range' });
    expect(parseFeePercent('0.125')).toEqual({ ok: false, reason: 'too-precise' });
    expect(parseFeePercent('-1')).toEqual({ ok: false, reason: 'format' });
    expect(parseFeePercent('')).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('quoteSwap', () => {
  it('matches the constant-product formula with the fee taken from the input', () => {
    const result = quoteSwap(u('1000'), u('1000'), u('10'), 30);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const q = result.quote;
    expect(q.feeAmount).toBe(u('0.03'));
    expect(q.amountInAfterFee).toBe(u('9.97'));
    // 1000 * 9.97 / 1009.97 = 9.871580344…
    expect(q.amountOut).toBe((u('1000') * u('9.97')) / u('1009.97'));
    expect(q.spotPriceBefore).toBe(u('1'));
    expect(q.priceImpactPpm).toBe(9871n); // 9.97 / 1009.97 ≈ 0.987%
    expect(q.newReserveIn).toBe(u('1010'));
    expect(q.newReserveOut).toBe(u('1000') - q.amountOut);
    expect(q.kAfter >= q.kBefore).toBe(true);
  });

  it('never drains the pool, even for swaps far larger than the reserve', () => {
    const result = quoteSwap(u('100'), u('50'), u('10000000'), 30);
    if (!result.ok) throw new Error('unexpected');
    expect(result.quote.amountOut < u('50')).toBe(true);
    expect(result.quote.newReserveOut > 0n).toBe(true);
    expect(impactLevel(result.quote.priceImpactPpm)).toBe('high');
  });

  it('handles zero input, zero fee and empty pools', () => {
    const zero = quoteSwap(u('100'), u('100'), 0n, 30);
    expect(zero.ok && zero.quote.amountOut).toBe(0n);
    expect(zero.ok && zero.quote.executionPrice).toBe(0n);
    const noFee = quoteSwap(u('100'), u('100'), u('100'), 0);
    expect(noFee.ok && noFee.quote.amountOut).toBe(u('50'));
    expect(quoteSwap(0n, u('1'), u('1'), 30)).toEqual({ ok: false, reason: 'empty-pool' });
    expect(quoteSwap(u('1'), 0n, u('1'), 30)).toEqual({ ok: false, reason: 'empty-pool' });
    expect(() => quoteSwap(u('1'), u('1'), -1n, 30)).toThrow(RangeError);
  });

  it('rounds down at the smallest unit (no value created)', () => {
    const result = quoteSwap(3n, 3n, 1n, 0);
    expect(result.ok && result.quote.amountOut).toBe(0n); // 3*1/4 = 0.75 → 0
  });
});

describe('formatting helpers', () => {
  it('formats ppm percentages and classifies impact', () => {
    expect(formatPpm(9871n)).toBe('0.98%');
    expect(formatPpm(500_000n)).toBe('50.00%');
    expect(formatPpm(50n)).toBe('< 0.01%');
    expect(formatPpm(0n)).toBe('0.00%');
    expect(impactLevel(0n)).toBe('none');
    expect(impactLevel(5_000n)).toBe('low');
    expect(impactLevel(50_000n)).toBe('notice');
  });
});

describe('curveGeometry', () => {
  it('places both points on the curve inside the box', () => {
    const g = curveGeometry(u('1000'), u('1000'), u('1010'), u('990.1'), 300, 200)!;
    expect(g.path.startsWith('M')).toBe(true);
    for (const p of [g.before, g.after]) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(300);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(200);
    }
    expect(g.after.x).toBeGreaterThan(g.before.x);
    expect(g.after.y).toBeGreaterThan(g.before.y); // less output reserve → lower on screen
  });
  it('returns null for empty reserves', () => {
    expect(curveGeometry(0n, 1n, 1n, 1n, 100, 100)).toBeNull();
  });
});
