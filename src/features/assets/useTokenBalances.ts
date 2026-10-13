import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import { MAINNET_CHAIN_ID } from '../../lib/chains/networks';
import { MAINNET_TOKENS } from '../../lib/chains/tokens';
import { RpcErrorKind, classifyRpcError } from '../../lib/web3/errors';
import { CallResult, TOKEN_CALLS, TokenRow, tokenRowsFromResults } from './tokenBalances';

/**
 * ERC-20 balances for the allowlist, read from Ethereum Mainnet regardless of the wallet's chain.
 * wagmi batches all calls into a single Multicall3 `eth_call`; `allowFailure` isolates a bad token.
 */
export function useTokenBalances(address: `0x${string}` | undefined) {
  const contracts = address
    ? MAINNET_TOKENS.flatMap((token) =>
        TOKEN_CALLS.map((functionName) => ({
          address: token.address,
          abi: erc20Abi,
          functionName,
          args: functionName === 'balanceOf' ? ([address] as const) : undefined,
          chainId: MAINNET_CHAIN_ID,
        })),
      )
    : [];

  const query = useReadContracts({
    contracts: contracts as never,
    allowFailure: true,
    query: { enabled: Boolean(address), staleTime: 30_000, refetchInterval: 60_000 },
  });

  const rows: TokenRow[] | null = address ? tokenRowsFromResults(MAINNET_TOKENS, query.data as CallResult[] | undefined) : null;
  return {
    state: !address ? 'idle' : query.status === 'success' ? 'live' : query.status === 'error' ? 'error' : 'loading',
    rows,
    updatedAt: query.status === 'success' ? query.dataUpdatedAt : null,
    errorKind: query.error ? (classifyRpcError(query.error) as RpcErrorKind) : null,
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
  } as const;
}
