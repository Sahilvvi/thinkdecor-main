import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight, Sparkles, PaintRoller, Grid2x2, Sofa, Eraser, Wand2,
  Upload, Ruler, Calculator, Check, Camera, Zap, MoveHorizontal, RotateCcw,
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';
import { ScrollProgress } from '@/components/brands/ScrollProgress';
import { Reveal, Stagger, staggerItem, RevealWords, Magnetic } from '@/components/premium/Motion';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

/* ---------------------------------------------------------------- *
 *  Phase 1 homepage.
 *  Prices come from src/lib/billing.ts so the page can never
 *  contradict what Stripe actually charges.
 * ---------------------------------------------------------------- */

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);
const CTA = `Start for ${INTRO}`;

/**
 * IMAGE BUDGET — every photo appears exactly once on this page.
 *
 *   empty_room.png + styled_room.png  →  hero before/after ONLY
 *   1, 4, 2, 3, 6                     →  section 1 ONLY
 *   5                                 →  Mantha panel ONLY
 *   (7, 8, 9 are exteriors/stairwells — not used)
 *
 * Sections also deliberately use different UI patterns so none of them
 * read as a repeat: hero = drag compare, section 1 = photo stage with
 * pills, Mantha = prompt console, calculator = tool panel, steps =
 * numbered rail with no photography at all.
 */
const CAPABILITIES = [
  { icon: Wand2, t: 'Redecorate', d: 'Transform the whole room.', img: '/assets/samples/1.jpg' },
  { icon: PaintRoller, t: 'Change Walls', d: 'Try new colours instantly.', img: '/assets/samples/4.jpg' },
  { icon: Grid2x2, t: 'Change Flooring', d: 'Preview a different floor.', img: '/assets/samples/2.jpg' },
  { icon: Sofa, t: 'Replace Objects', d: 'Swap furniture and decor.', img: '/assets/samples/3.jpg' },
  { icon: Eraser, t: 'Cleanup', d: 'Remove clutter in seconds.', img: '/assets/samples/6.jpg' },
];

const STEPS = [
  { n: '01', icon: Upload, t: 'Upload', d: 'Add your room.' },
  { n: '02', icon: Wand2, t: 'Create', d: 'Choose what you want to change.' },
  { n: '03', icon: Calculator, t: 'Calculate', d: 'Work out your paint or flooring quantity.' },
];

const INCLUDED = [
  'Mantha AI', 'Redecorate', 'Walls', 'Flooring',
  'Replace Objects', 'Cleanup', 'Paint Calculator', 'Flooring Calculator',
];

const TRUST = [
  { icon: Camera, t: 'Any phone photo' },
  { icon: Zap, t: 'Results in seconds' },
  { icon: Check, t: 'Cancel anytime' },
];

const FAQS = [
  { q: 'What do I pay?', a: `${INTRO} for your first month. After that it renews at ${MONTHLY} a month until you cancel.` },
  { q: 'What do I need to get started?', a: 'A photo of your room from any phone. No special hardware, no measuring equipment.' },
  { q: 'Can I cancel any time?', a: 'Yes. Cancel from your account and the plan stays active until the end of the period you have already paid for.' },
  { q: 'How do the calculators work?', a: 'Enter your room measurements and ThinkDecor works out how much flooring or paint to buy, including the usual wastage allowance.' },
];

/* ================================================================ */

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ThinkDecor | See it before you change it"
        description={`Redesign your room with Mantha AI. Try new walls, flooring and furniture, then work out how much paint or flooring you need. Start for ${INTRO}, then ${MONTHLY} a month.`}
        canonical="https://thinkdecor.app/"
      />
      <ScrollProgress />
      <Navbar />

      <main className="relative z-10 overflow-clip">

        {/* ============================ HERO ============================ */}
        <section className="relative pt-32 lg:pt-36">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-[26rem] left-1/2 h-[52rem] w-[86rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(168_100%_17%/0.12),transparent_62%)] blur-3xl" />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(168 30% 40% / 0.07) 1px, transparent 1px), linear-gradient(90deg, hsl(168 30% 40% / 0.07) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
                maskImage: 'radial-gradient(ellipse 70% 55% at 50% 20%, black 25%, transparent 72%)',
              }}
            />
          </div>

          {/* ---- centred copy ---- */}
          <div className="container relative z-10 mx-auto max-w-[900px] px-6 text-center sm:px-8">
            <Reveal className="flex justify-center">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-xl">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Early access · {INTRO} first month
              </span>
            </Reveal>

            <h1 className="mt-9 font-bold leading-[0.94] tracking-[-0.045em] text-[clamp(3rem,7.5vw,6rem)]">
              <RevealWords text="See it before you" className="block text-foreground" delay={0.1} />
              <span className="relative mt-1 inline-block">
                <RevealWords
                  text="change it."
                  className="relative z-10 block bg-[linear-gradient(100deg,hsl(160_84%_38%),hsl(168_90%_24%)_55%,hsl(168_100%_17%))] bg-clip-text text-transparent"
                  delay={0.3}
                />
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.9, ease: 'easeInOut' }}
                  viewBox="0 0 300 12" preserveAspectRatio="none"
                  className="absolute -bottom-2 left-0 h-3.5 w-full"
                >
                  <motion.path d="M2 8 Q 75 2, 150 6 T 298 4" fill="none"
                    stroke="hsl(168 100% 17%)" strokeWidth="3" strokeLinecap="round" opacity="0.28" />
                </motion.svg>
              </span>
            </h1>

            <Reveal delay={0.55} className="mt-9">
              <p className="mx-auto max-w-[52ch] text-[clamp(1.05rem,1.4vw,1.25rem)] font-light leading-relaxed text-foreground/60">
                Redesign your room with Mantha AI. Try new walls, flooring and
                furniture — then work out how much paint or flooring you need.
              </p>
            </Reveal>

            <Reveal delay={0.68} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Magnetic>
                <Link
                  to="/pricing"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-10 py-[18px] text-[15.5px] font-semibold text-primary-foreground shadow-[0_22px_48px_-14px_hsl(168_100%_17%/0.55)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.3),transparent)] transition-transform duration-[900ms] group-hover:translate-x-full" />
                  <span className="relative">{CTA}</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Magnetic>
              <span className="text-[13.5px] text-foreground/45">
                Then {MONTHLY}/month · Cancel anytime
              </span>
            </Reveal>

            <Stagger className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-3">
              {TRUST.map(({ icon: Icon, t }) => (
                <motion.span key={t} variants={staggerItem} className="flex items-center gap-2 text-[13px] text-foreground/50">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/[0.1]">
                    <Icon className="h-3 w-3 text-primary" />
                  </span>
                  {t}
                </motion.span>
              ))}
            </Stagger>
          </div>

          {/* ---- the product, at scale ---- */}
          <div className="container relative z-10 mx-auto mt-16 max-w-[1320px] px-6 sm:px-8">
            <Reveal delay={0.2} y={44} blur={18}>
              <div className="relative">
                <div className="pointer-events-none absolute -inset-x-10 -bottom-10 -top-6 rounded-[60px] bg-[radial-gradient(ellipse_at_center,hsl(168_100%_17%/0.22),transparent_70%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[28px] border border-foreground/[0.1] bg-white shadow-[0_60px_120px_-40px_hsl(168_40%_15%/0.45)]">
                  <div className="flex items-center gap-2.5 border-b border-foreground/[0.07] bg-[hsl(168_20%_98%)] px-6 py-4">
                    <span className="h-3 w-3 rounded-full bg-foreground/12" />
                    <span className="h-3 w-3 rounded-full bg-foreground/12" />
                    <span className="h-3 w-3 rounded-full bg-foreground/12" />
                    <span className="ml-4 text-[12px] font-medium tracking-wide text-foreground/40">thinkdecor.app</span>
                    <motion.span
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                      className="ml-auto flex items-center gap-1.5 rounded-full bg-primary/[0.08] px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-primary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Mantha AI · running
                    </motion.span>
                  </div>

                  <BeforeAfterSlider
                    beforeSrc="/assets/samples/empty_room.png"
                    afterSrc="/assets/samples/styled_room.png"
                    beforeAlt="Empty living room before redesign"
                    afterAlt="The same room redesigned by Mantha AI"
                    aspectRatio="aspect-[21/9]"
                  />

                  <div className="flex items-center justify-center gap-2 border-t border-foreground/[0.07] bg-white py-4">
                    <MoveHorizontal className="h-4 w-4 text-primary" />
                    <span className="text-[13px] text-foreground/50">Drag to compare — same room, redesigned</span>
                  </div>
                </div>

                {/* floating chips over the frame */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.15, duration: 0.7 }}
                  className="absolute -left-6 top-[24%] hidden rounded-2xl border border-foreground/[0.08] bg-white/92 px-5 py-3.5 shadow-[0_20px_44px_-16px_hsl(168_40%_15%/0.35)] backdrop-blur-xl xl:block"
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/40">Walls</span>
                  <span className="mt-0.5 block text-[15px] font-semibold text-foreground">Warm oak panel</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.7 }}
                  className="absolute -right-6 top-[52%] hidden rounded-2xl border border-foreground/[0.08] bg-white/92 px-5 py-3.5 shadow-[0_20px_44px_-16px_hsl(168_40%_15%/0.35)] backdrop-blur-xl xl:block"
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/40">Flooring</span>
                  <span className="mt-0.5 block text-[15px] font-semibold text-foreground">16.6 m² needed</span>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ SECTION 1 — IMMERSIVE SHOWCASE ============ */}
        <section id="features" className="relative scroll-mt-24 py-24 lg:py-32">
          <div className="container relative z-10 mx-auto max-w-[1320px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[720px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Five ways to change a room</p>
              <h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
                What do you want to change?
              </h2>
              <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-relaxed text-foreground/55">
                Pick one, or do all five on the same photo.
              </p>
            </Reveal>

            <Reveal delay={0.12} y={38} className="mt-14">
              <CapabilityStage />
            </Reveal>
          </div>
        </section>

        {/* ============ SECTION 2 — DESIGN IT. MEASURE IT. ============ */}
        <section className="relative border-y border-foreground/[0.07] bg-[hsl(168_24%_97.5%)] py-24 lg:py-32">
          <div className="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,hsl(160_84%_45%/0.10),transparent_62%)] blur-3xl" />
          <div className="container relative z-10 mx-auto max-w-[1320px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[720px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Two halves of one job</p>
              <h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
                Design it. Measure it.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <Reveal y={34}><ManthaPanel /></Reveal>
              <Reveal y={34} delay={0.1}><LiveCalculator /></Reveal>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3 — THREE STEPS ================= */}
        <section className="relative py-24 lg:py-32">
          <div className="container mx-auto max-w-[1320px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[720px] text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">How it works</p>
              <h2 className="mt-5 text-[clamp(2.2rem,5vw,3.9rem)] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
                Three steps. Done.
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-16">
              <StepFlow />
            </Reveal>
          </div>
        </section>

        {/* ================= SECTION 4 — EARLY ACCESS ================= */}
        <section className="relative pb-24 lg:pb-28">
          <div className="container mx-auto max-w-[1320px] px-6 sm:px-8">
            <Reveal y={36}>
              <div className="relative overflow-hidden rounded-[36px] border border-primary/20 bg-white shadow-[0_50px_100px_-45px_hsl(168_50%_18%/0.45)]">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">

                  {/* left: the offer */}
                  <div className="relative overflow-hidden px-8 py-14 lg:px-14 lg:py-16">
                    <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,hsl(160_84%_45%/0.16),transparent_62%)] blur-3xl" />
                    <div className="relative">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Early access</p>

                      <div className="mt-7 flex items-end gap-3">
                        <span className="text-[clamp(3.4rem,8vw,5.4rem)] font-bold leading-[0.85] tracking-[-0.045em] text-foreground">{INTRO}</span>
                        <span className="pb-2 text-[16px] text-foreground/45">first month</span>
                      </div>
                      <p className="mt-5 text-[16px] text-foreground/55">
                        Then <span className="font-semibold text-foreground">{MONTHLY}/month</span>. Cancel anytime.
                      </p>

                      <div className="mt-9">
                        <Magnetic>
                          <Link
                            to="/pricing"
                            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-10 py-4 text-[15px] font-semibold text-primary-foreground shadow-[0_20px_46px_-14px_hsl(168_100%_17%/0.5)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                          >
                            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-[900ms] group-hover:translate-x-full" />
                            <span className="relative">{CTA}</span>
                            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </Magnetic>
                      </div>
                    </div>
                  </div>

                  {/* right: what's included, on tint */}
                  <div className="relative border-t border-foreground/[0.07] bg-[linear-gradient(165deg,hsl(168_28%_97%),hsl(168_24%_94%))] px-8 py-12 lg:border-l lg:border-t-0 lg:px-12 lg:py-16">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                      Everything included
                    </p>
                    <Stagger className="mt-6 grid gap-2.5 sm:grid-cols-2" gap={0.05}>
                      {INCLUDED.map((f) => (
                        <motion.span
                          key={f}
                          variants={staggerItem}
                          className="flex items-center gap-2.5 rounded-xl border border-foreground/[0.06] bg-white/70 px-3.5 py-2.5 text-[13px] font-medium text-foreground/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-white"
                        >
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </span>
                          {f}
                        </motion.span>
                      ))}
                    </Stagger>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================ FAQ ============================ */}
        <section id="faq" className="scroll-mt-24 pb-20">
          <div className="container mx-auto max-w-[820px] px-6 sm:px-8">
            <Reveal>
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Questions</p>
              <h2 className="mt-4 text-center text-[clamp(1.6rem,2.8vw,2.3rem)] font-bold tracking-[-0.03em] text-foreground">
                Everything worth asking.
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <Accordion type="single" collapsible className="space-y-3">
                {FAQS.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`q-${i}`}
                    className="group overflow-hidden rounded-[18px] border border-foreground/[0.08] bg-card px-0 shadow-[0_6px_20px_-12px_hsl(168_30%_15%/0.14)] transition-all duration-400 hover:border-primary/30 data-[state=open]:border-primary/35"
                  >
                    <AccordionTrigger className="px-6 py-5 text-left text-[15.5px] font-medium text-foreground hover:no-underline [&>svg]:text-primary">
                      <span className="flex items-center gap-4">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] font-mono text-[11.5px] text-foreground/45 transition-all duration-400 group-hover:bg-primary/10 group-hover:text-primary group-data-[state=open]:bg-primary group-data-[state=open]:text-primary-foreground">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {f.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pl-[72px] text-[14.5px] leading-relaxed text-foreground/58">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* ========================= FINAL CTA ========================= */}
        <section className="pb-24 lg:pb-32">
          <div className="container mx-auto max-w-[1320px] px-6 sm:px-8">
            <Reveal y={40} blur={16}>
              <div className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-20 text-center shadow-[0_34px_80px_-28px_hsl(168_100%_17%/0.55)] lg:px-16 lg:py-24">
                <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/[0.09] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[hsl(160_84%_45%)]/20 blur-3xl" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.16]"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 72%)',
                  }}
                />
                <div className="relative">
                  <h2 className="mx-auto max-w-[18ch] text-[clamp(2.1rem,5vw,3.8rem)] font-bold leading-[1.03] tracking-[-0.035em] text-white">
                    Ready to change your room?
                  </h2>
                  <div className="mt-11 flex justify-center">
                    <Magnetic>
                      <Link
                        to="/pricing"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-white px-10 py-4 text-[15px] font-semibold text-primary shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]"
                      >
                        {CTA}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Magnetic>
                  </div>
                  <p className="mt-6 text-[13.5px] text-white/65">Then {MONTHLY}/month · Cancel anytime</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

/* ================================================================ *
 *  Section 1 — one big canvas, controls floating on the image.
 *  The photography is the strongest asset on this page, so it gets
 *  the space rather than sitting in a thumbnail.
 * ================================================================ */
function CapabilityStage() {
  const [i, setI] = useState(0);
  const active = CAPABILITIES[i];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 rounded-[56px] bg-[radial-gradient(ellipse_at_center,hsl(168_100%_17%/0.18),transparent_70%)] blur-3xl" />

      <div className="relative overflow-hidden rounded-[30px] border border-foreground/[0.1] bg-white shadow-[0_50px_110px_-40px_hsl(168_40%_15%/0.45)]">

        {/* ---- pill selector, sitting on the image ---- */}
        <div className="relative">
          <div className="relative aspect-[21/10] w-full overflow-hidden bg-foreground/[0.04]">
            <AnimatePresence mode="wait">
              <motion.img
                key={active.img}
                src={active.img}
                alt={active.t}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>

            {/* top gradient so the pills stay legible on any photo */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />

            {/* the controls */}
            <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-center gap-2 p-5">
              {CAPABILITIES.map((c, idx) => {
                const Icon = c.icon;
                const on = idx === i;
                return (
                  <button
                    key={c.t}
                    onClick={() => setI(idx)}
                    aria-pressed={on}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                      on
                        ? 'text-primary'
                        : 'text-white/85 hover:text-white'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="cap-pill"
                        className="absolute inset-0 rounded-full bg-white shadow-[0_8px_22px_-8px_rgba(0,0,0,0.5)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="relative h-4 w-4" />
                    <span className="relative">{c.t}</span>
                  </button>
                );
              })}
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 bg-gradient-to-t from-black/60 to-transparent p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.t}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-[clamp(1.4rem,2.6vw,2rem)] font-bold leading-tight tracking-[-0.025em] text-white drop-shadow">
                    {active.t}
                  </h3>
                  <p className="mt-1.5 text-[14.5px] text-white/75 drop-shadow">{active.d}</p>
                </motion.div>
              </AnimatePresence>

              <span className="hidden items-center gap-1.5 sm:flex">
                {CAPABILITIES.map((c, idx) => (
                  <span
                    key={c.t}
                    className={`h-1.5 rounded-full transition-all duration-400 ${
                      idx === i ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ *
 *  Mantha panel — image-backed, controls float on the photo.
 * ================================================================ */
/** Prompts cycled through the console. Text only — no extra imagery. */
const PROMPTS = [
  'Redecorate this room in warm minimal',
  'Change the walls to deep olive',
  'Try a lighter oak flooring',
  'Swap the sofa for something softer',
];

function ManthaPanel() {
  const [p, setP] = useState(0);
  const [typed, setTyped] = useState('');

  // Typewriter: types the prompt, holds, then moves to the next one.
  useEffect(() => {
    const full = PROMPTS[p];
    let i = 0;
    setTyped('');
    const type = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(type);
        setTimeout(() => setP((n) => (n + 1) % PROMPTS.length), 2200);
      }
    }, 38);
    return () => clearInterval(type);
  }, [p]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-foreground/[0.08] bg-white shadow-[0_30px_70px_-36px_hsl(168_40%_15%/0.4)]">

      {/* console header */}
      <div className="flex items-center gap-2.5 border-b border-foreground/[0.07] bg-[hsl(168_20%_98%)] px-6 py-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
          <Sparkles className="h-3 w-3" /> Mantha AI
        </span>
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-auto flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-primary"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Listening
        </motion.span>
      </div>

      <div className="flex flex-1 flex-col p-8 lg:p-9">
        <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] font-bold tracking-[-0.03em] text-foreground">
          Make the room feel like yours.
        </h3>
        <p className="mt-4 max-w-[40ch] text-[15.5px] leading-relaxed text-foreground/58">
          Upload a photo and explore a completely new look in seconds.
        </p>

        {/* the prompt bar — types itself */}
        <div className="mt-7 rounded-2xl border border-primary/20 bg-[hsl(168_24%_97.5%)] px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
            Ask Mantha
          </p>
          <p className="mt-2 min-h-[24px] font-mono text-[14px] leading-relaxed text-foreground">
            {typed}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="ml-0.5 inline-block h-[15px] w-[2px] translate-y-[2px] bg-primary"
            />
          </p>
        </div>

        {/* the result */}
        <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-foreground/[0.08]">
          <div className="relative h-full min-h-[190px]">
            <img
              src="/assets/samples/5.jpg"
              alt="A kitchen restyled by Mantha AI"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-primary shadow-sm backdrop-blur-sm">
              Generated look
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ *
 *  A calculator that actually calculates.
 *
 *  Defaults land exactly on the figures in the brief:
 *  4.3 × 3.5 × 2.4 → 15.1 m² floor, 16.6 m² recommended,
 *  37.4 m² of wall, ≈7.5 L of paint.
 * ================================================================ */
const DEFAULTS = { w: 4.3, l: 3.5, h: 2.4 };
const WASTAGE = 1.1;      // 10% cutting allowance
const COVERAGE = 10;      // m² per litre, per coat
const COATS = 2;

/**
 * toFixed(1) alone is wrong here: 4.3 * 3.5 is 15.049999… in binary
 * floating point, which renders as "15.0" instead of the 15.1 the
 * brief quotes. Nudge past the representation error before rounding.
 */
const round1 = (n: number) => (Math.round(n * 10 + 1e-9) / 10).toFixed(1);

function LiveCalculator() {
  const [w, setW] = useState(DEFAULTS.w);
  const [l, setL] = useState(DEFAULTS.l);
  const [h, setH] = useState(DEFAULTS.h);

  const floor = w * l;
  const floorRec = floor * WASTAGE;
  const wall = 2 * (w + l) * h;
  const litres = (wall * COATS) / COVERAGE;

  const dirty = w !== DEFAULTS.w || l !== DEFAULTS.l || h !== DEFAULTS.h;
  const reset = () => { setW(DEFAULTS.w); setL(DEFAULTS.l); setH(DEFAULTS.h); };

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-foreground/[0.08] bg-white shadow-[0_30px_70px_-36px_hsl(168_40%_15%/0.4)]">

      {/* turquoise header — gives the panel a "tool" identity */}
      <div className="relative overflow-hidden bg-primary px-8 py-7 lg:px-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              <Ruler className="h-3 w-3" /> Measure &amp; Calculate
            </span>
            <h3 className="mt-3 text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-[-0.03em] text-primary-foreground">
              Buy the right amount.
            </h3>
          </div>
          {dirty && (
            <button
              onClick={reset}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[11.5px] text-primary-foreground/80 transition-colors hover:bg-white/10 hover:text-primary-foreground"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
        <p className="relative mt-3 max-w-[38ch] text-[14px] leading-relaxed text-primary-foreground/65">
          Enter your room measurements and get a quick estimate before you shop.
        </p>
      </div>

      <div className="flex flex-1 flex-col p-8 lg:p-9">
        <div className="space-y-4">
          <Slider label="Width" value={w} min={2} max={8} onChange={setW} />
          <Slider label="Length" value={l} min={2} max={8} onChange={setL} />
          <Slider label="Ceiling height" value={h} min={2} max={3.5} onChange={setH} />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Result icon={Grid2x2} label="Flooring" from={`${round1(floor)} m² room`} value={`${round1(floorRec)} m²`} unit="recommended" />
          <Result icon={PaintRoller} label="Paint" from={`${round1(wall)} m² walls`} value={`${round1(litres)} L`} unit="approx." />
        </div>

        <p className="mt-auto pt-6 text-[12.5px] leading-relaxed text-foreground/40">
          Estimates include the usual wastage allowance, so you are not left one box short.
        </p>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, onChange,
}: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground/45">{label}</label>
        <span className="font-mono text-[15px] font-bold text-primary">{value.toFixed(1)} m</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={0.1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(90deg, hsl(168 100% 17%) ${pct}%, hsl(168 12% 90%) ${pct}%)`,
        }}
        className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-full
                   [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary
                   [&::-webkit-slider-thumb]:shadow-[0_2px_10px_hsl(168_100%_17%/0.55)]
                   [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-115"
      />
    </div>
  );
}

function Result({
  icon: Icon, label, from, value, unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; from: string; value: string; unit: string;
}) {
  return (
    <div className="rounded-[18px] border border-foreground/[0.08] bg-[hsl(168_24%_97.5%)] px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.1]">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/45">{label}</span>
      </div>
      <p className="mt-3 text-[12.5px] text-foreground/50">{from}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-[28px] font-bold leading-none tracking-[-0.03em] text-foreground"
          >
            {value}
          </motion.span>
        </AnimatePresence>
        <span className="text-[11.5px] text-primary">{unit}</span>
      </div>
    </div>
  );
}

/* ================================================================ *
 *  Three steps — image-backed cards, advances on its own.
 * ================================================================ */
function StepFlow() {
  const [s, setS] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setS((p) => (p + 1) % STEPS.length);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* rail — deliberately no photography here, so this section cannot
          read as a repeat of the two photo-led sections above it. */}
      <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-[54px] hidden h-[2px] rounded-full bg-foreground/[0.08] md:block">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${(s / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const on = idx === s;
          const done = idx < s;
          return (
            <button key={step.n} onClick={() => setS(idx)} className="group relative text-center">
              {/* node */}
              <div className="relative mx-auto flex h-[108px] w-[108px] items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-background" />
                <span className={`absolute inset-[10px] rounded-full transition-all duration-500 ${
                  on ? 'scale-105 bg-primary shadow-[0_18px_40px_-14px_hsl(168_100%_17%/0.6)]'
                     : done ? 'bg-primary/75' : 'bg-primary/[0.1]'
                }`} />
                {on && (
                  <motion.span
                    layoutId="step-ring"
                    className="absolute inset-[2px] rounded-full ring-2 ring-primary/30"
                    transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                  />
                )}
                <Icon className={`relative h-9 w-9 transition-colors duration-500 ${
                  on || done ? 'text-primary-foreground' : 'text-primary'
                }`} />
              </div>

              {/* oversized numeral instead of a photo */}
              <div className="relative mt-6">
                <span className={`pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[76px] font-bold leading-none transition-colors duration-500 ${
                  on ? 'text-primary/[0.09]' : 'text-foreground/[0.045]'
                }`}>
                  {step.n}
                </span>

                <div className="relative">
                  <h3 className="text-[22px] font-bold tracking-[-0.025em] text-foreground">{step.t}</h3>
                  <p className="mx-auto mt-2.5 max-w-[26ch] text-[15px] leading-relaxed text-foreground/55">{step.d}</p>

                  <div className="mx-auto mt-6 h-1 w-24 overflow-hidden rounded-full bg-foreground/[0.07]">
                    {on && (
                      <motion.div
                        key={s}
                        className="h-full rounded-full bg-primary"
                        initial={{ width: '0%' }} animate={{ width: '100%' }}
                        transition={{ duration: 3.4, ease: 'linear' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
