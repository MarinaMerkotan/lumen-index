import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { MAINNET_CHAIN_ID } from '../../lib/chains/networks';
import { createLimiter } from '../../lib/concurrency';
import { BlockSummary, FeePoint, feeHistoryToPoints, recentBlockNumbers, toBlockSummary } from './blocks';

export const RECENT_BLOCK_COUNT = 10;
export const FEE_HISTORY_BLOCKS = 20;

/** At most 3 block reads in flight to the public RPC at any time (initial fill = 10 blocks). */
const blockReads = createLimiter(3);

export const blockQueryKey = (number: bigint) => ['lumen', 'block', number.toString()] as const;

type MainnetClient = NonNullable<ReturnType<typeof usePublicClient>>;

async function fetchBlockSummary(client: MainnetClient, number: bigint): Promise<BlockSummary> {
  const block = await blockReads(() => client.getBlock({ blockNumber: number, includeTransactions: false }));
  const summary = toBlockSummary(block);
  if (!summary) throw new Error('Block is not mined yet');
  return summary;
}

function useMainnetClient() {
  return usePublicClient({ chainId: MAINNET_CHAIN_ID });
}

/**
 * One cached query per block number. Mined blocks are immutable, so after the initial fill each new
 * head costs exactly one `eth_getBlock` (header + tx hashes only, never full transactions).
 */
export function useBlockSummary(number: bigint | null) {
  const client = useMainnetClient();
  return useQuery({
    queryKey: number === null ? ['lumen', 'block', 'none'] : blockQueryKey(number),
    enabled: number !== null && Boolean(client),
    staleTime: Infinity,
    gcTime: 10 * 60_000,
    retry: 2,
    queryFn: () => fetchBlockSummary(client!, number!),
  });
}

export interface RecentBlockRow {
  number: bigint;
  status: 'pending' | 'error' | 'success';
  block: BlockSummary | null;
  retry: () => void;
}

export function useRecentBlocks(latest: bigint | null): RecentBlockRow[] {
  const client = useMainnetClient();
  const numbers = latest === null ? [] : recentBlockNumbers(latest, RECENT_BLOCK_COUNT);
  const results = useQueries({
    queries: numbers.map((number) => ({
      queryKey: blockQueryKey(number),
      enabled: Boolean(client),
      staleTime: Infinity,
      gcTime: 10 * 60_000,
      retry: 2,
      queryFn: () => fetchBlockSummary(client!, number),
    })),
  });
  return numbers.map((number, i) => ({
    number,
    status: results[i].status,
    block: results[i].data ?? null,
    retry: () => void results[i].refetch(),
  }));
}

/** One `eth_feeHistory` call per new head covers the whole chart (20 blocks + next base fee). */
export function useFeeHistory(latest: bigint | null) {
  const client = useMainnetClient();
  const query = useQuery({
    queryKey: ['lumen', 'fee-history', FEE_HISTORY_BLOCKS, latest?.toString() ?? 'none'],
    enabled: latest !== null && Boolean(client),
    staleTime: Infinity,
    gcTime: 2 * 60_000,
    retry: 2,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<FeePoint[]> => {
      const history = await client!.getFeeHistory({ blockCount: FEE_HISTORY_BLOCKS, blockNumber: latest!, rewardPercentiles: [] });
      return feeHistoryToPoints(history);
    },
  });
  return query;
}
