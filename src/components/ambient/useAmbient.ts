import { RefObject } from 'react';
import { useInView } from '../../hooks/useInView';
import { useMotion } from './MotionContext';

/** Ambient loops run only while their region is on screen and motion is allowed. */
export function useAmbient<T extends Element>(ref: RefObject<T>): boolean {
  const { motionEnabled } = useMotion();
  const inView = useInView(ref, { rootMargin: '120px 0px' });
  return motionEnabled && inView;
}
