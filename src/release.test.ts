import { describe, expect, it } from 'vitest';

/** Release hygiene for the static document (branding, metadata, external assets). */
const files = import.meta.glob(['/index.html', '/public/*'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const html = files['/index.html'];

describe('release document', () => {
  it('uses the LUMEN favicon and no Vite template assets', () => {
    expect(html).toContain('href="/favicon.svg"');
    expect(html).not.toMatch(/vite\.svg/);
    expect(Object.keys(files)).toContain('/public/favicon.svg');
    expect(Object.keys(files)).not.toContain('/public/vite.svg');
    expect(files['/public/favicon.svg']).toContain('#AFDDFF');
  });

  it('describes the app accurately with basic social metadata', () => {
    expect(html).toMatch(/<title>LŪMEN \/\/ ÍNDEX — Frontend Web3 Showcase<\/title>/);
    expect(html).toMatch(/<meta name="description" content="[^"]*read-only Ethereum Mainnet/);
    for (const tag of ['og:title', 'og:description', 'og:type', 'og:site_name']) expect(html).toContain(`property="${tag}"`);
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="theme-color" content="#000000"');
    expect(html).not.toMatch(/private banking|luminous returns/i);
  });

  it('loads only openly licensed webfonts (no unconfirmed Graphik copy)', () => {
    expect(html).not.toMatch(/onlinewebfonts|Graphik/i);
    expect(html).toContain('family=Hanken+Grotesk');
    expect(html).toContain('family=Manrope');
  });
});
