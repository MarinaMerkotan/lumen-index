import { parseEther, parseUnits } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import { MAINNET_TOKENS } from '../../lib/chains/tokens';
import type { MainnetBalance } from './useMainnetBalance';
import type { TokenRow } from './tokenBalances';
import { connectedOn, controller, renderWithWallet } from '../wallet/testUtils';

const data = vi.hoisted(() => ({ eth: null as unknown, tokens: null as unknown }));
vi.mock('./useMainnetBalance', () => ({ useMainnetBalance: () => data.eth }));
vi.mock('./useTokenBalances', () => ({ useTokenBalances: () => data.tokens }));

const { LumenIndexSection } = await import('./LumenIndexSection');

const ethIdle: MainnetBalance = { state: 'idle', wei: null, updatedAt: null, errorKind: null, isFetching: false, retry: () => undefined };
const okRows: TokenRow[] = [
  { token: MAINNET_TOKENS[0], state: 'ok', balance: parseUnits('1234.5', 6), totalSupply: null },
  { token: MAINNET_TOKENS[1], state: 'ok', balance: 0n, totalSupply: null },
  { token: MAINNET_TOKENS[2], state: 'error' },
];

function render(view: Parameters<typeof controller>[0], eth: Partial<MainnetBalance> = {}, tokens: Record<string, unknown> = {}) {
  data.eth = { ...ethIdle, ...eth };
  data.tokens = { state: 'loading', rows: null, updatedAt: null, errorKind: null, isFetching: false, retry: () => undefined, ...tokens };
  return renderWithWallet(<LumenIndexSection />, controller(view));
}

describe('LumenIndexSection (connected wallet mode)', () => {
  it('starts in Connected Wallet mode with a connect action and an explore escape hatch', () => {
    const html = render({ status: 'disconnected' });
    expect(html).toMatch(/role="tab"[^>]*aria-selected="true"[^>]*>CONNECTED WALLET/);
    expect(html).toContain('CONNECT WALLET');
    expect(html).toContain('Explore an address');
    expect(html).not.toContain('ASSETS ON ETHEREUM MAINNET');
  });

  it('shows the connected address with ETH and token balances, zero explicitly and errors honestly', () => {
    const html = render(connectedOn(1, 'Ethereum Mainnet'), { state: 'live', wei: parseEther('1.5'), updatedAt: Date.now() }, { state: 'live', rows: okRows });
    expect(html).toContain('0x52908400098527886E0F7030069857D2E4169EE7');
    expect(html).toContain('ASSETS ON ETHEREUM MAINNET');
    expect(html).toMatch(/>1\.5</);
    expect(html).toMatch(/>1,234\.5</);
    expect(html).toMatch(/DAI[\s\S]*?>0</);
    expect(html).toMatch(/WETH[\s\S]*?RETRY/);
    expect(html).toContain('https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
    expect(html).not.toMatch(/\$|USD [0-9]/);
  });

  it('explains that assets come from Mainnet when the wallet is on another network', () => {
    const html = render(connectedOn(8453, 'Base'), { state: 'loading' });
    expect(html).toContain('not supported');
    expect(html).toContain('SWITCH TO ETHEREUM MAINNET');
    expect(html).toContain('Assets below are read from Ethereum Mainnet, not from Base.');
  });

  it('marks decimals mismatches instead of formatting a guess', () => {
    const rows: TokenRow[] = [{ token: MAINNET_TOKENS[0], state: 'decimals-mismatch', onchainDecimals: 18 }, okRows[1], okRows[2]];
    const html = render(connectedOn(1, 'Ethereum Mainnet'), { state: 'live', wei: 0n, updatedAt: Date.now() }, { state: 'live', rows });
    expect(html).toContain('decimals mismatch (18); not shown');
  });

  it('shows RPC errors for the ETH balance with a retry', () => {
    const html = render(connectedOn(1, 'Ethereum Mainnet'), { state: 'error', errorKind: 'timeout' }, { state: 'error', errorKind: 'timeout' });
    expect(html).toContain('did not answer in time');
    expect(html).toContain('RETRY');
  });
});
