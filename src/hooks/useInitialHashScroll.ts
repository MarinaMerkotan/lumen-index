import { useEffect } from 'react';

/**
 * Deep links such as `/#governance` arrive before React renders the sections, so the browser's own
 * anchor jump finds nothing. After the first render, scroll to the target once (instantly).
 */
export function useInitialHashScroll(): void {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    // DOM is committed when effects run. 'instant' overrides the global smooth scroll-behavior for deep links.
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, []);
}
