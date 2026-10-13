import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors/injected';
import { RPC_TIMEOUT_MS, resolveRpcUrl } from './rpc';

export const MAINNET_RPC_URL = resolveRpcUrl(import.meta.env.VITE_MAINNET_RPC_URL);

/**
 * Frontend-only wagmi configuration.
 * - Ethereum Mainnet only, read through a public RPC (no keys). No write paths are used anywhere.
 * - Injected EIP-1193 wallets only: a generic `window.ethereum` connector plus EIP-6963 discovery,
 *   which passively lists installed wallets without requesting any permission.
 * - `storage: null`: the app persists no wallet or connection state; combined with
 *   `reconnectOnMount={false}` on the provider, nothing connects until the visitor clicks.
 */
export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected({ shimDisconnect: false })],
  multiInjectedProviderDiscovery: true,
  storage: null,
  ssr: false,
  transports: {
    [mainnet.id]: http(MAINNET_RPC_URL, { timeout: RPC_TIMEOUT_MS, retryCount: 1, batch: false }),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
