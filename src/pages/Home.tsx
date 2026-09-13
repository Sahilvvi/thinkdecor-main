import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight, Check, FileDown, Clock, Smartphone, Gift, Mail,
  Home as HomeIcon, Palette, Compass, Building2, HardHat, Wrench,
  LayoutGrid, Sofa,
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { Reveal, Stagger, staggerItem, RevealWords, Magnetic, Counter } from '@/components/premium/Motion';
import { HeroVideo } from '@/components/premium/HeroVideo';
import { FourSteps } from '@/components/premium/FourSteps';
import { ScanSequence } from '@/components/premium/ScanSequence';
import { FloorPlanStage } from '@/components/premium/FloorPlanStage';
import { FloorPlanRecognition } from '@/components/premium/FloorPlanRecognition';
import { ManthaConsole } from '@/components/premium/ManthaConsole';
import { DesignGenerator } from '@/components/premium/DesignGenerator';
import { SmartWizard } from '@/components/premium/SmartWizard';
import { ShowcaseTabs } from '@/components/premium/ShowcaseTabs';
import { EarlyBirdStrip } from '@/components/premium/EarlyBirdStrip';
import { Comparison } from '@/components/premium/Comparison';
import { AboutBlurb } from '@/components/premium/AboutBlurb';
import { Testimonials } from '@/components/premium/Testimonials';
import { FREE_SIGNUP_CREDITS } from '@/lib/generation';
import { ROOM_TYPES, TEMPLATES } from '@/lib/templates';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

/* ---------------------------------------------------------------- *
 *  Homepage — the "spatial intelligence" layout from the thinkdecor-live
 *  build, with copy that matches the product today: photo redesigns are
 *  live; room scanning, measured plans and exports are labelled
 *  "coming soon" wherever they appear.
 * ---------------------------------------------------------------- */

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);

// Everything below describes what the app does today. Room scanning, measured
// plans and exports still appear on this page, but labelled "coming soon".
const HERO_TRUST = [
  { icon: Smartphone, t: 'Any phone photo' },
  { icon: Gift, t: `${FREE_SIGNUP_CREDITS} free redesigns` },
  { icon: Clock, t: 'Results in seconds' },
];

const CTA_TRUST = [
  { icon: Smartphone, t: 'No hardware needed' },
  { icon: Gift, t: `${FREE_SIGNUP_CREDITS} free redesigns` },
  { icon: FileDown, t: 'Download every design' },
];

const STATS = [
  { to: FREE_SIGNUP_CREDITS, suffix: '', decimals: 0, t: 'Free redesigns', d: 'when you sign up' },
  { to: TEMPLATES.length, suffix: '', decimals: 0, t: 'Interior styles', d: 'to start from' },
  { to: ROOM_TYPES.length, suffix: '', decimals: 0, t: 'Room types', d: 'living rooms to bathrooms' },
  { to: PHASE1_PLAN.credits, suffix: '', decimals: 0, t: 'Designs a month', d: 'on the ThinkDecor plan' },
];

const MANTHA_FEATURES = [
  'Restyles your actual room',
  `${TEMPLATES.length} interior styles to start from`,
  'Describe changes in plain words',
  'Regenerate for new variations',
  'Every design saved to your library',
  'Budgets & shopping lists — coming soon',
];

const WHO_ITS_FOR = [
  { icon: HomeIcon, t: 'Homeowners', d: 'Plan before you spend' },
  { icon: Palette, t: 'Interior designers', d: 'Concepts in minutes' },
  { icon: Compass, t: 'Architects', d: 'Survey-grade plans' },
  { icon: Building2, t: 'Real estate', d: 'Listings that convert' },
  { icon: HardHat, t: 'Builders', d: 'Fewer site visits' },
  { icon: Wrench, t: 'Contractors', d: 'Quote from real data' },
  { icon: LayoutGrid, t: 'Modular kitchens', d: 'Exact fit, first time' },
  { icon: Sofa, t: 'Furniture brands', d: 'Sell in the room' },
];

const FAQS = [
  {
    q: 'What do I need to get started?',
    a: 'A photo of your room from any phone — straight-on, in daylight if you can. No special hardware, no measuring equipment.',
  },
  {
    q: 'How do credits work?',
    a: `Every account starts with ${FREE_SIGNUP_CREDITS} free redesigns, and each design or regeneration uses one credit. The ThinkDecor plan adds ${PHASE1_PLAN.credits} credits every month — ${INTRO} for your first month, then ${MONTHLY}.`,
  },
  {
    q: 'What is Mantha AI?',
    a: 'Mantha is the design intelligence inside ThinkDecor. Give it a photo, a style and a few words about what you want, and it restyles your actual room — keeping the walls, windows and layout you already have.',
  },
  {
    q: 'Can I change what the AI creates?',
    a: 'Yes. Regenerate for a new variation, or describe what to change — "lighter floors", "a green velvet sofa" — and Mantha refines the same photo. Every design is saved to your library to compare and download.',
  },
  {
    q: 'Can ThinkDecor measure my room?',
    a: 'Not yet. Room scanning with measured floor plans — and PDF, SVG and CAD exports — is in development. Today, ThinkDecor redesigns rooms from a photo.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Manage or cancel your plan from Settings in your account, and it stays active until the end of the period you have already paid for.',
  },
];

/* ================================================================ */

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ThinkDecor | AI Interior Design From a Photo"
        description={`Upload a photo of any room and Mantha AI redesigns it in the style you choose. Start with ${FREE_SIGNUP_CREDITS} free redesigns, then ${INTRO} for your first month.`}
        canonical="https://thinkdecor.app/"
      />
      <Navbar />

      <main className="relative z-10 overflow-clip">

        {/* ============================ HERO ============================ */}
        <section className="relative overflow-hidden pt-32 pb-16 lg:pt-36 lg:pb-20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-[26rem] left-1/2 h-[52rem] w-[86rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(168_100%_17%/0.12),transparent_62%)] blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
              <div>
                <Reveal className="flex justify-start">
                  <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-xl">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    Spatial intelligence, powered by AI
                  </span>
                </Reveal>

                <h1 className="mt-7 font-bold leading-[0.98] tracking-[-0.04em] text-[clamp(2.6rem,5.6vw,4.4rem)] text-foreground">
                  <RevealWords text="Measure." className="block" delay={0.1} />
                  <RevealWords text="Understand." className="block" delay={0.22} />
                  <RevealWords
                    text="Design."
                    className="block bg-[linear-gradient(100deg,hsl(160_84%_38%),hsl(168_90%_24%)_55%,hsl(168_100%_17%))] bg-clip-text text-transparent"
                    delay={0.34}
                  />
                </h1>

                <Reveal delay={0.5} className="mt-7">
                  <p className="max-w-[46ch] text-[16.5px] leading-relaxed text-foreground/60">
                    Upload a photo of any room and Mantha AI redesigns it in the style you
                    choose — in seconds. Room scanning and measured plans are coming soon.
                  </p>
                </Reveal>

                <Reveal delay={0.6} className="mt-9">
                  <Magnetic>
                    <Link
                      to="/signup"
                      className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-9 py-4 text-[15px] font-semibold text-primary-foreground shadow-[0_20px_46px_-14px_hsl(168_100%_17%/0.5)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <span className="relative">Try it free</span>
                      <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Magnetic>
                </Reveal>

                <Stagger className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {HERO_TRUST.map(({ icon: Icon, t }) => (
                    <motion.span key={t} variants={staggerItem} className="flex items-center gap-2 text-[13px] text-foreground/50">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/[0.1]">
                        <Icon className="h-3 w-3 text-primary" />
                      </span>
                      {t}
                    </motion.span>
                  ))}
                </Stagger>
              </div>

              <Reveal delay={0.25} y={40} blur={16}>
                <HeroVideo />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= FOUR STEPS ================= */}
        <FourSteps />

        {/* ================= STATS BAR ================= */}
        <section className="py-10 lg:py-12">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <Stagger className="grid grid-cols-2 gap-6 lg:grid-cols-4" gap={0.08}>
              {STATS.map((s) => (
                <motion.div key={s.t} variants={staggerItem} className="text-center">
                  <div className="text-[clamp(1.8rem,3.4vw,2.6rem)] font-bold tracking-[-0.03em] text-foreground">
                    <Counter to={s.to} suffix={s.suffix} decimals={s.decimals} />
                  </div>
                  <p className="mt-1.5 text-[13.5px] font-medium text-foreground/70">{s.t}</p>
                  <p className="text-[12px] text-foreground/45">{s.d}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================= EARLY-BIRD OFFER ================= */}
        <EarlyBirdStrip />

        {/* ================= SCAN — SEE IT HAPPEN ================= */}
        <section id="scan" className="scroll-mt-24 py-16 lg:py-20">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[640px] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Coming soon · Room scanning</p>
              <h2 className="mx-auto mt-5 max-w-[22ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
                One walkthrough. Everything else is automatic.
              </h2>
              <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-foreground/55">
                Where ThinkDecor is heading: walk a room once with your phone for a measured plan and a finished interior. Photo redesigns are available today.
              </p>
            </Reveal>

            <Reveal delay={0.12} y={38} className="mt-12">
              <ScanSequence />
            </Reveal>
          </div>
        </section>

        {/* ================= MEASUREMENT — PRODUCT 01 ================= */}
        <section id="measurement" className="scroll-mt-24 py-16 lg:py-20">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <Reveal>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Coming soon</p>
                  <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.025em] text-foreground">
                    AI Measurement
                  </h2>
                  <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-foreground/58">
                    Record a room with your phone and ThinkDecor returns a precise, editable
                    floor plan — wall lengths, room dimensions, doors, windows and total area.
                    In minutes, not site visits — arriving with the ThinkDecor scanning app.
                  </p>
                </Reveal>
              </div>

              <Reveal y={36} blur={16}>
                <FloorPlanStage />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= AI FLOOR PLAN RECOGNITION ================= */}
        <FloorPlanRecognition />

        {/* ================= MANTHA AI — PRODUCT 02 ================= */}
        <section id="mantha" className="scroll-mt-24 border-y border-foreground/[0.07] py-16 lg:py-20">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <Reveal>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Available now</p>
                  <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.025em] text-foreground">
                    Mantha AI
                  </h2>
                  <p className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-foreground/58">
                    Upload a photo, pick a style and say what you want in plain words. Mantha
                    restyles your actual room — same walls, windows and layout. Budgets and
                    shopping lists are coming soon.
                  </p>
                </Reveal>

                <Stagger className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2" gap={0.05}>
                  {MANTHA_FEATURES.map((f) => (
                    <motion.span
                      key={f}
                      variants={staggerItem}
                      className="flex items-center gap-2.5 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-3.5 py-2.5 text-[13px] font-medium text-foreground/75"
                    >
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </span>
                      {f}
                    </motion.span>
                  ))}
                </Stagger>
              </div>

              <Reveal y={36} blur={16}>
                <ManthaConsole />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= DESIGN GENERATOR ================= */}
        <DesignGenerator />

        {/* ================= SMART WIZARD ================= */}
        <SmartWizard />

        {/* ================= WHAT YOU GET ================= */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[640px] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">On the roadmap</p>
              <h2 className="mx-auto mt-5 max-w-[22ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
                Everything one scan will unlock.
              </h2>
              <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-foreground/55">
                Photo redesigns are available today — the rest arrives with room scanning.
              </p>
            </Reveal>

            <Reveal delay={0.12} y={38} className="mt-12">
              <ShowcaseTabs />
            </Reveal>
          </div>
        </section>

        {/* ================= WHO IT'S FOR ================= */}
        <section className="border-y border-foreground/[0.07] py-16 lg:py-20">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[640px] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Who it's for</p>
              <h2 className="mx-auto mt-5 max-w-[24ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
                Built for everyone who works in rooms.
              </h2>
              <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-foreground/55">
                One photo, many jobs — from a first renovation to staging a listing.
              </p>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4" gap={0.06}>
              {WHO_ITS_FOR.map(({ icon: Icon, t, d }) => (
                <motion.div
                  key={t}
                  variants={staggerItem}
                  className="group rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-5 text-center transition-all duration-400 hover:border-primary/30 hover:bg-primary/[0.04]"
                >
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition-all duration-400 group-hover:scale-110 group-hover:bg-primary">
                    <Icon className="h-5 w-5 text-primary transition-colors duration-400 group-hover:text-primary-foreground" />
                  </span>
                  <p className="mt-3.5 text-[14px] font-semibold text-foreground">{t}</p>
                  <p className="mt-1 text-[12px] text-foreground/50">{d}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================= COMPARISON ================= */}
        <Comparison />

        {/* ================= ABOUT ================= */}
        <AboutBlurb />

        {/* ================= TESTIMONIALS ================= */}
        <Testimonials />

        {/* ============================ FAQ ============================ */}
        <section id="faq" className="scroll-mt-24 py-16 lg:py-24">
          <div className="container mx-auto max-w-[1100px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[640px] text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Questions</p>
              <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.2rem)] font-bold tracking-[-0.02em] text-foreground">
                Everything worth asking.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal delay={0.05}>
                <div className="rounded-[22px] border border-foreground/[0.09] bg-foreground/[0.02] p-7 lg:sticky lg:top-28">
                  <p className="text-[17px] font-bold text-foreground">Still unsure?</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-foreground/50">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Replies within a day
                  </p>
                  <a
                    href="mailto:info@thinkdecor.app"
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/[0.12]"
                  >
                    <Mail className="h-3.5 w-3.5" /> Ask us anything
                  </a>
                  <p className="mt-2 text-[12.5px] text-foreground/45">info@thinkdecor.app</p>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <Accordion type="single" collapsible className="space-y-3">
                  {FAQS.map((f, i) => (
                    <AccordionItem
                      key={f.q}
                      value={`q-${i}`}
                      className="group overflow-hidden rounded-[18px] border border-foreground/[0.08] bg-card px-0 shadow-[0_6px_20px_-12px_hsl(168_30%_15%/0.14)] transition-all duration-400 hover:border-primary/30 data-[state=open]:border-primary/35"
                    >
                      <AccordionTrigger className="px-6 py-5 text-left text-[15px] font-medium text-foreground hover:no-underline [&>svg]:text-primary">
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
          </div>
        </section>

        {/* ========================= FINAL CTA ========================= */}
        <section className="pb-24 pt-10 lg:pb-32">
          <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
            <Reveal y={40} blur={16}>
              <div className="relative overflow-hidden rounded-[32px] bg-primary px-8 py-20 text-center shadow-[0_34px_80px_-28px_hsl(168_100%_17%/0.55)] lg:px-16 lg:py-24">
                <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/[0.09] blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[hsl(160_84%_45%)]/20 blur-3xl" />
                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">Start free</p>
                  <h2 className="mx-auto mt-5 max-w-[18ch] text-[clamp(2.1rem,5vw,3.8rem)] font-bold leading-[1.03] tracking-[-0.035em] text-white">
                    Your room deserves smarter intelligence.
                  </h2>
                  <p className="mx-auto mt-5 max-w-[42ch] text-[15.5px] text-white/70">
                    Your first {FREE_SIGNUP_CREDITS} redesigns are free — no card needed.
                  </p>
                  <div className="mt-9 flex justify-center">
                    <Magnetic>
                      <Link
                        to="/signup"
                        className="group inline-flex items-center gap-2.5 rounded-full bg-white px-10 py-4 text-[15px] font-semibold text-primary shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]"
                      >
                        Try it free
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Magnetic>
                  </div>
                  <Stagger className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {CTA_TRUST.map(({ icon: Icon, t }) => (
                      <motion.span key={t} variants={staggerItem} className="flex items-center gap-2 text-[13px] text-white/65">
                        <Icon className="h-3.5 w-3.5" />
                        {t}
                      </motion.span>
                    ))}
                  </Stagger>
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
