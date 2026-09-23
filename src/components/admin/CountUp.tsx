import { useEffect, useRef, useState } from 'react';

/** Animated number, matching the mockup's data-count ease-out count-up. Re-triggers whenever `value` changes. */
export function CountUp({ value, prefix = '', duration = 1100 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    if (!value) { setDisplay(0); return; }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{prefix}{display.toLocaleString('en-GB')}</>;
}
