/**
 * Deterministic constant-product (x · y = k) math for the local simulator.
 * All amounts are bigint fixed-point with 18 decimals; no floats touch a balance.
 */
export const SCALE_DECIMALS = 18;
const SCALE = 10n ** 18n;
const BPS = 10_000n;
const PPM = 1_000_000n;

export const MAX_INTEGER_DIGITS = 15;
export const MAX_FEE_BPS = 1000; // 10%

export type AmountResult = { ok: true; value: bigint } | { ok: false; reason: 'empty' | 'format' | 'too-precise' | 'too-large' };

/** Parses a plain decimal string (e.g. `1500.25`) into 18-decimal fixed point. No signs, exponents or separators. */
export function parseAmount(raw: string): AmountResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: 'empty' };
  const match = /^(\d*)(?:\.(\d*))?$/.exec(value);
  if (!match || (match[1] === '' && (match[2] ?? '') === '')) return { ok: false, reason: 'format' };
  const [, whole, fraction = ''] = match;
  if (fraction.length > SCALE_DECIMALS) return { ok: false, reason: 'too-precise' };
  if (whole.replace(/^0+/, '').length > MAX_INTEGER_DIGITS) return { ok: false, reason: 'too-large' };
  return { ok: true, value: BigInt(whole || '0') * SCALE + BigInt(fraction.padEnd(SCALE_DECIMALS, '0') || '0') };
}

export type FeeResult = { ok: true; bps: number } | { ok: false; reason: 'empty' | 'format' | 'too-precise' | 'out-of-range' };

/** Parses a fee percentage (`0.3` → 30 bps). Up to two decimals, between 0% and 10%. */
export function parseFeePercent(raw: string): FeeResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: 'empty' };
  const match = /^(\d+)(?:\.(\d*))?$/.exec(value) ?? /^()\.(\d+)$/.exec(value);
  if (!match) return { ok: false, reason: 'format' };
  const [, whole, fraction = ''] = match;
  if (fraction.length > 2) return { ok: false, reason: 'too-precise' };
  const bps = Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0') || '0');
  if (!Number.isSafeInteger(bps) || bps > MAX_FEE_BPS) return { ok: false, reason: 'out-of-range' };
  return { ok: true, bps };
}

export interface SwapQuote {
  amountIn: bigint;
  feeAmount: bigint;
  amountInAfterFee: bigint;
  amountOut: bigint;
  /** Output tokens per input token, 18-decimal fixed point. */
  spotPriceBefore: bigint;
  spotPriceAfter: bigint;
  /** Average price actually received (fee included), 18-decimal fixed point; 0 for an empty input. */
  executionPrice: bigint;
  /** How far the trade moves the pool price, parts per million (excludes the fee). */
  priceImpactPpm: bigint;
  newReserveIn: bigint;
  newReserveOut: bigint;
  kBefore: bigint;
  kAfter: bigint;
}

export type QuoteResult = { ok: true; quote: SwapQuote } | { ok: false; reason: 'empty-pool' };

/**
 * Exact-input swap: out = reserveOut · inAfterFee / (reserveIn + inAfterFee), rounded down.
 * The fee is taken from the input and stays in the pool, so k never decreases.
 */
export function quoteSwap(reserveIn: bigint, reserveOut: bigint, amountIn: bigint, feeBps: number): QuoteResult {
  if (reserveIn <= 0n || reserveOut <= 0n) return { ok: false, reason: 'empty-pool' };
  if (amountIn < 0n || feeBps < 0 || feeBps > MAX_FEE_BPS) throw new RangeError('Invalid swap parameters');
  const amountInAfterFee = (amountIn * (BPS - BigInt(feeBps))) / BPS;
  const amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);
  const newReserveIn = reserveIn + amountIn;
  const newReserveOut = reserveOut - amountOut;
  return {
    ok: true,
    quote: {
      amountIn,
      feeAmount: amountIn - amountInAfterFee,
      amountInAfterFee,
      amountOut,
      spotPriceBefore: (reserveOut * SCALE) / reserveIn,
      spotPriceAfter: (newReserveOut * SCALE) / newReserveIn,
      executionPrice: amountIn === 0n ? 0n : (amountOut * SCALE) / amountIn,
      priceImpactPpm: (amountInAfterFee * PPM) / (reserveIn + amountInAfterFee),
      newReserveIn,
      newReserveOut,
      kBefore: reserveIn * reserveOut,
      kAfter: newReserveIn * newReserveOut,
    },
  };
}

export type ImpactLevel = 'none' | 'low' | 'notice' | 'high';

export function impactLevel(ppm: bigint): ImpactLevel {
  if (ppm === 0n) return 'none';
  if (ppm < 10_000n) return 'low'; // < 1%
  if (ppm < 100_000n) return 'notice'; // < 10%
  return 'high';
}

/** Parts per million as a percentage, truncated to two decimals (`< 0.01%` for tiny non-zero values). */
export function formatPpm(ppm: bigint): string {
  if (ppm > 0n && ppm < 100n) return '< 0.01%';
  const hundredths = ppm / 100n;
  return `${hundredths / 100n}.${(hundredths % 100n).toString().padStart(2, '0')}%`;
}
