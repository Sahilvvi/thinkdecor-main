import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AnimatePresence, motion, type MotionValue, useMotionTemplate, useMotionValueEvent,
  useReducedMotion, useScroll, useTransform,
} from 'framer-motion';
import { ArrowRight, Check, Download, ImagePlus } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { FREE_SIGNUP_CREDITS } from '@/lib/generation';
import { cn } from '@/lib/utils';
import { SectionLabel } from './primitives';
import { pad, useMediaQuery } from './hooks';

const BEFORE = '/assets/samples/empty_room.png';
const AFTER = '/assets/samples/styled_room.png';

const STEPS = [
  {
    key: 'upload',
    word: 'Upload.',
    title: 'Any phone photo of your room.',
    body: 'Straight-on and in daylight works best. No scanner, no tape measure, nothing to install.',
  },
  {
    key: 'style',
    word: 'Style.',
    title: `Pick from ${TEMPLATES.length} interior styles.`,
    body: 'Modern, Scandinavian, Japandi and more — each one a starting point you can push further.',
  },
  {
    key: 'refine',
    word: 'Refine.',
    title: 'Say what to change, in plain words.',
    body: '“Lighter floors, olive accents.” Mantha restyles the same photo and keeps your walls, windows and layout.',
  },
  {
    key: 'keep',
    word: 'Keep.',
    title: 'Every version saved to your library.',
    body: 'Compare looks side by side, regenerate for new variations and download the ones you love.',
  },
];

/* ------------------------------------------------------------------ *
 *  How it works — a pinned, full-screen dark story. Scrolling steps
 *  through four words while the app window scrubs the redesign in.
 * ------------------------------------------------------------------ */
export function ProcessStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
    setActive((cur) => (cur === next ? cur : next));
  });

  // The redesign wipes in across the "Refine" step.
  const hidden = useTransform(scrollYProgress, [0.5, 0.72], [100, 0]);
  const clipPath = useMotionTemplate`inset(0 ${hidden}% 0 0)`;
  const scanLeft = useTransform(hidden, (v) => `${100 - v}%`);
  const scanOpacity = useTransform(hidden, [0, 3, 97, 100], [0, 1, 1, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-12, 10]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 2, 8]);

  const step = STEPS[active];

  return (
    <section
      id="get-started"
      ref={ref}
      className="relative h-[360vh] bg-ink text-white lg:h-[420vh]"
    >
      <h2 className="sr-only">How ThinkDecor works</h2>

      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000,transparent)]" />
          <div className="absolute -right-40 top-1/4 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,hsl(162_72%_46%/0.16),transparent_65%)] blur-2xl" />
          <div className="absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,hsl(168_100%_25%/0.25),transparent_65%)] blur-2xl" />
        </div>

        <div className="container relative mx-auto flex h-full max-w-[1240px] flex-col px-6 pb-6 pt-20 sm:px-8 lg:pb-10 lg:pt-28">
          <div className="flex items-center justify-between text-white/55">
            <SectionLabel>How it works</SectionLabel>
            <span className="font-mono text-[11px] tabular-nums tracking-[0.2em]">
              {pad(active + 1)} / {pad(STEPS.length)}
            </span>
          </div>

          <div className="grid min-h-0 flex-1 content-center items-center gap-6 py-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.2em] text-mint">{pad(active + 1)}</p>
              <div className="relative mt-2 h-[1.12em] overflow-hidden text-[clamp(3rem,10vw,7.5rem)] font-bold leading-[1.05] tracking-[-0.05em]">
                <AnimatePresence initial={false}>
                  <motion.p
                    key={step.key}
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    {step.word}
                  </motion.p>
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="mt-3 text-[clamp(1.05rem,1.8vw,1.35rem)] font-medium text-white/85">{step.title}</p>
                  <p className="mt-3 hidden max-w-[42ch] text-[15px] leading-relaxed text-white/50 sm:block">{step.body}</p>
                </motion.div>
              </AnimatePresence>

              <Link
                to="/signup"
                className="group mt-8 hidden items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-ink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] lg:inline-flex"
              >
                Try it free — {FREE_SIGNUP_CREDITS} redesigns on us
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            <StoryVisual
              active={active}
              clipPath={clipPath}
              scanLeft={scanLeft}
              scanOpacity={scanOpacity}
              rotateX={rotateX}
              rotateY={rotateY}
            />
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-5">
            {STEPS.map((s, i) => (
              <StepBar
                key={s.key}
                progress={scrollYProgress}
                index={i}
                label={s.word.replace('.', '')}
                active={i === active}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepBar({
  progress, index, label, active,
}: { progress: MotionValue<number>; index: number; label: string; active: boolean }) {
  const fill = useTransform(progress, [index / STEPS.length, (index + 1) / STEPS.length], [0, 1]);
  return (
    <div>
      <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/15">
        <motion.div className="h-full origin-left bg-mint" style={{ scaleX: fill }} />
      </div>
      <p
        className={cn(
          'mt-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300',
          active ? 'text-white' : 'text-white/35',
        )}
      >
        <span className="tabular-nums sm:mr-2">{pad(index + 1)}</span>
        <span className="hidden sm:inline">{label}</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StoryVisual({
  active, clipPath, scanLeft, scanOpacity, rotateX, rotateY,
}: {
  active: number;
  clipPath: MotionValue<string>;
  scanLeft: MotionValue<string>;
  scanOpacity: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  // The scroll tilt pushes the window past the edge on narrow screens.
  const wide = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[640px] [perspective:1600px]">
      <motion.div
        style={reduce || !wide ? undefined : { rotateX, rotateY }}
        className="relative [transform-style:preserve-3d]"
      >
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.05] p-2 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-2 px-2 pb-2 pt-1">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="ml-2 min-w-0 truncate font-mono text-[10px] tracking-[0.12em] text-white/40">thinkdecor.app/app/create</span>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-mint">
              {active >= 2 ? 'Redesigned' : 'Original'}
            </span>
          </div>

          <div className="relative aspect-[2/1] overflow-hidden rounded-[14px] bg-black/40">
            <img
              src={BEFORE}
              alt="The original photo of an empty living room"
              loading="lazy"
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-[opacity,filter] duration-700',
                active === 0 ? 'opacity-40 blur-[2px]' : 'opacity-100',
              )}
            />
            <motion.div className="absolute inset-0" style={{ clipPath }}>
              <img src={AFTER} alt="The same living room redesigned by Mantha" loading="lazy" className="h-full w-full object-cover" />
            </motion.div>
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-[2px] -translate-x-1/2 bg-white shadow-[0_0_24px_4px_hsl(162_72%_50%/0.9)]"
              style={{ left: scanLeft, opacity: scanOpacity }}
            />
            <AnimatePresence>{active === 0 && <UploadOverlay key="upload" />}</AnimatePresence>
          </div>

          <div className="relative h-[64px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-x-0 top-2"
              >
                {active === 0 && <UploadRow />}
                {active === 1 && <StyleRow />}
                {active === 2 && <PromptRow />}
                {active === 3 && <LibraryRow />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          animate={{ opacity: active >= 2 ? 1 : 0, y: active >= 2 ? 0 : 10 }}
          transition={{ duration: 0.4 }}
          style={{ z: 80 }}
          className="absolute -left-4 top-[28%] hidden items-center gap-2 rounded-xl border border-white/15 bg-ink/90 px-3 py-2 text-[12px] text-white/85 shadow-2xl sm:flex"
        >
          <Check className="h-3.5 w-3.5 text-mint" />
          Walls &amp; windows kept
        </motion.div>
      </motion.div>
    </div>
  );
}

function UploadOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-3 flex items-center justify-center rounded-[10px] border-2 border-dashed border-white/35"
    >
      <motion.div
        initial={{ y: -40, opacity: 0, rotate: -8, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, rotate: -3, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.1 }}
        className="w-[34%] rounded-lg bg-white p-1 shadow-2xl"
      >
        <img src={BEFORE} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
      </motion.div>
    </motion.div>
  );
}

function UploadRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
      <ImagePlus className="h-4 w-4 flex-shrink-0 text-mint" />
      <span className="text-[12.5px] text-white/80">living-room.jpg</span>
      <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-mint"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Ready</span>
    </div>
  );
}

function StyleRow() {
  const picks = TEMPLATES.slice(0, 5);
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setSel((s) => (s + 1) % picks.length), 900);
    return () => clearInterval(id);
  }, [reduce, picks.length]);

  return (
    <div className="flex items-center gap-2">
      {picks.map((t, i) => (
        <div key={t.key} className="relative flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1.5">
          {i === sel && (
            <motion.span
              layoutId="story-style"
              className="absolute inset-0 rounded-lg border border-mint bg-mint/10"
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            />
          )}
          <img src={t.image} alt="" className="relative h-8 w-8 flex-shrink-0 rounded-md object-cover" />
          <span className="relative hidden truncate text-[11.5px] text-white/80 md:block">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

const PROMPT = 'Lighter floors, olive accents, warm oak panels';

function PromptRow() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? PROMPT.length : 0);

  useEffect(() => {
    if (reduce || typed >= PROMPT.length) return;
    const t = setTimeout(() => setTyped(typed + 1), 36);
    return () => clearTimeout(t);
  }, [typed, reduce]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] py-1.5 pl-3 pr-1.5">
      <p className="min-w-0 flex-1 truncate text-[12.5px] text-white/80">
        {PROMPT.slice(0, typed)}
        <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-pulse bg-white/70" />
      </p>
      <span className="flex-shrink-0 rounded-lg bg-mint px-3 py-1.5 text-[11.5px] font-semibold text-ink">Generate</span>
    </div>
  );
}

function LibraryRow() {
  const thumbs = [AFTER, '/assets/samples/1.jpg', '/assets/samples/6.jpg'];
  return (
    <div className="flex items-center gap-2">
      {thumbs.map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt=""
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
          className="h-11 w-16 rounded-lg border border-white/10 object-cover sm:w-20"
        />
      ))}
      <span className="ml-1 hidden text-[11.5px] text-white/50 sm:block">3 versions saved</span>
      <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11.5px] font-semibold text-ink">
        <Download className="h-3.5 w-3.5" />
        Download
      </span>
    </div>
  );
}
