import { describe, expect, it } from 'vitest';
import { deriveWalletView, listWalletOptions } from './walletView';

const ADDRESS = '0x52908400098527886e0f7030069857d2e4169ee7';

describe('deriveWalletView', () => {
  it('reports no wallet when nothing is injected', () => {
    expect(deriveWalletView({ status: 'disconnected', address: undefined, chainId: undefined }, false)).toEqual({ status: 'unavailable' });
  });

  it('is disconnected by default when a wallet exists', () => {
    expect(deriveWalletView({ status: 'disconnected', address: undefined, chainId: undefined }, true)).toEqual({ status: 'disconnected' });
  });

  it('maps connecting and reconnecting to connecting', () => {
    expect(deriveWalletView({ status: 'connecting', address: undefined, chainId: undefined }, true).status).toBe('connecting');
    expect(deriveWalletView({ status: 'reconnecting', address: undefined, chainId: undefined }, true).status).toBe('connecting');
  });

  it('exposes a checksummed address on Ethereum Mainnet', () => {
    expect(deriveWalletView({ status: 'connected', address: ADDRESS, chainId: 1 }, true)).toEqual({
      status: 'connected',
      address: '0x52908400098527886E0F7030069857D2E4169EE7',
      chainId: 1,
      networkName: 'Ethereum Mainnet',
      onMainnet: true,
    });
  });

  it('flags a network mismatch with the real wallet network', () => {
    const view = deriveWalletView({ status: 'connected', address: ADDRESS, chainId: 137 }, true);
    expect(view).toMatchObject({ status: 'connected', networkName: 'Polygon', onMainnet: false });
    expect(deriveWalletView({ status: 'connected', address: ADDRESS, chainId: 99999 }, true)).toMatchObject({
      networkName: 'Chain ID 99999',
      onMainnet: false,
    });
  });

  it('never claims a connection without a valid address and chain', () => {
    expect(deriveWalletView({ status: 'connected', address: '0xnope', chainId: 1 }, true)).toEqual({ status: 'disconnected' });
    expect(deriveWalletView({ status: 'connected', address: ADDRESS, chainId: undefined }, true)).toEqual({ status: 'disconnected' });
  });
});

describe('listWalletOptions', () => {
  const generic = { id: 'injected', name: 'Injected' };
  const metamask = { id: 'io.metamask', name: 'MetaMask', icon: 'data:image/svg+xml;base64,PHN2Zz4=' };
  const rabby = { id: 'io.rabby', name: 'Rabby', icon: 'javascript:alert(1)' };

  it('prefers EIP-6963 announced wallets over the generic connector', () => {
    expect(listWalletOptions([generic, metamask, rabby], true).map((o) => o.id)).toEqual(['io.metamask', 'io.rabby']);
  });

  it('falls back to the generic connector only when window.ethereum exists', () => {
    expect(listWalletOptions([generic], true)).toEqual([{ id: 'injected', name: 'Browser wallet', icon: null }]);
    expect(listWalletOptions([generic], false)).toEqual([]);
  });

  it('drops wallet icons that are not inline images', () => {
    const [mm, rb] = listWalletOptions([metamask, rabby], true);
    expect(mm.icon).toBe(metamask.icon);
    expect(rb.icon).toBeNull();
  });
});
