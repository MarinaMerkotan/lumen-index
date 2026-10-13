/** Pure transforms for the block explorer and base-fee chart (unit-tested; no React, no RPC). */

export interface BlockSummary {
  number: bigint;
  hash: `0x${string}`;
  timestampMs: number;
  txCount: number;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas: bigint | null;
  feeRecipient: `0x${string}`;
  /** First transaction hash in the block (from the header response; no extra request). */
  firstTxHash: `0x${string}` | null;
}

interface RawBlock {
  number: bigint | null;
  hash: `0x${string}` | null;
  timestamp: bigint;
  transactions: readonly unknown[];
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas?: bigint | null;
  miner: `0x${string}`;
}

/** Returns null for pending blocks (no number/hash yet): they are never shown as mined. */
export function toBlockSummary(block: RawBlock): BlockSummary | null {
  if (block.number === null || block.hash === null) return null;
  return {
    number: block.number,
    hash: block.hash,
    timestampMs: Number(block.timestamp) * 1000,
    txCount: block.transactions.length,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    baseFeePerGas: block.baseFeePerGas ?? null,
    feeRecipient: block.miner,
    firstTxHash: typeof block.transactions[0] === 'string' ? (block.transactions[0] as `0x${string}`) : null,
  };
}

/** `count` block numbers ending at `latest`, newest first, never below genesis. */
export function recentBlockNumbers(latest: bigint, count: number): bigint[] {
  const numbers: bigint[] = [];
  for (let i = 0n; i < BigInt(count) && latest - i >= 0n; i++) numbers.push(latest - i);
  return numbers;
}

export interface FeePoint {
  block: bigint;
  /** Wei per gas. Null when the RPC did not return a value for this slot: drawn as a gap, never guessed. */
  baseFee: bigint | null;
  /** 0..1 share of the gas limit used (observed blocks only). */
  gasUsedRatio: number | null;
  /** `observed` = mined block; `next` = base fee the protocol derives for the upcoming block. */
  kind: 'observed' | 'next';
}

interface RawFeeHistory {
  oldestBlock: bigint;
  baseFeePerGas: readonly bigint[];
  gasUsedRatio: readonly number[];
}

/**
 * eth_feeHistory returns N+1 base fees for N blocks: one per observed block plus the next block's
 * base fee, which is fully determined by EIP-1559 from the latest block. The two are kept apart.
 */
export function feeHistoryToPoints(history: RawFeeHistory): FeePoint[] {
  const count = history.gasUsedRatio.length;
  const points: FeePoint[] = [];
  for (let i = 0; i < count; i++) {
    const fee = history.baseFeePerGas[i];
    points.push({
      block: history.oldestBlock + BigInt(i),
      baseFee: typeof fee === 'bigint' ? fee : null,
      gasUsedRatio: Number.isFinite(history.gasUsedRatio[i]) ? history.gasUsedRatio[i] : null,
      kind: 'observed',
    });
  }
  const next = history.baseFeePerGas[count];
  if (typeof next === 'bigint') points.push({ block: history.oldestBlock + BigInt(count), baseFee: next, gasUsedRatio: null, kind: 'next' });
  return points;
}

export interface ChartBar {
  index: number;
  point: FeePoint;
  x: number;
  width: number;
  /** Null for missing values. */
  y: number | null;
  height: number;
}

export interface ChartGeometry {
  bars: ChartBar[];
  /** Domain in wei used for the y axis (min/max of present values with padding). */
  min: bigint;
  max: bigint;
  baselineY: number;
}

/**
 * Lays out one bar per fee point. The y domain spans the present values (padded) so small
 * movements stay visible; the axis labels show the real min/max, so nothing is exaggerated silently.
 */
export function chartGeometry(points: readonly FeePoint[], width: number, height: number, gap = 2): ChartGeometry {
  const present = points.map((p) => p.baseFee).filter((fee): fee is bigint => fee !== null);
  if (present.length === 0 || points.length === 0) return { bars: [], min: 0n, max: 0n, baselineY: height };
  let min = present.reduce((a, b) => (b < a ? b : a));
  let max = present.reduce((a, b) => (b > a ? b : a));
  const pad = (max - min) / 10n || max / 20n || 1n;
  min = min - pad < 0n ? 0n : min - pad;
  max = max + pad;
  const span = Number(max - min) || 1;
  const slot = width / points.length;
  const bars = points.map((point, index) => {
    const x = index * slot + gap / 2;
    if (point.baseFee === null) return { index, point, x, width: Math.max(slot - gap, 1), y: null, height: 0 };
    const h = Math.max((Number(point.baseFee - min) / span) * height, 1);
    return { index, point, x, width: Math.max(slot - gap, 1), y: height - h, height: h };
  });
  return { bars, min, max, baselineY: height };
}
