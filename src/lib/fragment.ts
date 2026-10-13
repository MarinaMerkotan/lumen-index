/** Converts a display label such as `LIQUIDITY_POOLS` into a URL fragment id (`liquidity-pools`). */
export function toFragmentId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
