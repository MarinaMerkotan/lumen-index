import { Pause, Play } from 'lucide-react';
import { useMotion } from '../ambient/MotionContext';

function MotionToggle() {
  const { reducedMotion, paused, setPaused } = useMotion();
  if (reducedMotion) return null;

  return (
    <button
      type="button"
      className="motion-toggle inline-flex items-center gap-[6px] font-manrope text-white/55 text-[11px] leading-[14px] tracking-[0.06em] hover:text-ice transition-colors"
      onClick={() => setPaused(!paused)}
    >
      {paused ? <Play className="w-[11px] h-[11px]" strokeWidth={1.5} aria-hidden="true" /> : <Pause className="w-[11px] h-[11px]" strokeWidth={1.5} aria-hidden="true" />}
      {paused ? 'RESUME MOTION' : 'PAUSE MOTION'}
    </button>
  );
}

export function HeroFooter() {
  return (
    <div className="absolute bottom-5 md:bottom-[35px] left-5 md:left-[35px] right-5 md:right-[35px] flex flex-col md:flex-row items-start md:items-end justify-between gap-5 md:gap-0">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 anim-fade-up" style={{ animationDelay: '900ms' }}>
        <a
          href="#ecosystem"
          className="hero-cta group bg-ice px-[16px] md:px-[20px] py-[10px] md:py-[12px] flex items-center gap-[10px] hover:bg-[#c8e8ff] transition-colors"
        >
          <span className="hero-cta__star text-black text-[16px] leading-none" aria-hidden="true">
            &#10022;
          </span>
          <span className="font-manrope text-black text-[12px] md:text-[13px] leading-[15.6px] uppercase tracking-wide">Explore the Ecosystem</span>
        </a>
        <MotionToggle />
      </div>

      <aside
        className="relative max-w-[280px] hidden sm:block anim-slide-right"
        style={{ animationDelay: '1100ms' }}
        aria-label="Project boundaries"
      >
        <span className="font-manrope text-black text-[13px] leading-[15.6px] bg-ice px-[6px] py-[2px] inline-block mb-[10px]">
          NOT A BANK — A FRONTEND SHOWCASE
        </span>
        <div className="relative p-[20px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 168" preserveAspectRatio="none" aria-hidden="true">
            <polygon
              points="0.5,0.5 279.5,0.5 279.5,167.5 30,167.5 0.5,137.5"
              fill="rgba(0,0,0,0.35)"
              stroke="#AFDDFF"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <p className="relative font-manrope text-white text-[13px] leading-[18px] mb-[18px]">
            Public Ethereum data and clearly labelled local simulations, rendered in the browser. No custody, no transactions, no returns.
          </p>
          <a href="#disclosure" className="relative font-manrope text-ice text-[13px] leading-[15.6px] hover:underline underline-offset-4">
            VIEW_SAFETY_BOUNDARIES
          </a>
        </div>
      </aside>
    </div>
  );
}
