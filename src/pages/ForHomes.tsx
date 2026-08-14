import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/landing/CTASection';
import { SEO } from '@/components/shared/SEO';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Eye, Palette, Wallet, ShieldCheck, Heart, Lightbulb, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState } from 'react';

const FOR_HOMES_SCHEMA = [
  {
    '@type': 'Organization',
    '@id': 'https://thinkdecor.app/#organization',
    name: 'ThinkDecor',
    url: 'https://thinkdecor.app/',
    logo: 'https://thinkdecor.app/logo.png',
    description:
      'ThinkDecor is an AI-powered interior design platform that helps users redesign rooms instantly by uploading photos.',
    sameAs: [
      'https://www.instagram.com/thinkdecor',
      'https://www.pinterest.com/thinkdecor',
      'https://www.tiktok.com/@thinkdecor',
    ],
  },
  {
    '@type': 'WebSite',
    '@id': 'https://thinkdecor.app/#website',
    url: 'https://thinkdecor.app/',
    name: 'ThinkDecor AI Interior Design Tool',
    publisher: { '@id': 'https://thinkdecor.app/#organization' },
  },
  {
    '@type': 'SoftwareApplication',
    '@id': 'https://thinkdecor.app/#product',
    name: 'ThinkDecor AI Room Designer',
    url: 'https://thinkdecor.app/',
    applicationCategory: 'DesignApplication',
    applicationSubCategory: 'Interior Design Software',
    operatingSystem: 'Web',
    browserRequirements: 'Requires modern web browser',
    description:
      'Upload a photo of your room and get instant AI-powered interior design ideas, layouts, and styles for your home.',
    provider: { '@id': 'https://thinkdecor.app/#organization' },
    offers: {
      '@type': 'Offer',
      url: 'https://thinkdecor.app/pricing',
      price: '0',
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
    },
  },
  {
    '@type': 'FAQPage',
    '@id': 'https://thinkdecor.app/#faq',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does AI interior design work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ThinkDecor uses artificial intelligence to analyse your uploaded room photo and generate design ideas, layouts, and styles instantly.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is ThinkDecor free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ThinkDecor offers a free version with basic features. Premium features may require a subscription.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I redesign any room?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can upload photos of living rooms, bedrooms, kitchens, and other spaces to generate AI-powered design suggestions.',
        },
      },
      {
        '@type': 'Question',
        name: 'What interior styles are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ThinkDecor supports modern, minimalist, Scandinavian, Japandi, and other popular interior design styles.',
        },
      },
    ],
  },
];

const struggles = [
  { text: "Visualising how products will look together", icon: Eye },
  { text: "Knowing if something will feel right in their own space", icon: Home },
  { text: "Deciding whether the cost is justified", icon: Wallet },
  { text: "Feeling confident before committing", icon: ShieldCheck },
];

const benefits = [
  { icon: Eye, label: "See decor ideas placed in your own space", detail: "Upload a photo of your room and instantly see how different products look in your actual environment." },
  { icon: Palette, label: "Explore different styles without pressure", detail: "Try dozens of combinations of colours, textures, and furniture without spending a rupee." },
  { icon: Lightbulb, label: "Understand how choices change the feel", detail: "See how a warm wood floor vs cool marble completely transforms your room's mood." },
  { icon: Heart, label: "Compare options calmly before deciding", detail: "Save your favourite combinations and compare them side by side at your own pace." },
];

const principles = [
  { text: "No commitment to purchase", icon: ShieldCheck },
  { text: "No pressure to overspend", icon: Wallet },
  { text: "No assumptions about your taste", icon: Heart },
];

const howItWorks = [
  { step: '01', title: 'Upload your room photo', desc: 'Take a photo of any room — living room, bedroom, kitchen, or more — and upload it in seconds.' },
  { step: '02', title: 'Choose a style or let AI suggest one', desc: 'Pick from modern, minimalist, Scandinavian, Japandi, and other popular styles, or let our AI recommend based on your space.' },
  { step: '03', title: 'Visualise furniture, paint & décor instantly', desc: 'See AI-generated redesigns with real furniture, paint colours, flooring, and home accessories placed in your actual room.' },
  { step: '04', title: 'Save, compare, and decide with confidence', desc: 'Compare multiple designs side by side and move forward only when things feel right — no pressure, no commitment.' },
];

const whyChoose = [
  { icon: Sparkles, title: 'AI-powered, not template-based', desc: 'Every design is generated for your specific room, not a generic template.' },
  { icon: Eye, title: 'See before you buy', desc: 'Visualise furniture, paint, and home décor in your actual space before spending anything.' },
  { icon: ShieldCheck, title: 'Free to start', desc: 'Try the AI room design tool for free — no credit card required.' },
  { icon: CheckCircle2, title: 'Works for every room', desc: 'Living rooms, bedrooms, kitchens, apartments — any space, any style.' },
];

const faqs = [
  {
    q: 'How does AI interior design work?',
    a: 'ThinkDecor uses artificial intelligence to analyse your uploaded room photo and generate design ideas, furniture layouts, and style suggestions instantly. No manual editing required.',
  },
  {
    q: 'Is ThinkDecor free to use?',
    a: 'Yes — ThinkDecor offers a free version with core features. Premium features including unlimited designs and advanced styles may require a subscription.',
  },
  {
    q: 'Can I redesign any room?',
    a: 'Absolutely. You can upload photos of living rooms, bedrooms, kitchens, bathrooms, and other spaces to get AI-powered design suggestions tailored to your room.',
  },
  {
    q: 'What interior styles are supported?',
    a: 'ThinkDecor supports modern, minimalist, Scandinavian, Japandi, bohemian, mid-century modern, farmhouse, and many other popular interior design styles.',
  },
  {
    q: 'Do I need design experience to use ThinkDecor?',
    a: 'No experience needed. Simply upload a photo of your room and ThinkDecor\'s AI handles the rest — giving you instant, professional-quality redesign ideas.',
  },
];

export default function ForHomes() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: struggleRef, isVisible: struggleVisible } = useScrollAnimation();
  const { ref: benefitRef, isVisible: benefitVisible } = useScrollAnimation();
  const { ref: howRef, isVisible: howVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();
  const { ref: principleRef, isVisible: principleVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Interior Design & Room Design App | Redesign Your Home Online | ThinkDecor"
        description="Upload your room photo and instantly visualize furniture, paint, flooring, and décor with AI. Use ThinkDecor's AI interior design tool to redesign your home online for free."
        canonical="https://thinkdecor.app/for-homes"
        schema={FOR_HOMES_SCHEMA}
      />
      <Navbar />
      <main className="pt-24">

        {/* Hero */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={heroRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                  <Home className="h-4 w-4" />
                  For Homes
                </div>
                {/* SEO H1 */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Design Your Room with{' '}
                  <span className="text-gradient-primary">AI in Seconds</span>
                </h1>
                {/* SEO H2 #1 */}
                <h2 className="text-lg text-muted-foreground max-w-xl mb-8">
                  Upload Your Room Photo &amp; Instantly Visualize Design Ideas — furniture, paint, flooring, and décor, all in your actual space.
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                  <Link to="/demo">
                    <Button variant="hero" size="xl" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                      Try Our Free AI Room Designer
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden sm:overflow-visible">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop"
                    alt="Beautiful modern living room redesigned with AI interior design tool"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
                <div className="absolute bottom-3 left-3 sm:-bottom-4 sm:-left-4 glass rounded-xl p-2 sm:p-3 shadow-lg border border-border/30 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground">AI-Powered Interior Design Tool</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why decor decisions feel hard */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={struggleRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              struggleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                {/* SEO H2 #2 */}
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  AI-Powered Interior Design Tool{' '}
                  <span className="text-gradient-primary">for Every Space</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  When decorating a home, most people struggle with the same things:
                </p>
                <div className="space-y-4">
                  {struggles.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 group ${
                          struggleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                        }`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-destructive/20 transition-colors">
                          <Icon className="h-5 w-5 text-destructive/70" />
                        </div>
                        <p className="text-foreground font-medium">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted-foreground mt-6 italic text-sm">
                  These doubts are normal — and exactly what ThinkDecor's AI home design tool is built to resolve.
                </p>
              </div>
              <div className="relative hidden lg:block">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
                    alt="Person choosing home décor with AI room design app"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>
            </div>
          </div>
        </section>

        {/* Visualize Furniture, Paint & Décor Before You Buy */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

          <div
            ref={benefitRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              benefitVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              {/* SEO H2 #3 */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Visualize Furniture, Paint &amp; Home Décor{' '}
                <span className="text-gradient-primary">Before You Buy</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                ThinkDecor lets you redesign your home online in seconds — no guesswork, no commitment, no pressure.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-3">
                {benefits.map((b, index) => {
                  const Icon = b.icon;
                  const isActive = activeBenefit === index;
                  return (
                    <button
                      key={b.label}
                      onClick={() => setActiveBenefit(index)}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-500 ${
                        isActive
                          ? 'bg-primary/[0.08] border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.08)]'
                          : 'bg-card/30 border-border/30 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {b.label}
                          </p>
                          <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <p className="text-sm text-muted-foreground">{b.detail}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl sticky top-32">
                  <img
                    src={[
                      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                    ][activeBenefit]}
                    alt={benefits[activeBenefit].label}
                    className="w-full aspect-[4/3] object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass rounded-lg px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{benefits[activeBenefit].label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xl font-bold text-gradient-primary mt-12">
              Redesign your home online in seconds — free to try.
            </p>
          </div>
        </section>

        {/* How ThinkDecor Works */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={howRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              {/* SEO H2 #4 */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How <span className="text-gradient-primary">ThinkDecor</span> Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From photo upload to AI-generated room redesign in four simple steps.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, i) => (
                <div
                  key={step.step}
                  className={`p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 ${
                    howVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className="text-3xl font-black text-primary/20 mb-3">{step.step}</div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Homeowners Choose ThinkDecor */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-20" />

          <div
            ref={whyRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              {/* SEO H2 #5 */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why Homeowners Choose{' '}
                <span className="text-gradient-primary">ThinkDecor</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The AI interior design tool built for real homes, not showrooms.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {whyChoose.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`flex gap-5 p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 ${
                      whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real homes, real budgets */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />

          <div
            ref={principleRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              principleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
                    alt="Cozy home interior redesigned with AI home design tool"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Designed for <span className="text-gradient-primary">real homes</span> and real budgets
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether you live in a rented apartment or your own home, ThinkDecor adapts to your situation.
                </p>
                <div className="space-y-4">
                  {principles.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.text}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 transition-all duration-500 ${
                          principleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                        }`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-foreground font-medium">{p.text}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted-foreground mt-6 italic text-sm">
                  Your preferences guide the experience, not trends or templates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/20" />

          <div
            ref={faqRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl transition-all duration-700 ${
              faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-12">
              {/* SEO H2 #6 */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-gradient-primary">Questions</span>
              </h2>
              <p className="text-muted-foreground">Everything you need to know about our AI interior design tool.</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/50 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-primary/5 transition-colors"
                  >
                    <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? 'max-h-48' : 'max-h-0'
                    }`}
                  >
                    <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-40" />

          <div
            ref={ctaRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl text-center transition-all duration-700 ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* SEO H2 #7 */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Try Our Free{' '}
              <span className="text-gradient-primary">AI Room Designer</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Upload your room photo and visualize design ideas instantly. No design experience needed.
            </p>
            <p className="text-muted-foreground mb-10">
              Free to start. No credit card required.
            </p>
            <Link to="/demo">
              <Button variant="hero" size="xl" className="text-base sm:text-lg px-6 sm:px-10 w-full sm:w-auto">
                Try the Free AI Room Designer
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              See décor ideas in your own space before you decide.
            </p>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
