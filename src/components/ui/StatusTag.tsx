import { DATA_STATE_LABEL, DataState } from '../../lib/status';

const TONE: Record<DataState, string> = {
  live: 'border-ice/60 text-ice',
  stale: 'border-dashed border-white/35 text-white/70',
  wallet: 'border-ice/40 text-ice/90',
  demo: 'border-ice/50 text-ice',
  disconnected: 'border-white/25 text-white/70',
  unavailable: 'border-white/15 text-white/45',
  loading: 'border-white/25 text-white/70',
  error: 'border-[#ffb4a8]/60 text-[#ffb4a8]',
  next: 'border-ice bg-ice text-black',
  planned: 'border-white/20 text-white/60',
};

interface StatusTagProps {
  state: DataState;
  /** Optional qualifier, e.g. `NO FUNDS` -> `DEMO — NO FUNDS`. */
  detail?: string;
  /** Replaces the default state word (keeps the state's tone), e.g. `SUCCESS` in the live tone. */
  label?: string;
  className?: string;
}

/** Compact truth label used for every figure or control whose data source must be explicit. */
export function StatusTag({ state, detail, label, className = '' }: StatusTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-[6px] border rounded-[2px] px-[6px] py-[2px] font-manrope text-[11px] leading-[14px] tracking-[0.04em] whitespace-nowrap ${TONE[state]} ${className}`}
      data-state={state}
    >
      {(state === 'live' || state === 'loading') && <span className="status-dot" aria-hidden="true" />}
      {label ?? DATA_STATE_LABEL[state]}
      {detail && <span className="opacity-70">— {detail}</span>}
    </span>
  );
}
