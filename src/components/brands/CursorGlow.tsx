import { useEffect, useRef } from 'react';

/** Soft teal glow that trails the cursor across the whole page. */
export function CursorGlow() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let tx = -600, ty = -600, x = tx, y = ty, raf = 0;
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      node.style.transform = `translate(${x - 250}px, ${y - 250}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={el}
      aria-hidden="true"
      className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none z-[1] hidden lg:block"
      style={{ background: 'radial-gradient(circle, hsl(168 100% 30% / 0.07) 0%, transparent 60%)' }}
    />
  );
}
