// @vitest-environment jsdom
import { act } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MotionProvider } from '../../components/ambient/MotionContext';
import { AmmSimulator } from '../liquidity/AmmSimulator';
import { LocalPoll } from './LocalPoll';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const mount = (ui: JSX.Element) => act(() => root.render(<MotionProvider>{ui}</MotionProvider>));
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
const button = (text: string) => [...container.querySelectorAll('button')].find((b) => b.textContent?.includes(text))!;
const inputs = () => [...container.querySelectorAll<HTMLInputElement>('input')];
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('AMM simulator', () => {
  it('computes a result from the defaults and updates as inputs change', () => {
    mount(<AmmSimulator />);
    // 1000 A / 2500 B, 25 A in, 0.3% fee → 2500·24.925/1024.925 = 60.797131497… (truncated to 6 dp)
    expect(container.textContent).toContain('60.797131');
    expect(container.textContent).toContain('Simulated only');
    type(inputs()[2], '0');
    expect(container.textContent).toContain('NO IMPACT');
    type(inputs()[2], '5000');
    expect(container.textContent).toContain('HIGH IMPACT');
    expect(container.textContent).toContain('larger than the input reserve');
  });

  it('validates fields and explains empty pools', () => {
    mount(<AmmSimulator />);
    type(inputs()[0], '-5');
    expect(inputs()[0].getAttribute('aria-invalid')).toBe('true');
    expect(container.textContent).toContain('Fix the highlighted fields');
    expect(container.textContent).not.toContain('SIMULATED RESULT');
    type(inputs()[0], '0');
    expect(container.textContent).toContain('Both reserves must be greater than zero');
    type(inputs()[3], '12');
    expect(container.textContent).toContain('Between 0% and 10%');
  });

  it('reverses direction and resets to defaults', () => {
    mount(<AmmSimulator />);
    click(button('SWAP TOKEN_A → TOKEN_B'));
    expect(container.textContent).toContain('SWAP AMOUNT (TOKEN_B IN)');
    type(inputs()[0], '1');
    click(button('RESET DEFAULTS'));
    expect(inputs().map((i) => i.value)).toEqual(['1000', '2500', '25', '0.3']);
    expect(container.textContent).toContain('SWAP AMOUNT (TOKEN_A IN)');
  });
});

describe('Local poll', () => {
  it('casts, changes and resets a single local vote', () => {
    mount(<LocalPoll />);
    expect(button('CAST LOCAL VOTE').disabled).toBe(true);
    const radios = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    click(radios[0]);
    click(button('CAST LOCAL VOTE'));
    expect(container.textContent).toContain('1 · 100%');
    expect(container.textContent).toContain('You cast FOR in this browser tab');
    expect(container.querySelector('fieldset')!.disabled).toBe(true);

    click(button('CHANGE VOTE'));
    click(container.querySelectorAll<HTMLInputElement>('input[type="radio"]')[1]);
    click(button('CAST LOCAL VOTE'));
    expect(container.textContent).toContain('You cast AGAINST');
    expect(container.textContent!.match(/1 · 100%/g)).toHaveLength(1);

    click(button('RESET'));
    expect(container.textContent).not.toContain('100%');
    expect(localStorage.length + sessionStorage.length).toBe(0);
  });
});
