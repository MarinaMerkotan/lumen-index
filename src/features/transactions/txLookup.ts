import { decodeEventLog, erc20Abi } from 'viem';
import { TokenInfo, findMainnetToken } from '../../lib/chains/tokens';

export type TxStatus = 'not-found' | 'pending' | 'success' | 'reverted';

/** A transaction counts as mined only once a receipt exists; without one it is pending. */
export function deriveTxStatus(
  tx: { blockNumber: bigint | null } | null,
  receipt: { status: 'success' | 'reverted' } | null | undefined,
): TxStatus {
  if (!tx) return 'not-found';
  if (tx.blockNumber === null || !receipt) return 'pending';
  return receipt.status === 'success' ? 'success' : 'reverted';
}

export function confirmations(latest: bigint | null, blockNumber: bigint | null): bigint | null {
  if (latest === null || blockNumber === null || latest < blockNumber) return null;
  return latest - blockNumber + 1n;
}

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const APPROVAL_TOPIC = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';

export interface RawLog {
  address: `0x${string}`;
  topics: readonly `0x${string}`[];
  data: `0x${string}`;
  logIndex: number | null;
}

export type DecodedLog =
  | {
      kind: 'erc20-transfer' | 'erc20-approval';
      index: number;
      contract: `0x${string}`;
      /** Transfer: from/to. Approval: owner/spender. */
      from: `0x${string}`;
      to: `0x${string}`;
      amount: bigint;
      /** Present only for allowlisted tokens; otherwise the amount stays in raw base units. */
      token: TokenInfo | null;
    }
  | { kind: 'raw'; index: number; contract: `0x${string}`; topic0: `0x${string}` | null; topicCount: number; dataBytes: number };

function rawLog(log: RawLog, index: number): DecodedLog {
  return {
    kind: 'raw',
    index,
    contract: log.address,
    topic0: log.topics[0] ?? null,
    topicCount: log.topics.length,
    dataBytes: Math.max((log.data.length - 2) / 2, 0),
  };
}

/**
 * Decodes standard ERC-20 Transfer/Approval logs with viem's verified ERC-20 ABI. Only the exact
 * ERC-20 shape (3 topics + 32-byte data) is decoded; ERC-721 shares the Transfer signature but has
 * 4 topics, so it stays raw. Anything else is shown as raw metadata, never guessed.
 */
export function decodeLog(log: RawLog, index: number): DecodedLog {
  const topic0 = log.topics[0]?.toLowerCase();
  const erc20Shape = log.topics.length === 3 && log.data.length === 66;
  if (!erc20Shape || (topic0 !== TRANSFER_TOPIC && topic0 !== APPROVAL_TOPIC)) return rawLog(log, index);
  try {
    const decoded = decodeEventLog({ abi: erc20Abi, data: log.data, topics: log.topics as [`0x${string}`, ...`0x${string}`[]], strict: true });
    const token = findMainnetToken(log.address) ?? null;
    if (decoded.eventName === 'Transfer') {
      return { kind: 'erc20-transfer', index, contract: log.address, from: decoded.args.from, to: decoded.args.to, amount: decoded.args.value, token };
    }
    if (decoded.eventName === 'Approval') {
      return { kind: 'erc20-approval', index, contract: log.address, from: decoded.args.owner, to: decoded.args.spender, amount: decoded.args.value, token };
    }
  } catch {
    // Signature matched but the payload did not decode strictly: fall through to raw metadata.
  }
  return rawLog(log, index);
}

export const MAX_LOGS_SHOWN = 25;

export function decodeLogs(logs: readonly RawLog[], limit = MAX_LOGS_SHOWN): { items: DecodedLog[]; hidden: number } {
  const items = logs.slice(0, limit).map((log, i) => decodeLog(log, log.logIndex ?? i));
  return { items, hidden: Math.max(logs.length - limit, 0) };
}

/** Fee actually paid: gas used × effective gas price (wei, bigint). */
export function feePaid(gasUsed: bigint, effectiveGasPrice: bigint): bigint {
  return gasUsed * effectiveGasPrice;
}
