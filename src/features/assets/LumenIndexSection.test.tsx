import { parseEther } from 'viem';
import { describe, expect, it, vi } from 'vitest';
import type { MainnetBalance } from './useMainnetBalance';
import { connectedOn, controller, renderWithWallet } from '../wallet/testUtils';

const balance = vi.hoisted(() => ({ current: null as unknown as MainnetBalance }));
vi.mock('./useMainnetBalance', () => ({ useMainnetBalance: () => balance.current }));

const { LumenIndexSection } = await import('./LumenIndexSection');

const idle: MainnetBalance = { state: 'idle', wei: null, updatedAt: null, errorKind: null, isFetching: false, retry: () => undefined };

function render(view: Parameters<typeof controller>[0], b: Partial<MainnetBalance> = {}) {
  balance.current = { ...idle, ...b };
  return renderWithWallet(<LumenIndexSection />, controller(view));
}

describe('LumenIndexSection states', () => {
  it('is disconnected with no address or balance by default', () => {
    const html = render({ status: 'disconnected' });
    expect(html).toContain('NOT CONNECTED');
    expect(html).toContain('Not connected');
    expect(html).not.toContain(' ETH<');
  });

  it('shows the full address, explorer link and live Mainnet balance', () => {
    const html = render(connectedOn(1, 'Ethereum Mainnet'), { state: 'live', wei: parseEther('1.5'), updatedAt: Date.now() });
    expect(html).toContain('0x52908400098527886E0F7030069857D2E4169EE7');
    expect(html).toContain('https://etherscan.io/address/0x52908400098527886E0F7030069857D2E4169EE7');
    expect(html).toMatch(/1\.5 <span[^>]*>ETH<\/span>/);
    expect(html).toContain('Native ETH on Ethereum Mainnet');
    expect(html).toContain('DISCONNECT');
    expect(html).toContain('Some wallets keep access');
  });

  it('never presents another network as Mainnet and offers a switch', () => {
    const html = render(connectedOn(8453, 'Base'), { state: 'loading' });
    expect(html).toContain('Base');
    expect(html).toContain('not supported');
    expect(html).toContain('SWITCH TO ETHEREUM MAINNET');
    expect(html).toContain('read from Ethereum Mainnet, not from Base');
    expect(html).toContain('READING MAINNET');
  });

  it('shows a balance error with retry instead of a number', () => {
    const html = render(connectedOn(1, 'Ethereum Mainnet'), { state: 'error', errorKind: 'timeout' });
    expect(html).toContain('did not answer in time');
    expect(html).toContain('RETRY');
  });
});
