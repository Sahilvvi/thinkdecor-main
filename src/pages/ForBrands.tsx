import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Eye, ShoppingCart, TrendingUp, Camera, Globe, Shield, Users, CheckCircle2, Sparkles, Percent, X as XIcon, Heart, MessageCircle, Handshake } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, useEffect } from 'react';

const hesitations = [
  { text: "Can't imagine how a product will look at home", icon: Eye },
  { text: "Feel unsure about scale, colour, or placement", icon: Camera },
  { text: "Compare endlessly without clarity", icon: Users },
  { text: "Delay decisions or abandon purchases", icon: ShoppingCart },
];

const customerBenefits = [
  { icon: Eye, label: "See products placed in real spaces", detail: "Customers upload their room photo and see your products in context. No imagination required." },
  { icon: Users, label: "Understand how items work together", detail: "Show how your furniture, flooring, and decor complement each other in a real environment." },
  { icon: Shield, label: "Feel more confident before purchasing", detail: "Reduce hesitation by replacing guesswork with visual proof that fits their space." },
  { icon: TrendingUp, label: "Decide faster, with less uncertainty", detail: "Shorten the decision cycle from weeks to minutes with instant visualisation." },
];

const catalogueFeatures = [
  { text: "AR-ready digital catalogues", icon: Camera },
  { text: "Visual experiences customers can explore remotely", icon: Globe },
  { text: "Tools that reduce explanation and doubt", icon: Shield },
];

const sellPoints = [
  "Sell through your own website",
  "Maintain your brand identity",
  "Own the customer relationship",
  "Keep 100% of your revenue",
  "No third-party commissions",
];

const idealBrands = [
  { text: "Sell decor, furniture, surfaces, or interiors", icon: ShoppingCart },
  { text: "Want to reduce customer hesitation", icon: Shield },
  { text: "Value clarity over hard selling", icon: Eye },
  { text: "Care about long-term customer trust", icon: Users },
];

const notAbout = [
  { text: "Flashy effects", icon: Sparkles },
  { text: "Overpromising outcomes", icon: TrendingUp },
  { text: "Pushing customers to buy", icon: ShoppingCart },
];

const trustValues = [
  { text: "Creating confidence at the right moment", icon: Heart },
  { text: "Healthier conversions", icon: CheckCircle2 },
  { text: "Fewer doubts, stronger decisions", icon: Shield },
];

export default function ForBrands() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: challengeRef, isVisible: challengeVisible } = useScrollAnimation();
  const { ref: helpRef, isVisible: helpVisible } = useScrollAnimation();
  const { ref: catalogueRef, isVisible: catalogueVisible } = useScrollAnimation();
  const { ref: sellRef, isVisible: sellVisible } = useScrollAnimation();
  const { ref: trustRef, isVisible: trustVisible } = useScrollAnimation();
  const { ref: whoRef, isVisible: whoVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [trustRevealIndex, setTrustRevealIndex] = useState(-1);

  useEffect(() => {
    if (!trustVisible) return;
    setTrustRevealIndex(-1);
    let i = 0;
    const total = notAbout.length + trustValues.length + 1;
    const interval = setInterval(() => {
      setTrustRevealIndex(i);
      i++;
      if (i >= total) clearInterval(interval);
    }, 400);
    return () => clearInterval(interval);
  }, [trustVisible]);

  return (
    <div className="min-h-screen bg-background">
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
                  <Building2 className="h-4 w-4" />
                  For Brands
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Help customers decide with{' '}
                  <span className="text-gradient-primary">confidence before they buy.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Most decor purchases don't fail because of price or quality. They fail because customers 
                  can't visualise the decision clearly.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                  <Link to="/book-demo">
                    <Button variant="hero" size="xl" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                      Partner with Think Decor
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden sm:overflow-visible">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"
                    alt="Modern showroom"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
                <div className="absolute bottom-3 left-3 sm:-bottom-4 sm:-left-4 glass rounded-xl p-3 sm:p-4 shadow-lg border border-border/30 animate-fade-in">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Conversion uplift</p>
                      <p className="text-base sm:text-lg font-bold text-foreground">+40%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The challenge */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={challengeRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              challengeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative hidden lg:block">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop"
                    alt="Customer browsing products"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  The real challenge <span className="text-gradient-primary">brands face</span> today
                </h2>
                <p className="text-muted-foreground mb-8">Customers hesitate when they:</p>
                <div className="space-y-4">
                  {hesitations.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 group ${
                          challengeVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
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
                  This hesitation costs brands time, trust, and conversions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How Think Decor helps - interactive */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

          <div
            ref={helpRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              helpVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How Think Decor supports{' '}
                <span className="text-gradient-primary">better buying decisions</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Think Decor gives brands a way to present products in context, not just in catalogues.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-3">
                {customerBenefits.map((b, index) => {
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
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                    ][activeBenefit]}
                    alt={customerBenefits[activeBenefit].label}
                    className="w-full aspect-[4/3] object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass rounded-lg px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{customerBenefits[activeBenefit].label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalogue */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />

          <div
            ref={catalogueRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              catalogueVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  A catalogue customers{' '}
                  <span className="text-gradient-primary">understand faster</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Think Decor helps you turn your existing products into:
                </p>
                <div className="space-y-4">
                  {catalogueFeatures.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.text}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 ${
                          catalogueVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                        }`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-foreground font-medium">{f.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
                    alt="Digital product catalogue"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>
            </div>
          </div>
        </section>

        {/* Sell directly */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div
            ref={sellRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              sellVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                    alt="Brand selling online"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
                <div className="absolute top-3 right-3 sm:-top-4 sm:-right-4 glass rounded-xl p-2 sm:p-3 shadow-lg border border-border/30">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-success" />
                    <span className="text-sm font-bold text-foreground">100% Revenue</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Sell directly.{' '}
                  <span className="text-gradient-primary">Keep control.</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Think Decor is built to support your business model, not compete with it.
                </p>
                <ul className="space-y-3">
                  {sellPoints.map((p, i) => (
                    <li
                      key={p}
                      className={`flex items-center gap-3 transition-all duration-500 ${
                        sellVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-foreground font-medium">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Built for long-term trust */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />

          <div
            ref={trustRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              trustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                Built for <span className="text-gradient-primary">long-term trust,</span>
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-muted-foreground">
                not short-term hype.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-4xl mx-auto">
              {/* NOT about */}
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-6 font-medium">Think Decor is not about</p>
                <div className="space-y-4">
                  {notAbout.map((item, i) => {
                    const Icon = item.icon;
                    const isRevealed = trustRevealIndex >= i;
                    return (
                      <div
                        key={item.text}
                        className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-500 ${
                          isRevealed
                            ? 'bg-destructive/[0.04] border-destructive/20 opacity-100 translate-x-0'
                            : 'bg-card/20 border-border/20 opacity-0 -translate-x-6'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isRevealed ? 'bg-destructive/10' : 'bg-muted/30'
                        }`}>
                          <XIcon className={`h-5 w-5 transition-colors duration-500 ${isRevealed ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`font-medium transition-colors duration-500 ${isRevealed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* IT'S about */}
              <div>
                <p className="text-sm uppercase tracking-widest text-primary mb-6 font-medium">It's about</p>
                <div className="space-y-4">
                  {trustValues.map((item, i) => {
                    const Icon = item.icon;
                    const revealIdx = notAbout.length + i;
                    const isRevealed = trustRevealIndex >= revealIdx;
                    return (
                      <div
                        key={item.text}
                        className={`flex items-center gap-4 p-5 rounded-xl border transition-all duration-500 ${
                          isRevealed
                            ? 'bg-primary/[0.06] border-primary/25 opacity-100 translate-x-0 shadow-[0_0_30px_hsl(var(--primary)/0.06)]'
                            : 'bg-card/20 border-border/20 opacity-0 translate-x-6'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isRevealed ? 'bg-primary text-primary-foreground' : 'bg-muted/30'
                        }`}>
                          <Icon className={`h-5 w-5 transition-colors duration-500 ${isRevealed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`font-medium transition-colors duration-500 ${isRevealed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who this is for */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-30" />

          <div
            ref={whoRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl text-center transition-all duration-700 ${
              whoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Who this is <span className="text-gradient-primary">for</span>
            </h2>
            <p className="text-muted-foreground mb-10">Think Decor works best for brands that:</p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
              {idealBrands.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.text}
                    className={`flex items-center gap-4 p-5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:shadow-[0_0_25px_hsl(var(--primary)/0.06)] transition-all duration-500 group ${
                      whoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-sm text-foreground font-medium text-left">{b.text}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-muted-foreground italic mb-10">
              If your product depends on how it looks in real spaces, Think Decor fits naturally.
            </p>
          </div>
        </section>

        {/* Start the conversation CTA */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-primary/8 blur-[200px]" />

          <div
            ref={ctaRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl text-center transition-all duration-700 ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
              <MessageCircle className="h-4 w-4" />
              Start the conversation
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Exploring better ways to help{' '}
              <span className="text-gradient-primary">customers decide?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              We'd be happy to talk. Let's discuss how Think Decor fits your products and your customers.
            </p>
            <Link to="/book-demo">
              <Button variant="hero" size="xl" className="text-base sm:text-lg px-6 sm:px-10 w-full sm:w-auto">
                <Handshake className="h-5 w-5" />
                Partner with Think Decor
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
