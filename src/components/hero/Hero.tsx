import { useRef } from 'react';
import { useMotion } from '../ambient/MotionContext';
import { useAmbient } from '../ambient/useAmbient';
import { GridField } from '../ambient/GridField';
import { usePointerField } from '../../hooks/usePointerField';
import { usePulse } from '../../hooks/usePulse';
import { HeroAnnotations } from './HeroAnnotations';
import { HeroFooter } from './HeroFooter';
import { HeroMedia } from './HeroMedia';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { motionEnabled } = useMotion();
  const ambientLive = useAmbient(ref);
  usePointerField(ref, motionEnabled);
  // Live-data choreography: a new block ripples the grid and fires the telemetry path;
  // a wallet connection lights the connectivity path. CSS-only, skipped when motion is off.
  usePulse(ref, 'block', 'pulse-block', 2000);
  usePulse(ref, 'wallet-connected', 'pulse-wallet', 2000);

  return (
    <section
      ref={ref}
      id="top"
      className={`hero relative w-full overflow-hidden bg-black ${ambientLive ? 'ambient-live' : ''}`}
      aria-labelledby="hero-title"
    >
      <HeroMedia />

      <div className="relative z-10 w-full h-full">
        <h1
          id="hero-title"
          className="font-display text-white font-normal leading-[1em] absolute anim-fade-up text-[32px] sm:text-[48px] md:text-[68px] top-[140px] sm:top-[160px] md:top-[178px] left-5 md:left-[35px] max-w-[300px] sm:max-w-[420px] md:max-w-[554px]"
          style={{ animationDelay: '400ms' }}
        >
          Public Chains. Luminous Interfaces.
        </h1>

        <GridField />
        <HeroAnnotations />
        <HeroFooter />
      </div>
    </section>
  );
}
