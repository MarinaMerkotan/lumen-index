import { CSSProperties, useState } from 'react';
import { ambientTiming } from '../../lib/ambient';
import { formatBlockNumber, truncateAddress } from '../../lib/format/eth';
import { useChainTelemetry } from '../../features/ecosystem/useChainTelemetry';
import { useWalletState } from '../../features/wallet/useWalletState';
import { NodeSquare } from '../ambient/NodeSquare';

type LiveState = 'idle' | 'linked' | 'offline';

type Segment = readonly [x1: number, y1: number, x2: number, y2: number];

interface AnnotationNode {
  id: string;
  href: string;
  title: string;
  description: string;
  label: { top: string; left: string; maxWidth: number; from: 'left' | 'right'; delay: number };
  /** Connector polyline in viewport percentages; signals travel in segment order. */
  segments: readonly Segment[];
  lineDelays: readonly number[];
  square: { top: string; left: string; delay: number };
}

/** Geometry preserved from the approved baseline; copy rewritten to describe real features. */
const NODES: readonly AnnotationNode[] = [
  {
    id: 'telemetry',
    href: '#ecosystem',
    title: 'CHAIN_TELEMETRY',
    description: 'Read-only Ethereum Mainnet block data from a public RPC.',
    label: { top: '11%', left: '26%', maxWidth: 160, from: 'left', delay: 1100 },
    segments: [
      [38, 14, 52, 14],
      [52, 14, 60, 27],
    ],
    lineDelays: [1200, 1400],
    square: { top: '27%', left: '60%', delay: 1500 },
  },
  {
    id: 'simulation',
    href: '#liquidity-pools',
    title: 'LOCAL_SIMULATION',
    description: 'Constant-product pool math run in your browser. No funds.',
    label: { top: '76%', left: '3%', maxWidth: 170, from: 'left', delay: 1400 },
    segments: [
      [32, 58, 20, 74],
      [20, 74, 6, 74],
    ],
    lineDelays: [1500, 1700],
    square: { top: '58%', left: '32%', delay: 1800 },
  },
  {
    id: 'connectivity',
    href: '#lumen-index',
    title: 'CONNECTIVITY',
    description: 'Wallet access begins only when you choose to connect.',
    label: { top: '50%', left: '78%', maxWidth: 180, from: 'right', delay: 1700 },
    segments: [
      [78, 53, 63, 53],
      [63, 53, 50, 63],
    ],
    lineDelays: [1800, 2000],
    square: { top: '63%', left: '50%', delay: 2100 },
  },
];

const SIGNAL_CYCLE_MS = 9000;
/** Fraction of the cycle a signal spends travelling one segment (see `connectorSignal` keyframes). */
const SIGNAL_TRAVEL = 0.3;

const pct = (value: number) => `${value}%`;

/**
 * Hero annotation system: connector lines with travelling light signals, framed node squares,
 * and annotation labels that link to their sections. Hover/focus on a label lights its square and path.
 */
export function HeroAnnotations() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const telemetry = useChainTelemetry();
  const { view } = useWalletState();

  const liveState: Record<string, LiveState> = {
    telemetry: telemetry.state === 'error' ? 'offline' : 'idle',
    connectivity: view.status === 'connected' ? 'linked' : 'idle',
    simulation: 'idle',
  };

  /** Live readout pinned under the telemetry square: real block height or an honest RPC state. */
  const telemetryReadout = telemetry.block
    ? `${telemetry.state === 'stale' ? 'STALE' : 'LIVE'} · #${formatBlockNumber(telemetry.block.number)}`
    : telemetry.state === 'error'
      ? 'RPC UNAVAILABLE'
      : 'CONNECTING TO RPC…';

  /** Short live line under an annotation; only shown for a real wallet connection. */
  const liveLine: Record<string, string | null> = {
    connectivity: view.status === 'connected' ? `WALLET LINKED · ${truncateAddress(view.address)}` : null,
  };

  return (
    <div className="hero-annotations absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 parallax-near" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {NODES.map((node, n) =>
            node.segments.map(([x1, y1, x2, y2], s) => {
              const signalStyle = {
                '--dur': `${SIGNAL_CYCLE_MS}ms`,
                '--delay': `${2600 + n * 2900 + s * SIGNAL_CYCLE_MS * SIGNAL_TRAVEL}ms`,
              } as CSSProperties;
              return (
                <g key={`${node.id}-${s}`} className="connector" data-active={activeId === node.id} data-node={node.id} data-live={liveState[node.id]}>
                  <line
                    className="connector__base anim-draw-line"
                    style={{ animationDelay: `${node.lineDelays[s]}ms` }}
                    x1={pct(x1)}
                    y1={pct(y1)}
                    x2={pct(x2)}
                    y2={pct(y2)}
                    pathLength={100}
                  />
                  <line className="connector__signal" style={signalStyle} x1={pct(x1)} y1={pct(y1)} x2={pct(x2)} y2={pct(y2)} pathLength={100} />
                  <line
                    className="connector__burst"
                    style={{ '--burst-delay': `${s * 520}ms` } as CSSProperties}
                    x1={pct(x1)}
                    y1={pct(y1)}
                    x2={pct(x2)}
                    y2={pct(y2)}
                    pathLength={100}
                  />
                </g>
              );
            }),
          )}
        </svg>

        {NODES.map((node, n) => (
          <NodeSquare
            key={node.id}
            top={node.square.top}
            left={node.square.left}
            enterDelay={node.square.delay}
            trace={ambientTiming(n, { minDuration: 7000, maxDuration: 11000, baseDelay: 3000, maxDelay: 5000 }, 3)}
            active={activeId === node.id}
            nodeId={node.id}
            liveState={liveState[node.id]}
          />
        ))}

        <span
          className="hero-live-line absolute font-manrope text-[11px] leading-[14px] tracking-[0.06em] tabular-nums whitespace-nowrap anim-fade-in"
          data-live={liveState.telemetry}
          style={{ top: `calc(${NODES[0].square.top} + 112px)`, left: NODES[0].square.left, animationDelay: '2300ms' }}
        >
          {telemetryReadout}
        </span>
      </div>

      <ul className="absolute inset-0 parallax-near">
        {NODES.map((node) => (
          <li
            key={node.id}
            className={`absolute ${node.label.from === 'left' ? 'anim-slide-left' : 'anim-slide-right'}`}
            style={{ top: node.label.top, left: node.label.left, animationDelay: `${node.label.delay}ms` }}
          >
            <a
              href={node.href}
              className="annotation-link group pointer-events-auto block"
              onPointerEnter={() => setActiveId(node.id)}
              onPointerLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(node.id)}
              onBlur={() => setActiveId(null)}
            >
              <span className="font-manrope text-white text-[13px] leading-[15.6px] whitespace-nowrap transition-colors duration-300 group-hover:text-ice group-focus-visible:text-ice">
                [ {node.title} ]
              </span>
              <span
                className="block font-manrope text-white/55 text-[12px] leading-[16px] mt-[4px] transition-colors duration-300 group-hover:text-white/75 group-focus-visible:text-white/75"
                style={{ maxWidth: `min(${node.label.maxWidth}px, 20vw)` }}
              >
                {node.description}
              </span>
              {liveLine[node.id] && (
                <span
                  className="hero-live-line block font-manrope text-[11px] leading-[14px] tracking-[0.04em] mt-[6px] tabular-nums"
                  data-live={liveState[node.id]}
                >
                  {liveLine[node.id]}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
