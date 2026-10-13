import { formatEther, formatGwei, formatUnits, getAddress, isAddress } from 'viem';

const GROUP = /\B(?=(\d{3})+(?!\d))/g;

/** Inserts thousands separators into a non-negative integer string, without float conversion. */
export function groupDigits(integer: string): string {
  return integer.replace(GROUP, ',');
}

/** Truncates (never rounds up) a decimal string to `maxDecimals` and strips trailing zeros. */
function truncateDecimal(value: string, maxDecimals: number): { text: string; truncatedToZero: boolean } {
  const [integer, fraction = ''] = value.split('.');
  const kept = fraction.slice(0, maxDecimals).replace(/0+$/, '');
  const truncatedToZero = integer === '0' && kept.length === 0 && /[1-9]/.test(fraction);
  return { text: kept ? `${groupDigits(integer)}.${kept}` : groupDigits(integer), truncatedToZero };
}

/**
 * Formats a wei amount as ETH using bigint-safe viem formatting. Truncates to `maxDecimals`
 * so the display never overstates a balance; dust below the precision renders as `< 0.000001`.
 */
export function formatEthAmount(wei: bigint, maxDecimals = 6): string {
  if (wei < 0n) throw new RangeError('Negative balances are not valid');
  const { text, truncatedToZero } = truncateDecimal(formatEther(wei), maxDecimals);
  if (truncatedToZero) return `< 0.${'0'.repeat(maxDecimals - 1)}1`;
  return text;
}

/**
 * Formats a raw ERC-20 amount with the token's on-chain decimals (bigint-safe, truncating).
 * Explicit zero renders as `0`; positive dust below the precision renders as `< 0.0…1`.
 */
export function formatTokenAmount(raw: bigint, decimals: number, maxDecimals = 6): string {
  if (raw < 0n) throw new RangeError('Negative amounts are not valid');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw new RangeError('Invalid token decimals');
  const places = Math.min(maxDecimals, decimals);
  const { text, truncatedToZero } = truncateDecimal(formatUnits(raw, decimals), places);
  if (truncatedToZero) return `< 0.${'0'.repeat(Math.max(places - 1, 0))}1`;
  return text;
}

/** Gas quantities (not prices) with thousands separators, e.g. `14,923,201`. */
export function formatGas(gas: bigint): string {
  return groupDigits(gas.toString());
}

/** Formats a fee-per-gas value (wei) in gwei: 3 decimals below 1 gwei, otherwise 2. */
export function formatGasGwei(wei: bigint): string {
  const decimals = wei < 1_000_000_000n ? 3 : 2;
  const { text, truncatedToZero } = truncateDecimal(formatGwei(wei), decimals);
  return truncatedToZero ? `< 0.${'0'.repeat(decimals - 1)}1` : text;
}

export function formatBlockNumber(block: bigint): string {
  return groupDigits(block.toString());
}

/** Returns the EIP-55 checksummed address, or null when the input is not a valid address. */
export function toChecksumAddress(value: string | undefined | null): `0x${string}` | null {
  if (!value || !isAddress(value, { strict: false })) return null;
  return getAddress(value);
}

/** `0x71C7…F4e2` — presentation only; the full address stays available via copy/explorer. */
export function truncateAddress(address: string, lead = 6, tail = 4): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

/** Local wall-clock time `HH:MM:SS` for "last updated" labels. */
export function formatClockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

/** Compact relative age such as `8 s ago` or `3 min ago`. */
export function formatAge(fromMs: number, nowMs: number): string {
  const seconds = Math.max(0, Math.round((nowMs - fromMs) / 1000));
  if (seconds < 60) return `${seconds} s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} h ago`;
}
