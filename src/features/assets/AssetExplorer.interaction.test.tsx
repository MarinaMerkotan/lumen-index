// @vitest-environment jsdom
import { act } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '../../components/ambient/MotionContext';
import { WalletContext } from '../wallet/WalletContext';
import { connectedOn, controller } from '../wallet/testUtils';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const seen = vi.hoisted(() => ({ addresses: [] as (string | undefined)[] }));
vi.mock('./useMainnetBalance', () => ({
  useMainnetBalance: (address: string | undefined) => {
    seen.addresses.push(address);
    return { state: 'live', wei: 10n ** 18n, updatedAt: Date.now(), errorKind: null, isFetching: false, retry: () => undefined };
  },
}));
vi.mock('./useTokenBalances', () => ({
  useTokenBalances: () => ({ state: 'loading', rows: null, updatedAt: null, errorKind: null, isFetching: false, retry: () => undefined }),
}));

const { LumenIndexSection } = await import('./LumenIndexSection');

const USDC_LOWER = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
let container: HTMLDivElement;
let root: Root;

function mount(view = connectedOn(1, 'Ethereum Mainnet')) {
  act(() =>
    root.render(
      <MotionProvider>
        <WalletContext.Provider value={controller(view)}>
          <LumenIndexSection />
        </WalletContext.Provider>
      </MotionProvider>,
    ),
  );
}
const tab = (label: string) => [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find((t) => t.textContent === label)!;
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
function type(value: string) {
  const input = container.querySelector<HTMLInputElement>('input')!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() => void input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

beforeEach(() => {
  seen.addresses = [];
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Asset explorer modes', () => {
  it('rejects invalid addresses without any read', () => {
    mount();
    click(tab('EXPLORE ADDRESS'));
    seen.addresses = [];
    type('0x1234');
    expect(container.textContent).toContain('exactly 40 hex characters');
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    expect(seen.addresses.filter(Boolean)).toEqual([]);
  });

  it('inspects a public address separately from the connected wallet and stores nothing', () => {
    mount();
    expect(tab('CONNECTED WALLET').getAttribute('aria-selected')).toBe('true');
    expect(container.textContent).toContain('0x52908400098527886E0F7030069857D2E4169EE7');

    click(tab('EXPLORE ADDRESS'));
    type(USDC_LOWER);
    expect(container.textContent).toContain('INSPECTED ADDRESS · NOT YOUR WALLET');
    expect(container.textContent).toContain(USDC);
    expect(seen.addresses).toContain(USDC);

    click(tab('CONNECTED WALLET'));
    expect(container.textContent).toContain('0x52908400098527886E0F7030069857D2E4169EE7');
    expect(container.textContent).not.toContain('NOT YOUR WALLET');
    expect(localStorage.length + sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });

  it('supports arrow-key tab switching', () => {
    mount({ status: 'disconnected' });
    act(() => tab('CONNECTED WALLET').focus());
    act(() => void document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(tab('EXPLORE ADDRESS').getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tab('EXPLORE ADDRESS'));
  });
});
