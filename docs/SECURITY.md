# Security, privacy and release policy

## Trust model
Everything runs in the visitor's browser; there is no app-owned backend, database, analytics or app-side user-data storage in scope. **This does not mean third parties see no data.** The initial page requests externally hosted video and fonts. Browser-based RPC or wallet-connection vendors may observe standard connection metadata (including IP addresses), requested chain data, and public wallet addresses.

## Prohibited
- No seed phrases, private keys, wallet import forms, secret injection, custody, or transaction signing on mainnet.
- No approvals, swaps, permits, bridge links, real investments, guaranteed APYs, fake live portfolio values, fake membership/account statuses, fake vote tallies, or misleading financial claims.
- No storing wallet address, message, signature, balances, or votes in localStorage, sessionStorage, cookies, database, logs or analytics under the project scope. Wallet SDKs/providers may retain their own connection state; document and configure that separately.
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
The prototype loads a CloudFront MP4 of unknown ownership/licensing and an external Graphik font stylesheet. Before shipping, the owner must confirm rights and select stable delivery (licensed self-hosted or authorized provider). Do not download/copy assets into the repo solely because a URL is reachable. Do not redistribute font files.

## Release checks
- [ ] Mainnet cannot send a write transaction.
- [ ] No fake connected/member labels remain.
- [ ] All simulation data explicitly labeled demo.
- [ ] Third-party data flows documented in README/disclosure.
- [ ] No user data intentionally persisted by this app.
- [ ] Wallet flows work for rejection, disconnect and wrong chain.
- [ ] No unsolicited prompt, signature, or transaction modal.
- [ ] External assets have permission and failure fallbacks.
- [ ] `npm run build` passes; CI green; manual browser QA completed.
