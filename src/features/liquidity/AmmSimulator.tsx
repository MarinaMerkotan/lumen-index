import { useId, useMemo, useState } from 'react';
import { ArrowLeftRight, RotateCcw } from 'lucide-react';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { formatTokenAmount } from '../../lib/format/eth';
import { AmountResult, FeeResult, SCALE_DECIMALS, formatPpm, impactLevel, parseAmount, parseFeePercent, quoteSwap } from './amm';
import { curveGeometry } from './curve';

export const AMM_DEFAULTS = { reserveA: '1000', reserveB: '2500', amount: '25', fee: '0.3' } as const;
const SYMBOL = { A: 'TOKEN_A', B: 'TOKEN_B' } as const;
const VIEW_W = 320;
const VIEW_H = 140;

const AMOUNT_ERROR: Record<Exclude<AmountResult, { ok: true }>['reason'], string> = {
  empty: 'Enter a number.',
  format: 'Use a plain number such as 1500 or 0.25 (no signs, commas or exponents).',
  'too-precise': 'At most 18 decimal places.',
  'too-large': 'At most 15 digits before the decimal point.',
};
const FEE_ERROR: Record<Exclude<FeeResult, { ok: true }>['reason'], string> = {
  empty: 'Enter a fee, 0 for none.',
  format: 'Use a plain percentage such as 0.3.',
  'too-precise': 'At most two decimal places.',
  'out-of-range': 'Between 0% and 10%.',
};

const fmt = (value: bigint, places = 6) => formatTokenAmount(value, SCALE_DECIMALS, places);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  suffix: string;
}

function Field({ label, value, onChange, error, suffix }: FieldProps) {
  const id = useId();
  const errorId = useId();
  return (
    <div>
      <label htmlFor={id} className="block mb-[6px] font-manrope text-white/50 text-[11px] leading-[14px] tracking-[0.06em]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="explorer-input w-full pr-[84px]"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-manrope text-[11px] tracking-[0.04em] text-white/40 pointer-events-none">
          {suffix}
        </span>
      </div>
      {error && (
        <p id={errorId} className="mt-[6px] font-manrope text-[#ffb4a8] text-[12px] leading-[16px]">
          {error}
        </p>
      )}
    </div>
  );
}

const IMPACT_TAG = {
  none: <StatusTag state="demo" label="NO IMPACT" />,
  low: <StatusTag state="demo" label="LOW IMPACT" />,
  notice: <StatusTag state="stale" label="NOTICEABLE IMPACT" />,
  high: <StatusTag state="error" label="HIGH IMPACT" />,
} as const;

/** Local x·y=k simulator. Every number on screen is computed in this component; nothing touches a network. */
export function AmmSimulator() {
  const [reserveA, setReserveA] = useState<string>(AMM_DEFAULTS.reserveA);
  const [reserveB, setReserveB] = useState<string>(AMM_DEFAULTS.reserveB);
  const [amount, setAmount] = useState<string>(AMM_DEFAULTS.amount);
  const [fee, setFee] = useState<string>(AMM_DEFAULTS.fee);
  const [direction, setDirection] = useState<'AtoB' | 'BtoA'>('AtoB');

  const parsed = useMemo(
    () => ({ a: parseAmount(reserveA), b: parseAmount(reserveB), amount: parseAmount(amount), fee: parseFeePercent(fee) }),
    [reserveA, reserveB, amount, fee],
  );
  const tokenIn = direction === 'AtoB' ? 'A' : 'B';
  const tokenOut = direction === 'AtoB' ? 'B' : 'A';

  const result = useMemo(() => {
    if (!parsed.a.ok || !parsed.b.ok || !parsed.amount.ok || !parsed.fee.ok) return null;
    const [rIn, rOut] = direction === 'AtoB' ? [parsed.a.value, parsed.b.value] : [parsed.b.value, parsed.a.value];
    return { reserveIn: rIn, quote: quoteSwap(rIn, rOut, parsed.amount.value, parsed.fee.bps) };
  }, [parsed, direction]);

  const quote = result?.quote.ok ? result.quote.quote : null;
  const reserveAfter = quote
    ? direction === 'AtoB'
      ? { a: quote.newReserveIn, b: quote.newReserveOut }
      : { a: quote.newReserveOut, b: quote.newReserveIn }
    : null;
  const geometry =
    reserveAfter && parsed.a.ok && parsed.b.ok ? curveGeometry(parsed.a.value, parsed.b.value, reserveAfter.a, reserveAfter.b, VIEW_W, VIEW_H) : null;
  const oversized = quote !== null && result !== null && quote.amountIn > result.reserveIn;

  const reset = () => {
    setReserveA(AMM_DEFAULTS.reserveA);
    setReserveB(AMM_DEFAULTS.reserveB);
    setAmount(AMM_DEFAULTS.amount);
    setFee(AMM_DEFAULTS.fee);
    setDirection('AtoB');
  };

  const amountError = (r: AmountResult) => (r.ok ? null : AMOUNT_ERROR[r.reason]);

  return (
    <div className="amm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="RESERVE A" value={reserveA} onChange={setReserveA} error={amountError(parsed.a)} suffix={SYMBOL.A} />
        <Field label="RESERVE B" value={reserveB} onChange={setReserveB} error={amountError(parsed.b)} suffix={SYMBOL.B} />
        <Field
          label={`SWAP AMOUNT (${SYMBOL[tokenIn]} IN)`}
          value={amount}
          onChange={setAmount}
          error={amountError(parsed.amount)}
          suffix={SYMBOL[tokenIn]}
        />
        <Field label="ILLUSTRATIVE FEE" value={fee} onChange={setFee} error={parsed.fee.ok ? null : FEE_ERROR[parsed.fee.reason]} suffix="%" />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => setDirection((d) => (d === 'AtoB' ? 'BtoA' : 'AtoB'))}
          className="inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] text-ice hover:text-white transition-colors"
        >
          <ArrowLeftRight className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" />
          SWAP {SYMBOL[tokenIn]} → {SYMBOL[tokenOut]}
          <span className="sr-only">(press to reverse the direction)</span>
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] text-white/60 hover:text-white transition-colors"
        >
          <RotateCcw className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" /> RESET DEFAULTS
        </button>
      </div>

      <figure className="mt-7" aria-label="Constant-product curve with the pool state before and after the simulated swap">
        <p className="mb-2 font-manrope text-[11px] leading-[14px] tracking-[0.06em] text-white/45 select-none" aria-hidden="true">
          ↑ RESERVE B
        </p>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto overflow-visible" aria-hidden="true">
          <line x1="0" y1={VIEW_H} x2={VIEW_W} y2={VIEW_H} className="curve-axis" />
          <line x1="0" y1="0" x2="0" y2={VIEW_H} className="curve-axis" />
          {geometry && (
            <>
              <path d={geometry.path} className="curve-base amm-curve" />
              <line x1={geometry.before.x} y1={geometry.before.y} x2={geometry.after.x} y2={geometry.after.y} className="amm-move" />
              <g className="amm-point" style={{ transform: `translate(${geometry.before.x}px, ${geometry.before.y}px)` }}>
                <circle r="4.5" className="amm-point__before" />
              </g>
              <g className="amm-point" style={{ transform: `translate(${geometry.after.x}px, ${geometry.after.y}px)` }}>
                <circle r="7" className="amm-point__halo" />
                <circle r="3.5" className="amm-point__after" />
              </g>
            </>
          )}
        </svg>
        <p className="mt-2 text-right font-manrope text-[11px] leading-[14px] tracking-[0.06em] text-white/45 select-none" aria-hidden="true">
          RESERVE A →
        </p>
        <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-manrope text-[11px] leading-[16px] tracking-[0.04em] text-white/45">
          <span>
            <span className="inline-block w-[7px] h-[7px] rounded-full bg-white/70 mr-[6px]" aria-hidden="true" />
            BEFORE
          </span>
          <span>
            <span className="inline-block w-[7px] h-[7px] rounded-full bg-ice mr-[6px]" aria-hidden="true" />
            AFTER THE SIMULATED SWAP
          </span>
          <span>x · y = k</span>
        </figcaption>
      </figure>

      <div className="mt-6" aria-live="polite">
        {result && !result.quote.ok && (
          <p className="font-manrope text-[#ffb4a8] text-[13px] leading-[19px]">Both reserves must be greater than zero for the pool to quote a price.</p>
        )}
        {!result && <p className="font-manrope text-white/45 text-[13px] leading-[19px]">Fix the highlighted fields to see the simulated result.</p>}
        {quote && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">SIMULATED RESULT</p>
              {IMPACT_TAG[impactLevel(quote.priceImpactPpm)]}
            </div>
            <Readout
              rows={[
                {
                  label: 'You would receive',
                  value: (
                    <span className="font-display text-[20px] leading-[24px] tabular-nums">
                      {fmt(quote.amountOut)} <span className="text-white/55 text-[13px]">{SYMBOL[tokenOut]}</span>
                    </span>
                  ),
                  note: `Simulated only. Fee kept in the pool: ${fmt(quote.feeAmount)} ${SYMBOL[tokenIn]}.`,
                },
                {
                  label: 'Spot price',
                  value: `1 ${SYMBOL[tokenIn]} = ${fmt(quote.spotPriceBefore)} ${SYMBOL[tokenOut]}`,
                  note: `After the swap: ${fmt(quote.spotPriceAfter)} ${SYMBOL[tokenOut]}`,
                },
                {
                  label: 'Price impact',
                  value: formatPpm(quote.priceImpactPpm),
                  note: oversized
                    ? 'The swap is larger than the input reserve: output approaches, but never reaches, the whole opposite reserve.'
                    : 'How far the pool price moves (fee excluded).',
                },
                {
                  label: 'New reserves',
                  value: reserveAfter ? `${fmt(reserveAfter.a, 4)} ${SYMBOL.A} · ${fmt(reserveAfter.b, 4)} ${SYMBOL.B}` : '—',
                  note: 'k is preserved before the fee and grows slightly with it.',
                },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
