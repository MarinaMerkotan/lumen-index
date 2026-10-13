import { DATA_STATE_MEANING, DataState } from '../../lib/status';
import { MAINNET_RPC_URL } from '../../lib/web3/config';
import { rpcHost } from '../../lib/web3/rpc';
import { StatusTag } from '../ui/StatusTag';

const LEGEND: DataState[] = ['live', 'stale', 'wallet', 'loading', 'error', 'disconnected', 'unavailable', 'demo'];

/** Honest boundaries and third-party data flows (docs/SECURITY.md), plus the status label legend. */
export function SiteFooter() {
  return (
    <footer id="disclosure" tabIndex={-1} className="relative px-5 md:px-[35px] pt-24 md:pt-32 pb-10 outline-none" aria-labelledby="disclosure-title">
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.06]" aria-hidden="true" />
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="font-manrope text-ice/80 text-[13px] leading-[15.6px]">[ BOUNDARIES ]</p>
          <h2 id="disclosure-title" className="font-graphik text-white text-[28px] md:text-[34px] leading-[1.1] mt-6 max-w-[360px]">
            What this site is, and is not.
          </h2>
        </div>

        <div className="lg:col-span-4 font-manrope text-white/60 text-[13px] leading-[21px] space-y-4">
          <p>
            A frontend-only engineering showcase. There is no backend, account system, analytics, cookies or app-side storage, and it is not a bank,
            custodian, exchange or investment service. Nothing here is financial advice.
          </p>
          <p>
            Ethereum Mainnet is read-only here: no transactions, approvals, swaps or message signing, and no wallet request you did not start.
            Seed phrases and private keys are never requested. Liquidity Pools and Governance are local demos, not on-chain activity.
          </p>
          <p>
            Third-party requests: chain data is read from the public RPC at {rpcHost(MAINNET_RPC_URL)}, which sees your IP address and the
            queries made, including your public address once you connect and any address or transaction hash you inspect. Your wallet extension sees this site&rsquo;s requests. The hero video is
            served from an external CDN and fonts from Google Fonts and onlinewebfonts.com.
          </p>
        </div>

        <div className="lg:col-span-4">
          <p className="font-manrope text-white/45 text-[11px] leading-[16px] tracking-[0.06em] mb-4">STATUS LABELS</p>
          <dl className="space-y-3">
            {LEGEND.map((state) => (
              <div key={state} className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3 items-start">
                <dt>
                  <StatusTag state={state} />
                </dt>
                <dd className="font-manrope text-white/50 text-[12px] leading-[18px]">{DATA_STATE_MEANING[state]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-20 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3 justify-between font-manrope text-white/35 text-[11px] leading-[16px] tracking-[0.04em]">
        <span>LŪMEN // ÍNDEX — FRONTEND WEB3 SHOWCASE</span>
        <a href="#top" className="hover:text-ice transition-colors self-start">
          BACK TO TOP ↑
        </a>
      </div>
    </footer>
  );
}
