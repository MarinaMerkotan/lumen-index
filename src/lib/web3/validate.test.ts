import { describe, expect, it } from 'vitest';
import { parseAddressInput, parseTxHashInput } from './validate';

const CHECKSUM = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

describe('parseAddressInput', () => {
  it('accepts checksummed and single-case addresses and returns the checksum form', () => {
    expect(parseAddressInput(CHECKSUM)).toEqual({ ok: true, address: CHECKSUM });
    expect(parseAddressInput(`  ${CHECKSUM.toLowerCase()} `)).toEqual({ ok: true, address: CHECKSUM });
    expect(parseAddressInput('0x' + CHECKSUM.slice(2).toUpperCase())).toEqual({ ok: true, address: CHECKSUM });
  });

  it('rejects empty, malformed and bad-checksum input', () => {
    expect(parseAddressInput('   ')).toEqual({ ok: false, reason: 'empty' });
    expect(parseAddressInput('0x1234')).toEqual({ ok: false, reason: 'format' });
    expect(parseAddressInput('vitalik.eth')).toEqual({ ok: false, reason: 'format' });
    expect(parseAddressInput(CHECKSUM.slice(2))).toEqual({ ok: false, reason: 'format' });
    expect(parseAddressInput('0xa0B86991c6218b36c1d19D4a2e9Eb0cE3606eB48')).toEqual({ ok: false, reason: 'checksum' });
    expect(parseAddressInput('<script>alert(1)</script>')).toEqual({ ok: false, reason: 'format' });
  });
});

describe('parseTxHashInput', () => {
  const hash = '0x' + 'aB'.repeat(32);
  it('accepts exactly 32 bytes of hex and normalises to lowercase', () => {
    expect(parseTxHashInput(` ${hash} `)).toEqual({ ok: true, hash: hash.toLowerCase() });
  });
  it('rejects anything else', () => {
    expect(parseTxHashInput('')).toEqual({ ok: false, reason: 'empty' });
    expect(parseTxHashInput(hash.slice(0, -1))).toEqual({ ok: false, reason: 'format' });
    expect(parseTxHashInput(hash + '0')).toEqual({ ok: false, reason: 'format' });
    expect(parseTxHashInput(hash.slice(2))).toEqual({ ok: false, reason: 'format' });
    expect(parseTxHashInput('0x' + 'zz'.repeat(32))).toEqual({ ok: false, reason: 'format' });
  });
});
