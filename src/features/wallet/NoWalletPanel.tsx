import { forwardRef } from 'react';
import { ArrowUpRight, RotateCw, X } from 'lucide-react';
import type { DetectionStatus } from './detection';

export const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download';

const ACTION = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] tracking-[0.04em] transition-colors';

interface NoWalletPanelProps {
  id: string;
  titleId: string;
  detection: DetectionStatus;
  onRetry: () => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Shown when CONNECT WALLET is pressed and no EIP-1193 provider is visible to the page.
 * A browser cannot tell "not installed" from "installed but disabled", so both are explained.
 */
export const NoWalletPanel = forwardRef<HTMLDivElement, NoWalletPanelProps>(function NoWalletPanel(
  { id, titleId, detection, onRetry, onClose, className = '' },
  ref,
) {
  const searching = detection === 'searching';
  return (
    <div id={id} ref={ref} role="dialog" aria-labelledby={titleId} tabIndex={-1} className={`no-wallet-panel relative font-manrope outline-none ${className}`}>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close wallet help" className="absolute top-[10px] right-[10px] w-[28px] h-[28px] flex items-center justify-center text-white/60 hover:text-white">
          <X className="w-[14px] h-[14px]" strokeWidth={1.5} aria-hidden="true" />
        </button>
      )}
      <h3 id={titleId} className="pr-8 text-white text-[15px] leading-[21px]">
        No compatible wallet is visible to this page.
      </h3>
      <p className="mt-2 text-white/60 text-[13px] leading-[19px]">
        Install a browser wallet such as MetaMask, or if you already have one, enable the extension in your browser&rsquo;s extension
        settings and allow it on this site. Browsers can&rsquo;t tell a disabled extension from a missing one.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={searching ? undefined : onRetry}
          aria-disabled={searching}
          className={`${ACTION} text-ice hover:text-white aria-disabled:opacity-60 aria-disabled:cursor-progress`}
        >
          <RotateCw className={searching ? 'w-[13px] h-[13px] animate-spin' : 'w-[13px] h-[13px]'} strokeWidth={1.5} aria-hidden="true" />
          {searching ? 'SEARCHING…' : 'RETRY DETECTION'}
        </button>
        <a href={METAMASK_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" className={`${ACTION} text-ice hover:text-white`}>
          GET METAMASK
          <ArrowUpRight className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">(opens metamask.io in a new tab)</span>
        </a>
      </div>

      <p className="mt-4 pt-3 border-t border-white/10 text-white/50 text-[12px] leading-[17px]" role="status">
        {detection === 'done'
          ? 'Still nothing. Extensions enabled after this page loaded usually need a refresh.'
          : 'Just enabled an extension? Retry detection, or refresh if it still does not appear.'}
      </p>
      {detection === 'done' && (
        <button type="button" onClick={() => window.location.reload()} className={`${ACTION} mt-3 text-white/80 hover:text-white`}>
          RELOAD PAGE
        </button>
      )}
    </div>
  );
});
