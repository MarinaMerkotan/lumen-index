# Ready-to-use prompts for Codex / Claude Code

These prompts assume the agent can read the repository. Work on a dedicated feature branch for each milestone, never directly on `main`. Never make claims of testing without evidence.

## Prompt 1 — UI foundation
```
Read AGENTS.md and docs/PRODUCT.md, docs/DESIGN.md, docs/SECURITY.md, docs/WEB3.md, and M1 in docs/TASKS.md. Implement ONLY M1 as a cohesive PR. Preserve the current hero composition and existing luminous video focal point; do not add a backend, Web3 SDK, database, analytics, or unapproved paid services. Prioritize truthful copy/status, working anchors, clean component extraction, subtle ambient geometric animations, reduced-motion and mobile support. Before changing UI, capture visual baseline screenshots if tooling exists. Do not copy remote assets without rights. Run npm ci and npm run build, report QA evidence and limitations. Commit changes in a feature branch and open a PR for review.
```

## Prompt 2 — Wallet + real read-only chain
```
Read AGENTS.md and all docs. Starting from the reviewed/merged M1 baseline, implement ONLY M2 in docs/TASKS.md. Install compatible current wagmi, viem, @tanstack/react-query versions with npm. Wire a real user-initiated injected wallet flow, Ethereum Mainnet read-only RPC, latest block and actual connected-account ETH balance; handle disconnected/unavailable/rejected/unsupported-chain/RPC-error conditions. Distinguish live data from demo and remove any residual hardcoded wallet state. NO backend, persistent user data, real transactions, signing, approvals, swaps or fake APR. Preserve LUMEN aesthetic. Provide tests/build proof, manual wallet QA evidence or explicit untested limitations, then open a PR.
```

## Prompt 3 — Interactive simulations + polish
```
Read AGENTS.md and all docs. Starting from the reviewed/merged M2 baseline, implement ONLY M3 in docs/TASKS.md. Build client-side and clearly labeled AMM simulation and in-memory governance demo; never suggest they are live pools/votes. Optionally add a separately opt-in message-only signature/verification lab with human-readable consent, no auth or storage. Add event-driven microanimations and respectful reduced-motion behavior. Review mobile, keyboard, video fallback/licensing, metadata and performance. Do not create a backend, write transaction, approvals, private key flow or invented returns. Run build/tests, document actual browser QA and limitations, then open a PR.
```

## Review prompt — independent QA
```
Read AGENTS.md and docs/*.md, then review the open milestone PR against its exact checklist, not imaginary features. Check source truth labels, wallet prompt safety, data/persistence/network leaks, copy, type safety, responsive visual parity and reduced-motion behavior. Run npm ci/npm run build and any available tests. Use a real browser only if the environment supports one. Return BLOCKERS, MINOR ISSUES, VERIFIED CHECKS and NOT VERIFIED items. Do not modify the PR unless explicitly tasked.
```
