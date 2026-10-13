import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { StatusTag } from '../../components/ui/StatusTag';
import { SignatureLab } from '../signature-lab/SignatureLab';
import { LocalPoll } from './LocalPoll';

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
            Cast, change or reset a vote on one illustrative proposal. The result shows your own selection in this tab only: nothing is signed,
            submitted or stored, and a reload clears it.
          </p>
          <p>Results are never presented as community participation.</p>
        </>
      }
      tags={
        <>
          <StatusTag state="demo" detail="NOT ON-CHAIN" />
          <span className="inline-flex items-center border border-white/15 rounded-[2px] px-[6px] py-[2px] font-manrope text-[11px] leading-[14px] tracking-[0.04em] text-white/60">
            RESETS ON RELOAD
          </span>
        </>
      }
      wide={
        <Frame className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">EXPERIMENT · MESSAGE SIGNATURE LAB</p>
            <StatusTag state="demo" label="EXPERIMENTAL" detail="OPT-IN" />
          </div>
          <SignatureLab />
        </Frame>
      }
    >
      <Frame className="p-6 md:p-8">
        <LocalPoll />
      </Frame>
    </SectionShell>
  );
}
