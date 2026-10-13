import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from './App';
import { SECTION_IDS } from './content/navigation';

const html = renderToStaticMarkup(<App />);

describe('App (M1 acceptance)', () => {
  it('renders a real section for every navigation anchor', () => {
    const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));

    for (const id of SECTION_IDS) {
      expect(ids.has(id)).toBe(true);
      expect(hrefs).toContain(id);
    }
    for (const href of hrefs) {
      expect(ids.has(href), `anchor #${href} has no target`).toBe(true);
    }
  });

  it('makes no wallet connection or membership claims before a provider exists', () => {
    expect(html).not.toMatch(/0x[0-9a-f]{2,}/i);
    expect(html).not.toContain('[ CONNECTED ]');
    expect(html).not.toMatch(/PRIME_MEMBER/);
    expect(html).toContain('NOT CONNECTED');
    expect(html).toContain('COMING NEXT');
  });

  it('removes misleading banking, returns, AI and report copy', () => {
    for (const phrase of [/private banking/i, /luminous returns/i, /neural/i, /deep-learning/i, /transparency_report/i, /#transparency/]) {
      expect(html).not.toMatch(phrase);
    }
  });

  it('marks the connect control as non-functional', () => {
    expect(html).toMatch(/<button[^>]*aria-disabled="true"[^>]*>.*?CONNECT WALLET/s);
  });
});
