import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowRight, Building2, Eye, ShoppingCart, TrendingUp,
  Sparkles, Ruler, Scan, Layers, BookOpen, Bot, Wand2, Percent,
  Upload, Cpu, ImagePlus, Lightbulb, MonitorPlay, BadgeCheck,
  Armchair, Paintbrush, Home, LayoutGrid, Grid3X3, Quote,
  CalendarCheck, PhoneCall, Send, Store, MessagesSquare, FileImage, TrendingDown,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { ManthaShowcase } from '@/components/brands/ManthaShowcase';
import { StoriesCarousel } from '@/components/brands/StoriesCarousel';
import { Room3DShowcase } from '@/components/brands/Room3DShowcase';
import { TiltCard } from '@/components/brands/TiltCard';
import { ScrollProgress } from '@/components/brands/ScrollProgress';
import { CursorGlow } from '@/components/brands/CursorGlow';
import { ConversionGapExplorer } from '@/components/brands/ConversionGapExplorer';
import { SpatialBackground } from '@/components/premium/SpatialBackground';
import { FloorPlanStage } from '@/components/premium/FloorPlanStage';
import { Reveal, Stagger, staggerItem, RevealWords, Magnetic, Counter } from '@/components/premium/Motion';

/* ------------------------------------------------------------------ */
/* Content (from Think Decor B2B doc)                                  */
/* ------------------------------------------------------------------ */

const trustChips = [
  { icon: Armchair, label: 'Furniture Retailers' },
  { icon: Paintbrush, label: 'Paint Manufacturers' },
  { icon: LayoutGrid, label: 'Flooring Brands' },
  { icon: Home, label: 'Wallpaper Companies' },
  { icon: Grid3X3, label: 'Tile Manufacturers' },
  { icon: Store, label: 'Home Improvement Retailers' },
  { icon: ShoppingCart, label: 'Enterprise eCommerce' },
  { icon: Sparkles, label: 'Home Décor Brands' },
];

const outcomeChips = [
  'Higher online conversions', 'Fewer product returns', 'Deeper customer engagement',
  'Faster purchase decisions', 'Zero commission on direct sales', 'White-label ready',
  'AR-powered shopping', 'Powered by Mantha AI',
];

const features = [
  { icon: Ruler, title: 'Smart AI Measurement & Quantities', text: 'AI calculates room dimensions and estimates the quantities customers actually need.' },
  { icon: Scan, title: 'AR Visualization', text: 'Let customers place products in their real space with augmented reality.' },
  { icon: Layers, title: 'Multi-Brand Marketplace', text: 'Showcase your products alongside complementary brands — on your terms.' },
  { icon: BookOpen, title: 'Digital Brand Catalogue', text: 'Turn your existing product images into an interactive, explorable catalogue.' },
  { icon: Bot, title: 'Powered by Mantha AI', text: 'Our AI design companion guides customers to the right products for their space.' },
  { icon: Wand2, title: 'AI Product Recommendations', text: 'Recommend products that match each customer’s room, style, and budget.' },
];

const steps = [
  { icon: Upload, title: 'Upload Your Product Catalogue', text: 'Share your existing product images and data — no 3D models required.', image: '/assets/samples/7.jpg' },
  { icon: Cpu, title: 'AI Processes Products', text: 'ThinkDecor’s engine prepares every product for real-time visualization.', image: '/assets/samples/8.jpg' },
  { icon: ImagePlus, title: 'Customer Uploads a Room Photo', text: 'Shoppers photograph their own room right on your website.', image: '/assets/samples/empty_room.png' },
  { icon: Lightbulb, title: 'AI Recommends Products', text: 'Mantha AI suggests the best-fit products from your catalogue.', image: '/assets/samples/9.jpg' },
  { icon: MonitorPlay, title: 'Visualize Products in Real Time', text: 'Customers see your products rendered in their actual space, instantly.', image: '/assets/samples/styled_room.png' },
  { icon: BadgeCheck, title: 'Customer Purchases with Confidence', text: 'Doubt is replaced with visual proof — conversions go up, returns go down.', image: '/assets/samples/styled_room.png' },
];

const industries = [
  {
    icon: Armchair, name: 'Furniture Retailers', cta: 'Explore Furniture Solutions', image: '/assets/samples/1.jpg',
    text: 'Enable customers to visualize furniture in their own spaces before purchase. Increase buying confidence, improve conversions, and reduce product returns.',
  },
  {
    icon: Paintbrush, name: 'Paint Manufacturers', cta: 'Explore Paint Solutions', image: '/assets/samples/3.jpg',
    text: 'Allow customers to preview paint colors on walls instantly using AI. Simplify color selection, accelerate purchase decisions, and boost online sales.',
  },
  {
    icon: LayoutGrid, name: 'Flooring Brands', cta: 'Explore Flooring Solutions', image: '/assets/samples/5.jpg',
    text: 'Allow customers to visualize flooring options in real rooms, compare styles, and make faster purchasing decisions with greater confidence.',
  },
  {
    icon: Home, name: 'Wallpaper Companies', cta: 'Explore Wallpaper Solutions', image: '/assets/samples/4.jpg',
    text: 'Showcase wallpaper designs in customers’ own spaces, helping them imagine the final look and choose products with confidence.',
  },
  {
    icon: Grid3X3, name: 'Tile Manufacturers', cta: 'Explore Tile Solutions', image: '/assets/samples/6.jpg',
    text: 'Help customers preview tile patterns, textures, and finishes in real environments, improving product selection and reducing purchase uncertainty.',
  },
];

const faqs = [
  {
    q: 'How quickly can ThinkDecor be implemented?',
    a: 'ThinkDecor is designed for rapid deployment. Most businesses can go live within 5–7 business days, depending on the project scope and integration requirements. Our team supports onboarding, product catalog setup, and technical integration to ensure a seamless launch.',
  },
  {
    q: 'Do we need 3D models to use ThinkDecor?',
    a: 'No. ThinkDecor’s AI-powered visualization platform is designed to work without requiring expensive 3D models for every product. Businesses can quickly showcase furniture, paint, flooring, wallpaper, and home décor products using AI-driven visualization, significantly reducing implementation time and costs.',
  },
  {
    q: 'Can ThinkDecor integrate with our existing eCommerce platform?',
    a: 'Yes. ThinkDecor can integrate with leading eCommerce platforms and enterprise systems, including Shopify, Magento, WooCommerce, custom websites, and APIs. This enables businesses to offer AI-powered product visualization without disrupting their existing digital infrastructure.',
  },
  {
    q: 'Which industries can benefit from ThinkDecor?',
    a: 'Furniture Retailers & Manufacturers, Paint & Coating Brands, Flooring & Tile Companies, Wallpaper & Home Décor Brands, Home Improvement Retailers, and Enterprise eCommerce Businesses.',
  },
  {
    q: 'Is ThinkDecor available as a white-label solution?',
    a: 'Yes. ThinkDecor offers white-label deployment that allows businesses to deliver AI-powered product visualization under their own brand. This helps create a seamless customer experience while maintaining complete brand identity across websites and mobile applications.',
  },
  {
    q: 'How does ThinkDecor help increase sales and reduce product returns?',
    a: 'ThinkDecor enables customers to visualize products in their own spaces before making a purchase. By improving purchase confidence and reducing uncertainty, businesses can increase online conversion rates, reduce product return rates, improve customer engagement, shorten purchase decision cycles, and enhance the overall digital shopping experience.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ForBrands() {
  const { ref: featureRef, isVisible: featureVisible } = useScrollAnimation();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollAnimation();
  const { ref: industryRef, isVisible: industryVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const [formLoading, setFormLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  /* How-It-Works: auto-advance the story, pause while hovered */
  const stepsPaused = useRef(false);
  useEffect(() => {
    if (!stepsVisible) return;
    const id = setInterval(() => {
      if (!stepsPaused.current) setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(id);
  }, [stepsVisible]);

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.querySelector('#lead-name') as HTMLInputElement).value.trim();
    const email = (form.querySelector('#lead-email') as HTMLInputElement).value.trim();
    const company = (form.querySelector('#lead-company') as HTMLInputElement).value.trim();
    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('demo_requests' as never)
        .insert([{ name, email, company, source: 'b2b-landing' }] as never);
      if (error) throw error;
      // Best-effort email notification; the lead is already stored.
      supabase.functions
        .invoke('notify-lead', { body: { name, email, company, source: 'b2b-landing' } })
        .catch((e) => console.warn('notify-lead email skipped:', e));
      toast.success("Request received! Our team will reach out within 24 hours.");
      form.reset();
    } catch (err) {
      console.error('Lead submit failed:', err);
      toast.error('Something went wrong. Please email us at info@thinkdecor.app');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Product Visualization Platform for Furniture & Retail Brands | ThinkDecor"
        description="AI-powered product visualization software for furniture, paint, flooring, and home improvement brands to increase online conversions and reduce product returns."
        canonical="https://thinkdecor.app/"
        schema={faqSchema}
      />
      <SpatialBackground />
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main className="relative z-10 pt-24">

        {/* ============ S1 · HERO ============ */}
        <section className="relative pt-8 pb-24 lg:pt-16 lg:pb-32">
          <div className="container mx-auto px-6 sm:px-8 max-w-[1240px]">
            {/* eyebrow */}
            <Reveal className="flex justify-center">
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-foreground/[0.12] bg-foreground/[0.03] backdrop-blur-xl text-[11px] font-medium tracking-[0.16em] uppercase text-foreground/65">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                AI Floor Planning Platform
              </span>
            </Reveal>

            {/* headline */}
            <h1 className="mt-9 text-center font-bold tracking-[-0.03em] leading-[0.94] text-[clamp(2.6rem,7.4vw,6rem)]">
              <RevealWords text="Design your room" className="block text-foreground" delay={0.12} />
              <RevealWords
                text="before building it."
                className="block bg-clip-text text-transparent bg-[linear-gradient(100deg,hsl(160_84%_55%),hsl(165_80%_42%)_55%,hsl(168_100%_26%))]"
                delay={0.3}
              />
            </h1>

            <Reveal delay={0.62} className="mt-8">
              <p className="mx-auto max-w-[46ch] text-center text-[clamp(1rem,1.35vw,1.185rem)] leading-relaxed text-foreground/60 font-light">
                Upload a floor plan and watch AI detect every wall, dimension and room —
                then turn it into a photoreal interior your customers can shop.
              </p>
            </Reveal>

            <Reveal delay={0.78} className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnetic>
                <a
                  href="#lead-form"
                  className="group relative inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground shadow-[0_14px_34px_-10px_hsl(168_100%_17%/0.45)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.22),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative">Book a Demo</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>
              <Magnetic strength={0.22}>
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2.5 rounded-full border border-foreground/[0.14] bg-foreground/[0.03] px-8 py-4 text-[15px] font-medium text-foreground/85 backdrop-blur-xl transition-all duration-300 hover:border-primary/45 hover:bg-foreground/[0.05] hover:text-foreground"
                >
                  See AI in Action
                </Link>
              </Magnetic>
            </Reveal>

            {/* the stage */}
            <Reveal delay={0.4} y={44} blur={18} className="mt-16 lg:mt-20">
              <FloorPlanStage />
            </Reveal>

            {/* micro trust */}
            <Stagger className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {['Live in 5–7 days', 'No 3D models needed', 'White-label ready', 'Zero commission'].map((t) => (
                <motion.span key={t} variants={staggerItem} className="flex items-center gap-2 text-[13px] text-foreground/55">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  {t}
                </motion.span>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ============ S2 · TRUST + LIVE METRICS ============ */}
        <section className="relative py-20 lg:py-24 border-y border-foreground/[0.07]">
          <div className="container mx-auto px-6 sm:px-8 max-w-[1240px]">
            <Reveal className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/45">
                Built for every home &amp; living brand
              </p>
            </Reveal>

            {/* metrics */}
            <Stagger className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-foreground/[0.09] bg-foreground/[0.025]">
              {[
                { v: 42, suffix: '%', d: 0, label: 'Higher conversion', sub: 'when shoppers can see it' },
                { v: 31, suffix: '%', d: 0, label: 'Fewer returns', sub: 'fewer "looked different" refunds' },
                { v: 5, suffix: '–7 days', d: 0, label: 'Time to live', sub: 'catalogue to storefront' },
                { v: 99.2, suffix: '%', d: 1, label: 'Detection accuracy', sub: 'walls, dimensions, rooms' },
              ].map((m) => (
                <motion.div
                  key={m.label}
                  variants={staggerItem}
                  className="group relative bg-white/70 px-7 py-9 backdrop-blur-xl transition-colors duration-500 hover:bg-primary/[0.05]"
                >
                  <div className="text-[clamp(2rem,3.4vw,2.75rem)] font-bold tracking-tight text-foreground">
                    <Counter to={m.v} suffix={m.suffix} decimals={m.d} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground/75">{m.label}</p>
                  <p className="mt-1 text-xs text-foreground/45">{m.sub}</p>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-primary to-transparent transition-all duration-700 group-hover:w-full" />
                </motion.div>
              ))}
            </Stagger>

            {/* industry chips marquee */}
            <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="animate-marquee-left gap-3 pr-3">
                {[...trustChips, ...trustChips].map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={`${c.label}-${i}`}
                      className="group flex items-center gap-2.5 whitespace-nowrap rounded-full border border-foreground/[0.09] bg-foreground/[0.025] px-5 py-2.5 backdrop-blur-xl transition-all duration-500 hover:border-primary/35 hover:bg-primary/[0.06]"
                    >
                      <Icon className="h-3.5 w-3.5 text-primary/70 transition-colors group-hover:text-primary" />
                      <span className="text-[13px] font-medium text-foreground/65 transition-colors group-hover:text-foreground/90">{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============ S3 · THE CONVERSION GAP (interactive) ============ */}
        <ConversionGapExplorer />

        {/* ============ S4 · SOLUTION / PLATFORM FEATURES ============ */}
        <section id="solution" className="py-20 lg:py-28 relative overflow-hidden scroll-mt-16">
          <div className="absolute inset-0 bg-card/40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/8 blur-[160px]" />
          <div
            ref={featureRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
              featureVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                <Sparkles className="h-4 w-4" />
                The ThinkDecor Solution
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Transform Product Discovery with{' '}
                <span className="text-gradient-primary">AI-Powered Visualization</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enterprise capabilities that turn your product catalogue into an interactive buying experience.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={`group relative p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 hover:[transform:perspective(900px)_rotateX(3deg)_rotateY(-2deg)_translateY(-8px)] hover:shadow-[0_15px_45px_-12px_hsl(var(--primary)/0.3)] transition-all duration-500 overflow-hidden ${
                      featureVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.97]'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
                    <span className="absolute top-5 right-6 font-mono text-xs text-muted-foreground/30 group-hover:text-primary/70 transition-colors duration-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-glow transition-all duration-300">
                      <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary via-accent to-transparent transition-all duration-500" />
                  </div>
                );
              })}
            </div>

            {/* Zero commission banner card */}
            <div
              className={`mt-5 relative rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 justify-between overflow-hidden transition-all duration-700 delay-500 ${
                featureVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-glow opacity-40" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 pulse-glow">
                  <Percent className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Zero commission on direct sales</h3>
                  <p className="text-sm text-muted-foreground">Sell through your own channels and keep 100% of your revenue.</p>
                </div>
              </div>
              <Link to="/demo" className="relative">
                <Button variant="hero" size="lg">
                  See AI in Action
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ S4b · INTERACTIVE 3D SHOWCASE ============ */}
        <Room3DShowcase />

        {/* ============ S5 · HOW IT WORKS (scroll story) ============ */}
        <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden scroll-mt-16">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[130px]" />
            <div
              ref={stepsRef}
              className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
                stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                  <Cpu className="h-4 w-4" />
                  Brand Onboarding
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  How It Works — From Catalogue to{' '}
                  <span className="text-gradient-primary">Confident Purchase</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto flex items-center justify-center gap-2">
                  Watch the story unfold — or click any step to jump in
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-primary inline-block"
                  />
                </p>
              </div>

              <div
                className="grid lg:grid-cols-2 gap-10 items-center"
                onMouseEnter={() => { stepsPaused.current = true; }}
                onMouseLeave={() => { stepsPaused.current = false; }}
              >
                {/* Steps list with progress rail */}
                <div className="relative space-y-1.5">
                  <div className="absolute left-[22px] top-6 bottom-6 w-px bg-border/40 hidden sm:block overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-b from-primary to-accent transition-all duration-700 ease-out"
                      style={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                  {steps.map((st, i) => {
                    const Icon = st.icon;
                    const isActive = activeStep === i;
                    const isDone = i < activeStep;
                    return (
                      <button
                        key={st.title}
                        onClick={() => setActiveStep(i)}
                        className={`relative w-full text-left flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-500 ${
                          isActive
                            ? 'bg-primary/[0.08] border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.1)]'
                            : 'bg-transparent border-transparent hover:bg-card/40'
                        }`}
                      >
                        <div className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isActive
                            ? 'bg-primary text-primary-foreground glow-soft scale-110'
                            : isDone
                              ? 'bg-primary/15 text-primary border border-primary/30'
                              : 'bg-card border border-border/60 text-muted-foreground'
                        }`}>
                          {isActive && <span className="absolute inset-0 rounded-xl bg-primary/40 animate-ping opacity-20" />}
                          {isDone ? <BadgeCheck className="h-5 w-5 relative" /> : <Icon className="h-5 w-5 relative" />}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono transition-colors duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <p className={`font-semibold transition-colors duration-300 ${isActive ? 'text-foreground' : isDone ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                              {st.title}
                            </p>
                          </div>
                          <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <p className="text-sm text-muted-foreground">{st.text}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Visual: storefront frame with 3D tilt */}
                <div className="relative">
                  <TiltCard max={5}>
                  <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl bg-card">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-card/90">
                      <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
                      <div className="ml-3 flex-1 max-w-[260px] px-3 py-1 rounded-md bg-background/60 border border-border/40 text-[11px] text-muted-foreground truncate">
                        yourstore.com — powered by ThinkDecor
                      </div>
                      <span className="ml-auto flex items-center gap-1.5 text-[10px] text-success font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {steps.map((st, i) => (
                        <img
                          key={i}
                          src={st.image}
                          alt={st.title}
                          loading="lazy"
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1200ms] ease-out ${
                            activeStep === i ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                          }`}
                        />
                      ))}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                      {activeStep === 1 && (
                        <div className="absolute left-0 right-0 h-0.5 bg-primary/80 shadow-glow" style={{ animation: 'scan 3s ease-in-out infinite' }} />
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="glass rounded-lg px-4 py-3 flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            Step {activeStep + 1}: {steps[activeStep].title}
                          </p>
                          <div className="flex gap-1.5">
                            {steps.map((_, i) => (
                              <span
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  activeStep === i ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </TiltCard>
                  <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ S6 · INDUSTRIES (flip cards) ============ */}
        <section id="industries" className="py-20 lg:py-28 relative overflow-hidden scroll-mt-16">
          <div className="absolute inset-0 bg-card/40" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
          <div className="absolute -top-32 left-0 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[150px]" />
          <div
            ref={industryRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
              industryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                <Layers className="h-4 w-4" />
                Industries We Serve
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                AI Visualization Solutions for{' '}
                <span className="text-gradient-primary">Every Industry</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hover a card to see how ThinkDecor fits your category.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <div
                    key={ind.name}
                    className={`group h-80 [perspective:1200px] outline-none transition-all duration-700 ${
                      industryVisible ? 'opacity-100 translate-y-0 rotate-0' : 'opacity-0 translate-y-12 rotate-1'
                    } ${i === 4 ? 'sm:col-span-2 lg:col-span-1 sm:max-w-sm sm:mx-auto sm:w-full lg:max-w-none' : ''}`}
                    style={{ transitionDelay: `${i * 120}ms` }}
                  >
                    <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-border/40 [backface-visibility:hidden]">
                        <img src={ind.image} alt={ind.name} loading="lazy" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/10" />
                        <span className="absolute top-4 right-5 font-mono text-xs text-foreground/50">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="w-11 h-11 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center mb-3 shadow-glow">
                            <Icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground">{ind.name}</h3>
                          <p className="text-xs text-primary/90 font-medium mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                            Hover to explore
                            <ArrowRight className="h-3 w-3 animate-pulse" />
                          </p>
                        </div>
                        <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-60" />
                      </div>
                      {/* Back */}
                      <div className="absolute inset-0 rounded-2xl border border-primary/30 bg-card overflow-hidden flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <img src={ind.image} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-[0.08]" />
                        <div className="absolute -top-14 -right-14 w-36 h-36 rounded-full bg-primary/10 blur-3xl" />
                        <div className="relative p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-bold text-foreground">{ind.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{ind.text}</p>
                        </div>
                        <div className="relative p-6 pt-0">
                          <a href="#lead-form">
                            <Button variant="hero-outline" size="sm" className="w-full group/btn">
                              {ind.cta}
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ S6b · MANTHA AI SHOWCASE ============ */}
        <ManthaShowcase />

        {/* ============ S7 · CUSTOMER SUCCESS STORIES (carousel) ============ */}
        <StoriesCarousel />

        {/* ============ S8 · FAQs ============ */}
        <section id="faqs" className="py-20 lg:py-28 relative overflow-hidden scroll-mt-16">
          <div className="absolute inset-0 bg-card/40" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[130px]" />
          <div
            ref={faqRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl transition-all duration-700 ${
              faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                <MessagesSquare className="h-4 w-4" />
                Good Questions
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-gradient-primary">Questions</span>
              </h2>
              <p className="text-muted-foreground">
                Everything brands ask before adding AI visualization to their store.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className={`group rounded-xl border border-border/50 bg-card/50 px-5 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/[0.04] data-[state=open]:shadow-[0_0_30px_hsl(var(--primary)/0.08)] hover:border-border transition-all duration-300 ${
                    faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5 gap-4">
                    <span className="flex items-center gap-4">
                      <span className="font-mono text-xs text-primary/60 group-data-[state=open]:text-primary transition-colors">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 pl-10 leading-relaxed">
                    {f.a}
                    {i === 0 && (
                      <a href="#lead-form" className="block mt-3 text-primary font-medium hover:underline">
                        Talk to our experts about your implementation timeline →
                      </a>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 p-6 rounded-2xl bg-card/50 border border-border/40">
              <p className="text-sm text-muted-foreground">Still have questions?</p>
              <div className="flex gap-3">
                <a href="mailto:info@thinkdecor.app">
                  <Button variant="ghost" size="sm">Email us</Button>
                </a>
                <a href="#lead-form">
                  <Button variant="hero-outline" size="sm">Book a call</Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ S9 · FINAL CTA + BOOK A DEMO ============ */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[200px]" />
          <div
            ref={ctaRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative rounded-3xl border border-primary/25 bg-gradient-card p-8 sm:p-14 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-glow opacity-50" />
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative grid lg:grid-cols-2 gap-12 items-center">
                {/* Copy */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                    <CalendarCheck className="h-4 w-4" />
                    Ready when you are
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                    See ThinkDecor working on{' '}
                    <span className="text-gradient-primary">your products</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                    A 30-minute product walkthrough — your catalogue, your customers' journey,
                    and your questions answered.
                  </p>
                  <ul className="space-y-3 mb-8 text-left max-w-sm mx-auto lg:mx-0">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <BadgeCheck className="h-4 w-4 text-success flex-shrink-0" /> Live on your store in 5–7 business days
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <BadgeCheck className="h-4 w-4 text-success flex-shrink-0" /> Works with Shopify, Magento, WooCommerce & APIs
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <BadgeCheck className="h-4 w-4 text-success flex-shrink-0" /> White-label, zero commission on direct sales
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a href="mailto:info@thinkdecor.app">
                      <Button variant="hero-outline" size="lg" className="w-full sm:w-auto">
                        <PhoneCall className="h-5 w-5" />
                        Talk to Sales
                      </Button>
                    </a>
                    <Link to="/demo">
                      <Button variant="ghost" size="lg" className="w-full sm:w-auto group">
                        Try the Live Demo
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Lead form */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/25 via-primary/5 to-transparent blur-xl opacity-60" />
                  <TiltCard max={5}>
                  <form
                    id="lead-form"
                    onSubmit={handleLeadSubmit}
                    className="relative rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-6 sm:p-8 space-y-4 shadow-2xl scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Schedule a Product Walkthrough</h3>
                        <p className="text-xs text-muted-foreground">Takes under a minute</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-name" className="text-sm text-muted-foreground">Name</Label>
                      <Input id="lead-name" placeholder="Your name" required className="bg-background/50 border-border/50 focus:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-email" className="text-sm text-muted-foreground">Work Email</Label>
                      <Input id="lead-email" type="email" placeholder="you@company.com" required className="bg-background/50 border-border/50 focus:border-primary/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-company" className="text-sm text-muted-foreground">Company</Label>
                      <Input id="lead-company" placeholder="Company name" required className="bg-background/50 border-border/50 focus:border-primary/50" />
                    </div>
                    <Button type="submit" variant="hero" size="lg" className="w-full text-base" disabled={formLoading}>
                      {formLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Book a Demo <Send className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">No commitment. We respond within 24 hours.</p>
                  </form>
                  </TiltCard>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
