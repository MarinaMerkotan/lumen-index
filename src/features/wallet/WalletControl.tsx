import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LogOut, Wallet } from 'lucide-react';
import { WALLET_ERROR_MESSAGE } from '../../lib/web3/errors';
import { useWalletState } from './useWalletState';
import { ConnectButton, CopyAddressButton, WalletOptionsList } from './WalletParts';
import { NoWalletPanel } from './NoWalletPanel';

interface WalletControlProps {
  variant?: 'header' | 'stacked';
  /** Stretch the primary CTA to the container width (mobile menu). */
  block?: boolean;
  className?: string;
}

const MICRO = 'font-manrope text-[13px] leading-[15.6px]';
const SHORT_ERROR = { rejected: 'REJECTED', pending: 'OPEN IN WALLET', 'no-provider': 'NO WALLET', 'unsupported-chain': 'SWITCH FAILED', unknown: 'FAILED' } as const;

export const DISCONNECT_NOTE =
  'Disconnect clears this page’s connection and asks your wallet to drop the site permission where it supports that. Some wallets keep access; check its connected-sites settings.';


type Panel = 'none' | 'picker' | 'help';

/**
 * Wallet status + primary action for the header (compact, popover) and stacked layouts (inline).
 * CONNECT WALLET stays visible whenever no account is connected. An address is shown only after
 * the wallet provider reports one.
 */
export function WalletControl({ variant = 'header', block = false, className = '' }: WalletControlProps) {
  const { view, options, error, isSwitching, detection, retryDetection, connect, disconnect, switchToMainnet } = useWalletState();
  const [panel, setPanel] = useState<Panel>('none');
  const panelId = useId();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const stacked = variant === 'stacked';
  const connected = view.status === 'connected';

  // Close once connected; if rediscovery finds wallets, offer them (never auto-connect).
  useEffect(() => {
    if (connected || view.status === 'connecting') setPanel('none');
    else if (panel === 'help' && options.length > 0) setPanel('picker');
  }, [connected, view.status, panel, options.length]);

  useEffect(() => {
    if (panel === 'help') helpRef.current?.focus();
  }, [panel]);

  useEffect(() => {
    if (panel === 'none' || stacked) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setPanel('none');
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [panel, stacked]);

  const closePanel = useCallback(() => {
    setPanel('none');
    triggerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }, []);

  // Escape closes the panel wherever focus is (it can fall back to <body> after a click).
  // Handled on `document` before the mobile menu's window listener, so only the panel closes.
  useEffect(() => {
    if (panel === 'none') return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      closePanel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [panel, closePanel]);

  const startConnect = () => {
    if (panel !== 'none') setPanel('none');
    else if (options.length === 0) setPanel('help');
    else if (options.length > 1) setPanel('picker');
    else connect();
  };

  const status = (text: string, tone = 'text-white/50') => (
    <span className={`font-manrope text-[12px] leading-[15px] tracking-[0.04em] whitespace-nowrap ${tone}`}>{text}</span>
  );
  const errorNote =
    error && stacked ? (
      <p className="font-manrope text-[#ffb4a8] text-[12px] leading-[17px] max-w-[340px]">{WALLET_ERROR_MESSAGE[error.kind]}</p>
    ) : error ? (
      <span className="font-manrope text-[#ffb4a8] text-[11px] leading-[14px] tracking-[0.04em]" title={WALLET_ERROR_MESSAGE[error.kind]}>
        {SHORT_ERROR[error.kind]}
      </span>
    ) : null;

  const panelBody =
    panel === 'help' ? (
      <NoWalletPanel ref={helpRef} id={panelId} titleId={titleId} detection={detection} onRetry={retryDetection} onClose={closePanel} />
    ) : panel === 'picker' ? (
      <WalletOptionsList id={panelId} options={options} onSelect={connect} onDismiss={closePanel} />
    ) : null;

  const panelFrame = panelBody && (
    <div
      className={
        stacked
          ? 'wallet-popover w-full border border-white/15 bg-black/60 ' + (panel === 'help' ? 'p-5' : 'py-[4px]')
          : 'wallet-popover absolute right-0 top-[calc(100%+14px)] z-10 w-[min(340px,calc(100vw-40px))] bg-black/95 border border-white/15 ' +
            (panel === 'help' ? 'p-5' : 'py-[4px]')
      }
    >
      {panelBody}
    </div>
  );

  let body;
  if (connected) {
    body = (
      <>
        <span className="flex items-center gap-[10px] flex-wrap">
          <Wallet className="w-[15px] h-[15px] text-white/70 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <CopyAddressButton address={view.address} />
          <span className={`${MICRO} whitespace-nowrap ${view.onMainnet ? 'text-ice' : 'text-[#ffb4a8]'}`}>
            [ {view.onMainnet && !stacked ? 'MAINNET' : view.networkName.toUpperCase()} ]
          </span>
        </span>
        {!view.onMainnet && (
          <button
            type="button"
            className={`${MICRO} text-ice hover:underline underline-offset-4 whitespace-nowrap disabled:opacity-50`}
            onClick={switchToMainnet}
            disabled={isSwitching}
            aria-label="Switch wallet network to Ethereum Mainnet"
          >
            {isSwitching ? 'CONFIRM IN WALLET' : stacked ? 'SWITCH TO ETHEREUM MAINNET' : 'SWITCH'}
          </button>
        )}
        {errorNote}
        <button
          type="button"
          className={`${MICRO} inline-flex items-center gap-[6px] text-white/60 hover:text-white transition-colors whitespace-nowrap`}
          onClick={disconnect}
          aria-label={stacked ? undefined : 'Disconnect wallet'}
          title={stacked ? undefined : DISCONNECT_NOTE}
        >
          <LogOut className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" />
          {stacked && 'DISCONNECT'}
        </button>
        {stacked && <p className="font-manrope text-white/45 text-[12px] leading-[17px] max-w-[340px]">{DISCONNECT_NOTE}</p>}
      </>
    );
  } else {
    const label =
      view.status === 'unavailable' ? '[ NO WALLET DETECTED ]' : view.status === 'connecting' ? '[ AWAITING WALLET ]' : '[ NOT CONNECTED ]';
    body = (
      <>
        {status(label)}
        <div ref={triggerRef} className={block ? 'w-full' : ''}>
          <ConnectButton
            onClick={startConnect}
            loading={view.status === 'connecting'}
            block={block}
            tall={stacked}
            expanded={options.length === 1 ? undefined : panel !== 'none'}
            controls={panel !== 'none' ? panelId : undefined}
            hasPopup={options.length === 0 ? 'dialog' : undefined}
          />
        </div>
        {errorNote}
        {panelFrame}
      </>
    );
  }

  return (
    <div
      ref={rootRef}
      className={`wallet-control relative flex ${stacked ? 'flex-col items-start gap-[12px]' : 'items-center gap-[14px]'} ${className}`}
      data-wallet={view.status}
    >
      {body}
    </div>
  );
}
