import { describe, expect, it } from 'vitest';
import { NAV_ITEMS, SECTION_IDS } from './navigation';

describe('navigation', () => {
  it('exposes the four documented destinations with valid fragment ids', () => {
    expect(SECTION_IDS).toEqual(['ecosystem', 'liquidity-pools', 'lumen-index', 'governance']);
    expect(NAV_ITEMS.map((item) => item.label)).toEqual(['ECOSYSTEM', 'LIQUIDITY_POOLS', 'LUMEN_INDEX', 'GOVERNANCE']);
    expect(NAV_ITEMS.map((item) => item.number)).toEqual(['01', '02', '03', '04']);
  });
});
