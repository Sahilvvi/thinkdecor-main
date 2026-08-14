import { useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ArrowRight, Wand2, Zap } from 'lucide-react';
import { Reveal, Magnetic } from './Motion';

const STYLES = [
  { id: 'scandi', label: 'Scandinavian', img: '/assets/samples/1.jpg' },
  { id: 'modern', label: 'Modern', img: '/assets/samples/styled_room.png' },
  { id: 'classic', label: 'Classic', img: '/assets/samples/3.jpg' },
  { id: 'minimal', label: 'Minimal', img: '/assets/samples/5.jpg' },
];

/** Design Generator — one room, instantly re-styled, split across a diagonal seam. */
export function DesignGenerator() {
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, { once: true, margin: '-12% 0px' });
  const [style, setStyle] = useState(1);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  const setFromEvent = useCallback((clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(88, Math.max(12, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <section id="generator" className="scroll-mt-24 border-y border-foreground/[0.07] py-16 lg:py-20">
      <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          {/* ---------- copy ---------- */}
          <div>
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Instant results</p>
              <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.025em] text-foreground">
                Design Generator
              </h2>
              <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-foreground/58">
                Upload a photo of the space and get a plethora of configurations back —
                different styles, layouts and palettes for the same room. No render queue,
                no waiting hours. The results are instant.
              </p>
            </Reveal>

            <Reveal delay={0.12} className="mt-8 space-y-3">
              {[
                { icon: Zap, t: 'Instant, not queued', d: 'Concepts appear in seconds, not hours of rendering.' },
                { icon: Wand2, t: 'Many configurations', d: 'Compare styles side by side before committing.' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.t} className="group flex items-start gap-4 rounded-2xl border border-foreground/[0.09] bg-foreground/[0.025] p-4 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:bg-primary/[0.04]">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary">
                      <Icon className="h-4 w-4 text-primary transition-colors duration-500 group-hover:text-primary-foreground" />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-medium text-foreground">{f.t}</span>
                      <span className="mt-0.5 block text-[13px] text-foreground/55">{f.d}</span>
                    </span>
                  </div>
                );
              })}
            </Reveal>

            <Reveal delay={0.2} className="mt-8">
              <Magnetic>
                <Link
                  to="/demo"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-[14.5px] font-semibold text-primary-foreground shadow-[0_14px_32px_-12px_hsl(168_100%_17%/0.45)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  Learn more about Design Generator
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </Reveal>
          </div>

          {/* ---------- visual ---------- */}
          <Reveal y={36} blur={16}>
            <div
              ref={boxRef}
              onMouseMove={(e) => dragging.current && setFromEvent(e.clientX)}
              onMouseUp={() => { dragging.current = false; }}
              onMouseLeave={() => { dragging.current = false; }}
              onTouchMove={(e) => dragging.current && setFromEvent(e.touches[0].clientX)}
              onTouchEnd={() => { dragging.current = false; }}
              className="relative aspect-[4/3] select-none overflow-hidden rounded-[26px] border border-foreground/[0.10] bg-white shadow-[0_30px_80px_-24px_hsl(168_30%_15%/0.20)]"
            >
              {/* original room */}
              <img
                src="/assets/samples/empty_room.png"
                alt="Original room"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* generated style, clipped past the seam */}
              <div style={{ clipPath: `polygon(${split + 9}% 0, 100% 0, 100% 100%, ${split - 9}% 100%)` }} className="absolute inset-0">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={STYLES[style].id}
                    src={STYLES[style].img}
                    alt={`${STYLES[style].label} concept`}
                    draggable={false}
                    initial={{ opacity: 0, scale: 1.05, filter: 'blur(14px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

              {/* seam */}
              <div
                className="pointer-events-none absolute inset-y-0 w-[3px] bg-gradient-to-b from-[hsl(160_84%_55%)] via-[hsl(160_84%_45%)] to-[hsl(168_100%_25%)] shadow-[0_0_28px_hsl(160_84%_45%/0.85)]"
                style={{ left: `${split}%`, transform: 'skewX(-9deg)' }}
              />
              <button
                aria-label="Drag to compare original and generated design"
                onMouseDown={(e) => { e.preventDefault(); dragging.current = true; }}
                onTouchStart={() => { dragging.current = true; }}
                className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-[3px] border-white bg-primary shadow-[0_0_30px_hsl(160_84%_45%/0.6)] transition-transform hover:scale-110 active:scale-95"
                style={{ left: `${split}%` }}
              >
                <ArrowRight className="h-3.5 w-3.5 -translate-x-[3px] rotate-180 text-primary-foreground" />
                <ArrowRight className="h-3.5 w-3.5 -translate-x-[1px] text-primary-foreground" />
              </button>

              <span className="absolute left-5 top-5 rounded-full border border-foreground/15 bg-black/42 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70 backdrop-blur-md">
                Your photo
              </span>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="absolute right-5 top-5 rounded-full border border-primary/40 bg-primary/85 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground backdrop-blur-md"
              >
                Generated
              </motion.span>

              {/* style switcher */}
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap justify-center gap-2">
                {STYLES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(i)}
                    className={`relative rounded-full px-3.5 py-2 text-[12px] font-medium backdrop-blur-md transition-colors duration-300 ${
                      style === i ? 'text-primary-foreground' : 'border border-foreground/15 bg-black/38 text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {style === i && (
                      <motion.span
                        layoutId="gen-style-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                      />
                    )}
                    <span className="relative">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
