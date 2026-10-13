import { useBalance } from 'wagmi';
import { MAINNET_CHAIN_ID } from '../../lib/chains/networks';
import { RpcErrorKind, classifyRpcError } from '../../lib/web3/errors';

export interface MainnetBalance {
  state: 'idle' | 'loading' | 'live' | 'error';
  /** Native ETH on Ethereum Mainnet in wei, read through the public RPC (not the wallet's chain). */
  wei: bigint | null;
  updatedAt: number | null;
  errorKind: RpcErrorKind | null;
  isFetching: boolean;
  retry: () => void;
}

export function useMainnetBalance(address: `0x${string}` | undefined): MainnetBalance {
  const query = useBalance({
    address,
    chainId: MAINNET_CHAIN_ID,
    query: { enabled: Boolean(address), staleTime: 15_000, refetchInterval: 30_000 },
  });

  if (!address) {
    return { state: 'idle', wei: null, updatedAt: null, errorKind: null, isFetching: false, retry: () => undefined };
  }
  const state = query.status === 'success' ? 'live' : query.status === 'error' ? 'error' : 'loading';
  return {
    state,
    wei: state === 'live' ? query.data!.value : null,
    updatedAt: state === 'live' ? query.dataUpdatedAt : null,
    errorKind: state === 'error' ? classifyRpcError(query.error) : null,
    isFetching: query.isFetching,
    retry: () => void query.refetch(),
  };
}
