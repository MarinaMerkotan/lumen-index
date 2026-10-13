# Web3 architecture

> **Status (M2):** installed `wagmi@3.7.7`, `viem@2.56.9`, `@tanstack/react-query@5.103.2`. Mainnet-only config in `src/lib/web3/config.ts` (injected connector + EIP-6963 discovery, `storage: null`), default RPC `https://ethereum-rpc.publicnode.com`. Simulations remain M3B.

> **M3A explorer:** RPC methods `eth_chainId`, `eth_getBlockByNumber` (headers + tx hashes only), `eth_feeHistory`, `eth_maxPriorityFeePerGas`, `eth_getBalance`, `eth_call` (Multicall3 `0xcA11bde05977b3631167028862bE2a173976CA11`), `eth_getTransactionByHash`, `eth_getTransactionReceipt`. ERC-20 allowlist: USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (6), DAI `0x6B175474E89094C44Da98b954EedeAC495271d0F` (18), WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` (18). No `eth_getLogs`, no indexer.

## Constraints and implementation selection
- Current runtime: Vite + React client-only. Keep it that way.
- Preferred integrations (introduce in milestone 2 after checking version compatibility): `wagmi`, `viem`, `@tanstack/react-query`. Use wallet connectors supported by selected wagmi version; MetaMask/injected wallet is sufficient for the MVP. Add WalletConnect only if needed and after agreeing to its public project ID and provider/privacy impact.
- Mainnet is **read-only**. Never send mainnet transactions.
- Public RPC can serve anonymous block/gas reads; **public wallet address** reads require voluntary wallet connection.
- Sepolia is optional for a later isolated, opt-in transaction demonstration, not required for MVP.
- Optional public RPC URL is a browser-exposed config value; never put API secrets in `VITE_*` variables. Do not hardcode private provider keys. If RPC setup is unavailable, show read-only unavailable states and offer retry.

## Module boundaries (target)
```text
src/
  components/         # hero, navigation, shared technical UI and states
  features/
    wallet/           # provider configuration, account button, chain state
    ecosystem/        # block number and gas telemetry
    assets/           # native balance and verified token examples
    liquidity/        # pure client-side AMM/LP math (demo)
    governance/       # in-memory, clearly demo-only voting
    signature-lab/    # optional consent-driven message sign + local verify
  lib/
    chains/           # explicit chain allowlist and explorer URLs
    format/           # safe bigint/token amount formatters
```
These are target directories; don't create empty folders solely to match a drawing.

## Provider rules
- Separate a public mainnet client for **read-only block telemetry** from wallet account/provider interactions.
- Don't silently issue connection requests on mount. No `eth_requestAccounts` until user clicks a control.
- Track provider account and chain changes through the wallet integration, with correct cleanup/unsubscribe.
- Address truncation is presentation only; full address should be accessible via intentional copy/explorer actions.
- Prefer bigint for on-chain quantities. Format through explicit decimals. No JavaScript float calculation on raw `wei`.
- Use query cache appropriately, sensible polling/visibility behavior, timeouts and retries. Distinguish disconnected, loading, wrong-chain, RPC error, empty token balance and success.
- Contracts: only known chain IDs and vetted addresses/ABIs. Never let arbitrary user-provided addresses trigger state-changing operations.

## Feature data provenance
| Feature | Source | Truth label | User action |
|---|---|---|---|
| Latest block | Public Ethereum RPC | LIVE | none |
| Current fee estimate | RPC when reliable | LIVE | none |
| Chain/account | injected wallet | WALLET | click connect |
| ETH balance | chain RPC + address | LIVE | click connect |
| ERC-20 balances | verified allowlisted address/ABI | LIVE | click connect |
| AMM simulator | local pure functions | DEMO | enter amounts |
| Governance poll | local React state | DEMO | vote |
| Signature lab | wallet and local verification | EXPERIMENTAL | explicit opt-in |

## Simulations
- Demo-only governance results must not resemble real chain governance or imply persistence.
- Liquidity example: model a simple constant-product `x*y=k` pool if used; distinguish token quantity, price impact and optional illustrative fee. Test invariant/rounding, zero/negative/NaN handling, boundary values. Do **not** market modeled APR as attainable yield.
- Nothing simulated is written to a chain or persisted to storage.

## Recommended verification
- Wallet unavailable, rejected request, connect/disconnect, chain switching, provider account change, slow RPC, failed RPC, repeated mounts (React StrictMode), offline, and stale data.
- Property and unit tests for deterministic simulation math/formatting.
- One manual mainnet read-only smoke test; optional message-signing test with a throwaway wallet, never a funded wallet.
