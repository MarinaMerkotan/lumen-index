import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, RotateCw, Search } from 'lucide-react';
import { Readout, ReadoutRow } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { usePulse } from '../../hooks/usePulse';
import { mainnetAddressUrl, mainnetBlockUrl } from '../../lib/chains/networks';
import { formatBlockNumber, formatEthAmount, formatGas, formatGasGwei } from '../../lib/format/eth';
import { emitPulse } from '../../lib/pulseBus';
import { RPC_ERROR_MESSAGE } from '../../lib/web3/errors';
import { parseTxHashInput } from '../../lib/web3/validate';
import { confirmations, decodeLogs, feePaid } from './txLookup';
import { TxEvents } from './TxEvents';
import { useTransactionLookup } from './useTransactionLookup';

const LINK = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] text-ice hover:text-white transition-colors';
const UNDERLINED = 'tabular-nums break-all text-white hover:text-ice underline decoration-white/20 underline-offset-4';

const STATUS_TAG = {
  success: <StatusTag state="live" label="SUCCESS" />,
  reverted: <StatusTag state="error" label="REVERTED" />,
  pending: <StatusTag state="loading" label="PENDING" />,
} as const;

function AddressLink({ address }: { address: `0x${string}` }) {
  return (
    <a href={mainnetAddressUrl(address)} target="_blank" rel="noopener noreferrer" className={UNDERLINED}>
      {address}
    </a>
  );
}

function RetryButton({ onClick, label = 'RETRY', className = '' }: { onClick: () => void; label?: string; className?: string }) {
  return (
    <button type="button" className={`${LINK} ${className}`} onClick={onClick}>
      <RotateCw className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" /> {label}
    </button>
  );
}

interface TransactionExplorerProps {
  hash: `0x${string}` | null;
  latest: bigint | null;
  onLookup: (hash: `0x${string}`) => void;
}

/** Read-only transaction inspection by hash. Two RPC calls per lookup; nothing is signed or sent. */
export function TransactionExplorer({ hash, latest, onLookup }: TransactionExplorerProps) {
  const [input, setInput] = useState<string>(hash ?? '');
  const [inputError, setInputError] = useState<string | null>(null);
  const inputId = useId();
  const errorId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lookup = useTransactionLookup(hash);
  usePulse(panelRef, 'tx-found', 'pulse-signal', 1600);

  useEffect(() => setInput(hash ?? ''), [hash]);
  useEffect(() => {
    if (lookup.status === 'success' || lookup.status === 'reverted') emitPulse('tx-found');
  }, [lookup.status, hash]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseTxHashInput(input);
    if (!parsed.ok) {
      setInputError(parsed.reason === 'empty' ? 'Paste a transaction hash first.' : 'A transaction hash is 0x followed by exactly 64 hex characters.');
      return;
    }
    setInputError(null);
    onLookup(parsed.hash);
  };

  const { tx, receipt, status } = lookup;
  const events = receipt ? decodeLogs(receipt.logs) : null;
  const confs = confirmations(latest, tx?.blockNumber ?? null);

  let rows: ReadoutRow[] = [];
  if (tx) {
    rows = [
      { label: 'Hash', value: <span className="tabular-nums break-all">{tx.hash}</span> },
      { label: 'From', value: <AddressLink address={tx.from} /> },
      {
        label: 'To',
        value: tx.to ? <AddressLink address={tx.to} /> : receipt?.contractAddress ? <AddressLink address={receipt.contractAddress} /> : 'Contract creation',
        note: tx.to ? undefined : 'Contract creation transaction.',
      },
      { label: 'Value', value: `${formatEthAmount(tx.value)} ETH` },
    ];
    if (receipt) {
      rows.push(
        { label: 'Gas used', value: `${formatGas(receipt.gasUsed)} of ${formatGas(tx.gas)} limit` },
        {
          label: 'Effective gas price',
          value: `${formatGasGwei(receipt.effectiveGasPrice)} gwei`,
          note: `Fee paid: ${formatEthAmount(feePaid(receipt.gasUsed, receipt.effectiveGasPrice), 8)} ETH`,
        },
        {
          label: 'Block',
          value: (
            <a href={mainnetBlockUrl(receipt.blockNumber)} target="_blank" rel="noopener noreferrer" className={UNDERLINED}>
              #{formatBlockNumber(receipt.blockNumber)}
            </a>
          ),
          note: confs !== null ? `${formatBlockNumber(confs)} confirmation${confs === 1n ? '' : 's'}` : undefined,
        },
      );
    } else {
      rows.push({ label: 'Block', value: 'Not mined yet', note: 'Re-checked once per block for about five minutes; use Check again after that.' });
    }
  }

  return (
    <div ref={panelRef} className="tx-panel">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3" noValidate>
        <label htmlFor={inputId} className="sr-only">
          Transaction hash
        </label>
        <input
          id={inputId}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="0x… transaction hash (64 hex characters)"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={inputError ? true : undefined}
          aria-describedby={inputError ? errorId : undefined}
          className="explorer-input flex-1 min-w-0"
        />
        <button type="submit" className="wallet-cta justify-center">
          <Search className="w-[14px] h-[14px]" strokeWidth={2} aria-hidden="true" /> INSPECT
        </button>
      </form>
      {inputError && (
        <p id={errorId} className="mt-2 font-manrope text-[#ffb4a8] text-[12px] leading-[17px]">
          {inputError}
        </p>
      )}

      <div className="mt-5" aria-live="polite">
        {status === 'idle' && (
          <p className="font-manrope text-white/45 text-[13px] leading-[19px]">
            Paste any Ethereum Mainnet transaction hash, or select a block above and inspect its first transaction.
          </p>
        )}
        {status === 'loading' && <StatusTag state="loading" detail="READING TRANSACTION" />}
        {status === 'error' && (
          <p className="font-manrope text-[#ffb4a8] text-[12px] leading-[17px] flex flex-wrap items-center gap-3">
            {lookup.errorKind ? RPC_ERROR_MESSAGE[lookup.errorKind] : 'The lookup failed.'}
            <RetryButton onClick={lookup.retry} />
          </p>
        )}
        {status === 'not-found' && (
          <div className="font-manrope text-[13px] leading-[19px]">
            <StatusTag state="unavailable" label="NOT FOUND" />
            <p className="mt-2 text-white/55">
              This RPC has no record of the transaction on Ethereum Mainnet. It may belong to another network, have been dropped, or not
              have propagated yet.
            </p>
            <RetryButton onClick={lookup.retry} label="CHECK AGAIN" className="mt-2" />
          </div>
        )}
        {tx && (status === 'pending' || status === 'success' || status === 'reverted') && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              {STATUS_TAG[status]}
              <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className={LINK}>
                ETHERSCAN <ArrowUpRight className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
            <Readout rows={rows} />
            {status === 'pending' && <RetryButton onClick={lookup.retry} label="CHECK AGAIN" className="mt-3" />}
            {events && receipt && (
              <div className="mt-5">
                <p className="mb-2 font-manrope text-white/45 text-[11px] leading-[14px] tracking-[0.06em]">EVENTS ({receipt.logs.length})</p>
                <TxEvents items={events.items} hidden={events.hidden} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
