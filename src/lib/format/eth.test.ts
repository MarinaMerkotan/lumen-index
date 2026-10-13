import { parseEther, parseGwei } from 'viem';
import { describe, expect, it } from 'vitest';
import { formatAge, formatBlockNumber, formatEthAmount, formatGasGwei, toChecksumAddress, truncateAddress } from './eth';

describe('formatEthAmount', () => {
  it('formats whole and fractional ETH from wei without floats', () => {
    expect(formatEthAmount(0n)).toBe('0');
    expect(formatEthAmount(parseEther('1'))).toBe('1');
    expect(formatEthAmount(parseEther('0.5'))).toBe('0.5');
    expect(formatEthAmount(parseEther('1234567.25'))).toBe('1,234,567.25');
  });

  it('truncates instead of rounding up', () => {
    expect(formatEthAmount(parseEther('1.2345679'))).toBe('1.234567');
    expect(formatEthAmount(parseEther('0.9999999'))).toBe('0.999999');
  });

  it('flags dust below display precision rather than showing zero', () => {
    expect(formatEthAmount(1n)).toBe('< 0.000001');
    expect(formatEthAmount(parseEther('0.0000009'))).toBe('< 0.000001');
  });

  it('handles values far beyond Number precision', () => {
    expect(formatEthAmount(123456789012345678901234567890n)).toBe('123,456,789,012.345678');
  });

  it('rejects negative balances', () => {
    expect(() => formatEthAmount(-1n)).toThrow(RangeError);
  });
});

describe('formatGasGwei', () => {
  it('uses 3 decimals below 1 gwei and 2 above', () => {
    expect(formatGasGwei(parseGwei('0.41234'))).toBe('0.412');
    expect(formatGasGwei(parseGwei('12.3456'))).toBe('12.34');
    expect(formatGasGwei(parseGwei('30'))).toBe('30');
    expect(formatGasGwei(1n)).toBe('< 0.001');
  });
});

describe('address helpers', () => {
  const lower = '0x52908400098527886e0f7030069857d2e4169ee7';
  const checksum = '0x52908400098527886E0F7030069857D2E4169EE7';

  it('checksums valid addresses and rejects invalid input', () => {
    expect(toChecksumAddress(lower)).toBe(checksum);
    expect(toChecksumAddress('0x1234')).toBeNull();
    expect(toChecksumAddress(undefined)).toBeNull();
    expect(toChecksumAddress('not-an-address')).toBeNull();
  });

  it('truncates for display only', () => {
    expect(truncateAddress(checksum)).toBe('0x5290…9EE7');
    expect(truncateAddress('0x12')).toBe('0x12');
  });
});

describe('misc formatting', () => {
  it('groups block numbers', () => {
    expect(formatBlockNumber(24086394n)).toBe('24,086,394');
  });

  it('formats relative age', () => {
    expect(formatAge(0, 8_000)).toBe('8 s ago');
    expect(formatAge(0, 125_000)).toBe('2 min ago');
    expect(formatAge(10_000, 0)).toBe('0 s ago');
  });
});
