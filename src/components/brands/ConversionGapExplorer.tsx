import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, TrendingDown, PackageX, Store, MousePointerClick, FileImage,
  ArrowRight, Sparkles, Package, Home, MousePointer2, BadgeCheck,
  X, Check, ChevronLeft, ChevronRight, Play, Pause,
  ShoppingCart, Wallet, Timer, Layers,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { TiltCard } from './TiltCard';

const pillLabels = ['Visualization', 'Conversions', 'Returns', 'Marketplace', 'Engagement', 'Catalogues'];

const problems = [
  { icon: Eye, title: 'Customers can’t visualize products', text: 'Shoppers stare at a flat photo and try to imagine it in their room. Most give up.' },
  { icon: TrendingDown, title: 'Low online conversions', text: 'Uncertainty kills purchase intent — browsers leave without buying.' },
  { icon: PackageX, title: 'High product returns', text: '“Looked different at home” comes straight back, at your cost.' },
  { icon: Store, title: 'Marketplace dependence', text: 'Third-party marketplaces eat margins and own your customer.' },
  { icon: MousePointerClick, title: 'Limited engagement', text: 'Static pages give customers nothing to interact with.' },
  { icon: FileImage, title: 'Static catalogues', text: 'Flat images can’t answer “will this work in my room?”' },
];

/* ---------------- Shared scene primitives ---------------- */

/** Smoothly counts between the two states instead of hard-swapping the number. */
function AnimatedStat({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    const dur = 750;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toFixed(decimals)}{suffix}</>;
}

/** Full-bleed room photo that dims + desaturates in the "Without" state and turns vivid in "With". */
function SceneShell({ src, on, children }: { src: string; on: boolean; children: ReactNode }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={src}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${
          on ? 'scale-[1.06] saturate-100 brightness-100 blur-0' : 'scale-100 saturate-[.3] brightness-[.45] blur-[2px]'
        }`}
      />
      {/* legibility gradient anchored to the panel corner */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/45 to-black/10" />
      {/* state-coloured glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${on ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(130% 100% at 12% 105%, hsl(168 100% 24% / 0.42), transparent 60%)' }} />
      <div className={`absolute inset-0 transition-opacity duration-1000 ${on ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'radial-gradient(120% 90% at 50% 0%, hsl(0 72% 45% / 0.22), transparent 55%)' }} />
      {children}
    </div>
  );
}

const panel = 'absolute rounded-2xl bg-black/38 backdrop-blur-xl border border-foreground/15 shadow-2xl';

/* ---------------- Scenes ---------------- */

function SceneVisualize({ on }: { on: boolean }) {
  const tags = on
    ? [{ t: 'Scale-accurate', x: '9%', y: '16%' }, { t: 'True-to-life lighting', x: '52%', y: '30%' }, { t: 'Perfect match', x: '58%', y: '58%' }]
    : [{ t: 'Will it fit?', x: '9%', y: '16%' }, { t: 'Wrong shade?', x: '52%', y: '30%' }, { t: 'Too big?', x: '58%', y: '58%' }];
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src="/assets/samples/empty_room.png" alt="" className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${on ? 'opacity-0 scale-110' : 'opacity-100 saturate-[.4] brightness-[.55] blur-[1px]'}`} />
      <img src="/assets/samples/styled_room.png" alt="" className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${on ? 'opacity-100 scale-[1.04]' : 'opacity-0 scale-95'}`} />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/35 to-black/10" />
      <div className={`absolute inset-0 transition-opacity duration-1000 ${on ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(130% 100% at 12% 105%, hsl(168 100% 24% / 0.35), transparent 60%)' }} />
      <AnimatePresence>
        {tags.map((tag, i) => (
          <motion.span
            key={`${on}-${tag.t}`}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: i * 0.15, y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 } }}
            style={{ top: tag.y, left: tag.x }}
            className={`absolute flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xl ${
              on ? 'bg-primary/90 border-primary/60 text-primary-foreground' : 'bg-black/38 border-foreground/20 text-foreground'
            }`}
          >
            {on ? <BadgeCheck className="h-3.5 w-3.5" /> : <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />}
            {tag.t}
          </motion.span>
        ))}
      </AnimatePresence>
      <div className={`${panel} left-4 bottom-4 right-4 sm:right-auto sm:w-[300px] p-3.5`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full animate-pulse ${on ? 'bg-success' : 'bg-destructive'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${on ? 'text-success' : 'text-destructive'}`}>{on ? 'AI render' : 'Guesswork'}</span>
        </div>
        <p className="text-sm font-bold text-foreground leading-snug">{on ? 'Rendered in the customer’s real room' : 'A flat photo they have to imagine'}</p>
        <div className="mt-2.5">
          <div className="flex justify-between text-[9px] text-foreground/65 mb-1">
            <span>Buyer confidence</span>
            <span className={on ? 'text-success font-bold' : 'text-destructive font-bold'}>{on ? '94%' : '21%'}</span>
          </div>
          <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <motion.div animate={{ width: on ? '94%' : '21%' }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className={`h-full rounded-full ${on ? 'bg-gradient-to-r from-primary to-accent' : 'bg-destructive'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneConversions({ on }: { on: boolean }) {
  const down = 'M0,18 C30,24 60,40 100,54 S170,74 200,82';
  const up = 'M0,82 C30,74 60,52 100,34 S170,8 200,4';
  return (
    <SceneShell src="/assets/samples/1.jpg" on={on}>
      <AnimatePresence mode="wait">
        {on ? (
          <motion.div key="win" initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            className="absolute top-5 right-5 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/90 border border-primary/60 text-primary-foreground text-xs font-bold shadow-glow">
            <ShoppingCart className="h-4 w-4" /> Order placed
          </motion.div>
        ) : (
          <motion.div key="lose" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-5 right-5 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/42 border border-destructive/40 text-destructive text-xs font-bold backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> Cart abandoned
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`${panel} left-4 bottom-4 right-4 sm:right-auto sm:w-[320px] p-4`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/65">Conversion rate</span>
          <span className={`flex items-center gap-1 text-[11px] font-bold ${on ? 'text-success' : 'text-destructive'}`}>
            <TrendingDown className={`h-3.5 w-3.5 transition-transform ${on ? 'rotate-180' : ''}`} /> {on ? 'trending up' : 'trending down'}
          </span>
        </div>
        <div className="flex items-end gap-2 mb-1">
          <span className={`text-4xl font-extrabold tabular-nums leading-none ${on ? 'text-foreground' : 'text-foreground/70'}`}>
            <AnimatedStat value={on ? 8.7 : 2.1} decimals={1} suffix="%" />
          </span>
          <span className="text-[10px] text-foreground/58 mb-1">of visitors buy</span>
        </div>
        <svg viewBox="0 0 200 90" preserveAspectRatio="none" className="w-full h-12">
          <motion.path key={on ? 'u' : 'd'} d={on ? up : down} fill="none"
            stroke={on ? 'hsl(160 84% 45%)' : 'hsl(0 72% 55%)'} strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
      </div>
    </SceneShell>
  );
}

function SceneReturns({ on }: { on: boolean }) {
  return (
    <SceneShell src="/assets/samples/5.jpg" on={on}>
      <div className={`${panel} left-4 right-4 bottom-4 p-4`}>
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/65">Return rate</p>
            <p className={`text-3xl font-extrabold tabular-nums leading-none mt-0.5 ${on ? 'text-success' : 'text-destructive'}`}>
              <AnimatedStat value={on ? 6 : 32} suffix="%" />
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border text-right ${on ? 'bg-success/15 border-success/30 text-success' : 'bg-destructive/15 border-destructive/30 text-destructive'}`}>
            {on ? 'Delivered once, kept for good' : 'Shipped… returned… repeat'}
          </span>
        </div>
        <div className="relative h-10">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-foreground/15" />
          <span className="absolute left-0 -top-0.5 text-[9px] uppercase tracking-wider text-foreground/58">Warehouse</span>
          <span className="absolute right-0 -top-0.5 text-[9px] uppercase tracking-wider text-foreground/58">Home</span>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`${on}-${i}`}
              initial={{ left: '6%' }}
              animate={on ? { left: '88%' } : { left: ['6%', '80%', '8%'] }}
              transition={on
                ? { duration: 1.4, delay: i * 0.2, ease: 'easeInOut' }
                : { duration: 3.2, delay: i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ zIndex: 3 - i }}
            >
              <div className={`w-9 h-9 rounded-xl border-2 grid place-items-center shadow-xl ${on ? 'border-success/60 bg-success/20' : 'border-destructive/60 bg-destructive/20'}`}>
                {on ? <Home className="h-4 w-4 text-success" /> : <Package className="h-4 w-4 text-destructive" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
}

function SceneMarketplace({ on }: { on: boolean }) {
  return (
    <SceneShell src="/assets/samples/2.jpg" on={on}>
      <AnimatePresence>
        {!on && ['−20% platform fee', '−12% commission'].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: 50 + i * 22, y: -34 - i * 24 }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
            className="absolute right-10 bottom-36 px-2.5 py-1 rounded-md bg-destructive/85 text-foreground text-[10px] font-bold shadow-lg"
          >
            {t}
          </motion.div>
        ))}
      </AnimatePresence>
      <div className={`${panel} left-4 bottom-4 right-4 sm:right-auto sm:w-[360px] p-4`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/65">You keep, per sale</span>
          <Wallet className={`h-4 w-4 ${on ? 'text-success' : 'text-destructive'}`} />
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className={`text-4xl font-extrabold tabular-nums leading-none ${on ? 'text-foreground' : 'text-foreground/70'}`}>
            <AnimatedStat value={on ? 100 : 68} suffix="%" />
          </span>
          <span className="text-[10px] text-foreground/58 mb-1 max-w-[130px]">{on ? 'direct sales, zero commission' : 'after marketplace fees'}</span>
        </div>
        <div className="h-4 w-full rounded-full overflow-hidden flex border border-foreground/10">
          <motion.div animate={{ width: on ? '100%' : '68%' }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-primary to-accent" />
          <motion.div animate={{ width: on ? '0%' : '20%', opacity: on ? 0 : 1 }} transition={{ duration: 0.9 }}
            className="h-full bg-destructive/70" />
          <motion.div animate={{ width: on ? '0%' : '12%', opacity: on ? 0 : 1 }} transition={{ duration: 0.9 }}
            className="h-full bg-destructive/40" />
        </div>
      </div>
    </SceneShell>
  );
}

function SceneEngagement({ on }: { on: boolean }) {
  return (
    <SceneShell src="/assets/samples/3.jpg" on={on}>
      <motion.div
        animate={on ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-6 right-6 w-36 sm:w-40 rounded-xl overflow-hidden border shadow-2xl transition-all duration-500 ${on ? 'border-primary/50 shadow-[0_0_40px_hsl(var(--primary)/0.25)]' : 'border-foreground/10 grayscale'}`}
      >
        <img src="/assets/samples/1.jpg" alt="" className="w-full h-20 object-cover" />
        <div className="p-2.5 bg-black/38 backdrop-blur-md">
          <p className="text-xs font-bold text-foreground">Oslo 3-Seater</p>
          <p className="text-[10px] text-foreground/58">£1,299</p>
          {on ? (
            <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              <Sparkles className="h-3 w-3" /> View in your room
            </motion.span>
          ) : (
            <span className="mt-2 inline-block px-2 py-1 rounded-full bg-foreground/10 text-foreground/58 text-[10px]">Add to cart</span>
          )}
        </div>
      </motion.div>
      <motion.div
        key={`cursor-${on}`}
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={on ? { x: [40, -46, -50], y: [30, -66, -70], opacity: [0, 1, 1] } : { x: [0, 70, 150], y: [0, -20, -90], opacity: [0, 1, 0] }}
        transition={{ duration: on ? 2 : 2.6, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
        className="absolute pointer-events-none z-10"
        style={{ right: '24%', bottom: '44%' }}
      >
        <MousePointer2 className="h-5 w-5 text-foreground drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" fill="white" />
        {on && (
          <motion.span animate={{ scale: [0, 1.7], opacity: [0.7, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, delay: 1.8 }}
            className="absolute -inset-2 rounded-full border-2 border-primary" />
        )}
      </motion.div>
      <div className={`${panel} left-4 bottom-4 sm:w-[240px] p-4`}>
        <div className="flex items-center gap-2 mb-1">
          <Timer className={`h-4 w-4 ${on ? 'text-primary' : 'text-destructive'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/65">Time on page</span>
        </div>
        <p className={`text-3xl font-extrabold tabular-nums leading-none ${on ? 'text-foreground' : 'text-foreground/70'}`}>
          <AnimatedStat value={on ? 142 : 11} suffix="s" />
        </p>
        <p className={`text-xs font-medium mt-1 ${on ? 'text-success' : 'text-destructive'}`}>{on ? 'Visitors stay, play & buy' : 'Nothing to do — they bounce'}</p>
      </div>
    </SceneShell>
  );
}

function SceneCatalogue({ on }: { on: boolean }) {
  const imgs = ['/assets/samples/1.jpg', '/assets/samples/3.jpg', '/assets/samples/5.jpg'];
  return (
    <SceneShell src="/assets/samples/styled_room.png" on={on}>
      <div className="absolute inset-0 flex items-center justify-center pb-16" style={{ perspective: '900px' }}>
        <div className="flex gap-4 sm:gap-6">
          {imgs.map((src, i) => (
            <motion.div
              key={src}
              animate={on
                ? { rotateY: i === 0 ? 16 : i === 2 ? -16 : 0, scale: i === 1 ? 1.12 : 1, y: i === 1 ? -8 : 0 }
                : { rotateY: 0, scale: 0.95, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl overflow-hidden border shadow-2xl ${on ? 'border-primary/40' : 'border-foreground/10'}`}
            >
              <img src={src} alt="" className={`w-full h-full object-cover transition-all duration-700 ${on ? 'grayscale-0 brightness-100' : 'grayscale brightness-[.7]'}`} />
              {on && (
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.12 }}
                  className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[9px] font-bold">
                  In your room
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <div className={`${panel} left-4 bottom-4 right-4 sm:right-auto px-4 py-3`}>
        <div className="flex items-center gap-2">
          <Layers className={`h-4 w-4 ${on ? 'text-primary' : 'text-destructive'}`} />
          <p className="text-sm font-bold text-foreground">{on ? 'A living catalogue, rendered in real rooms' : 'Flat, lifeless product thumbnails'}</p>
        </div>
      </div>
    </SceneShell>
  );
}

const scenes = [SceneVisualize, SceneConversions, SceneReturns, SceneMarketplace, SceneEngagement, SceneCatalogue];

/* ---------------- Section ---------------- */

export function ConversionGapExplorer() {
  const { ref, isVisible } = useScrollAnimation();
  const [active, setActive] = useState(0);
  const [on, setOn] = useState(true);
  const [touched, setTouched] = useState(false);
  const [paused, setPaused] = useState(false);
  const Scene = scenes[active];

  const takeOver = () => setTouched(true);
  const go = (i: number) => { setActive((i + problems.length) % problems.length); takeOver(); };

  /* Self-playing demo until the visitor takes over (or pauses) */
  useEffect(() => {
    if (!isVisible || touched || paused) return;
    const id = setInterval(() => {
      setOn((prevOn) => {
        if (!prevOn) return true;
        setActive((p) => (p + 1) % problems.length);
        return false;
      });
    }, 3200);
    return () => clearInterval(id);
  }, [isVisible, touched, paused]);

  const autoplaying = !touched && !paused;

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Ambient background — two glows that cross-fade with the state */}
      <div className="absolute inset-0 bg-grid opacity-[0.03]" />
      <div className={`absolute -top-24 right-[8%] w-[520px] h-[520px] rounded-full blur-[160px] transition-all duration-1000 ${on ? 'bg-primary/[0.10]' : 'bg-destructive/[0.05] opacity-70'}`} />
      <div className={`absolute -bottom-32 left-[6%] w-[440px] h-[440px] rounded-full blur-[150px] transition-all duration-1000 ${on ? 'bg-accent/[0.06]' : 'bg-destructive/[0.04] opacity-60'}`} />

      <div
        ref={ref}
        className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* ---------- Header ---------- */}
        <div className="text-center mb-9">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-semibold border mb-6 transition-colors duration-500 ${
            on ? 'bg-primary/10 text-primary border-primary/25' : 'bg-destructive/10 text-destructive border-destructive/25'
          }`}>
            <TrendingDown className={`h-4 w-4 transition-transform duration-500 ${on ? 'rotate-180' : ''}`} />
            The Conversion Gap
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            Why Home Improvement Brands{' '}
            <span className="text-gradient-primary">Struggle to Convert Online</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Pick a problem below, then flip the switch to watch ThinkDecor close the gap — live.
          </p>
        </div>

        {/* ---------- Segmented state toggle ---------- */}
        <div className="flex flex-col items-center gap-3 mb-9">
          <div
            role="tablist"
            aria-label="Toggle ThinkDecor"
            className={`relative flex p-1.5 rounded-full border backdrop-blur-md transition-colors duration-500 ${
              on ? 'bg-primary/[0.05] border-primary/25' : 'bg-destructive/[0.05] border-destructive/25'
            }`}
          >
            {[
              { label: 'Without ThinkDecor', value: false, Icon: X },
              { label: 'With ThinkDecor', value: true, Icon: Check },
            ].map(({ label, value, Icon }) => {
              const selected = on === value;
              return (
                <button
                  key={label}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => { setOn(value); takeOver(); }}
                  className={`relative z-10 flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 ${
                    selected
                      ? value ? 'text-primary-foreground' : 'text-foreground'
                      : 'text-muted-foreground/70 hover:text-foreground'
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId="toggle-thumb"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className={`absolute inset-0 -z-10 rounded-full ${value ? 'bg-primary shadow-glow' : 'bg-destructive shadow-[0_0_28px_hsl(var(--destructive)/0.5)]'}`}
                    />
                  )}
                  <Icon className="h-4 w-4" strokeWidth={2.5} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Autoplay status / control */}
          <button
            onClick={() => { setPaused((p) => !p); }}
            className="group flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            {autoplaying ? (
              <>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Auto-playing the walkthrough
                <Pause className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                {touched ? 'You’re in control — tap to resume the tour' : 'Paused — tap to resume'}
              </>
            )}
          </button>
        </div>

        {/* ---------- Problem selector (sliding active indicator) ---------- */}
        <div className="relative mb-8">
          {/* edge fades for mobile scroll */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent z-10 sm:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent z-10 sm:hidden" />
          <div className="flex sm:flex-wrap sm:justify-center gap-2.5 overflow-x-auto no-scrollbar pb-2 px-1 snap-x">
            {problems.map((p, i) => {
              const Icon = p.icon;
              const isActive = active === i;
              return (
                <button
                  key={p.title}
                  onClick={() => go(i)}
                  className={`group relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border text-sm font-semibold whitespace-nowrap snap-start shrink-0 transition-all duration-300 ${
                    isActive
                      ? 'text-foreground border-transparent'
                      : 'bg-card/40 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground hover:-translate-y-0.5'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pill-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className={`absolute inset-0 -z-10 rounded-full border ${
                        on
                          ? 'bg-primary/15 border-primary/50 shadow-[0_0_22px_hsl(var(--primary)/0.25)]'
                          : 'bg-destructive/15 border-destructive/50 shadow-[0_0_22px_hsl(var(--destructive)/0.25)]'
                      }`}
                    />
                  )}
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? (on ? 'text-primary' : 'text-destructive') : ''}`} />
                  <span className="font-mono text-[10px] opacity-50">{String(i + 1).padStart(2, '0')}</span>
                  {pillLabels[i]}
                  {isActive && autoplaying && (
                    <span
                      key={`tour-${i}-${on}`}
                      className={`absolute bottom-0 left-0 h-0.5 rounded-full ${on ? 'bg-primary/70' : 'bg-destructive/70'}`}
                      style={{ animation: 'progress 3.2s linear' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Stage: tilted storefront console ---------- */}
        <div className="relative">
          <TiltCard max={3}>
            <div className={`group/stage relative rounded-2xl border overflow-hidden flex flex-col transition-all duration-700 ${
              on
                ? 'border-primary/30 shadow-[0_30px_90px_-25px_hsl(var(--primary)/0.35)]'
                : 'border-destructive/25 shadow-[0_30px_90px_-25px_hsl(var(--destructive)/0.22)]'
            }`}>
              {/* Chrome */}
              <div className="relative z-20 flex items-center gap-2.5 px-4 py-3 border-b border-border/40 bg-card/95">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
                <span className="ml-3 hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-background/60 border border-border/40 text-[11px] text-muted-foreground font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  yourstore.com — customer view
                </span>
                <span className={`ml-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${on ? 'text-success' : 'text-destructive'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${on ? 'bg-success' : 'bg-destructive'}`} />
                  {on ? 'ThinkDecor active' : 'ThinkDecor off'}
                </span>
              </div>

              {/* Canvas */}
              <div className="relative h-[380px] sm:h-[440px] bg-[#070b0a]">
                <div className="absolute inset-0 bg-grid opacity-[0.05]" />
                <div className={`absolute inset-0 transition-opacity duration-1000 ${on ? 'opacity-100' : 'opacity-0'}`}
                  style={{ background: 'radial-gradient(ellipse at 50% 100%, hsl(168 100% 17% / 0.16), transparent 60%)' }} />
                <div className={`absolute inset-0 transition-opacity duration-1000 ${on ? 'opacity-0' : 'opacity-100'}`}
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(0 72% 51% / 0.08), transparent 60%)' }} />

                {/* State-tinted corner brackets */}
                {[
                  'top-3 left-3 border-t-2 border-l-2',
                  'top-3 right-3 border-t-2 border-r-2',
                  'bottom-3 left-3 border-b-2 border-l-2',
                  'bottom-3 right-3 border-b-2 border-r-2',
                ].map((pos) => (
                  <span key={pos} className={`absolute ${pos} w-5 h-5 rounded-[3px] transition-colors duration-500 pointer-events-none z-10 ${on ? 'border-primary/40' : 'border-destructive/40'}`} />
                ))}

                <AnimatePresence>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0"
                  >
                    <Scene on={on} />
                  </motion.div>
                </AnimatePresence>

                {/* Hover prev / next */}
                <button
                  onClick={() => go(active - 1)}
                  aria-label="Previous problem"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-9 h-9 rounded-full bg-black/35 border border-foreground/10 text-foreground/80 backdrop-blur-md opacity-0 group-hover/stage:opacity-100 hover:bg-black/38 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => go(active + 1)}
                  aria-label="Next problem"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-9 h-9 rounded-full bg-black/35 border border-foreground/10 text-foreground/80 backdrop-blur-md opacity-0 group-hover/stage:opacity-100 hover:bg-black/38 transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Caption bar */}
              <div className="relative z-20 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 px-5 py-3.5 border-t border-border/40 bg-card/95">
                <span className={`text-sm font-bold transition-colors duration-500 ${on ? 'text-primary' : 'text-destructive'}`}>
                  {problems[active].title}
                </span>
                <span className="text-xs text-muted-foreground sm:flex-1">{problems[active].text}</span>
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  Flip the switch above
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>↑</motion.span>
                </span>
              </div>
            </div>
          </TiltCard>

          {/* Floor reflection */}
          <div
            className={`pointer-events-none absolute left-6 right-6 -bottom-6 h-16 rounded-full blur-2xl transition-colors duration-700 ${on ? 'bg-primary/15' : 'bg-destructive/10'}`}
          />
        </div>

        {/* ---------- Carousel dots ---------- */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {problems.map((p, i) => {
            const isActive = active === i;
            return (
              <button
                key={p.title}
                onClick={() => go(i)}
                aria-label={`Show ${pillLabels[i]}`}
                className="group py-2"
              >
                <span className={`block h-1.5 rounded-full transition-all duration-400 ${
                  isActive
                    ? `w-8 ${on ? 'bg-primary' : 'bg-destructive'}`
                    : 'w-1.5 bg-muted-foreground/25 group-hover:bg-muted-foreground/50'
                }`} />
              </button>
            );
          })}
        </div>

        {/* ---------- CTA ---------- */}
        <div className="mt-10 text-center">
          <a href="#solution" className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/60 border border-border/50 hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.12)] transition-all duration-300">
            <span className="text-sm text-muted-foreground">That switch is the product —</span>
            <span className="text-sm font-semibold text-primary flex items-center gap-1">
              see how it works <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
