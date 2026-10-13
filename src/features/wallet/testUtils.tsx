import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MotionProvider } from '../../components/ambient/MotionContext';
import { WalletContext } from './WalletContext';
import type { WalletController } from './useWalletState';
import type { WalletView } from './walletView';

export const TEST_ADDRESS = '0x52908400098527886E0F7030069857D2E4169EE7' as const;

export function controller(view: WalletView, overrides: Partial<WalletController> = {}): WalletController {
  return {
    view,
    options: view.status === 'unavailable' ? [] : [{ id: 'io.metamask', name: 'MetaMask', icon: null }],
    error: null,
    isSwitching: false,
    detection: 'idle',
    retryDetection: () => undefined,
    connect: () => undefined,
    disconnect: () => undefined,
    switchToMainnet: () => undefined,
    ...overrides,
  };
}

export const connectedOn = (chainId: number, networkName: string): WalletView => ({
  status: 'connected',
  address: TEST_ADDRESS,
  chainId,
  networkName,
  onMainnet: chainId === 1,
});

/** Static render with a fixed wallet state (no wagmi, no wallet extension). */
export function renderWithWallet(ui: ReactElement, value: WalletController): string {
  return renderToStaticMarkup(
    <MotionProvider>
      <WalletContext.Provider value={value}>{ui}</WalletContext.Provider>
    </MotionProvider>,
  );
}
