import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { MAINNET_CHAIN_ID } from '../../lib/chains/networks';
import { RpcErrorKind, classifyRpcError } from '../../lib/web3/errors';
import { TxStatus, deriveTxStatus } from './txLookup';

/** Pending transactions are re-checked once per slot, for at most ~5 minutes. */
export const PENDING_POLL_MS = 12_000;
export const PENDING_MAX_POLLS = 25;

function isNotFound(error: unknown): boolean {
  for (let e: unknown = error, depth = 0; e && typeof e === 'object' && depth < 6; e = (e as { cause?: unknown }).cause, depth++) {
    const name = (e as { name?: unknown }).name;
    if (name === 'TransactionNotFoundError' || name === 'TransactionReceiptNotFoundError') return true;
  }
  return false;
}

/** Retries transient RPC failures twice; a definitive "not found" is never retried automatically. */
export function shouldRetryLookup(failureCount: number, error: unknown): boolean {
  return !isNotFound(error) && failureCount < 2;
}

/**
 * Read-only lookup by hash: `eth_getTransactionByHash`, then `eth_getTransactionReceipt` once mined.
 * Two calls per lookup; no log scans, no signing, nothing submitted.
 */
export function useTransactionLookup(hash: `0x${string}` | null) {
  const client = usePublicClient({ chainId: MAINNET_CHAIN_ID });

  const txQuery = useQuery({
    queryKey: ['lumen', 'tx', hash],
    enabled: hash !== null && Boolean(client),
    retry: shouldRetryLookup,
    staleTime: 10_000,
    refetchInterval: (query) =>
      query.state.data && query.state.data.blockNumber === null && query.state.dataUpdateCount < PENDING_MAX_POLLS ? PENDING_POLL_MS : false,
    queryFn: async () => {
      try {
        return await client!.getTransaction({ hash: hash! });
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
  });

  const mined = txQuery.data?.blockNumber != null;
  const receiptQuery = useQuery({
    queryKey: ['lumen', 'receipt', hash],
    enabled: hash !== null && mined && Boolean(client),
    staleTime: Infinity,
    retry: shouldRetryLookup,
    queryFn: () => client!.getTransactionReceipt({ hash: hash! }),
  });

  const loading = hash !== null && (txQuery.status === 'pending' || (mined && receiptQuery.status === 'pending'));
  const error = txQuery.error ?? receiptQuery.error;
  const status: TxStatus | 'idle' | 'loading' | 'error' =
    hash === null ? 'idle' : error ? 'error' : loading ? 'loading' : deriveTxStatus(txQuery.data ?? null, receiptQuery.data);

  return {
    status,
    tx: txQuery.data ?? null,
    receipt: receiptQuery.data ?? null,
    errorKind: error ? (classifyRpcError(error) as RpcErrorKind) : null,
    isFetching: txQuery.isFetching || receiptQuery.isFetching,
    retry: () => {
      void txQuery.refetch();
      if (mined) void receiptQuery.refetch();
    },
  };
}
