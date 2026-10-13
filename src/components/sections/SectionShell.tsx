import { CSSProperties, ReactNode, useRef } from 'react';
import { ambientTiming } from '../../lib/ambient';
import { useInView } from '../../hooks/useInView';
import { useAmbient } from '../ambient/useAmbient';
import { Crosshair } from '../ambient/Crosshair';
import { GRID_COLUMNS } from '../ambient/GridField';
import { SectionLabel } from '../ui/SectionLabel';

interface SectionShellProps {
  id: string;
  number: string;
  label: string;
  title: string;
  intro: ReactNode;
  tags: ReactNode;
  children: ReactNode;
  /** Seed so each section's boundary pulses keep their own rhythm. */
  seed: number;
}

/**
 * Shared section layout: label rule, editorial heading, truth tags, and a content column.
 * Grid crosshairs sit where the section boundary crosses the page-wide vertical hairlines.
 */
export function SectionShell({ id, number, label, title, intro, tags, children, seed }: SectionShellProps) {
  const ref = useRef<HTMLElement>(null);
  const revealed = useInView(ref, { rootMargin: '0px 0px -15% 0px', once: true });
  const ambientLive = useAmbient(ref);
  const headingId = `${id}-title`;

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={`section relative px-5 md:px-[35px] py-24 md:py-32 lg:py-40 outline-none ${revealed ? 'is-revealed' : ''} ${ambientLive ? 'ambient-live' : ''}`}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.06]" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 hidden md:block" aria-hidden="true">
        {GRID_COLUMNS.map((left, i) => (
          <Crosshair
            key={left}
            top="0px"
            left={left}
            pulse={ambientTiming(i, { minDuration: 7000, maxDuration: 13000, baseDelay: 600, maxDelay: 6000 }, seed)}
          />
        ))}
      </div>

      <div className="relative grid gap-14 lg:gap-10 lg:grid-cols-12">
        <header className="lg:col-span-5">
          <div className="reveal flex items-center gap-4" style={{ '--i': 0 } as CSSProperties}>
            <SectionLabel number={number} label={label} />
          </div>
          <span className="reveal-line block h-px bg-white/20 mt-5" aria-hidden="true" />
          <h2
            id={headingId}
            className="reveal font-graphik text-white font-normal text-[34px] sm:text-[42px] md:text-[52px] leading-[1.04] mt-8 max-w-[520px]"
            style={{ '--i': 1 } as CSSProperties}
          >
            {title}
          </h2>
          <div
            className="reveal font-manrope text-white/60 text-[15px] leading-[24px] mt-6 max-w-[460px] space-y-4"
            style={{ '--i': 2 } as CSSProperties}
          >
            {intro}
          </div>
          <div className="reveal flex flex-wrap gap-2 mt-8" style={{ '--i': 3 } as CSSProperties}>
            {tags}
          </div>
        </header>

        <div className="reveal lg:col-span-6 lg:col-start-7 lg:pt-[52px]" style={{ '--i': 2 } as CSSProperties}>
          {children}
        </div>
      </div>
    </section>
  );
}
