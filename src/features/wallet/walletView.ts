import { describeNetwork, isMainnet } from '../../lib/chains/networks';
import { toChecksumAddress } from '../../lib/format/eth';

export type WalletView =
  /** No injected EIP-1193 provider was found in this browser. */
  | { status: 'unavailable' }
  | { status: 'disconnected' }
  /** A connection request is open in the wallet. */
  | { status: 'connecting' }
  | { status: 'connected'; address: `0x${string}`; chainId: number; networkName: string; onMainnet: boolean };

export interface ConnectionSnapshot {
  status: 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
  address: string | undefined;
  chainId: number | undefined;
}

/**
 * Turns raw wagmi connection state into what the UI may claim. A wallet only counts as connected
 * when the provider reports a valid address and chain; anything else falls back to not connected.
 */
export function deriveWalletView(connection: ConnectionSnapshot, hasProvider: boolean): WalletView {
  if (connection.status === 'connecting' || connection.status === 'reconnecting') return { status: 'connecting' };
  if (connection.status === 'connected') {
    const address = toChecksumAddress(connection.address);
    if (address && typeof connection.chainId === 'number') {
      return {
        status: 'connected',
        address,
        chainId: connection.chainId,
        networkName: describeNetwork(connection.chainId),
        onMainnet: isMainnet(connection.chainId),
      };
    }
  }
  return hasProvider ? { status: 'disconnected' } : { status: 'unavailable' };
}

export interface ConnectorLike {
  id: string;
  name: string;
  icon?: string | undefined;
}

export interface WalletOption {
  id: string;
  name: string;
  /** Wallet-supplied icon, accepted only as an inline raster/SVG data URI. */
  icon: string | null;
}

const SAFE_ICON = /^data:image\/(png|svg\+xml|webp|jpeg|gif);/i;

/**
 * Wallets the visitor can choose from. EIP-6963 announcements (one per installed wallet) are
 * preferred; the generic `window.ethereum` connector is used only when nothing was announced.
 */
export function listWalletOptions(connectors: readonly ConnectorLike[], hasInjectedGlobal: boolean): WalletOption[] {
  const toOption = (connector: ConnectorLike): WalletOption => ({
    id: connector.id,
    name: connector.name,
    icon: connector.icon && SAFE_ICON.test(connector.icon) ? connector.icon : null,
  });
  const announced = connectors.filter((connector) => connector.id !== 'injected');
  if (announced.length > 0) return announced.map(toOption);
  const generic = connectors.find((connector) => connector.id === 'injected');
  return generic && hasInjectedGlobal ? [{ ...toOption(generic), name: 'Browser wallet' }] : [];
}
