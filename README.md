# LŪMEN // ÍNDEX

An immersive, **frontend-only Web3 engineering showcase**. Built to demonstrate wallet connectivity, public blockchain reads, transparent demo simulations, and refined motion design.

> **Project status:** Milestone 1 (UI foundation + interaction contracts). No blockchain or wallet integration is installed yet. Every section labels its state honestly (`COMING NEXT`, `PLANNED`, `NOT CONNECTED`, `UNAVAILABLE`, `DEMO`), and no figure is simulated as live data. This is not a bank, investment service, or deployed DeFi protocol.

## What ships today
- Hero with the original composition, external background video, and a static fallback if the video fails to load.
- Ambient motion built with CSS and SVG: asynchronous crosshair pulses, node-square edge traces, light signals along connector lines, sparse grid streaks, and a subtle pointer parallax/lens on fine pointers. Loops run only while visible, can be paused with the on-page **Pause motion** control, and are disabled under `prefers-reduced-motion`.
- Four navigable sections (`#ecosystem`, `#liquidity-pools`, `#lumen-index`, `#governance`) plus a boundaries/disclosure footer (`#disclosure`), with active-section nav state and scroll reveals.
- Honest disconnected wallet control (`CONNECT WALLET` · `COMING NEXT`, `aria-disabled`). Nothing calls `window.ethereum`.
- Keyboard support: skip link, visible focus rings, and a mobile menu with focus trap, Escape to close, and focus return.

## Source layout
```text
src/
  App.tsx                 # page composition
  components/ambient/     # motion context, grid field, crosshairs, node squares, page grid
  components/hero/        # hero, media + fallback, annotations, CTA footer
  components/layout/      # site header, mobile menu, footer/disclosure
  components/sections/    # shared section shell
  components/ui/          # StatusTag, Frame, Readout, SectionLabel
  content/navigation.ts   # nav labels -> fragment ids
  features/<section>/     # ecosystem, liquidity, assets (Lumen Index), governance, wallet
  hooks/                  # reduced motion, in-view, active section, pointer field
  lib/                    # fragment ids, deterministic ambient timing, status vocabulary
```

## Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- lucide-react
- Vitest (dev only) for utility and render tests
- Planned (not installed): wagmi, viem, TanStack Query

## Local development
Requires a supported Node.js LTS release (CI uses Node 22).

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

No backend, database, credentials, or wallet are needed to run the current build.

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
