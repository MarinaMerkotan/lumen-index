import { RpcErrorKind, classifyRpcError } from '../../lib/web3/errors';

export type TelemetryState = 'loading' | 'live' | 'stale' | 'error';

/** A successful read older than this is shown as STALE rather than current (~3-4 missed blocks). */
export const STALE_AFTER_MS = 45_000;
export const BLOCK_POLL_MS = 12_000;

interface QuerySnapshot {
  status: 'pending' | 'error' | 'success';
  dataUpdatedAt: number;
}

export function deriveTelemetryState(query: QuerySnapshot, now: number, staleAfterMs = STALE_AFTER_MS): TelemetryState {
  if (query.status === 'error') return 'error';
  if (query.status === 'pending') return 'loading';
  return now - query.dataUpdatedAt > staleAfterMs ? 'stale' : 'live';
}

/** Polling cadence: one Ethereum slot while healthy, backing off after failures. */
export function nextBlockPollMs(status: QuerySnapshot['status'], error: unknown): number {
  if (status !== 'error') return BLOCK_POLL_MS;
  return classifyRpcError(error) === 'rate-limited' ? 60_000 : 30_000;
}

export function telemetryErrorKind(...errors: unknown[]): RpcErrorKind | null {
  const first = errors.find(Boolean);
  return first ? classifyRpcError(first) : null;
}

/** Per-mille gas utilisation computed with bigint math (no float on raw gas values). */
export function blockFullnessPermille(gasUsed: bigint, gasLimit: bigint): number {
  if (gasLimit <= 0n) return 0;
  const permille = (gasUsed * 1000n) / gasLimit;
  return Number(permille > 1000n ? 1000n : permille);
}
