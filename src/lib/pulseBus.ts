/**
 * Tiny in-memory event bus that lets live data trigger short visual pulses without routing
 * state through React. Subscribers toggle CSS classes on refs, so a new block never re-renders
 * the decorative tree. Nothing is stored; events are fire-and-forget.
 */
export type PulseKind = 'block' | 'wallet-connected' | 'wallet-disconnected';

const target = new EventTarget();

export function emitPulse(kind: PulseKind): void {
  target.dispatchEvent(new CustomEvent<PulseKind>('pulse', { detail: kind }));
}

export function onPulse(listener: (kind: PulseKind) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<PulseKind>).detail);
  target.addEventListener('pulse', handler);
  return () => target.removeEventListener('pulse', handler);
}
