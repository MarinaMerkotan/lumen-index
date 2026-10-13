import { ReactNode } from 'react';

export interface ReadoutRow {
  label: string;
  value: ReactNode;
  /** Short provenance note shown under the value. */
  note?: string;
}

/** Label/value telemetry rows. Values that are not available render as an em dash, never a mock figure. */
export function Readout({ rows, className = '' }: { rows: ReadoutRow[]; className?: string }) {
  return (
    <dl className={`font-manrope ${className}`}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="readout-row grid grid-cols-1 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-4 gap-y-[4px] py-[11px] border-t border-white/[0.08] first:border-t-0"
        >
          <dt className="text-white/45 text-[11px] leading-[18px] tracking-[0.06em] uppercase">{row.label}</dt>
          <dd className="text-white text-[13px] leading-[18px] min-w-0 break-words">
            {row.value}
            {row.note && <span className="block text-white/50 text-[12px] leading-[17px] mt-[3px]">{row.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
