import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from './App';
import { SECTION_IDS } from './content/navigation';

// Server render = first paint before any RPC response or wallet interaction.
const html = renderToStaticMarkup(<App />);

describe('App acceptance (first paint)', () => {
  it('renders a real section for every navigation anchor', () => {
    const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    for (const id of SECTION_IDS) {
      expect(ids.has(id)).toBe(true);
      expect(hrefs).toContain(id);
    }
    for (const href of hrefs) expect(ids.has(href), `anchor #${href} has no target`).toBe(true);
  });

  it('makes no wallet claims before a provider reports an account', () => {
    expect(html).not.toMatch(/0x[0-9a-f]{6,}/i);
    expect(html).not.toContain('WALLET LINKED');
    expect(html).not.toMatch(/PRIME_MEMBER|\[ CONNECTED \]/);
  });

  it('shows telemetry as loading, never as fabricated numbers', () => {
    expect(html).toContain('Contacting the RPC');
    expect(html).not.toMatch(/#\d{1,3}(,\d{3})+/);
    expect(html).not.toMatch(/\d gwei/);
  });

  it('keeps misleading prototype copy out', () => {
    for (const phrase of [/private banking/i, /luminous returns/i, /neural/i, /deep-learning/i, /transparency_report/i]) {
      expect(html).not.toMatch(phrase);
    }
  });

  it('discloses the RPC provider', () => {
    expect(html).toContain('ethereum-rpc.publicnode.com');
  });
});
