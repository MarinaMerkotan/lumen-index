# Executable milestone backlog

Each milestone is intended for **one bounded agent task / PR**. Do not skip ahead or alter the design identity without approval. Follow `AGENTS.md` and linked specs. Baseline is the original `main` commit.

## M1 — UI foundation + interaction contracts (first implementation task)
**Goal:** split the current monolithic view into maintainable components and replace misleading prototype behaviors **without adding a Web3 SDK**.

- [ ] Capture baseline desktop/mobile screenshots (if browser tooling is available); document fallback if not.
- [ ] Split `src/App.tsx` into hero/video layer, nav/mobile menu, grid/ambient overlays, annotation nodes and CTA components with no visible regression.
- [ ] Introduce four real sections with ids `ecosystem`, `liquidity-pools`, `lumen-index`, `governance`; nav anchors and CTA scroll correctly. Fix the underscore-to-fragment issue.
- [ ] Replace hardcoded `0x71...f4e2 [CONNECTED]` and `PRIME_MEMBER` with truthful `CONNECT WALLET`/disconnected placeholder control (nonfunctional only if visibly marked `COMING NEXT`; ideally create a clean action interface ready for M2).
- [ ] Replace inaccurate `private banking`, `luminous returns`, neural/AI processing, and fictional transparency report references with accurate Web3 showcase copy.
- [ ] Create coherent shared states / primitive panel components for future LIVE/DEMO/ERROR labels without building generic dashboard UI.
- [ ] Introduce independent ambient crosshair/pulse/SVG node animation. Keep moving forms from existing video; make animation gentle and optional under reduced-motion.
- [ ] Add video error/poster fallback; do not clone/download third-party video unless licensed.
- [ ] Establish basic automated checks (tests for new utilities if applicable), responsive/keyboard QA. Avoid project-wide dependency upgrade.

**Acceptance:** before wallet connection there are **zero claims of connected wallet**; four navigation links land on real sections; no fake live financial data; visual parity of desktop hero; motion degrades gracefully; build passes.

## M2 — Read-only Web3 + wallet
**Goal:** demonstrate authentic chain engineering without any investment risk.

- [ ] Add reviewed compatible wagmi/viem/TanStack Query versions; document connector and external RPC impacts.
- [ ] Build reusable Web3 configuration for Ethereum Mainnet read-only client; optional injected-wallet connector.
- [ ] Connect/disconnect on explicit click; show real account, network, ENS only if verified/available, link to approved chain explorer.
- [ ] Display real latest block with RPC loading/errors and bounded polling.
- [ ] Display network/gas estimate only where supported; avoid displaying random values on RPC failure.
- [ ] Show connected ETH balance via correct bigint formatting; optional ERC-20 balances behind allowlisted verified token metadata.
- [ ] Handle rejection, unavailable wallet, unsupported chain, account/chain changes, RPC outage and stale data. No write actions.
- [ ] Add tests for formatters and pertinent state transitions; smoke-test with a disposable wallet (or document what is untested).

**Acceptance:** disconnected view still shows public live block data if RPC works; account is never hardcoded; live values have source/chain states; error behavior honest; no mainnet write path exists; build passes.

## M3 — Simulations, cryptography experiment, polish
**Goal:** make remaining screens interactive with safe, truthful experiences.

- [ ] Liquidity: deterministic local constant-product AMM example, editable inputs, non-misleading outputs, edge-case tests and prominent `DEMO — NO FUNDS` label.
- [ ] Governance: in-memory single-user demo vote (reset on reload) with visible `DEMO` / `NOT ON-CHAIN` labels; never label local percentages as community votes.
- [ ] Optional consent-driven, **message-only** signature demo with readable challenge and local verification; no storage or auth claims.
- [ ] Connect live-block / wallet transitions to microanimations while honoring reduced motion and performance.
- [ ] Video fallback, image/poster rights, font licensing, metadata, favicon, mobile, keyboard accessibility and cross-browser checks.
- [ ] README updates only for actually shipped functionality; Vercel static deploy smoke test with rollback notes.

**Acceptance:** interactive demo sections correctly distinguish simulation/live; no financial transactions or storage; touch/mobile/responsive, reduced motion, keyboard, errors and build are checked.

## Notes for reviewers
Review feature scope first, then technical correctness, security/privacy, visual fidelity and release test evidence. Do not merge a milestone PR solely on green build; wallet and motion require manual browser QA.
