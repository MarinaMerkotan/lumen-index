import { RefObject, useEffect, useRef } from 'react';
import { useMotion } from '../components/ambient/MotionContext';
import { PulseKind, onPulse } from '../lib/pulseBus';

/**
 * Adds `className` to `ref` for `durationMs` whenever `kind` is emitted, restarting the CSS
 * animation if pulses overlap. Pure DOM class toggling: no React state, no re-render.
 * Skipped entirely while motion is paused or reduced; timers are cleared on unmount.
 */
export function usePulse<T extends HTMLElement>(ref: RefObject<T>, kind: PulseKind, className: string, durationMs: number): void {
  const { motionEnabled } = useMotion();
  const enabled = useRef(motionEnabled);
  enabled.current = motionEnabled;

  useEffect(() => {
    let timer = 0;
    const unsubscribe = onPulse((event) => {
      const node = ref.current;
      if (event !== kind || !node || !enabled.current) return;
      node.classList.remove(className);
      void node.offsetWidth; // restart the animation
      node.classList.add(className);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => node.classList.remove(className), durationMs);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
      ref.current?.classList.remove(className);
    };
  }, [ref, kind, className, durationMs]);
}
