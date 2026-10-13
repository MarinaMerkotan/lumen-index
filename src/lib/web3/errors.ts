/** Walks an error and its `cause` chain (viem wraps provider errors several levels deep). */
function* errorChain(error: unknown): Generator<Record<string, unknown>> {
  let current: unknown = error;
  for (let depth = 0; current && typeof current === 'object' && depth < 8; depth++) {
    yield current as Record<string, unknown>;
    current = (current as { cause?: unknown }).cause;
  }
}

function findCode(error: unknown): number | undefined {
  for (const link of errorChain(error)) {
    if (typeof link.code === 'number') return link.code;
  }
  return undefined;
}

function findName(error: unknown, names: readonly string[]): boolean {
  for (const link of errorChain(error)) {
    if (typeof link.name === 'string' && names.includes(link.name)) return true;
  }
  return false;
}

export type WalletErrorKind = 'rejected' | 'pending' | 'no-provider' | 'unsupported-chain' | 'unknown';

export const WALLET_ERROR_MESSAGE: Record<WalletErrorKind, string> = {
  rejected: 'Request rejected in your wallet. Nothing was changed.',
  pending: 'A request is already open in your wallet. Finish or dismiss it there, then try again.',
  'no-provider': 'No browser wallet was found. Install an EIP-1193 wallet such as MetaMask and reload.',
  'unsupported-chain': 'Your wallet could not switch to Ethereum Mainnet. Switch networks inside the wallet.',
  unknown: 'The wallet returned an unexpected error. Try again.',
};

/** Maps EIP-1193 / viem / wagmi errors to a small set of user-facing cases. */
export function classifyWalletError(error: unknown): WalletErrorKind {
  const code = findCode(error);
  if (code === 4001 || findName(error, ['UserRejectedRequestError'])) return 'rejected';
  if (code === -32002) return 'pending';
  if (code === 4902 || findName(error, ['SwitchChainError', 'ChainNotConfiguredError', 'SwitchChainNotSupportedError'])) {
    return 'unsupported-chain';
  }
  if (findName(error, ['ProviderNotFoundError', 'ConnectorNotFoundError'])) return 'no-provider';
  return 'unknown';
}

export type RpcErrorKind = 'rate-limited' | 'timeout' | 'network' | 'wrong-chain' | 'unknown';

export const RPC_ERROR_MESSAGE: Record<RpcErrorKind, string> = {
  'rate-limited': 'The public RPC is rate limiting requests. Polling slows down automatically.',
  timeout: 'The public RPC did not answer in time.',
  network: 'The public RPC could not be reached. Check your connection.',
  'wrong-chain': 'The configured RPC is not serving Ethereum Mainnet. Data is withheld.',
  unknown: 'The public RPC returned an error.',
};

export class WrongChainRpcError extends Error {
  override name = 'WrongChainRpcError';
}

export function classifyRpcError(error: unknown): RpcErrorKind {
  if (findName(error, ['WrongChainRpcError'])) return 'wrong-chain';
  for (const link of errorChain(error)) {
    if (link.status === 429) return 'rate-limited';
  }
  const code = findCode(error);
  if (code === -32005 || code === 429) return 'rate-limited';
  if (findName(error, ['TimeoutError'])) return 'timeout';
  if (findName(error, ['HttpRequestError', 'TypeError'])) return 'network';
  return 'unknown';
}
