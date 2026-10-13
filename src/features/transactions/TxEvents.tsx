import { ArrowUpRight } from 'lucide-react';
import { mainnetAddressUrl } from '../../lib/chains/networks';
import { formatTokenAmount, groupDigits, truncateAddress } from '../../lib/format/eth';
import { DecodedLog } from './txLookup';

const ADDR = 'tabular-nums text-white hover:text-ice underline decoration-white/20 underline-offset-4';

function Addr({ address }: { address: `0x${string}` }) {
  return (
    <a href={mainnetAddressUrl(address)} target="_blank" rel="noopener noreferrer" className={ADDR} title={address}>
      {truncateAddress(address)}
    </a>
  );
}

/** Event list: ERC-20 Transfer/Approval decoded with the verified ABI; everything else as raw metadata. */
export function TxEvents({ items, hidden }: { items: DecodedLog[]; hidden: number }) {
  if (items.length === 0) return <p className="font-manrope text-white/45 text-[12px] leading-[17px]">No events emitted.</p>;
  return (
    <>
      <ol className="space-y-[6px]">
        {items.map((log) => (
          <li key={log.index} className="tx-event grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 py-[8px] border-t border-white/[0.06] font-manrope text-[12px] leading-[17px]">
            <span className="text-white/35 tabular-nums">#{log.index}</span>
            {log.kind === 'raw' ? (
              <span className="text-white/60 min-w-0">
                <span className="text-white/80">Unknown event</span> from <Addr address={log.contract} />
                <span className="block text-white/40 break-all">
                  topic0 {log.topic0 ?? '—'} · {log.topicCount} topics · {log.dataBytes} data bytes
                </span>
              </span>
            ) : (
              <span className="text-white/70 min-w-0">
                <span className="text-ice">{log.kind === 'erc20-transfer' ? 'ERC-20 Transfer' : 'ERC-20 Approval'}</span>{' '}
                <span className="text-white tabular-nums">
                  {log.token ? `${formatTokenAmount(log.amount, log.token.decimals)} ${log.token.symbol}` : `${groupDigits(log.amount.toString())} base units`}
                </span>
                <span className="block text-white/50">
                  {log.kind === 'erc20-transfer' ? 'from' : 'owner'} <Addr address={log.from} /> {log.kind === 'erc20-transfer' ? 'to' : 'spender'}{' '}
                  <Addr address={log.to} /> · token <Addr address={log.contract} />
                  {!log.token && ' (not on the verified allowlist; decimals unknown)'}
                </span>
              </span>
            )}
          </li>
        ))}
      </ol>
      {hidden > 0 && (
        <p className="mt-2 font-manrope text-white/45 text-[12px] leading-[17px]">
          {hidden} more events not shown. <ArrowUpRight className="inline w-[12px] h-[12px]" aria-hidden="true" /> See the full list on Etherscan.
        </p>
      )}
    </>
  );
}
