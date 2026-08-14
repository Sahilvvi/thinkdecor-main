import { useEffect, useState } from 'react';
import { Scan, Bot, Ruler, Percent } from 'lucide-react';

const objects = [
  { icon: Scan, label: 'AR Visualization', pos: 'top-[20%] left-[5%]', depth: 30, delay: '0s', live: false },
  { icon: Bot, label: 'Mantha AI', pos: 'top-[24%] right-[6%]', depth: 45, delay: '1.2s', live: true },
  { icon: Ruler, label: 'Smart Measurement', pos: 'bottom-[26%] left-[8%]', depth: 40, delay: '2.1s', live: false },
  { icon: Percent, label: '0% Commission', pos: 'bottom-[22%] right-[9%]', depth: 25, delay: '0.7s', live: false },
];

/** Parallax glass objects floating over the hero video. */
export function HeroFloatingObjects() {
  const [m, setM] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setM({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none hidden lg:block">
      {objects.map((o) => {
        const Icon = o.icon;
        return (
          <div
            key={o.label}
            className={`absolute ${o.pos} transition-transform duration-300 ease-out will-change-transform`}
            style={{ transform: `translate(${m.x * o.depth}px, ${m.y * o.depth}px)` }}
          >
            <div className="glass rounded-2xl px-4 py-3 shadow-xl border border-border/40 float" style={{ animationDelay: o.delay }}>
              <div className="flex items-center gap-2.5">
                <span className="relative w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                  {o.live && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success animate-pulse" />}
                </span>
                <span className="text-sm font-semibold text-foreground/90">{o.label}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
