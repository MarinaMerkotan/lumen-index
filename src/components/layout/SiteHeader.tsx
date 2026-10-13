import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { NAV_ITEMS } from '../../content/navigation';
import { WalletControl } from '../../features/wallet/WalletControl';
import { MobileMenu } from './MobileMenu';

export function SiteHeader({ activeId }: { activeId: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  return (
    <header className="site-header fixed top-0 inset-x-0 z-40" data-scrolled={scrolled}>
      <nav className="relative flex items-center px-5 md:px-[35px] py-5 md:py-[27px]" aria-label="Primary">
        <div className="flex items-center gap-[40px]">
          <a
            href="#top"
            className="font-graphik text-white text-[18px] md:text-[21px] leading-[21px] whitespace-nowrap anim-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            LŪMEN // ÍNDEX
          </a>
          <ul className="hidden xl:flex items-center gap-[40px]">
            {NAV_ITEMS.map((item, i) => {
              const active = item.id === activeId;
              return (
                <li key={item.id} className="anim-fade-up" style={{ animationDelay: `${350 + i * 100}ms` }}>
                  <a
                    href={`#${item.id}`}
                    className="nav-link group flex items-center gap-[3px] font-manrope text-[13px] leading-[15.6px]"
                    data-active={active}
                    aria-current={active ? 'location' : undefined}
                  >
                    <span className="text-ice/80 transition-colors group-hover:text-ice">{item.number}.</span>
                    <span className="nav-link__label text-white transition-colors group-hover:text-ice">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden xl:flex items-center ml-auto anim-slide-right" style={{ animationDelay: '600ms' }}>
          <WalletControl variant="header" />
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="xl:hidden ml-auto relative w-[40px] h-[40px] flex items-center justify-center anim-fade-in"
          style={{ animationDelay: '400ms' }}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="w-[22px] h-[22px] text-white" strokeWidth={1.5} />
        </button>
      </nav>

      <MobileMenu open={menuOpen} activeId={activeId} onClose={closeMenu} />
    </header>
  );
}
