import { KeyboardEvent, useMemo, useRef, useState } from 'react';
import { formatBlockNumber, formatGasGwei } from '../../lib/format/eth';
import { FeePoint, chartGeometry } from './blocks';

interface BaseFeeChartProps {
  points: FeePoint[] | null;
  /** True when the series is the last good one while the RPC is failing or stale. */
  stale: boolean;
  focused: bigint | null;
  selected: bigint | null;
  onFocusBlock: (block: bigint | null) => void;
  onSelectBlock: (block: bigint) => void;
}

function describe(point: FeePoint): string {
  const fee = point.baseFee === null ? 'no value returned' : `${formatGasGwei(point.baseFee)} gwei`;
  if (point.kind === 'next') return `Next block ${formatBlockNumber(point.block)}: base fee ${fee}, computed by the protocol from the latest block (not mined yet)`;
  const fill = point.gasUsedRatio === null ? '' : `, ${(point.gasUsedRatio * 100).toFixed(1)}% of gas limit used`;
  return `Block ${formatBlockNumber(point.block)}: base fee ${fee}${fill}`;
}

/**
 * Base fee per block from `eth_feeHistory`. One bar per real observation; a missing value is an
 * empty slot, never interpolated. The protocol-computed next-block fee is drawn as an outline.
 */
export function BaseFeeChart({ points, stale, focused, selected, onFocusBlock, onSelectBlock }: BaseFeeChartProps) {
  const geometry = useMemo(() => chartGeometry(points ?? [], 100, 100, 0), [points]);
  const [cursor, setCursor] = useState<number | null>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const bars = geometry.bars;
  const activeIndex = cursor ?? (focused !== null ? bars.findIndex((b) => b.point.block === focused) : -1);
  const active = activeIndex >= 0 ? bars[activeIndex] : null;
  const rovingIndex = activeIndex >= 0 ? activeIndex : Math.max(bars.length - 2, 0);

  const activate = (index: number | null) => {
    setCursor(index);
    onFocusBlock(index === null ? null : bars[index].point.block);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const current = activeIndex >= 0 ? activeIndex : rovingIndex;
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? bars.length - 1 : Math.min(Math.max(current + (event.key === 'ArrowRight' ? 1 : -1), 0), bars.length - 1);
    activate(next);
    barsRef.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  };

  if (!points || bars.length === 0) {
    return <p className="font-manrope text-white/45 text-[12px] leading-[17px] py-10">Fee history appears when the RPC responds.</p>;
  }

  const observed = bars.filter((b) => b.point.kind === 'observed');
  const first = observed[0]?.point.block;
  const last = observed[observed.length - 1]?.point.block;

  return (
    <figure className={`fee-chart ${stale ? 'opacity-60' : ''}`} aria-labelledby="fee-chart-caption">
      <div className="relative h-[34px] mb-2" aria-live="polite">
        {active ? (
          <p className="font-manrope text-[12px] leading-[16px] text-white">
            <span className={active.point.kind === 'next' ? 'text-ice' : 'text-white'}>
              {active.point.kind === 'next' ? 'NEXT BLOCK' : `#${formatBlockNumber(active.point.block)}`}
            </span>{' '}
            <span className="tabular-nums">{active.point.baseFee === null ? '— no value' : `${formatGasGwei(active.point.baseFee)} gwei`}</span>
            <span className="block text-white/45">
              {active.point.kind === 'next'
                ? 'Computed by EIP-1559 from the latest block. Not an observation.'
                : active.point.gasUsedRatio === null
                  ? 'Observed base fee.'
                  : `Observed · ${(active.point.gasUsedRatio * 100).toFixed(1)}% of gas limit used`}
            </span>
          </p>
        ) : (
          <p className="font-manrope text-[12px] leading-[16px] text-white/45">Hover or focus a bar. Select one to inspect the block.</p>
        )}
      </div>

      <div className="relative">
        <span className="absolute -top-[2px] right-0 font-manrope text-[11px] leading-[14px] text-white/40 tabular-nums">{formatGasGwei(geometry.max)} gwei</span>
        <span className="absolute bottom-0 right-0 translate-y-full pt-1 font-manrope text-[11px] leading-[14px] text-white/40 tabular-nums">{formatGasGwei(geometry.min)} gwei</span>
        <div
          ref={barsRef}
          role="group"
          aria-label="Base fee per block, oldest to newest"
          className="fee-bars relative h-[140px] mr-[64px] flex items-end gap-[3px] border-b border-white/15"
          onKeyDown={onKeyDown}
          onPointerLeave={() => activate(null)}
        >
          {bars.map((bar) => {
            const isNext = bar.point.kind === 'next';
            const block = bar.point.block;
            return (
              <button
                key={block.toString()}
                type="button"
                tabIndex={bar.index === rovingIndex ? 0 : -1}
                className="fee-bar group relative flex-1 h-full flex items-end"
                data-kind={bar.point.kind}
                data-active={bar.index === activeIndex}
                data-selected={selected === block}
                aria-label={describe(bar.point)}
                aria-pressed={isNext ? undefined : selected === block}
                aria-disabled={isNext || undefined}
                onPointerEnter={() => activate(bar.index)}
                onFocus={() => activate(bar.index)}
                onClick={() => !isNext && onSelectBlock(block)}
              >
                {bar.y === null ? (
                  <span className="fee-bar__missing" aria-hidden="true" />
                ) : (
                  <span className="fee-bar__fill" style={{ height: `${bar.height}%` }} aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 mr-[64px] flex justify-between font-manrope text-[11px] leading-[16px] text-white/45 tabular-nums" aria-hidden="true">
        <span>#{first !== undefined ? formatBlockNumber(first) : '—'}</span>
        <span>#{last !== undefined ? formatBlockNumber(last) : '—'} → next</span>
      </div>
      <figcaption id="fee-chart-caption" className="mt-3 font-manrope text-[11px] leading-[16px] tracking-[0.04em] text-white/45">
        BASE FEE PER BLOCK (GWEI) FROM eth_feeHistory · DASHED OUTLINE = NEXT BLOCK, COMPUTED BY THE PROTOCOL
      </figcaption>
    </figure>
  );
}
