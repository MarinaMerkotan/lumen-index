import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBlock, useEstimateMaxPriorityFeePerGas, usePublicClient } from 'wagmi';
import { MAINNET_CHAIN_ID } from '../../lib/chains/networks';
import { RpcErrorKind, WrongChainRpcError } from '../../lib/web3/errors';
import { useNow } from '../../hooks/useNow';
import { TelemetryState, deriveTelemetryState, nextBlockPollMs, telemetryErrorKind } from './telemetryState';

export interface BlockSnapshot {
  number: bigint;
  timestampMs: number;
  baseFeePerGas: bigint | null;
  gasUsed: bigint;
  gasLimit: bigint;
}

export interface ChainTelemetry {
  state: TelemetryState;
  errorKind: RpcErrorKind | null;
  /** Chain ID reported by the RPC itself (verified to be 1 before any block is shown). */
  chainId: number | null;
  /** Present only while `state` is `live` or `stale`; never shown as current during errors. */
  block: BlockSnapshot | null;
  priorityFee: bigint | null;
  lastSuccess: { number: bigint; at: number } | null;
  isFetching: boolean;
  retry: () => void;
}

/**
 * Read-only Ethereum Mainnet telemetry from the public RPC. Works without a wallet.
 * React Query dedupes identical calls, so several consumers share one polling loop.
 */
export function useChainTelemetry(): ChainTelemetry {
  const client = usePublicClient({ chainId: MAINNET_CHAIN_ID });
  const now = useNow(5_000);
  const lastSuccess = useRef<ChainTelemetry['lastSuccess']>(null);

  const chainQuery = useQuery({
    queryKey: ['lumen', 'rpc-chain-id', MAINNET_CHAIN_ID],
    enabled: Boolean(client),
    staleTime: Infinity,
    queryFn: async () => {
      const id = await client!.getChainId();
      if (id !== MAINNET_CHAIN_ID) throw new WrongChainRpcError(`RPC reported chain ${id}`);
      return id;
    },
  });

  const verified = chainQuery.status === 'success';

  const blockQuery = useBlock({
    chainId: MAINNET_CHAIN_ID,
    query: {
      enabled: verified,
      staleTime: 6_000,
      refetchInterval: (query) => nextBlockPollMs(query.state.status, query.state.error),
    },
  });

  const feeQuery = useEstimateMaxPriorityFeePerGas({
    chainId: MAINNET_CHAIN_ID,
    query: { enabled: verified, staleTime: 12_000, refetchInterval: 24_000, retry: 1 },
  });

  const state: TelemetryState =
    chainQuery.status !== 'success'
      ? deriveTelemetryState({ status: chainQuery.status, dataUpdatedAt: chainQuery.dataUpdatedAt }, now)
      : deriveTelemetryState({ status: blockQuery.status, dataUpdatedAt: blockQuery.dataUpdatedAt }, now);

  const raw = blockQuery.data;
  const block: BlockSnapshot | null =
    raw && raw.number !== null && (state === 'live' || state === 'stale')
      ? {
          number: raw.number,
          timestampMs: Number(raw.timestamp) * 1000,
          baseFeePerGas: raw.baseFeePerGas ?? null,
          gasUsed: raw.gasUsed,
          gasLimit: raw.gasLimit,
        }
      : null;

  if (raw && raw.number !== null && blockQuery.status === 'success') {
    lastSuccess.current = { number: raw.number, at: blockQuery.dataUpdatedAt };
  }

  return {
    state,
    errorKind: state === 'error' ? telemetryErrorKind(chainQuery.error, blockQuery.error) : null,
    chainId: chainQuery.data ?? null,
    block,
    priorityFee: state === 'live' && feeQuery.status === 'success' ? feeQuery.data : null,
    lastSuccess: lastSuccess.current,
    isFetching: chainQuery.isFetching || blockQuery.isFetching,
    retry: () => {
      if (chainQuery.status !== 'success') void chainQuery.refetch();
      else void blockQuery.refetch();
      void feeQuery.refetch();
    },
  };
}
