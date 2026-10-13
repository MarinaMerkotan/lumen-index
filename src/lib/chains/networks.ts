/** The only chain this MVP reads from or asks a wallet to use. Mainnet is read-only. */
export const MAINNET_CHAIN_ID = 1;

/** Vetted explorer for Ethereum Mainnet (docs/SECURITY.md: use a fixed explorer host per chain). */
const MAINNET_EXPLORER = 'https://etherscan.io';

/**
 * Display names for chains a wallet may report. Purely descriptive: the app never reads balances
 * or sends requests on these chains, it only tells the visitor which network their wallet is on.
 */
const KNOWN_NETWORKS: Record<number, string> = {
  1: 'Ethereum Mainnet',
  10: 'OP Mainnet',
  56: 'BNB Smart Chain',
  100: 'Gnosis',
  137: 'Polygon',
  324: 'zkSync Era',
  8453: 'Base',
  17000: 'Holesky',
  42161: 'Arbitrum One',
  43114: 'Avalanche C-Chain',
  59144: 'Linea',
  11155111: 'Sepolia',
};

export function describeNetwork(chainId: number | undefined): string {
  if (chainId === undefined) return 'Unknown network';
  return KNOWN_NETWORKS[chainId] ?? `Chain ID ${chainId}`;
}

export function isMainnet(chainId: number | undefined): boolean {
  return chainId === MAINNET_CHAIN_ID;
}

export function mainnetAddressUrl(checksumAddress: `0x${string}`): string {
  return `${MAINNET_EXPLORER}/address/${checksumAddress}`;
}

export function mainnetBlockUrl(block: bigint): string {
  return `${MAINNET_EXPLORER}/block/${block.toString()}`;
}
