import { describe, expect, it } from 'vitest';
import { DEFAULT_MAINNET_RPC_URL, resolveRpcUrl, rpcHost } from './rpc';

describe('resolveRpcUrl', () => {
  it('uses the keyless default when nothing is configured', () => {
    expect(resolveRpcUrl(undefined)).toBe(DEFAULT_MAINNET_RPC_URL);
    expect(resolveRpcUrl('')).toBe(DEFAULT_MAINNET_RPC_URL);
  });

  it('accepts only https URLs without embedded credentials', () => {
    expect(resolveRpcUrl('https://rpc.example.org/eth')).toBe('https://rpc.example.org/eth');
    expect(resolveRpcUrl('http://rpc.example.org')).toBe(DEFAULT_MAINNET_RPC_URL);
    expect(resolveRpcUrl('https://user:secret@rpc.example.org')).toBe(DEFAULT_MAINNET_RPC_URL);
    expect(resolveRpcUrl('not a url')).toBe(DEFAULT_MAINNET_RPC_URL);
  });

  it('derives a display host', () => {
    expect(rpcHost(DEFAULT_MAINNET_RPC_URL)).toBe('ethereum-rpc.publicnode.com');
  });
});
