import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, type MotionValue, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion';
import { ArrowDown, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Magnetic, Reveal, RevealWords, Stagger, staggerItem } from '@/components/premium/Motion';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';
import { cn } from '@/lib/utils';
import { type TrustItem, useFinePointer } from './hooks';

const BEFORE = '/assets/samples/empty_room.png';
const AFTER = '/assets/samples/styled_room.png';
const DEFAULT_PROMPT = 'Modern, warm oak panels, olive accents';

/* ------------------------------------------------------------------ *
 *  Hero — headline on the left, a single room card centred on the
 *  right that tilts toward the cursor. The card's photo is the site's
 *  usual before/after slider, defaulting to a centred split; pressing
 *  Generate runs a simulated pass with a shimmer across it.
 * ------------------------------------------------------------------ */
export function HeroStage({ trust }: { trust: TrustItem[] }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const interactive = fine && !reduce;

  // Pointer position over the hero: normalised for tilt, pixels for the spotlight.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 70, damping: 16, mass: 0.7 });
  const sy = useSpring(my, { stiffness: 70, damping: 16, mass: 0.7 });
  const lightX = useMotionValue(-999);
  const lightY = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${lightX}px ${lightY}px, hsl(168 100% 17% / 0.06), transparent 70%)`;

  return (
    <section
      onPointerMove={(e) => {
        if (!interactive) return;
        const r = e.currentTarget.getBoundingClientRect();
        lightX.set(e.clientX - r.left);
        lightY.set(e.clientY - r.top);
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative overflow-hidden bg-background pb-12 pt-28 lg:pb-16 lg:pt-36"
    >
      <HeroLighting spotlight={spotlight} interactive={interactive} reduce={Boolean(reduce)} />

      <div className="container relative z-10 mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          <div>
            <h1 className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.05em] text-foreground">
              <RevealWords text="Measure." className="block" delay={0.1} />
              <RevealWords text="Understand." className="block" delay={0.2} />
              <RevealWords
                text="Design."
                className="text-shimmer block bg-[linear-gradient(100deg,hsl(160_84%_38%),hsl(168_90%_24%)_35%,hsl(168_100%_17%)_55%,hsl(160_84%_38%)_80%)] bg-clip-text text-transparent"
                delay={0.3}
              />
            </h1>

            <Reveal delay={0.45} className="mt-7">
              <p className="max-w-[46ch] text-[16.5px] leading-relaxed text-foreground/60">
                Upload a photo of any room and Mantha AI redesigns it in the style you
                choose — in seconds. Room scanning and measured plans are coming soon.
              </p>
            </Reveal>

            <Reveal delay={0.55} className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-primary py-2 pl-7 pr-2 text-[15px] font-semibold text-primary-foreground shadow-[0_20px_46px_-14px_hsl(168_100%_17%/0.5)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                  />
                  <span className="relative">Try it free</span>
                  {/* Two arrows on a rail: the first slides out, the next slides in. */}
                  <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/15">
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-7" />
                    <ArrowRight className="absolute h-4 w-4 -translate-x-7 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
                  </span>
                </Link>
              </Magnetic>
              <a
                href="#get-started"
                className="group relative inline-flex items-center overflow-hidden rounded-full border border-foreground/15 bg-white/60 px-7 py-4 text-[14.5px] font-semibold text-foreground backdrop-blur transition-[border-color,color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-[0_0_0_4px_hsl(168_100%_17%/0.06),0_14px_30px_-18px_hsl(168_100%_17%/0.5)] active:translate-y-0 active:scale-[0.98]"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,hsl(168_100%_17%/0.07),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative">See how it works</span>
              </a>
            </Reveal>

            <Stagger className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {trust.map(({ icon: Icon, t }) => (
                <motion.span
                  key={t}
                  variants={staggerItem}
                  className="group flex items-center gap-2 text-[13px] text-foreground/50 transition-colors duration-300 hover:text-foreground/80"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/[0.1] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-3 w-3 text-primary" />
                  </span>
                  {t}
                </motion.span>
              ))}
            </Stagger>
          </div>

          <Reveal delay={0.2} y={40} blur={16}>
            <RoomStage sx={sx} sy={sy} />
          </Reveal>
        </div>

        <Stagger
          className="mt-12 hidden items-center justify-between border-t border-foreground/[0.08] pt-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-foreground/45 lg:flex"
          gap={0.12}
        >
          <motion.a variants={staggerItem} href="#get-started" className="group flex items-center gap-3 transition-colors hover:text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/15 transition-colors group-hover:border-primary/40">
              <motion.span
                animate={reduce ? undefined : { y: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </motion.span>
            </span>
            Scroll to explore
          </motion.a>
          <motion.span variants={staggerItem} className="flex items-center gap-2.5">
            <PulseDot reduce={Boolean(reduce)} />
            Photo in · redesign out
          </motion.span>
          <motion.span variants={staggerItem} className="flex items-center gap-2.5">
            <PulseDot reduce={Boolean(reduce)} delay={0.8} />
            Interactive · move your cursor
          </motion.span>
        </Stagger>
      </div>
    </section>
  );
}

function PulseDot({ reduce, delay = 0 }: { reduce: boolean; delay?: number }) {
  return (
    <span aria-hidden className="relative flex h-1.5 w-1.5">
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/60"
          animate={{ scale: [1, 2.4, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      )}
      <span className="relative h-1.5 w-1.5 rounded-full bg-primary/80" />
    </span>
  );
}

/* ------------------------------------------------------------------ */

function HeroLighting({
  spotlight, interactive, reduce,
}: { spotlight: MotionValue<string>; interactive: boolean; reduce: boolean }) {
  const drift = (duration: number) => ({ duration, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* soft drifting light */}
      <motion.div
        className="absolute -right-48 -top-72 h-[48rem] w-[56rem] rounded-full bg-[radial-gradient(ellipse,hsl(168_100%_17%/0.13),transparent_62%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, -60, 20], y: [0, 40, -20], scale: [1, 1.06, 0.97] }}
        transition={drift(18)}
      />
      <motion.div
        className="absolute -left-56 top-1/3 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,hsl(160_84%_45%/0.08),transparent_65%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, 50, -10], y: [0, -30, 30] }}
        transition={drift(22)}
      />

      {/* faint grid behind the stage */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_65%_40%,#000,transparent)]" />

      {/* receding grid floor */}
      <div className="absolute inset-x-[-40%] bottom-[-6%] h-[55%] [mask-image:linear-gradient(to_top,#000_5%,transparent_80%)] [transform-origin:bottom] [transform:perspective(900px)_rotateX(64deg)]">
        <div className="grid-flow absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.07)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.07)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {interactive && <motion.div className="absolute inset-0" style={{ background: spotlight }} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** A single centred card that tilts toward the cursor; the two badges float around it. */
function RoomStage({ sx, sy }: { sx: MotionValue<number>; sy: MotionValue<number> }) {
  const reduce = useReducedMotion();

  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const chipX = useTransform(sx, [-0.5, 0.5], [-16, 16]);
  const chipY = useTransform(sy, [-0.5, 0.5], [-12, 12]);

  const breathe = reduce ? undefined : { y: [0, -4, 0] };

  return (
    <div className="relative mx-auto w-full max-w-[560px] [perspective:1600px]">
      <div aria-hidden className="absolute inset-x-[10%] -bottom-3 h-8 rounded-[50%] bg-[hsl(168_40%_15%/0.22)] blur-2xl" />

      <motion.div className="relative [transform-style:preserve-3d]" style={{ rotateX, rotateY }}>
        <TransformCard />

        {/* Floating pill — cursor parallax outside, slow breathing inside.
            Pinned by a fixed pixel offset (not a % of the card), so it always
            hangs off the top edge of the photo without drifting onto it. */}
        <motion.div style={{ x: chipX, y: chipY, z: 60 }} className="pointer-events-none absolute -left-5 top-9 hidden sm:block">
          <motion.div
            animate={breathe}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-2 rounded-xl border border-foreground/[0.08] bg-white/95 px-3 py-2 text-[12px] font-medium text-foreground shadow-[0_18px_40px_-18px_hsl(168_30%_15%/0.35)]"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
              <Check className="h-2.5 w-2.5 text-primary-foreground" />
            </span>
            Walls &amp; windows kept
          </motion.div>
        </motion.div>

        {/* Pushed well clear of the card's bottom edge — it used to sit
            almost on top of the Generate button, hiding its state changes. */}
        <motion.div style={{ x: chipX, y: chipY, z: 80 }} className="pointer-events-none absolute -bottom-12 -right-3 hidden sm:block">
          <motion.div
            animate={breathe}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="rounded-xl bg-primary px-3.5 py-2 text-primary-foreground shadow-[0_18px_40px_-14px_hsl(168_100%_17%/0.6)]"
          >
            <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-primary-foreground/65">Style</span>
            <span className="block text-[14px] font-semibold">Modern</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Your room photo with the site's usual before/after slider — drag the
 * handle (it starts centred) to compare. Generate runs a simulated pass:
 * a shimmer sweeps across the image while it "restyles", then settles.
 */
function TransformCard() {
  const reduce = useReducedMotion();
  const [generating, setGenerating] = useState(false);
  const [focused, setFocused] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  useEffect(() => {
    if (!generating) return;
    const t = setTimeout(() => setGenerating(false), 1700);
    return () => clearTimeout(t);
  }, [generating]);

  return (
    <div className="rounded-[22px] border border-foreground/[0.08] bg-white p-2.5 shadow-[0_40px_90px_-30px_hsl(168_30%_12%/0.45)]">
      <div className="flex items-center justify-between px-2 pb-2.5 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
        <span>Living room · your photo</span>
        <span className="flex items-center gap-1.5 text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className={cn('absolute inset-0 rounded-full bg-primary/60', !reduce && 'animate-ping')} />
            <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Mantha
        </span>
      </div>

      <div
        className={cn(
          'relative overflow-hidden rounded-[14px] transition-[filter] duration-500',
          generating && 'pointer-events-none blur-[1px] saturate-[0.85]',
        )}
      >
        <BeforeAfterSlider
          beforeSrc={BEFORE}
          afterSrc={AFTER}
          beforeAlt="The original photo: an empty living room"
          afterAlt="The same room redesigned in a modern style"
          aspectRatio="aspect-[859/344]"
        />

        {/* loading shimmer while a generation is running */}
        {generating && !reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.65),transparent)]"
            animate={{ x: ['0%', '400%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <span
          aria-live="polite"
          className={cn(
            'pointer-events-none absolute left-1/2 top-2.5 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-primary-foreground transition-opacity duration-300',
            generating ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
          Restyling your room
        </span>
      </div>

      <div className="flex items-center gap-2 px-2 pb-1 pt-2.5">
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-0.5 rounded-lg px-1.5 py-1 transition-all duration-300',
            focused ? 'bg-primary/[0.06] ring-1 ring-primary/30' : 'hover:bg-foreground/[0.03]',
          )}
        >
          <span aria-hidden className="text-[12px] text-foreground/40">“</span>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setGenerating(true); }}
            aria-label="Redesign prompt"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground/65 outline-none placeholder:text-foreground/35"
            placeholder={DEFAULT_PROMPT}
          />
          <span aria-hidden className="text-[12px] text-foreground/40">”</span>
        </div>

        <button
          type="button"
          onClick={() => setGenerating(true)}
          disabled={generating}
          className="ml-auto flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[10.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-80"
        >
          {generating && <Loader2 className="h-3 w-3 animate-spin" />}
          {generating ? 'Generating' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
