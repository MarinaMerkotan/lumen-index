// @vitest-environment jsdom
import { act } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '../../components/ambient/MotionContext';
import { BaseFeeChart } from './BaseFeeChart';
import type { FeePoint } from './blocks';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const lookups = vi.hoisted(() => ({ hashes: [] as (string | null)[] }));
vi.mock('../transactions/useTransactionLookup', () => ({
  useTransactionLookup: (hash: string | null) => {
    lookups.hashes.push(hash);
    return { status: hash ? 'loading' : 'idle', tx: null, receipt: null, errorKind: null, isFetching: false, retry: () => undefined };
  },
}));
const { TransactionExplorer } = await import('../transactions/TransactionExplorer');

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  lookups.hashes = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const key = (k: string) => act(() => void document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })));

describe('TransactionExplorer form', () => {
  function submit(value: string, onLookup: (hash: `0x${string}`) => void) {
    act(() => root.render(<MotionProvider><TransactionExplorer hash={null} latest={null} onLookup={onLookup} /></MotionProvider>));
    const input = container.querySelector('input')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    act(() => {
      setter.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => void input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  }

  it('blocks malformed hashes before any RPC call', () => {
    const onLookup = vi.fn();
    submit('0x1234', onLookup);
    expect(onLookup).not.toHaveBeenCalled();
    expect(container.textContent).toContain('exactly 64 hex characters');
    expect(lookups.hashes.every((h) => h === null)).toBe(true);
  });

  it('submits a valid hash normalised to lowercase', () => {
    const onLookup = vi.fn();
    submit(' 0x' + 'AB'.repeat(32) + ' ', onLookup);
    expect(onLookup).toHaveBeenCalledWith('0x' + 'ab'.repeat(32));
  });
});

describe('BaseFeeChart interaction', () => {
  const points: FeePoint[] = [
    { block: 10n, baseFee: 100n, gasUsedRatio: 0.5, kind: 'observed' },
    { block: 11n, baseFee: null, gasUsedRatio: null, kind: 'observed' },
    { block: 12n, baseFee: 120n, gasUsedRatio: 0.7, kind: 'observed' },
    { block: 13n, baseFee: 118n, gasUsedRatio: null, kind: 'next' },
  ];

  it('uses one tab stop, arrow keys, and never selects the projected next block', () => {
    const onFocusBlock = vi.fn();
    const onSelectBlock = vi.fn();
    act(() => root.render(<BaseFeeChart points={points} stale={false} focused={null} selected={null} onFocusBlock={onFocusBlock} onSelectBlock={onSelectBlock} />));
    const bars = [...container.querySelectorAll<HTMLButtonElement>('.fee-bar')];
    expect(bars.filter((b) => b.tabIndex === 0)).toHaveLength(1);
    expect(bars[1].getAttribute('aria-label')).toContain('no value returned');
    expect(bars[3].getAttribute('aria-label')).toContain('not mined yet');

    act(() => bars[2].focus());
    expect(onFocusBlock).toHaveBeenLastCalledWith(12n);
    key('ArrowRight');
    expect(onFocusBlock).toHaveBeenLastCalledWith(13n);
    expect(document.activeElement).toBe(bars[3]);
    act(() => void bars[3].dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(onSelectBlock).not.toHaveBeenCalled();
    key('Home');
    act(() => void bars[0].dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(onSelectBlock).toHaveBeenCalledWith(10n);
    expect(container.textContent).toContain('NEXT BLOCK');
  });
});
