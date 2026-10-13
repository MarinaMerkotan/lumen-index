// @vitest-environment jsdom
import { act } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { privateKeyToAccount } from 'viem/accounts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from '../../components/ambient/MotionContext';
import { WalletContext } from '../wallet/WalletContext';
import { controller } from '../wallet/testUtils';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Throwaway, publicly known test keys (Hardhat #0 / #1). Never funded; used only to produce real signatures.
const signer = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const stranger = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');

const wallet = vi.hoisted(() => ({ sign: vi.fn() }));
vi.mock('wagmi', () => ({ useSignMessage: () => ({ signMessageAsync: wallet.sign }) }));

const { SignatureLab } = await import('./SignatureLab');

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  wallet.sign.mockReset();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const connected = controller({ status: 'connected', address: signer.address, chainId: 1, networkName: 'Ethereum Mainnet', onMainnet: true });
function mount(value = connected) {
  act(() =>
    root.render(
      <MotionProvider>
        <WalletContext.Provider value={value}>
          <SignatureLab />
        </WalletContext.Provider>
      </MotionProvider>,
    ),
  );
}
const button = (text: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.includes(text));
const flush = () => act(async () => void (await new Promise((resolve) => setTimeout(resolve, 0))));
async function consentAndSign() {
  act(() => void container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  act(() => void button('SIGN MESSAGE')!.click());
  await flush();
  await flush();
}

describe('SignatureLab', () => {
  it('asks for a connection first and never signs on its own', () => {
    mount(controller({ status: 'disconnected' }));
    expect(container.textContent).toContain('Connect a wallet to try the lab');
    expect(button('SIGN MESSAGE')).toBeUndefined();
    expect(wallet.sign).not.toHaveBeenCalled();
  });

  it('shows the exact message and requires explicit consent before signing', () => {
    mount();
    const message = container.querySelector('pre')!.textContent!;
    expect(message).toContain(`Origin: ${window.location.origin}`);
    expect(message).toContain(`Address: ${signer.address}`);
    expect(message).toMatch(/Challenge: 0x[0-9a-f]{32}/);
    expect(message).toContain('does NOT authorize any transaction');
    expect(button('SIGN MESSAGE')!.disabled).toBe(true);
    act(() => void button('SIGN MESSAGE')!.click());
    expect(wallet.sign).not.toHaveBeenCalled();
  });

  it('verifies a genuine signature locally, then clears with a new challenge', async () => {
    wallet.sign.mockImplementation(({ message }: { message: string }) => signer.signMessage({ message }));
    mount();
    const first = container.querySelector('pre')!.textContent;
    await consentAndSign();
    expect(wallet.sign).toHaveBeenCalledTimes(1);
    expect(wallet.sign.mock.calls[0][0]).toEqual({ account: signer.address, message: first });
    expect(container.textContent).toContain('VERIFIED LOCALLY');
    act(() => void button('CLEAR RESULT')!.click());
    expect(container.textContent).not.toContain('VERIFIED LOCALLY');
    expect(container.querySelector('pre')!.textContent).not.toBe(first);
    expect(container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(false);
  });

  it('reports a signature from another key as not verifiable', async () => {
    wallet.sign.mockImplementation(({ message }: { message: string }) => stranger.signMessage({ message }));
    mount();
    await consentAndSign();
    expect(container.textContent).toContain('NOT VERIFIABLE LOCALLY');
    expect(container.textContent).toContain(stranger.address);
  });

  it('handles rejection and unsupported wallets', async () => {
    wallet.sign.mockRejectedValueOnce(Object.assign(new Error('User rejected'), { code: 4001 }));
    mount();
    await consentAndSign();
    expect(container.textContent).toContain('REJECTED');
    expect(container.textContent).toContain('Nothing was signed');

    act(() => void button('CLEAR RESULT')!.click());
    wallet.sign.mockRejectedValueOnce(Object.assign(new Error('Unsupported'), { code: 4200 }));
    await consentAndSign();
    expect(container.textContent).toContain('UNSUPPORTED');
  });
});
