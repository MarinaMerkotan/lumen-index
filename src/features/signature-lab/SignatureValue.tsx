import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../wallet/useCopyToClipboard';

/** Compact signature: truncated preview, copy action and an expandable full value (selectable text). */
export function SignatureValue({ signature }: { signature: `0x${string}` }) {
  const [copyState, copy] = useCopyToClipboard();
  const preview = `${signature.slice(0, 12)}…${signature.slice(-8)}`;
  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-manrope text-white/50 text-[11px] leading-[14px] tracking-[0.06em]">SIGNATURE</span>
        <code className="font-manrope text-white/80 text-[13px] leading-[18px] tabular-nums">{preview}</code>
        <button
          type="button"
          onClick={() => copy(signature)}
          className="inline-flex items-center gap-[6px] font-manrope text-[13px] leading-[16px] text-ice hover:text-white transition-colors"
          aria-label="Copy full signature"
        >
          {copyState === 'copied' ? <Check className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" /> : <Copy className="w-[12px] h-[12px]" strokeWidth={1.5} aria-hidden="true" />}
          <span aria-live="polite">{copyState === 'copied' ? 'COPIED' : copyState === 'failed' ? 'COPY FAILED' : 'COPY'}</span>
        </button>
      </div>
      <details className="lab-details mt-2">
        <summary className="font-manrope text-white/55 text-[12px] leading-[17px] cursor-pointer hover:text-white">Show full signature (65 bytes)</summary>
        <code className="mt-2 block font-manrope text-white/75 text-[12px] leading-[18px] break-all tabular-nums select-all">{signature}</code>
      </details>
    </div>
  );
}
