import { getAddress, isAddress } from 'viem';

export type AddressInput = { ok: true; address: `0x${string}` } | { ok: false; reason: 'empty' | 'format' | 'checksum' };

/**
 * Strict address parsing. All-lowercase / all-uppercase input is accepted and checksummed;
 * mixed-case input must carry a valid EIP-55 checksum (a typo guard, as on Etherscan).
 */
export function parseAddressInput(raw: string): AddressInput {
  const value = raw.trim();
  if (!value) return { ok: false, reason: 'empty' };
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) return { ok: false, reason: 'format' };
  const hex = value.slice(2);
  const singleCase = hex === hex.toLowerCase() || hex === hex.toUpperCase();
  // EIP-55: single-case addresses carry no checksum; mixed case must match it exactly.
  if (!singleCase && !isAddress(value, { strict: true })) return { ok: false, reason: 'checksum' };
  return { ok: true, address: getAddress(`0x${hex.toLowerCase()}`) };
}

export type TxHashInput = { ok: true; hash: `0x${string}` } | { ok: false; reason: 'empty' | 'format' };

/** A transaction hash is exactly 32 bytes of hex with a 0x prefix. Nothing else reaches the RPC. */
export function parseTxHashInput(raw: string): TxHashInput {
  const value = raw.trim();
  if (!value) return { ok: false, reason: 'empty' };
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) return { ok: false, reason: 'format' };
  return { ok: true, hash: value.toLowerCase() as `0x${string}` };
}

export const INPUT_ERROR_MESSAGE = {
  empty: 'Enter a value first.',
  format: 'Not a valid format.',
  checksum: 'Mixed-case address with an invalid checksum. Check for a typo, or paste it in lowercase.',
} as const;
