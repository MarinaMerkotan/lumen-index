import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '../../components/ambient/MotionContext';
import type { ChainTelemetry } from './useChainTelemetry';

const telemetry = vi.hoisted(() => ({ current: null as unknown as ChainTelemetry }));
vi.mock('./useChainTelemetry', () => ({ useChainTelemetry: () => telemetry.current }));
vi.mock('./useBlockExplorer', () => ({
  RECENT_BLOCK_COUNT: 10,
  useRecentBlocks: () => [],
  useFeeHistory: () => ({ data: undefined, isError: false, isPlaceholderData: false, refetch: () => undefined }),
  useBlockSummary: () => ({ status: 'pending', data: undefined, refetch: () => undefined }),
}));
vi.mock('../transactions/useTransactionLookup', () => ({
  useTransactionLookup: () => ({ status: 'idle', tx: null, receipt: null, errorKind: null, isFetching: false, retry: () => undefined }),
}));

const { EcosystemSection } = await import('./EcosystemSection');

const base: ChainTelemetry = {
  state: 'loading',
  errorKind: null,
  chainId: null,
  block: null,
  priorityFee: null,
  lastSuccess: null,
  isFetching: false,
  retry: () => undefined,
};

function render(overrides: Partial<ChainTelemetry>) {
  telemetry.current = { ...base, ...overrides };
  return renderToStaticMarkup(
    <MotionProvider>
      <EcosystemSection />
    </MotionProvider>,
  );
}

const BLOCK = { number: 24_086_394n, timestampMs: Date.now(), baseFeePerGas: 412_340_000n, gasUsed: 18_000_000n, gasLimit: 36_000_000n };

describe('EcosystemSection states', () => {
  it('shows LOADING and no figures before the RPC answers', () => {
    const html = render({});
    expect(html).toContain('LOADING');
    expect(html).toContain('Contacting the RPC');
    expect(html).not.toMatch(/#\d{1,3},\d{3}/);
    expect(html).not.toContain('gwei');
  });

  it('renders real values with explorer link while LIVE', () => {
    const html = render({ state: 'live', chainId: 1, block: BLOCK, priorityFee: 50_000_000n, lastSuccess: { number: BLOCK.number, at: Date.now() } });
    expect(html).toContain('LIVE');
    expect(html).toContain('#24,086,394');
    expect(html).toContain('https://etherscan.io/block/24086394');
    expect(html).toContain('0.412 gwei');
    expect(html).toContain('0.05 gwei');
    expect(html).toContain('50.0% of gas limit');
    expect(html).not.toContain('RETRY');
  });

  it('shows ERROR with a retry action and withholds current values', () => {
    const html = render({ state: 'error', errorKind: 'rate-limited', lastSuccess: { number: BLOCK.number, at: Date.now() } });
    expect(html).toContain('ERROR');
    expect(html).toContain('rate limiting');
    expect(html).toContain('RETRY');
    expect(html).toContain('Last successful read: block #24,086,394');
    expect(html).not.toContain('etherscan.io/block');
  });

  it('labels old data as STALE and offers a retry', () => {
    const html = render({ state: 'stale', chainId: 1, block: BLOCK });
    expect(html).toContain('STALE');
    expect(html).toContain('may be out of date');
    expect(html).toContain('RETRY');
  });
});
