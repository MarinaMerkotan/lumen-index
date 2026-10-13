import { ArrowUpRight, Search, X } from 'lucide-react';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { mainnetAddressUrl, mainnetBlockUrl } from '../../lib/chains/networks';
import { formatBlockNumber, formatGas, formatGasGwei, truncateAddress } from '../../lib/format/eth';
import { blockFullnessPermille } from './telemetryState';
import { useBlockSummary } from './useBlockExplorer';

const LINK = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] text-ice hover:text-white transition-colors';

interface BlockDetailProps {
  number: bigint;
  onClose: () => void;
  onInspectTx: (hash: `0x${string}`) => void;
}

/** Selected block. Served from the per-block cache when it is one of the recent blocks. */
export function BlockDetail({ number, onClose, onInspectTx }: BlockDetailProps) {
  const query = useBlockSummary(number);
  const block = query.data;
  const time = block ? new Date(block.timestampMs) : null;

  return (
    <section className="block-detail mt-5 border border-white/15 bg-black/40 p-5" aria-label={`Block ${formatBlockNumber(number)} details`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-manrope text-white/45 text-[11px] leading-[14px] tracking-[0.06em]">SELECTED BLOCK</p>
          <p className="font-display text-white text-[22px] leading-[28px] tabular-nums">#{formatBlockNumber(number)}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close block details" className="w-[28px] h-[28px] flex items-center justify-center text-white/60 hover:text-white">
          <X className="w-[14px] h-[14px]" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {query.status === 'pending' && <StatusTag state="loading" detail="READING BLOCK" />}
      {query.status === 'error' && (
        <p className="font-manrope text-[#ffb4a8] text-[12px] leading-[17px]">
          The block could not be read.{' '}
          <button type="button" className="text-ice underline underline-offset-4" onClick={() => void query.refetch()}>
            Retry
          </button>
        </p>
      )}

      {block && time && (
        <>
          <Readout
            rows={[
              { label: 'Hash', value: <span className="tabular-nums break-all">{block.hash}</span> },
              {
                label: 'Timestamp',
                value: time.toLocaleString([], { dateStyle: 'medium', timeStyle: 'medium', hour12: false }),
                note: `${time.toISOString().replace('.000Z', 'Z')} (UTC)`,
              },
              { label: 'Transactions', value: block.txCount },
              {
                label: 'Gas used / limit',
                value: `${formatGas(block.gasUsed)} / ${formatGas(block.gasLimit)}`,
                note: `${(blockFullnessPermille(block.gasUsed, block.gasLimit) / 10).toFixed(1)}% of the gas limit`,
              },
              { label: 'Base fee', value: block.baseFeePerGas !== null ? `${formatGasGwei(block.baseFeePerGas)} gwei` : 'Not reported' },
              {
                label: 'Fee recipient',
                value: (
                  <a href={mainnetAddressUrl(block.feeRecipient)} target="_blank" rel="noopener noreferrer" className={LINK} title={block.feeRecipient}>
                    {truncateAddress(block.feeRecipient)} <ArrowUpRight className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" />
                    <span className="sr-only">(opens Etherscan in a new tab)</span>
                  </a>
                ),
              },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            <a href={mainnetBlockUrl(block.number)} target="_blank" rel="noopener noreferrer" className={LINK}>
              VIEW ON ETHERSCAN <ArrowUpRight className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {block.firstTxHash && (
              <button type="button" className={LINK} onClick={() => onInspectTx(block.firstTxHash!)}>
                <Search className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" /> INSPECT ITS FIRST TRANSACTION
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
