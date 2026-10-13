import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../content/navigation';
import { WalletControl } from '../../features/wallet/WalletControl';

const EASE = 'ease-[cubic-bezier(0.76,0,0.24,1)]';

interface MobileMenuProps {
  open: boolean;
  activeId: string | null;
  /** `restoreFocus` is true when closed without navigating (Escape, close button, backdrop). */
  onClose: (restoreFocus: boolean) => void;
}

export function MobileMenu({ open, activeId, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(true);
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      // Keep keyboard focus inside the open menu.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia('(min-width: 1280px)');
    const onBreakpoint = () => {
      if (desktop.matches) onClose(false);
    };

    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      // Visible immediately on open (so focus can move in); hidden only after the close transition.
      className={`fixed inset-0 z-50 xl:hidden ${open ? 'visible' : 'invisible [transition:visibility_0s_linear_500ms]'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500 ${EASE} ${open ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
        onClick={() => onClose(true)}
      />
      <div
        ref={panelRef}
        className={`relative h-full flex flex-col px-5 md:px-[35px] pt-24 pb-10 overflow-y-auto transition-[opacity,transform] duration-500 ${EASE} ${open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <button
          ref={closeRef}
          type="button"
          className="absolute top-5 md:top-[27px] right-5 md:right-[35px] w-[40px] h-[40px] flex items-center justify-center"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => onClose(true)}
        >
          <X className="w-[22px] h-[22px] text-white" strokeWidth={1.5} />
        </button>

        <ul className="flex flex-col gap-8">
          {NAV_ITEMS.map((item, i) => (
            <li
              key={item.id}
              className={`transition-[opacity,transform] duration-500 ${EASE} ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
              style={{ transitionDelay: open ? `${150 + i * 75}ms` : '0ms' }}
            >
              <a
                href={`#${item.id}`}
                tabIndex={open ? 0 : -1}
                onClick={() => onClose(false)}
                aria-current={item.id === activeId ? 'location' : undefined}
                className="group flex items-center gap-3"
              >
                <span className="font-manrope text-ice/80 text-[14px] leading-[1]">{item.number}.</span>
                <span className="font-manrope text-white text-[28px] leading-[1.2] tracking-tight transition-colors group-hover:text-ice group-aria-[current=location]:text-ice">
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div
          className={`mt-auto pt-10 border-t border-white/10 transition-[opacity,transform] duration-500 ${EASE} ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: open ? '450ms' : '0ms' }}
        >
          {open && <WalletControl variant="stacked" block />}
        </div>
      </div>
    </div>
  );
}
