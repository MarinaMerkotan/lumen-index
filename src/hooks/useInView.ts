import { RefObject, useEffect, useState } from 'react';

interface Options {
  rootMargin?: string;
  threshold?: number;
  /** Stop observing after the first intersection. */
  once?: boolean;
}

export function useInView<T extends Element>(
  ref: RefObject<T>,
  { rootMargin = '0px', threshold = 0, once = false }: Options = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
