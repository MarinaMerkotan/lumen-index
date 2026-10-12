# LŪMEN // ÍNDEX

An immersive, **frontend-only Web3 engineering showcase**. Built to demonstrate wallet connectivity, public blockchain reads, transparent demo simulations, and refined motion design.

> **Project status:** Visual concept only. Wallet status in the initial design is placeholder UI. Blockchain integration, interactive sections, and animated telemetry are planned—not yet implemented. This is not a bank, investment service, or deployed DeFi protocol.

## Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- lucide-react
- Planned (not installed): wagmi, viem, TanStack Query

## Local development
Requires a supported Node.js LTS release (CI uses Node 22).

```bash
npm ci
npm run dev
npm run build
npm run preview
```

No backend, database, credentials, or wallet are needed to run the **current** visual prototype.

## Assets and privacy
The initial hero video is loaded from a third-party CloudFront URL and the initial fonts from Google Fonts / an external font stylesheet. Confirm asset usage rights and arrange a durable, licensed hosting strategy before public launch. Third parties may receive standard browser requests. See `docs/SECURITY.md`.

The planned blockchain functionality will use public RPC infrastructure and wallet extensions; RPCs/wallet providers may process IP addresses and public wallet addresses. Never place secrets in `VITE_*` variables.

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
