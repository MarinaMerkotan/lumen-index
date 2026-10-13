import { CSSProperties } from 'react';
import type { AmbientTiming } from '../../lib/ambient';

interface CrosshairProps {
  top: string;
  left: string;
  /** Entrance delay in ms (matches the original staggered scale-in). */
  enterDelay?: number;
  pulse?: AmbientTiming;
  className?: string;
}

/** Precision "+" marker at a grid intersection with an optional asynchronous light pulse. */
export function Crosshair({ top, left, enterDelay = 0, pulse, className = '' }: CrosshairProps) {
  const pulseStyle = pulse
    ? ({ '--dur': `${pulse.duration}ms`, '--delay': `${pulse.delay}ms` } as CSSProperties)
    : undefined;

  return (
    <div className={`absolute anim-scale-in ${className}`} style={{ top, left, animationDelay: `${enterDelay}ms` }}>
      {pulse && <span className="crosshair-glow" style={pulseStyle} />}
      <span className="absolute w-[10px] h-px bg-white/70 -translate-x-1/2 -translate-y-1/2" />
      <span className="absolute w-px h-[10px] bg-white/70 -translate-x-1/2 -translate-y-1/2" />
      {pulse && (
        <span className="crosshair-tint" style={pulseStyle}>
          <span className="absolute w-[10px] h-px bg-ice -translate-x-1/2 -translate-y-1/2" />
          <span className="absolute w-px h-[10px] bg-ice -translate-x-1/2 -translate-y-1/2" />
        </span>
      )}
    </div>
  );
}
