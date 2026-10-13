import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { METAMASK_DOWNLOAD_URL, NoWalletPanel } from './NoWalletPanel';
import type { DetectionStatus } from './detection';

const render = (detection: DetectionStatus) =>
  renderToStaticMarkup(<NoWalletPanel id="p" titleId="t" detection={detection} onRetry={() => undefined} onClose={() => undefined} />);

describe('NoWalletPanel', () => {
  it('is a labelled dialog explaining missing and disabled wallets', () => {
    const html = render('idle');
    expect(html).toMatch(/role="dialog"[^>]*aria-labelledby="t"/);
    expect(html).toContain('id="t"');
    expect(html).toContain('No compatible wallet is visible to this page.');
    expect(html).toMatch(/enable the extension/);
    expect(html).toMatch(/disabled extension from a missing one/);
    expect(html).toContain('aria-label="Close wallet help"');
  });

  it('links to the official MetaMask download page safely', () => {
    expect(METAMASK_DOWNLOAD_URL).toBe('https://metamask.io/download');
    expect(render('idle')).toMatch(/href="https:\/\/metamask\.io\/download" target="_blank" rel="noopener noreferrer"/);
  });

  it('offers retry detection and reflects its progress', () => {
    expect(render('idle')).toContain('RETRY DETECTION');
    expect(render('searching')).toMatch(/<button[^>]*aria-disabled="true"[^>]*>.*SEARCHING/s);
    expect(render('idle')).not.toContain('RELOAD PAGE');
  });

  it('recommends a reload when rediscovery finds nothing', () => {
    const html = render('done');
    expect(html).toContain('usually need a refresh');
    expect(html).toContain('RELOAD PAGE');
  });
});
