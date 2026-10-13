import { KeyboardEvent, useEffect, useRef } from 'react';
import { ArrowRight, Check, Copy, Loader2, Wallet } from 'lucide-react';
import { truncateAddress } from '../../lib/format/eth';
import type { WalletOption } from './walletView';
import { useCopyToClipboard } from './useCopyToClipboard';

const MICRO = 'font-manrope text-[13px] leading-[15.6px]';

/** Truncated address that copies the full checksummed address on click. */
export function CopyAddressButton({ address, className = '' }: { address: `0x${string}`; className?: string }) {
  const [state, copy] = useCopyToClipboard();
  const label = state === 'copied' ? 'COPIED' : state === 'failed' ? 'COPY FAILED' : truncateAddress(address);

  return (
    <button
      type="button"
      className={`group inline-flex items-center gap-[6px] ${MICRO} text-white hover:text-ice transition-colors ${className}`}
      onClick={() => copy(address)}
      aria-label={`Copy wallet address ${address}`}
      title={address}
    >
      <span className="tabular-nums" aria-live="polite">
        {label}
      </span>
      {state === 'copied' ? (
        <Check className="w-[12px] h-[12px] text-ice" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Copy className="w-[12px] h-[12px] opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * Primary call to action: solid ice-blue, dark text. Always rendered while not connected, even when
 * no wallet is detected (the click then explains why instead of failing silently).
 */
export function ConnectButton({
  onClick,
  expanded,
  controls,
  hasPopup,
  loading = false,
  block = false,
  tall = false,
  label = 'CONNECT WALLET',
}: {
  onClick: () => void;
  expanded?: boolean;
  controls?: string;
  hasPopup?: 'dialog';
  loading?: boolean;
  block?: boolean;
  /** 44px touch-target height (stacked layouts). */
  tall?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`wallet-cta group ${tall || block ? 'wallet-cta--tall' : ''} ${block ? 'w-full justify-center' : ''}`}
      onClick={onClick}
      disabled={loading}
      aria-busy={loading || undefined}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-haspopup={hasPopup}
    >
      {loading ? (
        <Loader2 className="w-[14px] h-[14px] animate-spin" strokeWidth={2} aria-hidden="true" />
      ) : (
        <Wallet className="w-[14px] h-[14px]" strokeWidth={2} aria-hidden="true" />
      )}
      <span>{loading ? 'CHECK YOUR WALLET' : label}</span>
      {!loading && <ArrowRight className="wallet-cta__arrow w-[13px] h-[13px]" strokeWidth={2} aria-hidden="true" />}
    </button>
  );
}

/** Inline list of discovered wallets (EIP-6963). Keyboard: arrows move, Escape closes. */
export function WalletOptionsList({
  id,
  options,
  onSelect,
  onDismiss,
  className = '',
}: {
  id: string;
  options: WalletOption[];
  onSelect: (optionId: string) => void;
  onDismiss: () => void;
  className?: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.stopPropagation();
      onDismiss();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      buttons[(index + step + buttons.length) % buttons.length]?.focus();
    }
  };

  return (
    <ul id={id} ref={listRef} className={`flex flex-col ${className}`} aria-label="Choose a wallet" onKeyDown={onKeyDown}>
      {options.map((option) => (
        <li key={option.id}>
          <button
            type="button"
            className={`w-full flex items-center gap-[10px] px-[12px] py-[10px] text-left ${MICRO} text-white hover:text-ice hover:bg-white/[0.04] transition-colors`}
            onClick={() => onSelect(option.id)}
          >
            {option.icon ? (
              <img src={option.icon} alt="" width={16} height={16} className="w-[16px] h-[16px]" />
            ) : (
              <span className="w-[16px] h-[16px] border border-white/30" aria-hidden="true" />
            )}
            {option.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
