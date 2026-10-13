import { useRef } from 'react';
import { RotateCw } from 'lucide-react';
import { formatAge, formatBlockNumber, formatGasGwei } from '../../lib/format/eth';
import { useNow } from '../../hooks/useNow';
import { blockFullnessPermille } from './telemetryState';
import type { RecentBlockRow } from './useBlockExplorer';

interface RecentBlocksProps {
  rows: RecentBlockRow[];
  focused: bigint | null;
  selected: bigint | null;
  onFocusBlock: (block: bigint | null) => void;
  onSelectBlock: (block: bigint | null) => void;
}

const COLS = 'grid grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-[minmax(0,1.1fr)_4.5rem_3.5rem_minmax(0,1fr)_5.5rem] items-center gap-x-4';

/** Latest blocks, newest first. Rows for heads that arrive after mount slide in; selection opens the detail. */
export function RecentBlocks({ rows, focused, selected, onFocusBlock, onSelectBlock }: RecentBlocksProps) {
  const now = useNow(1000);
  const firstHead = useRef<bigint | null>(null);
  if (firstHead.current === null && rows[0]) firstHead.current = rows[0].number;

  return (
    <div>
      <div className={`${COLS} pb-2 border-b border-white/10 font-manrope text-[11px] leading-[14px] tracking-[0.06em] text-white/40`} aria-hidden="true">
        <span>BLOCK</span>
        <span className="hidden sm:block">AGE</span>
        <span className="text-right sm:text-left">TXS</span>
        <span className="hidden sm:block">GAS USED</span>
        <span className="text-right">BASE FEE</span>
      </div>
      <ol aria-label="Recent Ethereum Mainnet blocks, newest first">
        {rows.map((row) => {
          const isNew = firstHead.current !== null && row.number > firstHead.current;
          const block = row.block;
          const fullness = block ? blockFullnessPermille(block.gasUsed, block.gasLimit) : 0;
          const label = block
            ? `Block ${formatBlockNumber(row.number)}, ${block.txCount} transactions, ${(fullness / 10).toFixed(1)}% gas used${
                block.baseFeePerGas !== null ? `, base fee ${formatGasGwei(block.baseFeePerGas)} gwei` : ''
              }`
            : `Block ${formatBlockNumber(row.number)}, ${row.status === 'error' ? 'failed to load' : 'loading'}`;
          return (
            <li key={row.number.toString()} className={isNew ? 'block-row-enter' : undefined}>
              <button
                type="button"
                className={`block-row ${COLS} w-full text-left py-[9px] border-b border-white/[0.06] font-manrope text-[13px] leading-[16px]`}
                data-selected={selected === row.number}
                data-focused={focused === row.number}
                aria-pressed={selected === row.number}
                aria-label={label}
                disabled={!block && row.status !== 'error'}
                onPointerEnter={() => onFocusBlock(row.number)}
                onPointerLeave={() => onFocusBlock(null)}
                onFocus={() => onFocusBlock(row.number)}
                onBlur={() => onFocusBlock(null)}
                onClick={() => (row.status === 'error' ? row.retry() : onSelectBlock(selected === row.number ? null : row.number))}
              >
                <span className="tabular-nums text-white">#{formatBlockNumber(row.number)}</span>
                {block ? (
                  <>
                    <span className="hidden sm:block text-white/45 tabular-nums">{formatAge(block.timestampMs, now)}</span>
                    <span className="text-right sm:text-left tabular-nums text-white/80">{block.txCount}</span>
                    <span className="hidden sm:flex items-center gap-2">
                      <span className="block h-[4px] flex-1 max-w-[90px] border border-white/15" aria-hidden="true">
                        <span className="block h-full bg-ice/60" style={{ width: `${fullness / 10}%` }} />
                      </span>
                      <span className="tabular-nums text-white/55 text-[12px]">{(fullness / 10).toFixed(0)}%</span>
                    </span>
                    <span className="text-right tabular-nums text-white/80">{block.baseFeePerGas !== null ? formatGasGwei(block.baseFeePerGas) : '—'}</span>
                  </>
                ) : row.status === 'error' ? (
                  <span className="col-span-2 sm:col-span-4 text-right text-[#ffb4a8] text-[12px] inline-flex justify-end items-center gap-[6px]">
                    <RotateCw className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" /> READ FAILED · RETRY
                  </span>
                ) : (
                  <span className="col-span-2 sm:col-span-4 text-right text-white/35 text-[12px]">reading…</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-manrope text-[11px] leading-[16px] tracking-[0.04em] text-white/40">BASE FEE IN GWEI · SELECT A BLOCK FOR DETAILS</p>
    </div>
  );
}
