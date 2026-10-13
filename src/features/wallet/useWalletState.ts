import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { useConnect, useConnection, useConnectionEffect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi';
import { MAINNET_CHAIN_ID } from '../../lib/chains/networks';
import { emitPulse } from '../../lib/pulseBus';
import { WalletErrorKind, classifyWalletError } from '../../lib/web3/errors';
import { WalletContext } from './WalletContext';
import { DetectionStatus, useWalletDetection } from './detection';
import { WalletOption, WalletView, deriveWalletView, listWalletOptions } from './walletView';

export interface WalletController {
  view: WalletView;
  options: WalletOption[];
  /** Last failed wallet request (connect or network switch), cleared on the next attempt. */
  error: { kind: WalletErrorKind; action: 'connect' | 'switch' } | null;
  isSwitching: boolean;
  /** Manual rediscovery state for the no-wallet panel. */
  detection: DetectionStatus;
  retryDetection: () => void;
  connect: (optionId?: string) => void;
  disconnect: () => void;
  switchToMainnet: () => void;
}

/** Passive check for an injected provider. Reading the property requests no permission. */
function hasInjectedGlobal(): boolean {
  return typeof window !== 'undefined' && Boolean((window as { ethereum?: unknown }).ethereum);
}

const noopSubscribe = () => () => undefined;

/**
 * Real wallet state from wagmi (injected EIP-1193 wallets). Mounted once by `WalletProvider`;
 * components read it through `useWalletState()`. Nothing here runs a wallet request on its own:
 * connect, disconnect and switch are only invoked from click handlers.
 */
export function useWalletController(): WalletController {
  const connection = useConnection();
  const connectors = useConnectors();
  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();
  const switchMutation = useSwitchChain();
  const detection = useWalletDetection();
  // Re-read on every render; a detection retry re-renders this hook when its window closes.
  const injectedGlobal = useSyncExternalStore(noopSubscribe, hasInjectedGlobal, () => false);

  useConnectionEffect({
    onConnect: () => emitPulse('wallet-connected'),
    onDisconnect: () => emitPulse('wallet-disconnected'),
  });

  const options = useMemo(() => listWalletOptions(connectors, injectedGlobal), [connectors, injectedGlobal]);

  const { mutate: connectMutate, reset: resetConnect } = connectMutation;
  const { mutate: disconnectMutate } = disconnectMutation;
  const { mutate: switchMutate, reset: resetSwitch } = switchMutation;

  const connect = useCallback(
    (optionId?: string) => {
      const connector = connectors.find((item) => item.id === (optionId ?? options[0]?.id));
      if (!connector) return;
      resetSwitch();
      // No `chainId` here: switching networks is a separate, explicit action.
      connectMutate({ connector });
    },
    [connectors, options, connectMutate, resetSwitch],
  );

  /** Clears this app's connection; wagmi also asks the wallet to revoke permissions where supported (EIP-2255). */
  const disconnect = useCallback(() => {
    resetConnect();
    resetSwitch();
    disconnectMutate();
  }, [disconnectMutate, resetConnect, resetSwitch]);

  const switchToMainnet = useCallback(() => switchMutate({ chainId: MAINNET_CHAIN_ID }), [switchMutate]);

  const error: WalletController['error'] = switchMutation.error
    ? { kind: classifyWalletError(switchMutation.error), action: 'switch' }
    : connectMutation.error
      ? { kind: classifyWalletError(connectMutation.error), action: 'connect' }
      : null;

  return {
    view: deriveWalletView({ status: connection.status, address: connection.address, chainId: connection.chainId }, options.length > 0),
    options,
    error,
    isSwitching: switchMutation.isPending,
    detection: detection.status,
    retryDetection: detection.retry,
    connect,
    disconnect,
    switchToMainnet,
  };
}

export function useWalletState(): WalletController {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWalletState must be used inside <WalletProvider>');
  return context;
}
