# LUMEN // INDEX — Agent Operating Instructions

Read this file **before every implementation task**. Then read `docs/PRODUCT.md`, `docs/DESIGN.md`, `docs/WEB3.md`, `docs/SECURITY.md`, and the selected milestone in `docs/TASKS.md`.

## Mission and boundaries
Build an elegant **frontend-only Web3 engineering showcase**, not a bank, investment service, deployed DeFi protocol, or financial advice product. Real read-only chain data and explicitly labeled local simulations are both allowed. Do not imply that simulated balances, APYs, governance votes, or pool positions are on-chain.

## Existing code (baseline)
- React 18 + TypeScript, Vite 5, Tailwind 3, lucide-react; npm lockfile is source of truth.
- `src/App.tsx` is currently one large hero with navigation, grid, annotation overlays, and an externally hosted video.
- `src/index.css` owns all existing entrance animations and typography.
- `src/main.tsx` is the React entry. `index.html` loads external font CSS.
- No wallet SDK, RPC provider, test harness, backend, or persistence exists yet.
- Header wallet address and connected status are currently **hard-coded placeholders**; existing links and CTA do not yet lead to implemented features.

## Non-negotiables
1. **Preserve the original aesthetic.** Black canvas, icy-blue accents (#AFDDFF), restraint, wide negative space, fine grid, annotation/crosshair language, the floating luminous video subject. Do not introduce generic dashboard cards, gradients, giant rounded components, or unrelated stock visuals.
2. Do not introduce a backend, database, auth service, serverless functions, additional analytics, cookies or app-side wallet-data persistence unless the owner explicitly approves. The owner-approved Google Analytics page-view snippet in `index.html` stays; do not add custom events or send wallet/user-entered data to it, and do not add a consent banner without asking.
3. Never request or handle a seed phrase, private key, or secret. No payments, investments, approvals, swaps, or real mainnet write transactions. Mainnet is read-only.
4. Never auto-connect or auto-prompt for wallet signature. Signature experiments require a dedicated opt-in action and readable message. Do not make status claims about wallet identity or authentication.
5. Differentiate `LIVE`, `DEMO`, `DISCONNECTED`, `UNAVAILABLE`, and `LOADING`. Never silently substitute mock data for failed RPC.
6. Keep one self-contained change set per milestone. Prefer small components and hooks under `src/features/*`, `src/components/*`, `src/lib/*`.
7. Do not copy the external video or fonts into the repo unless licensing/ownership permits it. Provide a graceful fallback and track the asset dependency. Never accidentally commit licensed font binaries or API secrets.
8. Make responsive, keyboard-accessible, readable UIs. Respect `prefers-reduced-motion`; do not use unbounded animation loops.
9. Use npm (`package-lock.json`), not yarn/pnpm. Add dependencies only with clear justification and update lockfile in the same change.
10. No speculative refactors, real financial advice, invented network stats or misleading claims.

## Implementation workflow
- Inspect current code and docs. State the chosen milestone and a compact plan.
- Identify which UI is `LIVE` and which is `DEMO` before touching data flows.
- Implement with typed boundaries and stable dependencies.
- Run `npm ci` then `npm run build`. If tests or lint scripts are added, run them too; do not claim checks passed if not run.
- Review `git diff` for hard-coded wallet states, secret leaks, external dependencies, broken navigation, accessibility regressions and visual drift.
- Describe changed files, manual QA performed, known limitations, and next milestone. Do not claim browser QA unless a real browser was used.
- Work in a feature branch; request a review instead of pushing directly to `main`.

## Definition of done
Milestone-specific acceptance criteria in `docs/TASKS.md` pass; UI remains faithful to `docs/DESIGN.md`; no fake live data; no unsolicited wallet prompts; `npm run build` passes; README reflects implemented features, not planned ones.
