import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MotionState {
  /** System-level `prefers-reduced-motion: reduce`. */
  reducedMotion: boolean;
  /** Visitor paused ambient motion with the on-page control. */
  paused: boolean;
  setPaused: (paused: boolean) => void;
  /** Continuous ambient motion (video playback, pulses, signals) may run. */
  motionEnabled: boolean;
}

const MotionContext = createContext<MotionState | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const motionEnabled = !reducedMotion && !paused;

  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off';
  }, [motionEnabled]);

  const value = useMemo(() => ({ reducedMotion, paused, setPaused, motionEnabled }), [reducedMotion, paused, motionEnabled]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionState {
  const context = useContext(MotionContext);
  if (!context) throw new Error('useMotion must be used inside <MotionProvider>');
  return context;
}
