/**
 * Shared data-state vocabulary (see docs/PRODUCT.md and AGENTS.md rule 5).
 * Every visible figure or control must carry one of these labels.
 */
export type DataState =
  | 'live'
  | 'stale'
  | 'wallet'
  | 'demo'
  | 'disconnected'
  | 'unavailable'
  | 'loading'
  | 'error'
  | 'next'
  | 'planned';

export const DATA_STATE_LABEL: Record<DataState, string> = {
  live: 'LIVE',
  stale: 'STALE',
  wallet: 'WALLET',
  demo: 'DEMO',
  disconnected: 'NOT CONNECTED',
  unavailable: 'UNAVAILABLE',
  loading: 'LOADING',
  error: 'ERROR',
  next: 'COMING NEXT',
  planned: 'PLANNED',
};

export const DATA_STATE_MEANING: Record<DataState, string> = {
  live: 'Read from Ethereum Mainnet via a public RPC at the time shown.',
  stale: 'Last successful read is older than expected. Not presented as current.',
  wallet: 'Reported by the wallet you connected.',
  demo: 'Computed locally in your browser. No funds, nothing on-chain.',
  disconnected: 'Requires a wallet connection you start yourself.',
  unavailable: 'No data source is wired up, or the source failed.',
  loading: 'A request is in flight.',
  error: 'The request failed. Nothing is substituted.',
  next: 'Arrives in the next milestone. Not functional yet.',
  planned: 'Scheduled for a later milestone. Not functional yet.',
};
