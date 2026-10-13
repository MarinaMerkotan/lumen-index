import { describe, expect, it } from 'vitest';
import { toFragmentId } from './fragment';

describe('toFragmentId', () => {
  it('maps underscore labels to hyphenated fragment ids', () => {
    expect(toFragmentId('LIQUIDITY_POOLS')).toBe('liquidity-pools');
    expect(toFragmentId('LUMEN_INDEX')).toBe('lumen-index');
    expect(toFragmentId('ECOSYSTEM')).toBe('ecosystem');
  });

  it('collapses separators and trims edges', () => {
    expect(toFragmentId('  Hello  World__2 ')).toBe('hello-world-2');
    expect(toFragmentId('--A--')).toBe('a');
  });
});
