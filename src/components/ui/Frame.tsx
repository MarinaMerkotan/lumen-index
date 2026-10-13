import { ReactNode } from 'react';

interface FrameProps {
  children: ReactNode;
  /** Size of the chamfered bottom-left corner in px (mirrors the hero disclosure panel). */
  notch?: number;
  tone?: 'ice' | 'muted';
  className?: string;
}

/**
 * Thin outline with a chamfered bottom-left corner. Built from hairlines instead of a stretched
 * SVG polygon so the notch keeps its 45° angle at any panel size.
 */
export function Frame({ children, notch = 30, tone = 'muted', className = '' }: FrameProps) {
  const line = tone === 'ice' ? 'bg-ice' : 'bg-white/[0.16]';
  const stroke = tone === 'ice' ? '#AFDDFF' : 'rgba(255,255,255,0.16)';

  return (
    <div className={`relative ${className}`}>
      <span aria-hidden="true" className={`absolute top-0 left-0 right-0 h-px ${line}`} />
      <span aria-hidden="true" className={`absolute top-0 right-0 bottom-0 w-px ${line}`} />
      <span aria-hidden="true" className={`absolute bottom-0 right-0 h-px ${line}`} style={{ left: notch }} />
      <span aria-hidden="true" className={`absolute top-0 left-0 w-px ${line}`} style={{ bottom: notch }} />
      <svg aria-hidden="true" className="absolute bottom-0 left-0 overflow-visible" width={notch} height={notch}>
        <line x1="0.5" y1="0" x2={notch} y2={notch - 0.5} stroke={stroke} strokeWidth="1" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
