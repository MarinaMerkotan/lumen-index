import { useCallback, useEffect, useRef, useState } from 'react';

/** EIP-6963: asks every installed wallet in this page to (re-)announce itself. Requests no permission. */
export function requestProviderAnnouncements(target: EventTarget = window): void {
  target.dispatchEvent(new Event('eip6963:requestProvider'));
}

export type DetectionStatus = 'idle' | 'searching' | 'done';

/** Time allowed for wallets to answer a rediscovery request before we report the result. */
export const DETECTION_WINDOW_MS = 800;

/**
 * Manual "Retry detection". Wallets that are already injected re-announce (EIP-6963) and the
 * `window.ethereum` check is re-run on the next render. An extension enabled *after* this page
 * loaded is usually not injected until a reload, which the UI states honestly.
 */
export function useWalletDetection(target?: EventTarget) {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const retry = useCallback(() => {
    setStatus('searching');
    requestProviderAnnouncements(target ?? window);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('done'), DETECTION_WINDOW_MS);
  }, [target]);

  return { status, retry };
}
