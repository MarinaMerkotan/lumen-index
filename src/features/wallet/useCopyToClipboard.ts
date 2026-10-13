import { useCallback, useEffect, useRef, useState } from 'react';

export type CopyState = 'idle' | 'copied' | 'failed';

/** Copies text on an explicit click and reports the result briefly. Nothing is stored. */
export function useCopyToClipboard(resetMs = 1800): [CopyState, (text: string) => void] {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    (text: string) => {
      const settle = (next: CopyState) => {
        setState(next);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setState('idle'), resetMs);
      };
      if (!navigator.clipboard?.writeText) {
        settle('failed');
        return;
      }
      navigator.clipboard.writeText(text).then(
        () => settle('copied'),
        () => settle('failed'),
      );
    },
    [resetMs],
  );

  return [state, copy];
}
