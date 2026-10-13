import { useId } from 'react';
import { Wallet } from 'lucide-react';
import { useWalletState } from './useWalletState';

interface WalletControlProps {
  variant?: 'header' | 'stacked';
  className?: string;
}

const NOTE = 'Wallet connection arrives in the next build. Nothing is requested from your wallet on this page.';

/** Honest disconnected wallet control. Never shows an address until a provider confirms one (M2). */
export function WalletControl({ variant = 'header', className = '' }: WalletControlProps) {
  const { state, connect } = useWalletState();
  const noteId = useId();
  const disabled = !state.canConnect;

  const button = (
    <button
      type="button"
      className="wallet-button group inline-flex items-center gap-[8px] font-manrope text-[13px] leading-[15.6px] text-white aria-disabled:cursor-not-allowed"
      aria-disabled={disabled}
      aria-describedby={noteId}
      onClick={disabled ? undefined : connect}
    >
      <span className="wallet-button__label">CONNECT WALLET</span>
      <span className="font-manrope bg-ice rounded-[3px] px-[5px] py-[2px] text-black text-[11px] leading-[14px] tracking-[0.03em]">
        COMING NEXT
      </span>
    </button>
  );

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-[12px] ${className}`}>
        <Wallet className="w-[15px] h-[15px] text-white/70" strokeWidth={1.5} aria-hidden="true" />
        <span className="font-manrope text-white/60 text-[13px] leading-[15.6px] whitespace-nowrap">[ NOT CONNECTED ]</span>
        <span className="ml-[8px]">{button}</span>
        <span id={noteId} className="sr-only">
          {NOTE}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-[10px] ${className}`}>
      <div className="flex items-center gap-[10px]">
        <Wallet className="w-[15px] h-[15px] text-white/70" strokeWidth={1.5} aria-hidden="true" />
        <span className="font-manrope text-white/60 text-[13px] leading-[15.6px]">[ NOT CONNECTED ]</span>
      </div>
      {button}
      <p id={noteId} className="font-manrope text-white/40 text-[11px] leading-[16px] max-w-[300px]">
        {NOTE}
      </p>
    </div>
  );
}
