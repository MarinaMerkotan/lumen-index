import { useId, useRef } from 'react';
import { PenLine, RotateCcw } from 'lucide-react';
import { StatusTag } from '../../components/ui/StatusTag';
import { usePulse } from '../../hooks/usePulse';
import { WalletControl } from '../wallet/WalletControl';
import { SignatureValue } from './SignatureValue';
import { useSignatureLab } from './useSignatureLab';

const ACTION = 'inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] transition-colors';
const NOTE = 'font-manrope text-[13px] leading-[19px]';

/** Experimental, consent-driven message signing with local verification. Not authentication. */
export function SignatureLab() {
  const lab = useSignatureLab();
  const consentId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  usePulse(panelRef, 'signature-verified', 'pulse-signal', 1600);
  const { state } = lab;
  const busy = state.phase === 'awaiting';
  const done = state.phase !== 'idle' && state.phase !== 'awaiting';

  return (
    <div ref={panelRef} className="tx-panel grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-5 font-manrope text-white/60 text-[13px] leading-[20px] space-y-3">
        <p>
          A signature proves that whoever holds an address&rsquo;s private key approved an exact piece of text, without sending a
          transaction or revealing the key.
        </p>
        <p>
          Here your wallet signs a readable message (EIP-191 <span className="text-white/80">personal_sign</span>) and this page recovers the
          signer from the signature locally with viem. Nothing is sent to a server or stored, and it is not a login.
        </p>
        <p className="text-white/45 text-[12px] leading-[17px]">
          Typed-data signatures, permits and transactions are never requested. Verification covers ordinary accounts (EOAs); smart-contract
          wallets would need an on-chain check that this lab does not perform.
        </p>
      </div>

      <div className="lg:col-span-7" aria-live="polite">
        {!lab.connected || !lab.message ? (
          <>
            <p className={`${NOTE} text-white/55 mb-4`}>Connect a wallet to try the lab. Connecting alone requests no signature.</p>
            <WalletControl variant="stacked" />
          </>
        ) : (
          <>
            <p className="mb-2 font-manrope text-white/50 text-[11px] leading-[16px] tracking-[0.06em]">MESSAGE YOUR WALLET WILL SHOW</p>
            <pre className="lab-message">{lab.message}</pre>

            {!done && (
              <>
                <label htmlFor={consentId} className="mt-4 flex items-start gap-3 cursor-pointer font-manrope text-white/75 text-[13px] leading-[19px]">
                  <input
                    id={consentId}
                    type="checkbox"
                    checked={lab.consent}
                    onChange={(event) => lab.setConsent(event.target.checked)}
                    disabled={busy}
                    className="lab-consent mt-[3px]"
                  />
                  I have read this message, I understand it authorizes nothing, and I want my wallet to sign it.
                </label>
                <button type="button" className="wallet-cta mt-4" onClick={() => void lab.sign()} disabled={!lab.consent || busy} aria-busy={busy || undefined}>
                  <PenLine className="w-[14px] h-[14px]" strokeWidth={2} aria-hidden="true" />
                  {busy ? 'CONFIRM IN YOUR WALLET' : 'SIGN MESSAGE'}
                </button>
              </>
            )}

            {state.phase === 'verified' && (
              <div className="lab-result mt-5 space-y-2" data-tone="ok">
                <StatusTag state="live" label="VERIFIED LOCALLY" />
                <p className={`${NOTE} text-white/70`}>
                  The recovered signer <span className="tabular-nums text-white break-all">{state.recovered}</span> matches your connected address.
                  Verified in this browser with viem; nothing was sent.
                </p>
                <SignatureValue signature={state.signature} />
              </div>
            )}
            {state.phase === 'mismatch' && (
              <div className="lab-result mt-5 space-y-2" data-tone="warn">
                <StatusTag state="stale" label="NOT VERIFIABLE LOCALLY" />
                <p className={`${NOTE} text-white/70`}>
                  {state.recovered
                    ? `The signature recovers to ${state.recovered}, not your connected address.`
                    : 'The signature is not an ordinary account (EOA) signature.'}{' '}
                  Smart-contract wallets sign differently (ERC-1271) and need an on-chain check, which this lab intentionally does not perform.
                </p>
              </div>
            )}
            {state.phase === 'rejected' && (
              <p className={`mt-5 ${NOTE} text-white/70`}>
                <StatusTag state="unavailable" label="REJECTED" className="mr-2" />
                You declined the request. Nothing was signed.
              </p>
            )}
            {state.phase === 'unsupported' && (
              <p className={`mt-5 ${NOTE} text-white/70`}>
                <StatusTag state="unavailable" label="UNSUPPORTED" className="mr-2" />
                This wallet does not support personal_sign message signing.
              </p>
            )}
            {state.phase === 'error' && (
              <p className={`mt-5 ${NOTE} text-[#ffb4a8]`}>
                <StatusTag state="error" className="mr-2" />
                The wallet returned an unexpected error. Clear the result and try again.
              </p>
            )}

            {done && (
              <button type="button" className={`${ACTION} mt-5 text-ice hover:text-white`} onClick={lab.clear}>
                <RotateCcw className="w-[13px] h-[13px]" strokeWidth={1.5} aria-hidden="true" /> CLEAR RESULT &amp; NEW CHALLENGE
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
