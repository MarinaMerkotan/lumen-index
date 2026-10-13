import { describe, expect, it } from 'vitest';

/** Static guard for docs/SECURITY.md: the app source must not reach for write, signing or storage APIs. */
const SOURCES = import.meta.glob(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx', '!./**/testUtils.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FORBIDDEN: Array<[RegExp, string]> = [
  [/\buse(WriteContract|SendTransaction|SendCalls|SignMessage|SignTypedData|SignTransaction|DeployContract|WatchAsset)\b/, 'wallet write/sign hook'],
  [/\b(writeContract|sendTransaction|signMessage|signTypedData)\s*\(/, 'wallet write/sign action'],
  [/eth_sign|personal_sign|eth_sendTransaction|eth_requestAccounts/, 'raw signing / account request'],
  [/\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/, 'persistent browser storage'],
  [/walletConnect|WalletConnect/, 'WalletConnect connector'],
  [/dangerouslySetInnerHTML/, 'raw HTML injection'],
  [/\b(getLogs|useContractEvents|useWatchContractEvent|watchContractEvent|eth_getLogs|createEventFilter)\b/, 'log scan or event filter'],
  [/includeTransactions:\s*true/, 'full-block transaction retrieval'],
  [/functionName:\s*['"](approve|transfer|transferFrom|permit|increaseAllowance)['"]/, 'token write call'],
  [/\b(eval|new Function)\s*\(/, 'dynamic code execution'],
];

describe('security boundaries', () => {
  const files = Object.entries(SOURCES);

  it('scans the application source', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const [pattern, label] of FORBIDDEN) {
    it(`contains no ${label}`, () => {
      expect(files.filter(([, source]) => pattern.test(source)).map(([path]) => path)).toEqual([]);
    });
  }

  it('reads ERC-20 data only through view functions', () => {
    expect(SOURCES['./features/assets/tokenBalances.ts']).toContain("['balanceOf', 'decimals', 'totalSupply']");
  });

  it('configures wagmi without persistent storage and with injected wallets only', () => {
    const config = SOURCES['./lib/web3/config.ts'];
    expect(config).toMatch(/storage:\s*null/);
    expect(config).toMatch(/chains:\s*\[mainnet\]/);
    expect(config).toContain("from 'wagmi/connectors/injected'");
    expect(SOURCES['./components/providers/Web3Provider.tsx']).toMatch(/reconnectOnMount=\{false\}/);
  });
});
