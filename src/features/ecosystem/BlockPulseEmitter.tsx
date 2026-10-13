import { useEffect, useRef } from 'react';
import { emitPulse } from '../../lib/pulseBus';
import { useChainTelemetry } from './useChainTelemetry';

/** Emits a `block` pulse when the public RPC reports a new, higher block. Renders nothing. */
export function BlockPulseEmitter() {
  const { block } = useChainTelemetry();
  const last = useRef<bigint | null>(null);
  const number = block?.number ?? null;

  useEffect(() => {
    if (number === null) return;
    if (last.current !== null && number > last.current) emitPulse('block');
    if (last.current === null || number > last.current) last.current = number;
  }, [number]);

  return null;
}
