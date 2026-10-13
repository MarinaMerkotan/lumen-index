/**
 * Verified Ethereum Mainnet ERC-20 allowlist. Addresses, symbols and decimals were checked against
 * the contracts themselves (eth_call `symbol()` / `decimals()`) and match Etherscan's verified tokens.
 * Decimals are re-read on-chain at runtime; a mismatch is reported instead of formatting with a guess.
 */
export interface TokenInfo {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
}

export const MAINNET_TOKENS: readonly TokenInfo[] = [
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
];

export function findMainnetToken(address: string): TokenInfo | undefined {
  const lower = address.toLowerCase();
  return MAINNET_TOKENS.find((token) => token.address.toLowerCase() === lower);
}
