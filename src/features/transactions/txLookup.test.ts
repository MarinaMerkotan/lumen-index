import { encodeAbiParameters, pad } from 'viem';
import { describe, expect, it } from 'vitest';
import { MAINNET_TOKENS } from '../../lib/chains/tokens';
import { confirmations, decodeLog, decodeLogs, deriveTxStatus, feePaid } from './txLookup';
import { shouldRetryLookup } from './useTransactionLookup';

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const APPROVAL = '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925';
const A = '0x1111111111111111111111111111111111111111';
const B = '0x2222222222222222222222222222222222222222';
const USDC = MAINNET_TOKENS[0];
const amount = (v: bigint) => encodeAbiParameters([{ type: 'uint256' }], [v]);

describe('deriveTxStatus', () => {
  it('covers not-found, pending, success and reverted', () => {
    expect(deriveTxStatus(null, null)).toBe('not-found');
    expect(deriveTxStatus({ blockNumber: null }, null)).toBe('pending');
    expect(deriveTxStatus({ blockNumber: 5n }, undefined)).toBe('pending');
    expect(deriveTxStatus({ blockNumber: 5n }, { status: 'success' })).toBe('success');
    expect(deriveTxStatus({ blockNumber: 5n }, { status: 'reverted' })).toBe('reverted');
  });
});

describe('confirmations and fees', () => {
  it('counts the inclusion block as the first confirmation', () => {
    expect(confirmations(100n, 100n)).toBe(1n);
    expect(confirmations(110n, 100n)).toBe(11n);
    expect(confirmations(99n, 100n)).toBeNull();
    expect(confirmations(null, 100n)).toBeNull();
  });
  it('computes the fee in wei with bigint math', () => {
    expect(feePaid(21_000n, 30_000_000_000n)).toBe(630_000_000_000_000n);
  });
});

describe('decodeLog', () => {
  it('decodes an allowlisted ERC-20 Transfer with token metadata', () => {
    const log = { address: USDC.address, topics: [TRANSFER, pad(A), pad(B)] as `0x${string}`[], data: amount(2_500_000n), logIndex: 7 };
    expect(decodeLog(log, 7)).toMatchObject({ kind: 'erc20-transfer', index: 7, amount: 2_500_000n, token: { symbol: 'USDC' } });
  });

  it('decodes an Approval from an unknown token without inventing decimals', () => {
    const log = { address: B as `0x${string}`, topics: [APPROVAL, pad(A), pad(B)] as `0x${string}`[], data: amount(1n), logIndex: 0 };
    expect(decodeLog(log, 0)).toMatchObject({ kind: 'erc20-approval', from: A, to: B, amount: 1n, token: null });
  });

  it('keeps ERC-721 transfers (4 topics) and unknown events raw', () => {
    const nft = { address: B as `0x${string}`, topics: [TRANSFER, pad(A), pad(B), pad('0x05')] as `0x${string}`[], data: '0x' as `0x${string}`, logIndex: 1 };
    expect(decodeLog(nft, 1)).toEqual({ kind: 'raw', index: 1, contract: B, topic0: TRANSFER, topicCount: 4, dataBytes: 0 });
    const other = { address: A as `0x${string}`, topics: [pad('0x99')] as `0x${string}`[], data: amount(1n), logIndex: 2 };
    expect(decodeLog(other, 2)).toMatchObject({ kind: 'raw', topicCount: 1, dataBytes: 32 });
    const anonymous = { address: A as `0x${string}`, topics: [] as `0x${string}`[], data: '0x' as `0x${string}`, logIndex: 3 };
    expect(decodeLog(anonymous, 3)).toMatchObject({ kind: 'raw', topic0: null });
  });

  it('caps the rendered list and reports the remainder', () => {
    const log = { address: A as `0x${string}`, topics: [pad('0x01')] as `0x${string}`[], data: '0x' as `0x${string}`, logIndex: null };
    const { items, hidden } = decodeLogs(Array.from({ length: 30 }, () => log), 25);
    expect(items).toHaveLength(25);
    expect(hidden).toBe(5);
    expect(items[3].index).toBe(3);
  });
});

describe('lookup retry policy', () => {
  it('retries transient RPC failures but never a definitive not-found', () => {
    expect(shouldRetryLookup(0, { name: 'HttpRequestError', status: 429 })).toBe(true);
    expect(shouldRetryLookup(1, { name: 'TimeoutError' })).toBe(true);
    expect(shouldRetryLookup(2, { name: 'TimeoutError' })).toBe(false);
    expect(shouldRetryLookup(0, { name: 'Wrapper', cause: { name: 'TransactionNotFoundError' } })).toBe(false);
  });
});
