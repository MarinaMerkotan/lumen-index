import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { StatusTag } from '../../components/ui/StatusTag';
import { AmmSimulator } from './AmmSimulator';

export function LiquiditySection() {
  return (
    <SectionShell
      id="liquidity-pools"
      number="02"
      label="LIQUIDITY_POOLS"
      seed={23}
      title="A constant-product pool, simulated locally."
      intro={
        <>
          <p>
            Change the reserves of two illustrative tokens, the trade size and the fee, and watch the x · y = k model price the swap: output,
            spot price before and after, and how far the trade moves the pool.
          </p>
          <p>Everything is computed in your browser. It does not connect to any protocol, moves no funds, and makes no yield claims.</p>
        </>
      }
      tags={
        <>
          <StatusTag state="demo" detail="NO FUNDS" />
          <span className="inline-flex items-center border border-white/15 rounded-[2px] px-[6px] py-[2px] font-manrope text-[11px] leading-[14px] tracking-[0.04em] text-white/60">
            LOCAL ONLY
          </span>
        </>
      }
    >
      <Frame className="p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">SIMULATION — TOKEN_A / TOKEN_B (ILLUSTRATIVE)</p>
          <StatusTag state="demo" detail="NO FUNDS" />
        </div>
        <AmmSimulator />
      </Frame>
    </SectionShell>
  );
}
