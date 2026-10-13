// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DETECTION_WINDOW_MS, requestProviderAnnouncements, useWalletDetection } from './detection';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('requestProviderAnnouncements', () => {
  it('dispatches the EIP-6963 request event', () => {
    const target = new EventTarget();
    const listener = vi.fn();
    target.addEventListener('eip6963:requestProvider', listener);
    requestProviderAnnouncements(target);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('useWalletDetection', () => {
  afterEach(() => vi.useRealTimers());

  it('re-requests announcements and settles after the detection window', () => {
    vi.useFakeTimers();
    const target = new EventTarget();
    const requests = vi.fn();
    target.addEventListener('eip6963:requestProvider', requests);
    let api: ReturnType<typeof useWalletDetection> | undefined;
    function Probe() {
      api = useWalletDetection(target);
      return null;
    }
    const root = createRoot(document.createElement('div'));
    act(() => root.render(<Probe />));
    expect(api!.status).toBe('idle');

    act(() => api!.retry());
    expect(requests).toHaveBeenCalledTimes(1);
    expect(api!.status).toBe('searching');

    act(() => vi.advanceTimersByTime(DETECTION_WINDOW_MS));
    expect(api!.status).toBe('done');
    act(() => root.unmount());
  });
});
