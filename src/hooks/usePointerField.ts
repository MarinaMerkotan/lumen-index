import { RefObject, useEffect } from 'react';

/**
 * Writes pointer position into CSS custom properties on `ref` without re-rendering React:
 * --px / --py in -1..1 (parallax), --mx / --my in px (lens), and --lens as 0 or 1.
 * Only active for fine pointers and when `enabled`; updates are batched per animation frame.
 */
export function usePointerField<T extends HTMLElement>(ref: RefObject<T>, enabled: boolean): void {
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    if (typeof window.matchMedia === 'function' && !window.matchMedia('(pointer: fine)').matches) return;

    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    const write = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const x = lastX - rect.left;
      const y = lastY - rect.top;
      node.style.setProperty('--mx', x.toFixed(1) + 'px');
      node.style.setProperty('--my', y.toFixed(1) + 'px');
      node.style.setProperty('--px', ((x / rect.width) * 2 - 1).toFixed(3));
      node.style.setProperty('--py', ((y / rect.height) * 2 - 1).toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      lastX = event.clientX;
      lastY = event.clientY;
      node.style.setProperty('--lens', '1');
      if (!frame) frame = requestAnimationFrame(write);
    };

    const reset = () => {
      node.style.setProperty('--lens', '0');
      node.style.setProperty('--px', '0');
      node.style.setProperty('--py', '0');
    };

    node.addEventListener('pointermove', onMove, { passive: true });
    node.addEventListener('pointerleave', reset);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', reset);
      reset();
    };
  }, [ref, enabled]);
}
