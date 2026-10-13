import { TokenInfo } from '../../lib/chains/tokens';

export type CallResult = { status: 'success'; result: unknown } | { status: 'failure'; error: unknown };

export type TokenRow =
  | { token: TokenInfo; state: 'ok'; balance: bigint; totalSupply: bigint | null }
  /** The contract reported decimals that differ from the verified allowlist: never formatted. */
  | { token: TokenInfo; state: 'decimals-mismatch'; onchainDecimals: number }
  | { token: TokenInfo; state: 'error' };

/** Calls issued per token, in order. Kept in one place so reads and parsing never drift apart. */
export const TOKEN_CALLS = ['balanceOf', 'decimals', 'totalSupply'] as const;

/**
 * Maps a flat multicall result array (TOKEN_CALLS per token) to display rows. A failed balance read
 * becomes an explicit error row; a zero balance stays an explicit zero.
 */
export function tokenRowsFromResults(tokens: readonly TokenInfo[], results: readonly CallResult[] | undefined): TokenRow[] | null {
  if (!results) return null;
  return tokens.map((token, i) => {
    const [balance, decimals, supply] = results.slice(i * TOKEN_CALLS.length, (i + 1) * TOKEN_CALLS.length);
    if (!balance || balance.status !== 'success' || typeof balance.result !== 'bigint') return { token, state: 'error' };
    if (decimals?.status === 'success') {
      const onchain = Number(decimals.result);
      if (onchain !== token.decimals) return { token, state: 'decimals-mismatch', onchainDecimals: onchain };
    }
    const totalSupply = supply?.status === 'success' && typeof supply.result === 'bigint' ? supply.result : null;
    return { token, state: 'ok', balance: balance.result, totalSupply };
  });
}
