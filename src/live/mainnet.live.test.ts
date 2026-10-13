/**
 * Real Ethereum Mainnet checks through the default public RPC. Opt-in: `npm run test:live`.
 * Exercises the same transforms the UI uses; no mocks, no wallet, read-only calls only.
 */
import { createPublicClient, erc20Abi, http, toHex } from 'viem';
import { mainnet } from 'viem/chains';
import { describe, expect, it } from 'vitest';
import { feeHistoryToPoints, recentBlockNumbers, toBlockSummary } from '../features/ecosystem/blocks';
import { TOKEN_CALLS, tokenRowsFromResults } from '../features/assets/tokenBalances';
import { decodeLogs, deriveTxStatus } from '../features/transactions/txLookup';
import { createLimiter } from '../lib/concurrency';
import { MAINNET_TOKENS } from '../lib/chains/tokens';
import { DEFAULT_MAINNET_RPC_URL } from '../lib/web3/rpc';

const client = createPublicClient({ chain: mainnet, transport: http(DEFAULT_MAINNET_RPC_URL, { timeout: 15_000, retryCount: 2 }) });
const HOLDER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // public, well-known address (vitalik.eth)

describe('live Ethereum Mainnet (PublicNode)', { timeout: 60_000 }, () => {
  it('serves chain 1', async () => {
    expect(await client.getChainId()).toBe(1);
  });

  it('reads the 10 most recent block headers with bounded concurrency', async () => {
    const latest = await client.getBlockNumber();
    const limit = createLimiter(3);
    const blocks = await Promise.all(recentBlockNumbers(latest, 10).map((n) => limit(() => client.getBlock({ blockNumber: n }))));
    const summaries = blocks.map(toBlockSummary);
    expect(summaries.every(Boolean)).toBe(true);
    summaries.forEach((s, i) => {
      expect(s!.number).toBe(latest - BigInt(i));
      expect(s!.gasUsed <= s!.gasLimit).toBe(true);
      expect(s!.baseFeePerGas).not.toBeNull();
    });
    expect(summaries[0]!.timestampMs >= summaries[9]!.timestampMs).toBe(true);
  });

  it('returns 20 observed base fees plus the protocol-computed next one', async () => {
    const points = feeHistoryToPoints(await client.getFeeHistory({ blockCount: 20, blockTag: 'latest', rewardPercentiles: [] }));
    expect(points).toHaveLength(21);
    expect(points.slice(0, 20).every((p) => p.kind === 'observed' && typeof p.baseFee === 'bigint' && p.baseFee > 0n)).toBe(true);
    expect(points[20].kind).toBe('next');
  });

  it('reads allowlisted ERC-20 balances in one multicall with matching on-chain decimals', async () => {
    const results = await client.multicall({
      allowFailure: true,
      contracts: MAINNET_TOKENS.flatMap((token) =>
        TOKEN_CALLS.map((functionName) => ({ address: token.address, abi: erc20Abi, functionName, args: functionName === 'balanceOf' ? [HOLDER] : undefined })),
      ) as never,
    });
    const rows = tokenRowsFromResults(MAINNET_TOKENS, results as never)!;
    expect(rows.map((r) => r.state)).toEqual(['ok', 'ok', 'ok']);
    rows.forEach((r) => r.state === 'ok' && expect(r.totalSupply! > 0n).toBe(true));
  });

  it('inspects a real transaction and decodes ERC-20 transfers in a recent block', async () => {
    const block = await client.getBlock({ blockTag: 'latest' });
    const hash = block.transactions[0];
    const [tx, receipt] = await Promise.all([client.getTransaction({ hash }), client.getTransactionReceipt({ hash })]);
    expect(['success', 'reverted']).toContain(deriveTxStatus(tx, receipt));

    // Test-only: one eth_getBlockReceipts call to find standard ERC-20 transfers in the same block.
    const receipts = (await client.request({ method: 'eth_getBlockReceipts' as never, params: [toHex(block.number!)] as never })) as {
      logs: { address: `0x${string}`; topics: `0x${string}`[]; data: `0x${string}`; logIndex: `0x${string}` }[];
    }[];
    const logs = receipts.flatMap((r) => r.logs.map((l) => ({ ...l, logIndex: Number(l.logIndex) })));
    const decoded = decodeLogs(logs, logs.length).items;
    expect(decoded.some((log) => log.kind === 'erc20-transfer')).toBe(true);
  });

  it('reports an unknown hash as not found', async () => {
    await expect(client.getTransaction({ hash: ('0x' + '00'.repeat(31) + '01') as `0x${string}` })).rejects.toMatchObject({
      name: 'TransactionNotFoundError',
    });
  });
});
