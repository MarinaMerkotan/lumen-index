import { describe, expect, it } from 'vitest';
import { WrongChainRpcError, classifyRpcError, classifyWalletError } from './errors';

const wrap = (cause: unknown) => ({ name: 'ConnectorError', message: 'outer', cause: { name: 'Middle', cause } });

describe('classifyWalletError', () => {
  it('detects user rejection anywhere in the cause chain', () => {
    expect(classifyWalletError(wrap({ code: 4001 }))).toBe('rejected');
    expect(classifyWalletError({ name: 'UserRejectedRequestError' })).toBe('rejected');
  });

  it('detects an already-pending request and chain switch failures', () => {
    expect(classifyWalletError(wrap({ code: -32002 }))).toBe('pending');
    expect(classifyWalletError({ code: 4902 })).toBe('unsupported-chain');
    expect(classifyWalletError({ name: 'SwitchChainError' })).toBe('unsupported-chain');
  });

  it('detects a missing provider and falls back to unknown', () => {
    expect(classifyWalletError({ name: 'ProviderNotFoundError' })).toBe('no-provider');
    expect(classifyWalletError(new Error('boom'))).toBe('unknown');
    expect(classifyWalletError(null)).toBe('unknown');
  });
});

describe('classifyRpcError', () => {
  it('detects rate limiting by HTTP status or JSON-RPC code', () => {
    expect(classifyRpcError(wrap({ name: 'HttpRequestError', status: 429 }))).toBe('rate-limited');
    expect(classifyRpcError({ code: -32005 })).toBe('rate-limited');
  });

  it('detects timeouts, network failures and wrong-chain endpoints', () => {
    expect(classifyRpcError(wrap({ name: 'TimeoutError' }))).toBe('timeout');
    expect(classifyRpcError({ name: 'HttpRequestError', status: 502 })).toBe('network');
    expect(classifyRpcError(new WrongChainRpcError('chain 5'))).toBe('wrong-chain');
    expect(classifyRpcError(new Error('?'))).toBe('unknown');
  });
});
