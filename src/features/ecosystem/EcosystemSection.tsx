import { CSSProperties, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { mainnetBlockUrl } from '../../lib/chains/networks';
import { formatAge, formatBlockNumber, formatClockTime, formatGasGwei } from '../../lib/format/eth';
import { RPC_ERROR_MESSAGE } from '../../lib/web3/errors';
import { MAINNET_RPC_URL } from '../../lib/web3/config';
import { rpcHost } from '../../lib/web3/rpc';
import { usePulse } from '../../hooks/usePulse';
import { useNow } from '../../hooks/useNow';
import { DataState } from '../../lib/status';
import { BlockSnapshot, ChainTelemetry, useChainTelemetry } from './useChainTelemetry';
import { TelemetryState, blockFullnessPermille } from './telemetryState';
import { BaseFeeChart } from './BaseFeeChart';
import { BlockDetail } from './BlockDetail';
import { RecentBlocks } from './RecentBlocks';
import { RECENT_BLOCK_COUNT, useFeeHistory, useRecentBlocks } from './useBlockExplorer';
import { TransactionExplorer } from '../transactions/TransactionExplorer';

const HEIGHTS = 6;
const CYCLE_MS = 8000;
const TRAVEL = 0.6;
const DASH = '—';

const STATE_TAG: Record<TelemetryState, DataState> = { live: 'live', loading: 'loading', stale: 'stale', error: 'error' };

function BlockAge({ timestampMs }: { timestampMs: number }) {
  const now = useNow(1000);
  return <span className="text-white/45">{formatAge(timestampMs, now)}</span>;
}

/** Latest block heights as linked squares; the newest one flashes when a block arrives. */
function BlockHeights({ block, highlight }: { block: BlockSnapshot | null; highlight: bigint | null }) {
  const heights = block ? Array.from({ length: HEIGHTS }, (_, i) => block.number - BigInt(HEIGHTS - 1 - i)) : null;

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
        {Array.from({ length: HEIGHTS }, (_, i) => {
          const position = i / (HEIGHTS - 1);
          return (
            <span
              key={i}
              className="block-node"
              data-newest={i === HEIGHTS - 1}
              data-live={Boolean(heights)}
              data-highlight={heights !== null && highlight !== null && heights[i] === highlight}
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
      <div className="relative h-[16px] mt-2 font-manrope text-[11px] leading-[16px] tabular-nums hidden sm:block" aria-hidden="true">
        {heights &&
          heights.map((height, i) => {
            const position = i / (HEIGHTS - 1);
            return (
              <span
                key={height.toString()}
                className={`absolute -translate-x-1/2 whitespace-nowrap ${i === HEIGHTS - 1 ? 'text-ice' : 'text-white/35'}`}
                style={{ left: `calc(${position * 100}% - ${position * 24}px + 12px)` }}
              >
                {height.toString().slice(-4)}
              </span>
            );
          })}
      </div>
      <figcaption className="font-manrope text-white/45 text-[11px] leading-[16px] tracking-[0.06em] mt-3">
        {heights ? `LATEST ${HEIGHTS} HEIGHTS (LAST 4 DIGITS) — A NEW BLOCK ROUGHLY EVERY 12 S` : 'BLOCK HEIGHTS APPEAR WHEN THE RPC RESPONDS'}
      </figcaption>
    </figure>
  );
}

function FullnessBar({ permille }: { permille: number }) {
  return (
    <span className="mt-[6px] block h-[5px] w-full max-w-[200px] border border-white/15" aria-hidden="true">
      <span className="block h-full bg-ice/70 transition-[width] duration-700" style={{ width: `${permille / 10}%` }} />
    </span>
  );
}

function telemetryRows(t: ChainTelemetry) {
  const { block } = t;
  const fullness = block ? blockFullnessPermille(block.gasUsed, block.gasLimit) : 0;
  return [
    {
      label: 'Chain ID',
      value: t.chainId ?? DASH,
      note: t.chainId ? 'Reported by the RPC (eth_chainId) and checked before any data is shown.' : 'Waiting for the RPC to confirm Ethereum Mainnet.',
    },
    {
      label: 'Latest block',
      value: block ? (
        <span className="inline-flex flex-wrap items-baseline gap-x-3">
          <a
            href={mainnetBlockUrl(block.number)}
            target="_blank"
            rel="noopener noreferrer"
            className="tabular-nums text-white hover:text-ice underline decoration-white/20 underline-offset-4"
          >
            #{formatBlockNumber(block.number)}
          </a>
          <BlockAge timestampMs={block.timestampMs} />
        </span>
      ) : (
        DASH
      ),
      note: block ? 'Opens the block on Etherscan.' : 'Waiting for the RPC.',
    },
    {
      label: 'Base fee',
      value: block?.baseFeePerGas != null ? `${formatGasGwei(block.baseFeePerGas)} gwei` : DASH,
      note: block ? 'Protocol base fee from the latest block header.' : 'Waiting for the RPC.',
    },
    {
      label: 'Priority tip',
      value: t.priorityFee !== null ? `${formatGasGwei(t.priorityFee)} gwei` : DASH,
      note:
        t.priorityFee !== null
          ? 'Suggested by the RPC (eth_maxPriorityFeePerGas). An estimate.'
          : block
            ? 'Not reported reliably right now.'
            : 'Waiting for the RPC.',
    },
    {
      label: 'Block fullness',
      value: block ? (
        <>
          <span className="tabular-nums">{(fullness / 10).toFixed(1)}% of gas limit</span>
          <FullnessBar permille={fullness} />
        </>
      ) : (
        <>
          {DASH}
          <FullnessBar permille={0} />
        </>
      ),
    },
  ];
}

export function EcosystemSection() {
  const telemetry = useChainTelemetry();
  const pulseRef = useRef<HTMLDivElement>(null);
  usePulse(pulseRef, 'block', 'pulse-block', 1600);
  const { state, errorKind, lastSuccess } = telemetry;

  // Explorer state lives here so the list, chart, schematic and detail stay linked.
  const [selected, setSelected] = useState<bigint | null>(null);
  const [focused, setFocused] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const txRef = useRef<HTMLDivElement>(null);
  // Past blocks are immutable: on RPC failure the explorer keeps the last known head, labelled as such.
  const head = telemetry.block?.number ?? lastSuccess?.number ?? null;
  const headIsCurrent = state === 'live';
  const recent = useRecentBlocks(head);
  const fees = useFeeHistory(head);

  const inspectTx = (hash: `0x${string}`) => {
    setTxHash(hash);
    txRef.current?.scrollIntoView({ block: 'start' });
  };

  const explorerTag = headIsCurrent ? (
    <StatusTag state="live" />
  ) : head !== null ? (
    <StatusTag state="stale" detail="LAST KNOWN HEAD" />
  ) : (
    <StatusTag state={STATE_TAG[state]} />
  );

  const wide = (
    <div className="grid gap-6 lg:grid-cols-12">
      <Frame className="p-6 md:p-8 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">RECENT BLOCKS · LATEST {RECENT_BLOCK_COUNT}</p>
          {explorerTag}
        </div>
        {/* Reserve the list's height while loading so content below never jumps (deep links, CLS). */}
        <div className="min-h-[392px]">
          {head === null ? (
            <p className="font-manrope text-white/45 text-[13px] leading-[19px] py-6">Blocks appear when the RPC responds.</p>
          ) : (
            <RecentBlocks rows={recent} focused={focused} selected={selected} onFocusBlock={setFocused} onSelectBlock={setSelected} />
          )}
        </div>
        {selected !== null && <BlockDetail number={selected} onClose={() => setSelected(null)} onInspectTx={inspectTx} />}
      </Frame>

      <Frame className="p-6 md:p-8 lg:col-span-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">BASE FEE HISTORY · 20 BLOCKS</p>
          {fees.isError && !fees.data ? <StatusTag state="error" /> : explorerTag}
        </div>
        <BaseFeeChart
          points={fees.data ?? null}
          stale={!headIsCurrent || fees.isPlaceholderData}
          focused={focused}
          selected={selected}
          onFocusBlock={setFocused}
          onSelectBlock={setSelected}
        />
        {fees.isError && (
          <button type="button" className="mt-3 font-manrope text-[13px] text-ice hover:underline underline-offset-4" onClick={() => void fees.refetch()}>
            RETRY FEE HISTORY
          </button>
        )}
      </Frame>

      <div ref={txRef} className="lg:col-span-12 scroll-mt-24">
        <Frame className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">TRANSACTION LOOKUP · ETHEREUM MAINNET</p>
            <span className="inline-flex items-center border border-white/15 rounded-[2px] px-[6px] py-[2px] font-manrope text-[11px] leading-[14px] tracking-[0.04em] text-white/60">
              READ-ONLY
            </span>
          </div>
          <TransactionExplorer hash={txHash} latest={telemetry.block?.number ?? null} onLookup={setTxHash} />
        </Frame>
      </div>
    </div>
  );

  return (
    <SectionShell
      id="ecosystem"
      number="01"
      label="ECOSYSTEM"
      seed={11}
      wide={wide}
      title="Public chain telemetry, read-only."
      intro={
        <>
          <p>
            Live reads from Ethereum Mainnet through a public RPC endpoint: the latest blocks, their base fees and how full they are, plus a
            read-only lookup for any transaction hash. No wallet is needed and nothing is ever written to the chain.
          </p>
          <p>Select a block or a bar in the fee chart to inspect it. Polling follows the ~12 s block time and pauses while this tab is hidden.</p>
        </>
      }
      tags={
        <>
          <StatusTag state={STATE_TAG[state]} detail={state === 'live' ? 'ETHEREUM MAINNET' : undefined} />
          <span className="inline-flex items-center border border-white/15 rounded-[2px] px-[6px] py-[2px] font-manrope text-[11px] leading-[14px] tracking-[0.04em] text-white/60">
            READ-ONLY
          </span>
        </>
      }
    >
      <div ref={pulseRef} className="telemetry-panel" data-telemetry={state}>
        <Frame className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">
              ETHEREUM MAINNET · VIA {rpcHost(MAINNET_RPC_URL).toUpperCase()}
            </p>
            <StatusTag state={STATE_TAG[state]} />
          </div>

          <Readout rows={telemetryRows(telemetry)} />

          <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3" role="status">
            <p className="font-manrope text-[12px] leading-[17px] text-white/55">
              {state === 'error' && errorKind ? (
                <span className="text-[#ffb4a8]">{RPC_ERROR_MESSAGE[errorKind]}</span>
              ) : state === 'loading' ? (
                'Contacting the RPC…'
              ) : state === 'stale' ? (
                'No fresh response recently. Values above may be out of date.'
              ) : null}
              {lastSuccess && (
                <span className="block text-white/45">
                  Last successful read: block #{formatBlockNumber(lastSuccess.number)} at {formatClockTime(lastSuccess.at)}
                </span>
              )}
            </p>
            {(state === 'error' || state === 'stale') && (
              <button
                type="button"
                onClick={telemetry.retry}
                disabled={telemetry.isFetching}
                className="inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[15.6px] text-ice hover:underline underline-offset-4 disabled:opacity-50"
              >
                <RotateCw className={telemetry.isFetching ? 'w-[12px] h-[12px] animate-spin' : 'w-[12px] h-[12px]'} strokeWidth={1.5} aria-hidden="true" />
                {telemetry.isFetching ? 'RETRYING' : 'RETRY'}
              </button>
            )}
          </div>

          <BlockHeights block={telemetry.block} highlight={focused ?? selected} />
        </Frame>
      </div>
    </SectionShell>
  );
}
