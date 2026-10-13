# LŪMEN // ÍNDEX

An immersive, **frontend-only Web3 engineering showcase**. Built to demonstrate wallet connectivity, public blockchain reads, transparent demo simulations, and refined motion design.

> **Project status:** feature-complete portfolio release candidate (M1–M4). Live read-only Ethereum Mainnet data, explorers and user-initiated wallet access are real; Liquidity Pools and Governance are clearly labelled local demos; the only signature request is the opt-in Signature Lab message. Nothing writes to a chain and no wallet data is stored. This is not a bank, investment service, or deployed DeFi protocol. **Open release blocker:** hero video rights (see *Assets and privacy*).

## What ships today
- **Liquidity Pools (DEMO — NO FUNDS):** a local constant-product (x · y = k) simulator with editable reserves, swap amount, direction and illustrative fee (default 0.3%). Shows output, spot price before/after, price impact and new reserves, with an SVG curve whose before/after points move with the inputs. Bigint fixed-point math (18 decimals), strict input validation, reset to defaults.
- **Governance (DEMO — NOT ON-CHAIN):** one illustrative proposal with FOR / AGAINST / ABSTAIN. Cast, change or reset a vote held in React state; the result shows only this visitor's single local vote and clears on reload.
- **Signature Lab (EXPERIMENTAL, OPT-IN):** with a connected wallet, shows a readable message (app name, origin, random challenge, explicit "authorizes nothing, not a login" statement), asks for consent, then requests one EIP-191 `personal_sign`. The signer is recovered and compared locally with viem; nothing is sent or stored. Ordinary accounts (EOAs) only: smart-contract wallet signatures (ERC-1271) are reported as not verifiable locally.
- **Block explorer (LIVE):** the 10 latest Ethereum Mainnet blocks (age, tx count, gas used, base fee), selectable for a detail view (hash, UTC/local time, gas used/limit, base fee, fee recipient, Etherscan link). Headers are cached per block (immutable) and read at most 3 at a time; transactions are never fetched in full.
- **Base-fee chart (LIVE):** 20 observed base fees from one `eth_feeHistory` call per new block, plus the protocol-computed next-block fee drawn as a dashed outline. Missing values are gaps, never interpolated. Hover/focus tooltips, arrow-key navigation, and selection linked to the block list and schematic.
- **Transaction lookup (LIVE):** strictly validated hash, then `eth_getTransactionByHash` + `eth_getTransactionReceipt`: success / reverted / pending (re-checked for ~5 min) / not found, from/to, value, gas used, effective gas price and fee paid, block and confirmations, Etherscan link. Standard ERC-20 `Transfer`/`Approval` events are decoded with viem's ERC-20 ABI (allowlisted tokens with symbol and decimals, others in raw base units); everything else is shown as raw metadata.
- **Asset explorer (LIVE):** *Connected wallet* and *Explore address* modes kept visibly separate. ETH plus verified USDC / DAI / WETH balances and total supply, read from Ethereum Mainnet in one Multicall3 `eth_call`; on-chain decimals are cross-checked against the allowlist. Inspected addresses are never stored.
- **Ecosystem (LIVE):** chain ID (verified from the RPC), latest block with Etherscan link and age, base fee, suggested priority tip, and block fullness, read from Ethereum Mainnet through a public RPC without a wallet. Polling follows the ~12 s block time, pauses in background tabs, and backs off on errors (30 s) or rate limiting (60 s). Failures show `ERROR` with a retry action and a clearly labelled last successful read; old data is shown as `STALE`, never as current.
- **Wallet (WALLET):** injected EIP-1193 wallets (MetaMask and others via EIP-6963 discovery). Connect, disconnect and switch-to-Mainnet run only on click. The UI shows the real address (copy + Etherscan), the wallet's actual network, and clear states for no wallet, waiting, rejected, pending, wrong network, and errors.
- **Lumen Index (LIVE):** native ETH balance on Ethereum Mainnet for the connected address, formatted from bigint with viem, truncated rather than rounded, with no USD valuation. On other networks the balance is still read from Mainnet and labelled as such.
- **Live motion:** each new block ripples the hero grid, fires a light burst along the telemetry connector, and pulses the newest block in the Ecosystem schematic. A wallet connection lights the connectivity path and the Lumen Index panel, and a linked state settles back to neutral on disconnect. RPC failure dims the telemetry node. Pulses are CSS class toggles (no React re-render per frame) and are skipped under `prefers-reduced-motion` or **Pause motion**.
- M1 foundation: original hero and video with static fallback, ambient CSS/SVG motion, four sections plus `#disclosure`, skip link, focus management.

## Source layout
```text
src/
  App.tsx                 # page composition
  components/ambient/     # motion context, grid field, crosshairs, node squares, page grid
  components/hero/        # hero, media + fallback, annotations, CTA footer
  components/layout/      # site header, mobile menu, footer/disclosure
  components/providers/   # WagmiProvider + QueryClientProvider
  components/sections/    # shared section shell
  components/ui/          # StatusTag, Frame, Readout, SectionLabel
  content/navigation.ts   # nav labels -> fragment ids
  features/ecosystem/     # telemetry, recent blocks, fee chart, block detail, pulse emitter
  features/wallet/        # wallet controller/context, view derivation, controls
  features/assets/        # Lumen Index asset explorer, ETH + ERC-20 balance hooks
  features/transactions/  # transaction lookup, status and log decoding
  features/liquidity|governance/  # M3 placeholders
  hooks/                  # reduced motion, in-view, active section, pointer field, pulses, clock
  lib/web3/               # wagmi config, RPC URL resolution, error classification
  lib/chains/ lib/format/ # network names, explorer URLs, ERC-20 allowlist, bigint-safe formatters
  lib/                    # fragment ids, ambient timing, status vocabulary, pulse bus
```

## Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- lucide-react
- wagmi 3.7.7, viem 2.56.9, @tanstack/react-query 5.103.2 (Ethereum Mainnet only, injected connector only)
- Vitest (dev only): `npm test` runs offline unit, render and jsdom interaction tests plus a source-level read-only guard; `npm run test:live` runs opt-in checks against real Ethereum Mainnet

## Local development
Requires a supported Node.js LTS release (CI uses Node 22).

```bash
npm ci
npm run dev
npm test
npm run test:live   # optional, uses the public RPC
npm run build
npm run preview
```

No backend, database, credentials, or wallet are needed to run the current build.

## Assets and privacy
- **Hero video (release blocker):** streamed from a third-party CloudFront URL (`HeroMedia.tsx`, MP4 ~7.4 MB). Ownership and licence are **not confirmed**; it is not copied into the repo. A static luminous fallback appears if it fails or stalls, and it does not autoplay under reduced motion. Confirm rights or provide an owned replacement before public launch.
- **Fonts:** Hanken Grotesk (display, weight 340) and Manrope (UI), both SIL OFL 1.1 via Google Fonts. The earlier Graphik webfont from onlinewebfonts.com was removed because its licence could not be confirmed.
- **Third parties:** the public RPC (`https://ethereum-rpc.publicnode.com`) sees visitor IP addresses and every query, including connected, inspected or looked-up addresses and hashes. Google Fonts and the video CDN receive standard requests. Wallet extensions see the requests this site makes. No analytics, cookies or app-side storage.
- Override the RPC with an **https** `VITE_MAINNET_RPC_URL` (see `.env.example`); every `VITE_*` value ships to browsers, so never put an API key or secret there.

## Deployment (Vercel, static)
- Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. Install: `npm ci`. Node 22 (matches CI).
- Single-page app with in-page `#anchors` only: no client-side routes, no rewrites and no serverless functions needed. A refresh on any `#section` URL serves `index.html`.
- No environment variables are required. Optional: `VITE_MAINNET_RPC_URL` (public https URL only).
- Production smoke test after deploy: open the site in a private window → hero video plays (or fallback appears) → Ecosystem shows `LIVE` with a block number advancing every ~12 s → pick a block and inspect its first transaction → Explore Address with any public address shows ETH/USDC/DAI/WETH → AMM output updates while typing → cast/reset a local vote → without a wallet, CONNECT WALLET opens the "No wallet detected" help → with a throwaway wallet: connect, switch network, sign the lab message (verified), disconnect → reload a `#governance` URL.

## Known limitations
- Signature Lab verifies ordinary accounts (EOAs) only; smart-contract wallet signatures (ERC-1271/6492) are reported as "not verifiable locally".
- ERC-20 balances cover the verified allowlist (USDC, DAI, WETH); other tokens in transaction logs are shown in raw base units. No ENS, no other networks, no WalletConnect.
- Data depends on one public RPC; outages show `ERROR` / `STALE` with retry rather than switching providers.
- `npm audit`: 0 production vulnerabilities; 13 development-only advisories (Vite 5 / esbuild dev server, Vitest 2 / tinypool, Tailwind 3 tooling chain). Fixes require major upgrades (Vite 8, Vitest 5, Tailwind 4) and none ship in the static bundle.

## Agent handoff
Start with [AGENTS.md](AGENTS.md) and the documentation below:

- [Product scope](docs/PRODUCT.md)
- [Design and motion language](docs/DESIGN.md)
- [Web3 architecture](docs/WEB3.md)
- [Security and privacy](docs/SECURITY.md)
- [Milestone backlog](docs/TASKS.md)
- [Ready-to-use agent prompts](docs/AGENT_PROMPTS.md)

## Release policy
No financial promises, invented user memberships, fake account positions, real-money transaction flows, or opaque signature requests. Every visualized figure must be labeled according to its source: live, illustrative, or unavailable.
