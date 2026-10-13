import { bytesToHex, recoverMessageAddress } from 'viem';
import { classifyWalletError } from '../../lib/web3/errors';

/** 16 random bytes from the browser CSPRNG. Generated per attempt, kept in memory only. */
export function createChallenge(fill: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): `0x${string}` {
  return bytesToHex(fill(new Uint8Array(16)));
}

export interface LabMessageInput {
  origin: string;
  address: `0x${string}`;
  chainId: number;
  challenge: `0x${string}`;
  issuedAt: string;
}

/**
 * Human-readable message signed with `personal_sign` (EIP-191). It names the app and origin, carries a
 * random challenge, and states plainly that it authorizes nothing and is not a login.
 */
export function buildLabMessage({ origin, address, chainId, challenge, issuedAt }: LabMessageInput): string {
  return [
    'LUMEN // INDEX - Signature Lab (demonstration)',
    '',
    'Signing this message only proves that you control the address below.',
    'It does NOT authorize any transaction, token transfer, approval or access to funds,',
    'and it does NOT log you in. The signature is verified in your browser and never sent or stored.',
    '',
    `Origin: ${origin}`,
    `Address: ${address}`,
    `Chain ID: ${chainId}`,
    `Challenge: ${challenge}`,
    `Issued at: ${issuedAt}`,
  ].join('\n');
}

export type VerifyOutcome = { result: 'verified'; recovered: `0x${string}` } | { result: 'mismatch'; recovered: `0x${string}` } | { result: 'invalid' };

/**
 * Local EOA verification: recover the signer from the EIP-191 signature and compare. No RPC call.
 * Smart-contract wallets (ERC-1271 / ERC-6492) would need an on-chain call; they surface as
 * `mismatch` / `invalid`, which the UI explains instead of claiming failure or success.
 */
export async function verifyLocally(address: `0x${string}`, message: string, signature: `0x${string}`): Promise<VerifyOutcome> {
  try {
    const recovered = await recoverMessageAddress({ message, signature });
    return recovered.toLowerCase() === address.toLowerCase() ? { result: 'verified', recovered } : { result: 'mismatch', recovered };
  } catch {
    return { result: 'invalid' };
  }
}

export type SignErrorKind = 'rejected' | 'unsupported' | 'error';

/** Rejections and unsupported methods get their own states; everything else is a generic error. */
export function classifySignError(error: unknown): SignErrorKind {
  if (classifyWalletError(error) === 'rejected') return 'rejected';
  for (let e: unknown = error, depth = 0; e && typeof e === 'object' && depth < 8; e = (e as { cause?: unknown }).cause, depth++) {
    const { code, name } = e as { code?: unknown; name?: unknown };
    if (code === 4200 || code === -32601 || name === 'MethodNotSupportedRpcError' || name === 'UnsupportedProviderMethodError') return 'unsupported';
  }
  return 'error';
}
