import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSignMessage } from 'wagmi';
import { emitPulse } from '../../lib/pulseBus';
import { useWalletState } from '../wallet/useWalletState';
import { SignErrorKind, buildLabMessage, classifySignError, createChallenge, verifyLocally } from './message';

export type LabPhase =
  | { phase: 'idle' }
  | { phase: 'awaiting' }
  | { phase: 'verified'; signature: `0x${string}`; recovered: `0x${string}` }
  | { phase: 'mismatch'; signature: `0x${string}`; recovered: `0x${string}` | null }
  | { phase: SignErrorKind };

function freshAttempt() {
  return { challenge: createChallenge(), issuedAt: new Date().toISOString() };
}

/**
 * The single intentional signing operation in this app: an EIP-191 `personal_sign` of a readable,
 * benign message, only after explicit consent and a click. Nothing is sent or stored; switching
 * account or chain discards the attempt.
 */
export function useSignatureLab() {
  const { view } = useWalletState();
  const { signMessageAsync } = useSignMessage();
  const [attempt, setAttempt] = useState(freshAttempt);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<LabPhase>({ phase: 'idle' });
  const run = useRef(0);

  const address = view.status === 'connected' ? view.address : null;
  const chainId = view.status === 'connected' ? view.chainId : null;
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  const message = useMemo(
    () => (address && chainId !== null ? buildLabMessage({ origin, address, chainId, ...attempt }) : null),
    [address, chainId, origin, attempt],
  );

  const clear = useCallback(() => {
    run.current++;
    setAttempt(freshAttempt());
    setConsent(false);
    setState({ phase: 'idle' });
  }, []);

  useEffect(clear, [address, chainId, clear]);

  const sign = useCallback(async () => {
    if (!consent || !address || !message || state.phase === 'awaiting') return;
    const id = ++run.current;
    setState({ phase: 'awaiting' });
    try {
      const signature = await signMessageAsync({ account: address, message });
      if (id !== run.current) return;
      const outcome = await verifyLocally(address, message, signature);
      if (id !== run.current) return;
      if (outcome.result === 'verified') {
        setState({ phase: 'verified', signature, recovered: outcome.recovered });
        emitPulse('signature-verified');
      } else {
        setState({ phase: 'mismatch', signature, recovered: outcome.result === 'mismatch' ? outcome.recovered : null });
      }
    } catch (error) {
      if (id === run.current) setState({ phase: classifySignError(error) });
    }
  }, [consent, address, message, state.phase, signMessageAsync]);

  return { connected: address !== null, address, message, consent, setConsent, state, sign, clear };
}
