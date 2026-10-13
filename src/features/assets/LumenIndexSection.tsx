import { ReactNode, useRef } from 'react';
import { ArrowUpRight, Copy, LogOut, RotateCw } from 'lucide-react';
import { SectionShell } from '../../components/sections/SectionShell';
import { Frame } from '../../components/ui/Frame';
import { Readout, ReadoutRow } from '../../components/ui/Readout';
import { StatusTag } from '../../components/ui/StatusTag';
import { usePulse } from '../../hooks/usePulse';
import { mainnetAddressUrl } from '../../lib/chains/networks';
import { formatClockTime, formatEthAmount } from '../../lib/format/eth';
import { MAINNET_RPC_URL } from '../../lib/web3/config';
import { RPC_ERROR_MESSAGE, WALLET_ERROR_MESSAGE } from '../../lib/web3/errors';
import { rpcHost } from '../../lib/web3/rpc';
import { DISCONNECT_NOTE, WalletControl } from '../wallet/WalletControl';
import { useCopyToClipboard } from '../wallet/useCopyToClipboard';
import { useWalletState } from '../wallet/useWalletState';
import type { WalletView } from '../wallet/walletView';
import { MainnetBalance, useMainnetBalance } from './useMainnetBalance';

const DASH = '—';
const ACTION = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[15.6px] transition-colors';

function SectionTags({ view, balance }: { view: WalletView; balance: MainnetBalance }) {
  switch (view.status) {
    case 'unavailable':
      return <StatusTag state="unavailable" detail="NO WALLET DETECTED" />;
    case 'connecting':
      return <StatusTag state="loading" detail="AWAITING WALLET" />;
    case 'connected':
      return (
        <>
          <StatusTag state="wallet" detail={view.networkName.toUpperCase()} />
          {balance.state === 'live' && <StatusTag state="live" detail="MAINNET BALANCE" />}
          {balance.state === 'error' && <StatusTag state="error" detail="BALANCE" />}
        </>
      );
    default:
      return <StatusTag state="disconnected" />;
  }
}

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

function BalanceValue({ balance }: { balance: MainnetBalance }) {
  if (balance.state === 'live' && balance.wei !== null) {
    return (
      <span className="font-graphik text-[22px] leading-[26px] tabular-nums text-white">
        {formatEthAmount(balance.wei)} <span className="text-white/60 text-[15px]">ETH</span>
      </span>
    );
  }
  if (balance.state === 'error') {
    return (
      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span>{DASH}</span>
        <button
          type="button"
          className={`${ACTION} text-ice hover:underline underline-offset-4 disabled:opacity-50`}
          onClick={balance.retry}
          disabled={balance.isFetching}
        >
          <RotateCw className={balance.isFetching ? 'w-[12px] h-[12px] animate-spin' : 'w-[12px] h-[12px]'} strokeWidth={1.5} aria-hidden="true" />
          RETRY
        </button>
      </span>
    );
  }
  return <StatusTag state="loading" detail="READING MAINNET" />;
}

function balanceNote(balance: MainnetBalance): string {
  if (balance.state === 'live' && balance.updatedAt) {
    return `Native ETH on Ethereum Mainnet, read via ${rpcHost(MAINNET_RPC_URL)} at ${formatClockTime(balance.updatedAt)}. No USD value is shown.`;
  }
  if (balance.state === 'error' && balance.errorKind) return RPC_ERROR_MESSAGE[balance.errorKind];
  return 'Native ETH on Ethereum Mainnet, read via the public RPC.';
}

function connectedRows(address: `0x${string}`, network: ReactNode, balance: MainnetBalance): ReadoutRow[] {
  return [
    { label: 'Address', value: <AddressValue address={address} />, note: 'Shared by your wallet. Public, but linkable to you.' },
    { label: 'Network', value: network },
    { label: 'ETH balance', value: <BalanceValue balance={balance} />, note: balanceNote(balance) },
  ];
}

export function LumenIndexSection() {
  const { view, error, isSwitching, switchToMainnet, disconnect } = useWalletState();
  const balance = useMainnetBalance(view.status === 'connected' ? view.address : undefined);
  const pulseRef = useRef<HTMLDivElement>(null);
  usePulse(pulseRef, 'wallet-connected', 'pulse-wallet', 1800);

  let panel: ReactNode;
  if (view.status === 'connected') {
    const network = (
      <span className="flex flex-col items-start gap-[8px]">
        <span className={view.onMainnet ? 'text-white' : 'text-[#ffb4a8]'}>
          {view.networkName}
          {!view.onMainnet && <span className="text-white/45"> {'·'} not supported</span>}
        </span>
        {!view.onMainnet && (
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
              The balance below is read from Ethereum Mainnet, not from {view.networkName}.
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">CONNECTED WALLET</p>
          <StatusTag state="wallet" />
        </div>
        <Readout rows={connectedRows(view.address, network, balance)} />
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
        <div className="pb-6 mb-2 border-b border-white/[0.08]">
          <WalletControl variant="stacked" />
        </div>
        <Readout
          rows={[
            { label: 'Address', value: view.status === 'connecting' ? 'Waiting for your wallet…' : 'Not connected' },
            { label: 'Network', value: DASH, note: 'Reported by your wallet after you connect.' },
            { label: 'ETH balance', value: DASH, note: 'Read from Ethereum Mainnet for the connected address.' },
          ]}
        />
      </>
    );
  }

  return (
    <SectionShell
      id="lumen-index"
      number="03"
      label="LUMEN_INDEX"
      seed={37}
      title="Your public address, read on your terms."
      intro={
        <>
          <p>
            Connect an injected wallet such as MetaMask and this index reads the address it shares, the network it is on, and its native ETH
            balance on Ethereum Mainnet. Nothing is requested until you click connect.
          </p>
          <p>No signatures, no transactions, no USD valuations, and nothing about your wallet is stored by this site.</p>
        </>
      }
      tags={<SectionTags view={view} balance={balance} />}
    >
      <div ref={pulseRef} className="wallet-panel" data-wallet={view.status}>
        <Frame className="p-6 md:p-8">{panel}</Frame>
      </div>
    </SectionShell>
  );
}
