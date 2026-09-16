import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FileDown, Clock, Smartphone, Gift, Mail,
  Home as HomeIcon, Palette, Compass, Building2, HardHat, Wrench,
  LayoutGrid, Sofa,
} from 'lucide-react';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { motion } from 'framer-motion';
import { Magnetic, Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { Tilt } from '@/components/motion/primitives';
import { FloorPlanStage } from '@/components/premium/FloorPlanStage';
import { FloorPlanRecognition } from '@/components/premium/FloorPlanRecognition';
import { DesignGenerator } from '@/components/premium/DesignGenerator';
import { EarlyBirdStrip } from '@/components/premium/EarlyBirdStrip';
import { Comparison } from '@/components/premium/Comparison';
import { PricingTeaser } from '@/components/premium/PricingTeaser';
import { AboutBlurb } from '@/components/premium/AboutBlurb';
import { Testimonials } from '@/components/premium/Testimonials';
import { CursorAura, ScrollProgress } from '@/components/motion/primitives';
import type { TrustItem } from '@/components/motion/hooks';
import { HeroStage } from '@/components/motion/HeroStage';
import { StyleMarquee } from '@/components/motion/StyleMarquee';
import { ProcessStory } from '@/components/motion/ProcessStory';
import { StyleRing } from '@/components/motion/StyleRing';
import { RoomAnatomy } from '@/components/motion/RoomAnatomy';
import { RoadmapTimeline } from '@/components/motion/RoadmapTimeline';
import { WhoItsFor } from '@/components/motion/WhoItsFor';
import { HangingCta } from '@/components/motion/HangingCta';
import { NewsletterBand } from '@/components/motion/NewsletterBand';
import { FREE_SIGNUP_CREDITS } from '@/lib/generation';
import { TEMPLATES } from '@/lib/templates';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

/* ---------------------------------------------------------------- *
 *  Homepage — a motion-led layout: 3D hero, a pinned "how it works"
 *  story, the style carousel and an interactive Mantha explainer.
 *  Copy matches the product today: photo redesigns are live; room
 *  scanning, measured plans and exports are labelled "coming soon".
 * ---------------------------------------------------------------- */

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);

const HERO_TRUST: TrustItem[] = [
  { icon: Smartphone, t: 'Any phone photo' },
  { icon: Gift, t: `${FREE_SIGNUP_CREDITS} free redesigns` },
  { icon: Clock, t: 'Results in seconds' },
];

const CTA_TRUST: TrustItem[] = [
  { icon: Smartphone, t: 'No hardware needed' },
  { icon: Gift, t: `${FREE_SIGNUP_CREDITS} free redesigns` },
  { icon: FileDown, t: 'Download every design' },
];

const MANTHA_FEATURES = [
  `${TEMPLATES.length} interior styles to start from`,
  'Describe changes in plain words',
  'Regenerate for new variations',
  'Every design saved to your library',
];

const WHO_ITS_FOR = [
  { icon: HomeIcon, t: 'Homeowners', d: 'Plan before you spend', image: '/assets/samples/1.jpg' },
  { icon: Palette, t: 'Interior designers', d: 'Concepts in minutes', image: '/assets/samples/2.jpg' },
  { icon: Compass, t: 'Architects', d: 'Survey-grade plans', image: '/assets/samples/3.jpg' },
  { icon: Building2, t: 'Real estate', d: 'Listings that convert', image: '/assets/samples/4.jpg' },
  { icon: HardHat, t: 'Builders', d: 'Fewer site visits', image: '/assets/samples/5.jpg' },
  { icon: Wrench, t: 'Contractors', d: 'Quote from real data', image: '/assets/samples/6.jpg' },
  { icon: LayoutGrid, t: 'Modular kitchens', d: 'Exact fit, first time', image: '/assets/samples/7.jpg' },
  { icon: Sofa, t: 'Furniture brands', d: 'Sell in the room', image: '/assets/samples/8.jpg' },
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
      <ScrollProgress />
      <CursorAura />
      <Navbar />

      <main className="relative z-10 overflow-clip">

        {/* ============================ HERO ============================ */}
        <HeroStage trust={HERO_TRUST} />

        {/* ================= STYLE MARQUEE ================= */}
        <StyleMarquee />

        {/* ================= HOW IT WORKS — PINNED STORY ================= */}
        <ProcessStory />

        {/* ================= EARLY-BIRD OFFER ================= */}
        <div className="pt-8">
          <EarlyBirdStrip />
        </div>

        {/* ================= DESIGN GENERATOR ================= */}
        <DesignGenerator />

        {/* ================= STYLES IN THE ROUND ================= */}
        <StyleRing />

        {/* ================= MANTHA AI — ROOM ANATOMY ================= */}
        <RoomAnatomy features={MANTHA_FEATURES} />

        {/* ================= COMPARISON ================= */}
        <Comparison />

        {/* ================= PRICING ================= */}
        <PricingTeaser />

        {/* ================= ROADMAP ================= */}
        <RoadmapTimeline />

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

        {/* ================= WHO IT'S FOR ================= */}
        <WhoItsFor personas={WHO_ITS_FOR} />

        {/* ================= ABOUT ================= */}
        <AboutBlurb />

        {/* ================= TESTIMONIALS ================= */}
        <Testimonials />

        {/* ============================ FAQ ============================ */}
        <section id="faq" className="relative scroll-mt-24 overflow-hidden py-16 lg:py-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.035)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,#000,transparent)]" />
          </div>

          <div className="container relative mx-auto max-w-[1100px] px-6 sm:px-8">
            <Reveal className="mx-auto max-w-[640px] text-center">
              <p className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Questions
              </p>
              <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.2rem)] font-bold tracking-[-0.02em] text-foreground">
                Everything worth asking.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal delay={0.05}>
                <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,hsl(168_100%_14%),hsl(168_85%_20%)_60%,hsl(166_70%_27%))] p-7 text-white shadow-[0_30px_70px_-32px_hsl(168_100%_17%/0.55)] lg:sticky lg:top-28">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_100%_at_20%_0%,#000,transparent)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(160_84%_45%)]/25 blur-3xl"
                  />
                  <div
                    aria-hidden
                    className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.25),transparent)] mix-blend-overlay"
                    style={{ animationDelay: '2s' }}
                  />

                  <p className="relative text-[17px] font-bold">Still unsure?</p>
                  <p className="relative mt-1.5 flex items-center gap-1.5 text-[13px] text-white/65">
                    <Clock className="h-3.5 w-3.5 text-mint" /> Replies within a day
                  </p>
                  <Magnetic className="relative mt-5 block w-max">
                    <a
                      href="mailto:info@thinkdecor.app"
                      className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-primary shadow-[0_10px_26px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97]"
                    >
                      <Mail className="h-3.5 w-3.5" /> Ask us anything
                    </a>
                  </Magnetic>
                  <p className="relative mt-3 text-[12.5px] text-white/50">info@thinkdecor.app</p>
                </div>
              </Reveal>

              <Stagger className="space-y-3" gap={0.08}>
                <Accordion type="single" collapsible className="space-y-3">
                  {FAQS.map((f, i) => (
                    <motion.div key={f.q} variants={staggerItem}>
                      <Tilt max={1.5} innerClassName="rounded-[18px]">
                        <AccordionItem
                          value={`q-${i}`}
                          className="group overflow-hidden rounded-[18px] border border-foreground/[0.08] bg-card px-0 shadow-[0_6px_20px_-12px_hsl(168_30%_15%/0.14)] transition-all duration-400 hover:border-primary/30 hover:shadow-[0_16px_36px_-20px_hsl(168_30%_15%/0.25)] data-[state=open]:border-primary/35 data-[state=open]:shadow-[0_16px_36px_-20px_hsl(168_30%_15%/0.3)]"
                        >
                          <AccordionTrigger className="px-6 py-5 text-left text-[15px] font-medium text-foreground hover:no-underline">
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
                      </Tilt>
                    </motion.div>
                  ))}
                </Accordion>
              </Stagger>
            </div>
          </div>
        </section>

        {/* ========================= FINAL CTA ========================= */}
        <HangingCta trust={CTA_TRUST} freeCredits={FREE_SIGNUP_CREDITS} />

        {/* ========================= NEWSLETTER ========================= */}
        <NewsletterBand />

      </main>

      <Footer />
    </div>
  );
}
