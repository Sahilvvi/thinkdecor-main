import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export type TrustItem = { icon: LucideIcon; t: string };

export const pad = (n: number) => String(n).padStart(2, '0');

/** Live result of a CSS media query; false until mounted. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** True only on devices with a real hover-capable pointer. */
export function useFinePointer() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
