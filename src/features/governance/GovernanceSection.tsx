import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { StatusTag } from '../../components/ui/StatusTag';

const OPTIONS = ['FOR', 'AGAINST', 'ABSTAIN'] as const;

export function GovernanceSection() {
  return (
    <SectionShell
      id="governance"
      number="04"
      label="GOVERNANCE"
      seed={41}
      title="A local poll, not an on-chain vote."
      intro={
        <>
          <p>
            A planned single-visitor example of a proposal flow. Choices will live in memory only, are not signed or submitted anywhere, and
            reset when you reload.
          </p>
          <p>Results will never be presented as a community tally.</p>
        </>
      }
      tags={
        <>
          <StatusTag state="demo" detail="NOT ON-CHAIN" />
          <StatusTag state="planned" />
        </>
      }
    >
      <Frame className="p-6 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <p className="font-manrope text-white text-[13px] leading-[18px]">PROPOSAL // EXAMPLE-01</p>
          <p className="font-manrope text-white/40 text-[11px] leading-[16px] tracking-[0.06em]">ILLUSTRATIVE — NO VOTES RECORDED</p>
        </div>
        <ul className="mt-6 space-y-5" aria-label="Poll options (inactive)">
          {OPTIONS.map((option) => (
            <li key={option} className="poll-option grid grid-cols-[5.5rem_minmax(0,1fr)_2rem] items-center gap-4">
              <span className="font-manrope text-white/70 text-[12px] leading-[16px] tracking-[0.06em]">{option}</span>
              <span className="poll-track relative h-[7px] border border-white/15" aria-hidden="true" />
              <span className="font-manrope text-white/40 text-[13px] leading-[16px] text-right">—</span>
            </li>
          ))}
        </ul>
        <p className="font-manrope text-white/40 text-[11px] leading-[16px] mt-8 max-w-[420px]">
          Voting controls arrive in a later milestone. Tracks stay empty until you vote locally; there is no shared state behind them.
        </p>
      </Frame>
    </SectionShell>
  );
}
