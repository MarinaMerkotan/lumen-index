import { CSSProperties } from 'react';
import type { AmbientTiming } from '../../lib/ambient';

interface NodeSquareProps {
  top: string;
  left: string;
  enterDelay: number;
  trace: AmbientTiming;
  active?: boolean;
  /** Stable id used by live-data pulses (`telemetry`, `connectivity`, ...). */
  nodeId?: string;
  /** Persistent live state, e.g. `linked` while a wallet is connected or `offline` when the RPC fails. */
  liveState?: 'idle' | 'linked' | 'offline';
}

/** Framed node square with a breathing outline, an intermittent edge trace and a linked active state. */
export function NodeSquare({ top, left, enterDelay, trace, active = false, nodeId, liveState = 'idle' }: NodeSquareProps) {
  const style = { '--dur': `${trace.duration}ms`, '--delay': `${trace.delay}ms` } as CSSProperties;

  return (
    <div
      className="absolute w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] anim-scale-in"
      style={{ top, left, animationDelay: `${enterDelay}ms` }}
    >
      <div className="node-square" data-active={active} data-node={nodeId} data-live={liveState} style={style}>
        <span className="node-square__frame" />
        <span className="node-square__active" />
        <span className="node-square__flash" />
        <svg className="node-square__trace" aria-hidden="true">
          <rect x="0" y="0" width="100%" height="100%" pathLength={100} />
        </svg>
        <span className="node-square__tick node-square__tick--tl" />
        <span className="node-square__tick node-square__tick--br" />
      </div>
    </div>
  );
}
