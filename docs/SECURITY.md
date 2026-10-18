# Security, privacy and release policy

## Trust model
Everything runs in the visitor's browser; there is no app-owned backend, database or app-side user-data storage in scope. **This does not mean third parties see no data.** The initial page requests externally hosted video and fonts, and loads Google Analytics 4 to count visits (Google sets its own `_ga` cookies; no custom events, no consent banner by owner decision). Browser-based RPC or wallet-connection vendors may observe standard connection metadata (including IP addresses), requested chain data, and public wallet addresses.

## Prohibited
- No seed phrases, private keys, wallet import forms, secret injection, custody, or transaction signing on mainnet.
- No approvals, swaps, permits, bridge links, real investments, guaranteed APYs, fake live portfolio values, fake membership/account statuses, fake vote tallies, or misleading financial claims.
- No storing wallet address, message, signature, balances, or votes in localStorage, sessionStorage, cookies, database, logs or analytics under the project scope. Google Analytics receives standard page-view data only — never send it custom events or parameters containing wallet or user-entered data. Wallet SDKs/providers may retain their own connection state; document and configure that separately.
- No blind signature prompts. Show the exact human-readable message **before** asking wallet to sign, explain why, and give an explicit cancel path.
- Never put secrets in Git, `VITE_*` env vars or public client JS. Assume Vite env values ship to browsers.

## Connection/interaction security
- User initiates connection; render the genuine provider/account/chain state, not a hard-coded address.
- Safely handle missing injected provider, multiple providers, rejection, account changes, unsupported chain, disconnect and RPC failures.
- Mainnet functions are read-only; block all contract write paths in MVP. If adding Sepolia tests, require explicit network/account consent, show that it is TESTNET, and do not ask for mainnet funds.
- Prevent unsafe external links: use a vetted explorer host per chain, `target="_blank" rel="noopener noreferrer"` where needed. Do not construct links using untrusted origins.
- Don't render wallet-provided text as arbitrary HTML; avoid `dangerouslySetInnerHTML`.
- Dependencies: review newly added wallets/connectors; commit lockfile; verify npm audit and build; do not blindly apply breaking fixes.

## Signature lab
Use a simple consent-based human-readable message with app name, visible origin (when served), chain ID, purpose (`demonstration only; no login or transfer`) and nonce. Sign only after a click; verify locally. Signature is not authentication; show a caution and never submit/store it. Treat connected public address as public but privacy-relevant.

## Media and intellectual property
Status at M4:
- **Hero video — release blocker until rights are confirmed.** `src/components/hero/HeroMedia.tsx` streams `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260813_115057_94c3699b-0fd1-4124-bcf3-3626bb8c1f77.mp4` (MP4, ~7.4 MB, byte-range, `Cache-Control: immutable`). Ownership and licence are unknown. It is not copied into the repo. Fallback: on a load error or after 15 s without data, a static CSS composition of soft luminous forms replaces it without layout shift. With reduced motion it does not autoplay and only preloads metadata. Before public launch the owner must confirm the rights (or supply an owned/licensed replacement and host it with permission); do not substitute unrelated stock media.
- **Display font — resolved.** The license-unconfirmed Graphik copy from `db.onlinewebfonts.com` was removed. Display text now uses **Hanken Grotesk** (SIL Open Font License 1.1) at weight 340 from Google Fonts, chosen to match Graphik's proportions. Body/micro text stays **Manrope** (SIL OFL 1.1, Google Fonts). Fallbacks: Helvetica Neue / Arial.
- Do not download/copy assets into the repo solely because a URL is reachable. Do not redistribute font files.

## Release checks
- [x] Mainnet cannot send a write transaction (no write/transaction hooks; enforced by `src/security.test.ts`).
- [x] No fake connected/member labels remain.
- [x] All simulation data explicitly labeled demo.
- [x] Third-party data flows documented in README/disclosure (RPC, video CDN, Google Fonts, Google Analytics, wallet extension).
- [x] No user data intentionally persisted by this app (wagmi `storage: null`; no storage APIs; tested).
- [x] Wallet flows handle rejection, disconnect and wrong chain (automated + mock-provider browser QA). **Real-extension QA: owner to confirm.**
- [x] No unsolicited prompt, signature, or transaction modal; the only signature is the consent-gated Signature Lab message.
- [ ] External assets have permission and failure fallbacks — fallback ✔, **hero video rights unconfirmed (blocker)**; fonts ✔ (OFL).
- [x] `npm run build` passes and `npm test` passes locally; CI runs both. Manual browser QA done in the in-app Chromium pane; other browsers not verified.
