import { useId, useReducer, useRef } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { StatusTag } from '../../components/ui/StatusTag';
import { usePulse } from '../../hooks/usePulse';
import { emitPulse } from '../../lib/pulseBus';
import { INITIAL_VOTE, VOTE_OPTIONS, localResults, voteReducer } from './vote';

const ACTION = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] transition-colors';

/** One illustrative proposal, voted on locally. State lives in React only and resets on reload. */
export function LocalPoll() {
  const [state, dispatch] = useReducer(voteReducer, INITIAL_VOTE);
  const name = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  usePulse(panelRef, 'vote-cast', 'pulse-signal', 1400);
  const results = localResults(state);
  const locked = state.cast !== null;

  const cast = () => {
    dispatch({ type: 'cast' });
    emitPulse('vote-cast');
  };

  return (
    <div ref={panelRef} className="tx-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="font-manrope text-white text-[13px] leading-[18px]">PROPOSAL // EXAMPLE-01</p>
        <StatusTag state="demo" detail="NOT ON-CHAIN" />
      </div>
      <h3 className="mt-3 font-graphik text-white text-[20px] leading-[26px]">Keep the interface monochrome with a single ice-blue accent.</h3>
      <p className="mt-2 font-manrope text-white/55 text-[13px] leading-[19px]">
        An illustrative, harmless proposal used to demonstrate a voting flow. It has no author, no quorum and no effect.
      </p>

      <fieldset className="mt-5" disabled={locked}>
        <legend className="sr-only">Your local vote</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {VOTE_OPTIONS.map((option) => (
            <label key={option} className="poll-choice" data-selected={state.selected === option} data-cast={state.cast === option}>
              <input
                type="radio"
                name={name}
                value={option}
                checked={state.selected === option}
                onChange={() => dispatch({ type: 'select', option })}
                className="sr-only"
              />
              <span className="poll-choice__box" aria-hidden="true">
                {state.selected === option && <Check className="w-[11px] h-[11px]" strokeWidth={2} />}
              </span>
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {!locked ? (
          <button type="button" className="wallet-cta" onClick={cast} disabled={!state.selected}>
            CAST LOCAL VOTE
          </button>
        ) : (
          <button type="button" className={`${ACTION} text-ice hover:text-white`} onClick={() => dispatch({ type: 'change' })}>
            CHANGE VOTE
          </button>
        )}
        {(state.selected || locked) && (
          <button type="button" className={`${ACTION} text-white/60 hover:text-white`} onClick={() => dispatch({ type: 'reset' })}>
            <RotateCcw className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" /> RESET
          </button>
        )}
      </div>

      <div className="mt-7" aria-live="polite">
        <p className="mb-3 font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">YOUR LOCAL SELECTION — NOT A COMMUNITY TALLY</p>
        <ul className="space-y-4" aria-label="Local result">
          {results.map((result) => (
            <li key={result.option} className="grid grid-cols-[5.5rem_minmax(0,1fr)_4.5rem] items-center gap-4">
              <span className="font-manrope text-white/70 text-[12px] leading-[16px] tracking-[0.06em]">{result.option}</span>
              <span className="poll-track relative h-[7px] border border-white/15" aria-hidden="true">
                <span className="poll-fill" style={{ width: `${result.share}%` }} />
              </span>
              <span className="font-manrope text-[13px] leading-[16px] text-right tabular-nums text-white/70">
                {locked ? `${result.votes} · ${result.share}%` : '—'}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-manrope text-white/45 text-[12px] leading-[17px] max-w-[440px]">
          {locked
            ? `You cast ${state.cast} in this browser tab. That is the only vote counted here: nothing is signed, sent or stored, and a reload clears it.`
            : 'Choose an option and cast it. Results show your own single selection only; there are no other voters.'}
        </p>
      </div>
    </div>
  );
}
