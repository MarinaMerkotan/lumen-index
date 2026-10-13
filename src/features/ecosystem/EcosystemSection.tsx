import { CSSProperties } from 'react';
import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';

const BLOCKS = 6;
const CYCLE_MS = 8000;
/** Share of the cycle the signal needs to cross the schematic (matches `schematicSignal`). */
const TRAVEL = 0.6;

/** Illustrative block chain: squares linked by a hairline with a travelling signal. Carries no data. */
function BlockSchematic() {
  return (
    <figure className="mt-8">
      <div className="block-schematic relative h-[44px]" aria-hidden="true">
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <line className="schematic-line" x1="12" y1="50%" x2="100%" y2="50%" />
          <line
            className="schematic-signal"
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            pathLength={100}
            style={{ '--dur': `${CYCLE_MS}ms`, '--delay': '900ms' } as CSSProperties}
          />
        </svg>
        {Array.from({ length: BLOCKS }, (_, i) => {
          const position = i / (BLOCKS - 1);
          return (
            <span
              key={i}
              className="block-node"
              style={
                {
                  left: `calc(${position * 100}% - ${position * 24}px)`,
                  '--dur': `${CYCLE_MS}ms`,
                  '--delay': `${900 + position * TRAVEL * CYCLE_MS}ms`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
      <figcaption className="font-manrope text-white/35 text-[11px] leading-[16px] tracking-[0.06em] mt-4">
        SCHEMATIC — ILLUSTRATES BLOCK FLOW, NOT LIVE DATA
      </figcaption>
    </figure>
  );
}

export function EcosystemSection() {
  return (
    <SectionShell
      id="ecosystem"
      number="01"
      label="ECOSYSTEM"
      seed={11}
      title="Public chain telemetry, read-only."
      intro={
        <>
          <p>
            The next build reads the latest Ethereum Mainnet block and a fee estimate straight from a public RPC endpoint. No wallet is required and
            nothing is written to the chain.
          </p>
          <p>Until then, no figures are shown. Values below stay empty instead of being simulated.</p>
        </>
      }
      tags={
        <>
          <StatusTag state="next" />
          <StatusTag state="unavailable" detail="NO RPC IN THIS BUILD" />
        </>
      }
    >
      <Frame className="p-6 md:p-8">
        <p className="font-manrope text-white/45 text-[11px] leading-[16px] tracking-[0.06em] mb-3">TARGET — ETHEREUM MAINNET · READ-ONLY</p>
        <Readout
          rows={[
            { label: 'Chain ID', value: '1', note: 'Static configuration, not a network response.' },
            { label: 'Latest block', value: '—', note: 'Unavailable until the RPC client ships.' },
            { label: 'Fee estimate', value: '—', note: 'Shown only when the RPC reports it reliably.' },
            { label: 'RPC state', value: <StatusTag state="unavailable" /> },
          ]}
        />
        <BlockSchematic />
      </Frame>
    </SectionShell>
  );
}
