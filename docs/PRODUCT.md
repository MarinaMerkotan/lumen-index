# Product specification — LUMEN // INDEX

## Purpose
A visually distinctive portfolio demonstration of advanced frontend engineering for Web3: wallet connectivity, read-only chain exploration, understandable cryptographic primitives, client-side financial simulations, and responsive motion.

**Audience:** hiring managers, engineering leads, potential clients, and Web3-curious visitors.
**Success:** within ~60 seconds, a visitor can find the live blockchain features, connect a wallet voluntarily, inspect a real public-chain datum, interact with a demo without spending funds, and understand the safety boundaries.

## Product truth rules
- This is **not** a bank, wallet custodian, token issuer, trading service, or live DeFi product.
- Avoid banking/private banking language in shipped copy. `Explore Private Banking` in the prototype must be replaced with a clear Web3 action in milestone 1.
- Never display a fake user address, `CONNECTED` status or `PRIME_MEMBER` tag as if real. Replace with genuine wallet state or an explicitly labeled visual placeholder during development.
- Do not invent neural/AI processing capabilities: change source annotations to accurately describe block, chain, connectivity or simulation features.
- No projected/guaranteed returns. Rates in simulators must be **assumptions entered by a user** or a disclosed illustrative value; output is not an investment forecast.
- Important visible labels: `LIVE — Ethereum Mainnet`, `SIMULATION — NO FUNDS`, `TESTNET`, `NOT CONNECTED`, and an error/unknown state.

## Information architecture
Keep existing navigation names, but implement real, accessible destinations:
1. `01. ECOSYSTEM` -> `#ecosystem`: latest block number, chain ID, gas estimate if supported/reliable, public RPC response state; graceful offline/retry.
2. `02. LIQUIDITY_POOLS` -> `#liquidity-pools`: clearly labeled local AMM/LP **simulation** with two illustrative tokens, user-editable inputs, and explanatory calculations. No liquidity add/remove, approvals, yield claims, or protocol impersonation.
3. `03. LUMEN_INDEX` -> `#lumen-index`: connected public address, chain, native ETH balance and optionally a curated static list of known ERC-20 addresses (only if token metadata can be safely verified). Do not label aggregate tokens as a portfolio index with real market valuation unless actual pricing sources and timestamps are available.
4. `04. GOVERNANCE` -> `#governance`: a clearly labeled in-memory local vote/poll example. Reload resets the results; these are not real governance votes and not a global tally.
Hero: immersive video backdrop, grid/connection motion, genuine wallet control, CTA scrolling to a real section.

## Optional cryptography lab (after core MVP)
- Consent-driven **message** signing with an easily reviewed statement including project name, domain (when deployed), current chain, and a locally generated challenge nonce.
- Verify the signature locally using viem.
- Never describe this as login or security verification; do not transmit or retain the signature.
- No `eth_sign`, blind hash signing, permits, approvals, or typed-data signatures in the MVP.

## Experience requirements
- Read-only sections must work **without a wallet** via a public RPC; wallet-only data is gated and explained.
- Connecting/disconnecting is user initiated. Support rejected requests, wrong chain, wallet unavailable, network latency, and provider disconnect.
- Show network/data timestamps only when meaningful, otherwise show explicitly that data is unavailable.
- At small widths the mobile menu closes on nav use/Escape; anchors scroll to real sections; keyboard focus remains sensible.
- Ship no ads, user accounts, off-chain PII store, API service, or back-office. The only analytics is Google Analytics page-view counting (owner-approved, disclosed in the footer, no custom events).
- Prefer honest source links (chain explorer, docs) over fabricated reports.

## Out of scope
Real DeFi deposits/swaps/pools, investment tracking across chains, custody, fiat gateways, transaction signing on mainnet, smart-contract deployment, real vote aggregation, private banking, yield generation, paid access, backend API, and persistent user data.
