import { privateKeyToAccount } from 'viem/accounts';
import { describe, expect, it } from 'vitest';
import { buildLabMessage, classifySignError, createChallenge, verifyLocally } from './message';

// Throwaway test key (well-known Hardhat account #0). Never holds funds; used only to sign in tests.
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const other = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');

const input = {
  origin: 'http://localhost:5179',
  address: account.address,
  chainId: 1,
  challenge: '0x00112233445566778899aabbccddeeff' as const,
  issuedAt: '2026-10-13T12:00:00.000Z',
};

describe('buildLabMessage', () => {
  it('is readable and states that it authorizes nothing', () => {
    const message = buildLabMessage(input);
    expect(message).toContain('LUMEN // INDEX');
    expect(message).toContain('Origin: http://localhost:5179');
    expect(message).toContain(`Address: ${account.address}`);
    expect(message).toContain('Challenge: 0x00112233445566778899aabbccddeeff');
    expect(message).toMatch(/does NOT authorize any transaction, token transfer, approval or access to funds/);
    expect(message).toMatch(/does NOT log you in/);
    expect(message).not.toMatch(/0x[0-9a-f]{130}/i); // never a pre-hashed blob
  });
});

describe('createChallenge', () => {
  it('returns 16 bytes of hex from the provided random source', () => {
    expect(createChallenge((b) => b.fill(0xab))).toBe('0x' + 'ab'.repeat(16));
    expect(createChallenge()).toMatch(/^0x[0-9a-f]{32}$/);
    expect(createChallenge()).not.toBe(createChallenge());
  });
});

describe('verifyLocally', () => {
  it('verifies a genuine EOA signature without any RPC call', async () => {
    const message = buildLabMessage(input);
    const signature = await account.signMessage({ message });
    expect(await verifyLocally(account.address, message, signature)).toEqual({ result: 'verified', recovered: account.address });
  });

  it('reports a different signer or a tampered message as mismatch', async () => {
    const message = buildLabMessage(input);
    const foreign = await other.signMessage({ message });
    expect(await verifyLocally(account.address, message, foreign)).toMatchObject({ result: 'mismatch', recovered: other.address });
    const signature = await account.signMessage({ message });
    expect((await verifyLocally(account.address, message + ' ', signature)).result).toBe('mismatch');
  });

  it('treats malformed or non-EOA-sized signatures as invalid', async () => {
    expect(await verifyLocally(account.address, 'x', '0x1234')).toEqual({ result: 'invalid' });
  });
});

describe('classifySignError', () => {
  it('separates rejection, unsupported methods and other failures', () => {
    expect(classifySignError({ name: 'Wrap', cause: { code: 4001 } })).toBe('rejected');
    expect(classifySignError({ code: 4200 })).toBe('unsupported');
    expect(classifySignError({ cause: { code: -32601 } })).toBe('unsupported');
    expect(classifySignError(new Error('boom'))).toBe('error');
  });
});
