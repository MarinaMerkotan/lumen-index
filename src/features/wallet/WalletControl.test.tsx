import { describe, expect, it } from 'vitest';
import { WalletControl } from './WalletControl';
import { TEST_ADDRESS, connectedOn, controller, renderWithWallet } from './testUtils';

const render = (...args: Parameters<typeof controller>) => renderWithWallet(<WalletControl />, controller(...args));

describe('WalletControl presentation', () => {
  it('keeps CONNECT WALLET as the primary action even when no wallet is detected', () => {
    const html = render({ status: 'unavailable' });
    expect(html).toContain('NO WALLET DETECTED');
    expect(html).toMatch(/<button[^>]*class="wallet-cta[^"]*"[^>]*aria-haspopup="dialog"[^>]*>.*CONNECT WALLET/s);
  });

  it('renders the primary CTA in every not-connected state', () => {
    for (const view of [{ status: 'unavailable' }, { status: 'disconnected' }, { status: 'connecting' }] as const) {
      expect(render(view)).toContain('class="wallet-cta');
    }
    expect(render(connectedOn(1, 'Ethereum Mainnet'))).not.toContain('class="wallet-cta');
  });

  it('offers a connect action while disconnected and shows no address', () => {
    const html = render({ status: 'disconnected' });
    expect(html).toContain('NOT CONNECTED');
    expect(html).toContain('CONNECT WALLET');
    expect(html).not.toMatch(/0x[0-9a-f]{4}/i);
  });

  it('shows a busy, disabled CTA while the wallet prompt is open', () => {
    const html = render({ status: 'connecting' });
    expect(html).toContain('CHECK YOUR WALLET');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-busy="true"/);
  });

  it('shows the real (truncated) address and Mainnet once connected', () => {
    const html = render(connectedOn(1, 'Ethereum Mainnet'));
    expect(html).toContain('0x5290…9EE7');
    expect(html).toContain(`Copy wallet address ${TEST_ADDRESS}`);
    expect(html).toContain('[ MAINNET ]');
    expect(html).toContain('Disconnect wallet');
    expect(html).not.toContain('Switch wallet network');
  });

  it('surfaces a network mismatch with the actual network and a switch action', () => {
    const html = render(connectedOn(137, 'Polygon'));
    expect(html).toContain('[ POLYGON ]');
    expect(html).toContain('Switch wallet network to Ethereum Mainnet');
    expect(html).not.toContain('[ MAINNET ]');
  });

  it('reports a rejected request', () => {
    const html = render({ status: 'disconnected' }, { error: { kind: 'rejected', action: 'connect' } });
    expect(html).toContain('REJECTED');
    const stacked = renderWithWallet(<WalletControl variant="stacked" />, controller({ status: 'disconnected' }, { error: { kind: 'rejected', action: 'connect' } }));
    expect(stacked).toContain('Request rejected in your wallet');
  });
});
