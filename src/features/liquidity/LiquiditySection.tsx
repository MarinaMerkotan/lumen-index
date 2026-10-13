import { CSSProperties } from 'react';
import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';

const VIEW_W = 320;
const VIEW_H = 150;
const PAD = 18;

/** Constant-product curve y = k / x drawn in a fixed viewBox; purely illustrative geometry. */
function curvePath(): string {
  const k = 1;
  const xMin = 0.22;
  const xMax = 4.5;
  const yMax = k / xMin;
  const points: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const x = xMin + ((xMax - xMin) * i) / 48;
    const y = k / x;
    const px = PAD + ((x - xMin) / (xMax - xMin)) * (VIEW_W - PAD * 2);
    const py = VIEW_H - PAD - (y / yMax) * (VIEW_H - PAD * 2);
    points.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return points.join(' ');
}

const CURVE = curvePath();

function CurveDiagram() {
  return (
    <figure className="mt-8">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto overflow-visible" role="img" aria-labelledby="curve-caption">
        <line x1={PAD} y1={VIEW_H - PAD} x2={VIEW_W - PAD / 2} y2={VIEW_H - PAD} className="curve-axis" />
        <line x1={PAD} y1={PAD / 2} x2={PAD} y2={VIEW_H - PAD} className="curve-axis" />
        <path d={CURVE} className="curve-base" />
        <path d={CURVE} className="curve-signal" pathLength={100} style={{ '--dur': '9000ms', '--delay': '1200ms' } as CSSProperties} />
        <text x={VIEW_W - PAD / 2} y={VIEW_H - 8} textAnchor="end" className="curve-label">
          RESERVE A
        </text>
        <text x={PAD + 6} y={PAD / 2 + 4} className="curve-label">
          RESERVE B
        </text>
        <text x={VIEW_W - PAD} y={PAD + 28} textAnchor="end" className="curve-formula">
          x · y = k
        </text>
      </svg>
      <figcaption id="curve-caption" className="font-manrope text-white/35 text-[11px] leading-[16px] tracking-[0.06em] mt-4">
        CONSTANT-PRODUCT CURVE — SHAPE ONLY, NO MARKET DATA
      </figcaption>
    </figure>
  );
}

export function LiquiditySection() {
  return (
    <SectionShell
      id="liquidity-pools"
      number="02"
      label="LIQUIDITY_POOLS"
      seed={23}
      title="A constant-product pool, simulated locally."
      intro={
        <>
          <p>
            A planned sandbox for the x · y = k model: two illustrative tokens, reserves and trade size you enter, an optional illustrative fee,
            and the resulting output and price impact computed in your browser.
          </p>
          <p>It does not connect to any protocol, moves no funds, and makes no yield claims.</p>
        </>
      }
      tags={
        <>
          <StatusTag state="demo" detail="NO FUNDS" />
          <StatusTag state="planned" />
        </>
      }
    >
      <Frame className="p-6 md:p-8">
        <p className="font-manrope text-white/45 text-[11px] leading-[16px] tracking-[0.06em] mb-3">SIMULATION — TOKEN_A / TOKEN_B (ILLUSTRATIVE)</p>
        <Readout
          rows={[
            { label: 'Reserves', value: 'Entered by you', note: 'No pool state is read from a chain.' },
            { label: 'Fee', value: 'Illustrative, editable', note: 'Not a protocol fee.' },
            { label: 'Output', value: '—', note: 'Computed locally once the simulator ships.' },
          ]}
        />
        <CurveDiagram />
      </Frame>
    </SectionShell>
  );
}
