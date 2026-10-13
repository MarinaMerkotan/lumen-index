import { ReactNode, createContext } from 'react';
import { WALLET_ERROR_MESSAGE } from '../../lib/web3/errors';
import { truncateAddress } from '../../lib/format/eth';
import type { WalletController } from './useWalletState';
import { useWalletController } from './useWalletState';

export const WalletContext = createContext<WalletController | null>(null);

function announcement({ view, error }: WalletController): string {
  if (error) return WALLET_ERROR_MESSAGE[error.kind];
  if (view.status === 'connected') return `Wallet connected: ${truncateAddress(view.address)} on ${view.networkName}.`;
  if (view.status === 'connecting') return 'Waiting for your wallet to respond.';
  return '';
}

/** Single source of wallet state so header, menu and sections agree (and share error state). */
export function WalletProvider({ children }: { children: ReactNode }) {
  const controller = useWalletController();
  return (
    <WalletContext.Provider value={controller}>
      {children}
      <p className="sr-only" aria-live="polite">
        {announcement(controller)}
      </p>
    </WalletContext.Provider>
  );
}
