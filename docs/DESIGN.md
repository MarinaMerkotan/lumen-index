# Visual direction and motion specification

## Visual baseline
The initial `src/App.tsx` is the source-of-truth for composition **before** Web3 sections are added. Capture desktop/mobile baseline screenshots prior to visual refactors.

- Palette: black `#000000`, crisp white text, pale-blue `#AFDDFF` accent, subtle white 4–20% strokes.
- Layout: spacious black canvas, light technical grid, precision crosshairs, connector lines, framed node squares, editorial hero typography.
- Hero media: luminous floating organic floral-like forms, currently supplied as an external MP4. Retain the aesthetic and media focal point. Do not assume the third-party file is licensed or permanent.
- Typography: existing Graphik-like display and Manrope microtype. External font licenses/availability should be reviewed. Safe fallbacks must look intentional.
- Copy: compact, high-signal, precise. No fake enterprise banking language, promised returns, false `member` badges, or marketing padding.
- New components must look native to this design (thin borders, hard/near-square corners, technical labels). Do not import a UI kit that changes the design language.

## Motion system
**Entrance:** keep existing staggered transitions where appropriate.
**Ambient:** slow controlled crosshair glows, intermittent square-edge highlights, sparse pulses traveling along connector paths. Every visual pulse should feel like telemetry, not a nightclub effect.
**Event-driven:** block change triggers a subtle short pulse; wallet connect/disconnect causes a brief state transition; hover and focus highlight relevant technical markers.
**Implementation:** CSS/SVG first; add GSAP only when choreography cannot be kept simple or performant. Use requestAnimationFrame only where strictly necessary; clean up all observers/timers/listeners.
**Performance:** animate `opacity`/`transform` where possible; avoid per-frame re-renders of the React tree and giant moving blurs; cap animated elements and throttle expensive effects.
**Accessibility:** `prefers-reduced-motion` disables continuous motion (including decorative video autoplay as appropriate) and supplies meaningful static fallback. No essential information conveyed solely through motion; visible focus rings and accessible labels.

## Layout and states
- Preserve hero focal area and prevent decorative overlays from swallowing pointer/keyboard events.
- At mobile widths, avoid overflow and overlapping hero copy with wallet CTA or bottom disclosure. Real sections should have breathing room, not inherit a fixed `h-screen overflow-hidden` container.
- Use a consistent status visual vocabulary: live data, simulation, unavailable, pending, and error.
- Wallet connect must never look connected before a provider confirms state.
- Panels should reuse grid geometry/line motifs and not compete with the floating hero.
- Include media poster/static fallback if video fails; prevent layout shifts.

## Review acceptance
Compare screenshots at ~1440px desktop, ~768px tablet, ~390px mobile; test keyboard navigation and reduced motion; review overlay legibility with the video running and unavailable.
