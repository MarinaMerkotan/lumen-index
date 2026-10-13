// @vitest-environment jsdom
import { act } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WalletContext } from './WalletContext';
import { WalletControl } from './WalletControl';
import type { WalletController } from './useWalletState';
import { controller } from './testUtils';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function mount(value: WalletController, variant: 'header' | 'stacked' = 'header') {
  act(() =>
    root.render(
      <WalletContext.Provider value={value}>
        <WalletControl variant={variant} />
      </WalletContext.Provider>,
    ),
  );
}

const cta = () => container.querySelector<HTMLButtonElement>('button.wallet-cta')!;
const dialog = () => container.querySelector('[role="dialog"]');
const press = (key: string) => act(() => void document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
const button = (text: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!;

const META = { id: 'io.metamask', name: 'MetaMask', icon: null };
const RABBY = { id: 'io.rabby', name: 'Rabby', icon: null };

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('WalletControl with no detected wallet', () => {
  it('opens an accessible help dialog, moves focus in, and closes on Escape', () => {
    mount(controller({ status: 'unavailable' }));
    expect(cta().getAttribute('aria-expanded')).toBe('false');
    click(cta());
    expect(dialog()).not.toBeNull();
    expect(cta().getAttribute('aria-expanded')).toBe('true');
    expect(cta().getAttribute('aria-controls')).toBe(dialog()!.id);
    expect(document.activeElement).toBe(dialog());
    expect(dialog()!.querySelector('a[href="https://metamask.io/download"]')).not.toBeNull();

    press('Escape');
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(cta());
  });

  it('closes from the close button and on outside pointer down', () => {
    mount(controller({ status: 'unavailable' }));
    click(cta());
    click(container.querySelector('[aria-label="Close wallet help"]')!);
    expect(dialog()).toBeNull();

    click(cta());
    act(() => void document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })));
    expect(dialog()).toBeNull();
  });

  it('still closes on Escape when focus has fallen back to the page body', () => {
    mount(controller({ status: 'unavailable' }, { detection: 'searching' }));
    click(cta());
    act(() => (document.activeElement as HTMLElement).blur());
    expect(document.activeElement).toBe(document.body);
    press('Escape');
    expect(dialog()).toBeNull();
  });

  it('runs rediscovery from Retry detection', () => {
    const retryDetection = vi.fn();
    mount(controller({ status: 'unavailable' }, { retryDetection }));
    click(cta());
    click(button('RETRY DETECTION'));
    expect(retryDetection).toHaveBeenCalledTimes(1);
  });

  it('switches to the wallet list when rediscovery finds wallets, without connecting', () => {
    const connect = vi.fn();
    mount(controller({ status: 'unavailable' }, { connect }));
    click(cta());
    mount(controller({ status: 'disconnected' }, { connect, options: [META, RABBY] }));
    expect(dialog()).toBeNull();
    expect(button('MetaMask')).toBeDefined();
    expect(connect).not.toHaveBeenCalled();
  });
});

describe('WalletControl with detected wallets', () => {
  it('connects directly when exactly one wallet is available', () => {
    const connect = vi.fn();
    mount(controller({ status: 'disconnected' }, { connect, options: [META] }));
    click(cta());
    expect(connect).toHaveBeenCalledWith();
    expect(dialog()).toBeNull();
  });

  it('lets the visitor choose when several wallets are available', () => {
    const connect = vi.fn();
    mount(controller({ status: 'disconnected' }, { connect, options: [META, RABBY] }), 'stacked');
    click(cta());
    expect(document.activeElement?.textContent).toContain('MetaMask');
    click(button('Rabby'));
    expect(connect).toHaveBeenCalledWith('io.rabby');
  });
});
