import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, AnimatePresence, useInView, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion';
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
  const reduce = useReducedMotion();
  const [style, setStyle] = useState(1);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  // A one-time nudge on the handle once the card is in view, hinting it's draggable.
  const [hinted, setHinted] = useState(false);
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setTimeout(() => setHinted(true), 500);
    return () => clearTimeout(t);
  }, [inView, reduce]);

  // Cursor tilt on the whole card, same treatment the other visual cards use.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [4, -4]), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-4, 4]), { stiffness: 180, damping: 20 });

  const setFromEvent = useCallback((clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(88, Math.max(12, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <section id="generator" className="relative scroll-mt-24 overflow-hidden border-y border-foreground/[0.07] py-16 lg:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_75%_45%,#000,transparent)]" />
        <div className="absolute -right-32 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(168_100%_17%/0.08),transparent_65%)] blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-[1200px] px-6 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          {/* ---------- copy ---------- */}
          <div>
            <Reveal>
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Available now
              </p>
              <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.025em] text-foreground">
                Design Generator
              </h2>
              <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-foreground/58">
                Upload a photo of the space and try it in different styles and palettes —
                the same room, restyled. No render queue, no waiting hours. Results arrive
                in seconds.
              </p>
            </Reveal>

            <Reveal delay={0.12} className="mt-8 space-y-3">
              {[
                { icon: Zap, t: 'Instant, not queued', d: 'Concepts appear in seconds, not hours of rendering.' },
                { icon: Wand2, t: 'Many configurations', d: 'Compare styles side by side before committing.' },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.t}
                    className="group flex items-start gap-4 rounded-2xl border border-foreground/[0.09] bg-foreground/[0.025] p-4 backdrop-blur-xl transition-all duration-400 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-[0_16px_36px_-22px_hsl(168_30%_15%/0.4)]"
                  >
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
                  to="/signup"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-[14.5px] font-semibold text-primary-foreground shadow-[0_14px_32px_-12px_hsl(168_100%_17%/0.45)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <span className="relative">Try it free</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
            </Reveal>
          </div>

          {/* ---------- visual ---------- */}
          <Reveal y={36} blur={16}>
            <div className="[perspective:1400px]">
              <motion.div
                style={reduce ? undefined : { rotateX, rotateY }}
                onPointerMove={(e) => {
                  if (reduce) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  px.set((e.clientX - r.left) / r.width);
                  py.set((e.clientY - r.top) / r.height);
                }}
                onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
                className="relative [transform-style:preserve-3d]"
              >
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

                  {/* generated style, clipped past the seam.
                      The ±6% offset (not ±9) is deliberate: on this 4:3 box it
                      produces the same diagonal as the glowing line's actual
                      -9deg skewX below — matching offsets here made the clip cut
                      diagonal noticeably steeper than the line drawn over it. */}
                  <div style={{ clipPath: `polygon(${split + 6}% 0, 100% 0, 100% 100%, ${split - 6}% 100%)` }} className="absolute inset-0">
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
                  <motion.button
                    aria-label="Drag to compare original and generated design"
                    onMouseDown={(e) => { e.preventDefault(); dragging.current = true; setHinted(false); }}
                    onTouchStart={() => { dragging.current = true; setHinted(false); }}
                    animate={hinted ? { left: [`${split}%`, `${split - 12}%`, `${split + 8}%`, `${split}%`] } : undefined}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                    onAnimationComplete={() => setHinted(false)}
                    className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-[3px] border-white bg-primary shadow-[0_0_30px_hsl(160_84%_45%/0.6)] transition-transform hover:scale-110 active:scale-95"
                    style={!hinted ? { left: `${split}%` } : undefined}
                  >
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-[3px] rotate-180 text-primary-foreground" />
                    <ArrowRight className="h-3.5 w-3.5 -translate-x-[1px] text-primary-foreground" />
                  </motion.button>

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
                        className={`relative rounded-full px-3.5 py-2 text-[12px] font-medium backdrop-blur-md transition-all duration-300 ${
                          style === i
                            ? 'text-primary-foreground'
                            : 'border border-foreground/15 bg-black/38 text-foreground/70 hover:scale-[1.04] hover:text-foreground'
                        }`}
                      >
                        {style === i && (
                          <motion.span
                            layoutId="gen-style-pill"
                            className="absolute inset-0 rounded-full bg-primary shadow-[0_0_18px_-2px_hsl(168_100%_17%/0.8)]"
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                          />
                        )}
                        <span className="relative">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* soft ground shadow reinforcing the tilt/lift */}
                <div aria-hidden className="pointer-events-none absolute inset-x-[10%] -bottom-4 -z-10 h-8 rounded-[50%] bg-[hsl(168_40%_15%/0.16)] blur-2xl" />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
