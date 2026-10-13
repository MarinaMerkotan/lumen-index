/**
 * Wallet UI contract. M1 ships no wallet SDK, so the only truthful state is `disconnected`
 * with connection unavailable. M2 replaces `useWalletState` with a wagmi-backed hook that
 * returns the same shape (extended with connecting/connected/wrong-chain states) and a real
 * user-initiated `connect` action. Nothing here talks to `window.ethereum`.
 */
export type WalletUiState = {
  status: 'disconnected';
  /** False until a wallet integration exists; the connect control is rendered as COMING NEXT. */
  canConnect: false;
};

export interface WalletController {
  state: WalletUiState;
  connect: () => void;
}

const DISCONNECTED: WalletUiState = { status: 'disconnected', canConnect: false };

export function useWalletState(): WalletController {
  return { state: DISCONNECTED, connect: noop };
}

function noop() {
  /* Intentionally inert: wallet connection is implemented in milestone 2. */
}
