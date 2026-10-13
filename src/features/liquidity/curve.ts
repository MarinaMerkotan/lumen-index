import { formatUnits } from 'viem';
import { SCALE_DECIMALS } from './amm';

/** Drawing-only conversion (never used for balances). */
const toNumber = (value: bigint) => Number(formatUnits(value, SCALE_DECIMALS));

export interface CurveGeometry {
  path: string;
  before: { x: number; y: number };
  after: { x: number; y: number };
}

/**
 * Lays out the x·y=k hyperbola through the current reserves inside a width×height box (y grows down),
 * with the pre- and post-swap points. The x range always contains both points with some margin.
 */
export function curveGeometry(x0: bigint, y0: bigint, x1: bigint, y1: bigint, width: number, height: number, samples = 64): CurveGeometry | null {
  const a = toNumber(x0);
  const b = toNumber(y0);
  const c = toNumber(x1);
  const d = toNumber(y1);
  if (!(a > 0 && b > 0 && c > 0 && d > 0) || ![a, b, c, d].every(Number.isFinite)) return null;
  const k = a * b;
  const xMin = Math.min(a, c) * 0.35;
  const xMax = Math.max(a, c) * 1.6;
  const yMax = k / xMin;
  const sx = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
  const sy = (y: number) => height - (Math.min(y, yMax) / yMax) * height;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = xMin + ((xMax - xMin) * i) / samples;
    points.push(`${i === 0 ? 'M' : 'L'}${sx(x).toFixed(2)},${sy(k / x).toFixed(2)}`);
  }
  return { path: points.join(' '), before: { x: sx(a), y: sy(b) }, after: { x: sx(c), y: sy(d) } };
}
