import { KeyboardEvent, ReactNode, useId, useRef, useState } from 'react';
import { ArrowUpRight, Copy, LogOut } from 'lucide-react';
import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { Readout } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { usePulse } from '../../hooks/usePulse';
import { mainnetAddressUrl } from '../../lib/chains/networks';
import { WALLET_ERROR_MESSAGE } from '../../lib/web3/errors';
import { DISCONNECT_NOTE, WalletControl } from '../wallet/WalletControl';
import { useCopyToClipboard } from '../wallet/useCopyToClipboard';
import { useWalletState } from '../wallet/useWalletState';
import { AssetList } from './AssetList';
import { ExploreAddressForm } from './ExploreAddressForm';

const ACTION = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[15.6px] transition-colors';
const MICRO_LABEL = 'font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]';

type Mode = 'wallet' | 'explore';
const MODES: { id: Mode; label: string }[] = [
  { id: 'wallet', label: 'CONNECTED WALLET' },
  { id: 'explore', label: 'EXPLORE ADDRESS' },
];

function AddressValue({ address }: { address: `0x${string}` }) {
  const [copyState, copy] = useCopyToClipboard();
  return (
    <>
      <span className="block font-manrope text-[13px] leading-[19px] tabular-nums break-all text-white">{address}</span>
      <span className="mt-[8px] flex flex-wrap gap-x-5 gap-y-2">
        <button type="button" className={`${ACTION} text-ice hover:text-white`} onClick={() => copy(address)}>
          <Copy className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" />
          <span aria-live="polite">{copyState === 'copied' ? 'COPIED' : copyState === 'failed' ? 'COPY FAILED' : 'COPY ADDRESS'}</span>
        </button>
        <a href={mainnetAddressUrl(address)} target="_blank" rel="noopener noreferrer" className={`${ACTION} text-ice hover:text-white`}>
          ETHERSCAN
          <ArrowUpRight className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </span>
    </>
  );
}

/** Two explicit modes; the inspected address never takes the place of the connected identity. */
function ModeTabs({ mode, onChange, panelId }: { mode: Mode; onChange: (mode: Mode) => void; panelId: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = mode === 'wallet' ? 'explore' : 'wallet';
    onChange(next);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus();
  };
  return (
    <div ref={listRef} role="tablist" aria-label="Asset source" className="mode-tabs flex border-b border-white/10 mb-6" onKeyDown={onKeyDown}>
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          data-mode={item.id}
          aria-selected={mode === item.id}
          aria-controls={panelId}
          tabIndex={mode === item.id ? 0 : -1}
          onClick={() => onChange(item.id)}
          className="mode-tab font-manrope text-[12px] leading-[16px] tracking-[0.06em] px-[2px] pb-[10px] mr-6"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function LumenIndexSection() {
  const { view, error, isSwitching, switchToMainnet, disconnect } = useWalletState();
  const [mode, setMode] = useState<Mode>('wallet');
  const [explored, setExplored] = useState<`0x${string}` | null>(null);
  const panelId = useId();
  const pulseRef = useRef<HTMLDivElement>(null);
  usePulse(pulseRef, 'wallet-connected', 'pulse-wallet', 1800);

  const connected = view.status === 'connected' ? view : null;
  let panel: ReactNode;

  if (mode === 'explore') {
    panel = (
      <>
        <ExploreAddressForm onInspect={setExplored} />
        {explored && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <p className={MICRO_LABEL}>INSPECTED ADDRESS · NOT YOUR WALLET</p>
              {connected && connected.address === explored && <StatusTag state="wallet" detail="SAME AS CONNECTED" />}
            </div>
            <Readout rows={[{ label: 'Address', value: <AddressValue address={explored} />, note: 'Public data only. No wallet is involved in this view.' }]} />
            <div className="mt-6">
              <AssetList key={explored} address={explored} />
            </div>
          </div>
        )}
      </>
    );
  } else if (connected) {
    const network = (
      <span className="flex flex-col items-start gap-[8px]">
        <span className={connected.onMainnet ? 'text-white' : 'text-[#ffb4a8]'}>
          {connected.networkName}
          {!connected.onMainnet && <span className="text-white/45"> {'·'} not supported</span>}
        </span>
        {!connected.onMainnet && (
          <>
            <button
              type="button"
              className={`${ACTION} text-ice hover:underline underline-offset-4 disabled:opacity-50`}
              onClick={switchToMainnet}
              disabled={isSwitching}
            >
              {isSwitching ? 'CONFIRM THE SWITCH IN YOUR WALLET' : 'SWITCH TO ETHEREUM MAINNET'}
            </button>
            <span className="font-manrope text-white/45 text-[12px] leading-[17px]">
              Assets below are read from Ethereum Mainnet, not from {connected.networkName}.
            </span>
          </>
        )}
        {error?.action === 'switch' && (
          <span className="font-manrope text-[#ffb4a8] text-[12px] leading-[17px]">{WALLET_ERROR_MESSAGE[error.kind]}</span>
        )}
      </span>
    );
    panel = (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <p className={MICRO_LABEL}>CONNECTED WALLET</p>
          <StatusTag state="wallet" />
        </div>
        <Readout
          rows={[
            { label: 'Address', value: <AddressValue address={connected.address} />, note: 'Shared by your wallet. Public, but linkable to you.' },
            { label: 'Wallet network', value: network },
          ]}
        />
        <div className="mt-6">
          <AssetList key={connected.address} address={connected.address} />
        </div>
        <div className="mt-4 pt-5 border-t border-white/[0.08] flex flex-col items-start gap-[8px]">
          <button type="button" className={`${ACTION} text-white/70 hover:text-white`} onClick={disconnect}>
            <LogOut className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" />
            DISCONNECT
          </button>
          <p className="font-manrope text-white/45 text-[12px] leading-[17px] max-w-[420px]">{DISCONNECT_NOTE}</p>
        </div>
      </>
    );
  } else {
    panel = (
      <>
        <WalletControl variant="stacked" />
        <p className="mt-6 pt-5 border-t border-white/[0.08] font-manrope text-white/55 text-[13px] leading-[19px]">
          {view.status === 'connecting' ? 'Waiting for your wallet…' : 'No wallet? Any public address can be inspected without one.'}{' '}
          <button type="button" className="text-ice hover:underline underline-offset-4" onClick={() => setMode('explore')}>
            Explore an address
          </button>
        </p>
      </>
    );
  }

  const tags =
    mode === 'explore' ? (
      <StatusTag state={explored ? 'live' : 'disconnected'} detail={explored ? 'PUBLIC ADDRESS' : undefined} />
    ) : connected ? (
      <StatusTag state="wallet" detail={connected.networkName.toUpperCase()} />
    ) : view.status === 'unavailable' ? (
      <StatusTag state="unavailable" detail="NO WALLET DETECTED" />
    ) : view.status === 'connecting' ? (
      <StatusTag state="loading" detail="AWAITING WALLET" />
    ) : (
      <StatusTag state="disconnected" />
    );

  return (
    <SectionShell
      id="lumen-index"
      number="03"
      label="LUMEN_INDEX"
      seed={37}
      title="Public balances, read on your terms."
      intro={
        <>
          <p>
            Inspect native ETH and verified ERC-20 balances (USDC, DAI, WETH) on Ethereum Mainnet, either for the wallet you connect or for
            any public address you paste. Nothing is requested from a wallet until you click connect.
          </p>
          <p>No signatures, no transactions, no USD valuations, and no addresses stored by this site.</p>
        </>
      }
      tags={tags}
    >
      <div ref={pulseRef} className="wallet-panel" data-wallet={view.status}>
        <Frame className="p-6 md:p-8">
          <ModeTabs mode={mode} onChange={setMode} panelId={panelId} />
          <div id={panelId} role="tabpanel" aria-label={mode === 'wallet' ? 'Connected wallet' : 'Explore address'}>
            {panel}
          </div>
        </Frame>
      </div>
    </SectionShell>
  );
}
