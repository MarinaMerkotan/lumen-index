import { describe, expect, it } from 'vitest';
import { MAINNET_TOKENS } from '../../lib/chains/tokens';
import { CallResult, TOKEN_CALLS, tokenRowsFromResults } from './tokenBalances';

const ok = (result: unknown): CallResult => ({ status: 'success', result });
const fail: CallResult = { status: 'failure', error: new Error('reverted') };

describe('allowlist', () => {
  it('pins verified Mainnet addresses and decimals', () => {
    expect(MAINNET_TOKENS.map((t) => [t.symbol, t.address, t.decimals])).toEqual([
      ['USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6],
      ['DAI', '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18],
      ['WETH', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18],
    ]);
    expect(TOKEN_CALLS).toEqual(['balanceOf', 'decimals', 'totalSupply']);
  });
});

describe('tokenRowsFromResults', () => {
  it('returns null before the multicall resolves', () => {
    expect(tokenRowsFromResults(MAINNET_TOKENS, undefined)).toBeNull();
  });

  it('maps balances, explicit zeros, failures and decimal mismatches per token', () => {
    const results = [ok(1_000_000n), ok(6), ok(5n), ok(0n), ok(18), fail, fail, ok(18), ok(1n)];
    const rows = tokenRowsFromResults(MAINNET_TOKENS, results)!;
    expect(rows[0]).toEqual({ token: MAINNET_TOKENS[0], state: 'ok', balance: 1_000_000n, totalSupply: 5n });
    expect(rows[1]).toEqual({ token: MAINNET_TOKENS[1], state: 'ok', balance: 0n, totalSupply: null });
    expect(rows[2]).toEqual({ token: MAINNET_TOKENS[2], state: 'error' });

    const mismatch = tokenRowsFromResults(MAINNET_TOKENS, [ok(1n), ok(18), ok(1n), ...results.slice(3)])!;
    expect(mismatch[0]).toEqual({ token: MAINNET_TOKENS[0], state: 'decimals-mismatch', onchainDecimals: 18 });
  });
});
