/** Keyless public endpoint (PublicNode). Verified to serve chain ID 1 with CORS enabled. */
export const DEFAULT_MAINNET_RPC_URL = 'https://ethereum-rpc.publicnode.com';

export const RPC_TIMEOUT_MS = 10_000;

/** Accepts an https URL without embedded credentials; anything else falls back to the default. */
export function resolveRpcUrl(candidate: string | undefined): string {
  if (!candidate) return DEFAULT_MAINNET_RPC_URL;
  try {
    const url = new URL(candidate.trim());
    if (url.protocol !== 'https:' || url.username || url.password) return DEFAULT_MAINNET_RPC_URL;
    return url.toString();
  } catch {
    return DEFAULT_MAINNET_RPC_URL;
  }
}

/** Hostname shown in the UI so visitors can see which third party serves the reads. */
export function rpcHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
